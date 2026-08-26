export type UserRole = 'student' | 'parent' | 'teacher' | 'institution_admin';

export type AccountType = 'independent' | 'institution';

export type ExamType =
  | 'JEE Main'
  | 'JEE Advanced'
  | 'NEET UG'
  | 'SSC CGL'
  | 'UPSC CSE'
  | 'CBSE Class 12'
  | 'CBSE Class 11'
  | 'CBSE Class 10'
  | 'NDA / CDS';

export type SubjectName = 'Physics' | 'Chemistry' | 'Mathematics' | 'Biology';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  accountType: AccountType;
  schoolConnectId: string; // e.g. "SC-STU-4821"
  avatar: string;
  targetExam?: ExamType;
  standardClass?: string; // e.g. "Class 12", "Class 11", "Dropper Batch"
  institutionId?: string;
  institutionName?: string;
  linkedChildIds?: string[]; // For parents: array of School-Connect IDs
  bio?: string;
  qualifications?: string;
  rating?: number;
  totalRatings?: number;
  bloodGroup?: string;
  phone?: string;
  city?: string;
  createdAt: string;
  enrolledBatches?: string[];
}

export interface Institution {
  id: string;
  name: string;
  type: 'School' | 'Coaching Institute' | 'Tuition Center';
  schoolConnectId: string; // e.g. "SC-INS-9001"
  logo: string;
  banner?: string;
  city: string;
  contactEmail: string;
  contactPhone: string;
  totalStudents: number;
  totalTeachers: number;
  establishedYear: number;
  batches: Batch[];
  teachers: string[]; // Teacher IDs
}

export interface Batch {
  id: string;
  institutionId: string;
  name: string;
  targetExam: ExamType;
  standardClass: string;
  teacherName: string;
  teacherId: string;
  studentCount: number;
  schedule: string;
}

export interface Question {
  id: string;
  subject: SubjectName;
  chapter: string;
  topic: string;
  examType: ExamType;
  year: number;
  shiftOrSet?: string; // e.g. "2024 Jan 27 Shift 1"
  questionText: string;
  questionType: 'single_correct' | 'numerical' | 'assertion_reason';
  options: string[];
  correctOptionIndex: number;
  numericalAnswer?: number;
  numericalTolerance?: number;
  explanation: string;
  formulaUsed?: string;
  keyConcept?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
}

export interface Test {
  id: string;
  title: string;
  durationMinutes: number;
  totalMarks: number;
  targetExam: ExamType;
  testType: 'Full Mock' | 'Chapter Test' | 'PYQ Paper' | 'AI Booster' | 'Institution Assessment';
  subject?: SubjectName | 'All';
  chapter?: string;
  year?: number;
  questions: Question[];
  instructions: string[];
  authorName?: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  attemptsCount: number;
  avgScore: number;
}

export interface QuestionResponse {
  selectedOption?: number;
  numericalAnswer?: number;
  isMarkedForReview: boolean;
  status: 'not_visited' | 'not_answered' | 'answered' | 'marked_for_review' | 'answered_and_marked';
  timeSpentSeconds: number;
  isCorrect?: boolean;
}

export interface TestAttempt {
  id: string;
  testId: string;
  testTitle: string;
  userId: string;
  userName: string;
  targetExam: ExamType;
  startedAt: string;
  completedAt: string;
  totalQuestions: number;
  attemptedQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattempted: number;
  score: number;
  maxScore: number;
  accuracy: number; // percentage
  percentile: number;
  timeSpentSeconds: number;
  subjectScores: {
    [key in SubjectName]?: {
      attempted: number;
      correct: number;
      score: number;
      total: number;
    };
  };
  questionResponses: { [questionId: string]: QuestionResponse };
  aiAnalysis?: {
    weakTopics: string[];
    strengths: string[];
    recommendation: string;
    speedInsight: string;
    suggestedRevisionQueue: string[];
  };
}

export interface SyllabusTopic {
  id: string;
  name: string;
  completed: boolean;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  weightageLevel: 'High' | 'Medium' | 'Low';
  lastRevisedDate?: string;
}

export interface SyllabusChapter {
  id: string;
  subject: SubjectName;
  name: string;
  standardClass: string;
  weightagePercent: number;
  topics: SyllabusTopic[];
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Needs Revision';
  isHighYield: boolean;
  formulaSheetAvailable: boolean;
}

export interface DailyGoal {
  id: string;
  userId: string;
  date: string;
  title: string;
  targetCount: number;
  completedCount: number;
  unit: string;
  isDone: boolean;
  category: 'PYQs' | 'Revision' | 'Mock Test' | 'NCERT Reading' | 'Formula Practice';
}

export interface BookmarkItem {
  id: string;
  userId: string;
  questionId: string;
  question: Question;
  note: string;
  tag: string;
  savedAt: string;
}

export interface NCERTResource {
  id: string;
  subject: SubjectName;
  standardClass: string;
  chapterNumber: number;
  chapterTitle: string;
  readTimeMinutes: number;
  keyPoints: string[];
  importantFormulas: string[];
  exemplarProblems: {
    question: string;
    solution: string;
  }[];
  pdfDownloadUrl?: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
  suggestedActions?: {
    label: string;
    action: string;
    payload?: any;
  }[];
  weaknessTag?: string;
}

export type ChatChannelType = 'student_parent' | 'student_teacher' | 'parent_teacher' | 'class_group' | 'peer_student';

export interface ChatAttachment {
  id: string;
  type: 'image' | 'video' | 'audio' | 'formula' | 'question_ref' | 'pdf' | 'file';
  title: string;
  content?: string;
  previewUrl?: string;
  mediaUrl?: string;
  fileSize?: string;
  duration?: string;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar: string;
  text: string;
  timestamp: string;
  attachments?: ChatAttachment[];
  isDoubt?: boolean;
  isResolved?: boolean;
  subject?: SubjectName;
  questionId?: string;
  reactions?: { [emoji: string]: number };
  replyTo?: {
    senderName: string;
    text: string;
  };
}

export interface ChatChannel {
  id: string;
  type: ChatChannelType;
  title: string;
  subtitle: string;
  subject?: SubjectName;
  teacherName?: string;
  teacherId?: string;
  teacherSubject?: SubjectName;
  linkedGroupId?: string;
  linkedTeacherChannelId?: string;
  standardClass?: string;
  batchId?: string;
  batchName?: string;
  classId?: string;
  studentName?: string;
  studentId?: string;
  parentName?: string;
  parentId?: string;
  moderatorId?: string;
  moderatorName?: string;
  peerSchoolConnectId?: string;
  participantIds: string[]; // User IDs (e.g. 'user_stu_1', 'user_par_1', 'user_tch_1')
  participantSchoolConnectIds?: string[]; // (e.g. 'SC-STU-4821', 'SC-PAR-1102')
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isDoubtChannel?: boolean;
  isResolved?: boolean;
  isOnline?: boolean;
  isPinned?: boolean;
}

export interface StudentSyllabusProgress {
  studentId: string;
  studentName: string;
  schoolConnectId: string;
  avatar: string;
  targetExam: ExamType;
  standardClass: string;
  enrolledBatch: string;
  enrolledBatchName: string;
  subjectProgress: {
    [key in SubjectName]?: {
      totalTopics: number;
      completedTopics: number;
      percentage: number;
      needsRevisionCount: number;
      lastActiveDate: string;
    };
  };
  chapters: SyllabusChapter[];
}
