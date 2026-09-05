import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { PlacementDrive, Student } from '../types';
import { formatFilterDescription } from '../services/filterEngine';
import { Briefcase, Calendar, Download, Eye, Layers, Filter, CheckCircle2, X } from 'lucide-react';

export const DrivesPage: React.FC = () => {
  const { drives, datasets, getEligibleStudentsForDrive } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDrive, setSelectedDrive] = useState<PlacementDrive | null>(null);
  const [selectedDriveEligibleStudents, setSelectedDriveEligibleStudents] = useState<Student[]>([]);

  useEffect(() => {
    if (!selectedDrive) {
      setSelectedDriveEligibleStudents([]);
      return;
    }

    const res = getEligibleStudentsForDrive(selectedDrive.id);
    if (res instanceof Promise) {
      res.then((students) => setSelectedDriveEligibleStudents(students)).catch(() => setSelectedDriveEligibleStudents([]));
    } else {
      setSelectedDriveEligibleStudents(res);
    }
  }, [selectedDrive, getEligibleStudentsForDrive]);

  const filteredDrives = drives.filter((d) => {
    return (
      d.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleExportCsv = (drive: PlacementDrive, studentsList: Student[]) => {
    if (studentsList.length === 0) return;

    const headers = ['Roll No', 'Name', 'Email', 'Phone', 'Branch', 'CGPA', 'Backlogs'];
    const rows = studentsList.map((s) => [
      s.rollNo,
      `"${s.name}"`,
      s.email,
      s.phone,
      s.branch,
      s.cgpa,
      s.backlogs,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${drive.companyName.replace(/\s+/g, '_')}_Eligible_Students.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Placement Drive History & Eligibility Snapshots
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            View saved placement drives, inspect AST filter rules, and export snapshotted candidate lists.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-md">
        <input
          type="text"
          className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
          placeholder="Filter drives by company name or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Drives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrives.map((drive) => {
          const dataset = datasets.find((ds) => ds.id === drive.datasetId);

          return (
            <div
              key={drive.id}
              className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/60 transition-all duration-300 flex flex-col justify-between hover:scale-[1.01]"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">{drive.companyName}</h3>
                    <div className="text-xs font-semibold text-indigo-400 mt-0.5">{drive.role}</div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {drive.status}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mb-4">{drive.description}</p>

                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800 mb-4 text-xs">
                  <div>
                    <span className="text-slate-400">Package (CTC):</span>
                    <div className="text-base font-bold text-emerald-400 mt-0.5">₹{drive.ctcLpa} LPA</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Eligible Candidates:</span>
                    <div className="text-base font-bold text-cyan-400 mt-0.5">
                      {drive.eligibleCount} Students
                    </div>
                  </div>
                </div>

                {/* Filter Snapshot Badge */}
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs mb-4">
                  <div className="flex items-center gap-1.5 text-indigo-400 font-semibold mb-1">
                    <Filter className="w-3.5 h-3.5" /> Saved AST Criteria:
                  </div>
                  <div className="text-slate-300 font-mono text-[11px]">
                    {drive.filterSnapshot?.rules?.map((r) => formatFilterDescription(r)).join(' AND ') || 'No filters'}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-[11px] text-slate-400 pt-3 border-t border-slate-700/40 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" /> {drive.driveDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-slate-500" /> {dataset?.name || drive.datasetId}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedDrive(drive)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-xs font-semibold text-slate-100 border border-slate-600/50 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Eye className="w-4 h-4" /> Inspect Drive & Eligible Candidates
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drive Inspector Modal */}
      {selectedDrive && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedDrive(null);
          }}
          className="fixed inset-0 z-[100] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-scale-in cursor-default"
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <Briefcase className="w-6 h-6 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-lg text-slate-100">{selectedDrive.companyName}</h3>
                  <span className="text-xs text-slate-400">
                    Role: {selectedDrive.role} | CTC: ₹{selectedDrive.ctcLpa} LPA
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedDrive(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
                <div>
                  <div className="text-slate-400">Drive Date</div>
                  <div className="font-semibold text-slate-200 mt-0.5">{selectedDrive.driveDate}</div>
                </div>
                <div>
                  <div className="text-slate-400">Batch Dataset</div>
                  <div className="font-semibold text-cyan-400 mt-0.5">
                    {datasets.find((d) => d.id === selectedDrive.datasetId)?.name || selectedDrive.datasetId}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Eligible Count</div>
                  <div className="font-bold text-emerald-400 text-sm mt-0.5">
                    {selectedDriveEligibleStudents.length} Candidates
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-indigo-400" /> Persisted Filter Criteria (JSON AST Snapshot)
                </h4>
                <pre className="p-3 bg-slate-950 rounded-xl text-[11px] font-mono text-slate-300 border border-slate-800 max-h-32 overflow-y-auto">
                  {JSON.stringify(selectedDrive.filterSnapshot, null, 2)}
                </pre>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Snapshotted Eligible Candidates
                  </h4>

                  <button
                    onClick={() => handleExportCsv(selectedDrive, selectedDriveEligibleStudents)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Export Candidates (CSV)
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-48">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 font-semibold uppercase">
                      <tr>
                        <th className="p-2.5">Roll No</th>
                        <th className="p-2.5">Name</th>
                        <th className="p-2.5">Branch</th>
                        <th className="p-2.5">CGPA</th>
                        <th className="p-2.5">Backlogs</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      {selectedDriveEligibleStudents.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-800/40">
                          <td className="p-2.5 font-mono text-cyan-400 font-semibold">{s.rollNo}</td>
                          <td className="p-2.5">{s.name}</td>
                          <td className="p-2.5">{s.branch}</td>
                          <td className="p-2.5 font-bold">{s.cgpa}</td>
                          <td className="p-2.5">{s.backlogs}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex justify-end p-4 border-t border-slate-800 bg-slate-950/40">
              <button
                onClick={() => setSelectedDrive(null)}
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
