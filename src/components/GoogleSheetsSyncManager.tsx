/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  UploadCloud,
  Layers,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  LogOut,
  ShieldCheck,
  FileText,
  HelpCircle,
  Users,
  Settings2,
  Clock
} from 'lucide-react';
import {
  signInWithGoogle,
  signOutGoogle,
  getSpreadsheetId,
  getSpreadsheetUrl,
  setSpreadsheetId,
  createOrInitializeSpreadsheet,
  syncAllToGoogleSheet,
  processPendingQueue,
  getPendingQueue,
  getLastSyncTime,
  getCurrentGoogleUser,
  initGoogleAuth,
  SyncResult
} from '../services/googleSheets';
import { Submission, SurveyAnalytics, TeacherUser } from '../types';

interface GoogleSheetsSyncManagerProps {
  submissions: Submission[];
  currentTeacher: TeacherUser | null;
  onRefreshData?: () => void;
}

export const GoogleSheetsSyncManager: React.FC<GoogleSheetsSyncManagerProps> = ({
  submissions,
  currentTeacher,
  onRefreshData
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [spreadsheetId, setSpreadsheetIdState] = useState<string | null>(getSpreadsheetId());
  const [spreadsheetUrl, setSpreadsheetUrlState] = useState<string | null>(getSpreadsheetUrl());
  const [lastSync, setLastSync] = useState<string | null>(getLastSyncTime());
  const [pendingCount, setPendingCount] = useState<number>(getPendingQueue().length);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    message: string;
    details?: string;
  }>({
    type: 'idle',
    message: ''
  });

  const [copied, setCopied] = useState<boolean>(false);
  const [customSheetInput, setCustomSheetInput] = useState<string>('');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);
  const [showConfirmNewSheet, setShowConfirmNewSheet] = useState<boolean>(false);

  // Check auth state on mount
  useEffect(() => {
    const unsub = initGoogleAuth(
      (user) => {
        setIsConnected(true);
        setUserEmail(user.email);
        setUserName(user.displayName);
        setSpreadsheetIdState(getSpreadsheetId());
        setSpreadsheetUrlState(getSpreadsheetUrl());
        setLastSync(getLastSyncTime());
        setPendingCount(getPendingQueue().length);
      },
      () => {
        setIsConnected(false);
        setUserEmail(null);
        setUserName(null);
      }
    );

    const activeUser = getCurrentGoogleUser();
    if (activeUser) {
      setIsConnected(true);
      setUserEmail(activeUser.email);
      setUserName(activeUser.displayName);
    }

    return () => unsub();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setSyncStatus({ type: 'idle', message: '' });
    try {
      const res = await signInWithGoogle();
      setIsConnected(true);
      setUserEmail(res.user.email);
      setUserName(res.user.displayName);
      setSpreadsheetIdState(getSpreadsheetId());
      setSpreadsheetUrlState(getSpreadsheetUrl());
      setLastSync(getLastSyncTime());
      setPendingCount(getPendingQueue().length);

      setSyncStatus({
        type: 'success',
        message: 'تم الاتصال بحساب Google وتفعيل الربط السحابي بنجاح!'
      });
    } catch (err: any) {
      console.error('Login error:', err);
      setSyncStatus({
        type: 'error',
        message: err.message || 'تعذر تسجيل الدخول بحساب Google. يرجى التأكد من السماح بالنوافذ المنبثقة.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignOut = async () => {
    await signOutGoogle();
    setIsConnected(false);
    setUserEmail(null);
    setUserName(null);
    setSyncStatus({
      type: 'idle',
      message: 'تم تسجيل الخروج من Google بنجاح.'
    });
  };

  const handleCreateNewSheet = async () => {
    setShowConfirmNewSheet(false);
    setIsLoading(true);
    setSyncStatus({ type: 'loading', message: 'جارٍ إنشاء وتنسيق السجل السحابي في Google Drive...' });
    try {
      const created = await createOrInitializeSpreadsheet();
      setSpreadsheetIdState(created.id);
      setSpreadsheetUrlState(created.url);
      setSyncStatus({
        type: 'success',
        message: 'تم إنشاء سجل Google Sheets الجديد وتنسيق أوراقه بنجاح!',
        details: created.url
      });
    } catch (err: any) {
      setSyncStatus({
        type: 'error',
        message: err.message || 'حدث خطأ أثناء إنشاء السجل في Google Sheets.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncAll = async () => {
    if (!isConnected) {
      await handleGoogleSignIn();
      return;
    }

    setIsLoading(true);
    setSyncStatus({
      type: 'loading',
      message: 'جارٍ ترحيل وحفظ كافة المشاركات والاستبانات إلى Google Sheets...'
    });

    try {
      // Fetch fresh local surveys & missions from storage
      const localSurveys = JSON.parse(localStorage.getItem('deraa_local_surveys') || '[]');
      const allMissions: any[] = [];

      // Collect missions from localStorage keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('deraa_missions_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            if (Array.isArray(data.completions)) {
              allMissions.push(...data.completions);
            }
          } catch {
            // ignore
          }
        }
      }

      const result: SyncResult = await syncAllToGoogleSheet(submissions, localSurveys, allMissions);
      setLastSync(new Date().toISOString());
      setPendingCount(0);
      setSpreadsheetIdState(getSpreadsheetId());
      setSpreadsheetUrlState(result.spreadsheetUrl || getSpreadsheetUrl());

      setSyncStatus({
        type: 'success',
        message: result.message,
        details: result.spreadsheetUrl
      });

      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setSyncStatus({
        type: 'error',
        message: err.message || 'حدث خطأ أثناء المزامنة. يرجى إعادة المحاولة.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessQueueOnly = async () => {
    setIsLoading(true);
    try {
      const count = await processPendingQueue();
      setPendingCount(getPendingQueue().length);
      setLastSync(getLastSyncTime());
      setSyncStatus({
        type: 'success',
        message: `تم ترحيل ${count} مشاركة جديدة كانت بالانتظار بنجاح!`
      });
    } catch (err: any) {
      setSyncStatus({
        type: 'error',
        message: err.message || 'تعذر إفراغ قائمة الانتظار.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCustomSheetId = () => {
    let idToSet = customSheetInput.trim();
    // Extract ID if full Google Sheets URL was pasted
    const match = idToSet.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      idToSet = match[1];
    }

    if (idToSet) {
      setSpreadsheetId(idToSet);
      setSpreadsheetIdState(idToSet);
      setSpreadsheetUrlState(getSpreadsheetUrl());
      setCustomSheetInput('');
      setSyncStatus({
        type: 'success',
        message: 'تم ربط معرّف الجدول المخصص بنجاح!'
      });
    }
  };

  const copyUrlToClipboard = () => {
    if (spreadsheetUrl) {
      navigator.clipboard.writeText(spreadsheetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 text-right">
      {/* Hero Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-emerald-500/40">
        <div className="absolute top-0 left-0 -mt-8 -ml-8 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 -mb-8 -mr-8 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-400/50 text-xs font-bold text-amber-300">
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>خدمة Google Sheets API v4 المدمجة عبر مكتبة google-spreadsheet ⚡</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              السجل السحابي الدائم لمشاركات درع الوطن
            </h2>
            <p className="text-sm text-emerald-100/90 leading-relaxed">
              حفظ وتوثيق دائم وآمن لمشاركات طالبات الثانوية الأولى بالبدع (المشاركات النصية، الرسومات، استبانات قياس الأثر، وإنجازات حماة الوطن) في جدول بيانات سحابي يسهل للمعلمتين <strong>أمل رشيد</strong> و<strong>وفاء الزهراني</strong> والإدارة المدرسية الوصول إليه ومتابعته من أي جهاز.
            </p>
          </div>

          {/* Quick Connect / Status CTA */}
          <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {isConnected ? (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleSyncAll}
                  disabled={isLoading}
                  className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isLoading ? 'جارٍ الترحيل السحابي...' : 'مزامنة وترحيل كافة المشاركات الآن'}</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm flex items-center justify-center gap-3 shadow-xl transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>تسجيل الدخول بحساب Google للربط</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncStatus.message && (
        <div
          className={`p-4 rounded-2xl border text-sm font-bold flex items-start justify-between gap-3 shadow-xs animate-in fade-in duration-200 ${
            syncStatus.type === 'error'
              ? 'bg-red-50 text-red-900 border-red-200'
              : syncStatus.type === 'loading'
              ? 'bg-blue-50 text-blue-900 border-blue-200'
              : 'bg-emerald-50 text-emerald-900 border-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {syncStatus.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            ) : syncStatus.type === 'loading' ? (
              <RefreshCw className="w-5 h-5 text-blue-600 shrink-0 animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            )}
            <div>
              <span>{syncStatus.message}</span>
              {syncStatus.details && (
                <div className="mt-1">
                  <a
                    href={syncStatus.details}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-900 underline font-normal"
                  >
                    <span>فتح الجدول في نافذة جديدة</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grid of Key Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Connection & Account */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-xl ${isConnected ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">حساب Google المتصل</h3>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                isConnected
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {isConnected ? 'متصل ونشط ✓' : 'غير متصل'}
            </span>
          </div>

          <div className="space-y-1">
            {isConnected ? (
              <>
                <p className="text-sm font-extrabold text-slate-900 truncate">{userName || 'معلمة المبادرة'}</p>
                <p className="text-xs text-slate-500 font-mono truncate">{userEmail}</p>
                <div className="pt-2 flex items-center justify-between border-t border-slate-100 mt-2">
                  <span className="text-[11px] text-emerald-700 font-semibold">صلاحية Sheets API مفعلة</span>
                  <button
                    type="button"
                    onClick={handleGoogleSignOut}
                    className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>فصل الحساب</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs text-slate-500">
                  قم بتسجيل الدخول بحساب Google (الخاص بالمعلمة أو المدرسة) لتمكين الترحيل التلقائي لمشاركات الطالبات.
                </p>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="mt-2 w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  ربط الحساب الآن
                </button>
              </>
            )}
          </div>
        </div>

        {/* Card 2: Active Spreadsheet Link */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">جدول البيانات السحابي</h3>
            </div>
            {spreadsheetUrl && (
              <a
                href={spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1 transition-colors shadow-xs"
              >
                <span>فتح الجدول</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-700 truncate">
              {spreadsheetId ? 'سجل مبادرة «درع الوطن» (المادة 34)' : 'لم يتم ربط جدول بعد'}
            </p>
            {spreadsheetId ? (
              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                <span className="truncate flex-1">{spreadsheetId}</span>
                <button
                  type="button"
                  onClick={copyUrlToClipboard}
                  title="نسخ الرابط"
                  className="p-1 hover:text-emerald-700 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-400">سيتم إنشاء الجدول وتنسيقه تلقائياً عند أول مزامنة.</p>
            )}

            <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>آخر مزامنة:</span>
              </span>
              <strong className="text-slate-700">
                {lastSync ? new Date(lastSync).toLocaleString('ar-SA') : 'لم تتم بعد'}
              </strong>
            </div>
          </div>
        </div>

        {/* Card 3: Real-Time Sync & Queue */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                <UploadCloud className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">حالة الترحيل المباشر</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[11px] font-bold border border-blue-200">
              {pendingCount > 0 ? `${pendingCount} بالانتظار` : 'جميع المشاركات مؤمنة ✓'}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>إجمالي المشاركات المسجلة:</span>
              <span className="font-extrabold text-slate-900 font-mono">{submissions.length}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>عناصر قيد الترحيل التلقائي:</span>
              <span className={`font-mono font-bold ${pendingCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {pendingCount}
              </span>
            </div>

            {pendingCount > 0 && isConnected && (
              <button
                type="button"
                onClick={handleProcessQueueOnly}
                disabled={isLoading}
                className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>ترحيل العناصر المعلقة الآن</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Spreadsheet Structure & Sheets Preview Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-base">
              <Layers className="w-5 h-5 text-emerald-600" />
              <span>هيكل أوراق العمل المدمجة في السجل السحابي (3 أوراق عمل تلقائية)</span>
            </div>
            <p className="text-xs text-slate-500">
              تم تقسيم السجل إلى 3 علامات تبويب متكاملة بصيغة متوافقة مع اليمين لليسار (RTL) ورؤوس أعمدة واضحة:
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isConnected && (
              <button
                type="button"
                onClick={() => setShowConfirmNewSheet(true)}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                إعادة إنشاء السجل وتنسيقه
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="إعدادات متقدمة"
            >
              <Settings2 className="w-4 h-4" />
              <span className="hidden sm:inline">إعدادات متقدمة</span>
            </button>
          </div>
        </div>

        {/* 3 Sheets Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sheet 1 */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <FileText className="w-4 h-4 text-emerald-700" />
              <span>ورقة 1: مشاركات الطالبات</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              تحتوي على رقم المشاركة، اسم الطالبة، الصف، نوع المشاركة (رسمة/نص)، العنوان، رابط اللوحة/النص، حالة الاعتماد، واسم المعلمة المراجعة.
            </p>
            <div className="text-[11px] font-mono text-emerald-700 bg-white/70 p-2 rounded-lg border border-emerald-200">
              10 أعمدة بيانات مجهزة ومعتمدة
            </div>
          </div>

          {/* Sheet 2 */}
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
              <HelpCircle className="w-4 h-4 text-blue-700" />
              <span>ورقة 2: استبانات قياس الأثر</span>
            </div>
            <p className="text-xs text-blue-800 leading-relaxed">
              توثق نتائج قياس الأثر (الاستبانات القبلية والبعدية)، وإجابات الطالبات على الأسئلة الخمسة وملاحظاتهن لتقييم نمو الوعي الدستوري بالمادة 34.
            </p>
            <div className="text-[11px] font-mono text-blue-700 bg-white/70 p-2 rounded-lg border border-blue-200">
              11 عمود إحصائي لقياس الأثر
            </div>
          </div>

          {/* Sheet 3 */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
            <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>ورقة 3: سجل مهمات حماة الوطن</span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              تسجل المهام اليومية المنجزة، النقاط المحققة لكل طالبة، الإجابات الصحيحة وتوقيت الإنجاز للمتابعة المباشرة لمسار حماة الوطن.
            </p>
            <div className="text-[11px] font-mono text-amber-800 bg-white/70 p-2 rounded-lg border border-amber-200">
              8 أعمدة تتبع إنجازات وتحديات
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Settings Drawer */}
      {showAdvancedSettings && (
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800">إعدادات متقدمة للربط المخصص</h4>
            <button
              type="button"
              onClick={() => setShowAdvancedSettings(false)}
              className="text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              إغلاق
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ربط معرّف جدول Google Sheets مسبق الصنع (Spreadsheet ID أو رابط كامل):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customSheetInput}
                  onChange={(e) => setCustomSheetInput(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/1abc... أو المعرف فقط"
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleSaveCustomSheetId}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  حفظ
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                يمكنكِ وضع رابط أي جدول موجود لديكِ لترحيل المشاركات إليه مباشرة.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                إفراغ وإعادة ضبط إعدادات المزامنة:
              </label>
              <button
                type="button"
                onClick={() => {
                  setSpreadsheetId(null);
                  setSpreadsheetIdState(null);
                  setSpreadsheetUrlState(null);
                  setSyncStatus({ type: 'idle', message: 'تم فك ارتباط الجدول بنجاح من المتصفح.' });
                }}
                className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-colors cursor-pointer"
              >
                فك ارتباط الجدول الحالي
              </button>
              <p className="text-[10px] text-slate-400 mt-1">
                لن يتم حذف البيانات من Google Drive، فقط فك الربط المحلي لإعادة إنشائه.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Creating New Spreadsheet */}
      {showConfirmNewSheet && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-right space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">إنشاء سجل Google Sheets جديد؟</h3>
                <p className="text-xs text-slate-500">سيتم إنشاء جدول بيانات جديد في حساب Google Drive الخاص بكِ</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              سيقوم النظام بإنشاء جدول بعنوان: <br />
              <strong className="text-emerald-900">«سجل مبادرة درع الوطن - الثانوية الأولى بالبدع (المادة 34)»</strong> <br />
              مع تقسيم الأوراق إلى (مشاركات الطالبات، استبانات قياس الأثر، سجل مهمات حماة الوطن).
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleCreateNewSheet}
                className="flex-1 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
              >
                تأكيد وإنشاء الجدول
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmNewSheet(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
