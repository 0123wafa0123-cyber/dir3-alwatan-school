import React from 'react';
import { Shield, BookOpen, PenTool, Award, LayoutDashboard, Home, UserCheck, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'home' | 'article34' | 'student' | 'book' | 'admin' | 'mission' | 'certificate';
  setActiveTab: (tab: 'home' | 'article34' | 'student' | 'book' | 'admin' | 'mission' | 'certificate') => void;
  isAdminLoggedIn: boolean;
  teacherName?: string;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isAdminLoggedIn,
  teacherName,
  onLogout
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-900/10 shadow-xs">
      {/* Top School & Teachers Trust Strip */}
      <div className="bg-emerald-950 text-emerald-100/90 text-xs py-1.5 px-4 sm:px-8 border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-400">الثانوية الأولى بالبدع</span>
            <span className="text-emerald-400/60" aria-hidden="true">·</span>
            <span>إشراف مديرة المدرسة: <strong className="text-white font-medium">أ. فاطمة سليمان المسعودي</strong></span>
            <span className="text-emerald-400/60 hidden sm:inline" aria-hidden="true">·</span>
            <span className="text-emerald-300 hidden sm:inline">مبادرة درع الوطن</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-emerald-300/80">إعداد وتنفيذ المعلمتين:</span>
            <span className="font-bold text-amber-300">أمل رشيد + وفاء الزهراني</span>
          </div>
        </div>
      </div>

      {/* Main Top Bar: 3-Zone Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Double-click allows authorized staff to open admin) */}
        <button
          onClick={() => setActiveTab('home')}
          onDoubleClick={(e) => {
            e.preventDefault();
            setActiveTab('admin');
          }}
          className="flex items-center gap-3 text-right group cursor-pointer focus:outline-hidden"
          title="دِرْعُ الوَطَن - الثانوية الأولى بالبدع"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-sm group-hover:scale-105 transition-transform duration-200 shrink-0">
            <Shield className="w-5 h-5 fill-amber-400/20" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-emerald-950 tracking-tight leading-tight group-hover:text-emerald-800 transition-colors">
              دِرعُ الوَطَن
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">
              المنصة التفاعلية المدرسية
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (single line, clean text links) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-700">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer py-1 border-b-2 ${
              activeTab === 'home'
                ? 'border-emerald-700 text-emerald-900 font-bold'
                : 'border-transparent hover:text-emerald-800'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>الرئيسية</span>
          </button>

          <button
            onClick={() => setActiveTab('article34')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer py-1 border-b-2 ${
              activeTab === 'article34'
                ? 'border-emerald-700 text-emerald-900 font-bold'
                : 'border-transparent hover:text-emerald-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>المادة 34</span>
          </button>

          <button
            onClick={() => setActiveTab('mission')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer py-1 border-b-2 ${
              activeTab === 'mission'
                ? 'border-amber-500 text-amber-800 font-bold'
                : 'border-transparent hover:text-emerald-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>مهمة اليوم</span>
            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full font-bold border border-amber-300">تحدي</span>
          </button>

          <button
            onClick={() => setActiveTab('student')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer py-1 border-b-2 ${
              activeTab === 'student'
                ? 'border-emerald-700 text-emerald-900 font-bold'
                : 'border-transparent hover:text-emerald-800'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>واجهة ومشاركات الطالبة</span>
          </button>

          <button
            onClick={() => setActiveTab('certificate')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer py-1 border-b-2 ${
              activeTab === 'certificate'
                ? 'border-amber-500 text-amber-800 font-bold'
                : 'border-transparent hover:text-emerald-800'
            }`}
          >
            <Award className="w-4 h-4 text-amber-500" />
            <span>شهادات التقدير</span>
            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full font-bold border border-amber-300">تكريم</span>
          </button>

          <button
            onClick={() => setActiveTab('book')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer py-1 border-b-2 ${
              activeTab === 'book'
                ? 'border-emerald-700 text-emerald-900 font-bold'
                : 'border-transparent hover:text-emerald-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>الكتاب الرقمي</span>
          </button>
        </nav>

        {/* Zone 3: Action Area - Student CTA or Teacher Session */}
        <div className="flex items-center gap-3 shrink-0">
          {isAdminLoggedIn ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-emerald-900 text-white'
                    : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-amber-500" />
                <span className="hidden sm:inline">لوحة التحكم: {teacherName || 'الإدارة'}</span>
                <span className="sm:hidden">الإدارة</span>
              </button>
              <button
                onClick={onLogout}
                className="px-2.5 py-2 text-xs text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title="تسجيل الخروج"
              >
                خروج
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('student')}
              className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-800 to-emerald-950 hover:from-emerald-700 hover:to-emerald-900 rounded-lg shadow-xs hover:shadow-sm transition-all duration-200 flex items-center gap-1.5 cursor-pointer border border-amber-400/30 whitespace-nowrap"
            >
              <PenTool className="w-3.5 h-3.5 text-amber-400" />
              <span>شاركي في المبادرة</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Sub-Bar */}
      <div className="lg:hidden flex items-center justify-around bg-slate-50 border-t border-slate-200 px-2 py-2 text-xs font-medium text-slate-700">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-md ${
            activeTab === 'home' ? 'text-emerald-800 font-bold bg-emerald-100/50' : 'hover:text-emerald-700'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>الرئيسية</span>
        </button>

        <button
          onClick={() => setActiveTab('mission')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-md ${
            activeTab === 'mission' ? 'text-amber-800 font-bold bg-amber-100/70' : 'hover:text-emerald-700'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>مهمة اليوم</span>
        </button>

        <button
          onClick={() => setActiveTab('article34')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-md ${
            activeTab === 'article34' ? 'text-emerald-800 font-bold bg-emerald-100/50' : 'hover:text-emerald-700'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>المادة 34</span>
        </button>

        <button
          onClick={() => setActiveTab('student')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-md ${
            activeTab === 'student' ? 'text-emerald-800 font-bold bg-emerald-100/50' : 'hover:text-emerald-700'
          }`}
        >
          <PenTool className="w-4 h-4" />
          <span>المشاركات</span>
        </button>

        <button
          onClick={() => setActiveTab('certificate')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-md ${
            activeTab === 'certificate' ? 'text-amber-800 font-bold bg-amber-100/70' : 'hover:text-emerald-700'
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>الشهادات</span>
        </button>

        <button
          onClick={() => setActiveTab('book')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-md ${
            activeTab === 'book' ? 'text-emerald-800 font-bold bg-emerald-100/50' : 'hover:text-emerald-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>الكتاب</span>
        </button>

        {isAdminLoggedIn && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-md ${
              activeTab === 'admin' ? 'text-emerald-800 font-bold bg-emerald-100/50' : 'hover:text-emerald-700'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-amber-500" />
            <span>لوحة التحكم</span>
          </button>
        )}
      </div>
    </header>
  );
};
