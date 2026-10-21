import { DailyMission } from '../types';

export const DAILY_MISSIONS_BANK: DailyMission[] = [
  {
    id: 'mission_art34_core',
    dayIndex: 0,
    title: 'سؤال الدستور: ثلاثية الدفاع في المادة 34',
    category: 'article34',
    type: 'quiz',
    difficulty: 'سهل',
    points: 25,
    scenarioContext: 'تنص المادة (34) من النظام الأساسي للحكم على مبدأ دستوري أصيل يحدد واجبات المواطن تجاه وطنه.',
    question: 'ما هي الركائز الثلاث التي نصت عليها المادة (34) بأن الدفاع عنها واجب مقدس على كل مواطن؟',
    options: [
      'العقيدة الإسلامية، والمجتمع، والوطن',
      'التجارة، والصناعة، والحدود الجغرافية',
      'المباني الحكومية، والمرافق العامة، والأسواق',
      'العلاقات الدبلوماسية، والرياضة، والإعلام'
    ],
    correctIndex: 0,
    explanation: 'أحسنتِ! نصت المادة 34 صراحة: «الدفاع عن العقيدة الإسلامية، والمجتمع، والوطن واجب على كل مواطن». الدفاع عن العقيدة والمجتمع والوطن ليس مقتصراً على السلاح بل يشمل الفكر والوعي والاعتزاز بقيمنا الإسلامية السمحة.',
    badgeMilestone: 'ambassador_awareness'
  },
  {
    id: 'mission_cyber_patriot',
    dayIndex: 1,
    title: 'موقف وطني: التصدي للشائعات الرقمية',
    category: 'cyber',
    type: 'scenario',
    difficulty: 'متوسط',
    points: 30,
    scenarioContext: 'وصلتكِ عبر إحدى منصات التواصل الاجتماعي رسالة صوتية مجهولة المصدر تتحدث عن شائعة تخص أمن المجتمع أو الصحة العامة وتحث على إعادة إرسالها فوراً.',
    question: 'بصفتكِ درعاً واعياً للوطن، ما هو السلوك الوطني الرشيد والمسؤول تجاه هذه الرسالة؟',
    options: [
      'إعادة إرسالها لجميع مجموعات الفصل لتحذير الصديقات فوراً',
      'التوقف عن نشرها والتحقق من القنوات الرسمية وتوعية من أرسلها بعدم بث الشائعات',
      'إبداء الإعجاب والتعليق عليها لجذب المتابعين',
      'حفظها ونشرها في حسابكِ الشخصي لإثارة النقاش العام'
    ],
    correctIndex: 1,
    explanation: 'بارك الله في وعيكِ! الدفاع عن المجتمع يبدأ بوقف الشائعات عند جهازك. المواطنة الرقمية الصالحة تقتضي استقاء الأخبار فقط من المصادر الرسمية المعتمدة للمملكة كوكالة الأنباء السعودية (واس) والوزارات المعنية.',
    badgeMilestone: 'values_guardian'
  },
  {
    id: 'mission_riddle_shield',
    dayIndex: 2,
    title: 'لغز درع الوطن الفكري',
    category: 'values',
    type: 'riddle',
    difficulty: 'تحدي',
    points: 35,
    scenarioContext: 'تأملي هذا اللغز المستوحى من روح مبادرة درع الوطن بالثانوية الأولى بالبدع.',
    question: '«سلاحي ليس من حديد، ومكاني في العقول والقلوب، إذا امتلكته طالبة أضحت حصناً منيعاً لأمتها ضد التيارات المشبوهة.. فمن أكون؟»',
    options: [
      'الوعي الوطني والأمن الفكري',
      'الهاتف الذكي الحديث',
      'حقيبة الكتب المدرسية',
      'التسوق عبر الإنترنت'
    ],
    correctIndex: 0,
    explanation: 'إجابة عبقرية! الوعي الوطني والأمن الفكري هما الدرع الحقيقي الذي يحمي عقول بنات الوطن من أي تشويه أو استقطاب فكري ضال، وهذا هو جوهر مبادرة «درع الوطن».',
    badgeMilestone: 'impact_maker'
  },
  {
    id: 'mission_saudi_woman_role',
    dayIndex: 3,
    title: 'موقف وطني: الفتاة السعودية وحماية الهوية',
    category: 'community',
    type: 'scenario',
    difficulty: 'متوسط',
    points: 30,
    scenarioContext: 'في محفل مدرسي أو مشاركة دولية، سُئلت طالبة عن دور الفتاة السعودية في تحقيق مستهدفات رؤية 2030 وحماية مكتسبات الوطن.',
    question: 'أي من الإجابات الآتية يمثل المفهوم الشامل للمواطنة الفاعلة للمرأة والفتاة السعودية؟',
    options: [
      'التفوق العلمي، الاعتزاز بالهوية الإسلامية والوطنية، والمساهمة في بناء المجتمع',
      'الاكتفاء بالصمت وعدم الاهتمام بالشأن المجتمعي',
      'التركيز على المظاهر فقط دون السعي للمعرفة والإنجاز',
      'تقليد الثقافات الأخرى والتخلي عن عاداتنا وتقاليدنا الوطنية'
    ],
    correctIndex: 0,
    explanation: 'رائع جداً! تمثل الفتاة السعودية اليوم درعاً ثقافياً وحضارياً متفوقاً يجمع بين الأصالة والعلم والاعتزاز بالقيم والتراث السعودي العريق، مساهمةً بقوة في بناء مجتمع المعرفة وفق رؤية السعودية 2030.',
    badgeMilestone: 'ambassador_awareness'
  },
  {
    id: 'mission_flag_reverence',
    dayIndex: 4,
    title: 'سؤال الدستور: احترام راية التوحيد والرمز الوطني',
    category: 'history',
    type: 'quiz',
    difficulty: 'سهل',
    points: 25,
    scenarioContext: 'يتميز العلم الوطني للمملكة العربية السعودية بخصائص فريدة نص عليها النظام تكرس قدسيته ومكانته.',
    question: 'لماذا لا يُنكّس العلم السعودي أبداً ولا يُلامس الأرض أو الماء بأي حال؟',
    options: [
      'لأنه يحمل شهادة التوحيد «لا إله إلا الله محمد رسول الله» ورسم السيف رمز العدل والقوة',
      'لأنه مصنوع من نوع قماش خاص لا يسمح بالتنكيس',
      'بسبب حجمه وطوله الكبير في السواري الرسمية',
      'لأن القواعد تنص على تنكيسه فقط في الإجازات الرسمية'
    ],
    correctIndex: 0,
    explanation: 'إجابة صحيحة ومباركة! راية التوحيد السعودية خفاقة دائماً شامخة ولا تنكس تكريماً وتعظيماً لكلمة التوحيد الخالدة وسيف العدل والحق.',
    badgeMilestone: 'values_guardian'
  },
  {
    id: 'mission_school_patriotism',
    dayIndex: 5,
    title: 'موقف وطني: المحافظة على الممتلكات المدرسية',
    category: 'community',
    type: 'scenario',
    difficulty: 'سهل',
    points: 25,
    scenarioContext: 'رأيتِ إحدى الطالبات تعبث بممتلكات المدرسة أو الجدران وتكتب عليها بلا مبالاة.',
    question: 'كيف تعبرين بسلوككِ عن كونكِ «درعاً للوطن» في هذه البيئة المدرسية بالبدع؟',
    options: [
      'توجيه نصيحة لطيفة لها بأن مرافق المدرسة هي ملك لوطننا وواجبنا صيانتها، والمبادرة لتنظيف المكان',
      'تجاهل الأمر والضحك معها تشجيعاً لها',
      'المشاركة معها في الكتابة بدعوى التسلية',
      'تصوير المشهد ونشره فوراً في تطبيقات التواصل للتشهير'
    ],
    correctIndex: 0,
    explanation: 'تصرف وطني راقٍ! حب الوطن ينعكس في السلوك اليومي بالمحافظة على مقدراته ومنشآته ومرافقه التعليمية كالثانوية الأولى بالبدع، فالوطن يبدأ من الفصل والمدرسة والحي.',
    badgeMilestone: 'participation_star'
  },
  {
    id: 'mission_soldiers_gratitude',
    dayIndex: 6,
    title: 'لغز وطني: حماة الثغور والحدود',
    category: 'values',
    type: 'riddle',
    difficulty: 'تحدي',
    points: 35,
    scenarioContext: 'واجبنا تجاه المرابطين على حدود الوطن ورجال أمننا الأوفياء هو صميم المادة 34.',
    question: '«يسهرون في الليالي القارسة، يحمون ثغور بلادنا بأرواحهم حتى ننعم بالأمن والدراسة، وأقل واجبنا نحوهم الدعاء والفخر والتضامن المجتمعي.. فمن هم؟»',
    options: [
      'أبطال القوات المسلحة ورجال الأمن البواسل',
      'المسافرون في رحلات الصيد البرية',
      'المهندسون في شركات التقنية الخارجية',
      'الرياضيون في البطولات الترفيهية'
    ],
    correctIndex: 0,
    explanation: 'كل التحية والإجلال لأبطالنا المرابطين! تنص المادة 34: «ويبيّن النظام أحكام الخدمة العسكرية»، والدفاع عن الوطن تضحية مقدسة يقدمها جنودنا البواسل حمايةً للمقدسات والمواطنين.',
    badgeMilestone: 'impact_maker'
  },
  {
    id: 'mission_volunteer_spirit',
    dayIndex: 7,
    title: 'موقف وطني: المبادرة والعمل التطوعي',
    category: 'community',
    type: 'scenario',
    difficulty: 'متوسط',
    points: 30,
    scenarioContext: 'أعلنت المدرسة عن مبادرة تطوعية بيئية لتشجير محيط المدرسة والمحافظة على الغطاء النباتي في البدع وتبوك.',
    question: 'ما هو الأثر الوطني لمشاركتكِ في مثل هذه المبادرات التطوعية؟',
    options: [
      'المساهمة في تحقيق مستهدفات مبادرة السعودية الخضراء وتعزيز روح التكاتف والولاء العملي',
      'الحصول فقط على إعفاء من الحصص الدراسية دون اهتمام بالهدف',
      'مجرد ملء أوقات الفراغ دون أي عائد وطني',
      'التقاط صور شخصية دون بذل أي جهد في العمل'
    ],
    correctIndex: 0,
    explanation: 'مبدعة! التطوع ركيزة أساسية من ركائز رؤية المملكة للوصول لمليون متطوع، وهو التجسيد العملي لخدمة المجتمع المذكور في المادة 34 من النظام الأساسي للحكم.',
    badgeMilestone: 'impact_maker'
  }
];

