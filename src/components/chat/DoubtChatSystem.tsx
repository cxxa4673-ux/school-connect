import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { SubjectName, ChatChannelType, ChatAttachment, ChatMessage } from '../../types';
import {
  Search,
  Send,
  Paperclip,
  CheckCheck,
  User,
  Users,
  Heart,
  GraduationCap,
  HelpCircle,
  CheckCircle2,
  Lock,
  Plus,
  Image as ImageIcon,
  Code2,
  FileText,
  Mic,
  Video,
  Phone,
  PhoneCall,
  VideoOff,
  MicOff,
  MoreVertical,
  Smile,
  X,
  ArrowLeft,
  ChevronDown,
  Shield,
  ArrowRightLeft,
  Download,
  Share2,
  ExternalLink,
  UserPlus,
  Play,
  RotateCcw,
  School,
  Sparkles,
  BookOpen,
  Filter,
  Check,
  MessageSquare,
} from 'lucide-react';
import { AudioPlayerBubble } from './AudioPlayerBubble';
import { MediaLightboxModal } from './MediaLightboxModal';
import { AddClassmateModal } from './AddClassmateModal';
import { AddTeacherModal } from './AddTeacherModal';
import { AddParentModal } from './AddParentModal';
import {
  TEACHER_CLASSES,
  TeacherClassItem,
  TeacherDirectoryItem,
  StudentParentDirectoryItem,
} from '../../data/mockData';

