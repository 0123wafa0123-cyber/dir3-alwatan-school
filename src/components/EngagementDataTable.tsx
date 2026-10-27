/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import {
  Table,
  Search,
  Filter,
  Download,
  FileDown,
  Printer,
  CheckCircle,
  Clock,
  Sparkles,
  Eye,
  ImageIcon,
  FileText,
  Award,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Loader2,
  Check,
  X,
  Layers,
  ArrowUpDown,
  SlidersHorizontal,
  ThumbsUp,
  Star,
  ExternalLink,
  Shield,
  Trash2,
  Calendar
} from 'lucide-react';
import { Submission, TeacherUser } from '../types';
import { SCHOOL_GRADES } from '../constants/grades';
import { getShieldTemplate } from '../constants/templates';
import heroShieldImg from '../assets/images/shield_of_nation_hero_1792473197101.jpg';

interface EngagementDataTableProps {
  submissions: Submission[];
  currentTeacher: TeacherUser | null;
  onRefreshData?: () => void;
  onUpdateStatus?: (id: string, status: string, feedback?: string) => Promise<void>;
  onDeleteSubmission?: (id: string) => Promise<void>;
  onOpenStudentCertificate?: (studentName: string, grade: string) => void;
}

export const EngagementDataTable: React.FC<EngagementDataTableProps> = ({
  submissions,
  currentTeacher,
  onRefreshData,
  onUpdateStatus,
  onDeleteSubmission,
  onOpenStudentCertificate
}) => {
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedType, setSelectedType] = useState<'all' | 'text' | 'drawing' | 'pledge' | 'quiz'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'approved' | 'featured' | 'pending' | 'archived'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'studentName' | 'likes'>('newest');
  const [onlyWithImages, setOnlyWithImages] = useState(false);

  // Multi-selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Detailed preview modal
  const [previewSubmission, setPreviewSubmission] = useState<Submission | null>(null);

  // Quick feedback modal
  const [reviewModalSub, setReviewModalSub] = useState<Submission | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'featured' | 'pending' | 'archived'>('approved');

  // Export states
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportMsg, setExportMsg] = useState<string | null>(null);

  // Reference for PDF printable document
  const pdfPrintRef = useRef<HTMLDivElement>(null);

  // Filtered & Sorted Submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      // 1. Search term match
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const matchesName = sub.studentName.toLowerCase().includes(q);
        const matchesTitle = sub.title?.toLowerCase().includes(q) || false;
        const matchesContent = sub.content?.toLowerCase().includes(q) || false;
        const matchesId = sub.id?.toLowerCase().includes(q) || false;
        if (!matchesName && !matchesTitle && !matchesContent && !matchesId) {
          return false;
        }
      }

      // 2. Grade match
      if (selectedGrade !== 'all' && sub.grade !== selectedGrade) {
        return false;
      }

      // 3. Type match
      if (selectedType !== 'all' && sub.type !== selectedType) {
        return false;
      }

      // 4. Status match
      if (selectedStatus !== 'all' && sub.status !== selectedStatus) {
        return false;
      }

      // 5. Only with images
      if (onlyWithImages && !sub.fileUrl) {
        return false;
      }

      // 6. Date match
      if (dateFilter !== 'all') {
        const subDate = new Date(sub.createdAt).getTime();
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        if (dateFilter === 'today' && now - subDate > oneDay) return false;
        if (dateFilter === 'week' && now - subDate > 7 * oneDay) return false;
        if (dateFilter === 'month' && now - subDate > 30 * oneDay) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'studentName') return a.studentName.localeCompare(b.studentName, 'ar');
      if (sortBy === 'likes') return (b.likesCount || 0) - (a.likesCount || 0);
      return 0;
    });
  }, [submissions, searchTerm, selectedGrade, selectedType, selectedStatus, dateFilter, sortBy, onlyWithImages]);

  // Quick Metrics for current view
  const metrics = useMemo(() => {
    const textCount = filteredSubmissions.filter((s) => s.type === 'text').length;
    const drawingCount = filteredSubmissions.filter((s) => s.type === 'drawing').length;
    const approvedCount = filteredSubmissions.filter((s) => s.status === 'approved' || s.status === 'featured').length;
    const pendingCount = filteredSubmissions.filter((s) => s.status === 'pending').length;
    const uniqueStudents = new Set(filteredSubmissions.map((s) => s.studentName.trim())).size;

    return {
      total: filteredSubmissions.length,
      textCount,
      drawingCount,
      approvedCount,
      pendingCount,
      uniqueStudents
    };
  }, [filteredSubmissions]);

  // Selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredSubmissions.map((s) => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk Status Update
  const handleBulkStatusChange = async (newStatus: 'approved' | 'featured' | 'archived') => {
    if (!onUpdateStatus || selectedIds.length === 0) return;
    try {
      for (const id of selectedIds) {
        await onUpdateStatus(id, newStatus);
      }
      setExportMsg(`تم تحديث حالة ${selectedIds.length} مشاركة بنجاح!`);
      setTimeout(() => setExportMsg(null), 3000);
      setSelectedIds([]);
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setExportMsg(err.message || 'حدث خطأ أثناء التحديث الجماعي');
    }
  };

  // Export to CSV with UTF-8 BOM
  const handleExportCsv = (onlySelected: boolean = false) => {
    const dataToExport = onlySelected
      ? filteredSubmissions.filter((s) => selectedIds.includes(s.id))
      : filteredSubmissions;

    if (dataToExport.length === 0) {
      setExportMsg('لا توجد بيانات متاحة للتصدير');
      setTimeout(() => setExportMsg(null), 3000);
      return;
    }

    let csv = '\uFEFF'; // UTF-8 BOM
    csv += 'رقم المشاركة,اسم الطالبة,الصف الدراسي,نوع المشاركة,عنوان المشاركة,تاريخ الإرسال,حالة المراجعة,المعلمة المراجعة,ملاحظات المعلمة,محتوى المشاركة / رابط الملف\r\n';

    dataToExport.forEach((s) => {
      const typeLabel =
        s.type === 'drawing'
          ? 'رسمة فنية'
          : s.type === 'text'
          ? 'مشاركة وخاطرة نصية'
          : s.type === 'pledge'
          ? 'وثيقة عهد'
          : 'اختبار';

      const statusLabel =
        s.status === 'approved'
          ? 'معتمدة'
          : s.status === 'featured'
          ? 'مميزة بالمعرض'
          : s.status === 'pending'
          ? 'قيد المراجعة'
          : 'مؤرشفة';

      const contentClean = (s.fileUrl || s.content || '').replace(/"/g, '""').replace(/\r?\n|\r/g, ' ');

      const row = [
        `"${s.id}"`,
        `"${s.studentName.replace(/"/g, '""')}"`,
        `"${s.grade.replace(/"/g, '""')}"`,
        `"${typeLabel}"`,
        `"${(s.title || '').replace(/"/g, '""')}"`,
        `"${new Date(s.createdAt).toLocaleString('ar-SA')}"`,
        `"${statusLabel}"`,
        `"${(s.reviewedBy || '-').replace(/"/g, '""')}"`,
        `"${(s.feedback || '-').replace(/"/g, '""')}"`,
        `"${contentClean}"`
      ];

      csv += row.join(',') + '\r\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `سجل_تفاعل_مبادرة_درع_الوطن_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportMsg(`تم تصدير ${dataToExport.length} مشاركة بنجاح إلى ملف Excel / CSV!`);
    setTimeout(() => setExportMsg(null), 3000);
  };

  // Export to High-Precision PDF
  const handleExportPdf = async () => {
    if (!pdfPrintRef.current) return;
    setIsExportingPdf(true);
    setExportMsg(null);

    try {
      const element = pdfPrintRef.current;
      const opt = {
        margin: [6, 6, 6, 6],
        filename: `تقرير_بيانات_تفاعل_درع_الوطن_الثانوية_الأولى_${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      };

      await (html2pdf as any)().set(opt).from(element).save();
      setExportMsg('تم تصدير تقرير التفاعل بنجاح كملف PDF عالي الدقة!');
      setTimeout(() => setExportMsg(null), 4000);
    } catch (err: any) {
      console.error('PDF generation error:', err);
      setExportMsg('تعذر إنشاء ملف PDF، يرجى استخدام أمر الطباعة المباشر.');
      setTimeout(() => setExportMsg(null), 4000);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleSaveReviewModal = async () => {
    if (!reviewModalSub || !onUpdateStatus) return;
    try {
      await onUpdateStatus(reviewModalSub.id, reviewStatus, reviewNote);
      setReviewModalSub(null);
      setReviewNote('');
      setExportMsg('تم اعتماد وتحديث مراجعة المشاركة بنجاح!');
      setTimeout(() => setExportMsg(null), 3000);
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setExportMsg(err.message || 'فشل التحديث');
    }
  };

  return (
    <div className="space-y-6 text-right font-sans">
      {/* Top Banner Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 border border-emerald-500/40 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-400/40 text-xs font-bold text-amber-300">
              <Table className="w-4 h-4 text-emerald-300" />
              <span>جدول بيانات التفاعل والتحليل الشامل · الثانوية الأولى بالبدع</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              جدول بيانات التفاعل لمشاركات الطالبات
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium">
              أداة متقدمة تتيح للمعلمتين <strong>أمل رشيد</strong> و<strong>وفاء الزهراني</strong> والإدارة المدرسية المراجعة والفرز والتدقيق الفوري لكافة الرسومات والخواطر النصية مع تصدير عالي الدقة لـ CSV و PDF.
            </p>
          </div>

          {/* Export Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <button
              type="button"
              onClick={() => handleExportCsv(false)}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer transform hover:scale-[1.02]"
              title="تصدير السجلات الحالية إلى Excel"
            >
              <Download className="w-4 h-4" />
              <span>تصدير Excel (CSV)</span>
            </button>

            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer border border-emerald-500/50 disabled:opacity-50"
              title="تصدير تقرير رسمي عالي الدقة كملف PDF"
            >
              {isExportingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
              ) : (
                <FileDown className="w-4 h-4 text-amber-300" />
              )}
              <span>تصدير تقرير PDF عالي الدقة</span>
            </button>

            {onRefreshData && (
              <button
                type="button"
                onClick={onRefreshData}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs transition-colors cursor-pointer"
                title="تحديث البيانات"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Toast */}
      {exportMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{exportMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setExportMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 block">المشاركات المعروضة</span>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
            {metrics.total}
          </div>
          <span className="text-[10px] text-slate-400">من أصل {submissions.length} مشاركة</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 block">طالبات مشاركات</span>
          <div className="text-2xl font-black text-emerald-800 font-mono tabular-nums">
            {metrics.uniqueStudents}
          </div>
          <span className="text-[10px] text-emerald-700">طالبة في هذا العرض</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 block">المشاركات النصية</span>
          <div className="text-2xl font-black text-blue-700 font-mono tabular-nums">
            {metrics.textCount}
          </div>
          <span className="text-[10px] text-slate-400">خواطر ورسائل فخر</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 block">اللوحات والرسومات</span>
          <div className="text-2xl font-black text-amber-700 font-mono tabular-nums">
            {metrics.drawingCount}
          </div>
          <span className="text-[10px] text-slate-400">أعمال تشكيلية ورقمية</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 block">المشاركات المعتمدة</span>
          <div className="text-2xl font-black text-emerald-700 font-mono tabular-nums">
            {metrics.approvedCount}
          </div>
          <span className="text-[10px] text-emerald-600">موثقة ومعتمدة</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 block">بانتظار المراجعة</span>
          <div className="text-2xl font-black text-red-600 font-mono tabular-nums">
            {metrics.pendingCount}
          </div>
          <span className="text-[10px] text-red-500">تتطلب مراجعة المعلمة</span>
        </div>
      </div>

      {/* Filter & Controls Panel */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        {/* Search & Main Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="البحث باسم الطالبة، العنوان، المعرف، أو محتوى المشاركة..."
              className="w-full pr-10 pl-4 py-2.5 rounded-2xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Grade Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-3 py-2.5 rounded-2xl border border-slate-300 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
            >
              <option value="all">جميع الفصول والمراحل</option>
              {SCHOOL_GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-2xl border border-slate-300 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
            >
              <option value="all">كافة الحالات</option>
              <option value="approved">معتمدة وموثقة</option>
              <option value="featured">مميزة بالمعرض</option>
              <option value="pending">قيد المراجعة</option>
              <option value="archived">مؤرشفة</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-2xl border border-slate-300 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
            >
              <option value="newest">الأحدث أولاً</option>
              <option value="oldest">الأقدم أولاً</option>
              <option value="studentName">اسم الطالبة (أبجدياً)</option>
              <option value="likes">الأكثر تمييزاً وإعجاباً</option>
            </select>
          </div>
        </div>

        {/* Secondary Filter Chips Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Type Quick Selector */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 ml-1">نوع المشاركة:</span>
            {[
              { id: 'all', label: 'الكل' },
              { id: 'text', label: '✍️ خواطر ونصوص' },
              { id: 'drawing', label: '🎨 رسومات ولوحات' },
              { id: 'pledge', label: '📜 وثائق عهد' },
              { id: 'quiz', label: '💡 اختبارات' }
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedType(t.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedType === t.id
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Quick Date Range & Media Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setDateFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                  dateFilter === 'all' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                الكل
              </button>
              <button
                type="button"
                onClick={() => setDateFilter('today')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                  dateFilter === 'today' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                اليوم
              </button>
              <button
                type="button"
                onClick={() => setDateFilter('week')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                  dateFilter === 'week' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                هذا الأسبوع
              </button>
            </div>

            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold cursor-pointer">
              <input
                type="checkbox"
                checked={onlyWithImages}
                onChange={(e) => setOnlyWithImages(e.target.checked)}
                className="w-3.5 h-3.5 text-emerald-700 rounded-sm focus:ring-emerald-700 cursor-pointer"
              />
              <span>لوحات فقط 🖼️</span>
            </label>
          </div>
        </div>

        {/* Bulk Action Bar (When rows selected) */}
        {selectedIds.length > 0 && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
              <Check className="w-4 h-4 text-emerald-700" />
              <span>تم تحديد <strong>{selectedIds.length}</strong> مشاركة</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleBulkStatusChange('approved')}
                className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                اعتماد المحددة
              </button>
              <button
                type="button"
                onClick={() => handleBulkStatusChange('featured')}
                className="px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                تمييز للمعرض
              </button>
              <button
                type="button"
                onClick={() => handleExportCsv(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-bold transition-colors cursor-pointer"
              >
                تصدير المحددة لـ Excel
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="px-2.5 py-1.5 rounded-xl bg-white text-slate-600 hover:text-slate-800 text-xs font-bold border border-slate-200 cursor-pointer"
              >
                إلغاء التحديد
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Interactive Table */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredSubmissions.length > 0 &&
                      selectedIds.length === filteredSubmissions.length
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-emerald-700 rounded-sm focus:ring-emerald-700 cursor-pointer"
                  />
                </th>
                <th className="p-3.5">رقم المشاركة والتاريخ</th>
                <th className="p-3.5">اسم الطالبة والفصل</th>
                <th className="p-3.5">نوع المشاركة وعنوانها</th>
                <th className="p-3.5">معاينة المحتوى / اللوحة</th>
                <th className="p-3.5">حالة الاعتماد</th>
                <th className="p-3.5">تقييم المعلمة</th>
                <th className="p-3.5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400 space-y-2">
                    <Table className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="font-bold text-sm">لا توجد مشاركات مطابقة لمعايير البحث والفرز الحالية</p>
                    <p className="text-xs">جربي تعديل خيارات التصفية أو إزالة الكلمات المفتاحية</p>
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => {
                  const isSelected = selectedIds.includes(sub.id);
                  const isDrawing = sub.type === 'drawing';
                  const templateInfo = getShieldTemplate(sub.backgroundTemplate);

                  return (
                    <tr
                      key={sub.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-emerald-50/50' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(sub.id)}
                          className="w-4 h-4 text-emerald-700 rounded-sm focus:ring-emerald-700 cursor-pointer"
                        />
                      </td>

                      {/* ID & Date */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-mono font-bold text-emerald-800 block text-[11px]">
                          {sub.id}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {new Date(sub.createdAt).toLocaleDateString('ar-SA', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(sub.createdAt).toLocaleTimeString('ar-SA', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </td>

                      {/* Student Name & Grade */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <span>{sub.studentName}</span>
                          {onOpenStudentCertificate && (
                            <button
                              type="button"
                              onClick={() => onOpenStudentCertificate(sub.studentName, sub.grade)}
                              title="إصدار شهادة شكر للطالبة"
                              className="text-amber-500 hover:text-amber-700 p-0.5 cursor-pointer"
                            >
                              <Award className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                          {sub.grade}
                        </span>
                      </td>

                      {/* Type & Title */}
                      <td className="p-3.5 max-w-xs">
                        <div className="flex items-center gap-1.5 mb-1">
                          {isDrawing ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold flex items-center gap-1">
                              <ImageIcon className="w-3 h-3 text-amber-600" />
                              <span>رسمة فنية</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold flex items-center gap-1">
                              <FileText className="w-3 h-3 text-blue-600" />
                              <span>مشاركة نصية</span>
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-slate-800 line-clamp-1 text-xs">
                          {sub.title || 'مشاركة درع الوطن'}
                        </span>
                      </td>

                      {/* Content Preview / Thumbnail */}
                      <td className="p-3.5">
                        {sub.fileUrl ? (
                          <div
                            onClick={() => setPreviewSubmission(sub)}
                            className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative group cursor-pointer shadow-xs"
                          >
                            <img
                              src={sub.fileUrl}
                              alt={sub.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Eye className="w-4 h-4" />
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => setPreviewSubmission(sub)}
                            className="max-w-xs p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
                          >
                            <p className="text-[11px] text-slate-700 line-clamp-2 leading-relaxed">
                              {sub.content}
                            </p>
                          </div>
                        )}
                      </td>

                      {/* Review Status */}
                      <td className="p-3.5 whitespace-nowrap">
                        {sub.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[11px]">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>معتمدة</span>
                          </span>
                        )}
                        {sub.status === 'featured' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-300 font-bold text-[11px]">
                            <Star className="w-3 h-3 text-purple-600 fill-purple-600" />
                            <span>مميزة بالمعرض</span>
                          </span>
                        )}
                        {sub.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold text-[11px]">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>قيد التدقيق</span>
                          </span>
                        )}
                        {sub.status === 'archived' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-300 font-bold text-[11px]">
                            <span>مؤرشفة</span>
                          </span>
                        )}
                      </td>

                      {/* Teacher Feedback / Endorsements */}
                      <td className="p-3.5 whitespace-nowrap">
                        {sub.reviewedBy ? (
                          <div className="space-y-0.5">
                            <span className="text-[11px] font-bold text-slate-800 block">
                              {sub.reviewedBy}
                            </span>
                            {sub.feedback ? (
                              <span className="text-[10px] text-slate-500 block truncate max-w-[140px]" title={sub.feedback}>
                                "{sub.feedback}"
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-700">معتمدة رسمياً</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">بانتظار الملاحظات</span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="p-3.5 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setPreviewSubmission(sub)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="معاينة كاملة"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setReviewModalSub(sub);
                              setReviewStatus(sub.status);
                              setReviewNote(sub.feedback || '');
                            }}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
                            title="تدقيق واعتماد"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>

                          {onDeleteSubmission && (
                            <button
                              type="button"
                              onClick={async () => {
                                if (onDeleteSubmission) {
                                  await onDeleteSubmission(sub.id);
                                  if (onRefreshData) onRefreshData();
                                }
                              }}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                              title="حذف المشاركة"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info strip */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            عرض <strong>{filteredSubmissions.length}</strong> من إجمالي <strong>{submissions.length}</strong> مشاركة في النظام
          </div>
          <div className="flex items-center gap-2">
            <span>الثانوية الأولى بالبدع · مبادرة درع الوطن (المادة 34)</span>
          </div>
        </div>
      </div>

      {/* Full Preview Modal */}
      {previewSubmission && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 text-right max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-mono text-emerald-800 font-bold">{previewSubmission.id}</span>
                <h3 className="text-lg font-bold text-slate-900">{previewSubmission.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewSubmission(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div>
                <span className="text-slate-500 block text-[10px]">الطالبة:</span>
                <strong className="text-slate-900">{previewSubmission.studentName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">الفصل:</span>
                <strong className="text-slate-900">{previewSubmission.grade}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">النوع:</span>
                <strong className="text-slate-900">
                  {previewSubmission.type === 'drawing' ? 'لوحة فنية' : 'مشاركة نصية'}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">التاريخ:</span>
                <strong className="text-slate-900">
                  {new Date(previewSubmission.createdAt).toLocaleDateString('ar-SA')}
                </strong>
              </div>
            </div>

            {/* Content or Image Preview */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">محتوى المشاركة:</label>
              {previewSubmission.fileUrl ? (
                <div className="flex justify-center p-3 bg-slate-100 rounded-2xl border border-slate-200">
                  <img
                    src={previewSubmission.fileUrl}
                    alt={previewSubmission.title}
                    className="max-h-80 rounded-xl object-contain shadow-md"
                  />
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                  {previewSubmission.content}
                </div>
              )}
            </div>

            {/* Quick Actions in Modal */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
              <div className="flex items-center gap-2">
                {onUpdateStatus && (
                  <>
                    <button
                      type="button"
                      onClick={async () => {
                        await onUpdateStatus(previewSubmission.id, 'approved');
                        setPreviewSubmission(null);
                        if (onRefreshData) onRefreshData();
                      }}
                      className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      اعتماد المشاركة ✓
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await onUpdateStatus(previewSubmission.id, 'featured');
                        setPreviewSubmission(null);
                        if (onRefreshData) onRefreshData();
                      }}
                      className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      تمييز للمعرض ★
                    </button>
                  </>
                )}
              </div>

              {onOpenStudentCertificate && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenStudentCertificate(previewSubmission.studentName, previewSubmission.grade);
                    setPreviewSubmission(null);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>شهادة تقدير للطالبة</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Review / Feedback Modal */}
      {reviewModalSub && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 text-right animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">مراجعة واعتماد مشاركة الطالبة</h3>
              <button
                type="button"
                onClick={() => setReviewModalSub(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs bg-slate-50 p-2.5 rounded-xl text-slate-700">
              <div>الطالبة: <strong>{reviewModalSub.studentName}</strong> ({reviewModalSub.grade})</div>
              <div>العنوان: <strong>{reviewModalSub.title}</strong></div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">حالة الاعتماد:</label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-700"
                >
                  <option value="approved">معتمدة وموثقة بالسجل</option>
                  <option value="featured">معتمدة ومميزة بالمعرض الافتراضي</option>
                  <option value="pending">قيد التدقيق والمراجعة</option>
                  <option value="archived">أرشفة</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظة وتوجيه المعلمة للطالبة:</label>
                <textarea
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="أدخلي كلمة تشجيعية أو توجيهاً للطالبة..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSaveReviewModal}
                className="flex-1 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                حفظ الاعتماد والتوجيه
              </button>
              <button
                type="button"
                onClick={() => setReviewModalSub(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HIDDEN PRINT-READY TEMPLATE FOR HIGH-PRECISION PDF EXPORT */}
      <div className="hidden">
        <div ref={pdfPrintRef} className="p-8 bg-white text-slate-900 font-sans" dir="rtl" style={{ width: '100%', minHeight: '100%' }}>
          {/* Official Document Header */}
          <div className="border-b-2 border-emerald-800 pb-4 mb-6 flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-xs text-slate-600 font-bold">المملكة العربية السعودية</div>
              <div className="text-xs text-slate-600 font-bold">وزارة التعليم · إدارة تعليم تبوك</div>
              <div className="text-sm font-extrabold text-emerald-900">الثانوية الأولى بالبدع</div>
            </div>

            <div className="text-center space-y-1">
              <h1 className="text-xl font-black text-emerald-950">
                تقرير سجل تفاعل ومشاركات مبادرة «درع الوطن»
              </h1>
              <p className="text-xs text-slate-600">
                التوعية بالمادة (34) من النظام الأساسي للحكم · العام الدراسي 1447هـ
              </p>
            </div>

            <div className="text-left text-xs text-slate-500 space-y-1">
              <div>تاريخ التصدير: {new Date().toLocaleDateString('ar-SA')}</div>
              <div>إجمالي المشاركات: {filteredSubmissions.length}</div>
            </div>
          </div>

          {/* Quick Summary Metrics Table */}
          <div className="grid grid-cols-4 gap-3 mb-6 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center text-xs">
            <div>
              <span className="text-slate-600 block">إجمالي المشاركات</span>
              <strong className="text-base text-emerald-950 font-black">{metrics.total}</strong>
            </div>
            <div>
              <span className="text-slate-600 block">المشاركات النصية</span>
              <strong className="text-base text-blue-900 font-black">{metrics.textCount}</strong>
            </div>
            <div>
              <span className="text-slate-600 block">اللوحات والرسومات</span>
              <strong className="text-base text-amber-900 font-black">{metrics.drawingCount}</strong>
            </div>
            <div>
              <span className="text-slate-600 block">المشاركات المعتمدة</span>
              <strong className="text-base text-emerald-800 font-black">{metrics.approvedCount}</strong>
            </div>
          </div>

          {/* Detailed Data Table */}
          <table className="w-full text-right text-[10px] border-collapse border border-slate-300">
            <thead>
              <tr className="bg-emerald-900 text-white font-bold">
                <th className="border border-emerald-800 p-2 text-center w-8">#</th>
                <th className="border border-emerald-800 p-2">اسم الطالبة</th>
                <th className="border border-emerald-800 p-2">الصف الدراسي</th>
                <th className="border border-emerald-800 p-2">نوع المشاركة</th>
                <th className="border border-emerald-800 p-2">عنوان المشاركة</th>
                <th className="border border-emerald-800 p-2">حالة الاعتماد</th>
                <th className="border border-emerald-800 p-2">تاريخ الإرسال</th>
                <th className="border border-emerald-800 p-2">ملاحظات المعلمة</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((sub, idx) => (
                <tr key={sub.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="border border-slate-300 p-2 text-center font-bold">{idx + 1}</td>
                  <td className="border border-slate-300 p-2 font-bold">{sub.studentName}</td>
                  <td className="border border-slate-300 p-2">{sub.grade}</td>
                  <td className="border border-slate-300 p-2">
                    {sub.type === 'drawing' ? 'لوحة فنية' : sub.type === 'text' ? 'خاطرة نصية' : sub.type}
                  </td>
                  <td className="border border-slate-300 p-2">{sub.title}</td>
                  <td className="border border-slate-300 p-2 font-bold text-emerald-800">
                    {sub.status === 'approved' ? 'معتمدة' : sub.status === 'featured' ? 'مميزة بالمعرض' : 'قيد المراجعة'}
                  </td>
                  <td className="border border-slate-300 p-2 font-mono">
                    {new Date(sub.createdAt).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="border border-slate-300 p-2 text-slate-600">
                    {sub.feedback || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Official Signatures Footer */}
          <div className="mt-8 pt-6 border-t border-slate-300 flex items-center justify-between text-xs font-bold text-slate-800">
            <div className="text-center space-y-1">
              <div>معلمة المبادرة:</div>
              <div className="text-emerald-900 font-extrabold">أمل رشيد</div>
              <div className="text-[10px] text-slate-400">التوقيع: .....................</div>
            </div>

            <div className="text-center space-y-1">
              <div>معلمة المبادرة:</div>
              <div className="text-emerald-900 font-extrabold">وفاء الزهراني</div>
              <div className="text-[10px] text-slate-400">التوقيع: .....................</div>
            </div>

            <div className="text-center space-y-1">
              <div>مديرة المدرسة:</div>
              <div className="text-emerald-900 font-extrabold">أ. فاطمة سليمان المسعودي</div>
              <div className="text-[10px] text-slate-400">الختم والتوقيع: .....................</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
