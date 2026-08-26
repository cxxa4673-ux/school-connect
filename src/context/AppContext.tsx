import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  AccountType,
  ExamType,
  SubjectName,
  Institution,
  Question,
  Test,
  TestAttempt,
  SyllabusChapter,
  DailyGoal,
  BookmarkItem,
  NCERTResource,
  AIChatMessage,
  ChatChannel,
  ChatMessage,
  ChatAttachment,
  StudentSyllabusProgress,
} from '../types';
import {
  INITIAL_PROFILES,
  INITIAL_INSTITUTION,
  SAMPLE_QUESTIONS,
  INITIAL_TESTS,
  INITIAL_TEST_ATTEMPTS,
  INITIAL_SYLLABUS,
  INITIAL_DAILY_GOALS,
  INITIAL_BOOKMARKS,
  INITIAL_NCERT_RESOURCES,
  INITIAL_CHANNELS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_STUDENT_SYLLABUS_RECORDS,
  CLASSMATE_DIRECTORY,
  TEACHERS_DIRECTORY,
  STUDENT_PARENT_DIRECTORY,
  TeacherDirectoryItem,
  StudentParentDirectoryItem,
} from '../data/mockData';

export type AppView =
  | 'dashboard'
  | 'study'
  | 'revise'
  | 'pyq'
  | 'test-series'
  | 'cbt-engine'
  | 'cbt-live'
  | 'test-result'
  | 'ncert'
  | 'syllabus'
  | 'doubt-chat'
  | 'chat'
  | 'history'
  | 'bookmarks'
  | 'daily-goals'
  | 'parent-mirror'
  | 'parent-reports'
  | 'parent-link'
  | 'parent-tests'
  | 'teacher-portal'
  | 'teacher-batches'
  | 'teacher-create-question'
  | 'teacher-create-q'
  | 'teacher-doubts'
  | 'teacher-marketplace'
  | 'institution-portal'
  | 'institution-batches'
  | 'institution-students'
  | 'institution-faculty'
  | 'institution-tests';

interface AppContextType {
  // Navigation & View
  currentView: AppView;
  setCurrentView: (view: AppView) => void;

  // User & Auth
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  switchRole: (role: UserRole) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  deleteCurrentUserData: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  isRoleSheetOpen: boolean;
  setIsRoleSheetOpen: (open: boolean) => void;

  // Exam Target
  currentExam: ExamType;
  setCurrentExam: (exam: ExamType) => void;

  // Institutions & Relationships
  institution: Institution;
  updateInstitution: (updates: Partial<Institution>) => void;
  linkChildById: (schoolConnectId: string) => boolean;
  addStudentToInstitution: (studentId: string, batchId: string) => boolean;
  addTeacherToInstitution: (teacherId: string) => boolean;

  // Tests & CBT Engine
  tests: Test[];
  activeTest: Test | null;
  startCBTTest: (test: Test) => void;
  currentAttempt: TestAttempt | null;
  submitTestAttempt: (attempt: TestAttempt) => void;
  viewAttemptResult: (attempt: TestAttempt) => void;
  testAttempts: TestAttempt[];

  // PYQs & Questions
  questions: Question[];
  addNewQuestion: (question: Question) => void;

  // Syllabus Tracker & Student Records
  syllabus: SyllabusChapter[];
  studentSyllabusRecords: StudentSyllabusProgress[];
  toggleTopicCompletion: (chapterId: string, topicId: string) => void;
  updateChapterStatus: (chapterId: string, status: SyllabusChapter['status']) => void;
  updateStudentSyllabusTopic: (studentId: string, chapterId: string, topicId: string) => void;

  // Doubt Chat System & Communication Routing
  channels: ChatChannel[];
  activeChannelId: string;
  setActiveChannelId: (id: string) => void;
  chatMessages: Record<string, ChatMessage[]>;
  sendMessage: (
    channelId: string,
    text: string,
    attachments?: ChatAttachment[],
    doubtMeta?: { isDoubt?: boolean; subject?: SubjectName; questionId?: string }
  ) => void;
  resolveDoubt: (channelId: string, messageId?: string) => void;
  openChatWithTeacher: (subject: SubjectName, teacherName?: string, doubtText?: string, questionRef?: Question) => void;
  openChatWithParent: () => void;
  openClassGroupChat: (subject?: SubjectName) => void;
  addPeerChatByUniqueId: (uniqueId: string) => { success: boolean; channelId?: string; message: string };
  openChatWithClassmate: (channelId: string) => void;
  openChatWithTeacherForParent: (teacher: TeacherDirectoryItem) => void;
  openChatWithParentForTeacher: (item: StudentParentDirectoryItem) => void;
  addTeacherChatByUniqueId: (uniqueId: string) => { success: boolean; channelId?: string; message: string };
  addParentChatByUniqueId: (uniqueId: string) => { success: boolean; channelId?: string; message: string };

