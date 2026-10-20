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
import { TeacherUser } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'article34' | 'student' | 'book' | 'admin'>('home');
  const [studentInitialSection, setStudentInitialSection] = useState<'text' | 'drawing' | 'survey' | 'quiz' | 'certificate'>('text');
  const [currentTeacher, setCurrentTeacher] = useState<TeacherUser | null>(null);

  // Check existing teacher login session
  useEffect(() => {
    api.getCurrentTeacher().then((teacher) => {
      if (teacher) setCurrentTeacher(teacher);
    });
  }, []);

  const handleTeacherLogin = (teacher: TeacherUser) => {
    setCurrentTeacher(teacher);
    setActiveTab('admin');
  };

  const handleTeacherLogout = async () => {
    await api.logout();
    setCurrentTeacher(null);
    setActiveTab('home');
  };

  const handleNavigateToStudent = (section: 'text' | 'drawing' | 'survey' | 'quiz' | 'certificate') => {
    setStudentInitialSection(section);
    setActiveTab('student');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Bar with School & Teacher Trust Strip */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
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

        {activeTab === 'article34' && (
          <Article34Showcase
            onGoToParticipate={() => {
              setActiveTab('student');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'student' && (
          <StudentPortal
            initialSection={studentInitialSection}
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
          />
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
