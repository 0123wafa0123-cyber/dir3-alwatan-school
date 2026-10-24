import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Heart,
  Award,
  Search,
  Filter,
  Eye,
  Share2,
  CheckCircle2,
  MessageCircle,
  Crown,
  Maximize2,
  X,
  Palette,
  PenTool,
  Bookmark,
  Calendar,
  UserCheck,
  Send,
  Printer,
  ChevronLeft,
  Shield
} from 'lucide-react';
import { Submission, TeacherUser } from '../types';
import { SCHOOL_GRADES } from '../constants/grades';
import { api } from '../services/api';
import studentPaintingImg from '../assets/images/student_national_painting_1792870985267.jpg';
import calligraphyArtImg from '../assets/images/calligraphy_art_piece_1792871005873.jpg';
import shieldHeroImg from '../assets/images/shield_of_nation_hero_1792473197101.jpg';

interface ExhibitionItem {
  id: string;
  studentName: string;
  grade: string;
  type: 'drawing' | 'text';
  title: string;
  content: string;
  imageUrl?: string;
  backgroundTemplate?: string;
  createdAt: string;
  likesCount: number;
  teacherLikes: {
    teacherId: string;
    teacherName: string;
    role: string;
    likedAt: string;
    comment?: string;
  }[];
  isFeatured?: boolean;
  stationTag?: string;
}

interface VirtualExhibitionGalleryProps {
  onOpenCertificateHub?: (name: string, grade: string) => void;
  activeTeacher?: TeacherUser | null;
}

