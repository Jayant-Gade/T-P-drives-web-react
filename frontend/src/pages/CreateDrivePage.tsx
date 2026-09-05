import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { FilterRule, FilterAST, Student, FilterOperator } from '../types';

import { useNavigate } from 'react-router-dom';
import { PlusCircle, Trash2, Calculator, Save, Filter, Briefcase, Sparkles } from 'lucide-react';

export const CreateDrivePage: React.FC = () => {
  const { datasets, activeDatasetId, createPlacementDrive, evaluateDriveEligibilityPreview } = useApp();
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [ctcLpa, setCtcLpa] = useState<number>(10);
  const [driveDate, setDriveDate] = useState('2026-04-15');
  const [driveLink, setDriveLink] = useState('');
  const [description, setDescription] = useState('');
  const [datasetId, setDatasetId] = useState(activeDatasetId);

  const [rules, setRules] = useState<FilterRule[]>([
    { id: 'rule-1', field: 'cgpa', operator: 'gte', value: 7.5 },
    { id: 'rule-2', field: 'backlogs', operator: 'eq', value: 0 },
    { id: 'rule-3', field: 'branch', operator: 'in', value: 'CSE, IT' },
  ]);

  const [previewStudents, setPreviewStudents] = useState<Student[] | null>(null);

  const addRule = () => {
    const newRule: FilterRule = {
      id: `rule-${Date.now()}`,
      field: 'cgpa',
      operator: 'gte',
      value: 7.0,
    };
    setRules((prev) => [...prev, newRule]);
    setPreviewStudents(null);
  };

  const removeRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    setPreviewStudents(null);
  };

  const updateRule = (id: string, key: keyof FilterRule, val: any) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return { ...r, [key]: val };
        }
        return r;
      })
    );
    setPreviewStudents(null);
  };

  const handleCalculateEligibility = async () => {
    const filterAST: FilterAST = { logic: 'AND', rules };
    const matching = await evaluateDriveEligibilityPreview(datasetId, filterAST);
    setPreviewStudents(matching);
  };

  const handleSaveDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !role) return;

    const filterAST: FilterAST = { logic: 'AND', rules };

    await createPlacementDrive({
      companyName,
      role,
      ctcLpa: Number(ctcLpa),
      driveDate,
      driveLink,
      description,
      datasetId,
      filterSnapshot: filterAST,
    });

    navigate('/drives');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">
          Create Placement Drive & Dynamic Filter Engine
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Define company metadata, construct custom JSON AST eligibility rules, and preview candidate counts.
        </p>
      </div>

      <form onSubmit={handleSaveDrive} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Metadata */}
        <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-md space-y-5">
          <h3 className="text-lg font-bold text-slate-100 pb-3 border-b border-slate-700 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-400" /> Company & Drive Details
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Target Dataset Batch *</label>
            <select
              className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
              value={datasetId}
              onChange={(e) => {
                setDatasetId(e.target.value);
                setPreviewStudents(null);
              }}
            >
              {datasets.map((ds) => (
                <option key={ds.id} value={ds.id}>
                  {ds.name} ({ds.totalStudents} Students)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Company Name *</label>
            <input
              type="text"
              required
              className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
              placeholder="e.g. Google India / Microsoft / TCS Digital"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Job Role / Designation *</label>
              <input
                type="text"
                required
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
                placeholder="e.g. SDE-1"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Package (CTC in LPA) *</label>
              <input
                type="number"
                step="0.5"
                required
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
                placeholder="e.g. 14.5"
                value={ctcLpa}
                onChange={(e) => setCtcLpa(parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Drive Date *</label>
              <input
                type="date"
                required
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
                value={driveDate}
                onChange={(e) => setDriveDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Drive Link (Optional)</label>
              <input
                type="url"
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
                placeholder="https://..."
                value={driveLink}
                onChange={(e) => setDriveLink(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Drive Description</label>
            <textarea
              rows={3}
              className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
              placeholder="Overview, interview rounds, requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Right Column: AST Filter Builder */}
        <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-md space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Filter className="w-5 h-5 text-cyan-400" /> Dynamic AST Filter Builder
              </h3>
              <button
                type="button"
                onClick={addRule}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-all"
              >
                <PlusCircle className="w-4 h-4" /> Add Rule
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Rules are evaluated using logical <strong className="text-cyan-400">AND</strong> operations against student dataset attributes.
            </p>

            {/* Rules List */}
            <div className="space-y-3">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-3 bg-slate-950/80 border border-slate-700/80 rounded-xl grid grid-cols-12 gap-2 items-center animate-fade-in hover:border-slate-600 transition-all"
                >
                  <select
                    className="col-span-4 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    value={rule.field}
                    onChange={(e) => updateRule(rule.id, 'field', e.target.value)}
                  >
                    <option value="cgpa">CGPA</option>
                    <option value="branch">Branch</option>
                    <option value="backlogs">Backlogs</option>
                    <option value="tenthPercentage">10th %</option>
                    <option value="twelfthPercentage">12th %</option>
                    <option value="gender">Gender</option>
                  </select>

                  <select
                    className="col-span-3 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    value={rule.operator}
                    onChange={(e) => updateRule(rule.id, 'operator', e.target.value as FilterOperator)}
                  >
                    <option value="gte">≥ (GTE)</option>
                    <option value="lte">≤ (LTE)</option>
                    <option value="eq">= (EQ)</option>
                    <option value="neq">≠ (NEQ)</option>
                    <option value="in">IN (List)</option>
                  </select>

                  <input
                    type="text"
                    className="col-span-4 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    placeholder="Value..."
                    value={String(rule.value)}
                    onChange={(e) => updateRule(rule.id, 'value', e.target.value)}
                  />

                  <button
                    type="button"
                    onClick={() => removeRule(rule.id)}
                    className="col-span-1 text-rose-400 hover:text-rose-300 p-1 flex justify-center transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-700/60">
            <button
              type="button"
              onClick={handleCalculateEligibility}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold py-2.5 rounded-xl border border-slate-700 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <Calculator className="w-4 h-4 text-cyan-400" /> Calculate & Preview
            </button>

            <button
              type="submit"
              disabled={!companyName || !role}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm font-semibold py-2.5 rounded-xl shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Drive & Snapshot
            </button>
          </div>
        </div>
      </form>

      {/* Preview Calculation Panel */}
      {previewStudents && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-emerald-500/40 shadow-2xl space-y-4 animate-slide-up">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
              <div>
                <h3 className="text-lg font-bold text-slate-100">Live Eligibility Engine Calculation</h3>
                <p className="text-xs text-slate-400">
                  Calculated against dataset batch <strong className="text-cyan-400">{datasetId}</strong>
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-extrabold text-emerald-400 animate-scale-in">
                {previewStudents.length} Candidates
              </div>
              <span className="text-xs text-slate-400">Match active AST criteria</span>
            </div>
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
                {previewStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-6 text-slate-400">
                      0 candidates matched the applied AST filter rules.
                    </td>
                  </tr>
                ) : (
                  previewStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-mono text-cyan-400 font-bold">{s.rollNo}</td>
                      <td className="p-2.5">{s.name}</td>
                      <td className="p-2.5">{s.branch}</td>
                      <td className="p-2.5 font-bold">{s.cgpa}</td>
                      <td className="p-2.5">{s.backlogs}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
