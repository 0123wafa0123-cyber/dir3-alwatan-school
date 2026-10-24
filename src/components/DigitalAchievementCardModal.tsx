import React from 'react';
import {
  X,
  Printer,
  Shield,
  Award,
  Sparkles,
  Star,
  Compass,
  CheckCircle2,
  Calendar,
  School,
  UserCheck
} from 'lucide-react';
import { StudentMissionProgress } from '../types';
import { SHIELD_JOURNEY_STATIONS } from '../constants/dailyMissions';

interface DigitalAchievementCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  grade: string;
  progress: StudentMissionProgress;
}

export const DigitalAchievementCardModal: React.FC<DigitalAchievementCardModalProps> = ({
  isOpen,
  onClose,
  studentName,
  grade,
  progress
}) => {
  if (!isOpen) return null;

  const currentStation = SHIELD_JOURNEY_STATIONS.find((s) => s.id === progress.unlockedStations) || SHIELD_JOURNEY_STATIONS[0];

  const handlePrint = () => {
    window.print();
  };

  const badges = [
    {
      id: 'ambassador_awareness',
      title: 'سفيرة الوعي',
      icon: Compass,
      unlocked: progress.completedMissionsCount >= 1,
      desc: 'إتقان مضامين المادة 34 ونشر الوعي الدستوري'
    },
    {
      id: 'values_guardian',
      title: 'حامية القيم',
      icon: Shield,
      unlocked: progress.completedMissionsCount >= 2,
      desc: 'حماية المجتمع من الشائعات وصيانة الثوابت'
    },
    {
      id: 'participation_star',
      title: 'نجمة المشاركة',
      icon: Star,
      unlocked: progress.completedMissionsCount >= 3,
      desc: 'المثابرة في إنجاز 3 مهمات وطنية متتالية'
    },
    {
      id: 'impact_maker',
      title: 'صانعة الأثر',
      icon: Award,
      unlocked: progress.completedMissionsCount >= 5 || progress.totalPoints >= 120,
      desc: 'الريادة المدرسية وصناعة الأثر الإيجابي بالفصل'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-amber-400/40 overflow-hidden my-8 print:border-none print:shadow-none print:my-0">
        {/* Modal Controls (Hidden in print) */}
        <div className="flex items-center justify-between p-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm">بطاقة إنجاز حامية الوطن الرقمية</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة / حفظ كـ PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Card Container */}
        <div id="printable-achievement-card" className="p-8 sm:p-10 bg-radial from-emerald-950 via-slate-950 to-emerald-950 text-white relative overflow-hidden border-8 border-double border-amber-400/60 print:bg-white print:text-slate-900 print:border-amber-600">
          {/* Subtle Islamic / Geometric pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

          {/* Golden Corner Accents */}
          <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-400" />
          <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-400" />
          <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-400" />
          <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-400" />

          {/* Header */}
          <div className="text-center space-y-2 pb-6 border-b border-amber-500/30">
            <div className="flex items-center justify-between text-[11px] text-amber-300 font-semibold print:text-slate-600">
              <div className="flex items-center gap-1.5">
                <School className="w-3.5 h-3.5" />
                <span>المملكة العربية السعودية · وزارة التعليم</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date().toLocaleDateString('ar-SA')}</span>
              </div>
            </div>

            <div className="py-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold mb-2">
                <Shield className="w-3.5 h-3.5" />
                <span>مبادرة «دِرْعُ الوَطَن» التفاعلية المدرسية</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 font-calligraphy print:text-emerald-950">
                بِطَاقَةُ إِنجَازِ حَامِيَةِ الوَطَن
              </h2>
              <p className="text-xs text-emerald-200/90 font-medium print:text-slate-700">
                سجل المنجزات الوطنية لرحلة «حماة الوطن» والتوعية بالمادة (34) من النظام الأساسي للحكم
              </p>
            </div>
          </div>

          {/* Student Profile Identity */}
          <div className="my-6 p-5 rounded-2xl bg-emerald-900/40 border border-amber-400/30 backdrop-blur-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right print:bg-slate-50 print:border-slate-300">
            <div>
              <span className="text-xs text-amber-300/80 font-bold block mb-1">اسم الطالبة المتميزة:</span>
              <h3 className="text-xl sm:text-2xl font-black text-white print:text-slate-900">
                {studentName || 'طالبة درع الوطن'}
              </h3>
              <p className="text-xs text-emerald-200 print:text-slate-600 mt-0.5">
                {grade || 'المرحلة الثانوية'} · الثانوية الأولى بالبدع
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-center px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-400/40">
                <span className="text-[10px] text-amber-200 block font-bold">نقاط الدرع</span>
                <span className="text-2xl font-black text-amber-300">{progress.totalPoints}</span>
              </div>
              <div className="text-center px-4 py-2 rounded-xl bg-emerald-800/40 border border-emerald-400/30">
                <span className="text-[10px] text-emerald-200 block font-bold">المهمات المنجزة</span>
                <span className="text-2xl font-black text-white">{progress.completedMissionsCount}</span>
              </div>
            </div>
          </div>

          {/* Current Journey Milestone */}
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-transparent border-r-4 border-amber-400">
            <span className="text-xs text-amber-300 font-bold block mb-1">الرتبة المكتسبة في «رحلة حماة الوطن»:</span>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span className="font-extrabold text-base text-white print:text-slate-900">
                {currentStation.title} — {currentStation.subtitle}
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/90 mt-1 print:text-slate-600">
              {currentStation.description}
            </p>
          </div>

          {/* Digital Badges Showcase */}
          <div className="space-y-3 mb-6">
            <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5 print:text-slate-800">
              <Award className="w-4 h-4 text-amber-400" />
              <span>الأوسمة والشارات الرقمية المعتمدة:</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {badges.map((b) => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.id}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      b.unlocked
                        ? 'bg-emerald-900/60 border-amber-400/60 shadow-md print:bg-emerald-50 print:border-emerald-300'
                        : 'bg-slate-900/40 border-slate-700/50 opacity-50 grayscale print:bg-slate-100'
                    }`}
                  >
                    <div className="w-9 h-9 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-emerald-950 flex items-center justify-center mb-1.5 shadow-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-white block mb-0.5 print:text-slate-900">
                      {b.title}
                    </span>
                    <span className="text-[10px] text-emerald-200 block leading-tight print:text-slate-600">
                      {b.unlocked ? 'مكتملة ✓' : 'تنتظر الفتح'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Official Quote of Article 34 */}
          <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-600/40 text-center mb-6 print:bg-slate-50 print:border-slate-300">
            <p className="text-xs text-amber-200 font-calligraphy leading-relaxed print:text-emerald-900">
              «الدفاع عن العقيدة الإسلامية، والمجتمع، والوطن واجب على كل مواطن، ويبين النظام أحكام الخدمة العسكرية.»
            </p>
            <span className="text-[10px] text-emerald-300/80 block mt-1">
              المادة (34) من النظام الأساسي للحكم بالمملكة العربية السعودية
            </span>
          </div>

          {/* Footer & Teachers Trust Seal */}
          <div className="pt-4 border-t border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
            <div className="space-y-0.5">
              <span className="text-[10px] text-emerald-300 font-bold block">إشراف مديرة المدرسة: أ. فاطمة سليمان المسعودي</span>
              <span className="text-[10px] text-amber-300/80 font-bold block">إعداد وتنفيذ المعلمتين:</span>
              <p className="text-xs font-extrabold text-white print:text-slate-900">
                أمل رشيد + وفاء الزهراني
              </p>
              <p className="text-[10px] text-emerald-300 print:text-slate-600">الثانوية الأولى بالبدع</p>
            </div>

            <div className="inline-flex items-center gap-1.5 text-xs text-amber-300 font-bold bg-amber-400/10 px-3 py-1.5 rounded-full border border-amber-400/30">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>معتمد رسمياً في منصة درع الوطن</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
