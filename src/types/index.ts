export interface Submission {
  id: string;
  studentName: string;
  grade: string;
  type: 'text' | 'drawing' | 'pledge' | 'quiz';
  title: string;
  content: string;
  fileUrl?: string;
  backgroundTemplate?: string;
  status: 'pending' | 'approved' | 'featured' | 'archived';
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  feedback?: string;
}

export interface SurveyRecord {
  id: string;
  studentName: string;
  grade: string;
  surveyType: 'pre' | 'post';
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
  notes?: string;
  createdAt: string;
}

export interface StudentBadge {
  id: string;
  studentName: string;
  grade: string;
  badgeId: string;
  badgeTitle: string;
  iconName: string;
  reason: string;
  awardedAt: string;
}

export interface TeacherUser {
  id: string;
  username: string;
  displayName: string;
  role: string;
  school: string;
}

export interface SurveyAnalytics {
  totalPre: number;
  totalPost: number;
  totalResponses: number;
  overallPre: number;
  overallPost: number;
  growthPercentage: number;
  hasData: boolean;
  metrics: {
    id: string;
    question: string;
    preAvg: number;
    postAvg: number;
  }[];
}

export interface StudentSummary {
  name: string;
  grade: string;
  submissionCount: number;
  surveysCount: number;
  badges: StudentBadge[];
  lastActive: string;
}