  // Bookmarks
  bookmarks: BookmarkItem[];
  toggleBookmark: (question: Question, note?: string, tag?: string) => void;
  isBookmarked: (questionId: string) => boolean;
  removeBookmark: (bookmarkId: string) => void;

  // Daily Goals
  dailyGoals: DailyGoal[];
  toggleGoal: (goalId: string) => void;
  addDailyGoal: (goal: Omit<DailyGoal, 'id' | 'userId'>) => void;

  // NCERT Resources
  ncertResources: NCERTResource[];

  // Navigation Sidebar Toggle (3-line hamburger menu)
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  toggleSidebar: () => void;

  // Connect AI Assistant
  isAIAssistantOpen: boolean;
  setIsAIAssistantOpen: (open: boolean) => void;
  aiMessages: AIChatMessage[];
  addAIMessage: (msg: Omit<AIChatMessage, 'id' | 'timestamp'>) => void;
  activeAIWeakness: string | null;
  setActiveAIWeakness: (topic: string | null) => void;
  triggerAIQuickPrompt: (promptText: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Local persistence helpers
  const loadLocal = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(`sc_${key}`);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  };

  const saveLocal = (key: string, data: any) => {
    try {
      localStorage.setItem(`sc_${key}`, JSON.stringify(data));
    } catch {
      // Fail silently without exposing data to console
    }
  };

  // State initialization
  const [currentUser, setCurrentUser] = useState<UserProfile>(() =>
    loadLocal('currentUser', INITIAL_PROFILES.student)
  );

  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [currentExam, setCurrentExam] = useState<ExamType>(() =>
    loadLocal('currentExam', 'JEE Main')
  );

  const [institution, setInstitution] = useState<Institution>(() =>
    loadLocal('institution', INITIAL_INSTITUTION)
  );

  const [tests, setTests] = useState<Test[]>(() =>
    loadLocal('tests', INITIAL_TESTS)
  );

  const [activeTest, setActiveTest] = useState<Test | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState<TestAttempt | null>(() =>
    loadLocal('currentAttempt', INITIAL_TEST_ATTEMPTS[0])
  );

  const [testAttempts, setTestAttempts] = useState<TestAttempt[]>(() =>
    loadLocal('testAttempts', INITIAL_TEST_ATTEMPTS)
  );

  const [questions, setQuestions] = useState<Question[]>(() =>
    loadLocal('questions', SAMPLE_QUESTIONS)
  );

  const [syllabus, setSyllabus] = useState<SyllabusChapter[]>(() =>
    loadLocal('syllabus', INITIAL_SYLLABUS)
  );

  const [studentSyllabusRecords, setStudentSyllabusRecords] = useState<StudentSyllabusProgress[]>(() =>
    loadLocal('studentSyllabusRecords', INITIAL_STUDENT_SYLLABUS_RECORDS)
  );

  // Doubt Chat System state
  const [channels, setChannels] = useState<ChatChannel[]>(() =>
    loadLocal('channels', INITIAL_CHANNELS)
  );

