import React, { useState, useEffect, useMemo, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { api } from '../services/api';
import { Submission, SurveyAnalytics, StudentSummary, TeacherUser } from '../types';
import { SCHOOL_GRADES } from '../constants/grades';
import {
  Shield,
  LayoutDashboard,
  Users,
  FileText,
  ImageIcon,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Download,
  Printer,
  Trash2,
  Eye,
  LogOut,
  RefreshCw,
  Sparkles,
  BarChart3,
  Award,
  AlertCircle,
  PieChart as PieChartIcon,
  TrendingUp,
  Calendar,
  FileDown,
  Loader2
} from 'lucide-react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ResponsiveContainer
} from 'recharts';
import { getShieldTemplate } from '../constants/templates';
import { ShieldTextCard } from './ShieldTextCard';

interface TeacherDashboardProps {
  currentTeacher: TeacherUser | null;
  onLoginSuccess: (teacher: TeacherUser) => void;
  onLogout: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  currentTeacher,
  onLoginSuccess,
  onLogout
}) => {
  // Login form state
  const [username, setUsername] = useState('amal_rashid');
  const [password, setPassword] = useState('Amal@2026');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard views
  const [activeTab, setActiveTab] = useState<'charts' | 'submissions' | 'students' | 'analytics' | 'report'>('charts');

  // Data states
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [analytics, setAnalytics] = useState<SurveyAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Recharts Color Palette (Saudi National Emerald & Gold Harmony)
  const PIE_COLORS = [
    '#047857', // زمردي داكن
    '#d97706', // ذهبي ملكي
    '#059669', // أخضر سعودي
    '#b45309', // برونزي دافئ
    '#065f46', // أخضر غامق
    '#10b981', // أخضر ربيعي
    '#0284c7', // أزرق سماوي
    '#6366f1', // نيلي
    '#8b5cf6', // بنفسجي
    '#d946ef'  // وردي
  ];

  // 1. Distribution of submissions by academic grade (for Pie Chart)
  const gradeDistribution = useMemo(() => {
    const counts: { [grade: string]: number } = {};
    submissions.forEach((s) => {
      const g = s.grade?.trim() || 'غير محدد';
      counts[g] = (counts[g] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      percentage: submissions.length > 0 ? ((value / submissions.length) * 100).toFixed(1) : '0'
    }));
  }, [submissions]);

  // 2. Daily timeline of submissions count (for Timeline Chart)
  const dailyTimeline = useMemo(() => {
    const map: { [dateStr: string]: { count: number; dateObj: Date } } = {};

    submissions.forEach((s) => {
      const d = new Date(s.createdAt);
      // Group by YYYY-MM-DD
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!map[key]) {
        map[key] = { count: 0, dateObj: d };
      }
      map[key].count++;
    });

    const sortedKeys = Object.keys(map).sort();
    return sortedKeys.map((key) => {
      const item = map[key];
      const formattedDate = item.dateObj.toLocaleDateString('ar-SA', {
        month: 'short',
        day: 'numeric'
      });
      return {
        date: formattedDate,
        fullDate: key,
        مشاركات: item.count
      };
    });
  }, [submissions]);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Preview modal
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [teacherNote, setTeacherNote] = useState('');

  // Fetch all data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [subsRes, studentsRes, analyticsRes] = await Promise.all([
        api.getSubmissions({
          search: searchTerm || undefined,
          grade: gradeFilter !== 'all' ? gradeFilter : undefined,
          type: typeFilter !== 'all' ? typeFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined
        }),
        api.getStudents(),
        api.getSurveyAnalytics()
      ]);

      setSubmissions(subsRes.submissions);
      setStudents(studentsRes.students);
      setAnalytics(analyticsRes);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentTeacher) {
      fetchData();
    }
  }, [currentTeacher, searchTerm, gradeFilter, typeFilter, statusFilter]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await api.loginTeacher(username, password);
      onLoginSuccess(res.teacher);
    } catch (err: any) {
      setLoginError(err.message || 'بيانات الدخول غير صحيحة');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Quick Account Switch for preview
  const handleQuickLogin = async (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await api.loginTeacher(user, pass);
      onLoginSuccess(res.teacher);
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Update submission status
  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.updateSubmissionStatus(id, status, teacherNote || undefined);
      setFeedbackMsg('تم تحديث حالة المشاركة في السجل بنجاح');
      setTimeout(() => setFeedbackMsg(null), 3000);
      setSelectedSubmission(null);
      setTeacherNote('');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'فشل التحديث');
    }
  };

  // Delete submission
  const handleDeleteSubmission = async (id: string) => {
    if (!window.confirm('هل أنت متأكدة من حذف هذه المشاركة نهائياً من قاعدة البيانات السحابية؟')) {
      return;
    }
    try {
      await api.deleteSubmission(id);
      setFeedbackMsg('تم حذف المشاركة بنجاح');
      setTimeout(() => setFeedbackMsg(null), 3000);
      setSelectedSubmission(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'فشل الحذف');
    }
  };

  // Export CSV
  const handleDownloadCsv = () => {
    window.open(api.getExportCsvUrl(), '_blank');
  };

  // PDF Export ref & state
  const reportRef = useRef<HTMLDivElement | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    // If not in report tab, switch to it to ensure element exists
    if (activeTab !== 'report') {
      setActiveTab('report');
      await new Promise((r) => setTimeout(r, 200));
    }

    if (!reportRef.current) return;
    setIsExportingPdf(true);

    try {
      const element = reportRef.current;
      const opt = {
        margin: [8, 8, 8, 8],
        filename: `تقرير_إحصائيات_مبادرة_درع_الوطن_${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await (html2pdf as any)().set(opt).from(element).save();
      setFeedbackMsg('تم تصدير وتحميل تقرير الإحصائيات كملف PDF بنجاح!');
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch (err: any) {
      console.error('Error generating PDF:', err);
      // Fallback: window print dialog
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  // ----------------- LOGIN VIEW -----------------
  if (!currentTeacher) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6 text-right">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 text-amber-400 mx-auto flex items-center justify-center shadow-md border border-amber-400/40">
            <Shield className="w-7 h-7 fill-amber-400/20" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">بوابة الدخول الإداري</h2>
          <p className="text-xs text-slate-500">
            الثانوية الأولى بالبدع · مبادرة درع الوطن
          </p>
          <div className="text-xs font-semibold text-emerald-800 pt-1">
            مخصص للمعلمتين المخولتين: <span className="font-bold">أمل رشيد + وفاء الزهراني</span>
          </div>
        </div>

        {loginError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">اسم المستخدم:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="amal_rashid أو wafa_alzahrani"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">كلمة المرور:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخلي كلمة المرور..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-950 hover:from-emerald-700 hover:to-emerald-900 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4 text-amber-400" />
            <span>{isLoggingIn ? 'جارٍ التحقق...' : 'تسجيل الدخول إلى لوحة التحكم'}</span>
          </button>
        </form>

        {/* Quick Demo Accounts Switcher */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <p className="text-[11px] text-slate-500 text-center">
            اختيار الحساب السريع للمراجعة والتقييم:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('amal_rashid', 'Amal@2026')}
              className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold text-center cursor-pointer transition-colors"
            >
              <div>المعلمة أمل رشيد</div>
              <div className="text-[10px] text-emerald-700 font-normal">حساب إداري 1</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('wafa_alzahrani', 'Wafa@2026')}
              className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 text-xs font-bold text-center cursor-pointer transition-colors"
            >
              <div>المعلمة وفاء الزهراني</div>
              <div className="text-[10px] text-amber-800 font-normal">حساب إداري 2</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------- DASHBOARD MAIN VIEW -----------------
  const textSubmissionsCount = submissions.filter((s) => s.type === 'text').length;
  const drawingSubmissionsCount = submissions.filter((s) => s.type === 'drawing').length;
  const pendingCount = submissions.filter((s) => s.status === 'pending').length;

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Dashboard Top Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-950 text-white shadow-xl border border-amber-400/40">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-right">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <Shield className="w-4 h-4" />
              <span>الثانوية الأولى بالبدع · لوحة التحكم الإدارية</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              متابعة مشاركات مبادرة «درع الوطن»
            </h1>
            <p className="text-xs text-emerald-200">
              مرحباً بكِ: <strong className="text-amber-300">{currentTeacher.displayName}</strong> · إعداد وتنفيذ المعلمتين: <span className="text-white font-bold">أمل رشيد + وفاء الزهراني</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">تحديث</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm border border-emerald-600/50"
              title="تصدير تقرير الإحصائيات كملف PDF"
            >
              {isExportingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              ) : (
                <FileDown className="w-4 h-4 text-amber-400" />
              )}
              <span>تصدير PDF</span>
            </button>

            <button
              onClick={handleDownloadCsv}
              className="px-3.5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              title="تصدير إلى Excel"
            >
              <Download className="w-4 h-4" />
              <span>تصدير CSV</span>
            </button>

            <button
              onClick={onLogout}
              className="p-2.5 rounded-xl bg-red-900/60 hover:bg-red-800 text-red-200 text-xs flex items-center gap-1 transition-colors cursor-pointer"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold text-right shadow-xs">
          {feedbackMsg}
        </div>
      )}

      {/* KPI Real Database Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1 text-right">
          <span className="text-[11px] font-medium text-slate-500">الطالبات المشاركات</span>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
            {students.length}
          </div>
          <span className="text-[10px] text-emerald-700">بيانات فعلية</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1 text-right">
          <span className="text-[11px] font-medium text-slate-500">إجمالي المشاركات</span>
          <div className="text-2xl font-extrabold text-emerald-800 font-mono tabular-nums">
            {submissions.length}
          </div>
          <span className="text-[10px] text-slate-400">في قاعدة البيانات</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1 text-right">
          <span className="text-[11px] font-medium text-slate-500">المشاركات النصية</span>
          <div className="text-2xl font-extrabold text-blue-700 font-mono tabular-nums">
            {textSubmissionsCount}
          </div>
          <span className="text-[10px] text-slate-400">رسائل وخواطر</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1 text-right">
          <span className="text-[11px] font-medium text-slate-500">اللوحات والرسومات</span>
          <div className="text-2xl font-extrabold text-amber-700 font-mono tabular-nums">
            {drawingSubmissionsCount}
          </div>
          <span className="text-[10px] text-slate-400">ملفات مرفوعة</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1 text-right">
          <span className="text-[11px] font-medium text-slate-500">الاستبانات المكتملة</span>
          <div className="text-2xl font-extrabold text-emerald-700 font-mono tabular-nums">
            {analytics?.totalResponses || 0}
          </div>
          <span className="text-[10px] text-slate-400">قبلية وبعدية</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1 text-right">
          <span className="text-[11px] font-medium text-slate-500">بانتظار المراجعة</span>
          <div className="text-2xl font-extrabold text-red-600 font-mono tabular-nums">
            {pendingCount}
          </div>
          <span className="text-[10px] text-slate-400">تتطلب تدقيقاً</span>
        </div>
      </div>

      {/* Navigation Tabs inside Dashboard */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('charts')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'charts'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <PieChartIcon className="w-4 h-4 text-amber-400" />
          <span>لوحة البيانات المرئية (المخططات)</span>
        </button>

        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'submissions'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>سجل المشاركات ({submissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'students'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>سجل الطالبات والفصول ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>قياس الأثر والاستبانات</span>
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'report'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>التقرير الرسمي للطباعة</span>
        </button>
      </div>

      {/* TAB 0: RECHARTS VISUAL DASHBOARD */}
      {activeTab === 'charts' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="space-y-1 text-right">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                <span>لوحة البيانات المرئية والتحليل الإحصائي (Recharts)</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                المخططات البيانية لتوزيع الفصول والخط الزمني للمشاركات
              </h3>
              <p className="text-xs text-slate-500">
                قراءة فورية محسوبة من قاعدة البيانات السحابية الفعلية لمبادرة درع الوطن بالثانوية الأولى بالبدع.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>إجمالي السجلات المسجلة:</span>
              <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                {submissions.length} مشاركة
              </span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Pie Chart (Grade Distribution) */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="space-y-0.5 text-right">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <PieChartIcon className="w-4 h-4 text-emerald-700" />
                    <span>المخطط الدائري</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    توزيع المشاركات حسب الفصول الدراسية
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {gradeDistribution.length} فصول مشاركة
                </span>
              </div>

              {submissions.length === 0 ? (
                <div className="h-72 flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                  <PieChartIcon className="w-12 h-12 text-slate-300 stroke-1" />
                  <p className="text-xs font-semibold text-slate-600">لا توجد مشاركات مسجلة حالياً</p>
                  <p className="text-[11px] text-slate-400 max-w-xs">
                    سيتم رسم المخطط الدائري تلقائياً فور إرسال الطالبات لمشاركاتهن من بوابة الطالبة.
                  </p>
                </div>
              ) : (
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={gradeDistribution}
                        cx="50%"
                        cy="45%"
                        innerRadius={65}
                        outerRadius={105}
                        paddingAngle={4}
                        dataKey="value"
                        nameKey="name"
                        label={({ percent }) => (percent && percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : '')}
                        labelLine={false}
                      >
                        {gradeDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                            stroke="#ffffff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(value: any, name: any) => [`${value} مشاركة`, `${name}`]}
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          direction: 'rtl',
                          textAlign: 'right',
                          fontSize: '12px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                      />
                      <RechartsLegend
                        verticalAlign="bottom"
                        wrapperStyle={{ paddingTop: '16px', fontSize: '11px', direction: 'rtl' }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Chart 2: Timeline Line/Area Chart */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="space-y-0.5 text-right">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span>الخط الزمني التراكمي</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    الخط الزمني لعدد المشاركات اليومي
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {dailyTimeline.length} أيام نشاط
                </span>
              </div>

              {submissions.length === 0 ? (
                <div className="h-72 flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                  <TrendingUp className="w-12 h-12 text-slate-300 stroke-1" />
                  <p className="text-xs font-semibold text-slate-600">لا توجد بيانات زمنية حتى الآن</p>
                  <p className="text-[11px] text-slate-400 max-w-xs">
                    سيظهر المسار الزمني اليومي فور استقبال المشاركات من الطالبات.
                  </p>
                </div>
              ) : (
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={dailyTimeline}
                      margin={{ top: 20, right: 20, left: -15, bottom: 10 }}
                    >
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#047857" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#047857" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="date"
                        stroke="#94a3b8"
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        stroke="#94a3b8"
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        tickLine={false}
                      />
                      <RechartsTooltip
                        formatter={(val: any) => [`${val} مشاركة`, 'عدد المشاركات']}
                        labelFormatter={(label) => `التاريخ: ${label}`}
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          direction: 'rtl',
                          textAlign: 'right',
                          fontSize: '12px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="مشاركات"
                        stroke="#047857"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorCount)"
                        dot={{ r: 4, fill: '#047857', stroke: '#ffffff', strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: '#d97706', stroke: '#ffffff', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Breakdown Table by Grade */}
          {submissions.length > 0 && (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-slate-900 text-right">
                جدول النسب والمشاركات التفصيلية لكل فصل دراسي:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {gradeDistribution.map((item, idx) => (
                  <div
                    key={item.name}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                      />
                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-900">{item.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {item.value} مشاركة ({item.percentage}%)
                        </div>
                      </div>
                    </div>
                    <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: PIE_COLORS[idx % PIE_COLORS.length]
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 1: SUBMISSIONS TABLE & REVIEW */}
      {activeTab === 'submissions' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
          {/* Search & Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="البحث باسم الطالبة أو العنوان..."
                className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>

            <div>
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-700 focus:outline-hidden"
              >
                <option value="all">جميع الفصول الدراسية</option>
                {SCHOOL_GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-700 focus:outline-hidden"
              >
                <option value="all">جميع أنواع المشاركات</option>
                <option value="text">مشاركات نصية</option>
                <option value="drawing">لوحات ورسومات</option>
                <option value="pledge">ميثاق العهد</option>
                <option value="quiz">اختبار الوعي</option>
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-700 focus:outline-hidden"
              >
                <option value="all">جميع حالات المراجعة</option>
                <option value="pending">بانتظار المراجعة (جديد)</option>
                <option value="approved">مقبولة ومُعتمدة</option>
                <option value="featured">مميزة للمعرض</option>
                <option value="archived">مؤرشفة</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {submissions.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <FileText className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-semibold">لا توجد مشاركات مسجلة تطابق معايير البحث الحالية</p>
              <p className="text-xs text-slate-400">ستظهر مشاركات الطالبات هنا فور إرسالها من واجهة الطالبة.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                    <th className="py-3 px-3 font-semibold">رقم التوثيق</th>
                    <th className="py-3 px-3 font-semibold">اسم الطالبة</th>
                    <th className="py-3 px-3 font-semibold">الفصل الدراسي</th>
                    <th className="py-3 px-3 font-semibold">النوع</th>
                    <th className="py-3 px-3 font-semibold">العنوان والمحتوى</th>
                    <th className="py-3 px-3 font-semibold">تاريخ الإرسال</th>
                    <th className="py-3 px-3 font-semibold">حالة المراجعة</th>
                    <th className="py-3 px-3 font-semibold text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-700">{sub.id}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{sub.studentName}</td>
                      <td className="py-3 px-3 text-slate-600">{sub.grade}</td>
                      <td className="py-3 px-3">
                        <span className="text-[11px] font-bold text-slate-800">
                          {sub.type === 'text' && 'مشاركة نصية'}
                          {sub.type === 'drawing' && 'رسمة فنية'}
                          {sub.type === 'pledge' && 'ميثاق'}
                          {sub.type === 'quiz' && 'مسابقة'}
                        </span>
                        {sub.backgroundTemplate && (
                          <div className="text-[10px] text-emerald-800 font-semibold mt-0.5 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 inline-block" />
                            <span className="truncate max-w-[110px]" title={getShieldTemplate(sub.backgroundTemplate).name}>
                              {getShieldTemplate(sub.backgroundTemplate).name}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 max-w-xs truncate text-slate-700">
                        <span className="font-semibold">{sub.title}: </span>
                        {sub.content}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(sub.createdAt).toLocaleDateString('ar-SA')} {new Date(sub.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="text-[11px] font-bold">
                          {sub.status === 'pending' && <span className="text-amber-700">جديد لم يراجع</span>}
                          {sub.status === 'approved' && <span className="text-emerald-700">مقبولة ✓</span>}
                          {sub.status === 'featured' && <span className="text-purple-700">مميزة ★</span>}
                          {sub.status === 'archived' && <span className="text-slate-500">مؤرشفة</span>}
                        </span>
                        {sub.reviewedBy && (
                          <div className="text-[10px] text-slate-400">بواسطة: {sub.reviewedBy}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSubmission(sub);
                              setTeacherNote(sub.feedback || '');
                            }}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                            title="معاينة وقبول"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteSubmission(sub.id)}
                            className="p-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors cursor-pointer"
                            title="حذف نهائي"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STUDENTS DIRECTORY */}
      {activeTab === 'students' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">سجل الطالبات المشاركات في مبادرة درع الوطن</h3>
            <p className="text-xs text-slate-500">
              قائمة فعلية بالطالبات المسجلات في قاعدة البيانات السحابية مع إجمالي مشاركاتهن وأوسمتهن المكتسبة.
            </p>
          </div>

          {students.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              لا توجد طالبات مسجلات حتى الآن.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                    <th className="py-3 px-3 font-semibold">اسم الطالبة</th>
                    <th className="py-3 px-3 font-semibold">الفصل الدراسي</th>
                    <th className="py-3 px-3 font-semibold">المشاركات</th>
                    <th className="py-3 px-3 font-semibold">الاستبانات</th>
                    <th className="py-3 px-3 font-semibold">الأوسمة والشارات المكتسبة</th>
                    <th className="py-3 px-3 font-semibold">آخر نشاط</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((st, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-bold text-slate-900">{st.name}</td>
                      <td className="py-3 px-3 text-slate-700">{st.grade}</td>
                      <td className="py-3 px-3 font-mono tabular-nums text-emerald-800 font-bold">{st.submissionCount}</td>
                      <td className="py-3 px-3 font-mono tabular-nums text-blue-800">{st.surveysCount}</td>
                      <td className="py-3 px-3">
                        {st.badges.length === 0 ? (
                          <span className="text-slate-400">لا توجد أوسمة بعد</span>
                        ) : (
                          <div className="flex flex-wrap gap-1 text-[11px] text-emerald-800 font-medium">
                            {st.badges.map((b, idx) => (
                              <span key={idx}>
                                {b.badgeTitle} {idx < st.badges.length - 1 ? '·' : ''}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                        {new Date(st.lastActive).toLocaleDateString('ar-SA')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SURVEY ANALYTICS & IMPACT MEASUREMENT */}
      {activeTab === 'analytics' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">
              تحليل نتائج الاستبانات القبلية والبعدية وقياس الأثر
            </h3>
            <p className="text-xs text-slate-500">
              محسوبة مباشرة من قاعدة البيانات الفعلية وفق إجابات الطالبات (من 1 إلى 5).
            </p>
          </div>

          {!analytics || !analytics.hasData ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <BarChart3 className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-semibold">لا توجد استجابات كافية للاستبانات حتى الآن</p>
              <p className="text-xs text-slate-400">ستظهر المقارنات الإحصائية ونسب التطور فور تعبئة الطالبات للاستبانات.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div>
                  <span className="text-xs text-slate-500">الاستجابات القبلية</span>
                  <div className="text-2xl font-bold text-blue-700 font-mono tabular-nums">{analytics.totalPre}</div>
                </div>
                <div>
                  <span className="text-xs text-slate-500">الاستجابات البعدية</span>
                  <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">{analytics.totalPost}</div>
                </div>
                <div>
                  <span className="text-xs text-slate-500">المتوسط العام القبلي / 5</span>
                  <div className="text-2xl font-bold text-slate-800 font-mono tabular-nums">{analytics.overallPre}</div>
                </div>
                <div>
                  <span className="text-xs text-slate-500">المتوسط العام البعدي / 5</span>
                  <div className="text-2xl font-bold text-emerald-800 font-mono tabular-nums">{analytics.overallPost}</div>
                </div>
              </div>

              {/* Question By Question Comparison */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900">تفصيل المقارنة لكل محور دستوري:</h4>
                <div className="space-y-3">
                  {analytics.metrics.map((m) => (
                    <div key={m.id} className="p-4 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span>{m.question}</span>
                        <span className="font-mono text-emerald-800">
                          قبل: {m.preAvg} / 5 ← بعد: {m.postAvg} / 5
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                          <div
                            style={{ width: `${(m.preAvg / 5) * 100}%` }}
                            className="bg-blue-400 h-full"
                            title={`متوسط قبلي: ${m.preAvg}`}
                          />
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                          <div
                            style={{ width: `${(m.postAvg / 5) * 100}%` }}
                            className="bg-emerald-600 h-full"
                            title={`متوسط بعدي: ${m.postAvg}`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: OFFICIAL PRINTABLE & PDF REPORT */}
      {activeTab === 'report' && (
        <div className="space-y-6">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs no-print">
            <div className="space-y-0.5 text-right">
              <h4 className="text-sm font-bold text-slate-900">
                التقرير الإحصائي الرسمي المعتمد لمبادرة «درع الوطن»
              </h4>
              <p className="text-xs text-slate-500">
                جاهز للتصدير كملف PDF منظم وعالي الدقة أو للطباعة المباشرة.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isExportingPdf}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-950 hover:from-emerald-700 hover:to-emerald-900 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all border border-amber-400/30 disabled:opacity-50"
              >
                {isExportingPdf ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                ) : (
                  <FileDown className="w-4 h-4 text-amber-400" />
                )}
                <span>{isExportingPdf ? 'جارٍ إنشاء ملف PDF...' : 'تحميل التقرير كملف PDF'}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors border border-slate-200"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>طباعة التقرير</span>
              </button>
            </div>
          </div>

          {/* Official Formal Document for PDF & Print */}
          <div
            ref={reportRef}
            className="p-8 sm:p-12 bg-white rounded-3xl border-2 border-slate-300 shadow-xl space-y-8 text-right font-cairo text-slate-900"
          >
            {/* Formal Ministry/School Header with Logo and Date */}
            <div className="flex items-center justify-between border-b-2 border-emerald-900 pb-5">
              <div className="text-right text-xs space-y-1">
                <p className="font-bold text-slate-900 text-sm">المملكة العربية السعودية</p>
                <p className="text-slate-700 font-semibold">وزارة التعليم</p>
                <p className="text-slate-600">الإدارة العامة للتعليم</p>
                <p className="font-bold text-emerald-950 text-sm">الثانوية الأولى بالبدع</p>
              </div>

              {/* Center: Initiative Emblem Logo */}
              <div className="text-center space-y-1.5">
                <div className="relative inline-block">
                  <img
                    src="/src/assets/images/shield_of_nation_hero_1792473197101.jpg"
                    alt="شعار مبادرة درع الوطن"
                    className="w-16 h-16 rounded-full object-cover border-2 border-amber-500 shadow-md mx-auto"
                  />
                </div>
                <div className="text-xs font-black text-emerald-950">مبادرة «دِرْعُ الوَطَن»</div>
                <div className="text-[10px] text-amber-700 font-bold">المادة 34 من النظام الأساسي للحكم</div>
              </div>

              {/* Left: Metadata & Date */}
              <div className="text-left text-xs space-y-1 font-mono">
                <p className="text-slate-800 font-bold">
                  تاريخ التقرير: {new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-slate-500 text-[11px]">الموافق: {new Date().toISOString().slice(0, 10)} م</p>
                <p className="text-emerald-800 font-bold text-[11px]">رقم الوثيقة: REP-2026-BD</p>
                <p className="text-slate-600 text-[11px]">حالة الوثيقة: معتمد رسمياً ✓</p>
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="text-center space-y-2 py-2 bg-gradient-to-r from-emerald-50 via-amber-50/40 to-emerald-50 rounded-2xl p-4 border border-emerald-200/60">
              <h2 className="text-xl sm:text-2xl font-black text-emerald-950">
                التقرير الإحصائي الشامل ومخرجات مبادرة «دِرْعُ الوَطَن»
              </h2>
              <p className="text-xs text-slate-700 font-medium">
                ملخص إحصائيات المشاركات والاستبانات وقياس الأثر للتوعية بالمادة (34) من النظام الأساسي للحكم
              </p>
            </div>

            {/* Initiative Meta & Teacher Credits */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500">المدرسة:</span>{' '}
                <strong className="text-slate-900">الثانوية الأولى بالبدع</strong>
              </div>
              <div>
                <span className="text-slate-500">إعداد وتنفيذ المعلمتين:</span>{' '}
                <strong className="text-emerald-950 font-black">أمل رشيد + وفاء الزهراني</strong>
              </div>
              <div>
                <span className="text-slate-500">المرجعية الدستورية:</span>{' '}
                <strong className="text-slate-900">المادة 34 من النظام الأساسي للحكم</strong>
              </div>
              <div>
                <span className="text-slate-500">الفئة المستهدفة:</span>{' '}
                <strong className="text-slate-900">طالبات المرحلة الثانوية بالبدع</strong>
              </div>
            </div>

            {/* SECTION 1: PARTICIPATIONS KPI SUMMARY TABLE */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-slate-900 border-r-4 border-emerald-700 pr-2">
                أولاً: ملخص المؤشرات الميدانية والمشاركات المستلمة
              </h3>
              <table className="w-full text-xs text-right border border-slate-200">
                <thead className="bg-emerald-950 text-white">
                  <tr>
                    <th className="p-2.5">المؤشر الميداني</th>
                    <th className="p-2.5 text-center">العدد الفعلي المسجل</th>
                    <th className="p-2.5">التصنيف والملاحظات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2.5 font-bold">إجمالي الطالبات المشاركات</td>
                    <td className="p-2.5 text-center font-mono font-bold text-emerald-900">{students.length}</td>
                    <td className="p-2.5 text-slate-600">سجل فعلي في قاعدة البيانات السحابية</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">إجمالي المشاركات المستلمة</td>
                    <td className="p-2.5 text-center font-mono font-bold text-emerald-900">{submissions.length}</td>
                    <td className="p-2.5 text-slate-600">نصوص، رسومات، ميثاق، واختبارات</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">المشاركات النصية والخواطر الوطنية</td>
                    <td className="p-2.5 text-center font-mono font-bold text-blue-800">{textSubmissionsCount}</td>
                    <td className="p-2.5 text-slate-600">رسائل ولاء واعتزاز للوطن والمادة 34</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">اللوحات الفنية والتصاميم الرقمية</td>
                    <td className="p-2.5 text-center font-mono font-bold text-amber-800">{drawingSubmissionsCount}</td>
                    <td className="p-2.5 text-slate-600">مرسم درع الوطن الرقمي</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">مواثيق العهد والوفاء المعتمدة</td>
                    <td className="p-2.5 text-center font-mono font-bold text-emerald-800">
                      {submissions.filter((s) => s.type === 'pledge').length}
                    </td>
                    <td className="p-2.5 text-slate-600">تعهد والتزام بالواجب الوطني</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">الاستبانات المكتملة</td>
                    <td className="p-2.5 text-center font-mono font-bold text-emerald-800">{analytics?.totalResponses || 0}</td>
                    <td className="p-2.5 text-slate-600">استطلاع قياس الأثر المعرفي والوجداني</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SECTION 2: CLASS / GRADE DISTRIBUTION */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-slate-900 border-r-4 border-amber-600 pr-2">
                ثانياً: توزيع المشاركات حسب الفصول الدراسية
              </h3>
              <table className="w-full text-xs text-right border border-slate-200">
                <thead className="bg-slate-100 text-slate-800">
                  <tr>
                    <th className="p-2">الفصل الدراسي</th>
                    <th className="p-2 text-center">عدد المشاركات</th>
                    <th className="p-2 text-center">النسبة المئوية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {SCHOOL_GRADES.map((gradeName) => {
                    const count = submissions.filter((s) => s.grade === gradeName).length;
                    const pct = submissions.length > 0 ? ((count / submissions.length) * 100).toFixed(1) : '0';
                    return (
                      <tr key={gradeName} className="hover:bg-slate-50">
                        <td className="p-2 font-semibold text-slate-900">{gradeName}</td>
                        <td className="p-2 text-center font-mono font-bold text-emerald-800">{count}</td>
                        <td className="p-2 text-center font-mono text-slate-600">{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* SECTION 3: SURVEY & IMPACT MEASUREMENT SUMMARY */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-slate-900 border-r-4 border-blue-700 pr-2">
                ثالثاً: ملخص إحصائيات الاستبانات وقياس الأثر
              </h3>
              {analytics && analytics.hasData ? (
                <div className="space-y-3">
                  <table className="w-full text-xs text-right border border-slate-200">
                    <thead className="bg-emerald-950 text-white">
                      <tr>
                        <th className="p-2.5">المحور الدستوري والتوعوي المستهدف</th>
                        <th className="p-2.5 text-center">متوسط الاستبانة القبلية (من 5)</th>
                        <th className="p-2.5 text-center">متوسط الاستبانة البعدية (من 5)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {analytics.metrics.map((m) => (
                        <tr key={m.id}>
                          <td className="p-2.5 font-semibold text-slate-800">{m.question}</td>
                          <td className="p-2.5 text-center font-mono font-bold text-blue-700">{m.preAvg} / 5</td>
                          <td className="p-2.5 text-center font-mono font-bold text-emerald-700">{m.postAvg} / 5</td>
                        </tr>
                      ))}
                      <tr className="bg-emerald-50 font-bold">
                        <td className="p-2.5 text-emerald-950">المتوسط العام الكلي للوعي والأثر</td>
                        <td className="p-2.5 text-center font-mono text-blue-900">{analytics.overallPre} / 5</td>
                        <td className="p-2.5 text-center font-mono text-emerald-900">{analytics.overallPost} / 5</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950 flex flex-wrap items-center justify-between gap-2">
                    <span>إجمالي الاستجابات: <strong>{analytics.totalResponses}</strong> (قبلية: {analytics.totalPre} · بعدية: {analytics.totalPost})</span>
                    <span>نسبة التطور والنمو المعرفي المحسوبة: <strong className="font-mono text-emerald-800">%{analytics.growthPercentage}</strong></span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                  لا توجد استجابات استبانة مسجلة بعد. عند استكمال الطالبات للاستبانات ستظهر المؤشرات الإحصائية في التقرير آلياً.
                </div>
              )}
            </div>

            {/* Official Signatures & Certification */}
            <div className="pt-10 grid grid-cols-2 gap-8 text-center text-xs border-t border-slate-200">
              <div className="space-y-2">
                <p className="text-slate-600">إعداد وتنفيذ المعلمة:</p>
                <p className="text-sm font-bold text-emerald-950">أمل رشيد</p>
                <p className="text-[10px] text-slate-400">الثانوية الأولى بالبدع</p>
                <div className="w-28 h-0.5 bg-slate-300 mx-auto mt-2" />
              </div>

              <div className="space-y-2">
                <p className="text-slate-600">إعداد وتنفيذ المعلمة:</p>
                <p className="text-sm font-bold text-emerald-950">وفاء الزهراني</p>
                <p className="text-[10px] text-slate-400">الثانوية الأولى بالبدع</p>
                <div className="w-28 h-0.5 bg-slate-300 mx-auto mt-2" />
              </div>
            </div>

            <div className="text-center pt-4 text-[10px] text-slate-400 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <span>الثانوية الأولى بالبدع · مبادرة درع الوطن · المادة 34 من النظام الأساسي للحكم</span>
              <span>وثيقة رسمية صادرة من المنصة السحابية المدرسية</span>
            </div>
          </div>
        </div>
      )}

      {/* Submission Review & Details Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 text-right max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-mono text-emerald-800 font-bold">{selectedSubmission.id}</span>
                <h3 className="text-lg font-bold text-slate-900">{selectedSubmission.title}</h3>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl">
              <div>
                <span className="text-slate-500">الطالبة:</span> <strong>{selectedSubmission.studentName}</strong>
              </div>
              <div>
                <span className="text-slate-500">الفصل:</span> <strong>{selectedSubmission.grade}</strong>
              </div>
              <div>
                <span className="text-slate-500">النوع:</span> <strong>{selectedSubmission.type}</strong>
              </div>
              <div>
                <span className="text-slate-500">التاريخ:</span>{' '}
                <strong>{new Date(selectedSubmission.createdAt).toLocaleString('ar-SA')}</strong>
              </div>
            </div>

            {/* Content or Image Preview */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">محتوى المشاركة:</label>
              {selectedSubmission.fileUrl ? (
                <div className="flex justify-center p-2 bg-slate-100 rounded-xl border border-slate-200">
                  <img
                    src={selectedSubmission.fileUrl}
                    alt={selectedSubmission.title}
                    className="max-h-72 rounded-lg object-contain shadow-sm"
                  />
                </div>
              ) : selectedSubmission.type === 'text' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>القالب المختار: <strong className="text-emerald-800">{getShieldTemplate(selectedSubmission.backgroundTemplate).name}</strong></span>
                    <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      خلفية درع الوطن المعتمدة
                    </span>
                  </div>
                  <ShieldTextCard
                    templateId={selectedSubmission.backgroundTemplate || 'emerald-shield'}
                    title={selectedSubmission.title}
                    content={selectedSubmission.content}
                    studentName={selectedSubmission.studentName}
                    grade={selectedSubmission.grade}
                    date={selectedSubmission.createdAt}
                    submissionId={selectedSubmission.id}
                    showActions={true}
                  />
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {selectedSubmission.content}
                </div>
              )}
            </div>

            {/* Review Decision Buttons */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-slate-700">
                ملاحظات المعلمة (اختياري):
              </label>
              <input
                type="text"
                value={teacherNote}
                onChange={(e) => setTeacherNote(e.target.value)}
                placeholder="كلمة تشجيعية للطالبة..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedSubmission.id, 'approved')}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    قبول واعتماد ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedSubmission.id, 'featured')}
                    className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    تمييز للمعرض ★
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedSubmission.id, 'archived')}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    أرشفة
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteSubmission(selectedSubmission.id)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  حذف المشاركة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