export const VirtualExhibitionGallery: React.FC<VirtualExhibitionGalleryProps> = ({
  onOpenCertificateHub,
  activeTeacher = null
}) => {
  // Exhibition View Controls
  const [activeCategory, setActiveCategory] = useState<'all' | 'drawing' | 'text' | 'teacher_picks'>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected exhibit for Lightbox / Full Inspection
  const [selectedExhibit, setSelectedExhibit] = useState<ExhibitionItem | null>(null);

  // Active Teacher Endorser State (allows teacher to endorse from student section or as guest teacher)
  const [currentEndorser, setCurrentEndorser] = useState<{
    id: string;
    name: string;
    role: string;
  }>(() => {
    if (activeTeacher) {
      return {
        id: activeTeacher.id,
        name: activeTeacher.displayName,
        role: activeTeacher.role
      };
    }
    const saved = localStorage.getItem('deraa_active_teacher');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          id: parsed.id || 'teacher-1',
          name: parsed.displayName || 'المعلمة أمل رشيد',
          role: parsed.role || 'teacher'
        };
      } catch {
        // fallback
      }
    }
    return {
      id: 'amal_rashid',
      name: 'المعلمة أمل رشيد',
      role: 'إعداد وتنفيذ المبادرة'
    };
  });

  // Endorsement comment modal state
  const [commentModalItem, setCommentModalItem] = useState<ExhibitionItem | null>(null);
  const [teacherPraiseComment, setTeacherPraiseComment] = useState<string>('');

  // Exhibits State
  const [exhibits, setExhibits] = useState<ExhibitionItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Default curated benchmark artworks & letters from Al-Bada'a First Secondary
  const benchmarkExhibits: ExhibitionItem[] = useMemo(() => [
    {
      id: 'exhibit-art-1',
      studentName: 'نورة خالد المسعودي',
      grade: 'الصف الثالث ثانوي',
      type: 'drawing',
      title: 'راية التوحيد وسياج المادة 34',
      content: 'لوحة زيتية تشكيلية تجسد ثلاثية الدفاع عن العقيدة والمجتمع والوطن، تحيط بها جبال البدع الشامخة وراية التوحيد الخفاقة كدرع حصين لأمتنا.',
      imageUrl: studentPaintingImg,
      createdAt: '2026-10-24T09:30:00.000Z',
      likesCount: 28,
      isFeatured: true,
      stationTag: 'قمة المجد الوطنية',
      teacherLikes: [
        {
          teacherId: 'fatima_masoudi',
          teacherName: 'مديرة المدرسة: أ. فاطمة سليمان المسعودي',
          role: 'إشادة إدارة المدرسة',
          likedAt: '2026-10-24T10:00:00.000Z',
          comment: 'عمل فني وطني مبهر يعكس وعياً دستورياً وحساً جمالياً فائقاً لطالبات الثانوية الأولى بالبدع.'
        },
        {
          teacherId: 'amal_rashid',
          teacherName: 'المعلمة أمل رشيد',
          role: 'معلمة المبادرة',
          likedAt: '2026-10-24T10:15:00.000Z',
          comment: 'بارك الله في ريشتكِ يا نورة، تجسيد حي لمفهوم درع الوطن.'
        }
      ]
    },
    {
      id: 'exhibit-art-2',
      studentName: 'سارة فهد الحويطي',
      grade: 'الصف الثاني ثانوي',
      type: 'drawing',
      title: 'مخطوطة النور الدستوري والأمن الفكري',
      content: 'تصميم فني وزخرفة إسلامية تبرز نص المادة (34) بريشة الخط العربي المذهب، تعبيراً عن قدسية واجب الدفاع عن ثوابت المجتمع.',
      imageUrl: calligraphyArtImg,
      createdAt: '2026-10-24T08:45:00.000Z',
      likesCount: 24,
      isFeatured: true,
      stationTag: 'محطة حصن الفكر',
      teacherLikes: [
        {
          teacherId: 'wafa_alzahrani',
          teacherName: 'المعلمة وفاء الزهراني',
          role: 'معلمة المبادرة',
          likedAt: '2026-10-24T09:10:00.000Z',
          comment: 'خط بديع وزخرفة تشرح الصدر، فخورون بإبداعكِ يا سارة!'
        },
        {
          teacherId: 'amal_rashid',
          teacherName: 'المعلمة أمل رشيد',
          role: 'معلمة المبادرة',
          likedAt: '2026-10-24T09:30:00.000Z',
          comment: 'لوحة نالت إعجاب واعتزاز جميع منسوبات المدرسة.'
        }
      ]
    },
    {
      id: 'exhibit-text-1',
      studentName: 'ريم محمد العمراني',
      grade: 'الصف الأول ثانوي',
      type: 'text',
      title: 'رسالة ولاء: حصن الفكر وصيانة ثغور المجتمع',
      content: '«إن الدفاع عن وطني لا ينحصر في حمل السلاح في ميادين الوغى فحسب، بل يبدأ من عقلي وفكري.. حين أرفض ترويج شائعة مغرضة، وحين أتمسك بقيمي الإسلامية وهويتي السعودية، وحين أجدّ في دراستي بالثانوية الأولى بالبدع لأكون لبنة صالحة تسهم في رفعة هذا الوطن العظيم.. أنا درعٌ لوطني كما هو درعي وفخري دائماً.»',
      backgroundTemplate: 'emerald-shield',
      createdAt: '2026-10-24T07:20:00.000Z',
      likesCount: 31,
      isFeatured: true,
      stationTag: 'محطة صانعات الأثر',
      teacherLikes: [
        {
          teacherId: 'fatima_masoudi',
          teacherName: 'مديرة المدرسة: أ. فاطمة سليمان المسعودي',
          role: 'إشادة إدارة المدرسة',
          likedAt: '2026-10-24T08:00:00.000Z',
          comment: 'كلمات تنبض بالوعي والولاء الحقيقي، نموذج يُحتذى به لطالباتنا.'
        },
        {
          teacherId: 'wafa_alzahrani',
          teacherName: 'المعلمة وفاء الزهراني',
          role: 'معلمة المبادرة',
          likedAt: '2026-10-24T08:25:00.000Z',
          comment: 'قلم صادق يترجم روح المادة 34 بأجمل العبارات.'
        }
      ]
    },
    {
      id: 'exhibit-text-2',
      studentName: 'شروق أحمد البلوي',
      grade: 'الصف الثالث ثانوي',
      type: 'text',
      title: 'خواطر دستورية: عهد الفتاة السعودية للملك والوطن',
      content: '«تأملتُ المادة 34 فوجدتها تاجاً يرسم طريق الشرف والمواطنة الصالحة. إن بلادنا التي أكرمها الله بالحرمين الشريفين وقيادة رشيدة تسهر على أمننا، تستحق منا كل غالٍ ونفيس. نجدد العهد بأن نكون سداً منيعاً ضد كل فكرٍ ضال، وسفراء للوعي والمعرفة في كل محفل.»',
      backgroundTemplate: 'royal-gold',
      createdAt: '2026-10-24T06:15:00.000Z',
      likesCount: 19,
      isFeatured: true,
      stationTag: 'محطة النور الدستوري',
      teacherLikes: [
        {
          teacherId: 'amal_rashid',
          teacherName: 'المعلمة أمل رشيد',
          role: 'معلمة المبادرة',
          likedAt: '2026-10-24T07:00:00.000Z',
          comment: 'فخر واعتزاز بثقتكِ ووعيكِ الوطني يا شروق.'
        }
      ]
    },
    {
      id: 'exhibit-art-3',
      studentName: 'لمى سعود الزهراني',
      grade: 'الصف الثاني ثانوي',
      type: 'drawing',
      title: 'رمزية الدرع الأخضر ونخلة العطاء',
      content: 'لوحة رقمية تمثل درعاً واقياً منقوشاً بالسيفين والنخلة، كرمز للعدل والقوة والرخاء المستمر في بلادنا المعطاءة.',
      imageUrl: shieldHeroImg,
      createdAt: '2026-10-23T11:40:00.000Z',
      likesCount: 22,
      isFeatured: false,
      stationTag: 'محطة نجمة الميدان',
      teacherLikes: [
        {
          teacherId: 'wafa_alzahrani',
          teacherName: 'المعلمة وفاء الزهراني',
          role: 'معلمة المبادرة',
          likedAt: '2026-10-23T12:00:00.000Z',
          comment: 'إتقان رائع للتدرجات الخضراء والذهبية.'
        }
      ]
    }
  ], []);

  // Fetch and combine live submissions with benchmark exhibits
  const loadExhibitionData = async () => {
    setIsLoading(true);
    try {
      const res = await api.getSubmissions({ status: 'all' });
      const liveSubs = res.submissions || [];

      // Transform relevant submissions (drawings and text with content)
      const convertedLiveExhibits: ExhibitionItem[] = liveSubs
        .filter((s) => s.type === 'drawing' || s.type === 'text')
        .map((s) => {
          // Retrieve stored teacher likes for this sub if any
          let teacherLikes = s.teacherLikes || [];
          try {
            const storedTL = localStorage.getItem(`deraa_exhibition_teacher_likes_${s.id}`);
            if (storedTL) {
              teacherLikes = JSON.parse(storedTL);
            }
          } catch {
            // fallback
          }

          return {
            id: s.id,
            studentName: s.studentName,
            grade: s.grade,
            type: s.type as 'drawing' | 'text',
            title: s.title || (s.type === 'drawing' ? 'لوحة وطنية' : 'مشاركة ولاء'),
            content: s.content || '',
            imageUrl: s.fileUrl,
            backgroundTemplate: s.backgroundTemplate,
            createdAt: s.createdAt,
            likesCount: Math.max(s.likesCount || 0, teacherLikes.length + 3),
            teacherLikes,
            isFeatured: s.status === 'featured' || teacherLikes.length > 0,
            stationTag: 'درع الوطن'
          };
        });

      // Merge: unique by student name & title or id
      const combined = [...benchmarkExhibits];
      convertedLiveExhibits.forEach((liveItem) => {
        const exists = combined.some(
          (b) => b.id === liveItem.id || (b.studentName === liveItem.studentName && b.title === liveItem.title)
        );
        if (!exists) {
          combined.unshift(liveItem);
        }
      });

      setExhibits(combined);
    } catch (err) {
      console.warn('Exhibition load fallback to benchmark:', err);
      setExhibits(benchmarkExhibits);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExhibitionData();
  }, [benchmarkExhibits]);

  // Handle Teacher Like / Endorsement Toggle
  const handleToggleTeacherLike = async (item: ExhibitionItem) => {
    try {
      const res = await api.toggleTeacherLike({
        submissionId: item.id,
        teacherId: currentEndorser.id,
        teacherName: currentEndorser.name,
        role: currentEndorser.role
      });

      setExhibits((prev) =>
        prev.map((ex) => {
          if (ex.id !== item.id) return ex;

          const exists = ex.teacherLikes.some((tl) => tl.teacherId === currentEndorser.id);
          let newTeacherLikes = [...ex.teacherLikes];

          if (exists) {
            newTeacherLikes = newTeacherLikes.filter((tl) => tl.teacherId !== currentEndorser.id);
          } else {
            newTeacherLikes.push({
              teacherId: currentEndorser.id,
              teacherName: currentEndorser.name,
              role: currentEndorser.role,
              likedAt: new Date().toISOString()
            });
          }

          const newLikesCount = Math.max(0, ex.likesCount + (exists ? -1 : 1));

          return {
            ...ex,
            teacherLikes: newTeacherLikes,
            likesCount: newLikesCount,
            isFeatured: newTeacherLikes.length > 0
          };
        })
      );

      // Toast feedback
      const msg = res.isLiked
        ? `تم تسجيل إعجاب ${currentEndorser.name} بالعمل بنجاح! ❤️`
        : `تم إلغاء الإعجاب بالعمل.`;
      setFeedbackToast(msg);
      setTimeout(() => setFeedbackToast(null), 3000);
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  // Submit Teacher Praise Comment
  const handleSaveTeacherComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentModalItem) return;

    try {
      await api.toggleTeacherLike({
        submissionId: commentModalItem.id,
        teacherId: currentEndorser.id,
        teacherName: currentEndorser.name,
        role: currentEndorser.role,
        comment: teacherPraiseComment.trim()
      });

      setExhibits((prev) =>
        prev.map((ex) => {
          if (ex.id !== commentModalItem.id) return ex;
          const updatedLikes = [...ex.teacherLikes];
          const idx = updatedLikes.findIndex((tl) => tl.teacherId === currentEndorser.id);
          if (idx !== -1) {
            updatedLikes[idx].comment = teacherPraiseComment.trim();
          } else {
            updatedLikes.push({
              teacherId: currentEndorser.id,
              teacherName: currentEndorser.name,
              role: currentEndorser.role,
              likedAt: new Date().toISOString(),
              comment: teacherPraiseComment.trim()
            });
          }
          return {
            ...ex,
            teacherLikes: updatedLikes,
            isFeatured: true
          };
        })
      );

      setCommentModalItem(null);
      setTeacherPraiseComment('');
      setFeedbackToast(`تمت إضافة إشادة المعلمة المعتمدة بنجاح! ✨`);
      setTimeout(() => setFeedbackToast(null), 3000);
    } catch (err) {
      console.error('Error saving comment:', err);
    }
  };

  // Filtered List
  const filteredExhibits = useMemo(() => {
    return exhibits.filter((item) => {
      // Category filter
      if (activeCategory === 'drawing' && item.type !== 'drawing') return false;
      if (activeCategory === 'text' && item.type !== 'text') return false;
      if (activeCategory === 'teacher_picks' && item.teacherLikes.length === 0) return false;

      // Grade filter
      if (selectedGrade !== 'all' && item.grade !== selectedGrade) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesName = item.studentName.toLowerCase().includes(q);
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesContent = item.content.toLowerCase().includes(q);
        if (!matchesName && !matchesTitle && !matchesContent) return false;
      }

      return true;
    });
  }, [exhibits, activeCategory, selectedGrade, searchQuery]);

  return (
    <div className="space-y-8 text-right font-cairo">
      {/* ===================== HERO MUSEUM BANNER ===================== */}
      <div className="relative overflow-hidden rounded-3xl bg-radial from-slate-950 via-emerald-950 to-emerald-900 border-2 border-amber-400/50 p-6 sm:p-10 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold">
              <Palette className="w-4 h-4 text-amber-400" />
              <span>أروقة الإبداع والولاء الوطني · الثانوية الأولى بالبدع</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white font-calligraphy">
              المَعْرَضُ الِافْتِرَاضِيُّ لِدِرْعِ الوَطَن
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium">
              صرح افتراضي راقٍ يستعرض نخبة من اللوحات التشكيلية والرسائل الوطنية الملهمة المستوحاة من المادة (34) من النظام الأساسي للحكم، موثقاً إشادات وإعجابات مديرة المدرسة <strong>أ. فاطمة سليمان المسعودي</strong> والمعلمتين: <strong>أمل رشيد</strong> و<strong>وفاء الزهراني</strong>.
            </p>
          </div>

          {/* Quick Exhibition Stats */}
          <div className="flex items-center gap-3 shrink-0 bg-emerald-900/70 backdrop-blur-md p-4 rounded-2xl border border-amber-400/40">
            <div className="text-center px-3 border-l border-emerald-700/60">
              <span className="block text-[11px] text-emerald-200/80 font-bold">الأعمال المعروضة</span>
              <span className="text-xl font-black text-amber-300">{exhibits.length}</span>
            </div>
            <div className="text-center px-3 border-l border-emerald-700/60">
              <span className="block text-[11px] text-emerald-200/80 font-bold">إشادات المعلمات</span>
              <span className="text-xl font-black text-amber-300">
                {exhibits.reduce((acc, curr) => acc + curr.teacherLikes.length, 0)}
              </span>
            </div>
            <div className="text-center px-3">
              <span className="block text-[11px] text-emerald-200/80 font-bold">المختارات الذهبية</span>
              <span className="text-xl font-black text-amber-300">
                {exhibits.filter((e) => e.teacherLikes.length > 0).length}
              </span>
            </div>
          </div>
        </div>

        {/* Active Teacher Endorser Strip */}
        <div className="mt-6 pt-5 border-t border-emerald-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-amber-300 font-bold flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>هوية المعلمة / الإدارة المُعجبة:</span>
            </span>
            <select
              value={currentEndorser.id}
              onChange={(e) => {
                const id = e.target.value;
                if (id === 'fatima_masoudi') {
                  setCurrentEndorser({
                    id: 'fatima_masoudi',
                    name: 'مديرة المدرسة: أ. فاطمة سليمان المسعودي',
                    role: 'إشادة إدارة المدرسة'
                  });
                } else if (id === 'amal_rashid') {
                  setCurrentEndorser({
                    id: 'amal_rashid',
                    name: 'المعلمة أمل رشيد',
                    role: 'معلمة المبادرة'
                  });
                } else {
                  setCurrentEndorser({
                    id: 'wafa_alzahrani',
                    name: 'المعلمة وفاء الزهراني',
                    role: 'معلمة المبادرة'
                  });
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-amber-400/50 text-white font-bold text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-400"
            >
              <option value="fatima_masoudi">أ. فاطمة سليمان المسعودي (مديرة المدرسة)</option>
              <option value="amal_rashid">المعلمة أمل رشيد (إعداد وتنفيذ)</option>
              <option value="wafa_alzahrani">المعلمة وفاء الزهراني (إعداد وتنفيذ)</option>
            </select>
          </div>

          <p className="text-[11px] text-emerald-200/80">
            انقري على زر <strong className="text-amber-300">«إعجاب المعلمة ❤️»</strong> لتسجيل إشادتكِ الرسمية فورا على أي عمل تشكيلي أو نصي.
          </p>
        </div>
      </div>

      {/* Toast Alert */}
      {feedbackToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-800 text-white font-bold text-xs border border-emerald-400 shadow-lg flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* ===================== FILTER & SEARCH BAR ===================== */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'all'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>جميع الإبداعات ({exhibits.length})</span>
          </button>

          <button
            onClick={() => setActiveCategory('drawing')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'drawing'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-amber-500" />
            <span>مرسم درع الوطن ({exhibits.filter((e) => e.type === 'drawing').length})</span>
          </button>

          <button
            onClick={() => setActiveCategory('text')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'text'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <PenTool className="w-3.5 h-3.5 text-blue-500" />
            <span>درر الكلمات والرسائل ({exhibits.filter((e) => e.type === 'text').length})</span>
          </button>

          <button
            onClick={() => setActiveCategory('teacher_picks')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'teacher_picks'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 font-black shadow-xs ring-1 ring-amber-300'
                : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
            <span>مختارات المعلمات المميزة ({exhibits.filter((e) => e.teacherLikes.length > 0).length})</span>
          </button>
        </div>

        {/* Grade and Search Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
          >
            <option value="all">جميع الفصول الدراسية</option>
            {SCHOOL_GRADES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <div className="relative w-full sm:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث باسم الطالبة أو العنوان..."
              className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* ===================== EXHIBITION GALLERY GRID ===================== */}
      {filteredExhibits.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-50 border-2 border-dashed border-slate-300 space-y-3">
          <Palette className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-700">لا توجد أعمال تطابق معايير التصفية الحالية</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            يمكنكِ تجربة تغيير الفصل أو مسح نص البحث للاطلاع على كافة مقتنيات المعرض الافتراضي.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExhibits.map((item) => {
            const isLikedByCurrent = item.teacherLikes.some((tl) => tl.teacherId === currentEndorser.id);

            return (
              <div
                key={item.id}
                className="group rounded-3xl bg-white border-2 border-slate-200 hover:border-amber-400/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
              >
                {/* Top Badge Strip */}
                <div className="p-4 pb-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    {item.type === 'drawing' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                        <Palette className="w-3 h-3 text-emerald-700" />
                        <span>لوحة تشكيلية</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center gap-1">
                        <PenTool className="w-3 h-3 text-blue-700" />
                        <span>خاطرة ورسالة</span>
                      </span>
                    )}

                    {item.teacherLikes.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-400 text-emerald-950 text-[10px] font-black flex items-center gap-1 shadow-2xs">
                        <Crown className="w-3 h-3 text-emerald-950 fill-emerald-950" />
                        <span>إشادة معتمدة</span>
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(item.createdAt).toLocaleDateString('ar-SA')}
                  </span>
                </div>

                {/* Exhibit Artwork Media or Styled Text Box */}
                <div className="px-4">
                  {item.type === 'drawing' ? (
                    <div
                      onClick={() => setSelectedExhibit(item)}
                      className="relative rounded-2xl overflow-hidden aspect-4/3 bg-slate-900 border-2 border-amber-400/40 cursor-pointer group-hover:scale-[1.01] transition-transform duration-200 shadow-inner"
                    >
                      <img
                        src={item.imageUrl || shieldHeroImg}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.src.includes('public')) {
                            target.src = '/assets/images/shield_of_nation_hero_1792473197101.jpg';
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <span className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>معاينة مكبرة للوحة في المعرض</span>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => setSelectedExhibit(item)}
                      className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 via-emerald-50/40 to-white border border-amber-300/60 shadow-xs cursor-pointer min-h-[170px] flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-900 text-amber-300 flex items-center justify-center text-xs font-serif font-black shadow-2xs">
                          « »
                        </div>
                        <p className="text-xs text-slate-800 leading-relaxed font-medium line-clamp-4 font-calligraphy">
                          {item.content}
                        </p>
                      </div>
                      <div className="pt-2 text-[10px] text-emerald-800 font-bold flex items-center justify-between">
                        <span>انقري لقراءة النص كاملاً ✦</span>
                        <Shield className="w-3 h-3 text-emerald-700" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Exhibit Card Details */}
                <div className="p-4 space-y-3">
                  <div className="space-y-1">
                    <h3
                      onClick={() => setSelectedExhibit(item)}
                      className="text-sm font-black text-slate-900 hover:text-emerald-800 transition-colors cursor-pointer line-clamp-1"
                    >
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span className="font-bold text-emerald-950 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{item.studentName}</span>
                      </span>
                      <span className="text-[11px] text-slate-500">{item.grade}</span>
                    </div>
                  </div>

                  {/* Teacher Endorsements Pills Ribbon */}
                  {item.teacherLikes.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-emerald-50/90 border border-emerald-200/80 space-y-1.5">
                      <div className="text-[10px] font-bold text-emerald-900 flex items-center gap-1">
                        <Award className="w-3 h-3 text-amber-600" />
                        <span>إشادات المعلمات المعتمدة ({item.teacherLikes.length}):</span>
                      </div>
                      <div className="space-y-1">
                        {item.teacherLikes.map((tl, idx) => (
                          <div key={idx} className="text-[10px] text-emerald-950 flex items-start gap-1">
                            <span className="text-amber-600">✦</span>
                            <div>
                              <strong className="text-emerald-900">{tl.teacherName}</strong>
                              {tl.comment && (
                                <span className="text-slate-600 block text-[9.5px]">
                                  "{tl.comment}"
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interactive Action Bar (Teacher Like + Comment + Share) */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    {/* Teacher Like Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleTeacherLike(item)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                        isLikedByCurrent
                          ? 'bg-rose-500 text-white shadow-xs scale-102 ring-2 ring-rose-300'
                          : 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200'
                      }`}
                      title={`تسجيل إعجاب ${currentEndorser.name}`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${isLikedByCurrent ? 'fill-white' : 'hover:fill-rose-500'}`}
                      />
                      <span>{isLikedByCurrent ? 'أُعجبتِ به' : 'إعجاب المعلمة'}</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-black/10 text-[10px] font-mono">
                        {item.likesCount}
                      </span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {/* Add Teacher Praise Note */}
                      <button
                        type="button"
                        onClick={() => {
                          setCommentModalItem(item);
                          const existing = item.teacherLikes.find((tl) => tl.teacherId === currentEndorser.id);
                          setTeacherPraiseComment(existing?.comment || '');
                        }}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 border border-slate-200 cursor-pointer transition-colors"
                        title="إضافة كلمة إشادة رسمية للمعلمة"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>

                      {/* Expand View */}
                      <button
                        type="button"
                        onClick={() => setSelectedExhibit(item)}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer transition-colors"
                        title="عرض تفصيلي"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Issue Certificate directly */}
                      {onOpenCertificateHub && (
                        <button
                          type="button"
                          onClick={() => onOpenCertificateHub(item.studentName, item.grade)}
                          className="px-2 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] cursor-pointer"
                          title="إصدار شهادة تقدير للمشاركة"
                        >
                          شهادة ✦
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===================== EXHIBIT LIGHTBOX MODAL ===================== */}
      {selectedExhibit && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border-2 border-amber-400/60 text-right space-y-6 relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setSelectedExhibit(null)}
              className="absolute top-5 left-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="space-y-1 border-b border-slate-100 pb-4 pr-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-amber-400 text-emerald-950 text-xs font-black">
                  معرض درع الوطن
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {new Date(selectedExhibit.createdAt).toLocaleDateString('ar-SA')}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-calligraphy">
                {selectedExhibit.title}
              </h3>
              <p className="text-xs text-slate-600 font-bold flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-700" />
                <span>إبداع الطالبة: <strong className="text-emerald-950">{selectedExhibit.studentName}</strong></span>
                <span>·</span>
                <span>{selectedExhibit.grade}</span>
              </p>
            </div>

            {/* Media Presentation */}
            {selectedExhibit.type === 'drawing' ? (
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border-4 border-amber-400 shadow-xl max-h-[440px] flex items-center justify-center">
                <img
                  src={selectedExhibit.imageUrl || shieldHeroImg}
                  alt={selectedExhibit.title}
                  className="max-h-[420px] w-auto object-contain"
                />
              </div>
            ) : (
              <div className="p-6 sm:p-8 rounded-2xl bg-radial from-amber-50 via-emerald-50/40 to-white border-2 border-amber-400 shadow-inner space-y-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-950 text-amber-300 flex items-center justify-center font-black shadow-md">
                  <Shield className="w-5 h-5" />
                </div>
                <blockquote className="text-base sm:text-lg text-slate-900 font-calligraphy leading-loose text-justify font-semibold">
                  {selectedExhibit.content}
                </blockquote>
              </div>
            )}

            {/* Artwork Story & Description */}
            {selectedExhibit.content && selectedExhibit.type === 'drawing' && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-xs font-bold text-slate-700 block">شرح وفكرة العمل الفني:</span>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {selectedExhibit.content}
                </p>
              </div>
            )}

            {/* Teacher Endorsements in Modal */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <h4 className="font-bold text-sm text-slate-900">
                    إشادات وإعجابات المعلمات وإدارة المدرسة ({selectedExhibit.teacherLikes.length})
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleTeacherLike(selectedExhibit)}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                  <span>تسجيل إعجابكِ كـ ({currentEndorser.name})</span>
                </button>
              </div>

              {selectedExhibit.teacherLikes.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  لم يتم تسجيل إشادات معلمات بعد. كوني أول معلمة تسجل إعجابها بهذا العمل الإبداعي!
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedExhibit.teacherLikes.map((tl, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-amber-50/50 border border-emerald-200 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-emerald-950 font-black">{tl.teacherName}</strong>
                        <span className="text-[10px] text-amber-700 font-semibold">{tl.role}</span>
                      </div>
                      {tl.comment && (
                        <p className="text-slate-700 text-xs italic">
                          "{tl.comment}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {onOpenCertificateHub && (
                  <button
                    onClick={() => {
                      onOpenCertificateHub(selectedExhibit.studentName, selectedExhibit.grade);
                      setSelectedExhibit(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
                  >
                    <Award className="w-4 h-4" />
                    <span>إصدار شهادة تقدير للمشاركة</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedExhibit(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                إغلاق المعاينة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TEACHER PRAISE COMMENT MODAL ===================== */}
      {commentModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-right space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">إضافة إشادة معتمدة للمعلمة</h3>
                  <p className="text-[11px] text-slate-500">خاص بمعلمات وإدارة الثانوية الأولى بالبدع</p>
                </div>
              </div>
              <button
                onClick={() => setCommentModalItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeacherComment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">المعلمة / المديرة المانحة للإشادة:</label>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-950">
                  {currentEndorser.name} ({currentEndorser.role})
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  كلمة الإشادة والثناء للطالبة ({commentModalItem.studentName}):
                </label>
                <textarea
                  rows={3}
                  value={teacherPraiseComment}
                  onChange={(e) => setTeacherPraiseComment(e.target.value)}
                  placeholder="اكتبي كلمة ثناء وتشجيع تظهر في بطاقة العمل بالمعرض..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCommentModalItem(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>اعتماد الإشادة بالمعرض</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