  const [activeChannelId, setActiveChannelId] = useState<string>(() =>
    loadLocal('activeChannelId', 'chan_stu_tch_phy')
  );

  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(() =>
    loadLocal('chatMessages', INITIAL_CHAT_MESSAGES)
  );

  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() =>
    loadLocal('bookmarks', INITIAL_BOOKMARKS)
  );

  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>(() =>
    loadLocal('dailyGoals', INITIAL_DAILY_GOALS)
  );

  const [ncertResources] = useState<NCERTResource[]>(INITIAL_NCERT_RESOURCES);

  // 3-Line Hamburger Menu Sidebar Toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    return loadLocal('isSidebarOpen', true);
  });

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  useEffect(() => saveLocal('isSidebarOpen', isSidebarOpen), [isSidebarOpen]);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isRoleSheetOpen, setIsRoleSheetOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [activeAIWeakness, setActiveAIWeakness] = useState<string | null>(null);

  const [aiMessages, setAiMessages] = useState<AIChatMessage[]>([
    {
      id: 'ai_msg_1',
      sender: 'ai',
      text: "Namaste Aarav! I am your Connect AI academic mentor. I noticed you scored 80% on your last CBT mock test, but lost marks in Ray Optics sign conventions. Would you like a 10-minute speed drill or a personalized formula cheat sheet?",
      timestamp: 'Just now',
      suggestedActions: [
        { label: 'Start 10-Min Optics Drill', action: 'START_AI_DRILL' },
        { label: 'View 7-Day Spaced Repetition Plan', action: 'VIEW_REVISION' },
      ],
      weaknessTag: 'Ray Optics Sign Convention',
    },
  ]);

  // Sync to local storage
  useEffect(() => saveLocal('currentUser', currentUser), [currentUser]);
  useEffect(() => saveLocal('currentExam', currentExam), [currentExam]);
  useEffect(() => saveLocal('institution', institution), [institution]);
  useEffect(() => saveLocal('tests', tests), [tests]);
  useEffect(() => saveLocal('testAttempts', testAttempts), [testAttempts]);
  useEffect(() => saveLocal('syllabus', syllabus), [syllabus]);
  useEffect(() => saveLocal('studentSyllabusRecords', studentSyllabusRecords), [studentSyllabusRecords]);
  useEffect(() => saveLocal('channels', channels), [channels]);
  useEffect(() => saveLocal('activeChannelId', activeChannelId), [activeChannelId]);
  useEffect(() => saveLocal('chatMessages', chatMessages), [chatMessages]);
  useEffect(() => saveLocal('bookmarks', bookmarks), [bookmarks]);
  useEffect(() => saveLocal('dailyGoals', dailyGoals), [dailyGoals]);

  // Switch role helper
  const switchRole = (role: UserRole) => {
    if (INITIAL_PROFILES[role]) {
      setCurrentUser(INITIAL_PROFILES[role]);
      // Adjust view if needed
      if (role === 'parent') setCurrentView('parent-mirror');
      else if (role === 'institution_admin') setCurrentView('institution-portal');
      else if (role === 'teacher') setCurrentView('teacher-portal');
      else setCurrentView('dashboard');
    }
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setCurrentUser((prev) => ({ ...prev, ...updates }));
  };

  // Complete User Account & Data Deletion Flow (Privacy & Right to Erasure)
  const deleteCurrentUserData = () => {
    try {
      // Clear all local stored entities
      localStorage.removeItem('sc_currentUser');
      localStorage.removeItem('sc_testAttempts');
      localStorage.removeItem('sc_bookmarks');
      localStorage.removeItem('sc_dailyGoals');
      localStorage.removeItem('sc_syllabus');
      localStorage.removeItem('sc_currentAttempt');
    } catch {
      // Ignore
    }

    // Reset in-memory state to clean initial guest template
    setCurrentUser(INITIAL_PROFILES.student);
    setTestAttempts(INITIAL_TEST_ATTEMPTS);
    setBookmarks(INITIAL_BOOKMARKS);
    setDailyGoals(INITIAL_DAILY_GOALS);
    setSyllabus(INITIAL_SYLLABUS);
    setCurrentAttempt(null);
    setCurrentView('dashboard');
  };

  const updateInstitution = (updates: Partial<Institution>) => {
    setInstitution((prev) => ({ ...prev, ...updates }));
  };

  // Unique ID Linking
  const linkChildById = (schoolConnectId: string): boolean => {
    const cleanId = schoolConnectId.trim().toUpperCase();
    if (!currentUser.linkedChildIds) {
      updateUserProfile({ linkedChildIds: [cleanId] });
      return true;
    }
    if (!currentUser.linkedChildIds.includes(cleanId)) {
      updateUserProfile({ linkedChildIds: [...currentUser.linkedChildIds, cleanId] });
      return true;
    }
    return false;
  };

  const addStudentToInstitution = (studentId: string, batchId: string): boolean => {
    setInstitution((prev) => {
      const updatedBatches = prev.batches.map((b) =>
        b.id === batchId ? { ...b, studentCount: b.studentCount + 1 } : b
      );
      return {
        ...prev,
        totalStudents: prev.totalStudents + 1,
        batches: updatedBatches,
      };
    });
    return true;
  };

  const addTeacherToInstitution = (teacherId: string): boolean => {
    if (!institution.teachers.includes(teacherId)) {
      setInstitution((prev) => ({
        ...prev,
        totalTeachers: prev.totalTeachers + 1,
        teachers: [...prev.teachers, teacherId],
      }));
      return true;
    }
    return false;
  };

  // Test Actions
  const startCBTTest = (test: Test) => {
    setActiveTest(test);
    setCurrentView('cbt-engine');
  };

  const submitTestAttempt = (attempt: TestAttempt) => {
    setTestAttempts((prev) => [attempt, ...prev]);
    setCurrentAttempt(attempt);
    setActiveTest(null);
    setCurrentView('test-result');
  };

  const viewAttemptResult = (attempt: TestAttempt) => {
    setCurrentAttempt(attempt);
    setCurrentView('test-result');
  };

  const addNewQuestion = (q: Question) => {
    setQuestions((prev) => [q, ...prev]);
  };

  // Syllabus Actions
  const toggleTopicCompletion = (chapterId: string, topicId: string) => {
    setSyllabus((prev) =>
      prev.map((ch) => {
        if (ch.id !== chapterId) return ch;
        const updatedTopics = ch.topics.map((t) =>
          t.id === topicId ? { ...t, completed: !t.completed } : t
        );
        const completedCount = updatedTopics.filter((t) => t.completed).length;
        let newStatus: SyllabusChapter['status'] = 'In Progress';
        if (completedCount === 0) newStatus = 'Not Started';
        else if (completedCount === updatedTopics.length) newStatus = 'Completed';

        return {
          ...ch,
          topics: updatedTopics,
          status: newStatus,
        };
      })
    );

    // Also sync to studentSyllabusRecords for the current student
    setStudentSyllabusRecords((prev) =>
      prev.map((record) => {
        if (record.studentId !== currentUser.id) return record;
        const updatedChapters = record.chapters.map((ch) => {
          if (ch.id !== chapterId) return ch;
          const updatedTopics = ch.topics.map((t) =>
            t.id === topicId ? { ...t, completed: !t.completed } : t
          );
          const completedCount = updatedTopics.filter((t) => t.completed).length;
          let newStatus: SyllabusChapter['status'] = 'In Progress';
          if (completedCount === 0) newStatus = 'Not Started';
          else if (completedCount === updatedTopics.length) newStatus = 'Completed';

          return { ...ch, topics: updatedTopics, status: newStatus };
        });

        // Recalculate subject progress
        const targetChapter = updatedChapters.find((c) => c.id === chapterId);
        const subject = targetChapter?.subject || 'Physics';
        const subChapters = updatedChapters.filter((c) => c.subject === subject);
        const totalTopics = subChapters.reduce((acc, c) => acc + c.topics.length, 0);
        const completedTopics = subChapters.reduce(
          (acc, c) => acc + c.topics.filter((t) => t.completed).length,
          0
        );
        const percentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

        return {
          ...record,
          chapters: updatedChapters,
          subjectProgress: {
            ...record.subjectProgress,
            [subject]: {
              totalTopics,
              completedTopics,
              percentage,
              needsRevisionCount: record.subjectProgress[subject]?.needsRevisionCount || 0,
              lastActiveDate: 'Just now',
            },
          },
        };
      })
    );
  };

  const updateStudentSyllabusTopic = (studentId: string, chapterId: string, topicId: string) => {
    setStudentSyllabusRecords((prev) =>
      prev.map((record) => {
        if (record.studentId !== studentId) return record;
        const updatedChapters = record.chapters.map((ch) => {
          if (ch.id !== chapterId) return ch;
          const updatedTopics = ch.topics.map((t) =>
            t.id === topicId ? { ...t, completed: !t.completed } : t
          );
          const completedCount = updatedTopics.filter((t) => t.completed).length;
          let newStatus: SyllabusChapter['status'] = 'In Progress';
          if (completedCount === 0) newStatus = 'Not Started';
          else if (completedCount === updatedTopics.length) newStatus = 'Completed';

          return { ...ch, topics: updatedTopics, status: newStatus };
        });

        const targetChapter = updatedChapters.find((c) => c.id === chapterId);
        const subject = targetChapter?.subject || 'Physics';
        const subChapters = updatedChapters.filter((c) => c.subject === subject);
        const totalTopics = subChapters.reduce((acc, c) => acc + c.topics.length, 0);
        const completedTopics = subChapters.reduce(
          (acc, c) => acc + c.topics.filter((t) => t.completed).length,
          0
        );
        const percentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

        return {
          ...record,
          chapters: updatedChapters,
          subjectProgress: {
            ...record.subjectProgress,
            [subject]: {
              totalTopics,
              completedTopics,
              percentage,
              needsRevisionCount: record.subjectProgress[subject]?.needsRevisionCount || 0,
              lastActiveDate: 'Just now',
            },
          },
        };
      })
    );
  };

  const updateChapterStatus = (chapterId: string, status: SyllabusChapter['status']) => {
    setSyllabus((prev) =>
      prev.map((ch) => (ch.id === chapterId ? { ...ch, status } : ch))
    );
  };

  // Doubt Chat System Actions
  const sendMessage = (
    channelId: string,
    text: string,
    attachments?: ChatAttachment[],
    doubtMeta?: { isDoubt?: boolean; subject?: SubjectName; questionId?: string }
  ) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      channelId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      senderAvatar: currentUser.avatar,
      text,
      timestamp: timeStr,
      attachments,
      isDoubt: doubtMeta?.isDoubt,
      subject: doubtMeta?.subject,
      questionId: doubtMeta?.questionId,
    };

    setChatMessages((prev) => ({
      ...prev,
      [channelId]: [...(prev[channelId] || []), newMsg],
    }));

    const previewSnippet = text || (attachments?.[0]?.title ? `📎 ${attachments[0].title}` : 'Sent an attachment');

    setChannels((prev) =>
      prev.map((ch) =>
        ch.id === channelId
          ? {
              ...ch,
              lastMessage: previewSnippet,
              lastMessageTime: timeStr,
              isResolved: doubtMeta?.isDoubt ? false : ch.isResolved,
            }
          : ch
      )
    );

    // Realistic Real-Time Auto-Response Simulator for Instant Feedback
    const targetChannel = channels.find((c) => c.id === channelId);
    if (targetChannel && currentUser.role === 'student') {
      setTimeout(() => {
        let replyText = '';
        let replySender = 'Dr. Vandana Rao';
        let replyRole: UserRole = 'teacher';
        let replyAvatar = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80';

        if (targetChannel.type === 'student_parent') {
          replySender = 'Rajesh Sharma (Papa)';
          replyRole = 'parent';
          replyAvatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80';
          replyText = 'Received, beta! Keep focusing on concepts and remember to take short breaks between study sessions.';
        } else if (targetChannel.type === 'student_teacher') {
          if (targetChannel.subject === 'Chemistry') {
            replySender = 'Prof. Alok Mukherjee';
            replyAvatar = 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80';
            replyText = 'Got your doubt! Review the step-by-step reaction intermediate mechanism. I’ll also review this in tomorrow’s class.';
          } else if (targetChannel.subject === 'Mathematics') {
            replySender = 'Er. Tarun Bansal';
            replyAvatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';
            replyText = 'Checked! Remember to apply symmetry properties when bounds are -a to a.';
          } else {
            replyText = 'Good question! Always pay close attention to optical medium refractive indices and sign conventions in Ray Optics.';
          }
        } else if (targetChannel.type === 'class_group') {
          replySender = targetChannel.moderatorName || 'Dr. Vandana Rao';
          replyRole = 'teacher';
          replyText = 'Thanks for bringing this up in the class group. Everyone please review chapter NCERT exemplar problem 3 as well.';
        }

        if (replyText) {
          const autoMsg: ChatMessage = {
            id: `msg_auto_${Date.now()}`,
            channelId,
            senderId: targetChannel.type === 'student_parent' ? 'user_par_1' : 'user_tch_1',
            senderName: replySender,
            senderRole: replyRole,
            senderAvatar: replyAvatar,
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

          setChatMessages((prev) => ({
            ...prev,
            [channelId]: [...(prev[channelId] || []), autoMsg],
          }));

          setChannels((prev) =>
            prev.map((ch) =>
              ch.id === channelId
                ? {
                    ...ch,
                    lastMessage: replyText,
                    lastMessageTime: 'Just now',
                  }
                : ch
            )
          );
        }
      }, 1400);
    }
  };

  const resolveDoubt = (channelId: string, messageId?: string) => {
    setChannels((prev) =>
      prev.map((ch) => (ch.id === channelId ? { ...ch, isResolved: true } : ch))
    );

    if (messageId) {
      setChatMessages((prev) => ({
        ...prev,
        [channelId]: (prev[channelId] || []).map((m) =>
          m.id === messageId ? { ...m, isResolved: true } : m
        ),
      }));
    }
  };

  const openChatWithTeacher = (
    subject: SubjectName,
    teacherName?: string,
    doubtText?: string,
    questionRef?: Question
  ) => {
    // Find matching teacher channel
    let chan = channels.find(
      (c) => c.type === 'student_teacher' && c.subject === subject
    );

    if (!chan) {
      // Fallback to first student_teacher channel
      chan = channels.find((c) => c.type === 'student_teacher') || channels[0];
    }

    if (chan) {
      setActiveChannelId(chan.id);
      setCurrentView('doubt-chat');

      if (doubtText || questionRef) {
        const attachments: ChatAttachment[] = questionRef
          ? [
              {
                id: `att_${Date.now()}`,
                type: 'question_ref',
                title: `Question Ref: ${questionRef.chapter} (${questionRef.examType} ${questionRef.year})`,
                content: questionRef.questionText,
              },
            ]
          : [];

        sendMessage(
          chan.id,
          doubtText || `Sir/Ma'am, I need clarification on this question from ${subject}.`,
          attachments,
          { isDoubt: true, subject, questionId: questionRef?.id }
        );
      }
    }
  };

  const openChatWithParent = () => {
    const chan = channels.find((c) => c.type === 'student_parent');
    if (chan) {
      setActiveChannelId(chan.id);
      setCurrentView('doubt-chat');
    }
  };

  const openClassGroupChat = (subject: SubjectName = 'Physics') => {
    const chan =
      channels.find((c) => c.type === 'class_group' && c.subject === subject) ||
      channels.find((c) => c.type === 'class_group') ||
      channels[0];
    if (chan) {
      setActiveChannelId(chan.id);
      setCurrentView('doubt-chat');
    }
  };

  const openChatWithClassmate = (channelId: string) => {
    setActiveChannelId(channelId);
    setCurrentView('doubt-chat');
  };

  const addPeerChatByUniqueId = (uniqueIdInput: string): { success: boolean; channelId?: string; message: string } => {
    const cleanId = uniqueIdInput.trim().toUpperCase();
    if (!cleanId) {
      return { success: false, message: 'Please enter a valid School-Connect Unique ID.' };
    }

    if (cleanId === currentUser.schoolConnectId) {
      return { success: false, message: 'You cannot initiate a chat with your own Unique ID.' };
    }

    // Check if channel already exists
    const existing = channels.find(
      (c) =>
        c.type === 'peer_student' &&
        (c.peerSchoolConnectId === cleanId || c.participantSchoolConnectIds?.includes(cleanId))
    );

    if (existing) {
      setActiveChannelId(existing.id);
      setCurrentView('doubt-chat');
      return { success: true, channelId: existing.id, message: `Chat with ${existing.title} opened.` };
    }

    // Lookup in known classmate directory
    const foundClassmate = CLASSMATE_DIRECTORY.find((cm) => cm.schoolConnectId === cleanId);

    const peerName = foundClassmate?.name || `Student (${cleanId})`;
    const peerAvatar =
      foundClassmate?.avatar ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanId}`;
    const peerSubtitle = foundClassmate
      ? `Classmate • ${cleanId} (${foundClassmate.standardClass})`
      : `Classmate • ${cleanId} (Apex Science Academy)`;

    const newChannelId = `chan_peer_${Date.now()}`;
    const newPeerChannel: ChatChannel = {
      id: newChannelId,
      type: 'peer_student',
      title: peerName,
      subtitle: peerSubtitle,
      peerSchoolConnectId: cleanId,
      participantIds: [currentUser.id, foundClassmate?.id || `user_${cleanId}`],
      participantSchoolConnectIds: [currentUser.schoolConnectId, cleanId],
      avatar: peerAvatar,
      lastMessage: 'Chat initiated. Say hello!',
      lastMessageTime: 'Just now',
      unreadCount: 0,
      isOnline: foundClassmate?.status === 'Online',
    };

    const initialMsg: ChatMessage = {
      id: `msg_init_${Date.now()}`,
      channelId: newChannelId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      senderAvatar: currentUser.avatar,
      text: `👋 Hi! I added you via School-Connect Unique ID (${cleanId}). Let’s share notes and discuss doubts!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChannels((prev) => [newPeerChannel, ...prev]);
    setChatMessages((prev) => ({
      ...prev,
      [newChannelId]: [initialMsg],
    }));

    setActiveChannelId(newChannelId);
    setCurrentView('doubt-chat');

    return {
      success: true,
      channelId: newChannelId,
      message: `Connected with ${peerName} (${cleanId})!`,
    };
  };

  const openChatWithTeacherForParent = (teacher: TeacherDirectoryItem) => {
    // Look for existing parent-teacher channel
    const existing = channels.find(
      (c) =>
        c.type === 'parent_teacher' &&
        (c.teacherId === teacher.id ||
          c.teacherName === teacher.name ||
          c.participantSchoolConnectIds?.includes(teacher.schoolConnectId))
    );

    if (existing) {
      setActiveChannelId(existing.id);
      setCurrentView('doubt-chat');
      return;
    }

    // Create new parent-to-teacher channel
    const newChanId = `chan_par_tch_${Date.now()}`;
    const newChannel: ChatChannel = {
      id: newChanId,
      type: 'parent_teacher',
      title: `${teacher.name} (${teacher.subject})`,
      subtitle: `${teacher.subject} Teacher of Aarav Sharma • Apex Academy`,
      subject: teacher.subject,
      teacherName: teacher.name,
      teacherId: teacher.id,
      studentName: 'Aarav Sharma',
      studentId: 'user_stu_1',
      parentName: currentUser.name,
      parentId: currentUser.id,
      standardClass: 'Class 12 - Section A',
      classId: 'class_12_a',
      batchName: 'JEE 2026 Pinnacle Alpha',
      participantIds: [currentUser.id, teacher.id],
      participantSchoolConnectIds: [currentUser.schoolConnectId, teacher.schoolConnectId],
      avatar: teacher.avatar,
      lastMessage: 'Direct parent-faculty channel connected.',
      lastMessageTime: 'Just now',
      unreadCount: 0,
      isOnline: teacher.status === 'Online',
    };

    const initialMsg: ChatMessage = {
      id: `msg_pt_init_${Date.now()}`,
      channelId: newChanId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: 'parent',
      senderAvatar: currentUser.avatar,
      text: `Namaste ${teacher.name}, I am ${currentUser.name} (Parent of Aarav Sharma). Connecting with you regarding Aarav’s academic progress and performance in ${teacher.subject}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChannels((prev) => [newChannel, ...prev]);
    setChatMessages((prev) => ({
      ...prev,
      [newChanId]: [initialMsg],
    }));

    setActiveChannelId(newChanId);
    setCurrentView('doubt-chat');
  };

  const openChatWithParentForTeacher = (item: StudentParentDirectoryItem) => {
    // Look for existing channel with this parent
    const existing = channels.find(
      (c) =>
        c.type === 'parent_teacher' &&
        (c.parentId === item.parentId ||
          c.participantSchoolConnectIds?.includes(item.parentSchoolConnectId) ||
          c.studentId === item.studentId)
    );

    if (existing) {
      setActiveChannelId(existing.id);
      setCurrentView('doubt-chat');
      return;
    }

    const newChanId = `chan_tch_par_${Date.now()}`;
    const newChannel: ChatChannel = {
      id: newChanId,
      type: 'parent_teacher',
      title: `${item.parentName} (${item.parentRelation})`,
      subtitle: `${item.parentRelation} of ${item.studentName} • ${item.standardClass} (${item.rollNo})`,
      subject: 'Physics',
      teacherName: currentUser.name,
      teacherId: currentUser.id,
      studentName: item.studentName,
      studentId: item.studentId,
      parentName: item.parentName,
      parentId: item.parentId,
      standardClass: item.standardClass,
      classId: item.classId,
      batchName: item.batchName,
      participantIds: [currentUser.id, item.parentId],
      participantSchoolConnectIds: [currentUser.schoolConnectId, item.parentSchoolConnectId],
      avatar: item.parentAvatar,
      lastMessage: `Connected with parent of ${item.studentName}.`,
      lastMessageTime: 'Just now',
      unreadCount: 0,
      isOnline: item.status === 'Online',
    };

    const initialMsg: ChatMessage = {
      id: `msg_tp_init_${Date.now()}`,
      channelId: newChanId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: 'teacher',
      senderAvatar: currentUser.avatar,
      text: `Namaste ${item.parentName}, I am ${currentUser.name} (Faculty at Apex Academy). Reaching out regarding ${item.studentName}’s class attendance and performance.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChannels((prev) => [newChannel, ...prev]);
    setChatMessages((prev) => ({
      ...prev,
      [newChanId]: [initialMsg],
    }));

    setActiveChannelId(newChanId);
    setCurrentView('doubt-chat');
  };

  const addTeacherChatByUniqueId = (uniqueIdInput: string): { success: boolean; channelId?: string; message: string } => {
    const cleanId = uniqueIdInput.trim().toUpperCase();
    if (!cleanId) {
      return { success: false, message: 'Please enter a valid Teacher School-Connect ID.' };
    }

    const foundTeacher = TEACHERS_DIRECTORY.find((t) => t.schoolConnectId === cleanId);
    if (foundTeacher) {
      openChatWithTeacherForParent(foundTeacher);
      return {
        success: true,
        message: `Connected with ${foundTeacher.name} (${foundTeacher.subject} Faculty)!`,
      };
    }

    // Generic Teacher fallback
    const genericTeacher: TeacherDirectoryItem = {
      id: `user_tch_${cleanId}`,
      name: `Faculty (${cleanId})`,
      subject: 'Physics',
      schoolConnectId: cleanId,
      qualifications: 'School Faculty',
      experience: 'Faculty',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanId}`,
      rating: 4.8,
      totalReviews: 24,
      bio: 'Assigned faculty member at Apex Science Academy',
      assignedChildName: 'Aarav Sharma',
      status: 'Online',
    };
    openChatWithTeacherForParent(genericTeacher);
    return {
      success: true,
      message: `Connected with faculty (${cleanId})!`,
    };
  };

  const addParentChatByUniqueId = (uniqueIdInput: string): { success: boolean; channelId?: string; message: string } => {
    const cleanId = uniqueIdInput.trim().toUpperCase();
    if (!cleanId) {
      return { success: false, message: 'Please enter a valid Parent/Student School-Connect ID.' };
    }

    const foundItem = STUDENT_PARENT_DIRECTORY.find(
      (sp) => sp.parentSchoolConnectId === cleanId || sp.studentSchoolConnectId === cleanId
    );

    if (foundItem) {
      openChatWithParentForTeacher(foundItem);
      return {
        success: true,
        message: `Connected with ${foundItem.parentName} (Parent of ${foundItem.studentName})!`,
      };
    }

    const genericItem: StudentParentDirectoryItem = {
      id: `sp_${cleanId}`,
      studentId: `stu_${cleanId}`,
      studentName: `Student (${cleanId})`,
      studentAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanId}`,
      studentSchoolConnectId: cleanId,
      parentId: `par_${cleanId}`,
      parentName: `Parent (${cleanId})`,
      parentAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanId}_par`,
      parentSchoolConnectId: cleanId,
      parentRelation: 'Guardian',
      parentPhone: '+91 98XXX XXXXX',
      standardClass: 'Class 12 - Section A',
      classId: 'class_12_a',
      batchName: 'Apex Science Academy',
      rollNo: 'Roll #--',
      status: 'Online',
    };
    openChatWithParentForTeacher(genericItem);
    return {
      success: true,
      message: `Connected with Parent (${cleanId})!`,
    };
  };

  // Bookmarks
  const toggleBookmark = (question: Question, note: string = '', tag: string = 'Important') => {
    setBookmarks((prev) => {
      const existing = prev.find((b) => b.questionId === question.id);
      if (existing) {
        return prev.filter((b) => b.questionId !== question.id);
      } else {
        const newBm: BookmarkItem = {
          id: `bm_${Date.now()}`,
          userId: currentUser.id,
          questionId: question.id,
          question,
          note,
          tag,
          savedAt: new Date().toISOString().split('T')[0],
        };
        return [newBm, ...prev];
      }
    });
  };

  const isBookmarked = (questionId: string) => {
    return bookmarks.some((b) => b.questionId === questionId);
  };

  const removeBookmark = (bookmarkId: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
  };

  // Daily Goals
  const toggleGoal = (goalId: string) => {
    setDailyGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const isDone = !g.isDone;
          return {
            ...g,
            isDone,
            completedCount: isDone ? g.targetCount : Math.max(0, g.completedCount - 1),
          };
        }
        return g;
      })
    );
  };

  const addDailyGoal = (goal: Omit<DailyGoal, 'id' | 'userId'>) => {
    const newGoal: DailyGoal = {
      ...goal,
      id: `dg_${Date.now()}`,
      userId: currentUser.id,
    };
    setDailyGoals((prev) => [newGoal, ...prev]);
  };

  // AI Chat
  const addAIMessage = (msg: Omit<AIChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: AIChatMessage = {
      ...msg,
      id: `msg_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setAiMessages((prev) => [...prev, newMsg]);
  };

  const triggerAIQuickPrompt = (promptText: string) => {
    setIsAIAssistantOpen(true);
    addAIMessage({ sender: 'user', text: promptText });
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        currentUser,
        setCurrentUser,
        switchRole,
        updateUserProfile,
        deleteCurrentUserData,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,
        isRoleSheetOpen,
        setIsRoleSheetOpen,
        currentExam,
        setCurrentExam,
        institution,
        updateInstitution,
        linkChildById,
        addStudentToInstitution,
        addTeacherToInstitution,
        tests,
        activeTest,
        startCBTTest,
        currentAttempt,
        submitTestAttempt,
        viewAttemptResult,
        testAttempts,
        questions,
        addNewQuestion,
        syllabus,
        studentSyllabusRecords,
        toggleTopicCompletion,
        updateChapterStatus,
        updateStudentSyllabusTopic,
        channels,
        activeChannelId,
        setActiveChannelId,
        chatMessages,
        sendMessage,
        resolveDoubt,
        openChatWithTeacher,
        openChatWithParent,
        openClassGroupChat,
        addPeerChatByUniqueId,
        openChatWithClassmate,
        openChatWithTeacherForParent,
        openChatWithParentForTeacher,
        addTeacherChatByUniqueId,
        addParentChatByUniqueId,
        bookmarks,
        toggleBookmark,
        isBookmarked,
        removeBookmark,
        dailyGoals,
        toggleGoal,
        addDailyGoal,
        ncertResources,
        isSidebarOpen,
        setIsSidebarOpen,
        toggleSidebar,
        isAIAssistantOpen,
        setIsAIAssistantOpen,
        aiMessages,
        addAIMessage,
        activeAIWeakness,
        setActiveAIWeakness,
        triggerAIQuickPrompt,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
