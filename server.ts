import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parser
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Directories
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Static uploads serving
app.use('/uploads', express.static(UPLOADS_DIR));

// Database schema and helper
interface Submission {
  id: string;
  studentName: string;
  grade: string;
  type: 'text' | 'drawing' | 'pledge' | 'quiz';
  title: string;
  content: string;
  fileUrl?: string;
  backgroundTemplate?: string;
  status: 'pending' | 'approved' | 'featured' | 'archived';
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  feedback?: string;
}

interface SurveyRecord {
  id: string;
  studentName: string;
  grade: string;
  surveyType: 'pre' | 'post';
  q1: number; // معرفة نص المادة 34
  q2: number; // استيعاب أبعاد الدفاع عن العقيدة والوطن
  q3: number; // الشعور بالمسؤولية كدرع للوطن
  q4: number; // دور الفتاة/المرأة السعودية في الدفاع الفكري والوطني
  q5: number; // الاستعداد للمشاركة في المبادرات الوطنية
  notes?: string;
  createdAt: string;
}

interface StudentBadge {
  id: string;
  studentName: string;
  grade: string;
  badgeId: string;
  badgeTitle: string;
  iconName: string;
  reason: string;
  awardedAt: string;
}

interface Teacher {
  id: string;
  username: string;
  passwordHash: string;
  displayName: string;
  role: 'teacher_admin';
  school: string;
}

interface StudentMissionCompletion {
  id: string;
  studentName: string;
  grade: string;
  missionId: string;
  missionTitle: string;
  dateStr: string; // YYYY-MM-DD
  pointsEarned: number;
  isCorrect: boolean;
  completedAt: string;
}

interface ClaimedWeeklyBox {
  id: string;
  studentName: string;
  grade: string;
  weekKey: string;
  bonusPoints: number;
  claimedAt: string;
}

interface DatabaseState {
  submissions: Submission[];
  surveys: SurveyRecord[];
  badges: StudentBadge[];
  teachers: Teacher[];
  missionCompletions: StudentMissionCompletion[];
  claimedBoxes: ClaimedWeeklyBox[];
}

function getInitialDb(): DatabaseState {
  return {
    submissions: [],
    surveys: [],
    badges: [],
    missionCompletions: [],
    claimedBoxes: [],
    teachers: [
      {
        id: 'teacher-1',
        username: 'amal_rashid',
        passwordHash: 'Amal@2026', // Plain for simplicity in prototype, compared safely
        displayName: 'المعلمة أمل رشيد',
        role: 'teacher_admin',
        school: 'الثانوية الأولى بالبدع'
      },
      {
        id: 'teacher-2',
        username: 'wafa_alzahrani',
        passwordHash: 'Wafa@2026',
        displayName: 'المعلمة وفاء الزهراني',
        role: 'teacher_admin',
        school: 'الثانوية الأولى بالبدع'
      }
    ]
  };
}

function loadDb(): DatabaseState {
  if (!fs.existsSync(DB_FILE)) {
    const initial = getInitialDb();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const data = JSON.parse(raw);
    if (!data.teachers || data.teachers.length === 0) {
      data.teachers = getInitialDb().teachers;
    }
    if (!data.missionCompletions) data.missionCompletions = [];
    if (!data.claimedBoxes) data.claimedBoxes = [];
    return data;
  } catch (err) {
    console.error('Error loading db file, resetting to clean:', err);
    const initial = getInitialDb();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
}

function saveDb(data: DatabaseState): void {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Active session tokens
const SESSIONS = new Map<string, Teacher>();

// Auth Middleware for admin routes
function requireTeacherAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'غير مصرح: يجب تسجيل الدخول للوصول إلى لوحة التحكم الإدارية' });
    return;
  }
  const token = authHeader.substring(7);
  const teacher = SESSIONS.get(token);
  if (!teacher) {
    res.status(401).json({ error: 'الجلسة منتهية أو غير صالحة. يرجى إعادة تسجيل الدخول.' });
    return;
  }
  (req as any).teacher = teacher;
  next();
}

// ----------------- API ROUTES -----------------

// 1. Health check & basic stats
app.get('/api/status', (req, res) => {
  const db = loadDb();
  res.json({
    status: 'online',
    school: 'الثانوية الأولى بالبدع',
    teachers: ['أمل رشيد', 'وفاء الزهراني'],
    initiative: 'درع الوطن - المادة 34 من النظام الأساسي للحكم',
    totalSubmissions: db.submissions.length,
    totalSurveys: db.surveys.length,
    timestamp: new Date().toISOString()
  });
});

