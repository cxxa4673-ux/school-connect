import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Building2, Users, GraduationCap, Plus, Search, CircleCheck as CheckCircle2, Star, Award, BookOpen, Calendar, Layers, ArrowUpRight, Shield, FileCheck, CircleAlert as AlertCircle } from 'lucide-react';
import { validateLinkedId } from '../../lib/validate';
import { STUDENT_PARENT_DIRECTORY, CLASSMATE_DIRECTORY } from '../../data/mockData';

interface InstitutionDashboardProps {
  initialTab?: 'batches' | 'students' | 'faculty' | 'tests';
}

export const InstitutionDashboard: React.FC<InstitutionDashboardProps> = ({ initialTab = 'batches' }) => {
  const { institution, updateInstitution, addStudentToInstitution, currentUser, tests, setCurrentView } = useApp();

  const [studentIdInput, setStudentIdInput] = useState('');
  const [selectedBatch, setSelectedBatch] = useState(institution.batches[0]?.id || '');
  const [enrollMsg, setEnrollMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Create-batch form state (real, persisted via updateInstitution).
  const [showCreateBatch, setShowCreateBatch] = useState(false);
  const [batchName, setBatchName] = useState('');
  const [batchExam, setBatchExam] = useState<'JEE Main' | 'JEE Advanced' | 'NEET UG' | 'CBSE Class 12'>('JEE Main');
  const [batchClass, setBatchClass] = useState('Class 12');
  const [batchSchedule, setBatchSchedule] = useState('Mon/Wed/Fri · 5-7 PM');
  const [batchMsg, setBatchMsg] = useState<string | null>(null);

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchName.trim()) return;
    const newBatch = {
      id: `batch_fac_${Date.now()}`,
      institutionId: institution.id,
      name: batchName.trim(),
      targetExam: batchExam,
      standardClass: batchClass,
      teacherName: currentUser.name,
      teacherId: currentUser.id,
      studentCount: 0,
      schedule: batchSchedule,
    };
    updateInstitution({ batches: [...institution.batches, newBatch] });
    setBatchMsg(`✅ Batch "${batchName.trim()}" created.`);
    setBatchName('');
    setShowCreateBatch(false);
    setTimeout(() => setBatchMsg(null), 3500);
  };

  const [activeTab, setActiveTab] = useState<'batches' | 'students' | 'faculty' | 'tests'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Known real student IDs (used to validate an enroll request in demo mode).
  const knownStudentIds = [
    ...CLASSMATE_DIRECTORY.map((c) => c.schoolConnectId),
    ...STUDENT_PARENT_DIRECTORY.map((s) => s.studentSchoolConnectId),
  ];

  const handleEnrollStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const check = validateLinkedId(studentIdInput, { expected: 'STU', directory: knownStudentIds });
    if (!check.valid) {
      setEnrollMsg({ ok: false, text: check.message });
      setTimeout(() => setEnrollMsg(null), 3500);
      return;
    }
    addStudentToInstitution(studentIdInput.toUpperCase(), selectedBatch);
    const batchName = institution.batches.find((b) => b.id === selectedBatch)?.name;
    setEnrollMsg({ ok: true, text: `Enrolled student ${studentIdInput.toUpperCase()} into ${batchName}` });
    setStudentIdInput('');
    setTimeout(() => setEnrollMsg(null), 3500);
  };

  const sampleEnrolledStudents = [
    { id: 'SC-STU-4821', name: 'Aarav Sharma', batch: 'JEE 2026 Pinnacle Alpha', accuracy: '80%', percentile: '96.4', attendance: '98%', status: 'Active' },
    { id: 'SC-STU-1092', name: 'Ishaan Verma', batch: 'JEE 2026 Pinnacle Alpha', accuracy: '84%', percentile: '98.1', attendance: '95%', status: 'Active' },
    { id: 'SC-STU-3321', name: 'Pooja Iyer', batch: 'NEET 2026 Target AIIMS', accuracy: '88%', percentile: '99.2', attendance: '100%', status: 'Active' },
    { id: 'SC-STU-7789', name: 'Rohan Mehra', batch: 'CBSE 12th Board Crash', accuracy: '76%', percentile: '91.0', attendance: '92%', status: 'Active' },
  ];

  const facultyProfiles = [
    {
      id: 'SC-TCH-3120',
      name: 'Dr. Vandana Rao',
      subject: 'Physics (JEE Advanced / NEET)',
      qualifications: 'Ph.D. Physics (IIT Delhi)',
      experience: '14+ Years',
      rating: 4.9,
      reviews: 184,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      specialty: 'Optics, Electrodynamics & Modern Physics',
    },
    {
      id: 'SC-TCH-4412',
      name: 'Prof. Alok Mukherjee',
      subject: 'Organic & Inorganic Chemistry',
      qualifications: 'M.Sc. Chemistry (BITS Pilani)',
      experience: '11+ Years',
      rating: 4.8,
      reviews: 142,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      specialty: 'Reaction Mechanisms & Coordination Compounds',
    },
    {
      id: 'SC-TCH-8819',
      name: 'Er. Sandeep Gulati',
      subject: 'Mathematics (Calculus & Algebra)',
      qualifications: 'B.Tech (IIT Bombay)',
      experience: '16+ Years',
      rating: 4.95,
      reviews: 230,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      specialty: 'Calculus, Definite Integrals & 3D Geometry',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Institution Banner */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border border-amber-500/30 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-slate-800 border border-amber-500/40 p-1 shrink-0 overflow-hidden">
            <img src={institution.logo} alt={institution.name} className="w-full h-full object-cover rounded-lg" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {institution.type}
              </span>
              <span className="text-xs text-slate-400 font-mono">Org ID: {institution.schoolConnectId}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
              {institution.name}
            </h1>
            <p className="text-xs text-slate-300">
              {institution.city} • Estd. {institution.establishedYear} • {institution.totalStudents} Enrolled Aspirants
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowCreateBatch((v) => !v)}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>{showCreateBatch ? 'Cancel' : 'Create New Batch'}</span>
          </button>
        </div>
      </div>

      {/* Create-batch form */}
      {showCreateBatch && (
        <form onSubmit={handleCreateBatch} className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-400 mb-1">Batch Name</label>
              <input
                type="text"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                placeholder="e.g. JEE 2027 Target 99+ Alpha"
                className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Target Exam</label>
              <select value={batchExam} onChange={(e: any) => setBatchExam(e.target.value)} className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200">
                <option>JEE Main</option>
                <option>JEE Advanced</option>
                <option>NEET UG</option>
                <option>CBSE Class 12</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Class</label>
              <input
                type="text"
                value={batchClass}
                onChange={(e) => setBatchClass(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-slate-400 mb-1">Schedule</label>
              <input
                type="text"
                value={batchSchedule}
                onChange={(e) => setBatchSchedule(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
          <button type="submit" className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs">
            Create Batch
          </button>
        </form>
      )}

      {batchMsg && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{batchMsg}</span>
        </div>
      )}

      {/* Enroll Student by Unique ID Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span>Add Student by Unique School-Connect ID</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Instantly sync independent candidate profiles and mock test histories to your institutional batches.
          </p>
        </div>

        <form onSubmit={handleEnrollStudent} className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Student ID (e.g. SC-STU-4821)"
            value={studentIdInput}
            onChange={(e) => setStudentIdInput(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-white placeholder-slate-500 uppercase focus:outline-none focus:border-blue-500"
          />
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            {institution.batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shrink-0 transition"
          >
            Enroll Student
          </button>
        </form>
      </div>

      {enrollMsg && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
            enrollMsg.ok
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {enrollMsg.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{enrollMsg.text}</span>
        </div>
      )}

      {/* Tabs: Batches | Students | Faculty Showcase | CBT Exams */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('batches')}
          className={`px-3.5 py-1.5 rounded-lg transition ${
            activeTab === 'batches' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Active Batches ({institution.batches.length})
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`px-3.5 py-1.5 rounded-lg transition ${
            activeTab === 'students' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Enrolled Students ({institution.totalStudents})
        </button>
        <button
          onClick={() => setActiveTab('faculty')}
          className={`px-3.5 py-1.5 rounded-lg transition ${
            activeTab === 'faculty' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Showcase Faculty ({facultyProfiles.length})
        </button>
        <button
          onClick={() => setActiveTab('tests')}
          className={`px-3.5 py-1.5 rounded-lg transition ${
            activeTab === 'tests' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Institute CBT Exams & Ranks
        </button>
      </div>

      {/* Tab: Institute Tests & Ranks */}
      {activeTab === 'tests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Institutional Mock Test Series & Batch Leaderboard</span>
            </h2>
            <button
              onClick={() => setCurrentView('test-series')}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
            >
              + Schedule Institute Test
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tests.slice(0, 2).map((t) => (
              <div key={t.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                      {t.targetExam} • {t.testType}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1.5">{t.title}</h3>
                  </div>
                  <span className="text-xs font-bold text-amber-400">All India Rank Sync</span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Appeared</span>
                    <strong className="text-white">1,240 Aspirants</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Campus Avg</span>
                    <strong className="text-emerald-400">188 / 300</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Campus Top Score</span>
                    <strong className="text-purple-400">284 / 300</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">Duration: {t.durationMinutes} mins</span>
                  <button
                    onClick={() => setCurrentView('history')}
                    className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 text-xs font-medium"
                  >
                    View Rank List & Analytics
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 1: Active Batches */}
      {activeTab === 'batches' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {institution.batches.map((batch) => (
            <div key={batch.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                    {batch.targetExam}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1.5">{batch.name}</h3>
                </div>
                <span className="text-xs font-mono text-slate-400 font-bold">{batch.studentCount} Students</span>
              </div>

              <div className="text-xs text-slate-300 space-y-1 pt-1 border-t border-slate-800">
                <p>
                  <span className="text-slate-400">Lead Faculty:</span> <strong>{batch.teacherName}</strong>
                </p>
                <p>
                  <span className="text-slate-400">Class:</span> {batch.standardClass}
                </p>
                <p className="text-[11px] text-slate-400 font-mono">{batch.schedule}</p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setCurrentView('test-series')}
                  className="flex-1 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
                >
                  Assign CBT Test
                </button>
                <button
                  onClick={() => setCurrentView('history')}
                  className="py-1.5 px-2.5 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-semibold transition"
                >
                  Report
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Enrolled Students */}
      {activeTab === 'students' && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Student Name & ID</th>
                <th className="py-2.5 px-3">Assigned Batch</th>
                <th className="py-2.5 px-3">Avg Accuracy</th>
                <th className="py-2.5 px-3">Percentile</th>
                <th className="py-2.5 px-3">Attendance</th>
                <th className="py-2.5 px-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sampleEnrolledStudents.map((stu) => (
                <tr key={stu.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3">
                    <div className="font-bold text-white">{stu.name}</div>
                    <div className="text-[10px] text-blue-400 font-mono">{stu.id}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{stu.batch}</td>
                  <td className="py-3 px-3 font-bold text-emerald-400">{stu.accuracy}</td>
                  <td className="py-3 px-3 font-mono text-purple-400">{stu.percentile}</td>
                  <td className="py-3 px-3 text-slate-300">{stu.attendance}</td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => setCurrentView('syllabus')}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-blue-300"
                    >
                      View Progress
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Faculty Showcase */}
      {activeTab === 'faculty' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {facultyProfiles.map((fac) => (
            <div key={fac.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <img src={fac.avatar} alt={fac.name} className="w-12 h-12 rounded-full object-cover border border-purple-500/40" />
                <div>
                  <h3 className="text-sm font-bold text-white">{fac.name}</h3>
                  <p className="text-[11px] text-purple-400 font-medium">{fac.subject}</p>
                  <span className="text-[10px] font-mono text-slate-400">{fac.id}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300">
                <strong>Education:</strong> {fac.qualifications} ({fac.experience})
              </p>
              <p className="text-xs text-slate-400">
                <strong>Focus:</strong> {fac.specialty}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <div className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{fac.rating}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({fac.reviews} reviews)</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                  Verified Faculty
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
