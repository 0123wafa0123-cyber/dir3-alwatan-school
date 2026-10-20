import React from 'react';
import { Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-10 px-4 sm:px-8 no-print">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3 text-right">
            <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-amber-400/40 text-amber-400 flex items-center justify-center">
              <Shield className="w-5 h-5 fill-amber-400/20" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">منصة «دِرْعُ الوَطَن» التفاعلية المدرسية</div>
              <div className="text-emerald-400 text-xs">الثانوية الأولى بالبدع · المملكة العربية السعودية</div>
            </div>
          </div>

          <div className="text-center md:text-left text-xs space-y-1">
            <div className="text-amber-300 font-bold">
              إعداد وتنفيذ المعلمتين: أمل رشيد + وفاء الزهراني
            </div>
            <div className="text-slate-400 text-[11px]">
              التوعية بالمادة (34) من النظام الأساسي للحكم
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>
            «الدفاع عن العقيدة الإسلامية، والمجتمع، والوطن واجب على كل مواطن، ويبين النظام أحكام الخدمة العسكرية.»
          </p>
          <p>
            جميع الحقوق محفوظة للمبادرة المدرسية © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
};
