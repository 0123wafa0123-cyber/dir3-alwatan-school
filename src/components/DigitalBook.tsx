import React, { useState } from 'react';
import { BookOpen, ChevronRight, ChevronLeft, Shield, Sparkles, Bookmark, Maximize2 } from 'lucide-react';
import bookCoverImg from '../assets/images/digital_book_cover_1792473213274.jpg';

export const DigitalBook: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [coverSrc, setCoverSrc] = useState<string>(bookCoverImg);

  const bookPages = [
    // Page 0: Cover
    {
      type: 'cover',
      title: 'الغلاف الرسمي',
      render: () => (
        <div className="h-full flex flex-col md:flex-row items-center justify-center p-6 sm:p-12 gap-8 text-center md:text-right bg-radial from-emerald-950 via-emerald-900 to-slate-950 text-white rounded-3xl border-4 border-amber-400/50 shadow-2xl">
          <div className="md:w-1/2 flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-1 bg-amber-400/30 rounded-2xl blur-lg group-hover:blur-xl transition duration-300" />
              <img
                src={coverSrc}
                alt="غلاف كتاب درع الوطن"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('assets/images')) {
                    target.src = '/assets/images/digital_book_cover_1792473213274.jpg';
                  } else if (!target.src.includes('public/images')) {
                    target.src = '/images/digital_book_cover_1792473213274.jpg';
                  }
                }}
                className="relative w-64 sm:w-72 rounded-xl shadow-2xl border-2 border-amber-400/70 transform -rotate-1 group-hover:rotate-0 transition-transform duration-300"
              />
            </div>
          </div>

          <div className="md:w-1/2 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-xs text-amber-300 font-bold bg-amber-950/80 px-3 py-1 rounded-full border border-amber-400/40">
              <Shield className="w-3.5 h-3.5" />
              <span>الثانوية الأولى بالبدع · الإصدار الرقمي</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white font-calligraphy leading-tight">
              كِتَابُ «دِرْعِ الوَطَن»
            </h1>

            <p className="text-sm text-emerald-200/90 leading-relaxed font-medium">
              التوعية بالمادة (34) من النظام الأساسي للحكم وأبعاد الدفاع عن العقيدة والمجتمع والوطن.
            </p>

            <div className="pt-4 border-t border-emerald-800/80 space-y-2 text-xs">
              <div className="text-amber-300 font-bold">إعداد وتنفيذ المعلمتين:</div>
              <div className="text-base font-bold text-white">أمل رشيد + وفاء الزهراني</div>
              <div className="text-emerald-300/80">الثانوية الأولى بالبدع · المملكة العربية السعودية</div>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-bold text-xs shadow-md cursor-pointer transition-all"
              >
                فتح الكتاب وبدء القراءة ←
              </button>
            </div>
          </div>
        </div>
      )
    },

    // Page 1: Introduction
    {
      type: 'content',
      chapter: 'المقدمة',
      title: 'منطلقات مبادرة «درع الوطن»',
      render: () => (
        <div className="space-y-6 text-right">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
            <h3 className="font-bold text-lg text-emerald-900 mb-1">
              مقدمة المعلمتين: أمل رشيد + وفاء الزهراني
            </h3>
            <p className="text-xs text-emerald-800">الثانوية الأولى بالبدع</p>
          </div>

          <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
            <p>
              الحمد لله والصلاة والسلام على نبينا محمد وعلى آله وصحبه أجمعين.
            </p>
            <p>
              يأتي هذا الكتاب الرقمي التفاعلي ضمن مبادرة <strong>«درع الوطن»</strong> التي أطلقتها الثانوية الأولى بالبدع، لترسيخ الوعي الدستوري والشرعي والوطني لدى طالباتنا العزيزات، وتجسيد معاني المادة (34) من النظام الأساسي للحكم في سلوك يومي، وعطاء علمي، وفكر حصين.
            </p>
            <p>
              إن الوطن ليس مجرد بقعة جغرافية نعيش فوقها، بل هو عقيدة نعتز بها، وتاريخ مجيد نفخر به، ومستقبل مشرق نصنعه بسواعدنا. وإن حماية هذا الكيان واجب شرعي ودستوري يتطلب وعياً مستنيراً وعزيمة صادقة.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-amber-950 text-xs leading-relaxed space-y-1">
            <div className="font-bold">أهداف المبادرة والكتاب:</div>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              <li>تعريف الطالبات بالنص الرسمي للمادة 34 ودلالاتها وأبعادها.</li>
              <li>تعزيز الحصانة الفكرية ومكافحة الشائعات في الفضاء الرقمي.</li>
              <li>إبراز دور الفتاة السعودية كشريك رئيسي في رفعة الوطن وحمايته.</li>
            </ul>
          </div>
        </div>
      )
    },

    // Page 2: Article 34 Full Analysis
    {
      type: 'content',
      chapter: 'الفصل الأول',
      title: 'المادة 34.. الدستور والحصانة',
      render: () => (
        <div className="space-y-6 text-right">
          <div className="p-6 rounded-2xl bg-emerald-950 text-white border-2 border-amber-400/50 shadow-md text-center space-y-2">
            <span className="text-amber-400 text-xs font-bold">النص الدستوري المعتمد</span>
            <blockquote className="text-xl sm:text-2xl font-calligraphy text-amber-200 font-bold leading-relaxed">
              « الدِّفَاعُ عَنِ العَقِيدَةِ الإِسْلَامِيَّةِ، وَالمُجْتَمَعِ، وَالوَطَنِ وَاجِبٌ عَلَى كُلِّ مُوَاطِنٍ، وَيُبَيِّنُ النِّظَامُ أَحْكَامَ الخِدْمَةِ العَسْكَرِيَّةِ. »
            </blockquote>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-emerald-900 text-sm">أولاً: أسبقية العقيدة الإسلامية</h4>
              <p className="leading-relaxed">
                بدأت المادة بالدفاع عن العقيدة الإسلامية لأنها الأساس الراسخ الذي قامت عليه الدولة السعودية منذ تأسيسها، وهي روح الأمة ومصدر تشريعاتها وقيمها.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-emerald-900 text-sm">ثانياً: حماية المجتمع وتماسكه</h4>
              <p className="leading-relaxed">
                المجتمع السعودي جسد واحد، والدفاع عنه يعني تحصين الأسرة، وحماية الشباب من الانحرافات الفكرية والمخدرات، ومواجهة حملات التشويه الخبيثة.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-emerald-900 text-sm">ثالثاً: شمولية الواجب الوطني</h4>
              <p className="leading-relaxed">
                استخدم النظام لفظ «كل مواطن» ليدل بوضوح على أن الواجب عام يشمل الرجال والنساء، فالكل جندي في مجاله وموقعه التعليمي والمهني.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-emerald-900 text-sm">رابعاً: تنظيم الخدمة والجاهزية</h4>
              <p className="leading-relaxed">
                يحدد النظام العسكري ضوابط الجندية وشرف الخدمة النظامية المسلحة، مع جاهزية المجتمع المدني التامة للإسناد والتطوع في كل الأوقات.
              </p>
            </div>
          </div>
        </div>
      )
    },

    // Page 3: The Saudi Woman as a Shield
    {
      type: 'content',
      chapter: 'الفصل الثاني',
      title: 'المرأة السعودية.. درع حصين للوطن',
      render: () => (
        <div className="space-y-6 text-right">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950">
            <h3 className="font-bold text-base text-amber-900">
              «طالبات الثانوية الأولى بالبدع.. سواعد الحاضر ودرع المستقبل»
            </h3>
            <p className="text-xs text-amber-800">
              إعداد المعلمتين: أمل رشيد + وفاء الزهراني
            </p>
          </div>

          <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
            <p>
              لقد أثبتت المرأة السعودية على مر تاريخ المملكة أنها شريك أصيل في الدفاع عن ثوابت الوطن ومكتسباته. ولم يعد مفهوم الدفاع مقتصراً على حمل السلاح في ميادين القتال، بل اتسع ليشمل:
            </p>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-emerald-50/60 border-r-4 border-emerald-600 text-xs">
                <strong>1. الدفاع الفكري والمعرفي:</strong> التسلح بالعلم النافع، والوعي بالهوية الوطنية، ومناقشة الشبهات بالمنطق والحجة السليمة.
              </div>

              <div className="p-3 rounded-lg bg-emerald-50/60 border-r-4 border-emerald-600 text-xs">
                <strong>2. الدفاع الرقمي والأمني:</strong> حماية السمعة الوطنية في شبكات التواصل، وعدم إعادة نشر الإشاعات أو الحسابات المشبوهة، والتبليغ عن الجرائم المعلوماتية.
              </div>

              <div className="p-3 rounded-lg bg-emerald-50/60 border-r-4 border-emerald-600 text-xs">
                <strong>3. الدفاع المجتمعي والتربوي:</strong> نشر روح التآلف، ونبذ العصبية والتفرقة، ودعم التكافل الاجتماعي والتطوع في خدمة ضيوف الرحمن والمحتاجين.
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Page 4: Military & Homeland Guards Honor
    {
      type: 'content',
      chapter: 'الفصل الثالث',
      title: 'تحية إجلال لأبطالنا في الحد الجنوبي والثغور',
      render: () => (
        <div className="space-y-6 text-right">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-900 to-emerald-950 text-white shadow-md space-y-3">
            <h3 className="text-xl font-bold text-amber-300">
              جنودنا البواسل.. العيون الساهرة والدرع المتين
            </h3>
            <p className="text-xs text-emerald-100/90 leading-relaxed">
              إن أسمى معاني تطبيق المادة 34 تتجسد حية في بطولات ضباط وأفراد القوات المسلحة، والحرس الوطني، وحرس الحدود، وقوات الأمن بجميع قطاعاتها، الذين يقدمون أرواحهم رخيصة لتظل راية التوحيد خفاقة.
            </p>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <p className="font-bold text-slate-900">
              واجبنا في الثانوية الأولى بالبدع تجاه أبطالنا:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600">
              <li>الدعاء الصادق الدائم لهم بالنصر والتمكين ولشهدائنا الأبرار بالرحمة والرضوان.</li>
              <li>رعاية أبناء وبنات الشهداء والمرابطين وإحاطتهم بكل مودة وفخر واعتزاز.</li>
              <li>المحافظة على أمن واطمئنان الجبهة الداخلية ليكونوا مطمئنين على وطنهم وأهلهم.</li>
              <li>الافتخار بالتاريخ العسكري والبطولي للمملكة العربية السعودية.</li>
            </ul>
          </div>
        </div>
      )
    },

    // Page 5: Conclusion & Charter
    {
      type: 'content',
      chapter: 'الخاتمة والميثاق',
      title: 'خاتمة: عهد الوفاء وميثاق درع الوطن',
      render: () => (
        <div className="space-y-6 text-right">
          <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-400 text-center space-y-3">
            <span className="text-xs font-bold text-amber-800">كلمة الختام لطالباتنا العزيزات</span>
            <h3 className="text-xl font-extrabold text-emerald-950">
              «أنتنّ فخر الوطن ودرعه الواعد»
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed max-w-lg mx-auto">
              تذكري دائماً يا طالبة الثانوية الأولى بالبدع أن كل جهد تبذلينه في دراستك، وكل خلق إسلامي تتمسكين به، هو لبنة في جدار حماية هذا الوطن المعطاء.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
            <div className="text-xs text-slate-500">توثيق وإعداد المبادرة:</div>
            <div className="text-base font-bold text-emerald-950">
              الثانوية الأولى بالبدع · المعلمتان: أمل رشيد + وفاء الزهراني
            </div>
            <div className="text-[11px] text-emerald-700">
              جميع الحقوق محفوظة لمبادرة درع الوطن المدرسية ©
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentPageData = bookPages[currentPage];

  return (
    <div className={`space-y-6 pb-16 max-w-5xl mx-auto ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900 p-6 overflow-y-auto' : ''}`}>
      {/* Book Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-900 text-amber-400 flex items-center justify-center shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="text-right">
            <h2 className="text-base font-bold text-slate-900">الكتاب الرقمي «درع الوطن»</h2>
            <p className="text-xs text-slate-500">
              الثانوية الأولى بالبدع · إعداد المعلمتين: أمل رشيد + وفاء الزهراني
            </p>
          </div>
        </div>

        {/* Page status & controls */}
        <div className="flex items-center gap-3">
          <div className="text-xs font-bold text-slate-700 px-3 py-1.5 bg-slate-100 rounded-lg font-mono">
            صفحة {currentPage + 1} من {bookPages.length}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(bookPages.length - 1, p + 1))}
              disabled={currentPage === bookPages.length - 1}
              className="p-2 rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="الصفحة التالية"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="p-2 rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="الصفحة السابقة"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer transition-colors text-xs flex items-center gap-1"
            title="ملء الشاشة"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Book Chapter Selector Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {bookPages.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentPage(idx)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-all ${
              currentPage === idx
                ? 'bg-emerald-800 text-white font-bold shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {p.type === 'cover' ? 'الغلاف' : `${(p as any).chapter}`}
          </button>
        ))}
      </div>

      {/* Main Book Reader Frame */}
      <div className="min-h-[500px] p-6 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xl relative">
        {currentPageData.type !== 'cover' && (
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 text-xs text-slate-400">
            <span className="font-semibold text-emerald-800">
              {(currentPageData as any).chapter} · {(currentPageData as any).title}
            </span>
            <span>الثانوية الأولى بالبدع · مبادرة درع الوطن</span>
          </div>
        )}

        {currentPageData.render()}

        {currentPageData.type !== 'cover' && (
          <div className="flex items-center justify-between pt-6 mt-8 border-t border-slate-100 text-[11px] text-slate-400">
            <span>إعداد المعلمتين: أمل رشيد + وفاء الزهراني</span>
            <span className="font-mono">{currentPage + 1} / {bookPages.length}</span>
          </div>
        )}
      </div>
    </div>
  );
};
