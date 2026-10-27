/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut as fbSignOut
} from 'firebase/auth';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import firebaseConfig from '../../firebase-applet-config.json';
import { Submission, SurveyRecord } from '../types';

// The exact OAuth scope requested and authorized
export const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets'
];

const SPREADSHEET_ID_KEY = 'deraa_google_spreadsheet_id';
const SPREADSHEET_URL_KEY = 'deraa_google_spreadsheet_url';
const WEBHOOK_URL_KEY = 'deraa_google_sheets_webhook_url';
const PENDING_QUEUE_KEY = 'deraa_sheets_pending_queue';
const LAST_SYNC_KEY = 'deraa_sheets_last_sync_time';

// Initialize Firebase App safely (singleton)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));
provider.setCustomParameters({
  prompt: 'select_account'
});

// In-memory token cache (never stored in localStorage/sessionStorage as mandated)
let cachedAccessToken: string | null = null;
let currentUser: User | null = null;
let isSigningIn = false;

export interface GoogleSheetsSyncStatus {
  isConnected: boolean;
  userEmail: string | null;
  userName: string | null;
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  lastSyncTime: string | null;
  pendingCount: number;
  webhookUrl: string | null;
}

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  message: string;
  spreadsheetUrl?: string;
}

// ----------------- AUTHENTICATION -----------------

