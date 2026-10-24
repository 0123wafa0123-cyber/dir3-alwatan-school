import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  Shield,
  Award,
  Star,
  Sparkles,
  Crown,
  Flag,
  BookOpen,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Unlock,
  ArrowLeft,
  Flame,
  Search,
  RefreshCw,
  Info,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  UserCheck,
  Zap,
  Target
} from 'lucide-react';
import { StudentMissionProgress } from '../types';
import {
  SHIELD_JOURNEY_STATIONS,
  OFFICIAL_BADGES_DEFINITIONS,
  ShieldStation
} from '../constants/dailyMissions';
import { SCHOOL_GRADES } from '../constants/grades';
import { api } from '../services/api';
import { DigitalAchievementCardModal } from './DigitalAchievementCardModal';

interface HomelandGuardiansJourneyProps {
  onNavigate: (tab: 'home' | 'article34' | 'student' | 'book' | 'admin' | 'mission' | 'certificate') => void;
  onSelectStudentSection?: (section: 'text' | 'drawing' | 'survey' | 'quiz' | 'certificate') => void;
  initialStudentName?: string;
  initialGrade?: string;
}

export const HomelandGuardiansJourney: React.FC<HomelandGuardiansJourneyProps> = ({
  onNavigate,
  onSelectStudentSection,
  initialStudentName = '',
  initialGrade = SCHOOL_GRADES[0]
}) => {
  // Saved / Current Student Profile
  const [studentName, setStudentName] = useState<string>(() => {
    return initialStudentName || localStorage.getItem('deraa_active_student_name') || '';
  });
  const [grade, setGrade] = useState<string>(() => {
    return initialGrade || localStorage.getItem('deraa_active_student_grade') || SCHOOL_GRADES[0];
  });

  const [inputName, setInputName] = useState<string>(studentName);
  const [inputGrade, setInputGrade] = useState<string>(grade);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Live Student Progress
  const [progress, setProgress] = useState<StudentMissionProgress>({
    studentName: studentName || 'طالبة درع الوطن',
    grade: grade,
    totalPoints: 0,
    completedMissionsCount: 0,
    completedDates: [],
    currentStreak: 0,
    unlockedBadges: [],
    unlockedStations: 1,
    weeklyBoxClaimed: false,
    weeklyMissionsCount: 0
  });

  // Selected Station for detail view
  const [selectedStationId, setSelectedStationId] = useState<number>(1);

  // Digital Card Modal
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState<boolean>(false);

  // Fetch student progress
  const fetchProgress = async (name: string, gr: string) => {
    if (!name.trim()) {
      setProgress({
        studentName: 'طالبة درع الوطن',
        grade: gr,
        totalPoints: 0,
        completedMissionsCount: 0,
        completedDates: [],
        currentStreak: 0,
        unlockedBadges: [],
        unlockedStations: 1,
        weeklyBoxClaimed: false,
        weeklyMissionsCount: 0
      });
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.getStudentMissionProgress(name.trim(), gr);
      setProgress(data);
      // Auto select current active station
      setSelectedStationId(data.unlockedStations || 1);
    } catch (err) {
      console.error('Error fetching student journey progress:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (studentName) {
      fetchProgress(studentName, grade);
    }
  }, [studentName, grade]);

  // Handle student search / apply
  const handleApplyStudent = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = inputName.trim();
    if (!clean) {
      alert('يرجى إدخال اسمكِ الكريم للبحث عن تقدمكِ في رحلة الحماة.');
      return;
    }
    setStudentName(clean);
    setGrade(inputGrade);
    localStorage.setItem('deraa_active_student_name', clean);
    localStorage.setItem('deraa_active_student_grade', inputGrade);
    fetchProgress(clean, inputGrade);
  };

  // Helper icons mapper for stations
  const getStationIcon = (stationId: number) => {
    switch (stationId) {
      case 1:
        return Flag;
      case 2:
        return BookOpen;
      case 3:
        return ShieldAlert;
      case 4:
        return Star;
      case 5:
        return Sparkles;
      case 6:
        return Crown;
      default:
        return Shield;
    }
  };

  // Calculations
  const selectedStation = useMemo(() => {
    return SHIELD_JOURNEY_STATIONS.find((s) => s.id === selectedStationId) || SHIELD_JOURNEY_STATIONS[0];
  }, [selectedStationId]);

  const maxPoints = 200;
  const progressPercent = Math.min(100, Math.round((progress.totalPoints / maxPoints) * 100));

  // Determine next milestone
  const nextStation = useMemo(() => {
    return SHIELD_JOURNEY_STATIONS.find((s) => s.requiredPoints > progress.totalPoints);
  }, [progress.totalPoints]);

  const pointsToNext = nextStation ? Math.max(0, nextStation.requiredPoints - progress.totalPoints) : 0;

  // Badges status list
  const badgesList = useMemo(() => {
    return [
      {
        id: 'ambassador_awareness',
        title: 'سفيرة الوعي',
        icon: Compass,
        gradient: 'from-emerald-500 to-teal-700',
        unlocked: progress.completedMissionsCount >= 1 || progress.totalPoints >= 40,
        condition: 'إنجاز مهمة المادة 34 أو جمع 40 نقطة',
        description: 'تُمنح للطالبة المتميزة في استيعاب المادة 34 ونشر ثقافة الواجب الوطني.'
      },
      {
        id: 'values_guardian',
        title: 'حامية القيم',
        icon: Shield,
        gradient: 'from-amber-500 to-yellow-600',
        unlocked: progress.completedMissionsCount >= 2 || progress.totalPoints >= 80,
        condition: 'إنجاز مهمتين أو جمع 80 نقطة',
        description: 'تُمنح لمن تتصدى للشائعات الرقمية وتدافع عن قيم المجتمع وثوابته.'
      },
      {
        id: 'participation_star',
        title: 'نجمة المشاركة',
        icon: Star,
        gradient: 'from-purple-500 to-indigo-700',
        unlocked: progress.completedMissionsCount >= 3 || progress.totalPoints >= 120,
        condition: 'إنجاز 3 مهام يومية أو جمع 120 نقطة',
        description: 'تُمنح للطالبة المثابرة التي تحافظ على وتيرة التفاعل اليومي في درع الوطن.'
      },
      {
        id: 'impact_maker',
        title: 'صانعة الأثر',
        icon: Award,
        gradient: 'from-rose-500 to-pink-700',
        unlocked: progress.completedMissionsCount >= 5 || progress.totalPoints >= 160,
        condition: 'إنجاز 5 مهام يومية أو جمع 160 نقطة',
        description: 'تُمنح لمن تجمع بين المعرفة والمبادرة المجتمعية وتلهم زميلاتها في المدرسة.'
      },
      {
        id: 'grand_shield_master',
        title: 'وسام درع الوطن الخالد',
        icon: Crown,
        gradient: 'from-amber-400 via-yellow-500 to-amber-600',
        unlocked: progress.totalPoints >= 200,
        condition: 'بلوغ قمة المجد وجمع 200 نقطة كاملة',
        description: 'أعلى وسام شرفي تمنحه ثانوية البدع الأولى لحاميات الوطن المتميزات.'
      }
    ];
  }, [progress]);

  const unlockedBadgesCount = badgesList.filter((b) => b.unlocked).length;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-radial from-slate-950 via-emerald-950 to-slate-900 border-2 border-amber-400/50 p-6 sm:p-10 text-white shadow-2xl">
      {/* Subtle national geometric patterns */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-8">
        {/* Header Title & Concept */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-amber-400/20">
          <div className="space-y-2 text-right">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/80 border border-amber-400/40 text-amber-300 text-xs font-bold">
              <Compass className="w-4 h-4 text-amber-400 animate-spin-slow" />
              <span>نظام المحطات التفاعلي المعتمد · الثانوية الأولى بالبدع</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white font-calligraphy tracking-tight">
              رِحْلَةُ حُمَاةِ الوَطَن
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium max-w-2xl">
              خريطة بصرية تفاعلية ترافق الطالبات في مسيرتهن اليومية لترسيخ الوعي الدستوري بالمادة 34، اجتياز المحطات الوطنية الست، وحصد أوسمة الشرف والاستحقاق.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 shrink-0 bg-emerald-900/60 backdrop-blur-md p-3.5 rounded-2xl border border-amber-400/30">
            <div className="text-center px-3 border-l border-emerald-700/60">
              <span className="block text-[11px] text-emerald-200/80 font-bold">المحطات</span>
              <span className="text-lg font-black text-amber-300">
                {progress.unlockedStations} / 6
              </span>
            </div>
            <div className="text-center px-3 border-l border-emerald-700/60">
              <span className="block text-[11px] text-emerald-200/80 font-bold">نقاط الدرع</span>
              <span className="text-lg font-black text-amber-300">
                {progress.totalPoints}
              </span>
            </div>
            <div className="text-center px-3">
              <span className="block text-[11px] text-emerald-200/80 font-bold">الأوسمة</span>
              <span className="text-lg font-black text-amber-300">
                {unlockedBadgesCount} / 5
              </span>
            </div>
          </div>
        </div>

        {/* Student Lookup & Progress Live Tracker Bar */}
        <div className="bg-emerald-900/70 backdrop-blur-md rounded-2xl border border-amber-400/40 p-5 space-y-4 shadow-inner">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Student Search / Identity form */}
            <form onSubmit={handleApplyStudent} className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span>تتبع رحلتكِ:</span>
              </div>
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="اكتبي اسمكِ الثلاثي..."
                className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-emerald-600/70 text-white text-xs font-medium placeholder-emerald-400/50 focus:outline-hidden focus:border-amber-400 w-48 sm:w-56"
              />
              <select
                value={inputGrade}
                onChange={(e) => setInputGrade(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900/80 border border-emerald-600/70 text-white text-xs font-medium focus:outline-hidden focus:border-amber-400"
              >
                {SCHOOL_GRADES.map((g) => (
                  <option key={g} value={g} className="bg-slate-900 text-white">
                    {g}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                <span>فحص التقدم</span>
              </button>
            </form>

            {/* Live Status Indicators */}
            <div className="flex flex-wrap items-center gap-3 text-xs w-full lg:w-auto justify-end">
              {progress.currentStreak > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold">
                  <Flame className="w-4 h-4 text-amber-400 animate-pulse fill-amber-400" />
                  <span>تتابع يومي: {progress.currentStreak} يوم</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800/80 border border-emerald-500/40 text-emerald-200 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>المهام المنجزة: {progress.completedMissionsCount}</span>
              </div>

              {studentName && (
                <button
                  onClick={() => setIsAchievementModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>عرض بطاقة الإنجاز</span>
                </button>
              )}
            </div>
          </div>

          {/* Points Progress Bar to Summit */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-200/90 font-medium">
                {studentName ? `المستوى الحالي للطالبة: ${studentName}` : 'مستوى حامية الوطن'}
              </span>
              <span className="font-black text-amber-300">
                {progress.totalPoints} / {maxPoints} نقطة درع ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-3 bg-slate-900/80 rounded-full overflow-hidden p-0.5 border border-emerald-700/50">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-yellow-300 rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-emerald-300/80 pt-0.5">
              <span>الانطلاقة (0)</span>
              {pointsToNext > 0 ? (
                <span className="text-amber-300 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  تبقت {pointsToNext} نقطة للوصول إلى {nextStation?.title}!
                </span>
              ) : (
                <span className="text-amber-300 font-bold flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  تم بلوغ قمة المجد الوطنية بدرع الوطن!
                </span>
              )}
              <span>قمة المجد (200)</span>
            </div>
          </div>
        </div>

        {/* ===================== THE VISUAL STATIONS MAP ===================== */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="text-base sm:text-lg font-bold text-white">
                خريطة المسار الوطني (انقري على أي محطة للاطلاع على تفاصيلها):
              </h3>
            </div>
            <span className="text-xs text-amber-300/80 font-medium hidden sm:inline">
              المحطة المحددة: {selectedStation.title}
            </span>
          </div>

          {/* Desktop Panoramic Step Map */}
          <div className="relative py-6 hidden lg:block">
            {/* Connecting Golden Highway Track */}
            <div className="absolute top-[52px] left-10 right-10 h-3 bg-slate-900/90 rounded-full border border-emerald-700/60 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-yellow-300 transition-all duration-700"
                style={{
                  width: `${((Math.max(1, progress.unlockedStations) - 1) / (SHIELD_JOURNEY_STATIONS.length - 1)) * 100}%`
                }}
              />
            </div>

            {/* Stations 6 Nodes Grid */}
            <div className="grid grid-cols-6 gap-4 relative z-10">
              {SHIELD_JOURNEY_STATIONS.map((station) => {
                const IconComponent = getStationIcon(station.id);
                const isUnlocked = progress.totalPoints >= station.requiredPoints;
                const isCurrent = progress.unlockedStations === station.id;
                const isSelected = selectedStationId === station.id;

                return (
                  <button
                    key={station.id}
                    onClick={() => setSelectedStationId(station.id)}
                    className={`group text-right p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col items-center text-center relative ${
                      isSelected
                        ? 'ring-4 ring-amber-400/40 border-amber-300 bg-emerald-900/90 shadow-2xl scale-105'
                        : isCurrent
                        ? 'border-amber-400 bg-emerald-900/70 shadow-lg'
                        : isUnlocked
                        ? 'border-emerald-500/70 bg-emerald-950/60 hover:bg-emerald-900/60 hover:border-emerald-400'
                        : 'border-slate-800 bg-slate-950/50 opacity-60 hover:opacity-80'
                    }`}
                  >
                    {/* Active Flag / Marker Pill */}
                    {isCurrent && (
                      <div className="absolute -top-3 px-2 py-0.5 rounded-full bg-amber-400 text-emerald-950 text-[10px] font-black shadow-md animate-bounce">
                        أنتِ هنا 🚩
                      </div>
                    )}

                    {/* Node Circle */}
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-sm shadow-xl transition-transform duration-300 group-hover:scale-110 mb-3 border-2 ${
                        isCurrent
                          ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 text-emerald-950 border-amber-200'
                          : isUnlocked
                          ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white border-emerald-300'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {isUnlocked ? (
                        <IconComponent className="w-6 h-6" />
                      ) : (
                        <Lock className="w-5 h-5 text-slate-500" />
                      )}
                    </div>

                    <div className="space-y-1 w-full">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-[10px] font-extrabold text-amber-400">
                          محطة {station.id}
                        </span>
                        {isUnlocked && (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        )}
                      </div>
                      <span className="text-xs font-black text-white block truncate">
                        {station.title}
                      </span>
                      <span className="text-[10px] text-emerald-200/70 block truncate">
                        {station.requiredPoints} نقطة
                      </span>
                    </div>

                    {/* Status Pill */}
                    <div className="mt-3 pt-2 border-t border-emerald-800/40 w-full text-[10px]">
                      {isUnlocked ? (
                        <span className="text-emerald-300 font-bold">مكتملة ✓</span>
                      ) : (
                        <span className="text-slate-400">مغلقة 🔒</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile & Tablet Vertical Step Map */}
          <div className="space-y-3 lg:hidden">
            {SHIELD_JOURNEY_STATIONS.map((station) => {
              const IconComponent = getStationIcon(station.id);
              const isUnlocked = progress.totalPoints >= station.requiredPoints;
              const isCurrent = progress.unlockedStations === station.id;
              const isSelected = selectedStationId === station.id;

              return (
                <div
                  key={station.id}
                  onClick={() => setSelectedStationId(station.id)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isSelected
                      ? 'border-amber-400 bg-emerald-900/90 shadow-xl ring-2 ring-amber-400/30'
                      : isCurrent
                      ? 'border-amber-400/80 bg-emerald-900/60'
                      : isUnlocked
                      ? 'border-emerald-600/50 bg-emerald-950/60'
                      : 'border-slate-800 bg-slate-950/40 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-sm shrink-0 border-2 ${
                        isCurrent
                          ? 'bg-amber-400 text-emerald-950 border-amber-200'
                          : isUnlocked
                          ? 'bg-emerald-600 text-white border-emerald-400'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {isUnlocked ? (
                        <IconComponent className="w-5 h-5" />
                      ) : (
                        <Lock className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">
                          {station.title}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-emerald-950 text-[9px] font-black">
                            أنتِ هنا 🚩
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-emerald-200/80 font-medium">
                        {station.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <span className="text-xs font-extrabold text-amber-300 block">
                      {station.requiredPoints} ن
                    </span>
                    <span className="text-[10px] text-emerald-300">
                      {isUnlocked ? 'مكتملة ✓' : 'مغلقة 🔒'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Station Interactive Spotlight Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-900/90 via-emerald-950 to-slate-900 border-2 border-amber-400/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 text-right max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-amber-400 text-emerald-950 text-xs font-black">
                  المحطة {selectedStation.id}
                </span>
                <h4 className="text-lg sm:text-xl font-black text-white font-calligraphy">
                  {selectedStation.title} · {selectedStation.subtitle}
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium">
                {selectedStation.description}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-amber-300/90 pt-1">
                <span>النقاط المطلوبة: <strong>{selectedStation.requiredPoints} نقطة</strong></span>
                <span>·</span>
                <span>
                  حالتكِ الحالية: {' '}
                  {progress.totalPoints >= selectedStation.requiredPoints ? (
                    <strong className="text-emerald-400">تم اجتيازها بنجاح ✦</strong>
                  ) : (
                    <strong className="text-amber-400">
                      متبقي {selectedStation.requiredPoints - progress.totalPoints} نقطة للاجتياز
                    </strong>
                  )}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0 w-full md:w-auto">
              <button
                onClick={() => onNavigate('mission')}
                className="w-full md:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-emerald-950" />
                <span>خوض مهمة اليوم للتقدم</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ===================== OFFICIAL BADGES GALLERY ===================== */}
        <div className="space-y-4 pt-4 border-t border-amber-400/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg sm:text-xl font-black text-white">
                شارات وأوسمة الإنجاز الوطني
              </h3>
            </div>
            <span className="text-xs text-emerald-200/80">
              تُمنح شارات الاستحقاق آلياً وترتبط باسم الطالبة وسجلها المدرسي المعتمد
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {badgesList.map((badge) => {
              const BadgeIcon = badge.icon;
              return (
                <div
                  key={badge.id}
                  className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-3 relative overflow-hidden ${
                    badge.unlocked
                      ? 'bg-gradient-to-b from-emerald-900/80 to-emerald-950/90 border-amber-400/80 shadow-lg ring-1 ring-amber-400/30'
                      : 'bg-slate-950/40 border-slate-800 opacity-60'
                  }`}
                >
                  {badge.unlocked && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-400 text-emerald-950 text-[9px] font-black shadow-xs">
                      مكتسبة ✨
                    </div>
                  )}

                  <div className="space-y-3">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${badge.gradient} text-white flex items-center justify-center shadow-md ${
                        badge.unlocked ? 'scale-105' : 'grayscale opacity-70'
                      }`}
                    >
                      <BadgeIcon className="w-6 h-6" />
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-white">
                        {badge.title}
                      </h4>
                      <p className="text-[11px] text-emerald-200/80 leading-relaxed line-clamp-2">
                        {badge.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-emerald-800/40 text-[10px] text-amber-300 font-bold flex items-center justify-between">
                    <span>{badge.condition}</span>
                    {badge.unlocked ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Hub Strip */}
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-amber-400/30 flex flex-wrap items-center justify-between gap-4">
          <div className="text-right">
            <span className="text-xs font-bold text-amber-300 block">
              هل أكملتِ محطاتكِ في رحلة الحماة؟
            </span>
            <p className="text-[11px] text-emerald-200/80 font-medium">
              يمكنكِ إصدار بطاقة إنجازكِ الرقمية فوراً أو استخراج شهادة التقدير الرسمية المعتمدة بإشراف إدارة المدرسة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsAchievementModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 border border-emerald-600 transition-colors cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>بطاقة الإنجاز الرقمية</span>
            </button>

            <button
              onClick={() => onNavigate('certificate')}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>إصدار شهادة التقدير الرسمية</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Achievement Card Modal */}
      <DigitalAchievementCardModal
        isOpen={isAchievementModalOpen}
        onClose={() => setIsAchievementModalOpen(false)}
        studentName={studentName || 'طالبة درع الوطن'}
        grade={grade}
        progress={progress}
      />
    </section>
  );
};
