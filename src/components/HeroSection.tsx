import React from 'react';
import { Shield, BookOpen, PenTool, CheckCircle2, ArrowLeft, Star, Heart, FileText, Award, Sparkles, Gift, Compass } from 'lucide-react';
import shieldImage from '../assets/images/shield_of_nation_hero_1792473197101.jpg';
import { getTodayMission } from '../constants/dailyMissions';
import { Article34Slideshow } from './Article34Slideshow';
import { HomelandGuardiansJourney } from './HomelandGuardiansJourney';

interface HeroSectionProps {
  onNavigate: (tab: 'home' | 'article34' | 'student' | 'book' | 'admin' | 'mission' | 'certificate') => void;
  onSelectStudentSection?: (section: 'text' | 'drawing' | 'survey' | 'quiz' | 'certificate') => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate, onSelectStudentSection }) => {
  const todayMission = getTodayMission();
  return (
    <div className="space-y-12 pb-16">
      {/* Hero Visual Section */}
      <section className="relative overflow-hidden rounded-3xl bg-radial from-emerald-900 via-emerald-950 to-slate-950 text-white shadow-xl border border-amber-500/30">
        {/* Subtle geometric overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-12 sm:py-16 lg:py-20 flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Text and Official Initiative Brief */}
          <div className="lg:w-3/5 space-y-6 text-right">
            {/* School & Leadership & Teachers Trust Strip */}
            <div className="inline-flex flex-wrap items-center gap-2 text-xs sm:text-sm text-emerald-200/90 bg-emerald-800/60 backdrop-blur-xs px-4 py-1.5 rounded-full border border-amber-400/40">
              <span className="font-bold text-amber-300">الثانوية الأولى بالبدع</span>
              <span className="text-amber-400/50" aria-hidden="true">·</span>
              <span>إشراف مديرة المدرسة:</span>
              <span className="font-bold text-white">أ. فاطمة سليمان المسعودي</span>
              <span className="text-amber-400/50 hidden sm:inline" aria-hidden="true">·</span>
              <span className="hidden sm:inline">إعداد وتنفيذ المعلمتين:</span>
              <span className="font-bold text-amber-300 hidden sm:inline">أمل رشيد + وفاء الزهراني</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
                مبادرة <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">«دِرْعُ الوَطَن»</span>
              </h1>
              <p className="text-lg sm:text-xl text-emerald-100/90 font-medium max-w-2xl leading-relaxed">
                المنصة التفاعلية المدرسية للتوعية بالواجب الوطني والمضامين الدستورية المستلهمة من المادة 34 من النظام الأساسي للحكم.
              </p>
            </div>

            {/* Official Article 34 Banner */}
            <div className="p-6 rounded-2xl bg-emerald-900/80 border-2 border-amber-400/50 shadow-inner relative overflow-hidden backdrop-blur-md">
              <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold mb-2">
                <Shield className="w-4 h-4" />
                <span>النص الرسمي المعتمد · المادة (34) من النظام الأساسي للحكم بالمملكة العربية السعودية</span>
              </div>
              <blockquote className="text-lg sm:text-2xl font-calligraphy text-amber-100 font-bold leading-loose text-center py-2 px-2">
                « الدِّفَاعُ عَنِ العَقِيدَةِ الإِسْلَامِيَّةِ، وَالمُجْتَمَعِ، وَالوَطَنِ وَاجِبٌ عَلَى كُلِّ مُوَاطِنٍ، وَيُبَيِّنُ النِّظَامُ أَحْكَامَ الخِدْمَةِ العَسْكَرِيَّةِ. »
              </blockquote>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-emerald-700/50 text-[11px] text-emerald-200/80">
                <span>المصدر: هيئة الخبراء بمجلس الوزراء - الأنظمة السعودية</span>
                <span>الثانوية الأولى بالبدع</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  onNavigate('student');
                  if (onSelectStudentSection) onSelectStudentSection('text');
                }}
                className="px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 cursor-pointer border border-amber-200"
              >
                <PenTool className="w-4 h-4" />
                <span>شاركي الآن في درع الوطن</span>
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('book')}
                className="px-5 py-3.5 rounded-xl font-semibold text-sm bg-emerald-800/80 hover:bg-emerald-800 text-white border border-emerald-600/60 shadow-sm transition-all duration-200 flex items-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span>تصفح الكتاب الرقمي</span>
              </button>

              <button
                onClick={() => onNavigate('article34')}
                className="px-4 py-3.5 rounded-xl font-medium text-xs text-emerald-200 hover:text-white transition-colors cursor-pointer"
              >
                <span>شرح المادة 34 وأبعادها الدستورية ←</span>
              </button>
            </div>
          </div>

          {/* Majestic Shield Graphic */}
          <div className="lg:w-2/5 flex flex-col items-center justify-center">
            <div className="relative group w-full max-w-[340px] sm:max-w-[380px]">
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-400/30 to-emerald-400/30 rounded-3xl blur-xl group-hover:blur-2xl transition duration-500 opacity-70" />
              <img
                src={shieldImage}
                alt="درع الوطن - شعار المبادرة الوطني"
                referrerPolicy="no-referrer"
                className="relative w-full aspect-square rounded-2xl shadow-2xl border-2 border-amber-400/60 object-cover transform hover:scale-[1.02] transition-transform duration-300"
              />
            </div>
            <div className="mt-4 text-center">
              <p className="text-xs text-emerald-200/90 font-medium">
                رمز الدرع الوطني السعودي · ثانوية البدع الأولى
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Prominent Daily Mission Card «مهمة اليوم» */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-950 to-slate-900 border-2 border-amber-400/60 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-right flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 text-xs font-black flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>مَهَمَّةُ اليَوْم</span>
              </span>
              <span className="px-3 py-0.5 rounded-full bg-emerald-800/80 border border-emerald-500/40 text-emerald-200 text-xs font-bold">
                {todayMission.type === 'scenario' ? 'موقف وطني ومواطنة رقمية' : todayMission.type === 'riddle' ? 'لغز وطني فكري' : 'سؤال الدستور والمادة 34'}
              </span>
              <span className="px-3 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-extrabold">
                +{todayMission.points} نقطة درع
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white font-calligraphy">
              {todayMission.title}
            </h3>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium line-clamp-2 max-w-2xl">
              {todayMission.scenarioContext || todayMission.question}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-amber-300/90 pt-1">
              <span className="flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>رحلة حماة الوطن (6 محطات)</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Gift className="w-3.5 h-3.5 text-amber-400" />
                <span>صندوق مفاجآت أسبوعي</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>شارتي «سفيرة الوعي» و«حامية القيم»</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full lg:w-auto">
            <button
              onClick={() => onNavigate('mission')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-black text-sm shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border border-amber-200 transform hover:scale-[1.02]"
            >
              <Shield className="w-4 h-4 fill-emerald-950" />
              <span>خوض مهمة اليوم الآن</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Homeland Guardians Journey Map «رحلة حماة الوطن» */}
      <HomelandGuardiansJourney
        onNavigate={onNavigate}
        onSelectStudentSection={onSelectStudentSection}
      />

      {/* Interactive Visual Awareness Slideshow - رحلة توعوية حول المادة 34 */}
      <Article34Slideshow
        onNavigate={onNavigate}
        onSelectStudentSection={onSelectStudentSection}
      />

      {/* Main Pillars Navigation Cards */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-700 tracking-wider">خريطة المنصة والأنشطة</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              بوابات المشاركة والتفاعل للطالبات
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md">
            جميع المشاركات تحفظ مباشرة في قاعدة البيانات السحابية وتراجعها المعلمتان: أمل رشيد + وفاء الزهراني.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Card 1: Text Participation */}
          <div
            onClick={() => {
              onNavigate('student');
              if (onSelectStudentSection) onSelectStudentSection('text');
            }}
            className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white transition-colors duration-200">
                <PenTool className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                1. المشاركات والخواطر
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                سطري رسالة ولاء واعتزاز للوطن، وتأملاتك الفكرية حول واجب الدفاع عن العقيدة والوطن في ضوء المادة 34.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700">
              <span>اكتبي رسالتك</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Interactive Drawing Board */}
          <div
            onClick={() => {
              onNavigate('student');
              if (onSelectStudentSection) onSelectStudentSection('drawing');
            }}
            className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-200">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                2. مرسم درع الوطن
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                مرسم تفاعلي للرسم بالألوان الوطنية، أو رفع تصاميمك ورسوماتك الوطنية لحفظها في السجل السحابي.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-amber-700">
              <span>افتحي المرسم</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Interactive Surveys */}
          <div
            onClick={() => {
              onNavigate('student');
              if (onSelectStudentSection) onSelectStudentSection('survey');
            }}
            className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 group-hover:bg-blue-700 group-hover:text-white transition-colors duration-200">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-800 transition-colors">
                3. الاستبانة وقياس الأثر
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                استبانة قبلية وبعدية لقياس مستوى المعرفة بالواجب الدستوري والمادة 34 وتقييم تطور الوعي الوطني.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-700">
              <span>تعبئة الاستبانة</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Digital Book */}
          <div
            onClick={() => onNavigate('book')}
            className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 group-hover:bg-emerald-800 group-hover:text-white transition-colors duration-200">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                4. الكتاب الرقمي
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                كتاب تصفح رقمي يوثق مضامين المبادرة، إشراف مديرة المدرسة: أ. فاطمة سليمان المسعودي، إعداد المعلمتين: أمل رشيد ووفاء الزهراني.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-800">
              <span>تصفح الكتاب</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 5: Official Appreciation Certificates */}
          <div
            onClick={() => onNavigate('certificate')}
            className="group p-5 rounded-2xl bg-radial from-amber-50 to-white border-2 border-amber-300 hover:border-amber-500 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-400 text-emerald-950 font-black text-[9px]">
              رسمي ✦
            </div>
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-emerald-950 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                5. شهادات التقدير
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                إصدار وطباعة شهادات التكريم والاعتزاز الوطني الرسمية المعتمدة باسم الطالبة وإدارة المدرسة (أ. فاطمة سليمان المسعودي) والمعلمتين بصيغة PDF.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between text-xs font-bold text-amber-800">
              <span>إصدار الشهادة الآن</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Initiative Credential Banner */}
      <section className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-amber-400/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-right">
            <span className="text-amber-400 text-xs font-bold">التوثيق المدرسي المعتمد</span>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              الثانوية الأولى بالبدع · مبادرة درع الوطن
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
              إشراف مديرة المدرسة: <strong className="text-white">أ. فاطمة سليمان المسعودي</strong> · إعداد وتنفيذ المعلمتين: <strong className="text-amber-300">أمل رشيد</strong> + <strong className="text-amber-300">وفاء الزهراني</strong>.
              نظام توعوي تفاعلي لحفظ مشاركات الطالبات، ومنحهن أوسمة الشرف وشهادات الشكر والاعتزاز.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                onNavigate('student');
                if (onSelectStudentSection) onSelectStudentSection('certificate');
              }}
              className="px-5 py-3 rounded-xl bg-amber-400 text-emerald-950 font-bold text-xs sm:text-sm hover:bg-amber-300 transition-colors flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Award className="w-4 h-4" />
              <span>إصدار شهادة الاعتزاز الرقمية</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