export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  // Sync config from backend if available
  fetch('/api/google-sheets/config')
    .then((r) => r.json())
    .then((cfg) => {
      if (cfg?.spreadsheetId && !localStorage.getItem(SPREADSHEET_ID_KEY)) {
        localStorage.setItem(SPREADSHEET_ID_KEY, cfg.spreadsheetId);
        if (cfg.spreadsheetUrl) localStorage.setItem(SPREADSHEET_URL_KEY, cfg.spreadsheetUrl);
        if (cfg.lastSyncTime) localStorage.setItem(LAST_SYNC_KEY, cfg.lastSyncTime);
      }
    })
    .catch(() => {});

  return onAuthStateChanged(auth, async (user: User | null) => {
    currentUser = user;
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (!credential?.accessToken) {
      throw new Error('لم يتم استلام تصريح الدخول من Google');
    }

    cachedAccessToken = credential.accessToken;
    currentUser = result.user;

    // Check if we already have a spreadsheet, otherwise auto-create or connect
    const existingId = getSpreadsheetId();
    if (!existingId) {
      try {
        await createOrInitializeSpreadsheet();
      } catch (sheetErr) {
        console.warn('Could not auto-create spreadsheet on login, will create on sync:', sheetErr);
      }
    }

    // Process any queued submissions from students
    processPendingQueue().catch((err) => console.warn('Queue flush error:', err));

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const signOutGoogle = async (): Promise<void> => {
  await fbSignOut(auth);
  cachedAccessToken = null;
  currentUser = null;
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const getCurrentGoogleUser = (): User | null => {
  return currentUser;
};

// ----------------- SPREADSHEET ID & SETTINGS -----------------

export const getSpreadsheetId = (): string | null => {
  return localStorage.getItem(SPREADSHEET_ID_KEY);
};

export const setSpreadsheetId = (id: string | null): void => {
  if (id && id.trim()) {
    const cleanId = id.trim();
    const url = `https://docs.google.com/spreadsheets/d/${cleanId}`;
    localStorage.setItem(SPREADSHEET_ID_KEY, cleanId);
    localStorage.setItem(SPREADSHEET_URL_KEY, url);
    // Sync to backend if active
    fetch('/api/google-sheets/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spreadsheetId: cleanId, spreadsheetUrl: url })
    }).catch(() => {});
  } else {
    localStorage.removeItem(SPREADSHEET_ID_KEY);
    localStorage.removeItem(SPREADSHEET_URL_KEY);
  }
};

export const getSpreadsheetUrl = (): string | null => {
  return localStorage.getItem(SPREADSHEET_URL_KEY);
};

export const getWebhookUrl = (): string | null => {
  return localStorage.getItem(WEBHOOK_URL_KEY);
};

export const setWebhookUrl = (url: string | null): void => {
  if (url && url.trim()) {
    localStorage.setItem(WEBHOOK_URL_KEY, url.trim());
  } else {
    localStorage.removeItem(WEBHOOK_URL_KEY);
  }
};

export const getLastSyncTime = (): string | null => {
  return localStorage.getItem(LAST_SYNC_KEY);
};

// ----------------- QUEUE MANAGEMENT (OFFLINE / UNCONNECTED RESILIENCE) -----------------

export interface PendingItem {
  id: string;
  type: 'submission' | 'survey' | 'mission';
  data: any;
  queuedAt: string;
}

export const getPendingQueue = (): PendingItem[] => {
  try {
    return JSON.parse(localStorage.getItem(PENDING_QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
};

export const addToPendingQueue = (type: 'submission' | 'survey' | 'mission', data: any): void => {
  try {
    const queue = getPendingQueue();
    // Avoid exact duplicate in queue
    const id = data.id || `QUEUE-${Date.now()}`;
    if (!queue.some((item) => item.id === id)) {
      queue.push({
        id,
        type,
        data,
        queuedAt: new Date().toISOString()
      });
      localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(queue));
    }
  } catch (err) {
    console.error('Failed to queue item for Google Sheets:', err);
  }
};

export const clearPendingQueue = (): void => {
  localStorage.removeItem(PENDING_QUEUE_KEY);
};

// ----------------- GOOGLE SHEETS API V4 OPERATIONS -----------------

const HEADERS_SUBMISSIONS = [
  'رقم المشاركة',
  'تاريخ ووقت الإرسال',
  'اسم الطالبة',
  'الفصل الدراسي',
  'نوع المشاركة',
  'عنوان المشاركة',
  'محتوى المشاركة / رابط اللوحة',
  'حالة الاعتماد والمراجعة',
  'المعلمة المراجعة',
  'ملاحظات المعلمة وتوجيهها'
];

const HEADERS_SURVEYS = [
  'رقم الاستبانة',
  'تاريخ الاستجابة',
  'اسم الطالبة',
  'الفصل الدراسي',
  'نوع الاستبانة',
  'س1: معرفة نص المادة 34',
  'س2: أبعاد الدفاع عن العقيدة والوطن',
  'س3: الشعور بالمسؤولية كدرع للوطن',
  'س4: دور المرأة والفتاة في الدفاع الفكري',
  'س5: الاستعداد للمبادرة والتطوع',
  'ملاحظات إضافية'
];

const HEADERS_MISSIONS = [
  'رقم العملية',
  'تاريخ الإنجاز',
  'اسم الطالبة',
  'الفصل الدراسي',
  'عنوان المهمة اليومية',
  'النقاط المكتسبة',
  'صحة الإجابة',
  'توقيت التسجيل'
];

/**
 * Creates or initializes the master Google Sheet with 3 tabs and RTL direction
 */
export const createOrInitializeSpreadsheet = async (customTitle?: string): Promise<{ id: string; url: string }> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('يرجى تسجيل الدخول بحساب Google أولاً لإنشاء جدول البيانات.');
  }

  const title = customTitle || `سجل مبادرة «درع الوطن» - الثانوية الأولى بالبدع (المادة 34)`;

  const payload = {
    properties: {
      title,
      locale: 'ar_SA'
    },
    sheets: [
      {
        properties: {
          title: 'مشاركات الطالبات',
          gridProperties: {
            frozenRowCount: 1
          },
          rightToLeft: true
        }
      },
      {
        properties: {
          title: 'استبانات قياس الأثر',
          gridProperties: {
            frozenRowCount: 1
          },
          rightToLeft: true
        }
      },
      {
        properties: {
          title: 'سجل مهمات حماة الوطن',
          gridProperties: {
            frozenRowCount: 1
          },
          rightToLeft: true
        }
      }
    ]
  };

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `فشل إنشاء جدول Google Sheets (${res.status})`);
  }

  const data = await res.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

  setSpreadsheetId(spreadsheetId);

  // Write header rows to all three tabs
  await appendValuesDirect(spreadsheetId, 'مشاركات الطالبات!A1', [HEADERS_SUBMISSIONS], token);
  await appendValuesDirect(spreadsheetId, 'استبانات قياس الأثر!A1', [HEADERS_SURVEYS], token);
  await appendValuesDirect(spreadsheetId, 'سجل مهمات حماة الوطن!A1', [HEADERS_MISSIONS], token);

  // Apply styling (Green header background, bold text)
  try {
    await applyHeaderFormatting(spreadsheetId, token);
  } catch (styleErr) {
    console.warn('Formatting could not be applied fully, headers remain readable:', styleErr);
  }

  return { id: spreadsheetId, url: spreadsheetUrl };
};