// 2. Auth: Teacher login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'اسم المستخدم وكلمة المرور مطلوبان' });
    return;
  }

  const db = loadDb();
  const normalizedUser = username.trim().toLowerCase();
  const teacher = db.teachers.find(
    (t) => t.username.toLowerCase() === normalizedUser && t.passwordHash === password
  );

  if (!teacher) {
    res.status(401).json({ error: 'بيانات الدخول غير صحيحة. يرجى التحقق من اسم المستخدم وكلمة المرور.' });
    return;
  }

  const token = crypto.randomBytes(32).toString('hex');
  SESSIONS.set(token, teacher);

  res.json({
    success: true,
    token,
    teacher: {
      id: teacher.id,
      username: teacher.username,
      displayName: teacher.displayName,
      role: teacher.role,
      school: teacher.school
    }
  });
});

// Auth: Current teacher check
app.get('/api/auth/me', requireTeacherAuth, (req, res) => {
  const teacher = (req as any).teacher;
  res.json({
    authenticated: true,
    teacher: {
      id: teacher.id,
      username: teacher.username,
      displayName: teacher.displayName,
      role: teacher.role,
      school: teacher.school
    }
  });
});

// Auth: Logout
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    SESSIONS.delete(token);
  }
  res.json({ success: true });
});

// 3. Submissions API
// Get submissions (for teachers: all; for public: approved/featured only if requested)
app.get('/api/submissions', (req, res) => {
  const db = loadDb();
  const { grade, type, status, search, publicOnly } = req.query;

  let results = [...db.submissions];

  if (publicOnly === 'true') {
    results = results.filter((s) => s.status === 'approved' || s.status === 'featured');
  }

  if (grade && typeof grade === 'string' && grade !== 'all') {
    results = results.filter((s) => s.grade === grade);
  }

  if (type && typeof type === 'string' && type !== 'all') {
    results = results.filter((s) => s.type === type);
  }

  if (status && typeof status === 'string' && status !== 'all') {
    results = results.filter((s) => s.status === status);
  }

  if (search && typeof search === 'string') {
    const q = search.trim().toLowerCase();
    results = results.filter(
      (s) =>
        s.studentName.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        s.content.toLowerCase().includes(q)
    );
  }

  // Sort descending by date
  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    total: results.length,
    submissions: results
  });
});

