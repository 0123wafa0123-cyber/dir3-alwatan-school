import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Shield,
  BookOpen,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  Compass,
  Heart,
  Users,
  Award,
  CheckCircle2,
  Star,
  ArrowLeft,
  Scale,
  Building2,
  Lock,
  Layers,
  GraduationCap
} from 'lucide-react';

export interface SlideItem {
  id: number;
  stageNumber: string;
  badge: string;
  title: string;
  subtitle: string;
  quote?: string;
  source?: string;
  description: string;
  pillars: {
    icon: React.ElementType;
    title: string;
    detail: string;
  }[];
  studentActionTitle: string;
  studentActionDetail: string;
  ctaText: string;
  targetTab: 'article34' | 'student' | 'book' | 'mission' | 'certificate';
  targetSection?: 'text' | 'drawing' | 'survey' | 'quiz' | 'certificate';
  bgGradient: string;
  accentColor: string;
  borderGlow: string;
  iconBg: string;
  graphicBadgeIcon: React.ElementType;
}

interface Article34SlideshowProps {
  onNavigate: (tab: 'home' | 'article34' | 'student' | 'book' | 'admin' | 'mission' | 'certificate') => void;
  onSelectStudentSection?: (section: 'text' | 'drawing' | 'survey' | 'quiz' | 'certificate') => void;
}