export const DoubtChatSystem: React.FC = () => {
  const {
    currentUser,
    channels,
    activeChannelId,
    setActiveChannelId,
    chatMessages,
    sendMessage,
    resolveDoubt,
    questions,
    openChatWithTeacherForParent,
    openChatWithParentForTeacher,
    addTeacherChatByUniqueId,
    addParentChatByUniqueId,
    addPeerChatByUniqueId,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  
  // Tab state dynamically typed based on active role
  const [studentTab, setStudentTab] = useState<'all' | 'teachers' | 'groups' | 'classmates' | 'family'>('all');
  const [parentTab, setParentTab] = useState<'all' | 'teachers'>('all');
  const [teacherTab, setTeacherTab] = useState<'all' | 'parents' | 'students' | 'groups'>('all');

  // Teacher Class Switcher State
  const [selectedTeacherClassId, setSelectedTeacherClassId] = useState<string>('class_12_a');
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);

  const [inputText, setInputText] = useState('');
  
  // Modals & Drawers
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [selectedAttachType, setSelectedAttachType] = useState<'image' | 'video' | 'file' | 'formula' | 'question' | null>(null);
  const [isAddClassmateOpen, setIsAddClassmateOpen] = useState(false);
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [isAddParentOpen, setIsAddParentOpen] = useState(false);
  const [activeLightboxMedia, setActiveLightboxMedia] = useState<ChatAttachment | null>(null);
  
  // Call simulation state
  const [activeCall, setActiveCall] = useState<{ type: 'audio' | 'video'; name: string; avatar: string } | null>(null);
  const [callDuration, setCallDuration] = useState(0);

  // Voice recording state
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Attachment form states
  const [customTitle, setCustomTitle] = useState('');
  const [customContent, setCustomContent] = useState('');
  const [customMediaUrl, setCustomMediaUrl] = useState('');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(questions[0]?.id || '');

  // Emoji picker toggle
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageReactions, setMessageReactions] = useState<Record<string, string[]>>({});

  // Mobile navigation view toggle
  const [mobileChatView, setMobileChatView] = useState<'list' | 'chat'>('list');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Find currently active class details for teacher
  const currentTeacherClass = useMemo(() => {
    return TEACHER_CLASSES.find((c) => c.id === selectedTeacherClassId) || TEACHER_CLASSES[0];
  }, [selectedTeacherClassId]);

  // Filter channels based on role-specific logic, class selection & active tabs
  const visibleChannels = useMemo(() => {
    return channels.filter((ch) => {
      // 1. Role-specific filtering
      if (currentUser.role === 'student') {
        // Students see: their teachers, class groups, peer classmates, family
        const isParticipant =
          ch.participantIds.includes(currentUser.id) ||
          ch.type === 'student_teacher' ||
          ch.type === 'class_group' ||
          ch.type === 'student_parent' ||
          ch.type === 'peer_student';

        if (!isParticipant) return false;

        // Student Category Tabs
        if (studentTab === 'teachers' && ch.type !== 'student_teacher') return false;
        if (studentTab === 'groups' && ch.type !== 'class_group') return false;
        if (studentTab === 'classmates' && ch.type !== 'peer_student') return false;
        if (studentTab === 'family' && ch.type !== 'student_parent') return false;
      } else if (currentUser.role === 'parent') {
        // Parents ONLY see: their child's teachers and their child's direct channel
        const isParentRelevant =
          ch.type === 'parent_teacher' ||
          (ch.type === 'student_teacher' && ch.participantIds.includes(currentUser.id)) ||
          ch.type === 'student_parent';

        if (!isParentRelevant) return false;

        // Parent Category Tabs (Classmate, Group & Family tabs removed per prompt)
        if (parentTab === 'teachers' && ch.type !== 'parent_teacher' && ch.type !== 'student_teacher') {
          return false;
        }
      } else if (currentUser.role === 'teacher') {
        // Teachers see: parents, students, and class groups for their assigned/selected class
        const matchesClass =
          !ch.classId ||
          ch.classId === selectedTeacherClassId ||
          (selectedTeacherClassId === 'class_12_a' && !ch.classId && ch.type !== 'peer_student');

        if (!matchesClass) return false;

        const isTeacherRelevant =
          ch.type === 'parent_teacher' ||
          ch.type === 'student_teacher' ||
          ch.type === 'class_group';

        if (!isTeacherRelevant) return false;

        // Teacher Category Tabs (Classmate, Teacher & Family tabs removed per prompt; replaced with Parents, Students, Class Groups)
        if (teacherTab === 'parents' && ch.type !== 'parent_teacher') return false;
        if (teacherTab === 'students' && ch.type !== 'student_teacher') return false;
        if (teacherTab === 'groups' && ch.type !== 'class_group') return false;
      }

      // Search query filtering
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          ch.title.toLowerCase().includes(q) ||
          (ch.subject && ch.subject.toLowerCase().includes(q)) ||
          (ch.teacherName && ch.teacherName.toLowerCase().includes(q)) ||
          (ch.studentName && ch.studentName.toLowerCase().includes(q)) ||
          (ch.parentName && ch.parentName.toLowerCase().includes(q)) ||
          (ch.peerSchoolConnectId && ch.peerSchoolConnectId.toLowerCase().includes(q)) ||
          (ch.subtitle && ch.subtitle.toLowerCase().includes(q)) ||
          ch.lastMessage.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [channels, currentUser.role, currentUser.id, studentTab, parentTab, teacherTab, selectedTeacherClassId, searchQuery]);

  // Determine active channel
  const activeChannel = useMemo(() => {
    return channels.find((c) => c.id === activeChannelId) || visibleChannels[0] || null;
  }, [channels, activeChannelId, visibleChannels]);

  const currentMessages = activeChannel ? chatMessages[activeChannel.id] || [] : [];

  // When teacher switches class, ensure an appropriate channel in that class is selected
  const handleTeacherClassChange = (classItem: TeacherClassItem) => {
    setSelectedTeacherClassId(classItem.id);
    setIsClassDropdownOpen(false);

    // Find first channel matching this class
    const matchingChannel = channels.find((ch) => ch.classId === classItem.id);
    if (matchingChannel) {
      setActiveChannelId(matchingChannel.id);
    }
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length, activeChannelId]);

  // Voice recording timer
  useEffect(() => {
    let timer: any;
    if (isVoiceRecording) {
      timer = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isVoiceRecording]);

  // Call simulation timer
  useEffect(() => {
    let timer: any;
    if (activeCall) {
      timer = setInterval(() => setCallDuration((d) => d + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [activeCall]);

  const handleSelectChannel = (channelId: string) => {
    setActiveChannelId(channelId);
    setMobileChatView('chat');
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeChannel) return;

    sendMessage(activeChannel.id, inputText.trim(), undefined, {
      isDoubt: activeChannel.type === 'student_teacher',
      subject: activeChannel.subject,
    });
    setInputText('');
    setShowEmojiPicker(false);
  };

  const handleSendVoiceNote = () => {
    if (!activeChannel) return;
    setIsVoiceRecording(false);
    const duration = recordingSeconds > 0 ? `0:${recordingSeconds < 10 ? '0' : ''}${recordingSeconds}` : '0:25';
    
    const audioAttachment: ChatAttachment = {
      id: `att_voice_${Date.now()}`,
      type: 'audio',
      title: 'Voice Note Explanation',
      duration,
    };

    sendMessage(
      activeChannel.id,
      `🎙️ Voice Note (${duration})`,
      [audioAttachment],
      { isDoubt: activeChannel.type === 'student_teacher', subject: activeChannel.subject }
    );
  };

  const handleSendAttachment = () => {
    if (!activeChannel || !selectedAttachType) return;
    let attachments: ChatAttachment[] = [];
    let messageText = inputText.trim();

    if (selectedAttachType === 'image') {
      const imgUrl = customMediaUrl || 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=80';
      attachments.push({
        id: `att_img_${Date.now()}`,
        type: 'image',
        title: customTitle || 'Handwritten Notes & Diagram',
        previewUrl: imgUrl,
        mediaUrl: imgUrl,
        content: customContent || 'Optics sign conventions and focal length diagram',
      });
      if (!messageText) messageText = '📷 Shared diagram for discussion';
    } else if (selectedAttachType === 'video') {
      const vidUrl = customMediaUrl || 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&auto=format&fit=crop&q=80';
      attachments.push({
        id: `att_vid_${Date.now()}`,
        type: 'video',
        title: customTitle || 'Concept Video: Wave Interference 3D',
        previewUrl: vidUrl,
        duration: '02:40 min',
        content: customContent || 'Short video demonstration of fringe width calculation',
      });
      if (!messageText) messageText = '🎥 Attached video explanation clip';
    } else if (selectedAttachType === 'file') {
      attachments.push({
        id: `att_file_${Date.now()}`,
        type: 'pdf',
        title: customTitle || 'NCERT_Revision_Cheat_Sheet.pdf',
        fileSize: '2.4 MB',
      });
      if (!messageText) messageText = `📄 Shared document: ${customTitle || 'NCERT_Revision_Cheat_Sheet.pdf'}`;
    } else if (selectedAttachType === 'formula') {
      attachments.push({
        id: `att_form_${Date.now()}`,
        type: 'formula',
        title: customTitle || 'Lens Maker Formula in Variable Medium',
        content: customContent || '1/f = (μ_lens/μ_med - 1) × (1/R₁ - 1/R₂)',
      });
      if (!messageText) messageText = `📐 Shared equation: ${customTitle || 'Lens Maker Formula'}`;
    } else if (selectedAttachType === 'question') {
      const q = questions.find((item) => item.id === selectedQuestionId) || questions[0];
      if (q) {
        attachments.push({
          id: `att_q_${Date.now()}`,
          type: 'question_ref',
          title: `Question Ref: ${q.chapter} (${q.examType} ${q.year})`,
          content: q.questionText,
        });
        if (!messageText) messageText = `❓ Please explain step-by-step solution for ${q.subject} question.`;
      }
    }

    sendMessage(
      activeChannel.id,
      messageText,
      attachments,
      { isDoubt: activeChannel.type === 'student_teacher', subject: activeChannel.subject }
    );

    // Reset form
    setIsAttachModalOpen(false);
    setSelectedAttachType(null);
    setCustomTitle('');
    setCustomContent('');
    setCustomMediaUrl('');
    setInputText('');
  };

  // Toggle between 1-on-1 Personal Teacher Chat and Class Group for that subject
  const handleTogglePersonalOrGroup = () => {
    if (!activeChannel) return;

    if (activeChannel.type === 'student_teacher') {
      const targetGroup =
        (activeChannel.linkedGroupId && channels.find((c) => c.id === activeChannel.linkedGroupId)) ||
        channels.find((c) => c.type === 'class_group' && c.subject === activeChannel.subject);

      if (targetGroup) {
        setActiveChannelId(targetGroup.id);
      }
    } else if (activeChannel.type === 'class_group') {
      const targetTeacher =
        (activeChannel.linkedTeacherChannelId && channels.find((c) => c.id === activeChannel.linkedTeacherChannelId)) ||
        channels.find((c) => c.type === 'student_teacher' && c.subject === activeChannel.subject);

      if (targetTeacher) {
        setActiveChannelId(targetTeacher.id);
      }
    }
  };

  const handleAddEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    setMessageReactions((prev) => {
      const current = prev[messageId] || [];
      if (current.includes(emoji)) {
        return { ...prev, [messageId]: current.filter((e) => e !== emoji) };
      }
      return { ...prev, [messageId]: [...current, emoji] };
    });
  };

  const getChannelBadge = (type: ChatChannelType, subject?: SubjectName, standardClass?: string) => {
    switch (type) {
      case 'parent_teacher':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 flex items-center gap-1">
            <Users className="w-3 h-3 text-emerald-400" />
            <span>Parent-Faculty Link {subject ? `• ${subject}` : ''}</span>
          </span>
        );
      case 'student_teacher':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/25 flex items-center gap-1">
            <GraduationCap className="w-3 h-3 text-blue-400" />
            <span>1-on-1 Faculty {subject ? `• ${subject}` : ''}</span>
          </span>
        );
      case 'class_group':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 flex items-center gap-1">
            <Users className="w-3 h-3 text-indigo-400" />
            <span>Class Group {subject ? `• ${subject}` : ''}</span>
          </span>
        );
      case 'peer_student':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/25 flex items-center gap-1">
            <User className="w-3 h-3 text-purple-400" />
            <span>Classmate (P2P)</span>
          </span>
        );
      case 'student_parent':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/25 flex items-center gap-1">
            <Heart className="w-3 h-3 text-rose-400" />
            <span>Family Link</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div id="doubt-chat-system-container" className="max-w-7xl mx-auto pb-10">
      {/* Sleek WhatsApp/Instagram Style Messenger Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:grid md:grid-cols-12 min-h-[700px] max-h-[840px]">
        
        {/* ================= LEFT COLUMN: Chat List Sidebar (4 cols) ================= */}
        <div
          id="chat-sidebar-column"
          className={`md:col-span-4 border-r border-slate-800 flex flex-col bg-slate-950/70 ${
            mobileChatView === 'chat' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Top Bar: User Profile & Role-specific Add Button */}
          <div className="p-3.5 border-b border-slate-800/80 bg-slate-950 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-full object-cover border-2 border-indigo-500"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-white truncate flex items-center gap-1">
                  <span>Messages</span>
                </h2>
                <span className="text-[10px] font-mono text-slate-400 block truncate">
                  ID: <strong className="text-indigo-300">{currentUser.schoolConnectId}</strong>
                </span>
              </div>
            </div>

            {/* Role-Specific Action Button (Add Student, Add Teacher, or Add Parent) */}
            {currentUser.role === 'student' && (
              <button
                id="add-student-btn"
                type="button"
                onClick={() => setIsAddClassmateOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30 shrink-0"
                title="Add a classmate by Unique ID"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Student</span>
              </button>
            )}

            {currentUser.role === 'parent' && (
              <button
                id="add-teacher-btn"
                type="button"
                onClick={() => setIsAddTeacherOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/30 shrink-0"
                title="Contact Child's Subject Teachers"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Teacher</span>
              </button>
            )}

            {currentUser.role === 'teacher' && (
              <button
                id="add-parent-btn"
                type="button"
                onClick={() => setIsAddParentOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30 shrink-0"
                title="Message Student's Parent"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Parent</span>
              </button>
            )}
          </div>

          {/* Teacher-Only: Class Switcher Button (Same size, directly beneath the add button / top bar) */}
          {currentUser.role === 'teacher' && (
            <div className="px-3 pt-2.5 pb-1 relative">
              <button
                id="teacher-class-switcher-btn"
                type="button"
                onClick={() => setIsClassDropdownOpen((prev) => !prev)}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950/80 hover:from-slate-800 hover:to-indigo-900 text-slate-100 text-xs font-bold border border-indigo-500/30 hover:border-indigo-400 transition flex items-center justify-between shadow-sm"
                title="Switch teaching class batch"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
                    <School className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left truncate">
                    <span className="block text-[10px] text-indigo-300 font-semibold uppercase tracking-wider">
                      Teaching Class
                    </span>
                    <span className="text-xs font-bold text-white truncate block">
                      {currentTeacherClass.name}
                    </span>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-indigo-300 transition-transform ${isClassDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Class Dropdown Menu */}
              {isClassDropdownOpen && (
                <div
                  id="teacher-class-dropdown-menu"
                  className="absolute left-3 right-3 top-full mt-1.5 bg-slate-950 border border-indigo-500/40 rounded-2xl shadow-2xl z-30 overflow-hidden divide-y divide-slate-800/80 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="p-2.5 bg-slate-900/90 flex items-center justify-between text-[11px] text-slate-300 font-semibold">
                    <span>Select Teaching Batch</span>
                    <span className="text-indigo-400 font-mono text-[10px]">
                      {TEACHER_CLASSES.length} Classes Assigned
                    </span>
                  </div>

                  <div className="max-h-56 overflow-y-auto p-1.5 space-y-1">
                    {TEACHER_CLASSES.map((cls) => {
                      const isSelected = cls.id === selectedTeacherClassId;
                      return (
                        <button
                          key={cls.id}
                          type="button"
                          onClick={() => handleTeacherClassChange(cls)}
                          className={`w-full p-2.5 rounded-xl text-left transition flex items-center justify-between gap-2 text-xs ${
                            isSelected
                              ? 'bg-indigo-600 text-white font-bold shadow-sm'
                              : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{cls.name}</p>
                            <p className={`text-[10px] truncate ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                              {cls.subject} • {cls.studentCount} Students • {cls.schedule}
                            </p>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Search Bar & Role-Filtered Category Tabs */}
          <div className="p-3 border-b border-slate-800/60 space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="search-chat-input"
                type="text"
                placeholder={
                  currentUser.role === 'parent'
                    ? "Search child's teachers & doubts..."
                    : currentUser.role === 'teacher'
                    ? "Search parents, students, questions..."
                    : "Search teachers, classmates, doubts..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* 1. STUDENT FILTER TABS (All, Teachers, Groups, Classmates, Family) */}
            {currentUser.role === 'student' && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                <button
                  type="button"
                  onClick={() => setStudentTab('all')}
                  className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition ${
                    studentTab === 'all'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setStudentTab('teachers')}
                  className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition flex items-center gap-1 ${
                    studentTab === 'teachers'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>👨‍🏫 Teachers</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStudentTab('groups')}
                  className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition flex items-center gap-1 ${
                    studentTab === 'groups'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>👥 Groups</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStudentTab('classmates')}
                  className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition flex items-center gap-1 ${
                    studentTab === 'classmates'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>🎓 Classmates</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStudentTab('family')}
                  className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition flex items-center gap-1 ${
                    studentTab === 'family'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>🏠 Family</span>
                </button>
              </div>
            )}

            {/* 2. PARENT FILTER TABS (Only All & Teachers — Classmate, Group & Family removed per user request) */}
            {currentUser.role === 'parent' && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                <button
                  type="button"
                  onClick={() => setParentTab('all')}
                  className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition ${
                    parentTab === 'all'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All Chats
                </button>
                <button
                  type="button"
                  onClick={() => setParentTab('teachers')}
                  className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition flex items-center gap-1 ${
                    parentTab === 'teachers'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>👨‍🏫 Child&apos;s Teachers</span>
                </button>
              </div>
            )}

            {/* 3. TEACHER FILTER TABS (All, Parents, Students, Class Groups — Classmate, Teacher & Family removed per user request) */}
            {currentUser.role === 'teacher' && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                <button
                  type="button"
                  onClick={() => setTeacherTab('all')}
                  className={`px-2.5 py-1 rounded-full font-bold whitespace-nowrap transition ${
                    teacherTab === 'all'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setTeacherTab('parents')}
                  className={`px-2.5 py-1 rounded-full font-bold whitespace-nowrap transition flex items-center gap-1 ${
                    teacherTab === 'parents'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>👨‍👩‍👧 Parents</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTeacherTab('students')}
                  className={`px-2.5 py-1 rounded-full font-bold whitespace-nowrap transition flex items-center gap-1 ${
                    teacherTab === 'students'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>🎓 Students</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTeacherTab('groups')}
                  className={`px-2.5 py-1 rounded-full font-bold whitespace-nowrap transition flex items-center gap-1 ${
                    teacherTab === 'groups'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>👥 Class Group</span>
                </button>
              </div>
            )}
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40 p-2 space-y-1">
            {visibleChannels.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
                <p>No chats found in this category.</p>
                {currentUser.role === 'student' && (
                  <button
                    type="button"
                    onClick={() => setIsAddClassmateOpen(true)}
                    className="mt-3 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl"
                  >
                    Add a Classmate by Unique ID
                  </button>
                )}
                {currentUser.role === 'parent' && (
                  <button
                    type="button"
                    onClick={() => setIsAddTeacherOpen(true)}
                    className="mt-3 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl"
                  >
                    Contact Child&apos;s Teachers
                  </button>
                )}
                {currentUser.role === 'teacher' && (
                  <button
                    type="button"
                    onClick={() => setIsAddParentOpen(true)}
                    className="mt-3 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl"
                  >
                    Message a Parent
                  </button>
                )}
              </div>
            ) : (
              visibleChannels.map((channel) => {
                const isSelected = channel.id === activeChannel?.id;
                const msgs = chatMessages[channel.id] || [];
                const lastMsg = msgs[msgs.length - 1];

                return (
                  <div
                    key={channel.id}
                    id={`chat-channel-item-${channel.id}`}
                    onClick={() => handleSelectChannel(channel.id)}
                    className={`p-3 rounded-2xl cursor-pointer transition flex items-start gap-3 relative ${
                      isSelected
                        ? 'bg-indigo-600/20 border border-indigo-500/30'
                        : 'hover:bg-slate-900/70 border border-transparent'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <img
                        src={channel.avatar}
                        alt={channel.title}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-700 shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                      {channel.isOnline !== false && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
                      )}
                    </div>

                    {/* Chat metadata */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                          <span>{channel.title}</span>
                          {channel.isPinned && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                              PIN
                            </span>
                          )}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                          {lastMsg?.timestamp || channel.lastMessageTime}
                        </span>
                      </div>

                      {/* Prominent Student info badge next to parent for Teachers */}
                      {currentUser.role === 'teacher' && channel.type === 'parent_teacher' && channel.studentName && (
                        <div className="mb-1">
                          <span className="text-[10px] font-semibold text-blue-300 bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-800/40 inline-flex items-center gap-1">
                            <span>Child:</span>
                            <strong className="text-blue-100">{channel.studentName}</strong>
                          </span>
                        </div>
                      )}

                      <div className="mb-1">{getChannelBadge(channel.type, channel.subject, channel.standardClass)}</div>

                      <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                        {lastMsg && lastMsg.senderId === currentUser.id && (
                          <CheckCheck className="w-3 h-3 text-sky-400 shrink-0 inline" />
                        )}
                        <span>{lastMsg ? lastMsg.text : channel.lastMessage}</span>
                      </p>

                      {channel.isDoubtChannel && (
                        <div className="mt-1 flex items-center gap-1.5">
                          {channel.isResolved ? (
                            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Resolved
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/30 flex items-center gap-0.5">
                              <HelpCircle className="w-2.5 h-2.5" /> Open Doubt
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ================= RIGHT COLUMN: Active Chat Panel (8 cols) ================= */}
        <div
          id="chat-main-column"
          className={`md:col-span-8 flex flex-col h-full bg-slate-900/60 ${
            mobileChatView === 'list' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeChannel ? (
            <>
              {/* WhatsApp/Instagram Style Header */}
              <div className="p-3.5 sm:p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-3 shadow-md z-10">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Back button for mobile */}
                  <button
                    type="button"
                    onClick={() => setMobileChatView('list')}
                    className="md:hidden p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div className="relative shrink-0">
                    <img
                      src={activeChannel.avatar}
                      alt={activeChannel.title}
                      className="w-10 h-10 rounded-full object-cover border border-slate-700"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white truncate">
                        {activeChannel.title}
                      </h3>
                      {getChannelBadge(activeChannel.type, activeChannel.subject, activeChannel.standardClass)}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {activeChannel.subtitle || 'Active now'}
                    </p>
                  </div>
                </div>

                {/* Right Action Icons & Personal ↔ Group Toggle */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* 1-Click Switcher: Personal Doubt ↔ Class Group */}
                  {(activeChannel.type === 'student_teacher' || activeChannel.type === 'class_group') && (
                    <button
                      type="button"
                      onClick={handleTogglePersonalOrGroup}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition flex items-center gap-1.5 shadow-sm"
                      title={
                        activeChannel.type === 'student_teacher'
                          ? `Switch to ${activeChannel.subject || ''} Class Group`
                          : `Switch to 1-on-1 Teacher Chat`
                      }
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="hidden sm:inline">
                        {activeChannel.type === 'student_teacher' ? 'Class Group' : '1-on-1 Teacher'}
                      </span>
                    </button>
                  )}

                  {/* Audio Call Simulator */}
                  <button
                    type="button"
                    onClick={() =>
                      setActiveCall({
                        type: 'audio',
                        name: activeChannel.title,
                        avatar: activeChannel.avatar,
                      })
                    }
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    title="Audio Call"
                  >
                    <Phone className="w-4 h-4" />
                  </button>

                  {/* Video Call Simulator */}
                  <button
                    type="button"
                    onClick={() =>
                      setActiveCall({
                        type: 'video',
                        name: activeChannel.title,
                        avatar: activeChannel.avatar,
                      })
                    }
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    title="Video Call"
                  >
                    <Video className="w-4 h-4" />
                  </button>

                  {/* Resolve Doubt button for teachers */}
                  {activeChannel.type === 'student_teacher' && (
                    <button
                      type="button"
                      onClick={() => resolveDoubt(activeChannel.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                        activeChannel.isResolved
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white border-transparent'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">
                        {activeChannel.isResolved ? 'Resolved' : 'Mark Resolved'}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Chat Feed (WhatsApp Style Wallpaper & Bubble Tails) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] bg-slate-950/40">
                
                {/* Security End-to-End Encryption Banner */}
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center max-w-sm mx-auto">
                  <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1.5 font-medium">
                    <Lock className="w-3 h-3 text-amber-400" />
                    <span>
                      {activeChannel.type === 'parent_teacher'
                        ? 'Direct parent-faculty communication link.'
                        : activeChannel.type === 'student_parent'
                        ? 'Private encrypted parent channel. Visible to you & parent.'
                        : activeChannel.type === 'student_teacher'
                        ? '1-on-1 Academic Doubt. Visible to you & assigned teacher.'
                        : activeChannel.type === 'peer_student'
                        ? 'Peer student study chat. Safe & moderated.'
                        : 'Class subject group. Messages visible to batchmates.'}
                    </span>
                  </span>
                </div>

                {currentMessages.map((msg) => {
                  const isMine = msg.senderId === currentUser.id;
                  const reactions = messageReactions[msg.id] || [];

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 max-w-[85%] sm:max-w-[75%] group relative ${
                        isMine ? 'ml-auto flex-row-reverse' : ''
                      }`}
                    >
                      {/* Avatar */}
                      <img
                        src={msg.senderAvatar}
                        alt={msg.senderName}
                        className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0 mt-1"
                        referrerPolicy="no-referrer"
                      />

                      {/* Bubble with tail */}
                      <div className="space-y-1 relative">
                        {!isMine && (
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1">
                            <span className="font-bold text-slate-200">{msg.senderName}</span>
                            <span className="uppercase text-[8px] px-1 py-0.2 rounded bg-slate-800 text-indigo-300 font-mono">
                              {msg.senderRole}
                            </span>
                          </div>
                        )}

                        <div
                          className={`p-3.5 rounded-2xl text-xs leading-relaxed relative ${
                            isMine
                              ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/20'
                              : 'bg-slate-800/95 text-slate-100 border border-slate-700/80 rounded-tl-none shadow-md'
                          }`}
                        >
                          {/* Text message */}
                          {msg.text && <p className="whitespace-pre-line text-[13px]">{msg.text}</p>}

                          {/* Render Multimedia Attachments */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2.5 space-y-2 border-t border-white/15 pt-2">
                              {msg.attachments.map((att) => {
                                // 1. Audio Note
                                if (att.type === 'audio') {
                                  return (
                                    <AudioPlayerBubble
                                      key={att.id}
                                      duration={att.duration || '0:30'}
                                      isMine={isMine}
                                    />
                                  );
                                }

                                // 2. Image / Photo
                                if (att.type === 'image' && (att.previewUrl || att.mediaUrl)) {
                                  return (
                                    <div
                                      key={att.id}
                                      onClick={() => setActiveLightboxMedia(att)}
                                      className="cursor-pointer group/img relative rounded-xl overflow-hidden border border-slate-700"
                                    >
                                      <img
                                        src={att.previewUrl || att.mediaUrl}
                                        alt={att.title}
                                        className="max-h-56 w-full object-cover group-hover/img:scale-105 transition-transform duration-200"
                                        referrerPolicy="no-referrer"
                                      />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                                        <span>Click to Zoom</span>
                                      </div>
                                      {att.title && (
                                        <div className="p-1.5 bg-slate-950/80 text-[10px] text-slate-300 font-semibold truncate">
                                          📷 {att.title}
                                        </div>
                                      )}
                                    </div>
                                  );
                                }

                                // 3. Video
                                if (att.type === 'video') {
                                  return (
                                    <div
                                      key={att.id}
                                      onClick={() => setActiveLightboxMedia(att)}
                                      className="cursor-pointer relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 group/vid"
                                    >
                                      <img
                                        src={att.previewUrl || 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=500&auto=format&fit=crop&q=80'}
                                        alt={att.title}
                                        className="h-36 w-full object-cover opacity-70 group-hover/vid:opacity-90 transition-opacity"
                                        referrerPolicy="no-referrer"
                                      />
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-10 h-10 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-lg group-hover/vid:scale-110 transition-transform">
                                          <Play className="w-5 h-5 fill-current ml-0.5" />
                                        </div>
                                      </div>
                                      <div className="absolute bottom-0 inset-x-0 p-1.5 bg-slate-950/80 flex items-center justify-between text-[10px] text-white">
                                        <span className="font-semibold truncate">{att.title}</span>
                                        <span className="font-mono text-indigo-300">{att.duration || '02:40'}</span>
                                      </div>
                                    </div>
                                  );
                                }

                                // 4. File / PDF Document
                                if (att.type === 'file' || att.type === 'pdf') {
                                  return (
                                    <div
                                      key={att.id}
                                      className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/30 text-amber-200 flex items-center justify-between gap-3 shadow-inner"
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                                          <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-xs font-bold text-white truncate">{att.title}</p>
                                          <span className="text-[10px] text-slate-400 font-mono">
                                            {att.fileSize || 'PDF Document'}
                                          </span>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => alert(`Opening document: ${att.title}`)}
                                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold"
                                        title="Download/View PDF"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  );
                                }

                                // 5. Math Formula Card
                                if (att.type === 'formula') {
                                  return (
                                    <div
                                      key={att.id}
                                      className="p-3 rounded-xl bg-slate-950/90 border border-indigo-500/40 text-indigo-200 space-y-1.5"
                                    >
                                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                                        <Code2 className="w-3.5 h-3.5" />
                                        <span>{att.title}</span>
                                      </div>
                                      <div className="font-mono text-xs bg-slate-900 p-2.5 rounded-lg text-emerald-300 font-bold border border-slate-800 select-all">
                                        {att.content}
                                      </div>
                                    </div>
                                  );
                                }

                                // 6. Question Bank Reference
                                if (att.type === 'question_ref') {
                                  return (
                                    <div
                                      key={att.id}
                                      className="p-3 rounded-xl bg-slate-950/90 border border-blue-500/40 text-slate-300 space-y-1.5"
                                    >
                                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                                        <HelpCircle className="w-3.5 h-3.5" />
                                        <span>{att.title}</span>
                                      </div>
                                      <p className="text-[11px] text-slate-300 bg-slate-900 p-2 rounded-lg border border-slate-800 font-sans">
                                        &ldquo;{att.content}&rdquo;
                                      </p>
                                    </div>
                                  );
                                }

                                return null;
                              })}
                            </div>
                          )}

                          {/* Message Time & Ticks */}
                          <div
                            className={`flex items-center gap-1 justify-end text-[9px] mt-1 ${
                              isMine ? 'text-indigo-200' : 'text-slate-400'
                            }`}
                          >
                            <span>{msg.timestamp}</span>
                            {isMine && <CheckCheck className="w-3 h-3 text-sky-300" />}
                          </div>
                        </div>

                        {/* Floating Quick Reaction Trigger */}
                        <div
                          className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-1 ${
                            isMine ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {['👍', '🔥', '💡', '❤️', '👏'].map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => handleAddReaction(msg.id, emoji)}
                              className="text-xs hover:scale-125 transition-transform p-0.5 bg-slate-800/80 rounded-full"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>

                        {/* Display Reactions */}
                        {reactions.length > 0 && (
                          <div
                            className={`flex flex-wrap gap-1 mt-0.5 ${
                              isMine ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            {reactions.map((r, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-slate-800 border border-slate-700 px-1.5 py-0.2 rounded-full shadow-xs"
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* ================= INPUT FOOTER (WhatsApp / Insta Style) ================= */}
              <div className="p-3 bg-slate-950 border-t border-slate-800 relative z-20">
                {/* Voice Note Recording Live Bar */}
                {isVoiceRecording ? (
                  <div className="flex items-center justify-between gap-3 p-2 bg-rose-950/60 border border-rose-500/40 rounded-2xl animate-pulse">
                    <div className="flex items-center gap-2 text-rose-300 text-xs font-bold">
                      <Mic className="w-4 h-4 text-rose-400 animate-bounce" />
                      <span>Recording Voice Note...</span>
                      <span className="font-mono text-white">
                        00:{recordingSeconds < 10 ? '0' : ''}{recordingSeconds}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsVoiceRecording(false)}
                        className="px-3 py-1 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSendVoiceNote}
                        className="px-3 py-1 rounded-xl bg-rose-600 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-rose-600/30"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send Voice</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSend} className="flex items-center gap-2">
                    {/* Attach Media Menu Trigger */}
                    <button
                      type="button"
                      onClick={() => setIsAttachModalOpen(true)}
                      className="p-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition"
                      title="Attach Image, Video, File, Formula, Question"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    {/* Emoji Picker Button */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker((prev) => !prev)}
                        className="p-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition"
                        title="Add Emoji"
                      >
                        <Smile className="w-4 h-4" />
                      </button>

                      {/* Emoji Popup */}
                      {showEmojiPicker && (
                        <div className="absolute bottom-full left-0 mb-2 p-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-xl flex gap-2 z-30">
                          {['👍', '🔥', '💡', '✅', '❤️', '🤔', '❓', '📐', '🎯', '💯'].map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => handleAddEmoji(emoji)}
                              className="text-base hover:scale-125 transition-transform"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Main Input Text Field */}
                    <input
                      id="message-text-input"
                      type="text"
                      placeholder="Type a doubt, question, or message..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="flex-1 py-2.5 px-4 bg-slate-900 border border-slate-800 rounded-full text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />

                    {/* Voice Record or Send Button */}
                    {inputText.trim() ? (
                      <button
                        id="send-message-btn"
                        type="submit"
                        className="p-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition transform active:scale-95"
                        title="Send Message"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        id="record-voice-btn"
                        type="button"
                        onClick={() => setIsVoiceRecording(true)}
                        className="p-2.5 rounded-full bg-slate-900 hover:bg-rose-600 hover:text-white text-slate-400 transition transform active:scale-95 shadow-xs"
                        title="Record Voice Note"
                      >
                        <Mic className="w-4 h-4" />
                      </button>
                    )}
                  </form>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-300 mb-1">Select a Conversation</h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Choose a chat from the left sidebar to start messaging.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ================= MODALS & POPUPS ================= */}

      {/* MODAL 1: Multimedia Attachment Form Modal */}
      {isAttachModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-indigo-400" />
                <span>Add Rich Attachment to Doubt</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAttachModalOpen(false);
                  setSelectedAttachType(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Attachment Type Chooser */}
            <div className="grid grid-cols-5 gap-2">
              {[
                { type: 'image', label: 'Photo/Img', icon: ImageIcon, color: 'text-sky-400 bg-sky-950/60' },
                { type: 'video', label: 'Video Clip', icon: Video, color: 'text-indigo-400 bg-indigo-950/60' },
                { type: 'file', label: 'PDF Doc', icon: FileText, color: 'text-amber-400 bg-amber-950/60' },
                { type: 'formula', label: 'Formula', icon: Code2, color: 'text-emerald-400 bg-emerald-950/60' },
                { type: 'question', label: 'CBT PYQ', icon: HelpCircle, color: 'text-purple-400 bg-purple-950/60' },
              ].map((item) => {
                const Icon = item.icon;
                const isSel = selectedAttachType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setSelectedAttachType(item.type as any)}
                    className={`p-2.5 rounded-2xl flex flex-col items-center gap-1.5 border transition ${
                      isSel
                        ? 'border-indigo-500 bg-indigo-600/20 text-white font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic input fields based on chosen type */}
            {selectedAttachType === 'image' && (
              <div className="space-y-3 p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-sky-400" />
                  <span>Attach Photo / Handwritten Diagram</span>
                </h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Diagram Caption (e.g. Ray Optics Prism Refraction)"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500"
                  />
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-sky-500/30 flex items-center justify-between">
                    <span className="text-sky-300">Preset: High-Yield Diagram Sample</span>
                    <span className="text-[10px] text-slate-400">Ready</span>
                  </div>
                </div>
              </div>
            )}

            {selectedAttachType === 'video' && (
              <div className="space-y-3 p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-indigo-400" />
                  <span>Attach Concept Explanation Video</span>
                </h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Video Title (e.g. Young Double Slit 3D Animation)"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500"
                  />
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-indigo-500/30 flex items-center justify-between">
                    <span className="text-indigo-300">Preset: 3D Wave Interference Animation</span>
                    <span className="font-mono text-slate-400">02:40 min</span>
                  </div>
                </div>
              </div>
            )}

            {selectedAttachType === 'file' && (
              <div className="space-y-3 p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Attach Document / PDF Notes</span>
                </h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Document Name (e.g. Ray_Optics_High_Yield_Notes.pdf)"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500"
                  />
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/30 flex items-center justify-between">
                    <span className="text-amber-300">File Type: PDF Study Document</span>
                    <span className="font-mono text-slate-400">2.4 MB</span>
                  </div>
                </div>
              </div>
            )}

            {selectedAttachType === 'formula' && (
              <div className="space-y-3 p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <span>Attach Mathematical Formula / LaTeX</span>
                </h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Formula Name (e.g. Lens Maker Formula in Medium)"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500"
                  />
                  <textarea
                    rows={2}
                    placeholder="LaTeX equation (e.g. 1/f = (μ_lens/μ_med - 1) × (1/R₁ - 1/R₂))"
                    value={customContent}
                    onChange={(e) => setCustomContent(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-emerald-300 font-mono text-xs placeholder-slate-600"
                  />
                </div>
              </div>
            )}

            {selectedAttachType === 'question' && (
              <div className="space-y-3 p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-purple-400" />
                  <span>Attach CBT Test Question Reference</span>
                </h4>
                <select
                  value={selectedQuestionId}
                  onChange={(e) => setSelectedQuestionId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                >
                  {questions.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.subject}: {q.chapter} ({q.examType} {q.year})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Optional message input */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400">Add a caption / note:</label>
              <input
                type="text"
                placeholder="Type your remarks..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsAttachModalOpen(false);
                  setSelectedAttachType(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendAttachment}
                disabled={!selectedAttachType}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Attachment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Classmate by Unique ID (For Students) */}
      {isAddClassmateOpen && (
        <AddClassmateModal onClose={() => setIsAddClassmateOpen(false)} />
      )}

      {/* MODAL 3: Add Teacher Modal (For Parents) */}
      {isAddTeacherOpen && (
        <AddTeacherModal
          isOpen={isAddTeacherOpen}
          onClose={() => setIsAddTeacherOpen(false)}
          onSelectTeacher={(teacher: TeacherDirectoryItem) => {
            openChatWithTeacherForParent(teacher);
          }}
          onAddByUniqueId={(id: string) => addTeacherChatByUniqueId(id)}
          childName="Aarav Sharma"
        />
      )}

      {/* MODAL 4: Add Parent Modal (For Teachers - Displays respective student's name prominently) */}
      {isAddParentOpen && (
        <AddParentModal
          isOpen={isAddParentOpen}
          onClose={() => setIsAddParentOpen(false)}
          onSelectParent={(item: StudentParentDirectoryItem) => {
            openChatWithParentForTeacher(item);
          }}
          onAddByUniqueId={(id: string) => addParentChatByUniqueId(id)}
          activeClassId={selectedTeacherClassId}
        />
      )}

      {/* MODAL 5: Lightbox for Photos & Videos */}
      {activeLightboxMedia && (
        <MediaLightboxModal
          attachment={activeLightboxMedia}
          onClose={() => setActiveLightboxMedia(null)}
        />
      )}

      {/* MODAL 6: Audio / Video Calling Simulator */}
      {activeCall && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="space-y-2">
              <div className="relative w-24 h-24 mx-auto">
                <img
                  src={activeCall.avatar}
                  alt={activeCall.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500 shadow-2xl mx-auto"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse" />
              </div>
              <h3 className="text-lg font-black text-white">{activeCall.name}</h3>
              <p className="text-xs text-indigo-400 font-mono">
                {activeCall.type === 'video' ? 'Connecting Video Call...' : 'Connecting Academic Doubt Call...'}
              </p>
              <p className="text-sm font-mono text-slate-300 font-bold">
                00:{callDuration < 10 ? '0' : ''}{callDuration}
              </p>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                className="w-12 h-12 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
              >
                <MicOff className="w-5 h-5" />
              </button>
              {activeCall.type === 'video' && (
                <button
                  type="button"
                  className="w-12 h-12 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
                >
                  <VideoOff className="w-5 h-5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveCall(null)}
                className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg transform active:scale-95 transition"
              >
                <PhoneCall className="w-6 h-6 rotate-[135deg]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