/**
 * Low-level append API helper
 */
async function appendValuesDirect(
  spreadsheetId: string,
  range: string,
  values: any[][],
  token: string
): Promise<any> {
  const encodedRange = encodeURIComponent(range);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ values })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `خطأ في ترحيل البيانات إلى Google Sheets (${res.status})`);
  }

  return res.json();
}

/**
 * Formats top header row with emerald green background and white bold text
 */
async function applyHeaderFormatting(spreadsheetId: string, token: string): Promise<void> {
  // Fetch sheet IDs
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!metaRes.ok) return;

  const meta = await metaRes.json();
  const sheets = meta.sheets || [];

  const requests: any[] = [];

  sheets.forEach((s: any) => {
    const sheetId = s.properties.sheetId;
    requests.push({
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: 0,
          endRowIndex: 1
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.08, green: 0.35, blue: 0.24 }, // Emerald Green (#14593D)
            textFormat: {
              foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 },
              bold: true,
              fontSize: 11
            },
            horizontalAlignment: 'CENTER'
          }
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
      }
    });
  });

  if (requests.length > 0) {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests })
    });
  }
}

// ----------------- TRANSFORM ROWS -----------------

function formatSubmissionRow(s: Submission): any[] {
  const typeMap: Record<string, string> = {
    drawing: 'لوحة فنية وطنية',
    text: 'مشاركة وخاطرة نصية',
    pledge: 'وثيقة عهد وميثاق',
    quiz: 'اختبار درع الوطن'
  };

  const statusMap: Record<string, string> = {
    approved: 'معتمدة وموثقة',
    featured: 'معتمدة ومميزة بالمعرض',
    pending: 'قيد المراجعة',
    archived: 'مؤرشفة'
  };

  return [
    s.id,
    new Date(s.createdAt).toLocaleString('ar-SA'),
    s.studentName,
    s.grade,
    typeMap[s.type] || s.type,
    s.title || 'مشاركة درع الوطن',
    s.fileUrl || s.content,
    statusMap[s.status] || s.status,
    s.reviewedBy || '-',
    s.feedback || '-'
  ];
}

function formatSurveyRow(sr: SurveyRecord): any[] {
  return [
    sr.id,
    new Date(sr.createdAt).toLocaleString('ar-SA'),
    sr.studentName,
    sr.grade,
    sr.surveyType === 'pre' ? 'قبلية (قبل المبادرة)' : 'بعدية (بعد المبادرة)',
    sr.q1,
    sr.q2,
    sr.q3,
    sr.q4,
    sr.q5,
    sr.notes || '-'
  ];
}

function formatMissionRow(m: any): any[] {
  return [
    m.id || `MIS-${Date.now()}`,
    m.dateStr || new Date(m.completedAt || Date.now()).toLocaleDateString('ar-SA'),
    m.studentName,
    m.grade,
    m.missionTitle || 'مهمة درع الوطن اليومية',
    m.pointsEarned || 25,
    m.isCorrect ? 'إجابة صحيحة ✓' : 'محاولة مكتملة',
    new Date(m.completedAt || Date.now()).toLocaleTimeString('ar-SA')
  ];
}

