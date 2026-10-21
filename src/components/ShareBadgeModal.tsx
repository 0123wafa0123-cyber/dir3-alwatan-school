import React, { useState, useRef } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Download,
  Shield,
  Award,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Send,
  Printer
} from 'lucide-react';
import { StudentBadge } from '../types';

interface ShareBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge: StudentBadge | null;
  studentName: string;
  grade: string;
  allBadgesCount?: number;
}

export const ShareBadgeModal: React.FC<ShareBadgeModalProps> = ({
  isOpen,
  onClose,
  badge,
  studentName,
  grade,
  allBadgesCount = 1
}) => {
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !badge) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://alwatan-school.netlify.app';
  const effectiveName = (badge.studentName || studentName || 'طالبة متميزة').trim();
  const effectiveGrade = badge.grade || grade || 'الثانوية الأولى بالبدع';

  // Social message copy
  const shareText = `🇸🇦 بفضل الله واعتزازاً بوطني، تشرفتُ بالحصول على "${badge.badgeTitle}" في مبادرة «دِرْعُ الوَطَن» للتوعية بالمادة (34) من النظام الأساسي للحكم! 🛡️✨\n\n` +
    `👤 الطالبة: ${effectiveName} (${effectiveGrade})\n` +
    `🏫 الثانوية الأولى بالبدع\n` +
    `👩‍🏫 إشراف المعلمتين الفاضلتين: أمل رشيد + وفاء الزهراني\n\n` +
    `«الدفاع عن العقيدة، والمجتمع، والوطن واجب على كل مواطن» 🇸🇦\n` +
    `شاركونا واطلعوا على المبادرة عبر الرابط:`;

  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(currentUrl);

  // Social links
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `فخورة بحصولي على "${badge.badgeTitle}" في مبادرة #درع_الوطن 🇸🇦 دفاعاً عن العقيدة والوطن استلهاماً للمادة 34 بالثانوية الأولى بالبدع.\nإشراف المعلمتين: أمل رشيد و وفاء الزهراني\n`
  )}&url=${encodedUrl}&hashtags=${encodeURIComponent('درع_الوطن,المادة_34,تعليم_البدع,وزارة_التعليم')}`;
  const telegramUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;

  // Native share handler
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `وسام ${badge.badgeTitle} - مبادرة درع الوطن`,
          text: shareText,
          url: currentUrl
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      handleCopy();
    }
  };

  // Copy handler
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${currentUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // fallback
      const textArea = document.createElement('textarea');
      textArea.value = `${shareText}\n${currentUrl}`;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // Download PDF/Image card
  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: 8,
        filename: `وسام_درع_الوطن_${badge.badgeTitle.replace(/\s+/g, '_')}_${effectiveName.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm' as const, format: 'a5' as const, orientation: 'landscape' as const }
      };
      await html2pdf().set(opt).from(cardRef.current).save();
    } catch (err) {
      console.error('PDF export error:', err);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-amber-400/40 overflow-hidden flex flex-col max-h-[90vh]"
        dir="rtl"
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 via-emerald-950 to-slate-950 text-white flex items-center justify-between border-b border-amber-400/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>مشاركة وسام الإنجاز والولاء الوطني</span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </h2>
              <p className="text-[11px] text-emerald-200/90">
                شاركي فخركِ بتمثيل درع الوطن عبر المنصات الرقمية ووسائل التواصل
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Visual Badge Card (Exportable Target) */}
          <div
            ref={cardRef}
            className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 text-white border-2 border-amber-400/70 shadow-xl overflow-hidden"
          >
            {/* Background arabesque ornament */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            {/* Corner Accents */}
            <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-amber-400/70 pointer-events-none" />
            <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-amber-400/70 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-amber-400/70 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-amber-400/70 pointer-events-none" />

            {/* Card Content */}
            <div className="relative text-center space-y-4">
              {/* Trust Badge Header */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/40 text-[11px] text-amber-300 font-bold">
                <Shield className="w-3.5 h-3.5" />
                <span>الثانوية الأولى بالبدع · مبادرة درع الوطن</span>
              </div>

              {/* Glowing Medal Icon */}
              <div className="flex justify-center pt-1">
                <div className="relative">
                  <div className="absolute -inset-2 bg-amber-400/40 rounded-full blur-md animate-pulse" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 via-amber-300 to-yellow-200 text-emerald-950 border-2 border-amber-200 flex items-center justify-center shadow-2xl">
                    <Award className="w-10 h-10 fill-emerald-950/20" />
                  </div>
                </div>
              </div>

              {/* Badge Title */}
              <div className="space-y-1">
                <div className="text-[10px] tracking-widest text-amber-300 font-bold uppercase">
                  وسام فخر واعتزاز وطني
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 font-calligraphy">
                  {badge.badgeTitle}
                </h3>
              </div>

              {/* Student Recipient Info */}
              <div className="py-2.5 px-4 rounded-xl bg-white/10 backdrop-blur-xs border border-amber-400/30 max-w-md mx-auto">
                <p className="text-xs text-emerald-200">مُنح هذا الوسام بفخر واعتزاز للطالبة:</p>
                <p className="text-lg sm:text-xl font-bold text-white mt-0.5">{effectiveName}</p>
                <p className="text-[11px] text-amber-300/90 font-medium">
                  {effectiveGrade} · الثانوية الأولى بالبدع
                </p>
              </div>

              {/* Reason / Citation */}
              <p className="text-xs text-emerald-100/90 max-w-lg mx-auto leading-relaxed">
                {badge.reason || 'تقديراً لمشاركتها الفاعلة والتزامها بالواجب الدستوري والوطني المستلهم من المادة 34.'}
              </p>

              {/* Constitutional Quote Quote Strip */}
              <div className="text-[11px] text-amber-200/90 bg-emerald-900/60 py-1.5 px-3 rounded-lg border border-emerald-700/50 max-w-md mx-auto font-medium">
                « الدِّفَاعُ عَنِ العَقِيدَةِ وَالمُجْتَمَعِ وَالوَطَنِ وَاجِبٌ عَلَى كُلِّ مُوَاطِنٍ »
              </div>

              {/* Footnote / Supervision */}
              <div className="pt-3 border-t border-emerald-800/80 flex items-center justify-between text-[10px] text-emerald-300/80">
                <span>إشراف المعلمتين: أمل رشيد + وفاء الزهراني</span>
                <span>{new Date(badge.awardedAt || Date.now()).toLocaleDateString('ar-SA')}</span>
              </div>
            </div>
          </div>

          {/* Social Platforms Sharing Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>انشري إنجازكِ مباشرة عبر منصات التواصل:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* WhatsApp Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white/20" />
                <span>مشاركة عبر واتساب</span>
              </a>

              {/* X / Twitter Button */}
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer border border-slate-700"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>مشاركة عبر منصة X</span>
              </a>

              {/* Telegram Button */}
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>مشاركة عبر تيليجرام</span>
              </a>
            </div>

            {/* Additional Actions Strip */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* Native Mobile Share Button (if supported) */}
              {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-emerald-950 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>مشاركة عبر تطبيقات الهاتف (سناب، إنستقرام، وغيرها)</span>
                </button>
              )}

              {/* Copy Message & Link */}
              <button
                type="button"
                onClick={handleCopy}
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  copied
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'تم نسخ نص الإنجاز بنجاح ✓' : 'نسخ نص الإنجاز ورابط المبادرة'}</span>
              </button>

              {/* Download Card as PDF */}
              <button
                type="button"
                onClick={handleDownloadCard}
                disabled={isExporting}
                className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>{isExporting ? 'جاري تجهيز البطاقة...' : 'تحميل بطاقة الوسام (PDF)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span className="text-[11px]">
            مبادرة «دِرْعُ الوَطَن» · الثانوية الأولى بالبدع · المملكة العربية السعودية
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-medium cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
