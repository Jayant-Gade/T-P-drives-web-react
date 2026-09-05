import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Upload,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  X,
  FileText,
  ArrowRight,
  SlidersHorizontal,
  Table,
} from 'lucide-react';
import type { Student } from '../../types';

interface TargetFieldDef {
  key: keyof Omit<Student, 'id' | 'datasetId'>;
  label: string;
  required: boolean;
  type: 'string' | 'number';
  regex: RegExp;
  description: string;
}

const TARGET_FIELDS: TargetFieldDef[] = [
  { key: 'rollNo', label: 'Roll Number / Reg ID', required: true, type: 'string', regex: /roll|reg|id|enroll|student_id|uno|prn/i, description: 'Unique student identifier' },
  { key: 'name', label: 'Student Full Name', required: true, type: 'string', regex: /name|student_name|full_name|candidate/i, description: 'Full name of student' },
  { key: 'email', label: 'Email Address', required: true, type: 'string', regex: /email|mail|e-mail/i, description: 'Official or personal email' },
  { key: 'phone', label: 'Phone / Mobile No', required: false, type: 'string', regex: /phone|mobile|contact|tel|cell|number/i, description: 'Mobile contact number' },
  { key: 'branch', label: 'Branch / Department', required: true, type: 'string', regex: /branch|dept|department|stream|course|specialization/i, description: 'Academic stream (CSE, IT, ECE)' },
  { key: 'cgpa', label: 'CGPA / Pointer', required: true, type: 'number', regex: /cgpa|gpa|pointer|marks|percentage_cgpa/i, description: 'Current cumulative CGPA (0-10)' },
  { key: 'tenthPercentage', label: '10th Percentage (%)', required: false, type: 'number', regex: /10th|tenth|ssc|10_|class_10|matric/i, description: 'Secondary school percentage' },
  { key: 'twelfthPercentage', label: '12th / Diploma %', required: false, type: 'number', regex: /12th|twelfth|hsc|12_|class_12|diploma|puc/i, description: 'Higher secondary percentage' },
  { key: 'backlogs', label: 'Active Backlogs', required: true, type: 'number', regex: /backlog|back|arrear|fail|history_backlogs/i, description: 'Number of active backlogs' },
  { key: 'graduationYear', label: 'Graduation Year', required: false, type: 'number', regex: /grad|pass|batch|year|grad_year/i, description: 'Passing out batch year' },
  { key: 'gender', label: 'Gender', required: false, type: 'string', regex: /gender|sex/i, description: 'Male / Female / Other' },
];

interface CsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CsvUploadModal: React.FC<CsvUploadModalProps> = ({ isOpen, onClose }) => {
  const { addDatasetWithStudents } = useApp();

  // CSV Stepper Modal State (Steps: 1 = File/Text Input, 2 = Column Mapping, 3 = Validation & Preview)
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [datasetName, setDatasetName] = useState('');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [rawCsvText, setRawCsvText] = useState('');

  // Column Mapping State
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
  const [sampleRowValues, setSampleRowValues] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, number>>({});
  const [autoMatchedFields, setAutoMatchedFields] = useState<Record<string, boolean>>({});

  // Parsed Output State
  const [parsedPreview, setParsedPreview] = useState<Omit<Student, 'id' | 'datasetId'>[]>([]);
  const [validationErrors, setValidationErrors] = useState<{ row: number; msg: string }[]>([]);

  if (!isOpen) return null;