// ----------------- GOOGLE-SPREADSHEET LIBRARY INTEGRATION -----------------

/**
 * Creates an authorized GoogleSpreadsheet instance from the google-spreadsheet library
 */
export const getGoogleSpreadsheetDoc = async (customId?: string): Promise<GoogleSpreadsheet> => {
  const spreadsheetId = customId || getSpreadsheetId();
  if (!spreadsheetId) {
    throw new Error('لم يتم تحديد معرّف جدول البيانات بعد');
  }

  const token = await getAccessToken();
  if (!token) {
    throw new Error('يرجى تسجيل الدخول بحساب Google أولاً لاستخدام مكتبة Google Spreadsheet');
  }

  const doc = new GoogleSpreadsheet(spreadsheetId, { token });
  await doc.loadInfo();
  return doc;
};

/**
 * Appends student submission using the official google-spreadsheet library
 */
export const appendSubmissionWithGoogleSpreadsheet = async (submission: Submission): Promise<boolean> => {
  const token = await getAccessToken();
  const spreadsheetId = getSpreadsheetId();
  if (!token || !spreadsheetId) return false;

  try {
    const doc = new GoogleSpreadsheet(spreadsheetId, { token });
    await doc.loadInfo();

    let sheet = doc.sheetsByTitle['مشاركات الطالبات'];
    if (!sheet) {
      sheet = await doc.addSheet({
        title: 'مشاركات الطالبات',
        headerValues: HEADERS_SUBMISSIONS,
        gridProperties: { frozenRowCount: 1 }
      });
    }

    const typeMap: Record<string, string> = {
      drawing: 'لوحة فنية وطنية',
      text: 'مشاركة وخاطرة نصية',
      pledge: 'وثيقة عهد وميثاق',
      quiz: 'اختبار درع الوطن'
    };

    const statusMap: Record<string, string> = {
      approved: 'معتمدة وموثقة',
      featured: 'معتمدة ومميزة بالمعرض',
      pending: 'قيد المراجعة',
      archived: 'مؤرشفة'
    };

    await sheet.addRow({
      'رقم المشاركة': submission.id,
      'تاريخ ووقت الإرسال': new Date(submission.createdAt).toLocaleString('ar-SA'),
      'اسم الطالبة': submission.studentName,
      'الفصل الدراسي': submission.grade,
      'نوع المشاركة': typeMap[submission.type] || submission.type,
      'عنوان المشاركة': submission.title || 'مشاركة درع الوطن',
      'محتوى المشاركة / رابط اللوحة': submission.fileUrl || submission.content,
      'حالة الاعتماد والمراجعة': statusMap[submission.status] || submission.status,
      'المعلمة المراجعة': submission.reviewedBy || '-',
      'ملاحظات المعلمة وتوجيهها': submission.feedback || '-'
    });

    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
    return true;
  } catch (err) {
    console.warn('google-spreadsheet library row append error:', err);
    return false;
  }
};

/**
 * Appends survey response using the google-spreadsheet library
 */
export const appendSurveyWithGoogleSpreadsheet = async (survey: SurveyRecord): Promise<boolean> => {
  const token = await getAccessToken();
  const spreadsheetId = getSpreadsheetId();
  if (!token || !spreadsheetId) return false;

  try {
    const doc = new GoogleSpreadsheet(spreadsheetId, { token });
    await doc.loadInfo();

    let sheet = doc.sheetsByTitle['استبانات قياس الأثر'];
    if (!sheet) {
      sheet = await doc.addSheet({
        title: 'استبانات قياس الأثر',
        headerValues: HEADERS_SURVEYS,
        gridProperties: { frozenRowCount: 1 }
      });
    }

    await sheet.addRow({
      'رقم الاستبانة': survey.id,
      'تاريخ الاستجابة': new Date(survey.createdAt).toLocaleString('ar-SA'),
      'اسم الطالبة': survey.studentName,
      'الفصل الدراسي': survey.grade,
      'نوع الاستبانة': survey.surveyType === 'pre' ? 'قبلية (قبل المبادرة)' : 'بعدية (بعد المبادرة)',
      'س1: معرفة نص المادة 34': survey.q1,
      'س2: أبعاد الدفاع عن العقيدة والوطن': survey.q2,
      'س3: الشعور بالمسؤولية كدرع للوطن': survey.q3,
      'س4: دور المرأة والفتاة في الدفاع الفكري': survey.q4,
      'س5: الاستعداد للمبادرة والتطوع': survey.q5,
      'ملاحظات إضافية': survey.notes || '-'
    });

    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
    return true;
  } catch (err) {
    console.warn('google-spreadsheet survey row append error:', err);
    return false;
  }
};

