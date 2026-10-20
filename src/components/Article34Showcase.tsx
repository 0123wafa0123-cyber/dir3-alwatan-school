import React, { useState } from 'react';
import { Shield, BookOpen, CheckCircle, ArrowRight, Award, Compass, Heart, Users } from 'lucide-react';

interface Article34ShowcaseProps {
  onGoToParticipate: () => void;
}

export const Article34Showcase: React.FC<Article34ShowcaseProps> = ({ onGoToParticipate }) => {
  const [activeTab, setActiveTab] = useState<'creed' | 'society' | 'homeland' | 'service'>('creed');

  return (
    <div className="space-y-10 pb-16 max-w-5xl mx-auto">
      {/* Header section */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-100/70 px-3.5 py-1 rounded-full border border-emerald-300">
          <Shield className="w-3.5 h-3.5 text-emerald-700" />
          <span>النظام الأساسي للحكم بالمملكة العربية السعودية · الباب الخامس</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          المادة (34) من النظام الأساسي للحكم
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
          المرجعية الدستورية العليا لمفهوم درع الوطن والواجب الشرعي والوطني لكل مواطن ومواطنة.
        </p>
      </div>

      {/* Royal Parchment Official Text Display */}
      <div className="relative rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 text-white p-8 sm:p-12 shadow-xl border-2 border-amber-400/50 overflow-hidden text-center">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-2 text-xs text-amber-300 font-bold bg-amber-950/60 border border-amber-400/30 px-4 py-1.5 rounded-full">
            <span>النص الرسمي المعتمد من هيئة الخبراء بمجلس الوزراء</span>
          </div>

          <blockquote className="text-xl sm:text-3xl lg:text-4xl font-calligraphy text-amber-200 font-bold leading-relaxed px-4 py-3">
            « الدِّفَاعُ عَنِ العَقِيدَةِ الإِسْلَامِيَّةِ، وَالمُجْتَمَعِ، وَالوَطَنِ وَاجِبٌ عَلَى كُلِّ مُوَاطِنٍ، وَيُبَيِّنُ النِّظَامُ أَحْكَامَ الخِدْمَةِ العَسْكَرِيَّةِ. »
          </blockquote>

          <div className="pt-4 border-t border-emerald-800/60 max-w-xl mx-auto flex flex-wrap items-center justify-between text-xs text-emerald-200/90 gap-2">
            <span>المملكة العربية السعودية</span>
            <span>الثانوية الأولى بالبدع</span>
            <span>إعداد المعلمتين: أمل رشيد + وفاء الزهراني</span>
          </div>
        </div>
      </div>

      {/* Interactive Tabs for the 4 Constitutional Dimensions */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900">
            الأركان الأربعة الكبرى للمادة 34
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            اضغطي على كل ركن لاستكشاف معناه ودور طالبات الثانوية الأولى بالبدع في تحقيقه
          </p>
        </div>

        {/* Segmented Controls */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab('creed')}
            className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'creed'
                ? 'bg-emerald-800 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-200/70'
            }`}
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>1. الدفاع عن العقيدة</span>
          </button>

          <button
            onClick={() => setActiveTab('society')}
            className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'society'
                ? 'bg-emerald-800 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-200/70'
            }`}
          >
            <Users className="w-4 h-4 text-amber-400" />
            <span>2. الدفاع عن المجتمع</span>
          </button>

          <button
            onClick={() => setActiveTab('homeland')}
            className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'homeland'
                ? 'bg-emerald-800 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-200/70'
            }`}
          >
            <Shield className="w-4 h-4 text-amber-400" />
            <span>3. الدفاع عن الوطن</span>
          </button>

          <button
            onClick={() => setActiveTab('service')}
            className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'service'
                ? 'bg-emerald-800 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-200/70'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>4. أحكام الخدمة والجاهزية</span>
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
          {activeTab === 'creed' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                  01
                </div>
                <div>
                  <h3 className="text-xl font-bold text-emerald-950">
                    الدفاع عن العقيدة الإسلامية: الحصانة الفكرية والنهج الوسطي
                  </h3>
                  <p className="text-xs text-slate-500">
                    الركن الأول في المادة 34 الذي يحدد الهوية الشرعية والروحية للمملكة العربية السعودية.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    المفهوم والدلالة الدستورية:
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    قامت المملكة العربية السعودية على تحكيم كتاب الله وسنة رسوله ﷺ، والدفاع عن العقيدة هو واجب وجودي لحماية الهوية الإسلامية الصافية من الغلو والتطرف أو الانحلال والتفريط.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                  <h4 className="font-bold text-emerald-950 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-emerald-700" />
                    دوركِ يا طالبة الثانوية الأولى بالبدع:
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    التمسك بالقيم والأخلاق الإسلامية النبيلة، واكتساب الوعي الفكري الناقد ضد التيارات الضالة، والاعتزاز بالهوية الإسلامية والوطنية بكل فخر واعتدال.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'society' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                  02
                </div>
                <div>
                  <h3 className="text-xl font-bold text-emerald-950">
                    الدفاع عن المجتمع: التلاحم والوعي ومحاربة الشائعات
                  </h3>
                  <p className="text-xs text-slate-500">
                    حماية الجبهة الداخلية والنسيج الاجتماعي من كل محاولات التفكيك أو التشكيك.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    المفهوم والدلالة الدستورية:
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    المجتمع السعودي جسد واحد، والدفاع عنه يعني تعزيز اللحمة الوطنية، وصون الأسر، ومكافحة الجرائم الإلكترونية والشائعات المغرضة التي تستهدف زرع الإحباط أو الفتنة.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                  <h4 className="font-bold text-emerald-950 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-emerald-700" />
                    دوركِ يا طالبة الثانوية الأولى بالبدع:
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    أن تكوني حارسة وعي في بيئتك ومدرستك، لا تنشرين الشائعات في وسائل التواصل، وتبثين الإيجابية وروح التعاون والمودة بين زميلاتك وأفراد مجتمعك.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'homeland' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                  03
                </div>
                <div>
                  <h3 className="text-xl font-bold text-emerald-950">
                    الدفاع عن الوطن: صون المكتسبات والولاء للقيادة
                  </h3>
                  <p className="text-xs text-slate-500">
                    الوطن أمانة في أعناقنا جميعاً، صون حدوده ومقدراته ومستقبله الزاهر.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    المفهوم والدلالة الدستورية:
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    الدفاع عن الوطن يشمل حماية ترابه، والمحافظة على منجزاته الحضارية والاقتصادية والبيئية، وتأكيد البيعة والولاء لخادم الحرمين الشريفين وسمو ولي عهده الأمين.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                  <h4 className="font-bold text-emerald-950 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-emerald-700" />
                    دوركِ يا طالبة الثانوية الأولى بالبدع:
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    الاجتهاد العلمي لتمثيل الوطن في المحافل الدولية، والاعتزاز بالتراث الوطني السعودي، والمحافظة على المرافق المدرسية والعامة كجزء من الممتلكات الوطنية.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'service' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                  04
                </div>
                <div>
                  <h3 className="text-xl font-bold text-emerald-950">
                    أحكام الخدمة العسكرية والجاهزية الوطنية
                  </h3>
                  <p className="text-xs text-slate-500">
                    شرف الجندية ودور المساندة الشاملة لجميع أبناء وبنات الوطن.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    المفهوم والدلالة الدستورية:
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    ينظم النظام شرف الخدمة العسكرية والذود عن حياض الوطن بالقوة العسكرية المسلحة، مع الجاهزية التامة للمجتمع بكل قطاعاته المدنية لدعم وإسناد أبطال القوات المسلحة.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                  <h4 className="font-bold text-emerald-950 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-emerald-700" />
                    دوركِ يا طالبة الثانوية الأولى بالبدع:
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    الدعاء الدائم لجنودنا البواسل المرابطين على الثغور، والتطوع في الدفاع المدني والإسعاف والصحة، واكتساب مهارات إدارة الأزمات والجاهزية لخدمة الوطن في أي ظرف.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action to proceed to student interactive portal */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 text-right">
              هل استوعبتِ مضمون المادة 34؟ حان دوركِ للتعبير والمشاركة والحصول على وسام حامية الوطن!
            </div>
            <button
              onClick={onGoToParticipate}
              className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <span>الانتقال إلى واجهة ومشاركات الطالبة</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