export interface ShieldStation {
  id: number;
  title: string;
  subtitle: string;
  requiredPoints: number;
  icon: string;
  badgeId: string;
  description: string;
}

export const SHIELD_JOURNEY_STATIONS: ShieldStation[] = [
  {
    id: 1,
    title: 'محطة الانطلاقة',
    subtitle: 'قسم الولاء والعهد الوطني',
    requiredPoints: 0,
    icon: 'Flag',
    badgeId: 'station_initiate',
    description: 'خطوتكِ الأولى في ركاب حماة الوطن بالثانوية الأولى بالبدع.'
  },
  {
    id: 2,
    title: 'محطة النور الدستوري',
    subtitle: 'استيعاب أبعاد المادة (34)',
    requiredPoints: 40,
    icon: 'BookOpen',
    badgeId: 'ambassador_awareness',
    description: 'وعي عميق بالدستور وثلاثية العقيدة والمجتمع والوطن.'
  },
  {
    id: 3,
    title: 'محطة حصن الفكر',
    subtitle: 'المواطنة الرقمية وحصانة العقل',
    requiredPoints: 80,
    icon: 'ShieldAlert',
    badgeId: 'values_guardian',
    description: 'مواجهة الشائعات ودحض الأفكار المشبوهة بعزم وبصيرة.'
  },
  {
    id: 4,
    title: 'محطة نجمة الميدان',
    subtitle: 'المشاركة الفاعلة والاستمرارية',
    requiredPoints: 120,
    icon: 'Star',
    badgeId: 'participation_star',
    description: 'استدامة البذل اليومي وإلهام الزميلات في الفصول.'
  },
  {
    id: 5,
    title: 'محطة صانعات الأثر',
    subtitle: 'المبادرة وريادة الخدمة المجتمعية',
    requiredPoints: 160,
    icon: 'Sparkles',
    badgeId: 'impact_maker',
    description: 'تحويل الأفكار إلى مبادرات واقعية تثري ثانوية البدع.'
  },
  {
    id: 6,
    title: 'قمة المجد الوطنية',
    subtitle: 'وسام درع الوطن الخالد',
    requiredPoints: 200,
    icon: 'Crown',
    badgeId: 'grand_shield_master',
    description: 'التاج الذهبي لحامية الوطن وسفيرته المتميزة بامتياز.'
  }
];

