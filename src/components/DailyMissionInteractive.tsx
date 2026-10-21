import React, { useState, useEffect } from 'react';
import {
  Shield,
  Star,
  Award,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Flame,
  Gift,
  Lock,
  Unlock,
  Printer,
  ChevronLeft,
  Users,
  Compass,
  ArrowRight,
  TrendingUp,
  Share2
} from 'lucide-react';
import {
  DailyMission,
  StudentMissionProgress,
  ClassCollaborativeProgress,
  StudentBadge
} from '../types';
import {
  getTodayMission,
  getTodayDateString,
  SHIELD_JOURNEY_STATIONS,
  OFFICIAL_BADGES_DEFINITIONS
} from '../constants/dailyMissions';
import { SCHOOL_GRADES } from '../constants/grades';
import { api } from '../services/api';
import { DigitalAchievementCardModal } from './DigitalAchievementCardModal';

interface DailyMissionInteractiveProps {
  onBackToHome?: () => void;
  defaultStudentName?: string;
  defaultGrade?: string;
}

export const DailyMissionInteractive: React.FC<DailyMissionInteractiveProps> = ({
  onBackToHome,
  defaultStudentName = '',
  defaultGrade = SCHOOL_GRADES[0]
}) => {
  // Student Identity
  const [studentName, setStudentName] = useState<string>(defaultStudentName);
  const [grade, setGrade] = useState<string>(defaultGrade);

  // Today's Mission Data
  const [todayMission] = useState<DailyMission>(() => getTodayMission());
  const todayDateStr = getTodayDateString();

  // Progress State
  const [progress, setProgress] = useState<StudentMissionProgress>({
    studentName: defaultStudentName,
    grade: defaultGrade,
    totalPoints: 0,
    completedMissionsCount: 0,
    completedDates: [],
    currentStreak: 0,
    unlockedBadges: [],
    unlockedStations: 1,
    weeklyBoxClaimed: false,
    weeklyMissionsCount: 0
  });

  // Collaborative Classes State
  const [classesProgress, setClassesProgress] = useState<ClassCollaborativeProgress[]>([]);

  // Interaction State
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasAnsweredToday, setHasAnsweredToday] = useState<boolean>(false);
  const [answerResult, setAnswerResult] = useState<{
    isCorrect: boolean;
    pointsEarned: number;
    explanation: string;
    newBadges?: StudentBadge[];
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'mission' | 'journey' | 'classes' | 'box'>('mission');

  // Modals
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState<boolean>(false);
  const [isBoxModalOpen, setIsBoxModalOpen] = useState<boolean>(false);
  const [boxClaimMessage, setBoxClaimMessage] = useState<string | null>(null);

  // Load progress and classes
  const loadData = async (name: string, gr: string) => {
    if (name.trim().length >= 2) {
      try {
        const prog = await api.getStudentMissionProgress(name, gr);
        setProgress(prog);
        const alreadyDone = prog.completedDates.includes(todayDateStr);
        setHasAnsweredToday(alreadyDone);
      } catch (err) {
        console.error('Error fetching mission progress:', err);
      }
    }
    try {
      const cls = await api.getClassesProgress();
      setClassesProgress(cls);
    } catch (err) {
      console.error('Error fetching classes progress:', err);
    }
  };

  useEffect(() => {
    loadData(studentName, grade);
  }, [studentName, grade]);

  // Handle Option Submission
  const handleAnswerSubmit = async () => {
    if (selectedOption === null) return;
    if (!studentName.trim()) {
      alert('الرجاء كتابة اسمكِ الكريم أولاً لتسجيل إنجازكِ الوطني وربطه بشاراتكِ.');
      return;
    }

    setIsSubmitting(true);
    const isCorrect = selectedOption === todayMission.correctIndex;
    const earnedPoints = isCorrect ? todayMission.points : Math.round(todayMission.points / 2);

    try {
      const res = await api.completeDailyMission({
        studentName: studentName.trim(),
        grade,
        missionId: todayMission.id,
        missionTitle: todayMission.title,
        points: earnedPoints,
        isCorrect,
        dateStr: todayDateStr
      });

      if (res.alreadyCompleted) {
        setHasAnsweredToday(true);
        setAnswerResult({
          isCorrect: true,
          pointsEarned: 0,
          explanation: todayMission.explanation
        });
      } else {
        setHasAnsweredToday(true);
        setAnswerResult({
          isCorrect,
          pointsEarned: earnedPoints,
          explanation: todayMission.explanation,
          newBadges: res.newBadges
        });
        // Refresh progress
        await loadData(studentName, grade);
      }
    } catch (err) {
      console.error('Failed to record mission:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Weekly Box Claim
  const handleClaimWeeklyBox = async () => {
    if (!studentName.trim()) {
      alert('الرجاء كتابة اسمكِ أولاً');
      return;
    }

    try {
      const res = await api.claimWeeklyBox(studentName, grade);
      setBoxClaimMessage(res.message);
      setIsBoxModalOpen(true);
      await loadData(studentName, grade);
    } catch (err: any) {
      alert(err.message || 'تعذر فتح الصندوق حالياً');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Breadcrumb & Return */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة للرئيسية</span>
            </button>
          )}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
            <Shield className="w-3.5 h-3.5 text-emerald-700" />
            <span>مبادرة درع الوطن · الثانوية الأولى بالبدع</span>
          </div>
        </div>

        <button
          onClick={() => setIsAchievementModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-extrabold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer border border-amber-300"
        >
          <Printer className="w-4 h-4" />
          <span>استعراض بطاقة الإنجاز الرقمية</span>
        </button>
      </div>

      {/* Hero Banner with Royal Emerald / Gold Identity */}
      <div className="relative overflow-hidden rounded-3xl bg-radial from-emerald-900 via-emerald-950 to-slate-950 text-white p-6 sm:p-10 border border-amber-500/30 shadow-xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-right max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-amber-400/40 text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>التحدي اليومي لبنات الوطن</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white font-calligraphy">
              مَهَمَّةُ دِرْعِ الوَطَن اليَومِيَّة
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-medium">
              تحدٍ وطني متجدد يومياً يعزز الوعي الدستوري بالمادة (34)، يمنحكِ نقاط الدرع، ويفتح لكِ محطات «رحلة حماة الوطن» وصندوق المفاجآت الأسبوعي.
            </p>
          </div>

          {/* Student Status Quick Widget */}
          <div className="w-full lg:w-auto bg-emerald-900/60 border border-amber-400/30 rounded-2xl p-5 backdrop-blur-md flex flex-wrap items-center justify-around gap-4 shrink-0">
            <div className="text-center px-3">
              <div className="flex items-center justify-center gap-1 text-amber-400 text-xs font-bold mb-1">
                <Shield className="w-4 h-4" />
                <span>نقاط الدرع</span>
              </div>
              <span className="text-3xl font-black text-white">{progress.totalPoints}</span>
            </div>

            <div className="h-10 w-px bg-amber-400/20" />

            <div className="text-center px-3">
              <div className="flex items-center justify-center gap-1 text-orange-400 text-xs font-bold mb-1">
                <Flame className="w-4 h-4" />
                <span>سلسلة الالتزام</span>
              </div>
              <span className="text-3xl font-black text-white">
                {progress.currentStreak} <span className="text-xs text-emerald-300">أيام</span>
              </span>
            </div>

            <div className="h-10 w-px bg-amber-400/20" />

            <div className="text-center px-3">
              <div className="flex items-center justify-center gap-1 text-emerald-300 text-xs font-bold mb-1">
                <Award className="w-4 h-4" />
                <span>محطة الرحلة</span>
              </div>
              <span className="text-xl font-black text-amber-300">
                {progress.unlockedStations} / 6
              </span>
            </div>
          </div>
        </div>

        {/* Student Identity Inputs */}
        <div className="relative z-10 mt-6 pt-6 border-t border-emerald-800/60 flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:w-auto text-xs text-amber-200 font-bold shrink-0">
            بيانات الطالبة للمشاركة:
          </div>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="اكتبي اسمكِ الثلاثي (مثلاً: ريناد أحمد الحويطي)"
            className="w-full sm:max-w-xs px-3.5 py-2 rounded-xl bg-emerald-950/80 border border-amber-400/40 text-white placeholder-emerald-300/50 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
          />
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-emerald-950/80 border border-amber-400/40 text-amber-200 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
          >
            {SCHOOL_GRADES.map((g) => (
              <option key={g} value={g} className="bg-emerald-950 text-white">
                {g}
              </option>
            ))}
          </select>
          {studentName.trim().length >= 2 && (
            <span className="text-[11px] text-emerald-300 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              <span>تم الربط بنجاح مع سجل إنجازاتكِ</span>
            </span>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('mission')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'mission'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>مهمة اليوم ({hasAnsweredToday ? 'مكتملة ✓' : 'جديدة'})</span>
        </button>

        <button
          onClick={() => setActiveTab('journey')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'journey'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Compass className="w-4 h-4 text-amber-400" />
          <span>خريطة «رحلة حماة الوطن»</span>
        </button>

        <button
          onClick={() => setActiveTab('box')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'box'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Gift className="w-4 h-4 text-amber-400" />
          <span>صندوق مفاجآت الأسبوع</span>
          {progress.canClaimWeeklyBox && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('classes')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'classes'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4 text-amber-400" />
          <span>تحديات الفصول التعاونية</span>
        </button>
      </div>

      {/* TAB 1: Today's Mission */}
      {activeTab === 'mission' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Mission Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-emerald-900/10 space-y-6">
              {/* Mission Header Strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold border border-emerald-300">
                    {todayMission.type === 'scenario'
                      ? 'موقف وطني'
                      : todayMission.type === 'riddle'
                      ? 'لغز وطني'
                      : 'سؤال الدستور'}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300">
                    صعوبة: {todayMission.difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  <Shield className="w-4 h-4 fill-amber-500" />
                  <span>+{todayMission.points} نقطة درع</span>
                </div>
              </div>

              {/* Mission Title & Scenario */}
              <div className="space-y-3">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-calligraphy">
                  {todayMission.title}
                </h3>
                {todayMission.scenarioContext && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm leading-relaxed">
                    <p className="font-medium">{todayMission.scenarioContext}</p>
                  </div>
                )}
                <p className="text-sm sm:text-base font-bold text-emerald-950 pt-1 leading-relaxed">
                  {todayMission.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {todayMission.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isAnswered = hasAnsweredToday || answerResult !== null;
                  const isCorrectOption = idx === todayMission.correctIndex;

                  let optionStyle =
                    'border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/50 text-slate-800';

                  if (isAnswered) {
                    if (isCorrectOption) {
                      optionStyle =
                        'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-400/40';
                    } else if (isSelected && !isCorrectOption) {
                      optionStyle = 'border-red-400 bg-red-50 text-red-900 opacity-80';
                    } else {
                      optionStyle = 'border-slate-200 bg-slate-50 text-slate-500 opacity-60';
                    }
                  } else if (isSelected) {
                    optionStyle =
                      'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-bold ring-2 ring-emerald-500/30';
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswered || isSubmitting}
                      onClick={() => setSelectedOption(idx)}
                      className={`w-full text-right p-4 rounded-2xl border-2 transition-all flex items-start gap-3.5 cursor-pointer disabled:cursor-default ${optionStyle}`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 ${
                          isSelected
                            ? 'bg-emerald-700 text-white'
                            : 'bg-slate-100 text-slate-600 border border-slate-300'
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className="text-xs sm:text-sm leading-relaxed">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Action Button & Instant Feedback */}
              {!hasAnsweredToday && !answerResult ? (
                <div className="pt-2">
                  <button
                    disabled={selectedOption === null || isSubmitting}
                    onClick={handleAnswerSubmit}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-950 hover:from-emerald-700 hover:to-emerald-900 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-amber-400/30"
                  >
                    <CheckCircle2 className="w-5 h-5 text-amber-400" />
                    <span>
                      {isSubmitting ? 'جاري التحقق ورصد النقاط...' : 'تأكيد الإجابة ورصد النقاط'}
                    </span>
                  </button>
                </div>
              ) : (
                /* Instant Feedback Box */
                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-amber-50 border-2 border-emerald-400/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span className="font-black text-sm text-emerald-900">
                        {answerResult?.isCorrect
                          ? 'إجابة وطنية نموذجية ومكتملة! ✓'
                          : 'تم إنجاز المهمة وحساب النقاط! ✓'}
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                      +{answerResult?.pointsEarned || todayMission.points} نقطة درع
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                    {todayMission.explanation}
                  </p>

                  {/* Badges Won notification */}
                  {answerResult?.newBadges && answerResult.newBadges.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
                      <div className="text-xs">
                        <span className="font-bold text-amber-900 block">
                          مبارك! حصلتِ على وسام جديد:
                        </span>
                        <span className="font-extrabold text-emerald-900">
                          {answerResult.newBadges.map((b) => b.badgeTitle).join(' · ')}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between text-xs text-slate-600 border-t border-emerald-200">
                    <span>موعد المهمة القادمة: غداً في تمام الساعة 12:00 صباحاً</span>
                    <button
                      onClick={() => setActiveTab('journey')}
                      className="font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                    >
                      <span>تفقد موقعكِ في رحلة الحماة ←</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Weekly Mission Box Teaser & Badges Quick Strip */}
          <div className="space-y-6">
            {/* Surprise Box Teaser Card */}
            <div className="bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 rounded-3xl p-6 text-emerald-950 shadow-lg border border-amber-300 relative overflow-hidden">
              <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-white/20 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-center gap-2 text-xs font-bold bg-white/30 backdrop-blur-xs px-3 py-1 rounded-full w-fit mb-3">
                <Gift className="w-3.5 h-3.5" />
                <span>صندوق مفاجآت الأسبوع</span>
              </div>

              <h4 className="text-xl font-black mb-1 font-calligraphy">
                صندوق مفاجآت الدرع الذهبي
              </h4>
              <p className="text-xs text-emerald-950/90 leading-relaxed font-medium mb-4">
                أكملي 3 مهمات خلال هذا الأسبوع لفتح الصندوق ونيل 50 نقطة درع إضافية وشهادة المعلمات!
              </p>

              {/* Weekly Missions Tracker */}
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>المهمات المنجزة هذا الأسبوع:</span>
                  <span>{progress.weeklyMissionsCount} / 3</span>
                </div>
                <div className="w-full bg-white/30 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-950 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (progress.weeklyMissionsCount / 3) * 100)}%`
                    }}
                  />
                </div>
              </div>

              <button
                disabled={progress.weeklyMissionsCount < 3 || progress.weeklyBoxClaimed}
                onClick={handleClaimWeeklyBox}
                className="w-full py-2.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-amber-300 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {progress.weeklyBoxClaimed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>تم فتح الصندوق لهذا الأسبوع ✓</span>
                  </>
                ) : progress.weeklyMissionsCount >= 3 ? (
                  <>
                    <Unlock className="w-4 h-4 text-amber-400" />
                    <span>افتحي الصندوق واستلمي الجائزة! ✨</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>متبقي {Math.max(0, 3 - progress.weeklyMissionsCount)} مهمات للفتح</span>
                  </>
                )}
              </button>
            </div>

            {/* Badges Quick Showcase */}
            <div className="bg-white rounded-3xl p-6 shadow-md border border-emerald-900/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-xs text-slate-800">أوسمة درع الوطن</span>
                </div>
                <span className="text-[11px] text-emerald-700 font-bold">4 أوسمة معتمدة</span>
              </div>

              <div className="space-y-2.5">
                {OFFICIAL_BADGES_DEFINITIONS.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3"
                  >
                    <div
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${b.gradient} text-white flex items-center justify-center shrink-0 shadow-xs`}
                    >
                      <Star className="w-4 h-4 fill-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-slate-900 block truncate">
                        {b.title}
                      </span>
                      <span className="text-[10px] text-slate-500 line-clamp-1">
                        {b.description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Journey Map «رحلة حماة الوطن» */}
      {activeTab === 'journey' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-md border border-emerald-900/10 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <Compass className="w-3.5 h-3.5" />
              <span>خريطة التميز والولاء الوطني</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-950 font-calligraphy">
              رِحْلَةُ حُمَاةِ الوَطَن
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              ارتقي عبر 6 محطات وطنية مباركة، افتحي الأوسمة الدستورية، واصلي إلى قمة المجد بدرع الوطن.
            </p>
          </div>

          {/* Interactive Visual Map Step Path */}
          <div className="relative py-8">
            {/* Connecting Track Line */}
            <div className="absolute top-1/2 left-4 right-4 h-2 bg-slate-200 -translate-y-1/2 hidden md:block rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-amber-500 rounded-full transition-all duration-700"
                style={{
                  width: `${((progress.unlockedStations - 1) / (SHIELD_JOURNEY_STATIONS.length - 1)) * 100}%`
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-6 relative z-10">
              {SHIELD_JOURNEY_STATIONS.map((station) => {
                const isUnlocked = progress.totalPoints >= station.requiredPoints;
                const isCurrent = progress.unlockedStations === station.id;

                return (
                  <div
                    key={station.id}
                    className={`relative p-5 rounded-2xl border-2 transition-all flex flex-col items-center text-center space-y-3 ${
                      isCurrent
                        ? 'bg-emerald-900 text-white border-amber-400 shadow-xl scale-105 ring-4 ring-amber-400/20'
                        : isUnlocked
                        ? 'bg-emerald-50/80 text-emerald-950 border-emerald-400 shadow-sm'
                        : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60'
                    }`}
                  >
                    {/* Station Number Indicator */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-sm shadow-md ${
                        isCurrent
                          ? 'bg-amber-400 text-emerald-950 animate-bounce'
                          : isUnlocked
                          ? 'bg-emerald-700 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {station.id}
                    </div>

                    <div className="space-y-1">
                      <span
                        className={`text-xs font-black block ${
                          isCurrent ? 'text-amber-300' : isUnlocked ? 'text-emerald-900' : 'text-slate-600'
                        }`}
                      >
                        {station.title}
                      </span>
                      <span className="text-[11px] font-bold block line-clamp-1">
                        {station.subtitle}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200/50 w-full text-[10px]">
                      {isUnlocked ? (
                        <span className="text-emerald-600 font-extrabold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>مفتوحة ✓</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 font-bold flex items-center justify-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span>{station.requiredPoints} نقطة</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Progress Summary Banner */}
          <div className="p-6 rounded-2xl bg-radial from-emerald-900 to-emerald-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 border border-amber-400/30">
            <div>
              <span className="text-xs text-amber-300 font-bold block mb-1">
                موقعكِ الحالي في الرحلة:
              </span>
              <h4 className="text-xl font-black text-white">
                المحطة {progress.unlockedStations}: {SHIELD_JOURNEY_STATIONS[progress.unlockedStations - 1]?.title}
              </h4>
              <p className="text-xs text-emerald-200 mt-0.5">
                {SHIELD_JOURNEY_STATIONS[progress.unlockedStations - 1]?.description}
              </p>
            </div>

            <button
              onClick={() => setIsAchievementModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة بطاقة الإنجاز</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: Weekly Surprise Box */}
      {activeTab === 'box' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-md border border-emerald-900/10 space-y-8">
          <div className="max-w-xl mx-auto text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
              <Gift className="w-3.5 h-3.5" />
              <span>مكافأة الاستمرارية والمثابرة الأسبوعية</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-950 font-calligraphy">
              صُندُوقُ مُفَاجَآتِ الأُسبُوع
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              عند إتمامكِ 3 مهمات وطنية خلال الأسبوع، يُفتح لكِ هذا الصندوق الملكي ليمنحكِ 50 نقطة درع إضافية ورسالة فخر معتمدة من المعلمتين أمل رشيد ووفاء الزهراني.
            </p>
          </div>

          {/* Treasure Box Visual Presentation */}
          <div className="max-w-md mx-auto p-8 rounded-3xl bg-radial from-amber-400/20 via-emerald-900/10 to-transparent border-2 border-dashed border-amber-400 flex flex-col items-center text-center space-y-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-1 shadow-2xl flex items-center justify-center">
                <div className="w-full h-full rounded-2xl bg-emerald-950 flex items-center justify-center text-amber-400">
                  <Gift className="w-14 h-14" />
                </div>
              </div>
              {progress.canClaimWeeklyBox && (
                <div className="absolute -top-2 -right-2 px-2.5 py-0.5 rounded-full bg-red-600 text-white font-black text-[10px] animate-pulse">
                  جاهز للفتح!
                </div>
              )}
            </div>

            <div className="space-y-2 w-full">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>المهمات المكتملة هذا الأسبوع:</span>
                <span className="text-emerald-800 font-extrabold">{progress.weeklyMissionsCount} / 3</span>
              </div>
              <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-600 to-amber-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (progress.weeklyMissionsCount / 3) * 100)}%`
                  }}
                />
              </div>
            </div>

            <button
              disabled={progress.weeklyMissionsCount < 3 || progress.weeklyBoxClaimed}
              onClick={handleClaimWeeklyBox}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-950 hover:from-emerald-700 hover:to-emerald-900 text-amber-300 font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-amber-400/40"
            >
              {progress.weeklyBoxClaimed ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>تم استلام صندوق الأسبوع بنجاح ✓</span>
                </>
              ) : progress.weeklyMissionsCount >= 3 ? (
                <>
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>افتحي الصندوق الآن ونالي 50 نقطة ✨</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>أكملي {3 - progress.weeklyMissionsCount} مهمات لفتح الصندوق</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: Class Collaborative Challenges */}
      {activeTab === 'classes' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-md border border-emerald-900/10 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <Users className="w-3.5 h-3.5" />
              <span>تحدي التكاتف والتعاون المدرسي</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-950 font-calligraphy">
              دِرْعُ الفُصُولِ التَّعَاوُنِي
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              تحدٍ تعاوني جماعي يشجع كل طالبة على المساهمة بنقاطها في رفع درع فصلها، دون إقصاء أو مقارنة سلبية، تكريساً لروح التضامن والعمل كفريق واحد.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {classesProgress.map((cp) => (
              <div
                key={cp.grade}
                className="p-6 rounded-2xl bg-slate-50 border-2 border-emerald-900/10 hover:border-amber-400/50 transition-all space-y-4 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-900">{cp.grade}</span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                    درع {cp.tier}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                    <span>نسبة إنجاز درع الفصل:</span>
                    <span className="font-bold text-emerald-800">{cp.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-700 h-full rounded-full transition-all duration-500"
                      style={{ width: `${cp.percentage}%` }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">المهمات المنجزة:</span>
                    <span className="font-bold text-slate-900">{cp.completedMissions} مهمة</span>
                  </div>
                  <div className="text-left">
                    <span className="text-slate-500 block text-[10px]">مجموع نقاط الفصل:</span>
                    <span className="font-bold text-amber-600">{cp.totalPoints} نقطة</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center text-xs text-emerald-900 font-medium">
            💡 كل مهمة يومية تنجزينها ترفع نسبة إنجاز فصلكِ مباشرة وتساهم في إحراز وسام «صانعة الأثر».
          </div>
        </div>
      )}

      {/* Achievement Card Modal */}
      <DigitalAchievementCardModal
        isOpen={isAchievementModalOpen}
        onClose={() => setIsAchievementModalOpen(false)}
        studentName={studentName}
        grade={grade}
        progress={progress}
      />

      {/* Weekly Box Congratulations Modal */}
      {isBoxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl border-2 border-amber-400">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <Gift className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-slate-900 font-calligraphy">
              مُبَارَكٌ فَتْحُ صُندُوقِ الأُسبُوع!
            </h3>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {boxClaimMessage}
            </p>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800">
              +50 نقطة درع إضافية أُضيفت إلى رصيدكِ!
            </div>

            <button
              onClick={() => setIsBoxModalOpen(false)}
              className="w-full py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              استمرار والاطلاع على رصيد الإنجاز
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
