import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { Student, PlacementDrive, EligibilityRecord } from '../types';

import { Search, History, Award, CheckCircle, GraduationCap, Mail, Phone, X } from 'lucide-react';

export const StudentsPage: React.FC = () => {
  const { activeDataset, activeDatasetId, getStudentsByDataset, getStudentDriveHistory } = useApp();

  const students = useMemo(() => getStudentsByDataset(activeDatasetId), [activeDatasetId, getStudentsByDataset]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [minCgpa, setMinCgpa] = useState<number>(0);
  const [maxBacklogs, setMaxBacklogs] = useState<number>(10);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentDriveHistory, setStudentDriveHistory] = useState<{ drive: PlacementDrive; eligibilityRecord: EligibilityRecord }[]>([]);

  useEffect(() => {
    if (!selectedStudent) {
      setStudentDriveHistory([]);
      return;
    }

    const res = getStudentDriveHistory(selectedStudent.id);
    if (res instanceof Promise) {
      res.then((data) => setStudentDriveHistory(data)).catch(() => setStudentDriveHistory([]));
    } else {
      setStudentDriveHistory(res);
    }
  }, [selectedStudent, getStudentDriveHistory]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.branch.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBranch = selectedBranch === 'ALL' || s.branch === selectedBranch;
      const matchesCgpa = s.cgpa >= minCgpa;
      const matchesBacklogs = s.backlogs <= maxBacklogs;

      return matchesSearch && matchesBranch && matchesCgpa && matchesBacklogs;
    });
  }, [students, searchTerm, selectedBranch, minCgpa, maxBacklogs]);

  const branchesList = useMemo(() => {
    const set = new Set(students.map((s) => s.branch));
    return ['ALL', ...Array.from(set)];
  }, [students]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Student Directory ({activeDataset?.name || 'All Datasets'})
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse student records and inspect individual drive eligibility history.
          </p>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-md grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Search */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-indigo-400" /> Search Student
          </label>
          <input
            type="text"
            className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
            placeholder="Name, Roll No, Branch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Branch Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Branch Filter</label>
          <select
            className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            {branchesList.map((b) => (
              <option key={b} value={b}>
                {b === 'ALL' ? 'All Branches' : b}
              </option>
            ))}
          </select>
        </div>

        {/* Min CGPA */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            Min CGPA: <strong className="text-indigo-400">{minCgpa.toFixed(1)}</strong>
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            className="w-full accent-indigo-500 cursor-pointer"
            value={minCgpa}
            onChange={(e) => setMinCgpa(parseFloat(e.target.value))}
          />
        </div>

        {/* Max Backlogs */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Max Backlogs</label>
          <select
            className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
            value={maxBacklogs}
            onChange={(e) => setMaxBacklogs(parseInt(e.target.value, 10))}
          >
            <option value={10}>Any Backlogs</option>
            <option value={0}>0 Backlogs Only</option>
            <option value={1}>Max 1 Backlog</option>
            <option value={2}>Max 2 Backlogs</option>
          </select>
        </div>
      </div>

      {/* Student Data Table */}
      <div className="rounded-2xl border border-slate-700/60 overflow-hidden bg-slate-900/60 backdrop-blur-md shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/90 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Roll No</th>
                <th className="p-4">Student Name</th>
                <th className="p-4">Branch</th>
                <th className="p-4">CGPA</th>
                <th className="p-4">Backlogs</th>
                <th className="p-4">10th %</th>
                <th className="p-4">12th %</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-12 text-slate-400 text-sm">
                    No students match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-cyan-400">{s.rollNo}</td>
                    <td className="p-4 font-semibold text-slate-100">{s.name}</td>
                    <td className="p-4">
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                        {s.branch}
                      </span>
                    </td>
                    <td className="p-4">
                      <strong className={s.cgpa >= 8.0 ? 'text-emerald-400' : 'text-slate-200'}>
                        {s.cgpa.toFixed(2)}
                      </strong>
                    </td>
                    <td className="p-4">
                      {s.backlogs === 0 ? (
                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          0 Backlogs
                        </span>
                      ) : (
                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          {s.backlogs} Backlog(s)
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-300">{s.tenthPercentage}%</td>
                    <td className="p-4 text-slate-300">{s.twelfthPercentage}%</td>
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedStudent(s)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        <History className="w-3.5 h-3.5 text-indigo-400" /> Drive History
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Drive History Modal */}
      {selectedStudent && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedStudent(null);
          }}
          className="fixed inset-0 z-[100] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in cursor-default"
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-6 h-6 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-lg text-slate-100">{selectedStudent.name}</h3>
                  <span className="text-xs text-slate-400">
                    Roll No: {selectedStudent.rollNo} | {selectedStudent.branch} | CGPA: {selectedStudent.cgpa}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" /> {selectedStudent.email}
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" /> {selectedStudent.phone}
                </div>
              </div>

              <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" /> Eligible Placement Drives ({studentDriveHistory.length})
              </h4>

              {studentDriveHistory.length === 0 ? (
                <div className="text-center p-6 bg-slate-950/40 rounded-xl border border-slate-800 text-xs text-slate-400">
                  This student is not eligible for any registered drives yet.
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {studentDriveHistory.map(({ drive }) => (
                    <div
                      key={drive.id}
                      className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 flex justify-between items-center hover:border-slate-600 transition-all"
                    >
                      <div>
                        <div className="font-bold text-sm text-slate-100">{drive.companyName}</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Role: {drive.role} | Package: {drive.ctcLpa} LPA
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">Drive Date: {drive.driveDate}</div>
                      </div>

                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Eligible
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end p-4 border-t border-slate-800 bg-slate-950/40">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all cursor-pointer"
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
