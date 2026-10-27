import React, { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import {
  Award,
  Shield,
  Printer,
  Download,
  Share2,
  Sparkles,
  CheckCircle2,
  Star,
  School,
  Check,
  Copy,
  Users,
  Search,
  Palette,
  FileCheck,
  RotateCcw
} from 'lucide-react';
import { SCHOOL_GRADES } from '../constants/grades';
import { api } from '../services/api';
import { StudentSummary } from '../types';
import heroShieldImg from '../assets/images/shield_of_nation_hero_1792473197101.jpg';

interface StudentCertificateHubProps {
  initialStudentName?: string;
  initialGrade?: string;
  onBackToHome?: () => void;
}

export const StudentCertificateHub: React.FC<StudentCertificateHubProps> = ({
  initialStudentName = '',
  initialGrade = SCHOOL_GRADES[0],
  onBackToHome
}) => {
  // Certificate customisation fields
  const [studentName, setStudentName] = useState(initialStudentName);
  const [grade, setGrade] = useState(initialGrade);
  const [certificateCategory, setCertificateCategory] = useState<'awareness' | 'values' | 'missions' | 'creative' | 'pledge'>('awareness');
  const [certificateTheme, setCertificateTheme] = useState<'royal_gold' | 'emerald_classic' | 'modern_ivory'>('royal_gold');
  const [customAppreciationText, setCustomAppreciationText] = useState('');
  
  // Available registered students
  const [registeredStudents, setRegisteredStudents] = useState<StudentSummary[]>([]);
  const [searchStudentTerm, setSearchStudentTerm] = useState('');
  const [showStudentsPicker, setShowStudentsPicker] = useState(false);

  // Export / Print feedback
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const certificateRef = useRef<HTMLDivElement | null>(null);

  // Fetch students for quick auto-fill
  useEffect(() => {
    api.getStudents().then((res) => {
      if (res.students && res.students.length > 0) {
        setRegisteredStudents(res.students);
      }
    }).catch(() => {
      // ignore offline fallback
    });
  }, []);

  // Sync if props change
  useEffect(() => {
    if (initialStudentName) setStudentName(initialStudentName);
    if (initialGrade) setGrade(initialGrade);
  }, [initialStudentName, initialGrade]);

  // Certificate Categories Configuration
  const CATEGORIES = {
    awareness: {
      title: 'شَهَادَةُ شُكْرٍ وَتَقْدِيرٍ · سَفِيرَةُ الوَعْيِ الوَطَنِيّ',
      badgeLabel: 'سفيرة الوعي الوطني والمادة 34',
      badgeIcon: '🎖️',
      defaultReason: 'تقديراً لمشاركتها الفاعلة وإسهامها المتميز في التوعية بمضامين المادة 34 من النظام الأساسي للحكم، ونشر الوعي الدستوري والمواطنة المسؤولة بين زميلاتها بالثانوية الأولى بالبدع.'
    },
    values: {
      title: 'شَهَادَةُ إِتْقَانٍ وَاعْتِزَاز · حَامِيَةُ القِيَمِ وَالمُوَاطَنَة',
      badgeLabel: 'حامية القيم والثوابت الوطنية',
      badgeIcon: '🛡️',
      defaultReason: 'تقديراً لتميزها في استبانة قياس الأثر والوعي بالثوابت، وصيانة الهوية الوطنية السعودية، والاعتزاز بوحدة وطننا الغالي وولاة أمرنا حفظهم الله.'
    },
    missions: {
      title: 'شَهَادَةُ تَفَوُّقٍ وَرِيَادَة · بَطَلَةُ مُهِمَّاتِ دِرْعِ الوَطَن',
      badgeLabel: 'بطلة مهمة الدرع اليومية ورحلة الحماة',
      badgeIcon: '⭐',
      defaultReason: 'تقديراً لمثابرتها في إنجاز تحديات «مهمة الدرع اليومية»، واجتياز محطات رحلة حماة الوطن، وفتح صندوق المفاجآت الأسبوعي بجدارة واستحقاق.'
    },
    creative: {
      title: 'شَهَادَةُ إِبْدَاعٍ وَتَمَيُّز · مَرْسَمُ دِرْعِ الوَطَن',
      badgeLabel: 'الإبداع والريادة الفنية الوطنية',
      badgeIcon: '🎨',
      defaultReason: 'تقديراً لإبداعها الفني المتميز في مرسم درع الوطن الرقمي، وتعبيرها الجمالي عن حب الوطن والتضحية في سبيله بلوحات ورسومات معبرة.'
    },
    pledge: {
      title: 'شَهَادَةُ وَفَاءٍ وَانْتِمَاء · مِيثَاقُ عَهْدِ دِرْعِ الوَطَن',
      badgeLabel: 'ميثاق الشرف والعهد الوطني',
      badgeIcon: '🤝',
      defaultReason: 'تقديراً لتوقيعها ميثاق الشرف والعهد الوطني لطالبات الثانوية الأولى بالبدع، والالتزام بحماية العقيدة والمجتمع والوطن قولاً وعملاً.'
    }
  };

  const selectedCategoryData = CATEGORIES[certificateCategory];
  const finalReasonText = customAppreciationText.trim() || selectedCategoryData.defaultReason;

  // Handle PDF Download via html2pdf
  const handleDownloadPdf = async () => {
    if (!certificateRef.current) return;
    setIsExportingPdf(true);
    setActionSuccessMsg(null);

    const safeName = studentName.trim() ? studentName.trim().replace(/\s+/g, '_') : 'طالبة';
    try {
      const opt = {
        margin: [6, 6, 6, 6],
        filename: `شهادة_شكر_درع_الوطن_${safeName}_${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      };

      await (html2pdf as any)().set(opt).from(certificateRef.current).save();
      setActionSuccessMsg('تم تنزيل شهادة التقدير كملف PDF عالي الجودة بنجاح!');
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err) {
      console.error('PDF export error:', err);
      // Fallback: window.print
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Handle Direct Print
  const handlePrint = () => {
    window.print();
  };

  // Handle Share to WhatsApp
  const handleShareWhatsApp = () => {
    const text = `🎖️ نالت الطالبة: *${studentName || 'طالبة متميزة'}* بالصف: *${grade}*\n` +
      `«${selectedCategoryData.title}»\n` +
      `ضمن مبادرة «درع الوطن - المادة 34» بالثانوية الأولى بالبدع 🇸🇦\n` +
      `إشراف المعلمتين: أمل رشيد ووفاء الزهراني.\n` +
      `رابط المنصة: ${window.location.origin}`;
    
    const a = document.createElement('a');
    a.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Copy Verification Link
  const handleCopyLink = () => {
    const text = `شهادة شكر وتقدير للطالبة ${studentName || 'المتميزة'} - مبادرة درع الوطن - الثانوية الأولى بالبدع`;
    navigator.clipboard.writeText(`${text}\n${window.location.href}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Filter registered students for quick pick
  const filteredStudents = registeredStudents.filter((s) =>
    s.name.toLowerCase().includes(searchStudentTerm.toLowerCase()) ||
    s.grade.toLowerCase().includes(searchStudentTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Top Banner & Introduction */}
      <div className="p-6 sm:p-8 rounded-3xl bg-radial from-emerald-900 via-emerald-950 to-slate-950 text-white shadow-xl border border-amber-400/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-right">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-300 bg-emerald-800/80 px-3.5 py-1 rounded-full border border-amber-400/30">
              <Award className="w-4 h-4 text-amber-400" />
              <span>الثانوية الأولى بالبدع · مبادرة درع الوطن</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
              شهادات الشكر والتقدير والاعتزاز الوطني للطالبات
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/90 max-w-2xl leading-relaxed">
              منصة رسمية معتمدة لإصدار وتخصيص وطباعة شهادات التكريم لطالبات الثانوية الأولى بالبدع المشاركات في مبادرة «درع الوطن - المادة 34»، إعداد وتنفيذ المعلمتين: <span className="text-amber-300 font-bold">أمل رشيد + وفاء الزهراني</span>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
            <button
              onClick={handlePrint}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة فورية بالألوان</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-emerald-600/70 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>{isExportingPdf ? 'جارٍ التصدير...' : 'تحميل PDF عالي الدقة'}</span>
            </button>
          </div>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Control Panel: Customize Certificate */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-0.5 text-right">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Palette className="w-4 h-4 text-emerald-700" />
              <span>تخصيص بيانات الشهادة ومجال التكريم</span>
            </h2>
            <p className="text-xs text-slate-500">
              أدخلي اسم الطالبة واختاري الصف ومجال التميز لتحديث الشهادة المطبوعة فوراً.
            </p>
          </div>

          {registeredStudents.length > 0 && (
            <button
              type="button"
              onClick={() => setShowStudentsPicker(!showStudentsPicker)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Users className="w-3.5 h-3.5 text-emerald-700" />
              <span>اختيار من سجل الطالبات المشاركات ({registeredStudents.length})</span>
            </button>
          )}
        </div>

        {/* Quick Students Dropdown Picker */}
        {showStudentsPicker && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                اختاري طالبة من السجل السحابي لتعبئة الشهادة تلقائياً:
              </span>
              <button
                type="button"
                onClick={() => setShowStudentsPicker(false)}
                className="text-[11px] text-slate-500 hover:text-slate-700"
              >
                إغلاق
              </button>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchStudentTerm}
                onChange={(e) => setSearchStudentTerm(e.target.value)}
                placeholder="ابحثي عن اسم الطالبة أو الصف..."
                className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>
            <div className="max-h-44 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {filteredStudents.map((st) => (
                <button
                  key={`${st.name}_${st.grade}`}
                  type="button"
                  onClick={() => {
                    setStudentName(st.name);
                    setGrade(st.grade);
                    setShowStudentsPicker(false);
                  }}
                  className="p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-right text-xs transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <div className="font-bold text-slate-900">{st.name}</div>
                    <div className="text-[10px] text-slate-500">{st.grade}</div>
                  </div>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-right">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              اسم الطالبة المكرمة:
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="مثال: ريم خالد العطوي"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-hidden font-cairo font-bold text-emerald-950"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              الصف الدراسي:
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
            >
              {SCHOOL_GRADES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              مجال التكريم والوسام:
            </label>
            <select
              value={certificateCategory}
              onChange={(e) => setCertificateCategory(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-hidden font-medium"
            >
              <option value="awareness">سفيرة الوعي الوطني والمادة 34</option>
              <option value="values">حامية القيم والثوابت الوطنية</option>
              <option value="missions">بطلة مهمات درع الوطن اليومية</option>
              <option value="creative">التميز الفني في مرسم درع الوطن</option>
              <option value="pledge">ميثاق عهد ووفاء درع الوطن</option>
            </select>
          </div>
        </div>

        {/* Themes Selector */}
        <div className="space-y-2 text-right">
          <label className="block text-xs font-semibold text-slate-700">
            نمط وتصميم الإطار الشرفي:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setCertificateTheme('royal_gold')}
              className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex items-center gap-3 ${
                certificateTheme === 'royal_gold'
                  ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-400/40 text-amber-950'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-emerald-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                👑
              </div>
              <div>
                <div className="text-xs font-bold">النمط الملكي الذهبي</div>
                <div className="text-[10px] text-slate-500">إطار ذهبي مزخرف وخلفية عاجية فاخرة</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setCertificateTheme('emerald_classic')}
              className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex items-center gap-3 ${
                certificateTheme === 'emerald_classic'
                  ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-400/40 text-emerald-950'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-800 to-emerald-950 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                🇸🇦
              </div>
              <div>
                <div className="text-xs font-bold">النمط الزمردي الوطني</div>
                <div className="text-[10px] text-slate-500">أخضر سعودي عميق مع لمسات ذهبية ملكية</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setCertificateTheme('modern_ivory')}
              className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex items-center gap-3 ${
                certificateTheme === 'modern_ivory'
                  ? 'border-slate-400 bg-slate-50 ring-2 ring-slate-300 text-slate-900'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-300 text-slate-800 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs border border-slate-300">
                📜
              </div>
              <div>
                <div className="text-xs font-bold">النمط الأكاديمي المعتمد</div>
                <div className="text-[10px] text-slate-500">تصميم كلاسيكي نظيف مثالي للطباعة وملفات الإنجاز</div>
              </div>
            </button>
          </div>
        </div>

        {/* Optional Custom Appreciation Rationale */}
        <div className="text-right">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700">
              عبارة التقدير وسبب التكريم (اختياري - يمكنكِ تخصيصها):
            </label>
            {customAppreciationText && (
              <button
                type="button"
                onClick={() => setCustomAppreciationText('')}
                className="text-[11px] text-slate-400 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>استعادة النص النموذجي</span>
              </button>
            )}
          </div>
          <input
            type="text"
            value={customAppreciationText}
            onChange={(e) => setCustomAppreciationText(e.target.value)}
            placeholder={selectedCategoryData.defaultReason}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
          />
        </div>
      </div>

      {/* ----------------- THE CERTIFICATE ITSELF (PREVIEW & PRINT CONTAINER) ----------------- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2 print:hidden">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>معاينة حية لشهادة التقدير الرسمية (مقاس A4 أفقي):</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>مشاركة عبر واتساب</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'تم النسخ' : 'نسخ الرابط'}</span>
            </button>
          </div>
        </div>

        {/* CERTIFICATE ARTWORK CANVAS */}
        <div
          ref={certificateRef}
          id="official-student-certificate"
          className={`relative p-8 sm:p-12 md:p-16 rounded-3xl transition-all shadow-2xl overflow-hidden print:shadow-none print:rounded-none print:p-8 print:m-0 print:border-none ${
            certificateTheme === 'royal_gold'
              ? 'bg-radial from-amber-50/90 via-white to-amber-100/60 border-[10px] border-double border-amber-500/80 text-slate-900'
              : certificateTheme === 'emerald_classic'
              ? 'bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 border-[10px] border-double border-amber-400/80 text-white'
              : 'bg-white border-[8px] border-double border-slate-700 text-slate-900'
          }`}
          style={{ minHeight: '620px' }}
        >
          {/* Ornate Corner Accents */}
          <div className="absolute top-3 right-3 w-16 h-16 border-t-4 border-r-4 border-amber-500/70 pointer-events-none rounded-tr-lg" />
          <div className="absolute top-3 left-3 w-16 h-16 border-t-4 border-l-4 border-amber-500/70 pointer-events-none rounded-tl-lg" />
          <div className="absolute bottom-3 right-3 w-16 h-16 border-b-4 border-r-4 border-amber-500/70 pointer-events-none rounded-br-lg" />
          <div className="absolute bottom-3 left-3 w-16 h-16 border-b-4 border-l-4 border-amber-500/70 pointer-events-none rounded-bl-lg" />

          {/* Inner Thin Border */}
          <div className="absolute inset-5 border border-dashed border-amber-500/40 pointer-events-none rounded-2xl" />

          {/* Header Row: Ministry, School, Emblem */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-amber-500/30 pb-6 text-center sm:text-right">
            <div className="space-y-1">
              <p className={`text-xs font-bold tracking-wide ${certificateTheme === 'emerald_classic' ? 'text-emerald-300' : 'text-emerald-900'}`}>
                المَمْلَكَةُ العَرَبِيَّةُ السُّعُودِيَّة
              </p>
              <p className={`text-xs font-bold ${certificateTheme === 'emerald_classic' ? 'text-emerald-200' : 'text-slate-700'}`}>
                وِزَارَةُ التَّعْلِيم · إِدَارَةُ تَعْلِيمِ تَبُوك
              </p>
              <p className={`text-sm font-extrabold ${certificateTheme === 'emerald_classic' ? 'text-amber-300' : 'text-emerald-950'}`}>
                الثَّانَوِيَّةُ الأُولَى بِالبِدْع
              </p>
            </div>

            {/* Emblem Center */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 border-2 border-amber-400 p-1 shadow-md flex items-center justify-center shrink-0">
                <img
                  src={heroShieldImg}
                  alt="شعار درع الوطن"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <span className="text-[11px] font-bold text-amber-500 mt-1">مُبَادَرَةُ دِرْعِ الوَطَن</span>
            </div>

            <div className="space-y-1 text-center sm:text-left">
              <div className="inline-block px-3 py-1 rounded-full bg-amber-400/20 border border-amber-500/40 text-amber-600 text-xs font-bold">
                المَادَّةُ (34)
              </div>
              <p className={`text-[11px] font-medium ${certificateTheme === 'emerald_classic' ? 'text-emerald-300' : 'text-slate-600'}`}>
                النِّظَامُ الأَسَاسِيُّ لِلحُكْم
              </p>
              <p className={`text-[10px] ${certificateTheme === 'emerald_classic' ? 'text-emerald-400/80' : 'text-slate-400'}`}>
                «الدِّفَاعُ عَنِ العَقِيدَةِ وَالمُجْتَمَعِ وَالوَطَنِ وَاجِبٌ»
              </p>
            </div>
          </div>

          {/* Certificate Main Title */}
          <div className="relative z-10 text-center my-6 space-y-2">
            <span className="text-xs sm:text-sm font-bold text-amber-600 tracking-wider">
              ✦ وَثِيقَةُ تَكْرِيمٍ وَاعْتِزَازٍ مَدْرَسِيَّة ✦
            </span>
            <h2 className="text-3xl sm:text-5xl font-black font-calligraphy text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-700 to-amber-600 py-1 drop-shadow-xs">
              شَهَادَةُ شُكْرٍ وَتَقْدِير
            </h2>
            <div className="inline-block px-4 py-1 rounded-full bg-emerald-800 text-amber-300 font-bold text-xs sm:text-sm shadow-xs border border-amber-400/50">
              {selectedCategoryData.badgeIcon} {selectedCategoryData.badgeLabel}
            </div>
          </div>

          {/* Certificate Body & Recipient */}
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4 py-2">
            <p className={`text-sm sm:text-base leading-relaxed ${certificateTheme === 'emerald_classic' ? 'text-emerald-100' : 'text-slate-700'}`}>
              تَسُرُّ إدارة مبادرة «درع الوطن» بالثانوية الأولى بالبدع أن تمنح هذه الشهادة المعتمدة للطالبة النجيبة:
            </p>

            <div className="py-2">
              <div className={`text-2xl sm:text-4xl font-extrabold font-cairo tracking-wide border-b-2 border-dashed border-amber-400/80 inline-block px-8 py-2 min-w-[280px] ${
                certificateTheme === 'emerald_classic' ? 'text-amber-300' : 'text-emerald-950'
              }`}>
                {studentName.trim() || 'اسم الطالبة المكرمة'}
              </div>
              <div className={`text-xs sm:text-sm font-bold mt-2 ${certificateTheme === 'emerald_classic' ? 'text-emerald-200' : 'text-emerald-900'}`}>
                المقيدة بالصف: <span className="font-extrabold text-amber-600">{grade}</span>
              </div>
            </div>

            <p className={`text-xs sm:text-sm leading-loose px-4 max-w-2xl mx-auto font-medium ${
              certificateTheme === 'emerald_classic' ? 'text-emerald-100/90' : 'text-slate-700'
            }`}>
              {finalReasonText}
            </p>
          </div>

          {/* Footer: Official Seal, Verification Stamp & Signatures */}
          <div className="relative z-10 pt-8 mt-6 border-t border-amber-500/30 grid grid-cols-3 items-end gap-4 text-center">
            {/* Signature 1 */}
            <div className="space-y-1 text-right sm:text-center">
              <p className={`text-[11px] ${certificateTheme === 'emerald_classic' ? 'text-emerald-300' : 'text-slate-500'}`}>
                إعداد وتنفيذ المعلمة:
              </p>
              <p className={`font-extrabold text-sm sm:text-base ${certificateTheme === 'emerald_classic' ? 'text-white' : 'text-emerald-950'}`}>
                أمل رشيد
              </p>
              <p className="text-[10px] text-amber-600 font-medium">الثانوية الأولى بالبدع</p>
              <div className="w-16 h-0.5 bg-amber-400 mx-auto mt-1" />
            </div>

            {/* Official Initiative Seal & Principal Approval Center */}
            <div className="flex flex-col items-center justify-center space-y-1.5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-amber-500/80 bg-gradient-to-br from-amber-400/20 to-amber-500/30 flex flex-col items-center justify-center p-2 text-center shadow-inner relative">
                <Shield className="w-5 h-5 text-amber-500 fill-amber-500/20" />
                <span className="text-[8px] font-black text-amber-600 uppercase tracking-tighter">ختم الاعتماد الرسمي</span>
                <span className="text-[7px] text-emerald-800 font-bold">درع الوطن · 1447هـ</span>
              </div>
              <div className="space-y-0.5">
                <p className={`text-[11px] font-bold ${certificateTheme === 'emerald_classic' ? 'text-amber-300' : 'text-emerald-900'}`}>
                  اعتماد مديرة المدرسة:
                </p>
                <p className={`font-extrabold text-xs sm:text-sm ${certificateTheme === 'emerald_classic' ? 'text-white' : 'text-emerald-950'}`}>
                  أ. فاطمة سليمان المسعودي
                </p>
              </div>
              <span className="text-[9px] text-slate-400 font-mono">
                رقم التوثيق: DW-{studentName ? studentName.length * 107 : 3400}-{Date.now().toString().slice(-4)}
              </span>
            </div>

            {/* Signature 2 */}
            <div className="space-y-1 text-left sm:text-center">
              <p className={`text-[11px] ${certificateTheme === 'emerald_classic' ? 'text-emerald-300' : 'text-slate-500'}`}>
                إعداد وتنفيذ المعلمة:
              </p>
              <p className={`font-extrabold text-sm sm:text-base ${certificateTheme === 'emerald_classic' ? 'text-white' : 'text-emerald-950'}`}>
                وفاء الزهراني
              </p>
              <p className="text-[10px] text-amber-600 font-medium">الثانوية الأولى بالبدع</p>
              <div className="w-16 h-0.5 bg-amber-400 mx-auto mt-1" />
            </div>
          </div>

          {/* Date stamp */}
          <div className="relative z-10 text-center pt-6 text-[10px] text-slate-400 font-mono">
            صدرت بتاريخ: {new Date().toLocaleDateString('ar-SA')} م · منصة درع الوطن السحابية بالثانوية الأولى بالبدع
          </div>
        </div>

        {/* Action bar below preview */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-950 hover:from-emerald-700 hover:to-emerald-900 text-white font-bold text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>طباعة الشهادة الآن (ألوان كاملة)</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-bold text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingPdf ? 'جارٍ المعالجة...' : 'حفظ كملف PDF على جهازكِ'}</span>
          </button>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-emerald-700" />
            <span>مشاركة عبر واتساب</span>
          </button>
        </div>
      </div>
    </div>
  );
};
