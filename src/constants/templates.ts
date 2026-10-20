export interface ShieldTemplate {
  id: string;
  name: string;
  subtitle: string;
  themeColor: string;
  accentColor: string;
  cardBgClass: string;
  borderClass: string;
  titleColorClass: string;
  textColorClass: string;
  footerColorClass: string;
  badgeText: string;
  badgeClass: string;
  watermarkIcon: 'shield' | 'palm' | 'flag' | 'star' | 'crown';
  previewGradient: string;
}

export const SHIELD_TEMPLATES: ShieldTemplate[] = [
  {
    id: 'emerald-shield',
    name: 'درع الزمرد الملكي',
    subtitle: 'أصالة اللون الوطني مع أطر مذهبة ونقوش إسلامية',
    themeColor: '#064e3b',
    accentColor: '#f59e0b',
    cardBgClass: 'bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 text-white',
    borderClass: 'border-2 border-amber-400/60 shadow-2xl shadow-emerald-950/40 ring-1 ring-amber-400/30',
    titleColorClass: 'text-amber-300 font-bold',
    textColorClass: 'text-emerald-50 leading-relaxed',
    footerColorClass: 'text-emerald-300/80 border-emerald-800/80',
    badgeText: 'وثيقة درع الوطن الرسمية',
    badgeClass: 'bg-amber-400/20 text-amber-300 border-amber-400/50',
    watermarkIcon: 'shield',
    previewGradient: 'from-emerald-900 to-emerald-950 border-amber-400'
  },
  {
    id: 'golden-parchment',
    name: 'وثيقة الفخر المذهبة',
    subtitle: 'طابع المخطوطات والوثائق الملكية بأناقة ورقية دافئة',
    themeColor: '#d97706',
    accentColor: '#065f46',
    cardBgClass: 'bg-gradient-to-br from-amber-50 via-amber-100/70 to-yellow-50 text-slate-900',
    borderClass: 'border-3 border-amber-600/50 shadow-xl ring-2 ring-amber-400/30',
    titleColorClass: 'text-amber-900 font-bold',
    textColorClass: 'text-slate-800 leading-relaxed font-serif',
    footerColorClass: 'text-amber-900/80 border-amber-300',
    badgeText: 'مخطوطة الفخر والولاء',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-400',
    watermarkIcon: 'palm',
    previewGradient: 'from-amber-100 to-amber-200 border-amber-600'
  },
  {
    id: 'glory-green',
    name: 'راية المجد الخضراء',
    subtitle: 'نقاء الراية السعودية الخفاقة وزخارف العز والبسالة',
    themeColor: '#047857',
    accentColor: '#fbbf24',
    cardBgClass: 'bg-gradient-to-br from-emerald-800 via-teal-900 to-emerald-950 text-white',
    borderClass: 'border-2 border-emerald-400/60 shadow-2xl ring-1 ring-amber-300/40',
    titleColorClass: 'text-amber-300 font-bold',
    textColorClass: 'text-white leading-relaxed',
    footerColorClass: 'text-emerald-200/90 border-emerald-700/80',
    badgeText: 'راية العز والدفاع عن الوطن',
    badgeClass: 'bg-emerald-700 text-white border-amber-400/40',
    watermarkIcon: 'flag',
    previewGradient: 'from-emerald-700 to-teal-900 border-emerald-400'
  },
  {
    id: 'marble-gold',
    name: 'الرخام الأبيض والدرع الذهبي',
    subtitle: 'أناقة ملكية ناصعة مع إطار مذهب وأختام التميز',
    themeColor: '#1e293b',
    accentColor: '#d97706',
    cardBgClass: 'bg-gradient-to-br from-white via-slate-50 to-amber-50/40 text-slate-900',
    borderClass: 'border-2 border-amber-500/50 shadow-xl ring-4 ring-emerald-900/5',
    titleColorClass: 'text-emerald-950 font-bold',
    textColorClass: 'text-slate-800 leading-relaxed',
    footerColorClass: 'text-slate-600 border-slate-200',
    badgeText: 'وسام التميز الوطني',
    badgeClass: 'bg-emerald-50 text-emerald-900 border-emerald-300',
    watermarkIcon: 'crown',
    previewGradient: 'from-white to-amber-50 border-amber-500'
  },
  {
    id: 'night-covenant',
    name: 'سماء الوطن وعهد المادة 34',
    subtitle: 'هيبة الليل الملكي مع بريق النجوم والعهد الدستوري',
    themeColor: '#0f172a',
    accentColor: '#10b981',
    cardBgClass: 'bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white',
    borderClass: 'border-2 border-emerald-500/50 shadow-2xl shadow-slate-950 ring-1 ring-amber-400/40',
    titleColorClass: 'text-emerald-400 font-bold',
    textColorClass: 'text-slate-100 leading-relaxed',
    footerColorClass: 'text-slate-400 border-slate-800',
    badgeText: 'عهد الدفاع عن العقيدة والوطن',
    badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-500/40',
    watermarkIcon: 'star',
    previewGradient: 'from-slate-950 to-emerald-950 border-emerald-500'
  }
];

export function getShieldTemplate(id?: string): ShieldTemplate {
  return SHIELD_TEMPLATES.find((t) => t.id === id) || SHIELD_TEMPLATES[0];
}
