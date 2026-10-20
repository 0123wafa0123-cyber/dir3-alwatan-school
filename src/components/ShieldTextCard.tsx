import React, { useRef } from 'react';
import { Shield, Sparkles, Award, Star, Download, Printer } from 'lucide-react';
import { getShieldTemplate } from '../constants/templates';

interface ShieldTextCardProps {
  templateId?: string;
  title: string;
  content: string;
  studentName?: string;
  grade?: string;
  date?: string;
  submissionId?: string;
  showActions?: boolean;
}

export const ShieldTextCard: React.FC<ShieldTextCardProps> = ({
  templateId = 'emerald-shield',
  title,
  content,
  studentName = 'طالبة درع الوطن',
  grade = 'المرحلة الثانوية',
  date,
  submissionId,
  showActions = false
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const template = getShieldTemplate(templateId);

  const displayDate = date
    ? new Date(date).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : new Date().toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: 10,
        filename: `بطاقة_درع_الوطن_${(studentName || 'مشاركة').replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      };
      html2pdf().from(cardRef.current).set(opt).save();
    } catch (err) {
      console.error('Download card error:', err);
      window.print();
    }
  };

  return (
    <div className="space-y-3">
      {/* Ornate Shield Card Container */}
      <div
        ref={cardRef}
        className={`relative overflow-hidden rounded-3xl p-6 sm:p-10 transition-all duration-300 text-right ${template.cardBgClass} ${template.borderClass}`}
        dir="rtl"
      >
        {/* Decorative Arabesque Corner Accents */}
        <div className="absolute top-2 right-2 w-8 h-8 pointer-events-none opacity-40">
          <svg viewBox="0 0 40 40" className="w-full h-full fill-current text-amber-400">
            <path d="M0,0 L40,0 C30,10 10,30 0,40 Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        <div className="absolute top-2 left-2 w-8 h-8 pointer-events-none opacity-40 rotate-90">
          <svg viewBox="0 0 40 40" className="w-full h-full fill-current text-amber-400">
            <path d="M0,0 L40,0 C30,10 10,30 0,40 Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        <div className="absolute bottom-2 right-2 w-8 h-8 pointer-events-none opacity-40 -rotate-90">
          <svg viewBox="0 0 40 40" className="w-full h-full fill-current text-amber-400">
            <path d="M0,0 L40,0 C30,10 10,30 0,40 Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        <div className="absolute bottom-2 left-2 w-8 h-8 pointer-events-none opacity-40 rotate-180">
          <svg viewBox="0 0 40 40" className="w-full h-full fill-current text-amber-400">
            <path d="M0,0 L40,0 C30,10 10,30 0,40 Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>

        {/* Subtle Background Watermark Shield & Palm */}
        <div className="absolute -left-10 -bottom-10 opacity-10 pointer-events-none">
          <Shield className="w-64 h-64 text-amber-400" />
        </div>
        <div className="absolute -right-10 top-1/4 opacity-5 pointer-events-none">
          <Sparkles className="w-48 h-48 text-emerald-300" />
        </div>

        {/* Inner Card Framing */}
        <div className="relative z-10 space-y-6">
          {/* Header Strip with Initiative Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-amber-400/20">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center shadow-inner">
                <Shield className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <span className="block text-[11px] font-bold text-amber-400 tracking-wider">
                  مُبَادَرَةُ «دِرْعُ الوَطَن»
                </span>
                <span className="block text-[10px] opacity-75">
                  الثانوية الأولى بالبدع · تعزيز المادة (34)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full border ${template.badgeClass} flex items-center gap-1 shadow-xs`}>
                <Award className="w-3.5 h-3.5" />
                <span>{template.badgeText}</span>
              </span>
              {submissionId && (
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-black/20 opacity-75">
                  {submissionId}
                </span>
              )}
            </div>
          </div>

          {/* Title Area with Decorative Accents */}
          <div className="text-center space-y-2 py-1">
            <div className="inline-flex items-center justify-center gap-2 opacity-60 text-amber-400">
              <span className="h-px w-8 bg-amber-400/50" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="h-px w-8 bg-amber-400/50" />
            </div>

            <h3 className={`text-xl sm:text-2xl font-black ${template.titleColorClass} tracking-wide font-calligraphy`}>
              {title || 'رسالة ولاء واعتزاز لدِرعِ الوَطَن'}
            </h3>

            <p className="text-[11px] opacity-75 font-medium">
              «الدفاع عن العقيدة الإسلامية والمجتمع والوطن واجب على كل مواطن»
            </p>
          </div>

          {/* Main Content Box with Traditional Calligraphic Border */}
          <div className="relative p-5 sm:p-7 rounded-2xl bg-black/10 backdrop-blur-xs border border-white/10 shadow-inner">
            <div className="text-amber-400/30 text-3xl font-serif leading-none absolute top-2 right-3 select-none">
              “
            </div>
            <p className={`text-sm sm:text-base whitespace-pre-wrap leading-relaxed ${template.textColorClass} font-medium pr-3`}>
              {content || 'سطري كلماتك الصادقة حول حبكِ لوطنكِ العظيم ودوركِ كدرع حامٍ لعقيدته ومجتمعه...'}
            </p>
            <div className="text-amber-400/30 text-3xl font-serif leading-none absolute bottom-1 left-3 select-none">
              ”
            </div>
          </div>

          {/* Card Footer: Student Credentials & School Signature */}
          <div className={`pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs ${template.footerColorClass}`}>
            {/* Student Info */}
            <div className="space-y-1 text-center sm:text-right">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="opacity-75">إعداد وبوح الطالبة:</span>
                <span className="font-bold text-sm text-amber-300">
                  {studentName || 'طالبة درع الوطن'}
                </span>
              </div>
              <div className="text-[11px] opacity-80">
                الفصل الدراسي: <span className="font-semibold">{grade}</span> · التاريخ: <span>{displayDate}</span>
              </div>
            </div>

            {/* School & Teachers Stamp Seal */}
            <div className="flex items-center gap-3 p-2 px-3 rounded-xl bg-white/5 border border-white/10 text-[11px] shadow-xs">
              <div className="w-7 h-7 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-right leading-tight">
                <div className="font-bold opacity-90">إشراف المعلمتين:</div>
                <div className="text-amber-300 font-semibold">أمل رشيد + وفاء الزهراني</div>
                <div className="text-[9px] opacity-70">الثانوية الأولى بالبدع</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons (Download / Print) */}
      {showActions && (
        <div className="flex items-center justify-end gap-2 pt-1 no-print">
          <button
            type="button"
            onClick={handleDownloadCard}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>تحميل بطاقة درع الوطن (PDF)</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>طباعة</span>
          </button>
        </div>
      )}
    </div>
  );
};
