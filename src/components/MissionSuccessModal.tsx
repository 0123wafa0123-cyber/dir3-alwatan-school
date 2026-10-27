import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  Shield,
  Star,
  Sparkles,
  CheckCircle2,
  X,
  Share2,
  Printer,
  ChevronLeft,
  Compass,
  Trophy,
  Heart
} from 'lucide-react';
import { StudentBadge } from '../types';

interface MissionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  grade: string;
  missionTitle: string;
  pointsEarned: number;
  isCorrect: boolean;
  newBadges?: StudentBadge[];
  onOpenAchievementCard?: () => void;
  onOpenCertificateHub?: (name: string, grade: string) => void;
}

export const MissionSuccessModal: React.FC<MissionSuccessModalProps> = ({
  isOpen,
  onClose,
  studentName,
  grade,
  missionTitle,
  pointsEarned,
  isCorrect,
  newBadges,
  onOpenAchievementCard,
  onOpenCertificateHub
}) => {
  // Fire colorful Saudi Emerald & Royal Gold Confetti when modal opens
  useEffect(() => {
    if (!isOpen) return;

    // First center burst
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#047857', '#d97706', '#10b981', '#f59e0b', '#ffffff', '#fbbf24']
    });

    // Secondary celebratory bursts from left and right
    const timeout1 = setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0.1, y: 0.7 },
        colors: ['#059669', '#f59e0b', '#34d399']
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 0.9, y: 0.7 },
        colors: ['#047857', '#d97706', '#fbbf24']
      });
    }, 250);

    // Final sparkle shower
    const timeout2 = setTimeout(() => {
      confetti({
        particleCount: 40,
        spread: 100,
        origin: { y: 0.4 },
        colors: ['#f59e0b', '#10b981', '#ffffff']
      });
    }, 600);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const hasNewBadge = newBadges && newBadges.length > 0;
  const primaryBadge = hasNewBadge ? newBadges[0] : null;

  // Choose appropriate icon for badge
  const renderBadgeIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Compass':
        return <Compass className="w-8 h-8 text-amber-300" />;
      case 'Shield':
        return <Shield className="w-8 h-8 text-amber-300 fill-amber-300/20" />;
      case 'Star':
        return <Star className="w-8 h-8 text-amber-300 fill-amber-300/30" />;
      case 'Award':
      default:
        return <Award className="w-8 h-8 text-amber-300" />;
    }
  };

  const handleShareWhatsApp = () => {
    const badgeText = primaryBadge ? `وحصلت على شارة «${primaryBadge.badgeTitle}» 🎖️` : '';
    const text = `🇸🇦 بفضل الله أنجزت الطالبة (${studentName}) المقيدة بالصف (${grade}) مهمة درع الوطن اليومية بنجاح وحصدت (+${pointsEarned}) نقطة درع! ${badgeText}\nالثانوية الأولى بالبدع · مبادرة درع الوطن والتوعية بالمادة 34 من النظام الأساسي للحكم.`;
    const a = document.createElement('a');
    a.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-radial from-emerald-950 via-slate-950 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-400/70 text-center space-y-6 overflow-hidden my-6">
        {/* Subtle decorative background circles */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer z-20"
          aria-label="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Celebration Trophy Header */}
        <div className="relative flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 via-amber-300 to-yellow-500 p-1 shadow-2xl shadow-amber-500/30 flex items-center justify-center animate-bounce">
            <div className="w-full h-full rounded-full bg-emerald-950 flex items-center justify-center border-2 border-amber-300">
              <Trophy className="w-10 h-10 text-amber-400" />
            </div>
          </div>
          <span className="mt-3 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold tracking-wide">
            ✦ إنجاز وطني معتمد ✦
          </span>
        </div>

        {/* Congratulatory Title & Student Name */}
        <div className="space-y-1.5 relative z-10">
          <h3 className="text-2xl sm:text-3xl font-black text-white font-calligraphy">
            مُبَارَكٌ إِكْمَالُ مَهَمَّةِ دِرْعِ الوَطَن!
          </h3>
          <p className="text-xs sm:text-sm text-emerald-200 font-medium">
            أحسنتِ يا <strong className="text-amber-300 font-bold">{studentName}</strong> ({grade})
          </p>
          <p className="text-[11px] text-emerald-300/80">
            الثانوية الأولى بالبدع · مبادرة التوعية بالمادة 34 من النظام الأساسي للحكم
          </p>
        </div>

        {/* Points Earned Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-emerald-500/20 border-2 border-amber-400/50 shadow-inner space-y-1">
          <div className="flex items-center justify-center gap-2 text-amber-300 font-bold text-xs">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>النقاط المكتسبة في رصيدكِ ورصيد فصلكِ:</span>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 font-mono">
            +{pointsEarned} نقطة درع
          </div>
          <p className="text-[11px] text-emerald-200/90 font-medium">
            {isCorrect ? 'إجابة وطنية صحيحة ومتميزة ✓' : 'مشاركة وطنية فعالة وجهد مقدر ✓'}
          </p>
        </div>

        {/* New Badge Unlocked Showcase (اسم الشارة الجديدة) */}
        {hasNewBadge && primaryBadge ? (
          <div className="p-5 rounded-2xl bg-radial from-amber-400/20 via-emerald-950 to-slate-950 border-2 border-amber-400 shadow-xl space-y-3 relative overflow-hidden">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400 text-emerald-950 font-black text-[10px]">
              <Award className="w-3.5 h-3.5" />
              <span>شارة وأوسمة درع الوطن الجديدة</span>
            </div>

            <div className="flex items-center justify-center gap-3 pt-1">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-300 to-amber-500 p-0.5 shadow-md flex items-center justify-center shrink-0">
                <div className="w-full h-full rounded-2xl bg-emerald-950 flex items-center justify-center">
                  {renderBadgeIcon(primaryBadge.iconName)}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-amber-300/80 font-bold block">
                  تم منحكِ رسمياً وسام:
                </span>
                <h4 className="text-lg font-black text-white font-calligraphy">
                  «{primaryBadge.badgeTitle}»
                </h4>
                <p className="text-[11px] text-emerald-200 leading-relaxed mt-0.5">
                  {primaryBadge.reason}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 text-[10px] text-slate-300 flex items-center justify-between">
              <span>ختم الاعتماد: درع الوطن</span>
              <span className="font-mono text-amber-400">سجل الشارات الرسمي ✓</span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-emerald-100 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              تم تسجيل إنجازكِ بنجاح في قاعدة البيانات وتحديث نسبة إنجاز فصلكِ وموقعكِ في رحلة الحماة!
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {onOpenAchievementCard && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAchievementCard();
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-200"
            >
              <Award className="w-4 h-4" />
              <span>استعراض بطاقة إنجاز حامية الوطن 🎖️</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-600/50"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>مشاركة الإنجاز</span>
            </button>

            {onOpenCertificateHub && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCertificateHub(studentName, grade);
                }}
                className="py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-white/10"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>إصدار الشهادة</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-transparent hover:bg-white/10 text-slate-300 hover:text-white font-medium text-xs transition-colors cursor-pointer"
          >
            إغلاق ومتابعة التحديات
          </button>
        </div>
      </div>
    </div>
  );
};