// ----------------- HIGH-LEVEL APPEND & MIGRATION METHODS -----------------

/**
 * Appends a new submission to Google Sheet (using google-spreadsheet library with direct Sheets API fallback)
 */
export const appendSubmissionToSheet = async (submission: Submission): Promise<boolean> => {
  // 1. Try google-spreadsheet library first
  const libResult = await appendSubmissionWithGoogleSpreadsheet(submission);
  if (libResult) {
    return true;
  }

  // 2. Direct Sheets API v4 fallback if authenticated
  const token = await getAccessToken();
  const spreadsheetId = getSpreadsheetId();

  if (token && spreadsheetId) {
    try {
      const row = formatSubmissionRow(submission);
      await appendValuesDirect(spreadsheetId, 'مشاركات الطالبات!A1', [row], token);
      localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
      return true;
    } catch (err) {
      console.warn('Direct Google Sheet append failed, adding to pending queue:', err);
      addToPendingQueue('submission', submission);
    }
  } else {
    // Add to pending queue so it automatically migrates once teacher connects
    addToPendingQueue('submission', submission);
  }

  // 3. Webhook fallback if configured
  const webhookUrl = getWebhookUrl();
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheet: 'submissions',
          action: 'append',
          payload: submission
        })
      });
      return true;
    } catch (whErr) {
      console.warn('Webhook dispatch failed:', whErr);
    }
  }

  return false;
};

/**
 * Appends a survey record to Google Sheet
 */
export const appendSurveyToSheet = async (survey: SurveyRecord): Promise<boolean> => {
  const token = await getAccessToken();
  const spreadsheetId = getSpreadsheetId();

  if (token && spreadsheetId) {
    try {
      const row = formatSurveyRow(survey);
      await appendValuesDirect(spreadsheetId, 'استبانات قياس الأثر!A1', [row], token);
      localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
      return true;
    } catch (err) {
      console.warn('Survey Google Sheet append failed, queueing:', err);
      addToPendingQueue('survey', survey);
    }
  } else {
    addToPendingQueue('survey', survey);
  }

  const webhookUrl = getWebhookUrl();
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheet: 'surveys',
          action: 'append',
          payload: survey
        })
      });
      return true;
    } catch {
      // ignore
    }
  }

  return false;
};

/**
 * Appends a daily mission completion to Google Sheet
 */
export const appendMissionToSheet = async (mission: any): Promise<boolean> => {
  const token = await getAccessToken();
  const spreadsheetId = getSpreadsheetId();

  if (token && spreadsheetId) {
    try {
      const row = formatMissionRow(mission);
      await appendValuesDirect(spreadsheetId, 'سجل مهمات حماة الوطن!A1', [row], token);
      localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
      return true;
    } catch (err) {
      console.warn('Mission Google Sheet append failed, queueing:', err);
      addToPendingQueue('mission', mission);
    }
  } else {
    addToPendingQueue('mission', mission);
  }

  return false;
};

/**
 * Flushes all pending queued items to Google Sheets
 */
