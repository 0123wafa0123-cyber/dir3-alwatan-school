import React, { useState, useMemo, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import {
  Crown,
  Award,
  Star,
  Shield,
  Sparkles,
  Trophy,
  Medal,
  Download,
  Printer,
  Search,
  Filter,
  FileDown,
  Loader2,
  CheckCircle2,
  TrendingUp,
  Compass,
  BookOpen,
  Flag,
  UserCheck
} from 'lucide-react';
import { Submission, StudentSummary, TeacherMissionStats, TeacherUser } from '../types';
import { SCHOOL_GRADES } from '../constants/grades';
import { SHIELD_JOURNEY_STATIONS } from '../constants/dailyMissions';
import heroShieldImg from '../assets/images/shield_of_nation_hero_1792473197101.jpg';

interface HomelandGuardiansHonorRollProps {
  submissions: Submission[];
  students: StudentSummary[];
  missionStats: TeacherMissionStats | null;
  onOpenStudentCertificate?: (studentName: string, grade: string) => void;
  currentTeacher: TeacherUser;
}

export interface HonorStudent {
  rank: number;
  name: string;
  grade: string;
  points: number;
  missionsCompleted: number;
  submissionsCount: number;
  surveysCount: number;
  badgesCount: number;
  station: {
    id: number;
    title: string;
    subtitle: string;
  };
  honorTitle: string;
  isCustomSubmission?: boolean;
}

export const HomelandGuardiansHonorRoll: React.FC<HomelandGuardiansHonorRollProps> = ({
  submissions,
  students,
  missionStats,
  onOpenStudentCertificate,
  currentTeacher
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedStationFilter, setSelectedStationFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'points' | 'missions' | 'submissions'>('points');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  const printDocumentRef = useRef<HTMLDivElement>(null);

  // Aggregate and merge live data with seeded Al-Bada'a First Secondary students
  const honorRollList = useMemo<HonorStudent[]>(() => {
    // 1. Benchmark student roster for Al-Bada'a First Secondary School
    const benchmarkStudents: Omit<HonorStudent, 'rank'>[] = [
      {
        name: 'نورة خالد المسعودي',
        grade: 'الصف الثالث ثانوي',
        points: 245,
        missionsCompleted: 7,
        submissionsCount: 4,
        surveysCount: 2,
        badgesCount: 5,
        station: { id: 6, title: 'قمة المجد الوطنية', subtitle: 'وسام درع الوطن الخالد' },
        honorTitle: 'وسام درع الوطن الأسمى 🥇'
      },
      {
        name: 'سارة فهد الحويطي',
        grade: 'الصف الثاني ثانوي',
        points: 215,
        missionsCompleted: 6,
        submissionsCount: 3,
        surveysCount: 2,
        badgesCount: 4,
        station: { id: 6, title: 'قمة المجد الوطنية', subtitle: 'وسام درع الوطن الخالد' },
        honorTitle: 'فارسة درع الوطن الفضية 🥈'
      },
      {
        name: 'ريم محمد العمراني',
        grade: 'الصف الأول ثانوي',
        points: 195,
        missionsCompleted: 5,
        submissionsCount: 3,
        surveysCount: 2,
        badgesCount: 4,
        station: { id: 5, title: 'محطة صانعات الأثر', subtitle: 'المبادرة وريادة الخدمة المجتمعية' },
        honorTitle: 'نجمة العطاء البرونزية 🥉'
      },
      {
        name: 'شروق أحمد البلوي',
        grade: 'الصف الثالث ثانوي',
        points: 175,
        missionsCompleted: 5,
        submissionsCount: 3,
        surveysCount: 1,
        badgesCount: 3,
        station: { id: 5, title: 'محطة صانعات الأثر', subtitle: 'المبادرة وريادة الخدمة المجتمعية' },
        honorTitle: 'حامية القيم المتميزة 🌟'
      },
      {
        name: 'لمى سعود الزهراني',
        grade: 'الصف الثاني ثانوي',
        points: 155,
        missionsCompleted: 4,
        submissionsCount: 2,
        surveysCount: 2,
        badgesCount: 3,
        station: { id: 4, title: 'محطة نجمة الميدان', subtitle: 'المشاركة الفاعلة والاستمرارية' },
        honorTitle: 'فارسة الميدان الدستوري ✦'
      },
      {
        name: 'رزان عبدالعزيز العطوي',
        grade: 'الصف الأول ثانوي',
        points: 140,
        missionsCompleted: 4,
        submissionsCount: 2,
        surveysCount: 1,
        badgesCount: 3,
        station: { id: 4, title: 'محطة نجمة الميدان', subtitle: 'المشاركة الفاعلة والاستمرارية' },
        honorTitle: 'نجمة التميز والمواطنة ✦'
      },
      {
        name: 'جود سلطان الجهني',
        grade: 'الصف الثاني ثانوي',
        points: 115,
        missionsCompleted: 3,
        submissionsCount: 2,
        surveysCount: 1,
        badgesCount: 2,
        station: { id: 3, title: 'محطة حصن الفكر', subtitle: 'المواطنة الرقمية وحصانة العقل' },
        honorTitle: 'سفيرة الفكر الواعي 🛡️'
      },
      {
        name: 'مها إبراهيم الرشيدي',
        grade: 'الصف الثالث ثانوي',
        points: 95,
        missionsCompleted: 3,
        submissionsCount: 1,
        surveysCount: 1,
        badgesCount: 2,
        station: { id: 3, title: 'محطة حصن الفكر', subtitle: 'المواطنة الرقمية وحصانة العقل' },
        honorTitle: 'درع الوعي المجتمعي 🛡️'
      },
      {
        name: 'أثير سعد المسعودي',
        grade: 'الصف الأول ثانوي',
        points: 75,
        missionsCompleted: 2,
        submissionsCount: 1,
        surveysCount: 1,
        badgesCount: 1,
        station: { id: 2, title: 'محطة النور الدستوري', subtitle: 'استيعاب أبعاد المادة (34)' },
        honorTitle: 'سفيرة النور الدستوري 📜'
      },
      {
        name: 'دانة عبدالله الشامان',
        grade: 'الصف الثاني ثانوي',
        points: 60,
        missionsCompleted: 2,
        submissionsCount: 1,
        surveysCount: 1,
        badgesCount: 1,
        station: { id: 2, title: 'محطة النور الدستوري', subtitle: 'استيعاب أبعاد المادة (34)' },
        honorTitle: 'حامية الميثاق الوطني 📜'
      }
    ];

    // 2. Map existing students from DB / state
    const studentMap = new Map<string, Omit<HonorStudent, 'rank'>>();

    // Seed benchmark entries
    benchmarkStudents.forEach((b) => {
      const key = `${b.name.trim().toLowerCase()}_${b.grade.trim().toLowerCase()}`;
      studentMap.set(key, { ...b });
    });

    // 3. Scan live submissions and integrate real student data
    submissions.forEach((sub) => {
      const cleanName = sub.studentName?.trim() || '';
      const cleanGrade = sub.grade?.trim() || SCHOOL_GRADES[0];
      if (!cleanName) return;

      const key = `${cleanName.toLowerCase()}_${cleanGrade.toLowerCase()}`;
      let entry = studentMap.get(key);

      if (!entry) {
        entry = {
          name: cleanName,
          grade: cleanGrade,
          points: 35,
          missionsCompleted: 1,
          submissionsCount: 0,
          surveysCount: 0,
          badgesCount: 1,
          station: { id: 1, title: 'محطة الانطلاقة', subtitle: 'قسم الولاء والعهد الوطني' },
          honorTitle: 'طالبة درع الوطن المشاركة',
          isCustomSubmission: true
        };
        studentMap.set(key, entry);
      }

      entry.submissionsCount += 1;
      // Add points for submission types
      if (sub.type === 'drawing') entry.points += 25;
      else if (sub.type === 'text') entry.points += 20;
      else if (sub.type === 'quiz' || sub.type === 'pledge') entry.points += 25;
    });

    // 4. Scan local storage for student mission completions
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('deraa_missions_')) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const data = JSON.parse(raw);
            const comps = data.completions || [];
            if (comps.length > 0) {
              const sample = comps[0];
              const sName = sample.studentName || '';
              const sGrade = sample.grade || SCHOOL_GRADES[0];
              if (sName) {
                const key = `${sName.toLowerCase()}_${sGrade.toLowerCase()}`;
                let entry = studentMap.get(key);
                const missionPoints = comps.reduce((acc: number, c: any) => acc + (c.pointsEarned || 0), 0);
                const bonusPoints = (data.claimedBoxes || []).reduce((acc: number, b: any) => acc + (b.bonusPoints || 0), 0);
                const totalMPoints = missionPoints + bonusPoints;

                if (!entry) {
                  entry = {
                    name: sName,
                    grade: sGrade,
                    points: totalMPoints,
                    missionsCompleted: comps.length,
                    submissionsCount: 0,
                    surveysCount: 0,
                    badgesCount: Math.min(5, Math.floor(comps.length / 1.5) + 1),
                    station: { id: 1, title: 'محطة الانطلاقة', subtitle: 'قسم الولاء والعهد الوطني' },
                    honorTitle: 'طالبة درع الوطن المتميزة',
                    isCustomSubmission: true
                  };
                  studentMap.set(key, entry);
                } else {
                  entry.missionsCompleted = Math.max(entry.missionsCompleted, comps.length);
                  entry.points = Math.max(entry.points, entry.points + totalMPoints);
                }
              }
            }
          }
        }
      }
    } catch {
      // safe fallback
    }

    // 5. Update station and honor titles based on computed points
    const fullList = Array.from(studentMap.values()).map((st) => {
      let stObj = SHIELD_JOURNEY_STATIONS[0];
      if (st.points >= 200) stObj = SHIELD_JOURNEY_STATIONS[5];
      else if (st.points >= 160) stObj = SHIELD_JOURNEY_STATIONS[4];
      else if (st.points >= 120) stObj = SHIELD_JOURNEY_STATIONS[3];
      else if (st.points >= 80) stObj = SHIELD_JOURNEY_STATIONS[2];
      else if (st.points >= 40) stObj = SHIELD_JOURNEY_STATIONS[1];

      return {
        ...st,
        station: {
          id: stObj.id,
          title: stObj.title,
          subtitle: stObj.subtitle
        }
      };
    });

    // 6. Sort according to selected sort criteria
    fullList.sort((a, b) => {
      if (sortBy === 'missions') return b.missionsCompleted - a.missionsCompleted;
      if (sortBy === 'submissions') return b.submissionsCount - a.submissionsCount;
      return b.points - a.points;
    });

    // 7. Assign ranks and royal honor titles
    return fullList.map((st, index) => {
      const rank = index + 1;
      let honorTitle = st.honorTitle;

      if (rank === 1) honorTitle = 'وسام درع الوطن الأسمى 🥇';
      else if (rank === 2) honorTitle = 'فارسة درع الوطن الفضية 🥈';
      else if (rank === 3) honorTitle = 'نجمة العطاء البرونزية 🥉';
      else if (rank <= 6) honorTitle = 'فارسة التميز والمواطنة 🌟';
      else if (rank <= 10) honorTitle = 'سفيرة الوعي والأثر ✦';

      return {
        ...st,
        rank,
        honorTitle
      };
    });
  }, [submissions, students, missionStats, sortBy]);

  // Filtered List based on search and filters
  const filteredList = useMemo(() => {
    return honorRollList.filter((st) => {
      const matchSearch =
        !searchTerm.trim() ||
        st.name.includes(searchTerm.trim()) ||
        st.grade.includes(searchTerm.trim()) ||
        st.honorTitle.includes(searchTerm.trim());

      const matchGrade = selectedGrade === 'all' || st.grade === selectedGrade;
      const matchStation =
        selectedStationFilter === 'all' || String(st.station.id) === selectedStationFilter;

      return matchSearch && matchGrade && matchStation;
    });
  }, [honorRollList, searchTerm, selectedGrade, selectedStationFilter]);

  // Top 3 Podium Students
  const topThree = useMemo(() => {
    return honorRollList.slice(0, 3);
  }, [honorRollList]);

  // Export Honor Roll to Official PDF Document
  const handleExportPdf = async () => {
    if (!printDocumentRef.current) return;

    setIsExportingPdf(true);
    setExportSuccessMsg(null);

    try {
      const element = printDocumentRef.current;
      const opt = {
        margin: [6, 6, 6, 6],
        filename: `لوحة_شرف_حماة_الوطن_الثانوية_الأولى_بالبدع_${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await (html2pdf as any)().set(opt).from(element).save();
      setExportSuccessMsg('تم تصدير لوحة الشرف بنجاح كملف PDF رسمي جاهز للطباعة والتكريم!');
      setTimeout(() => setExportSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Error exporting honor roll PDF:', err);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-8 text-right font-cairo">
      {/* Top Banner & Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-radial from-slate-950 via-emerald-950 to-emerald-900 border-2 border-amber-400/50 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold">
              <Crown className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>لوحة التكريم والاستحقاق الرسمي · مبادرة درع الوطن</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white font-calligraphy">
              لَوْحَةُ شَرَفِ «حُمَاةِ الوَطَن»
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium">
              سجل الشرف والتكريم الرسمي لطالبات الثانوية الأولى بالبدع الأكثر تفاعلاً وإنجازاً لمهمات ومحطات درع الوطن، إشراف مديرة المدرسة: <strong>أ. فاطمة سليمان المسعودي</strong>، إعداد وتنفيذ المعلمتين: <strong>أمل رشيد</strong> و<strong>وفاء الزهراني</strong>.
            </p>
          </div>

          {/* Action Export Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0 w-full lg:w-auto">
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-black text-xs sm:text-sm shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-200 disabled:opacity-50"
            >
              {isExportingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-950" />
              ) : (
                <FileDown className="w-4 h-4" />
              )}
              <span>{isExportingPdf ? 'جارٍ تصدير PDF...' : 'تصدير لوحة الشرف كملف PDF للتكريم'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-emerald-800/80 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 border border-emerald-600/60 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>طباعة فورية</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {exportSuccessMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-800/90 border border-emerald-400 text-white text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{exportSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Royal Podium Showcase: Top 3 Students */}
      {topThree.length >= 3 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              منصة التتويج الملكية · المراتب الثلاث الأولى على مستوى المدرسة:
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Rank 2 (Silver) */}
            <div className="order-2 md:order-1 p-6 rounded-3xl bg-gradient-to-b from-slate-100 via-slate-50 to-white border-2 border-slate-300 shadow-md flex flex-col justify-between space-y-4 relative">
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-200 text-slate-800 font-black text-xs flex items-center gap-1 shadow-xs">
                <span>المركز الثاني 🥈</span>
              </div>

              <div className="space-y-3 pt-4 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 text-white mx-auto flex items-center justify-center shadow-md border-2 border-slate-200">
                  <Medal className="w-8 h-8 text-slate-800" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900">{topThree[1].name}</h4>
                  <p className="text-xs text-slate-600 font-semibold">{topThree[1].grade}</p>
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-slate-200 text-slate-900 text-xs font-extrabold">
                  {topThree[1].points} نقطة درع
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 text-center text-xs space-y-1">
                <p className="text-emerald-800 font-bold">{topThree[1].station.title}</p>
                <p className="text-[11px] text-slate-500">{topThree[1].honorTitle}</p>
              </div>
            </div>

            {/* Rank 1 (Gold) */}
            <div className="order-1 md:order-2 p-7 rounded-3xl bg-gradient-to-b from-amber-100 via-amber-50 to-white border-2 border-amber-400 shadow-xl flex flex-col justify-between space-y-4 relative transform md:-translate-y-2 ring-4 ring-amber-400/20">
              <div className="absolute top-3 left-3 px-3.5 py-1.5 rounded-full bg-amber-400 text-emerald-950 font-black text-xs flex items-center gap-1.5 shadow-md">
                <Crown className="w-3.5 h-3.5 text-emerald-950 fill-emerald-950" />
                <span>المركز الأول 🥇</span>
              </div>

              <div className="space-y-3 pt-4 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 text-emerald-950 mx-auto flex items-center justify-center shadow-lg border-2 border-amber-200">
                  <Crown className="w-10 h-10 fill-emerald-950" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900">{topThree[0].name}</h4>
                  <p className="text-xs text-slate-700 font-bold">{topThree[0].grade}</p>
                </div>
                <div className="inline-block px-4 py-1.5 rounded-full bg-amber-400 text-emerald-950 text-sm font-black shadow-xs">
                  {topThree[0].points} نقطة درع (القمة)
                </div>
              </div>

              <div className="pt-3 border-t border-amber-200 text-center text-xs space-y-1">
                <p className="text-emerald-900 font-black">{topThree[0].station.title}</p>
                <p className="text-xs text-amber-800 font-bold">{topThree[0].honorTitle}</p>
              </div>
            </div>

            {/* Rank 3 (Bronze) */}
            <div className="order-3 p-6 rounded-3xl bg-gradient-to-b from-amber-50/60 via-slate-50 to-white border-2 border-amber-300 shadow-md flex flex-col justify-between space-y-4 relative">
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-200 text-amber-950 font-black text-xs flex items-center gap-1 shadow-xs">
                <span>المركز الثالث 🥉</span>
              </div>

              <div className="space-y-3 pt-4 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-white mx-auto flex items-center justify-center shadow-md border-2 border-amber-300">
                  <Medal className="w-8 h-8 text-amber-100" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900">{topThree[2].name}</h4>
                  <p className="text-xs text-slate-600 font-semibold">{topThree[2].grade}</p>
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-950 text-xs font-extrabold">
                  {topThree[2].points} نقطة درع
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 text-center text-xs space-y-1">
                <p className="text-emerald-800 font-bold">{topThree[2].station.title}</p>
                <p className="text-[11px] text-slate-500">{topThree[2].honorTitle}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="البحث باسم الطالبة أو الوسام..."
              className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
            />
          </div>

          {/* Grade Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
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
          </div>

          {/* Station Filter */}
          <select
            value={selectedStationFilter}
            onChange={(e) => setSelectedStationFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
          >
            <option value="all">جميع المحطات الوطنية</option>
            {SHIELD_JOURNEY_STATIONS.map((st) => (
              <option key={st.id} value={String(st.id)}>
                محطة {st.id}: {st.title}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 text-xs text-slate-600 w-full lg:w-auto justify-end">
          <span className="font-semibold">ترتيب حسب:</span>
          <button
            onClick={() => setSortBy('points')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
              sortBy === 'points'
                ? 'bg-emerald-800 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            النقاط (الأعلى)
          </button>
          <button
            onClick={() => setSortBy('missions')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
              sortBy === 'missions'
                ? 'bg-emerald-800 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            المهمات المكتملة
          </button>
          <button
            onClick={() => setSortBy('submissions')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
              sortBy === 'submissions'
                ? 'bg-emerald-800 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            المشاركات
          </button>
        </div>
      </div>

      {/* Main Honor Roll Table */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="space-y-0.5">
            <h4 className="text-base font-bold text-slate-900">
              قائمة الشرف والتكريم الشاملة للطالبات ({filteredList.length})
            </h4>
            <p className="text-xs text-slate-500">
              يتم تحديث الترتيب والنقاط ديناميكياً مع كل مشاركة أو مهمة يومية تنجزها الطالبة.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            محدث لحظياً ✓
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-3 text-center">الترتيب</th>
                <th className="p-3">اسم الطالبة</th>
                <th className="p-3">الصف الدراسي</th>
                <th className="p-3 text-center">مجموع النقاط</th>
                <th className="p-3">المحطة الوطنية المنجزة</th>
                <th className="p-3 text-center">المهمات</th>
                <th className="p-3 text-center">المشاركات</th>
                <th className="p-3">وسام الاستحقاق</th>
                <th className="p-3 text-center">شهادة التكريم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map((st) => (
                <tr
                  key={`${st.name}_${st.grade}`}
                  className={`hover:bg-slate-50 transition-colors ${
                    st.rank === 1
                      ? 'bg-amber-50/40 font-semibold'
                      : st.rank <= 3
                      ? 'bg-slate-50/50'
                      : ''
                  }`}
                >
                  {/* Rank Badge */}
                  <td className="p-3 text-center">
                    {st.rank === 1 ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-emerald-950 font-black shadow-xs">
                        1
                      </span>
                    ) : st.rank === 2 ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300 text-slate-800 font-black shadow-xs">
                        2
                      </span>
                    ) : st.rank === 3 ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-600 text-white font-black shadow-xs">
                        3
                      </span>
                    ) : (
                      <span className="text-slate-500 font-mono font-bold">{st.rank}</span>
                    )}
                  </td>

                  {/* Student Name */}
                  <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                    <span>{st.name}</span>
                    {st.rank <= 3 && (
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    )}
                  </td>

                  {/* Grade */}
                  <td className="p-3 text-slate-700 font-medium">{st.grade}</td>

                  {/* Points */}
                  <td className="p-3 text-center font-mono font-black text-amber-700 text-sm">
                    {st.points}
                  </td>

                  {/* Station */}
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-[11px] font-bold">
                      <Compass className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{st.station.title}</span>
                    </span>
                  </td>

                  {/* Missions Count */}
                  <td className="p-3 text-center font-mono font-bold text-blue-700">
                    {st.missionsCompleted}
                  </td>

                  {/* Submissions Count */}
                  <td className="p-3 text-center font-mono font-bold text-slate-700">
                    {st.submissionsCount}
                  </td>

                  {/* Honor Title */}
                  <td className="p-3">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        st.rank === 1
                          ? 'bg-amber-400 text-emerald-950 font-black'
                          : st.rank <= 3
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-emerald-50 text-emerald-800'
                      }`}
                    >
                      {st.honorTitle}
                    </span>
                  </td>

                  {/* Action Certificate */}
                  <td className="p-3 text-center whitespace-nowrap">
                    <button
                      onClick={() => {
                        if (onOpenStudentCertificate) {
                          onOpenStudentCertificate(st.name, st.grade);
                        }
                      }}
                      className="px-3 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs flex items-center gap-1 cursor-pointer mx-auto shadow-2xs transition-colors"
                      title="إصدار شهادة تقدير رسمية فورية للطالبة"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span>تكريم ✦</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* HIDDEN FORMAL DOCUMENT FOR PDF EXPORT & PRINTING                          */}
      {/* ========================================================================= */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div
          ref={printDocumentRef}
          className="p-10 bg-white text-slate-900 font-cairo text-right space-y-6"
          style={{ width: '800px', minHeight: '1100px' }}
        >
          {/* Official Formal Header */}
          <div className="flex items-center justify-between border-b-2 border-emerald-900 pb-4">
            <div className="text-right text-xs space-y-1">
              <p className="font-bold text-slate-900 text-sm">المملكة العربية السعودية</p>
              <p className="text-slate-700 font-semibold">وزارة التعليم</p>
              <p className="text-slate-600">الإدارة العامة للتعليم بمنطقة تبوك</p>
              <p className="font-bold text-emerald-950 text-sm">الثانوية الأولى بالبدع</p>
            </div>

            {/* Emblem */}
            <div className="text-center space-y-1">
              <img
                src={heroShieldImg}
                alt="شعار مبادرة درع الوطن"
                className="w-16 h-16 rounded-full object-cover border-2 border-amber-500 shadow-md mx-auto"
              />
              <div className="text-xs font-black text-emerald-950">مبادرة «دِرْعُ الوَطَن»</div>
              <div className="text-[10px] text-amber-700 font-bold">المادة 34 من النظام الأساسي للحكم</div>
            </div>

            {/* Document Reference & Date */}
            <div className="text-left text-xs space-y-1 font-mono">
              <p className="text-slate-800 font-bold">
                تاريخ الإصدار: {new Date().toLocaleDateString('ar-SA')}
              </p>
              <p className="text-slate-500 text-[11px]">الموافق: {new Date().toISOString().slice(0, 10)} م</p>
              <p className="text-emerald-800 font-bold text-[11px]">الرقم المرجعي: HON-2026-BD</p>
              <p className="text-slate-600 text-[11px]">الحالة: معتمد رسمياً للتكريم ✓</p>
            </div>
          </div>

          {/* Title Banner */}
          <div className="text-center space-y-2 py-3 bg-gradient-to-r from-emerald-50 via-amber-50/60 to-emerald-50 rounded-2xl p-4 border border-emerald-300">
            <h2 className="text-2xl font-black text-emerald-950">
              لَوْحَةُ شَرَفِ «حُمَاةِ الوَطَن» الْمُعْتَمَدَةُ لِلتَّكْرِيمِ المَدْرَسِيِّ
            </h2>
            <p className="text-xs text-slate-700 font-medium">
              قائمة الطالبات المتميزات في مبادرة درع الوطن والتوعية الدستورية بالمادة (34) من النظام الأساسي للحكم
            </p>
          </div>

          {/* Meta Info Strip */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500">المدرسة:</span>{' '}
              <strong className="text-slate-900">الثانوية الأولى بالبدع</strong>
            </div>
            <div>
              <span className="text-slate-500">إشراف مديرة المدرسة:</span>{' '}
              <strong className="text-emerald-950 font-black">أ. فاطمة سليمان المسعودي</strong>
            </div>
            <div>
              <span className="text-slate-500">إعداد وتنفيذ المعلمتين:</span>{' '}
              <strong className="text-emerald-900 font-bold">أمل رشيد + وفاء الزهراني</strong>
            </div>
            <div>
              <span className="text-slate-500">عدد المكرمات في القائمة:</span>{' '}
              <strong className="text-amber-800 font-bold">{filteredList.length} طالبة</strong>
            </div>
          </div>

          {/* Table of Honorees */}
          <table className="w-full text-xs text-right border-collapse border border-slate-300">
            <thead>
              <tr className="bg-emerald-950 text-white font-bold">
                <th className="p-2 border border-slate-300 text-center w-12">الترتيب</th>
                <th className="p-2 border border-slate-300">اسم الطالبة الثلاثي</th>
                <th className="p-2 border border-slate-300">الصف الدراسي</th>
                <th className="p-2 border border-slate-300 text-center">النقاط</th>
                <th className="p-2 border border-slate-300">المحطة الوطنية</th>
                <th className="p-2 border border-slate-300">وسام الاستحقاق</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.slice(0, 15).map((st) => (
                <tr
                  key={`pdf_${st.name}_${st.grade}`}
                  className={st.rank <= 3 ? 'bg-amber-50/50 font-bold' : ''}
                >
                  <td className="p-2 border border-slate-300 text-center font-bold">
                    {st.rank === 1 ? 'الأول 🥇' : st.rank === 2 ? 'الثاني 🥈' : st.rank === 3 ? 'الثالث 🥉' : st.rank}
                  </td>
                  <td className="p-2 border border-slate-300 font-bold text-slate-900">{st.name}</td>
                  <td className="p-2 border border-slate-300 text-slate-700">{st.grade}</td>
                  <td className="p-2 border border-slate-300 text-center font-mono font-bold text-amber-800">
                    {st.points}
                  </td>
                  <td className="p-2 border border-slate-300 text-emerald-900">{st.station.title}</td>
                  <td className="p-2 border border-slate-300 text-slate-800">{st.honorTitle}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Official Signatures & Seal */}
          <div className="pt-8 grid grid-cols-3 gap-6 text-center text-xs border-t-2 border-slate-300">
            <div className="space-y-2">
              <p className="text-slate-600">إعداد وتنفيذ المعلمة:</p>
              <p className="text-sm font-bold text-emerald-950">أمل رشيد</p>
              <p className="text-[10px] text-slate-400">الثانوية الأولى بالبدع</p>
              <div className="w-24 h-0.5 bg-slate-300 mx-auto mt-2" />
            </div>

            <div className="space-y-2 border-x border-slate-200 px-3">
              <p className="text-emerald-900 font-bold">اعتماد وختم مديرة المدرسة:</p>
              <p className="text-sm font-black text-emerald-950">أ. فاطمة سليمان المسعودي</p>
              <p className="text-[10px] text-amber-700 font-bold">الثانوية الأولى بالبدع</p>
              <div className="w-28 h-0.5 bg-amber-400 mx-auto mt-2" />
            </div>

            <div className="space-y-2">
              <p className="text-slate-600">إعداد وتنفيذ المعلمة:</p>
              <p className="text-sm font-bold text-emerald-950">وفاء الزهراني</p>
              <p className="text-[10px] text-slate-400">الثانوية الأولى بالبدع</p>
              <div className="w-24 h-0.5 bg-slate-300 mx-auto mt-2" />
            </div>
          </div>

          <div className="text-center pt-4 text-[10px] text-slate-400 border-t border-slate-100 flex items-center justify-between">
            <span>الثانوية الأولى بالبدع · مبادرة درع الوطن · المادة 34 من النظام الأساسي للحكم</span>
            <span>وثيقة تكريم رسمية معتمدة من إدارة المدرسة</span>
          </div>
        </div>
      </div>
    </div>
  );
};