  const handleLoadSampleCsv = () => {
    const sample = `Roll No,Candidate Name,Email Address,Mobile Number,Department,CGPA Marks,10th Marks (%),12th Marks (%),Active Backlogs,Graduation Year,Gender
2027CSE001,Amit Verma,amit.v@college.edu,+91 9998887701,CSE,8.9,92.0,90.0,0,2027,Male
2027CSE002,Bhavna Sen,bhavna.s@college.edu,+91 9998887702,CSE,9.3,95.0,94.0,0,2027,Female
2027IT001,Chirag Shah,chirag.s@college.edu,+91 9998887703,IT,7.4,80.0,78.5,1,2027,Male
2027ECE001,Divya Roy,divya.r@college.edu,+91 9998887704,ECE,8.1,88.0,85.0,0,2027,Female
2027CSE003,Eshan Khan,eshan.k@college.edu,+91 9998887705,CSE,6.8,72.0,70.0,2,2027,Male`;

    setRawCsvText(sample);
    if (!datasetName) setDatasetName('Batch 2027 (Incoming Placement Batch)');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setRawCsvText(text);
        if (!datasetName) setDatasetName(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsText(file);
  };

  // Step 1 -> Step 2: Auto Detect Headers & Perform Regex Column Matching
  const startColumnMapping = () => {
    if (!rawCsvText.trim()) return;

    const lines = rawCsvText.trim().split('\n');
    if (lines.length < 2) return;

    const firstLine = lines[0];
    const delimiter = firstLine.includes('\t') ? '\t' : firstLine.includes(';') ? ';' : ',';

    const headers = firstLine.split(delimiter).map((h) => h.trim().replace(/^["']|["']$/g, ''));
    const sampleVals = lines[1].split(delimiter).map((v) => v.trim().replace(/^["']|["']$/g, ''));

    setDetectedHeaders(headers);
    setSampleRowValues(sampleVals);

    const initialMapping: Record<string, number> = {};
    const autoMatched: Record<string, boolean> = {};

    TARGET_FIELDS.forEach((target, index) => {
      let matchedIndex = -1;

      for (let i = 0; i < headers.length; i++) {
        if (target.regex.test(headers[i])) {
          matchedIndex = i;
          autoMatched[target.key] = true;
          break;
        }
      }

      if (matchedIndex === -1 && index < headers.length) {
        matchedIndex = index;
        autoMatched[target.key] = false;
      }

      initialMapping[target.key] = matchedIndex;
    });

    setColumnMapping(initialMapping);
    setAutoMatchedFields(autoMatched);
    setStep(2);
  };

  // Step 2 -> Step 3: Apply User-Configured Column Mappings & Validate Data
  const processCsvParsingWithMapping = () => {
    if (!rawCsvText.trim()) return;

    const lines = rawCsvText.trim().split('\n');
    if (lines.length < 2) return;

    const firstLine = lines[0];
    const delimiter = firstLine.includes('\t') ? '\t' : firstLine.includes(';') ? ';' : ',';

    const parsed: Omit<Student, 'id' | 'datasetId'>[] = [];
    const errors: { row: number; msg: string }[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(delimiter).map((c) => c.trim().replace(/^["']|["']$/g, ''));

      const getVal = (key: string): string => {
        const colIdx = columnMapping[key];
        return colIdx !== undefined && colIdx >= 0 && colIdx < cols.length ? cols[colIdx] : '';
      };

      const rollNo = getVal('rollNo');
      const name = getVal('name');
      const email = getVal('email');
      const phone = getVal('phone');
      const branch = getVal('branch');
      const cgpaRaw = getVal('cgpa');
      const tenthRaw = getVal('tenthPercentage');
      const twelfthRaw = getVal('twelfthPercentage');
      const backlogsRaw = getVal('backlogs');
      const gradYearRaw = getVal('graduationYear');
      const genderRaw = getVal('gender');

      const cgpa = parseFloat(cgpaRaw);
      const tenth = parseFloat(tenthRaw);
      const twelfth = parseFloat(twelfthRaw);
      const backlogs = parseInt(backlogsRaw, 10);
      const gradYear = parseInt(gradYearRaw, 10);
      const gender = (genderRaw as 'Male' | 'Female' | 'Other') || 'Male';

      if (!rollNo || !name) {
        errors.push({ row: i + 1, msg: 'Roll number or Name is empty in mapped columns' });
      }

      if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
        errors.push({ row: i + 1, msg: `Invalid CGPA (${cgpaRaw || 'N/A'}). Expected number (0-10)` });
      }

      parsed.push({
        rollNo: rollNo || `ROLL-${i}`,
        name: name || `Student ${i}`,
        email: email || `student${i}@college.edu`,
        phone: phone || '',
        branch: branch || 'CSE',
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
    setStep(3);
  };

  const handleFinalImport = async () => {
    if (parsedPreview.length === 0 || !datasetName) return;

    await addDatasetWithStudents(datasetName, academicYear, parsedPreview);
    onClose();
    setStep(1);
    setRawCsvText('');
    setParsedPreview([]);
    setValidationErrors([]);
    setDatasetName('');
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] bg-slate-950/75 backdrop-blur-md flex items-start sm:items-center justify-center p-4 sm:p-6 lg:p-8 pt-16 sm:pt-20 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[84vh] mt-2 sm:mt-4"
      >
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Upload className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-lg text-slate-100">Upload Student Dataset (CSV)</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress */}
        <div className="flex justify-around bg-slate-950/50 px-6 py-3 border-b border-slate-800 text-xs font-semibold">
          <span className={step >= 1 ? 'text-indigo-400 font-bold' : 'text-slate-500'}>
            1. File & Data Input
          </span>
          <span className={step >= 2 ? 'text-indigo-400 font-bold flex items-center gap-1' : 'text-slate-500'}>
            <SlidersHorizontal className="w-3.5 h-3.5" /> 2. Column Mapping
          </span>
          <span className={step >= 3 ? 'text-indigo-400 font-bold' : 'text-slate-500'}>
            3. Validation & Import
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* STEP 1: Dataset Metadata & CSV Input */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-400">CSV Data Content *</label>
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition-all">
                      <FileText className="w-3.5 h-3.5" /> Upload .csv File
                      <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                    </label>
                    <button
                      onClick={handleLoadSampleCsv}
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Load Preset Sample CSV
                    </button>
                  </div>
                </div>

                <textarea
                  rows={6}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
                  placeholder="Paste CSV headers & rows here or click 'Upload .csv File' above..."
                  value={rawCsvText}
                  onChange={(e) => setRawCsvText(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* STEP 2: Interactive Column Mapping & Verification */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 text-xs text-indigo-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-indigo-300">
                  <SlidersHorizontal className="w-4 h-4" /> Header Assignment & Verification Window
                </div>
                <p className="text-slate-300">
                  CSV columns have been automatically assigned using regex matching. Please verify or manually adjust the dropdown mappings to ensure each field correctly maps to your MongoDB schema.
                </p>
              </div>

              {/* Header Mapping Grid */}
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-slate-400 px-2 pb-1 border-b border-slate-800">
                  <div className="col-span-4">Target Schema Field</div>
                  <div className="col-span-5">Detected CSV Column Header</div>
                  <div className="col-span-3 text-right">Sample Row Value</div>
                </div>

                {TARGET_FIELDS.map((field) => {
                  const currentMappedIdx = columnMapping[field.key] ?? -1;
                  const isAutoMatched = autoMatchedFields[field.key];
                  const sampleVal =
                    currentMappedIdx >= 0 && currentMappedIdx < sampleRowValues.length
                      ? sampleRowValues[currentMappedIdx]
                      : '—';

                  return (
                    <div
                      key={field.key}
                      className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl grid grid-cols-12 gap-2 items-center hover:border-slate-700 transition-all"
                    >
                      {/* Target Field Info */}
                      <div className="col-span-4">
                        <div className="font-bold text-xs text-slate-100 flex items-center gap-1">
                          {field.label}
                          {field.required && <span className="text-rose-400">*</span>}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{field.description}</div>
                      </div>

                      {/* Column Selector */}
                      <div className="col-span-5 flex items-center gap-2">
                        <select
                          value={currentMappedIdx}
                          onChange={(e) => {
                            const newIdx = parseInt(e.target.value, 10);
                            setColumnMapping((prev) => ({ ...prev, [field.key]: newIdx }));
                            setAutoMatchedFields((prev) => ({ ...prev, [field.key]: false }));
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
                        >
                          <option value={-1}>-- Select CSV Column Header --</option>
                          {detectedHeaders.map((h, i) => (
                            <option key={i} value={i}>
                              Col {i + 1}: {h}
                            </option>
                          ))}
                        </select>

                        {isAutoMatched && (
                          <span
                            title="Auto-matched using Smart Header Regex"
                            className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap shrink-0"
                          >
                            ✓ Auto
                          </span>
                        )}
                      </div>

                      {/* Live Sample Value */}
                      <div className="col-span-3 text-right text-xs font-mono font-semibold text-cyan-400 truncate">
                        {sampleVal}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Validation Warnings & Final Parsed Table Preview */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              {validationErrors.length > 0 && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3.5 text-rose-300 text-xs">
                  <div className="flex items-center gap-2 font-semibold mb-1">
                    <AlertTriangle className="w-4 h-4 text-rose-400" /> Validation Warnings Found
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 max-h-24 overflow-y-auto">
                    {validationErrors.map((err, idx) => (
                      <li key={idx}>Row {err.row}: {err.msg}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="text-sm font-semibold text-slate-200 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Table className="w-4 h-4 text-indigo-400" /> Mapped Parsed Preview ({parsedPreview.length} Student Records)
                  </span>
                  <span className="text-xs text-emerald-400 font-mono">Ready for MongoDB Import</span>
                </h4>
                
                <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-56">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 font-semibold uppercase sticky top-0">
                      <tr>
                        <th className="p-2.5">Roll No</th>
                        <th className="p-2.5">Name</th>
                        <th className="p-2.5">Email</th>
                        <th className="p-2.5">Branch</th>
                        <th className="p-2.5">CGPA</th>
                        <th className="p-2.5">Backlogs</th>
                        <th className="p-2.5">Grad Year</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      {parsedPreview.map((s, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          <td className="p-2.5 font-mono text-cyan-400 font-semibold">{s.rollNo}</td>
                          <td className="p-2.5 font-medium">{s.name}</td>
                          <td className="p-2.5 text-slate-400">{s.email}</td>
                          <td className="p-2.5">{s.branch}</td>
                          <td className="p-2.5 font-bold text-emerald-400">{s.cgpa}</td>
                          <td className="p-2.5">{s.backlogs}</td>
                          <td className="p-2.5 font-mono">{s.graduationYear}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Controls */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-slate-800 bg-slate-950/40">
          <div>
            {step > 1 && (
              <button
                onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
              >
                Back
              </button>
            )}
          </div>

          <div className="flex gap-3">
            {step === 1 && (
              <button
                disabled={!datasetName || !rawCsvText}
                onClick={startColumnMapping}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-md transition-all cursor-pointer"
              >
                Next: Map Columns <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 2 && (
              <button
                onClick={processCsvParsingWithMapping}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all cursor-pointer"
              >
                Process & Validate Data <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 3 && (
              <button
                onClick={handleFinalImport}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" /> Confirm & Import to MongoDB
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