export const processPendingQueue = async (): Promise<number> => {
  const token = await getAccessToken();
  const spreadsheetId = getSpreadsheetId();
  if (!token || !spreadsheetId) return 0;

  const queue = getPendingQueue();
  if (queue.length === 0) return 0;

  let synced = 0;
  const remaining: PendingItem[] = [];

  for (const item of queue) {
    try {
      if (item.type === 'submission') {
        const row = formatSubmissionRow(item.data);
        await appendValuesDirect(spreadsheetId, 'مشاركات الطالبات!A1', [row], token);
      } else if (item.type === 'survey') {
        const row = formatSurveyRow(item.data);
        await appendValuesDirect(spreadsheetId, 'استبانات قياس الأثر!A1', [row], token);
      } else if (item.type === 'mission') {
        const row = formatMissionRow(item.data);
        await appendValuesDirect(spreadsheetId, 'سجل مهمات حماة الوطن!A1', [row], token);
      }
      synced++;
    } catch (err) {
      console.warn('Error syncing queued item:', err);
      remaining.push(item);
    }
  }

  if (remaining.length === 0) {
    clearPendingQueue();
  } else {
    localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(remaining));
  }

  if (synced > 0) {
    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
  }

  return synced;
};

/**
 * One-click Full Migration & Synchronization of all records to Google Sheets
 */
export const syncAllToGoogleSheet = async (
  submissions: Submission[],
  surveys?: SurveyRecord[],
  missions?: any[]
): Promise<SyncResult> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('يرجى تسجيل الدخول بحساب Google أولاً لمتابعة المزامنة السحابية.');
  }

  let spreadsheetId = getSpreadsheetId();

  // If no spreadsheet exists yet, create it automatically
  if (!spreadsheetId) {
    const created = await createOrInitializeSpreadsheet();
    spreadsheetId = created.id;
  }

  let syncedCount = 0;
  let failedCount = 0;

  // 1. Sync Submissions
  if (submissions && submissions.length > 0) {
    const rows = submissions.map(formatSubmissionRow);
    try {
      await appendValuesDirect(spreadsheetId, 'مشاركات الطالبات!A1', rows, token);
      syncedCount += rows.length;
    } catch (err) {
      console.error('Failed to sync submissions batch:', err);
      failedCount += rows.length;
    }
  }

  // 2. Sync Surveys
  if (surveys && surveys.length > 0) {
    const rows = surveys.map(formatSurveyRow);
    try {
      await appendValuesDirect(spreadsheetId, 'استبانات قياس الأثر!A1', rows, token);
      syncedCount += rows.length;
    } catch (err) {
      console.error('Failed to sync surveys batch:', err);
      failedCount += rows.length;
    }
  }

  // 3. Sync Missions
  if (missions && missions.length > 0) {
    const rows = missions.map(formatMissionRow);
    try {
      await appendValuesDirect(spreadsheetId, 'سجل مهمات حماة الوطن!A1', rows, token);
      syncedCount += rows.length;
    } catch (err) {
      console.error('Failed to sync missions batch:', err);
      failedCount += rows.length;
    }
  }

  // 4. Clear pending queue
  clearPendingQueue();
  localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());

  const sheetUrl = getSpreadsheetUrl() || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

  return {
    success: failedCount === 0,
    syncedCount,
    failedCount,
    message: `تم ترحيل وتوثيق ${syncedCount} سجلاً بنجاح إلى جدول Google Sheets!`,
    spreadsheetUrl: sheetUrl
  };
};

/**
 * Returns current status of Google Sheets integration
 */
export const getGoogleSheetsStatus = (): GoogleSheetsSyncStatus => {
  return {
    isConnected: !!cachedAccessToken && !!currentUser,
    userEmail: currentUser?.email || null,
    userName: currentUser?.displayName || null,
    spreadsheetId: getSpreadsheetId(),
    spreadsheetUrl: getSpreadsheetUrl(),
    lastSyncTime: getLastSyncTime(),
    pendingCount: getPendingQueue().length,
    webhookUrl: getWebhookUrl()
  };
};
