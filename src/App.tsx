/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { Article34Showcase } from './components/Article34Showcase';
import { StudentPortal } from './components/StudentPortal';
import { DigitalBook } from './components/DigitalBook';
import { TeacherDashboard } from './components/TeacherDashboard';
import { Footer } from './components/Footer';
import { api } from './services/api';
import { DailyMissionInteractive } from './components/DailyMissionInteractive';
import { StudentCertificateHub } from './components/StudentCertificateHub';
import { TeacherUser } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'article34' | 'student' | 'book' | 'admin' | 'mission' | 'certificate'>(() => {
    const saved = localStorage.getItem('deraa_active_tab');
    if (saved && ['home', 'article34', 'student', 'book', 'admin', 'mission', 'certificate'].includes(saved)) {
      return saved as any;
    }
    return 'home';
  });
  const [studentInitialSection, setStudentInitialSection] = useState<'text' | 'drawing' | 'survey' | 'quiz' | 'certificate' | 'gallery'>('text');
  const [certificateStudentName, setCertificateStudentName] = useState<string>('');
  const [certificateGrade, setCertificateGrade] = useState<string>('الصف الأول ثانوي');
  const [currentTeacher, setCurrentTeacher] = useState<TeacherUser | null>(null);

  // Check and restore existing teacher login session + URL hash & secret shortcut support
  useEffect(() => {
    api.getCurrentTeacher().then((teacher) => {
      if (teacher) {
        setCurrentTeacher(teacher);
      }
    });

    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#admin' || hash === '#login' || hash === '#dashboard') {
        changeTab('admin');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Secret keyboard shortcut for authorized teachers: Alt + A or Ctrl + Shift + L
      if (
        (e.altKey && (e.key === 'a' || e.key === 'A' || e.key === 'ش')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'l' || e.key === 'L' || e.key === 'م'))
      ) {
        e.preventDefault();
        changeTab('admin');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const changeTab = (tab: 'home' | 'article34' | 'student' | 'book' | 'admin' | 'mission' | 'certificate') => {
    setActiveTab(tab);
    localStorage.setItem('deraa_active_tab', tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTeacherLogin = (teacher: TeacherUser) => {
    setCurrentTeacher(teacher);
    changeTab('admin');
  };

  const handleTeacherLogout = async () => {
    await api.logout();
    setCurrentTeacher(null);
    changeTab('home');
  };

  const handleNavigateToStudent = (section: 'text' | 'drawing' | 'survey' | 'quiz' | 'certificate' | 'gallery') => {
    setStudentInitialSection(section);
    changeTab('student');
  };

  const handleOpenCertificate = (name?: string, gradeVal?: string) => {
    if (name) setCertificateStudentName(name);
    if (gradeVal) setCertificateGrade(gradeVal);
    changeTab('certificate');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Bar with School & Teacher Trust Strip */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={changeTab}
        isAdminLoggedIn={!!currentTeacher}
        teacherName={currentTeacher?.displayName}
        onLogout={handleTeacherLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'home' && (
          <HeroSection
            onNavigate={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectStudentSection={handleNavigateToStudent}
          />
        )}

        {activeTab === 'mission' && (
          <DailyMissionInteractive
            onBackToHome={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenCertificateHub={(name, gradeVal) => handleOpenCertificate(name, gradeVal)}
          />
        )}

        {activeTab === 'article34' && (
          <Article34Showcase
            onGoToParticipate={() => {
              setActiveTab('student');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'certificate' && (
          <StudentCertificateHub
            initialStudentName={certificateStudentName}
            initialGrade={certificateGrade}
            onBackToHome={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'student' && (
          <StudentPortal
            initialSection={studentInitialSection}
            onGoToDailyMission={() => {
              setActiveTab('mission');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenCertificateHub={(name, gradeVal) => handleOpenCertificate(name, gradeVal)}
            activeTeacher={currentTeacher}
          />
        )}

        {activeTab === 'book' && (
          <DigitalBook />
        )}

        {activeTab === 'admin' && (
          <TeacherDashboard
            currentTeacher={currentTeacher}
            onLoginSuccess={handleTeacherLogin}
            onLogout={handleTeacherLogout}
            onOpenStudentCertificate={(name, gradeVal) => handleOpenCertificate(name, gradeVal)}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onOpenAdmin={() => changeTab('admin')} />
    </div>
  );
}