// Create new student submission (with duplicate prevention)
app.post('/api/submissions', (req, res) => {
  const { studentName, grade, type, title, content, fileUrl, backgroundTemplate } = req.body;

  if (!studentName || !studentName.trim()) {
    res.status(400).json({ error: 'اسم الطالبة مطلوب' });
    return;
  }
  if (!grade || !grade.trim()) {
    res.status(400).json({ error: 'الفصل الدراسي مطلوب' });
    return;
  }
  if (!type) {
    res.status(400).json({ error: 'نوع المشاركة مطلوب' });
    return;
  }
  if (type === 'text' && (!content || !content.trim())) {
    res.status(400).json({ error: 'محتوى المشاركة النصية لا يمكن أن يكون فارغاً' });
    return;
  }
  if (type === 'drawing' && !fileUrl) {
    res.status(400).json({ error: 'لم يتم إرسال ملف أو رسمة' });
    return;
  }

  const db = loadDb();
  const cleanName = studentName.trim();
  const now = new Date();

  // Prevent duplicate submissions within 15 seconds by same student with same type & content
  const isDuplicate = db.submissions.some((s) => {
    const diffMs = now.getTime() - new Date(s.createdAt).getTime();
    return (
      diffMs < 15000 &&
      s.studentName.toLowerCase() === cleanName.toLowerCase() &&
      s.type === type &&
      (s.content === content || (type === 'drawing' && s.fileUrl === fileUrl))
    );
  });

  if (isDuplicate) {
    res.status(429).json({ error: 'تم استلام مشاركة مماثلة بالفعل للتو! يرجى الانتظار قليلاً.' });
    return;
  }

  const newSubmission: Submission = {
    id: `SUB-${now.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
    studentName: cleanName,
    grade: grade.trim(),
    type,
    title: (title || (type === 'drawing' ? 'لوحة فنية وطنية' : 'رسالة ولاء واعتزاز')).trim(),
    content: (content || '').trim(),
    fileUrl: fileUrl || undefined,
    backgroundTemplate: backgroundTemplate ? String(backgroundTemplate).trim() : undefined,
    status: 'pending',
    createdAt: now.toISOString()
  };

  db.submissions.unshift(newSubmission);
  saveDb(db);

  res.status(201).json({
    success: true,
    message: 'تم إرسال مشاركتك وحفظها في قاعدة البيانات السحابية بنجاح!',
    submission: newSubmission
  });
});

// Update submission review status (Protected)
app.patch('/api/submissions/:id/status', requireTeacherAuth, (req, res) => {
  const { id } = req.params;
  const { status, feedback } = req.body;
  const teacher = (req as any).teacher;

  const validStatuses = ['pending', 'approved', 'featured', 'archived'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: 'حالة غير صالحة' });
    return;
  }

  const db = loadDb();
  const subIndex = db.submissions.findIndex((s) => s.id === id);
  if (subIndex === -1) {
    res.status(404).json({ error: 'المشاركة غير موجودة' });
    return;
  }

  db.submissions[subIndex].status = status;
  db.submissions[subIndex].reviewedBy = teacher.displayName;
  db.submissions[subIndex].reviewedAt = new Date().toISOString();
  if (feedback !== undefined) {
    db.submissions[subIndex].feedback = feedback;
  }

  saveDb(db);

  res.json({
    success: true,
    message: 'تم تحديث حالة المشاركة بنجاح في قاعدة البيانات',
    submission: db.submissions[subIndex]
  });
});

// Delete submission (Protected)
app.delete('/api/submissions/:id', requireTeacherAuth, (req, res) => {
  const { id } = req.params;
  const db = loadDb();
  const initialLen = db.submissions.length;
  db.submissions = db.submissions.filter((s) => s.id !== id);

  if (db.submissions.length === initialLen) {
    res.status(404).json({ error: 'المشاركة غير موجودة' });
    return;
  }

  saveDb(db);
  res.json({ success: true, message: 'تم حذف المشاركة من قاعدة البيانات بنجاح' });
});

// 4. Surveys API
// Submit a survey (pre or post)
app.post('/api/surveys', (req, res) => {
  const { studentName, grade, surveyType, q1, q2, q3, q4, q5, notes } = req.body;

  if (!studentName || !grade || !surveyType) {
    res.status(400).json({ error: 'جميع البيانات الأساسية للاستبانة مطلوبة' });
    return;
  }

  if (surveyType !== 'pre' && surveyType !== 'post') {
    res.status(400).json({ error: 'نوع الاستبانة يجب أن يكون قبلية أو بعدية' });
    return;
  }

  const db = loadDb();
  const cleanName = studentName.trim();
  const now = new Date();

  // Prevent multiple identical surveys within 30 seconds
  const existingRecent = db.surveys.find(
    (s) =>
      s.studentName.toLowerCase() === cleanName.toLowerCase() &&
      s.surveyType === surveyType &&
      now.getTime() - new Date(s.createdAt).getTime() < 30000
  );

  if (existingRecent) {
    res.status(429).json({ error: 'تم حفظ استجابتك بالفعل للاستبانة!' });
    return;
  }

  const record: SurveyRecord = {
    id: `SRV-${surveyType.toUpperCase()}-${Date.now().toString(36)}`,
    studentName: cleanName,
    grade: grade.trim(),
    surveyType,
    q1: Number(q1) || 3,
    q2: Number(q2) || 3,
    q3: Number(q3) || 3,
    q4: Number(q4) || 3,
    q5: Number(q5) || 3,
    notes: notes ? String(notes).trim() : undefined,
    createdAt: now.toISOString()
  };

  db.surveys.push(record);
  saveDb(db);

  res.status(201).json({
    success: true,
    message: 'تم حفظ استجابة الاستبانة بنجاح في قاعدة البيانات',
    survey: record
  });
});

// Get Survey Analytics (Computed directly from real database records)
app.get('/api/surveys/stats', (req, res) => {
  const db = loadDb();
  const preSurveys = db.surveys.filter((s) => s.surveyType === 'pre');
  const postSurveys = db.surveys.filter((s) => s.surveyType === 'post');

  const calcAverage = (list: SurveyRecord[], key: keyof Pick<SurveyRecord, 'q1' | 'q2' | 'q3' | 'q4' | 'q5'>) => {
    if (list.length === 0) return 0;
    const sum = list.reduce((acc, curr) => acc + curr[key], 0);
    return parseFloat((sum / list.length).toFixed(2));
  };

  const metrics = [
    {
      id: 'q1',
      question: 'معرفة نص المادة 34 من النظام الأساسي للحكم',
      preAvg: calcAverage(preSurveys, 'q1'),
      postAvg: calcAverage(postSurveys, 'q1')
    },
    {
      id: 'q2',
      question: 'استيعاب أبعاد الدفاع عن العقيدة والمجتمع والوطن',
      preAvg: calcAverage(preSurveys, 'q2'),
      postAvg: calcAverage(postSurveys, 'q2')
    },
    {
      id: 'q3',
      question: 'الشعور بالمسؤولية الوطنية كدرع حامٍ للوطن',
      preAvg: calcAverage(preSurveys, 'q3'),
      postAvg: calcAverage(postSurveys, 'q3')
    },
    {
      id: 'q4',
      question: 'إدراك دور المرأة والفتاة السعودية في الدفاع الفكري والوطني',
      preAvg: calcAverage(preSurveys, 'q4'),
      postAvg: calcAverage(postSurveys, 'q4')
    },
    {
      id: 'q5',
      question: 'الاستعداد للمبادرة والتطوع في خدمة الوطن والمجتمع',
      preAvg: calcAverage(preSurveys, 'q5'),
      postAvg: calcAverage(postSurveys, 'q5')
    }
  ];

  // Overall impact calculation
  const overallPre = preSurveys.length > 0
    ? parseFloat((metrics.reduce((acc, m) => acc + m.preAvg, 0) / metrics.length).toFixed(2))
    : 0;

  const overallPost = postSurveys.length > 0
    ? parseFloat((metrics.reduce((acc, m) => acc + m.postAvg, 0) / metrics.length).toFixed(2))
    : 0;

  const growthPercentage = overallPre > 0 && overallPost > 0
    ? parseFloat((((overallPost - overallPre) / overallPre) * 100).toFixed(1))
    : 0;

  res.json({
    totalPre: preSurveys.length,
    totalPost: postSurveys.length,
    totalResponses: db.surveys.length,
    metrics,
    overallPre,
    overallPost,
    growthPercentage,
    hasData: db.surveys.length > 0
  });
});

// 5. Students & Badges
app.get('/api/students', (req, res) => {
  const db = loadDb();

  // Aggregate unique students
  const studentMap = new Map<string, {
    name: string;
    grade: string;
    submissionCount: number;
    surveysCount: number;
    badges: StudentBadge[];
    lastActive: string;
  }>();

  for (const s of db.submissions) {
    const key = `${s.studentName.trim()}__${s.grade.trim()}`.toLowerCase();
    if (!studentMap.has(key)) {
      studentMap.set(key, {
        name: s.studentName.trim(),
        grade: s.grade.trim(),
        submissionCount: 0,
        surveysCount: 0,
        badges: [],
        lastActive: s.createdAt
      });
    }
    const item = studentMap.get(key)!;
    item.submissionCount++;
    if (new Date(s.createdAt) > new Date(item.lastActive)) {
      item.lastActive = s.createdAt;
    }
  }

  for (const s of db.surveys) {
    const key = `${s.studentName.trim()}__${s.grade.trim()}`.toLowerCase();
    if (!studentMap.has(key)) {
      studentMap.set(key, {
        name: s.studentName.trim(),
        grade: s.grade.trim(),
        submissionCount: 0,
        surveysCount: 0,
        badges: [],
        lastActive: s.createdAt
      });
    }
    const item = studentMap.get(key)!;
    item.surveysCount++;
    if (new Date(s.createdAt) > new Date(item.lastActive)) {
      item.lastActive = s.createdAt;
    }
  }

  // Attach badges
  for (const b of db.badges) {
    const key = `${b.studentName.trim()}__${b.grade.trim()}`.toLowerCase();
    const item = studentMap.get(key);
    if (item) {
      item.badges.push(b);
    }
  }

  const list = Array.from(studentMap.values()).sort(
    (a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
  );

  res.json({
    totalStudents: list.length,
    students: list
  });
});

// Award badge to student
app.post('/api/badges/award', (req, res) => {
  const { studentName, grade, badgeId, badgeTitle, iconName, reason } = req.body;

  if (!studentName || !grade || !badgeId) {
    res.status(400).json({ error: 'بيانات الشارة غير مكتملة' });
    return;
  }

  const db = loadDb();
  const cleanName = studentName.trim();
  const cleanGrade = grade.trim();

  // Check if student already has this badge
  const alreadyHas = db.badges.some(
    (b) =>
      b.studentName.toLowerCase() === cleanName.toLowerCase() &&
      b.grade.toLowerCase() === cleanGrade.toLowerCase() &&
      b.badgeId === badgeId
  );

  if (alreadyHas) {
    res.json({
      success: true,
      message: 'الشارة ممنوحة مسبقاً للطالبة',
      alreadyAwarded: true
    });
    return;
  }

  const newBadge: StudentBadge = {
    id: `BDG-${Date.now().toString(36)}`,
    studentName: cleanName,
    grade: cleanGrade,
    badgeId,
    badgeTitle: badgeTitle || 'وسام حامية الوطن',
    iconName: iconName || 'Shield',
    reason: reason || 'إتمام نشاط تفاعلي في منصة درع الوطن',
    awardedAt: new Date().toISOString()
  };

  db.badges.push(newBadge);
  saveDb(db);

  res.status(201).json({
    success: true,
    message: 'تم منح الشارة وحفظها في السجل السحابي بنجاح',
    badge: newBadge
  });
});

// Get badges list
app.get('/api/badges', (req, res) => {
  const db = loadDb();
  res.json({
    totalBadges: db.badges.length,
    badges: db.badges
  });
});

// Get badges for a specific student with automatic milestones evaluation
app.get('/api/badges/student', (req, res) => {
  const { name, grade } = req.query;
  const db = loadDb();
  if (!name) {
    res.json({ total: 0, badges: [] });
    return;
  }
  const cleanName = String(name).trim().toLowerCase();
  const cleanGrade = grade ? String(grade).trim().toLowerCase() : '';

  let studentBadges = db.badges.filter((b) => {
    const matchName = b.studentName.toLowerCase() === cleanName;
    if (!cleanGrade) return matchName;
    return matchName && b.grade.toLowerCase() === cleanGrade;
  });

  // Evaluate Grand Shield Master milestone
  const hasSubmission = db.submissions.some((s) => s.studentName.toLowerCase() === cleanName);
  const hasSurveys = db.surveys.some((s) => s.studentName.toLowerCase() === cleanName);
  const hasGrandBadge = studentBadges.some((b) => b.badgeId === 'grand_shield_master');

  if (hasSubmission && hasSurveys && !hasGrandBadge) {
    const grandBadge: StudentBadge = {
      id: `BDG-GRAND-${Date.now().toString(36)}`,
      studentName: String(name).trim(),
      grade: grade ? String(grade).trim() : 'المرحلة الثانوية',
      badgeId: 'grand_shield_master',
      badgeTitle: 'وسام درع الوطن الذهبي الشامل',
      iconName: 'Crown',
      reason: 'التميز الوطني المتكامل وإتمام محاور الاستبانة والمشاركات في مبادرة درع الوطن',
      awardedAt: new Date().toISOString()
    };
    db.badges.push(grandBadge);
    saveDb(db);
    studentBadges.push(grandBadge);
  }

  res.json({
    studentName: name,
    grade,
    total: studentBadges.length,
    badges: studentBadges
  });
});

// 6. Upload API (for canvas drawings and files)
app.post('/api/upload', (req, res) => {
  const { dataUrl, filename } = req.body;

  if (!dataUrl || !dataUrl.startsWith('data:image/')) {
    res.status(400).json({ error: 'تنسيق الصورة غير صالح' });
    return;
  }

  try {
    const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      res.status(400).json({ error: 'تعذر معالجة تشفير الصورة' });
      return;
    }

    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const safeName = `drawing_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${safeName}`;
    res.json({
      success: true,
      url: publicUrl,
      size: buffer.length
    });
  } catch (err) {
    console.error('Error saving upload:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء حفظ الملف على الخادم' });
  }
});

// 7. CSV Export for Excel (Full database export with BOM for Arabic support)
app.get('/api/export/csv', requireTeacherAuth, (req, res) => {
  const db = loadDb();

  // UTF-8 BOM
  let csv = '\uFEFF';
  csv += 'رقم المشاركة,اسم الطالبة,الفصل الدراسي,نوع المشاركة,عنوان المشاركة,تاريخ الإرسال,حالة المراجعة,تمت المراجعة بواسطة,ملاحظات المعلمة,محتوى المشاركة / رابط الملف\r\n';

  for (const s of db.submissions) {
    const row = [
      `"${s.id}"`,
      `"${s.studentName.replace(/"/g, '""')}"`,
      `"${s.grade.replace(/"/g, '""')}"`,
      `"${s.type}"`,
      `"${s.title.replace(/"/g, '""')}"`,
      `"${new Date(s.createdAt).toLocaleString('ar-SA')}"`,
      `"${s.status}"`,
      `"${(s.reviewedBy || '-').replace(/"/g, '""')}"`,
      `"${(s.feedback || '-').replace(/"/g, '""')}"`,
      `"${(s.fileUrl || s.content).replace(/"/g, '""').replace(/\n/g, ' ')}"`
    ];
    csv += row.join(',') + '\r\n';
  }

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="deraa_alwatan_submissions_${new Date().toISOString().slice(0, 10)}.csv"`);
  res.status(200).send(csv);
});

// ----------------- DAILY SHIELD MISSIONS API -----------------

function getWeekKey(dateStr?: string): string {
  const d = dateStr ? new Date(dateStr) : new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  return `${d.getFullYear()}-W${weekNum}`;
}

// Complete Daily Mission
app.post('/api/missions/complete', (req, res) => {
  const { studentName, grade, missionId, missionTitle, points, isCorrect, dateStr } = req.body;

  if (!studentName || !grade || !missionId) {
    res.status(400).json({ error: 'بيانات المهمة غير مكتملة' });
    return;
  }

  const cleanName = String(studentName).trim();
  const cleanGrade = String(grade).trim();
  const todayDate = dateStr || new Date().toISOString().slice(0, 10);

  const db = loadDb();

  // Check if student already completed this mission on this day (No repeating same day)
  const alreadyDone = db.missionCompletions.some(
    (m) =>
      m.studentName.toLowerCase() === cleanName.toLowerCase() &&
      m.grade.toLowerCase() === cleanGrade.toLowerCase() &&
      m.dateStr === todayDate
  );

  if (alreadyDone) {
    res.json({
      success: false,
      alreadyCompleted: true,
      message: 'لقد أكملتِ مهمة اليوم بالفعل! تعالي غداً لاكتشاف التحدي الجديد والمساهمة في درع فصلكِ.'
    });
    return;
  }

  const completionPoints = isCorrect ? (points || 25) : Math.round((points || 25) / 2);
  const newCompletion: StudentMissionCompletion = {
    id: `MIS-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    studentName: cleanName,
    grade: cleanGrade,
    missionId,
    missionTitle: missionTitle || 'مهمة درع الوطن اليومية',
    dateStr: todayDate,
    pointsEarned: completionPoints,
    isCorrect: !!isCorrect,
    completedAt: new Date().toISOString()
  };

  db.missionCompletions.push(newCompletion);

  // Check for Milestone Badges:
  // 1. «سفيرة الوعي»
  // 2. «حامية القيم»
  // 3. «نجمة المشاركة»
  // 4. «صانعة الأثر»
  const studentCompletions = db.missionCompletions.filter(
    (m) => m.studentName.toLowerCase() === cleanName.toLowerCase() && m.grade.toLowerCase() === cleanGrade.toLowerCase()
  );

  const studentBadges = db.badges.filter(
    (b) => b.studentName.toLowerCase() === cleanName.toLowerCase() && b.grade.toLowerCase() === cleanGrade.toLowerCase()
  );

  const awardedBadges: StudentBadge[] = [];

  const awardBadgeIfMissing = (badgeId: string, badgeTitle: string, iconName: string, reason: string) => {
    if (!studentBadges.some((b) => b.badgeId === badgeId)) {
      const newBadge: StudentBadge = {
        id: `BDG-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        studentName: cleanName,
        grade: cleanGrade,
        badgeId,
        badgeTitle,
        iconName,
        reason,
        awardedAt: new Date().toISOString()
      };
      db.badges.push(newBadge);
      studentBadges.push(newBadge);
      awardedBadges.push(newBadge);
    }
  };

  if (studentCompletions.length >= 1) {
    awardBadgeIfMissing(
      'ambassador_awareness',
      'سفيرة الوعي',
      'Compass',
      'اجتياز مهمة الوعي الدستوري وإتقان مضامين المادة 34 من النظام الأساسي للحكم'
    );
  }

  if (studentCompletions.length >= 2) {
    awardBadgeIfMissing(
      'values_guardian',
      'حامية القيم',
      'Shield',
      'إكمال مهمات التصدي للشائعات الرقمية وصيانة قيم المجتمع وثوابته الوطنية'
    );
  }

  if (studentCompletions.length >= 3) {
    awardBadgeIfMissing(
      'participation_star',
      'نجمة المشاركة',
      'Star',
      'المثابرة والاستمرارية في إنجاز 3 مهمات من مهمات درع الوطن اليومية'
    );
  }

  if (studentCompletions.length >= 5) {
    awardBadgeIfMissing(
      'impact_maker',
      'صانعة الأثر',
      'Award',
      'تحقيق ريادة استثنائية في مهمات درع الوطن والمساهمة الفاعلة في دعم الفصل والمدرسة'
    );
  }

  saveDb(db);

  // Calculate current week count
  const currentWeekKey = getWeekKey(todayDate);
  const weeklyMissions = studentCompletions.filter((m) => getWeekKey(m.dateStr) === currentWeekKey);
  const hasClaimedWeeklyBox = db.claimedBoxes.some(
    (c) => c.studentName.toLowerCase() === cleanName.toLowerCase() && c.weekKey === currentWeekKey
  );

  res.json({
    success: true,
    completion: newCompletion,
    pointsEarned: completionPoints,
    totalMissions: studentCompletions.length,
    newBadges: awardedBadges,
    weeklyMissionsCount: weeklyMissions.length,
    canClaimWeeklyBox: weeklyMissions.length >= 3 && !hasClaimedWeeklyBox
  });
});

// Get Student Daily Missions Progress
app.get('/api/missions/student', (req, res) => {
  const { name, grade } = req.query;
  if (!name) {
    res.json({
      totalPoints: 0,
      completedMissionsCount: 0,
      completedDates: [],
      currentStreak: 0,
      unlockedBadges: [],
      unlockedStations: 1,
      weeklyBoxClaimed: false,
      weeklyMissionsCount: 0,
      completions: []
    });
    return;
  }

  const cleanName = String(name).trim().toLowerCase();
  const cleanGrade = grade ? String(grade).trim().toLowerCase() : '';

  const db = loadDb();

  const studentCompletions = db.missionCompletions.filter((m) => {
    const match = m.studentName.toLowerCase() === cleanName;
    if (!cleanGrade) return match;
    return match && m.grade.toLowerCase() === cleanGrade;
  });

  const todayStr = new Date().toISOString().slice(0, 10);
  const completedToday = studentCompletions.some((m) => m.dateStr === todayStr);

  const totalMissionPoints = studentCompletions.reduce((acc, c) => acc + (c.pointsEarned || 0), 0);

  const currentWeekKey = getWeekKey(todayStr);
  const weeklyBoxRecord = db.claimedBoxes.find(
    (c) => c.studentName.toLowerCase() === cleanName && c.weekKey === currentWeekKey
  );

  const boxBonusPoints = db.claimedBoxes
    .filter((c) => c.studentName.toLowerCase() === cleanName)
    .reduce((acc, c) => acc + (c.bonusPoints || 0), 0);

  const totalPoints = totalMissionPoints + boxBonusPoints;

  const weeklyMissions = studentCompletions.filter((m) => getWeekKey(m.dateStr) === currentWeekKey);

  // Compute stations unlocked (stations 1 to 6)
  // Station 1: 0, Station 2: 40, Station 3: 80, Station 4: 120, Station 5: 160, Station 6: 200
  let unlockedStations = 1;
  if (totalPoints >= 200) unlockedStations = 6;
  else if (totalPoints >= 160) unlockedStations = 5;
  else if (totalPoints >= 120) unlockedStations = 4;
  else if (totalPoints >= 80) unlockedStations = 3;
  else if (totalPoints >= 40) unlockedStations = 2;

  // Compute streak
  const sortedDates = Array.from(new Set(studentCompletions.map((c) => c.dateStr))).sort().reverse();
  let currentStreak = 0;
  if (sortedDates.length > 0) {
    let checkDate = new Date();
    if (!completedToday) {
      // Allow yesterday's completion to keep streak alive
      checkDate.setDate(checkDate.getDate() - 1);
    }
    for (const dStr of sortedDates) {
      const expected = checkDate.toISOString().slice(0, 10);
      if (dStr === expected) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  res.json({
    studentName: name,
    grade,
    totalPoints,
    completedMissionsCount: studentCompletions.length,
    completedToday,
    completedDates: sortedDates,
    currentStreak,
    unlockedStations,
    weeklyBoxClaimed: !!weeklyBoxRecord,
    weeklyMissionsCount: weeklyMissions.length,
    canClaimWeeklyBox: weeklyMissions.length >= 3 && !weeklyBoxRecord,
    completions: studentCompletions
  });
});

// Claim Weekly Surprise Box
app.post('/api/missions/claim-box', (req, res) => {
  const { studentName, grade } = req.body;
  if (!studentName || !grade) {
    res.status(400).json({ error: 'الاسم والفصل مطلوبان' });
    return;
  }

  const cleanName = String(studentName).trim();
  const cleanGrade = String(grade).trim();
  const todayStr = new Date().toISOString().slice(0, 10);
  const currentWeekKey = getWeekKey(todayStr);

  const db = loadDb();

  const studentCompletions = db.missionCompletions.filter(
    (m) => m.studentName.toLowerCase() === cleanName.toLowerCase() && m.grade.toLowerCase() === cleanGrade.toLowerCase()
  );

  const weeklyMissions = studentCompletions.filter((m) => getWeekKey(m.dateStr) === currentWeekKey);

  if (weeklyMissions.length < 3) {
    res.status(400).json({
      error: `تحتاجين لإكمال 3 مهمات على الأقل هذا الأسبوع لفتح الصندوق (أكملتِ ${weeklyMissions.length} مهمات).`
    });
    return;
  }

  const alreadyClaimed = db.claimedBoxes.some(
    (c) => c.studentName.toLowerCase() === cleanName.toLowerCase() && c.weekKey === currentWeekKey
  );

  if (alreadyClaimed) {
    res.status(400).json({ error: 'تم فتح صندوق هذا الأسبوع مسبقاً! ترقبي صندوق الأسبوع القادم.' });
    return;
  }

  const bonusPoints = 50;
  const newClaim: ClaimedWeeklyBox = {
    id: `BOX-${Date.now().toString(36)}`,
    studentName: cleanName,
    grade: cleanGrade,
    weekKey: currentWeekKey,
    bonusPoints,
    claimedAt: new Date().toISOString()
  };

  db.claimedBoxes.push(newClaim);
  saveDb(db);

  res.json({
    success: true,
    bonusPoints,
    message: 'مبارك يا بطلة درع الوطن! فتحتِ صندوق مفاجآت الأسبوع بنجاح ونلتِ 50 نقطة درع إضافية وشهادة فخر من المعلمتين أمل رشيد ووفاء الزهراني!'
  });
});

// Class Collaborative Progress (Encouraging teamwork, zero shaming)
app.get('/api/missions/classes-progress', (req, res) => {
  const db = loadDb();
  const targetPerClass = 50; // Collective milestone goal

  const grades = [
    { label: 'الصف الأول ثانوي', match: (g: string) => g.includes('أول') || g.includes('اول') },
    { label: 'الصف الثاني ثانوي', match: (g: string) => g.includes('ثاني') },
    { label: 'الصف الثالث ثانوي', match: (g: string) => g.includes('ثالث') }
  ];

  const progress = grades.map(({ label, match }) => {
    const classCompletions = db.missionCompletions.filter((m) => match(m.grade.trim()));
    const count = classCompletions.length;
    const points = classCompletions.reduce((acc, c) => acc + (c.pointsEarned || 0), 0);
    const percentage = Math.min(100, Math.round((count / targetPerClass) * 100));

    let tier: 'برونزي' | 'فضي' | 'ذهبي' | 'ألماسي' = 'برونزي';
    if (percentage >= 100) tier = 'ألماسي';
    else if (percentage >= 75) tier = 'ذهبي';
    else if (percentage >= 50) tier = 'فضي';

    return {
      grade: label,
      targetMissions: targetPerClass,
      completedMissions: count,
      totalPoints: points,
      percentage,
      tier
    };
  });

  res.json({
    targetPerClass,
    classes: progress
  });
});

// Teacher Missions Statistics (for Amal Rashid & Wafa Al-Zahrani)
app.get('/api/missions/teacher-stats', (req, res) => {
  const db = loadDb();

  const totalMissionsCompleted = db.missionCompletions.length;
  const totalShieldPointsAwarded = db.missionCompletions.reduce((acc, m) => acc + (m.pointsEarned || 0), 0) +
    db.claimedBoxes.reduce((acc, b) => acc + (b.bonusPoints || 0), 0);

  const uniqueStudents = new Set(db.missionCompletions.map((m) => `${m.studentName.toLowerCase()}__${m.grade.toLowerCase()}`));

  const grades = [
    { label: 'الصف الأول ثانوي', match: (g: string) => g.includes('أول') || g.includes('اول') },
    { label: 'الصف الثاني ثانوي', match: (g: string) => g.includes('ثاني') },
    { label: 'الصف الثالث ثانوي', match: (g: string) => g.includes('ثالث') }
  ];

  const classBreakdown = grades.map(({ label, match }) => {
    const completions = db.missionCompletions.filter((m) => match(m.grade.trim()));
    const students = new Set(completions.map((m) => m.studentName.toLowerCase()));
    return {
      grade: label,
      completedCount: completions.length,
      points: completions.reduce((acc, c) => acc + (c.pointsEarned || 0), 0),
      studentsCount: students.size
    };
  });

  const topBadges = ['ambassador_awareness', 'values_guardian', 'participation_star', 'impact_maker'];
  const topBadgesAwarded = topBadges.map((badgeId) => {
    const count = db.badges.filter((b) => b.badgeId === badgeId).length;
    let title = 'وسام وطني';
    if (badgeId === 'ambassador_awareness') title = 'سفيرة الوعي';
    if (badgeId === 'values_guardian') title = 'حامية القيم';
    if (badgeId === 'participation_star') title = 'نجمة المشاركة';
    if (badgeId === 'impact_maker') title = 'صانعة الأثر';
    return { badgeId, badgeTitle: title, count };
  });

  res.json({
    totalMissionsCompleted,
    totalShieldPointsAwarded,
    activeStudentsCount: uniqueStudents.size,
    weeklyBoxesClaimedCount: db.claimedBoxes.length,
    classBreakdown,
    recentCompletions: db.missionCompletions.slice(-15).reverse(),
    topBadgesAwarded
  });
});

// Missions CSV Export for Teachers
app.get('/api/export/missions-csv', requireTeacherAuth, (req, res) => {
  const db = loadDb();

  let csv = '\uFEFF';
  csv += 'رقم المهمة,اسم الطالبة,الفصل الدراسي,عنوان المهمة,النقاط المكتسبة,حالة الإجابة,تاريخ الإنجاز,وقت الإنجاز\r\n';

  for (const m of db.missionCompletions) {
    const row = [
      `"${m.id}"`,
      `"${m.studentName.replace(/"/g, '""')}"`,
      `"${m.grade.replace(/"/g, '""')}"`,
      `"${m.missionTitle.replace(/"/g, '""')}"`,
      `${m.pointsEarned}`,
      `"${m.isCorrect ? 'صحيحة' : 'تحتاج مراجعة'}"`,
      `"${m.dateStr}"`,
      `"${new Date(m.completedAt).toLocaleString('ar-SA')}"`
    ];
    csv += row.join(',') + '\r\n';
  }

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="deraa_missions_report_${new Date().toISOString().slice(0, 10)}.csv"`);
  res.status(200).send(csv);
});

// ----------------- VITE INTEGRATION -----------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🛡️ منصة درع الوطن تعمل بنجاح على المنفذ ${PORT}`);
    console.log(`المدرسة: الثانوية الأولى بالبدع`);
    console.log(`إعداد وتنفيذ المعلمتين: أمل رشيد + وفاء الزهراني`);
  });
}

startServer();
