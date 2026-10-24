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
  likesCount?: number;
  teacherLikes?: {
    teacherId: string;
    teacherName: string;
    role: string;
    likedAt: string;
    comment?: string;
  }[];
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

export interface DailyMission {
  id: string;
  dayIndex: number;
  title: string;
  category: 'article34' | 'values' | 'cyber' | 'community' | 'history';
  type: 'scenario' | 'quiz' | 'riddle';
  difficulty: 'سهل' | 'متوسط' | 'تحدي';
  question: string;
  scenarioContext?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  points: number;
  badgeMilestone?: string;
}

export interface StudentMissionCompletion {
  id: string;
  studentName: string;
  grade: string;
  missionId: string;
  missionTitle: string;
  dateStr: string; // YYYY-MM-DD
  pointsEarned: number;
  isCorrect: boolean;
  completedAt: string;
}

export interface StudentMissionProgress {
  studentName: string;
  grade: string;
  totalPoints: number;
  completedMissionsCount: number;
  completedDates: string[];
  currentStreak: number;
  unlockedBadges: string[];
  unlockedStations: number; // 1 to 6
  weeklyBoxClaimed: boolean;
  weeklyMissionsCount: number;
  canClaimWeeklyBox?: boolean;
  lastCompletedDate?: string;
}

export interface ClassCollaborativeProgress {
  grade: string;
  targetMissions: number;
  completedMissions: number;
  totalPoints: number;
  percentage: number;
  tier: 'برونزي' | 'فضي' | 'ذهبي' | 'ألماسي';
}

export interface TeacherMissionStats {
  totalMissionsCompleted: number;
  totalShieldPointsAwarded: number;
  activeStudentsCount: number;
  weeklyBoxesClaimedCount: number;
  classBreakdown: {
    grade: string;
    completedCount: number;
    points: number;
    studentsCount: number;
  }[];
  recentCompletions: StudentMissionCompletion[];
  topBadgesAwarded: {
    badgeId: string;
    badgeTitle: string;
    count: number;
  }[];
}
