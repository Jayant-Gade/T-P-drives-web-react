import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Database, Plus, Calendar, UserCheck } from 'lucide-react';
import { CsvUploadModal } from '../components/datasets/CsvUploadModal';

export const DatasetsPage: React.FC = () => {
  const { datasets, activeDatasetId, setActiveDatasetId, getDrivesByDataset } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Student Datasets & CSV Import</h1>
          <p className="text-sm text-slate-400 mt-1">
            Upload, validate, and manage isolated batch datasets for placement drives with custom header mapping.
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
                className={`w-full mt-4 text-xs font-semibold py-2.5 rounded-xl transition-all cursor-pointer ${
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

      {/* Standalone CSV Upload & Column Mapping Modal */}
      <CsvUploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
