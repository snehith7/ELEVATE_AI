import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Search,
  Eye,
  Send,
  Database,
  RefreshCw,
  BarChart3,
  Flame,
  UserCheck,
  Code2
} from 'lucide-react';
import { AdminOverview, Submission, DatabaseStatus } from '../types';

interface AdminViewProps {
  onOpenDbModal: () => void;
  dbStatus: DatabaseStatus | null;
  onOpenAiGenerator: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  onOpenDbModal,
  dbStatus,
  onOpenAiGenerator
}) => {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [studentDetails, setStudentDetails] = useState<{ user: any; submissions: Submission[] } | null>(null);
  const [inspectSubmission, setInspectSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOverview = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/overview');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to fetch admin overview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleInspectStudent = async (student: any) => {
    setSelectedStudent(student);
    try {
      const res = await fetch(`/api/admin/student/${student.id}`);
      const json = await res.json();
      setStudentDetails(json);
    } catch (err) {
      console.error('Failed to fetch student details:', err);
    }
  };

  const filteredStudents = data?.students.filter(s =>
    s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.skillLevel?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-100">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-900 border border-purple-900/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Academy Admin & Faculty Portal</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Student Performance Surveillance & Diagnostics</h1>
          <p className="text-xs text-slate-400">
            Monitor individual student coding talent, pass rates, recurring struggle areas, and assign targeted AI practice.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchOverview}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </button>

          <button
            onClick={onOpenDbModal}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors"
          >
            <Database className="w-3.5 h-3.5" />
            <span>MongoDB Database Engine</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Enrolled Students</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{data?.metrics.totalStudents ?? '...'}</div>
          <div className="text-[11px] text-slate-500 mt-1">Active learners</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Curriculum Problems</span>
            <Award className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{data?.metrics.totalProblems ?? '...'}</div>
          <div className="text-[11px] text-slate-500 mt-1">Basic to Advanced</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Submissions</span>
            <Code2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{data?.metrics.totalSubmissions ?? '...'}</div>
          <div className="text-[11px] text-slate-500 mt-1">Automated tests ran</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Overall Pass Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{data?.metrics.overallPassRate ?? '...'}%</div>
          <div className="text-[11px] text-slate-500 mt-1">Across all tiers</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>AI Synthesized</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300">{data?.metrics.aiProblemsGenerated ?? '...'}</div>
          <div className="text-[11px] text-slate-500 mt-1">Adaptive questions</div>
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">Student Cohort Performance Matrix</h3>
            <p className="text-xs text-slate-400">
              Review accuracy metrics, streak consistency, and observed difficulty areas for each student.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 max-w-xs">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by student name or email..."
              className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
            />
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-3">Skill Level</th>
                <th className="py-3 px-3">Preferred Lang</th>
                <th className="py-3 px-3">Problems Solved</th>
                <th className="py-3 px-3">Submissions</th>
                <th className="py-3 px-3">Pass Rate</th>
                <th className="py-3 px-3">Detected Struggles</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 font-normal">
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center text-xs">
                        {student.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div>{student.username}</div>
                        <div className="text-[11px] text-slate-500 font-normal">{student.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="capitalize px-2 py-0.5 rounded-full text-[11px] bg-slate-800 text-slate-300 border border-slate-700">
                      {student.skillLevel || 'Intermediate'}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 font-mono capitalize text-slate-300">
                    {student.preferredLanguage || 'JavaScript'}
                  </td>

                  <td className="py-3.5 px-3 font-mono font-bold text-emerald-400">
                    {student.totalSolved}
                  </td>

                  <td className="py-3.5 px-3 font-mono text-slate-400">
                    {student.totalSubmissions}
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full rounded-full"
                          style={{ width: `${student.passRate}%` }}
                        ></div>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-slate-200">{student.passRate}%</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="flex flex-wrap gap-1">
                      {student.struggleCategories?.map((cat: string, i: number) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleInspectStudent(student)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/40 transition-colors text-xs font-semibold cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* STUDENT DETAIL MODAL */}
      {selectedStudent && studentDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-indigo-950/40 to-slate-900 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                  {selectedStudent.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{selectedStudent.username}</h3>
                  <p className="text-xs text-slate-400">{selectedStudent.email} • {selectedStudent.targetGoal}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedStudent(null);
                  setStudentDetails(null);
                }}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                  <div className="text-[11px] text-slate-400">Total Solved</div>
                  <div className="text-lg font-bold text-emerald-400">{selectedStudent.totalSolved}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                  <div className="text-[11px] text-slate-400">Submissions</div>
                  <div className="text-lg font-bold text-white">{studentDetails.submissions.length}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                  <div className="text-[11px] text-slate-400">Pass Rate</div>
                  <div className="text-lg font-bold text-indigo-400">{selectedStudent.passRate}%</div>
                </div>
              </div>

              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] pt-2">
                Recent Submission Logs & Real-Time AI Reviews
              </h4>

              <div className="space-y-2.5">
                {studentDetails.submissions.length === 0 ? (
                  <div className="p-6 text-center text-slate-500">No submissions found for this student.</div>
                ) : (
                  studentDetails.submissions.map(sub => (
                    <div key={sub.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold flex items-center space-x-1 ${sub.status === 'accepted' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {sub.status === 'accepted' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                            <span className="capitalize">{sub.status.replace('_', ' ')}</span>
                          </span>
                          <span className="font-bold text-white text-xs">{sub.problemTitle}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(sub.createdAt).toLocaleDateString()} {new Date(sub.createdAt).toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-[11px] text-slate-400 font-mono">
                        <span>Language: {sub.language}</span>
                        <span>Passed: {sub.passedCases}/{sub.totalCases} cases</span>
                        <span>Runtime: {sub.executionTimeMs} ms</span>
                      </div>

                      {sub.aiReview && (
                        <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-800/30 text-indigo-200 text-[11px]">
                          <strong>AI Diagnostic: </strong>{sub.aiReview.summary}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end">
              <button
                onClick={() => {
                  setSelectedStudent(null);
                  setStudentDetails(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