export const Article34Slideshow: React.FC<Article34SlideshowProps> = ({
  onNavigate,
  onSelectStudentSection
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const SLIDE_DURATION = 6500; // 6.5 seconds per slide
  const [progress, setProgress] = useState<number>(0);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const slides: SlideItem[] = [
    {
      id: 1,
      stageNumber: 'المحطة الأولى',
      badge: 'النص الدستوري المعتمد',
      title: 'الركيزة الدستورية وميثاق الشرف الوطني',
      subtitle: 'المادة (34) من النظام الأساسي للحكم بالمملكة العربية السعودية',
      quote: '« الدِّفَاعُ عَنِ العَقِيدَةِ الإِسْلَامِيَّةِ، وَالمُجْتَمَعِ، وَالوَطَنِ وَاجِبٌ عَلَى كُلِّ مُوَاطِنٍ، وَيُبَيِّنُ النِّظَامُ أَحْكَامَ الخِدْمَةِ العَسْكَرِيَّةِ. »',
      source: 'هيئة الخبراء بمجلس الوزراء - الباب الخامس (الحقوق والواجبات)',
      description: 'نص دستوري رفيع يحدد الواجب المقدس لكل مواطن ومواطنة تجاه أقدس ثوابت هذه الأرض الطاهرة: الدين الحنيف، ولحمة المجتمع، وتراب الوطن الغالي.',
      pillars: [
        {
          icon: Scale,
          title: 'العموم والشمولية',
          detail: 'واجب على كل مواطن ومواطنة بلا استثناء؛ فكل فرد في موقعه ثغر من ثغور الوطن.'
        },
        {
          icon: Shield,
          title: 'الثلاثية المقدسة',
          detail: 'الدفاع عن العقيدة، الدفاع عن المجتمع، والدفاع عن الوطن؛ منظومة متكاملة لا تنفصم.'
        },
        {
          icon: Lock,
          title: 'الأصالة النظامية',
          detail: 'إرساء حكم القانون وتبيان أحكام الخدمة العسكرية صوناً لسيادة المملكة.'
        }
      ],
      studentActionTitle: 'دور طالبة الثانوية الأولى بالبدع:',
      studentActionDetail: 'استيعاب أبعاد المادة 34 ونشر الوعي بمضامينها بين زميلاتكِ وأسرتكِ كحامية فكرية ودستورية.',
      ctaText: 'استكشاف الأبعاد الدستورية للمادة 34',
      targetTab: 'article34',
      bgGradient: 'from-emerald-950 via-slate-950 to-emerald-950',
      accentColor: 'text-amber-400',
      borderGlow: 'border-amber-400/50 shadow-amber-500/10',
      iconBg: 'bg-gradient-to-br from-amber-400 to-amber-600 text-emerald-950',
      graphicBadgeIcon: Shield
    },
    {
      id: 2,
      stageNumber: 'المحطة الثانية',
      badge: 'الركن الأول: العقيدة',
      title: 'الدفاع عن العقيدة الإسلامية وصيانة الهوية',
      subtitle: 'الحصانة الفكرية والروحية ضد التطرف والغلو',
      description: 'المملكة مهبط الوحي وقبلة المسلمين، والدفاع عن عقيدتها الإسلامية الصافية هو أسمى الواجبات، ويتحقق بالتمسك بكتاب الله وسنة نبيه ﷺ، ونبذ الغلو والأفكار المنحرفة.',
      pillars: [
        {
          icon: Star,
          title: 'الاعتدال والوسطية',
          detail: 'ترسيخ المنهج الإسلامي الوسطي المعتدل القائم على التسامح والرحمة وعمارة الأرض.'
        },
        {
          icon: Lock,
          title: 'الحصانة الفكرية',
          detail: 'اليقظة تجاه التيارات المنحرفة والحروب الثقافية ومحاولات المساس بالثوابت الدينية.'
        },
        {
          icon: Heart,
          title: 'القدوة الحسنة',
          detail: 'تجسيد الأخلاق الإسلامية السامية في السلوك اليومي والتعامل الراقي داخل وخارج المدرسة.'
        }
      ],
      studentActionTitle: 'الممارسة التطبيقية للطالبة:',
      studentActionDetail: 'التسلح بالعلم الشرعي السليم، والافتخار بالهوية الإسلامية، ورفض أي أفكار مشبوهة أو مضللة.',
      ctaText: 'خوض مهمة الوعي الفكري اليومية',
      targetTab: 'mission',
      bgGradient: 'from-emerald-900 via-emerald-950 to-slate-950',
      accentColor: 'text-emerald-300',
      borderGlow: 'border-emerald-400/50 shadow-emerald-500/10',
      iconBg: 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950',
      graphicBadgeIcon: Compass
    },
    {
      id: 3,
      stageNumber: 'المحطة الثالثة',
      badge: 'الركن الثاني: المجتمع',
      title: 'حماية اللحمة الوطنية والنسيج الاجتماعي',
      subtitle: 'التماسك الأسري، محاربة الشائعات، والمواطنة الرقمية الواعية',
      description: 'المجتمع السعودي جسد واحد متماسك كالدرع الحصين؛ والدفاع عنه يعني صيانة وحدته وتماسكه، والتصدي للشائعات، ونبذ كل ما يثير الفرقة أو يمس الاستقرار المجتمعي.',
      pillars: [
        {
          icon: Users,
          title: 'اللحمة الوطنية',
          detail: 'تعزيز روح الأخوة الصادقة والترابط بين جميع أبناء وبنات الوطن من شماله لجنوبه ومن شرقه لغربه.'
        },
        {
          icon: Shield,
          title: 'مكافحة الشائعات',
          detail: 'التحري والدقة وعدم تداول الأخبار مجهولة المصدر في شبكات التواصل الاجتماعي.'
        },
        {
          icon: CheckCircle2,
          title: 'التكافل والمسؤولية',
          detail: 'المشاركة الفاعلة في المبادرات المدرسية والمجتمعية التي تساند الأسرة والوطن.'
        }
      ],
      studentActionTitle: 'الممارسة التطبيقية للطالبة:',
      studentActionDetail: 'كوني عيناً واعية في الفضاء الرقمي، وحافظي على الألفة والمحبة في بيئتكِ المدرسية ببدع المجد.',
      ctaText: 'المشاركة في استبانة قياس الأثر والوعي',
      targetTab: 'student',
      targetSection: 'survey',
      bgGradient: 'from-blue-950 via-slate-950 to-emerald-950',
      accentColor: 'text-blue-300',
      borderGlow: 'border-blue-400/50 shadow-blue-500/10',
      iconBg: 'bg-gradient-to-br from-blue-400 to-emerald-500 text-slate-950',
      graphicBadgeIcon: Users
    },
    {
      id: 4,
      stageNumber: 'المحطة الرابعة',
      badge: 'الركن الثالث: الوطن',
      title: 'صيانة السيادة والافتخار بمكتسبات النماء',
      subtitle: 'حماية مقدرات المملكة ورسم مستقبل رؤية 2030 الطموحة',
      description: 'الوطن هو الأرض والتاريخ والسيادة والقيادة؛ والدفاع عنه يتحقق بحفظ ثرواته، وتنمية مقدراته، والريادة في العلوم والتقنية، ليبقى وطننا شامخاً في مصاف الأمم المتقدمة.',
      pillars: [
        {
          icon: Building2,
          title: 'صون المنجزات الوطنية',
          detail: 'الحفاظ على المرافق العامة ومقدرات التنمية والاستدامة التي بنتها القيادة الرشيدة.'
        },
        {
          icon: Sparkles,
          title: 'تحقيق مستهدفات الرؤية',
          detail: 'التفوق المعرفي والتقني للإسهام في مسيرة التحول الوطني الطموحة بقيادة سمو ولي العهد.'
        },
        {
          icon: Award,
          title: 'الولاء للقيادة الرشيدة',
          detail: 'الالتفاف الصادق حول خادم الحرمين الشريفين وولي عهده الأمين حفظهما الله.'
        }
      ],
      studentActionTitle: 'الممارسة التطبيقية للطالبة:',
      studentActionDetail: 'تخليد مشاعر الفخر والتضحية برسمة وطنية في المرسم أو كتابة رسالة ولاء معتمدة.',
      ctaText: 'المشاركة في مرسم درع الوطن الرقمي',
      targetTab: 'student',
      targetSection: 'drawing',
      bgGradient: 'from-emerald-950 via-amber-950/40 to-slate-950',
      accentColor: 'text-amber-300',
      borderGlow: 'border-amber-400/50 shadow-amber-500/10',
      iconBg: 'bg-gradient-to-br from-amber-400 to-yellow-300 text-emerald-950',
      graphicBadgeIcon: Building2
    },
    {
      id: 5,
      stageNumber: 'المحطة الخامسة',
      badge: 'الركن الرابع: الخدمة العسكرية',
      title: 'منظومة الدفاع الشامل وتكامل أدوار الحماة',
      subtitle: '«ويبين النظام أحكام الخدمة العسكرية» · تكامل الثغور والجبهة الداخلية',
      description: 'يقف أبطال قواتنا المسلحة ورجال أمننا البواسل سياجاً منيعاً على حدود الوطن وفي سمائه وبحاره، ويتكامل دور كل مواطنة بدعمهم بالدعاء، وصون الجبهة الداخلية من أي اختراق فكري أو إعلامي.',
      pillars: [
        {
          icon: Shield,
          title: 'حماة الثغور الأشاوس',
          detail: 'إكبار وإجلال لتضحيات القوات العسكرية والأمنية التي تبذل الأرواح فداءً لراية التوحيد.'
        },
        {
          icon: Layers,
          title: 'الأمن الشامل',
          detail: 'الأمن العسكري، والأمن الفكري، والأمن السيبراني، والأمن الاقتصادي؛ خطوط دفاع مترابطة.'
        },
        {
          icon: Heart,
          title: 'الجبهة الداخلية الصامدة',
          detail: 'تماسك المجتمع ووقوفه سداً منيعاً خلف قيادته وقواته المسلحة في كل الظروف.'
        }
      ],
      studentActionTitle: 'الممارسة التطبيقية للطالبة:',
      studentActionDetail: 'الوعي بأن الفتاة السعودية هي حارسة الوعي المنزلي والمدرسي، وشريكة حقيقية في أمن الوطن الشامل.',
      ctaText: 'التحدي الدستوري وحصد وسام الحامية',
      targetTab: 'student',
      targetSection: 'quiz',
      bgGradient: 'from-slate-950 via-emerald-950 to-slate-900',
      accentColor: 'text-emerald-400',
      borderGlow: 'border-emerald-500/50 shadow-emerald-600/10',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-400 text-slate-950',
      graphicBadgeIcon: Shield
    },
    {
      id: 6,
      stageNumber: 'المحطة السادسة',
      badge: 'الخلاصة والريادة المدرسية',
      title: 'أنا طالبة الثانوية الأولى بالبدع.. أنا درع الوطن',
      subtitle: 'إشراف مديرة المدرسة: أ. فاطمة المسعودي · إعداد المعلمتين: أمل رشيد + وفاء الزهراني',
      description: 'هنا يتجسد معنى المبادرة: أن تكون كل طالبة من طالبات ثانوية البدع الأولى رمزاً للوعي الوطني، حاملةً راية العلم والمعرفة، معتزةً بدينها ووطنها، مساهمةً بإيجابية في بناء مجتمعها.',
      pillars: [
        {
          icon: GraduationCap,
          title: 'العلم سلاح ودرع',
          detail: 'الاجتهاد الأكاديمي والتفوق العلمي هو أعظم إسهام تقدمه الطالبة لمستقبل بلادها.'
        },
        {
          icon: Award,
          title: 'الأوسمة وشهادات الاعتزاز',
          detail: 'حصد أوسمة التميز وإصدار شهادة التقدير الرسمية المعتمدة باسمكِ واسم مدرستكِ.'
        },
        {
          icon: Sparkles,
          title: 'العهد وميثاق الوفاء',
          detail: 'المعاهدة على الإخلاص لله ثم لولاة الأمر، وأن تظلي درعاً حصيناً لدينكِ ووطنكِ دائماً.'
        }
      ],
      studentActionTitle: 'خطوتكِ الآن:',
      studentActionDetail: 'سجّلي مشاركتكِ الفاعلة اليوم وأصدري شهادة الشكر والاعتزاز الوطنية المعتمدة من إدارة المدرسة!',
      ctaText: 'إصدار شهادة التقدير والاعتزاز الآن',
      targetTab: 'certificate',
      bgGradient: 'from-emerald-950 via-amber-950/60 to-emerald-950',
      accentColor: 'text-amber-400',
      borderGlow: 'border-amber-400 shadow-amber-500/20',
      iconBg: 'bg-gradient-to-br from-amber-400 via-amber-300 to-yellow-400 text-emerald-950',
      graphicBadgeIcon: Award
    }
  ];

  const currentSlide = slides[currentSlideIndex];

  // Next / Previous navigation
  const handleNext = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    setProgress(0);
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
    setProgress(0);
  }, [slides.length]);

  const handleSelectSlide = (index: number) => {
    setCurrentSlideIndex(index);
    setProgress(0);
  };

  // Progress Bar timer logic
  useEffect(() => {
    if (!isPlaying) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    const intervalStep = 50; // update progress every 50ms
    const stepIncrement = (intervalStep / SLIDE_DURATION) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + stepIncrement;
      });
    }, intervalStep);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPlaying, handleNext]);

  // Touch Swipe Handlers for mobile users
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    // In RTL, left swipe goes to next, right swipe goes to prev
    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleCtaClick = (slide: SlideItem) => {
    onNavigate(slide.targetTab);
    if (slide.targetSection && onSelectStudentSection) {
      onSelectStudentSection(slide.targetSection);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const GraphicIcon = currentSlide.graphicBadgeIcon;

  return (
    <section className="space-y-4">
      {/* Header and Controls Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-right">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-800 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>العرض التفاعلي المرئي الشامل</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            رحلة وعي: المادة 34 من النظام الأساسي للحكم
          </h2>
          <p className="text-xs text-slate-500">
            جولة بصرية توعوية تستعرض أبعاد الواجب الدستوري ودور طالبة ثانوية البدع الأولى في حماية العقيدة والمجتمع والوطن.
          </p>
        </div>

        {/* Playback Controls & Navigation Buttons */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          {/* Pause / Play Toggle */}
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            title={isPlaying ? 'إيقاف التشغيل التلقائي' : 'تشغيل العرض التلقائي'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden md:inline">إيقاف مؤقت</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                <span className="hidden md:inline">تشغيل العرض</span>
              </>
            )}
          </button>

          {/* Prev Slide (In RTL, Prev is right arrow) */}
          <button
            type="button"
            onClick={handlePrev}
            className="p-2.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200 shadow-xs transition-all cursor-pointer hover:border-emerald-400"
            title="المحطة السابقة"
            aria-label="المحطة السابقة"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Slide Indicator Counter */}
          <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-mono font-bold">
            {currentSlideIndex + 1} / {slides.length}
          </span>

          {/* Next Slide (In RTL, Next is left arrow) */}
          <button
            type="button"
            onClick={handleNext}
            className="p-2.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200 shadow-xs transition-all cursor-pointer hover:border-emerald-400"
            title="المحطة التالية"
            aria-label="المحطة التالية"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Slideshow Stage Card */}
      <div
        className={`relative overflow-hidden rounded-3xl bg-radial ${currentSlide.bgGradient} text-white shadow-2xl border-2 ${currentSlide.borderGlow} transition-all duration-500`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Animated Top Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-black/40 z-30">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        {/* Slide Content Body */}
        <div className="relative z-10 p-6 sm:p-10 lg:p-12 space-y-8 text-right">
          {/* Top Stage & Category Tag */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1 rounded-full bg-amber-400 text-emerald-950 font-black text-xs shadow-xs">
                {currentSlide.stageNumber}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-emerald-200 border border-white/10 text-xs font-bold">
                {currentSlide.badge}
              </span>
            </div>

            <div className="text-xs text-emerald-200/80 font-medium">
              مبادرة درع الوطن · الثانوية الأولى بالبدع
            </div>
          </div>

          {/* Hero Section of the Slide */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Main Text & Quotes */}
            <div className="lg:col-span-8 space-y-4">
              <h3 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white font-calligraphy leading-tight">
                {currentSlide.title}
              </h3>

              <p className={`text-sm sm:text-base font-semibold ${currentSlide.accentColor}`}>
                {currentSlide.subtitle}
              </p>

              {/* Special Quote Box if Available */}
              {currentSlide.quote && (
                <div className="p-5 rounded-2xl bg-emerald-900/60 border-2 border-amber-400/50 shadow-inner backdrop-blur-xs space-y-2">
                  <blockquote className="text-base sm:text-xl font-bold font-calligraphy text-amber-100 text-center leading-loose">
                    {currentSlide.quote}
                  </blockquote>
                  {currentSlide.source && (
                    <div className="text-[11px] text-emerald-200/90 text-left font-medium">
                      المصدر: {currentSlide.source}
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                {currentSlide.description}
              </p>
            </div>

            {/* Emblem Card and Visual Badge */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl border-4 border-amber-400/60 bg-gradient-to-br from-emerald-900/90 via-emerald-950 to-slate-950 shadow-2xl flex flex-col items-center justify-center p-4 relative group transform hover:scale-105 transition-transform duration-300">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${currentSlide.iconBg} flex items-center justify-center shadow-lg mb-2`}>
                  <GraphicIcon className="w-9 h-9 sm:w-11 sm:h-11" />
                </div>
                <span className="text-xs font-black text-amber-300 text-center">
                  {currentSlide.stageNumber}
                </span>
                <span className="text-[10px] text-emerald-200/80 text-center line-clamp-1">
                  {currentSlide.badge}
                </span>
              </div>
            </div>
          </div>

          {/* 3 Constitutional Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
            {currentSlide.pillars.map((pillar, idx) => {
              const PillarIcon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 backdrop-blur-xs transition-colors duration-200 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/30">
                      <PillarIcon className="w-4 h-4" />
                    </div>
                    <h5 className="text-xs font-bold text-white">{pillar.title}</h5>
                  </div>
                  <p className="text-[11px] text-emerald-100/80 leading-relaxed">
                    {pillar.detail}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Student Role Action Bar & CTA */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-900/70 border border-amber-400/40 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-right flex-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{currentSlide.studentActionTitle}</span>
              </div>
              <p className="text-xs text-emerald-100 leading-relaxed">
                {currentSlide.studentActionDetail}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleCtaClick(currentSlide)}
              className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-black text-xs shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 border border-amber-200 transform hover:scale-[1.02]"
            >
              <span>{currentSlide.ctaText}</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slide Stage Indicators (Mini Stepper Strip) */}
        <div className="bg-slate-950/80 backdrop-blur-md border-t border-white/10 px-4 py-3">
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectSlide(idx)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  currentSlideIndex === idx
                    ? 'bg-amber-400 text-emerald-950 font-black shadow-sm ring-2 ring-amber-300'
                    : 'bg-white/5 hover:bg-white/15 text-slate-300 border border-white/10'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  currentSlideIndex === idx ? 'bg-emerald-950 text-amber-400' : 'bg-white/20 text-white'
                }`}>
                  {idx + 1}
                </span>
                <span>{s.badge}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
