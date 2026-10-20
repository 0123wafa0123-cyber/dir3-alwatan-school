import { Submission, SurveyAnalytics, StudentSummary, StudentBadge, TeacherUser } from '../types';

const TOKEN_KEY = 'deraa_teacher_token';

export const api = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  // Auth
  async loginTeacher(username: string, password: string): Promise<{ success: boolean; teacher: TeacherUser; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل تسجيل الدخول');
    this.setToken(data.token);
    return data;
  },

  async getCurrentTeacher(): Promise<TeacherUser | null> {
    const token = this.getToken();
    if (!token) return null;
    try {
      const res = await fetch('/api/auth/me', {
        headers: this.getAuthHeaders()
      });
      if (!res.ok) {
        this.removeToken();
        return null;
      }
      const data = await res.json();
      return data.teacher;
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: this.getAuthHeaders()
      });
    } finally {
      this.removeToken();
    }
  },

  // Submissions
  async getSubmissions(params: {
    grade?: string;
    type?: string;
    status?: string;
    search?: string;
    publicOnly?: boolean;
  } = {}): Promise<{ total: number; submissions: Submission[] }> {
    const query = new URLSearchParams();
    if (params.grade) query.append('grade', params.grade);
    if (params.type) query.append('type', params.type);
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    if (params.publicOnly) query.append('publicOnly', 'true');

    const res = await fetch(`/api/submissions?${query.toString()}`);
    if (!res.ok) throw new Error('فشل جلب المشاركات من الخادم');
    return res.json();
  },

  async createSubmission(payload: {
    studentName: string;
    grade: string;
    type: 'text' | 'drawing' | 'pledge' | 'quiz';
    title?: string;
    content?: string;
    fileUrl?: string;
    backgroundTemplate?: string;
  }): Promise<{ success: boolean; message: string; submission: Submission }> {
    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل إرسال المشاركة');
    return data;
  },

  async updateSubmissionStatus(id: string, status: string, feedback?: string): Promise<{ success: boolean; submission: Submission }> {
    const res = await fetch(`/api/submissions/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      body: JSON.stringify({ status, feedback })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل تحديث حالة المشاركة');
    return data;
  },

  async deleteSubmission(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/submissions/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل حذف المشاركة');
    return data;
  },

  // Surveys
  async submitSurvey(payload: {
    studentName: string;
    grade: string;
    surveyType: 'pre' | 'post';
    q1: number;
    q2: number;
    q3: number;
    q4: number;
    q5: number;
    notes?: string;
  }): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/surveys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل حفظ الاستبانة');
    return data;
  },

  async getSurveyAnalytics(): Promise<SurveyAnalytics> {
    const res = await fetch('/api/surveys/stats');
    if (!res.ok) throw new Error('فشل جلب تحليلات الاستبانات');
    return res.json();
  },

  // Students & Badges
  async getStudents(): Promise<{ totalStudents: number; students: StudentSummary[] }> {
    const res = await fetch('/api/students');
    if (!res.ok) throw new Error('فشل جلب سجل الطالبات');
    return res.json();
  },

  async awardBadge(payload: {
    studentName: string;
    grade: string;
    badgeId: string;
    badgeTitle: string;
    iconName?: string;
    reason: string;
  }): Promise<{ success: boolean; message: string; badge?: StudentBadge }> {
    const res = await fetch('/api/badges/award', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل منح الشارة');
    return data;
  },

  async getBadges(): Promise<{ totalBadges: number; badges: StudentBadge[] }> {
    const res = await fetch('/api/badges');
    if (!res.ok) throw new Error('فشل جلب الأوسمة');
    return res.json();
  },

  // Upload (drawing canvas to server)
  async uploadDrawing(dataUrl: string): Promise<{ success: boolean; url: string }> {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل رفع الرسمة');
    return data;
  },

  // Export
  getExportCsvUrl(): string {
    return '/api/export/csv';
  }
};