export const OFFICIAL_BADGES_DEFINITIONS = [
  {
    id: 'ambassador_awareness',
    title: 'سفيرة الوعي',
    iconName: 'Compass',
    gradient: 'from-emerald-500 to-teal-700',
    description: 'تُمنح للطالبة المتميزة في إتقان مضامين المادة 34 ونشر الوعي الدستوري والفكري.'
  },
  {
    id: 'values_guardian',
    title: 'حامية القيم',
    iconName: 'Shield',
    gradient: 'from-amber-500 to-yellow-600',
    description: 'تُمنح لمن تتصدى للشائعات الرقمية وتدافع عن قيم المجتمع وثوابته الإسلامية والوطنية.'
  },
  {
    id: 'participation_star',
    title: 'نجمة المشاركة',
    iconName: 'Star',
    gradient: 'from-purple-500 to-indigo-700',
    description: 'تُمنح للطالبة المثابرة التي تحافظ على وتيرة إنجاز مهمات الدرع اليومية بنجاح.'
  },
  {
    id: 'impact_maker',
    title: 'صانعة الأثر',
    iconName: 'Award',
    gradient: 'from-rose-500 to-pink-700',
    description: 'تُمنح لمن تجمع بين المعرفة النظرية والمبادرة المجتمعية الإيجابية وتلهم زميلاتها.'
  }
];

export function getTodayMission(dateOffset = 0): DailyMission {
  const now = new Date();
  // Compute day of year to cycle through missions
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay) + dateOffset;
  
  const index = Math.abs(dayOfYear) % DAILY_MISSIONS_BANK.length;
  return DAILY_MISSIONS_BANK[index];
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
