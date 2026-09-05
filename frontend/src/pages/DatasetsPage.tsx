import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Database, Upload, CheckCircle2, AlertTriangle, Plus, Calendar, UserCheck, Sparkles, X } from 'lucide-react';
import type { Student } from '../types';


export const DatasetsPage: React.FC = () => {
  const { datasets, activeDatasetId, setActiveDatasetId, getDrivesByDataset, addDatasetWithStudents } = useApp();

  // CSV Stepper Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [datasetName, setDatasetName] = useState('');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [rawCsvText, setRawCsvText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<Omit<Student, 'id' | 'datasetId'>[]>([]);
  const [validationErrors, setValidationErrors] = useState<{ row: number; msg: string }[]>([]);

  const handleLoadSampleCsv = () => {
    const sample = `rollNo,name,email,phone,branch,cgpa,tenthPercentage,twelfthPercentage,backlogs,graduationYear,gender
2027CSE001,Amit Verma,amit.v@college.edu,+91 9998887701,CSE,8.9,92.0,90.0,0,2027,Male
2027CSE002,Bhavna Sen,bhavna.s@college.edu,+91 9998887702,CSE,9.3,95.0,94.0,0,2027,Female
2027IT001,Chirag Shah,chirag.s@college.edu,+91 9998887703,IT,7.4,80.0,78.5,1,2027,Male
2027ECE001,Divya Roy,divya.r@college.edu,+91 9998887704,ECE,8.1,88.0,85.0,0,2027,Female
2027CSE003,Eshan Khan,eshan.k@college.edu,+91 9998887705,CSE,6.8,72.0,70.0,2,2027,Male`;

    setRawCsvText(sample);
    if (!datasetName) setDatasetName('Batch 2027 (Incoming Placement Batch)');
  };

  const processCsvParsing = () => {
    if (!rawCsvText.trim()) return;

    const lines = rawCsvText.trim().split('\n');
    if (lines.length < 2) return;

    const parsed: Omit<Student, 'id' | 'datasetId'>[] = [];
    const errors: { row: number; msg: string }[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(',').map((c) => c.trim());
      if (cols.length < 11) {
        errors.push({ row: i + 1, msg: 'Missing required columns in CSV row' });
        continue;
      }

      const rollNo = cols[0];
      const name = cols[1];
      const email = cols[2];
      const phone = cols[3];
      const branch = cols[4];
      const cgpa = parseFloat(cols[5]);
      const tenth = parseFloat(cols[6]);
      const twelfth = parseFloat(cols[7]);
      const backlogs = parseInt(cols[8], 10);
      const gradYear = parseInt(cols[9], 10);
      const gender = (cols[10] as 'Male' | 'Female' | 'Other') || 'Male';

      if (!rollNo || !name) {
        errors.push({ row: i + 1, msg: 'Roll number or Name is empty' });
      }

      if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
        errors.push({ row: i + 1, msg: `Invalid CGPA (${cols[5]}). Must be numeric (0-10)` });
      }

      parsed.push({
        rollNo,
        name,
        email,
        phone,
        branch,
        cgpa: isNaN(cgpa) ? 0 : cgpa,
        tenthPercentage: isNaN(tenth) ? 0 : tenth,
        twelfthPercentage: isNaN(twelfth) ? 0 : twelfth,
        backlogs: isNaN(backlogs) ? 0 : backlogs,
        graduationYear: isNaN(gradYear) ? 2027 : gradYear,
        gender,
      });
    }

    setParsedPreview(parsed);
    setValidationErrors(errors);
    setStep(2);
  };

  const handleFinalImport = () => {
    if (parsedPreview.length === 0 || !datasetName) return;

    addDatasetWithStudents(datasetName, academicYear, parsedPreview);
    setIsModalOpen(false);
    setStep(1);
    setRawCsvText('');
    setParsedPreview([]);
    setValidationErrors([]);
    setDatasetName('');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Student Datasets & CSV Import</h1>
          <p className="text-sm text-slate-400 mt-1">
            Upload, validate, and manage isolated batch datasets for placement drives.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Upload New Dataset (CSV)
        </button>
      </div>

      {/* Dataset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {datasets.map((ds) => {
          const drivesCount = getDrivesByDataset(ds.id).length;
          const isActive = ds.id === activeDatasetId;

          return (
            <div
              key={ds.id}
              className={`p-6 rounded-2xl border transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-br from-slate-800/90 to-indigo-950/40 border-indigo-500/50 shadow-xl shadow-indigo-500/10 scale-[1.01]'
                  : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-white transition-all ${
                      isActive ? 'bg-indigo-600 shadow-md shadow-indigo-500/30' : 'bg-slate-700/80'
                    }`}
                  >
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100">{ds.name}</h3>
                    <span className="text-xs text-slate-400 font-mono">ID: {ds.id}</span>
                  </div>
                </div>

                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                    ds.status === 'Active'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {ds.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 my-4">
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400">Total Students</div>
                  <div className="text-xl font-bold text-cyan-400 mt-0.5">{ds.totalStudents}</div>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400">Associated Drives</div>
                  <div className="text-xl font-bold text-emerald-400 mt-0.5">{drivesCount}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-700/40">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" /> {ds.academicYear}
                </span>
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-slate-500" /> {ds.uploadedBy}
                </span>
              </div>

              <button
                onClick={() => setActiveDatasetId(ds.id)}
                className={`w-full mt-4 text-xs font-semibold py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-slate-700/70 hover:bg-slate-700 text-slate-200 border border-slate-600/50'
                }`}
              >
                {isActive ? '✓ Active Dataset Context' : 'Set as Active Dataset'}
              </button>
            </div>
          );
        })}
      </div>

      {/* CSV Stepper Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <Upload className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-lg text-slate-100">Upload Student Dataset (CSV)</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Progress */}
            <div className="flex justify-around bg-slate-950/50 px-6 py-3 border-b border-slate-800 text-xs font-semibold">
              <span className={step >= 1 ? 'text-indigo-400 font-bold' : 'text-slate-500'}>
                1. Dataset Info & CSV
              </span>
              <span className={step >= 2 ? 'text-indigo-400 font-bold' : 'text-slate-500'}>
                2. Validation & Preview
              </span>
              <span className={step >= 3 ? 'text-indigo-400 font-bold' : 'text-slate-500'}>
                3. Confirm & Import
              </span>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Dataset / Batch Name *
                    </label>
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
                      placeholder="e.g. Batch 2027 (CSE/IT/ECE)"
                      value={datasetName}
                      onChange={(e) => setDatasetName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Academic Year *
                    </label>
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
                      placeholder="e.g. 2026-2027"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold text-slate-400">CSV Data Content *</label>
                      <button
                        onClick={handleLoadSampleCsv}
                        className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Load Preset Sample CSV
                      </button>
                    </div>
                    <textarea
                      rows={5}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
                      placeholder="Paste CSV rows with headers..."
                      value={rawCsvText}
                      onChange={(e) => setRawCsvText(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                  {validationErrors.length > 0 && (
                    <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3.5 text-rose-300 text-xs">
                      <div className="flex items-center gap-2 font-semibold mb-1">
                        <AlertTriangle className="w-4 h-4 text-rose-400" /> Validation Warnings Found
                      </div>
                      <ul className="list-disc list-inside space-y-0.5">
                        {validationErrors.map((err, idx) => (
                          <li key={idx}>Row {err.row}: {err.msg}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-semibold text-slate-200 mb-2">
                      Parsed Preview ({parsedPreview.length} Student Records)
                    </h4>
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
                          {parsedPreview.slice(0, 5).map((s, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/40">
                              <td className="p-2.5 font-mono text-cyan-400">{s.rollNo}</td>
                              <td className="p-2.5 font-medium">{s.name}</td>
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
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-950/40">
              {step > 1 && (
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                >
                  Back
                </button>
              )}
              {step === 1 && (
                <button
                  disabled={!datasetName || !rawCsvText}
                  onClick={processCsvParsing}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-md transition-all"
                >
                  Process & Validate CSV
                </button>
              )}
              {step === 2 && (
                <button
                  onClick={handleFinalImport}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" /> Confirm & Import Dataset
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
