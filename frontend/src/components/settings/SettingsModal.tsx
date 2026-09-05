import React from 'react';
import { useApp } from '../../context/AppContext';
import type { FontFamilyType, FontSizeOption, UIScaleOption } from '../../types';
import { Settings, X, RotateCcw, Type, Sliders, Layout, AlignLeft, Check, Sparkles } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const { uiSettings, updateUISettings, resetUISettings, isSettingsOpen, setIsSettingsOpen } = useApp();

  if (!isSettingsOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsSettingsOpen(false);
      }}
      className="fixed inset-0 z-[110] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in cursor-pointer"
    >
      {/* Near Full Screen Hover Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full h-full max-w-6xl max-h-[92vh] bg-slate-950/95 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scale-in cursor-default"
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                UI & Appearance Customization Settings
              </h2>
              <p className="text-xs text-slate-400">
                Personalize font sizes, text scaling, wrapping, layout density, and typography types. Settings persist automatically.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={resetUISettings}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all hover:scale-105 active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
            </button>
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls Column (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 0. Demo Mode Toggle */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-500/40 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
                  <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                  <span>Demo Mode (Static Data)</span>
                </div>

                <button
                  onClick={() => updateUISettings({ isDemoMode: !uiSettings.isDemoMode })}
                  className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-md ${
                    uiSettings.isDemoMode
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/25 scale-[1.02]'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {uiSettings.isDemoMode ? '✓ Demo Mode ACTIVE' : 'Enable Demo Mode'}
                </button>
              </div>

              <p className="text-xs text-slate-300">
                When enabled, the app uses pre-populated static datasets, students, and drive records. When disabled, data is fetched dynamically from the Node.js REST API backend.
              </p>
            </div>

            {/* 1. Font Family / Types */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <Type className="w-4 h-4" /> Font Family / Typography Types
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(
                  [
                    { id: 'Inter', label: 'Inter (Default)', fontClass: 'font-sans' },
                    { id: 'Roboto', label: 'Roboto', fontClass: 'font-serif' },
                    { id: 'Outfit', label: 'Outfit (Modern)', fontClass: 'font-sans' },
                    { id: 'Fira Code', label: 'Fira Code (Code)', fontClass: 'font-mono' },
                    { id: 'System', label: 'System Sans', fontClass: 'font-sans' },
                  ] as const
                ).map((font) => (
                  <button
                    key={font.id}
                    onClick={() => updateUISettings({ fontFamily: font.id as FontFamilyType })}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex justify-between items-center ${
                      uiSettings.fontFamily === font.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <span>{font.label}</span>
                    {uiSettings.fontFamily === font.id && <Check className="w-4 h-4 text-indigo-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Font Size & Text Scaling */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Sliders className="w-4 h-4" /> Font Size & Text Scaling
              </div>

              {/* Base Font Size */}
              <div>
                <label className="block text-xs text-slate-400 font-semibold mb-2">Base Font Size</label>
                <div className="grid grid-cols-4 gap-2">
                  {(
                    [
                      { id: 'sm', label: 'Small (14px)' },
                      { id: 'base', label: 'Medium (16px)' },
                      { id: 'lg', label: 'Large (18px)' },
                      { id: 'xl', label: 'XL (20px)' },
                    ] as const
                  ).map((size) => (
                    <button
                      key={size.id}
                      onClick={() => updateUISettings({ fontSize: size.id as FontSizeOption })}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all text-center ${
                        uiSettings.fontSize === size.id
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Scale Slider */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold mb-2">
                  <span className="text-slate-400">Text Scaling Multiplier</span>
                  <span className="text-cyan-400 font-bold">{uiSettings.textScale}%</span>
                </div>
                <input
                  type="range"
                  min="90"
                  max="130"
                  step="5"
                  className="w-full accent-cyan-400 cursor-pointer"
                  value={uiSettings.textScale}
                  onChange={(e) => updateUISettings({ textScale: parseInt(e.target.value, 10) })}
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>90% Compact</span>
                  <span>100% Standard</span>
                  <span>130% Large</span>
                </div>
              </div>
            </div>

            {/* 3. Text Wrapping & UI Layout Density */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Text Wrapping */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <AlignLeft className="w-4 h-4" /> Text Wrapping Mode
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateUISettings({ textWrap: true })}
                    className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                      uiSettings.textWrap
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    Wrap Text
                  </button>
                  <button
                    onClick={() => updateUISettings({ textWrap: false })}
                    className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                      !uiSettings.textWrap
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    Truncate (No-Wrap)
                  </button>
                </div>
              </div>

              {/* UI Density */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Layout className="w-4 h-4" /> UI Layout Density
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'compact', label: 'Compact' },
                      { id: 'normal', label: 'Normal' },
                      { id: 'spacious', label: 'Spacious' },
                    ] as const
                  ).map((scale) => (
                    <button
                      key={scale.id}
                      onClick={() => updateUISettings({ uiScale: scale.id as UIScaleOption })}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                        uiSettings.uiScale === scale.id
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {scale.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Live Interactive Preview (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-4 flex-1 flex flex-col">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" /> Live Interactive Preview
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                  Saved to LocalStorage
                </span>
              </div>

              {/* Sample Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-slate-100">Google India Drive</div>
                    <div className="text-xs text-indigo-400 font-semibold">SDE-1 Hiring</div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Eligibility criteria: CGPA ≥ 8.5 AND Backlogs = 0 AND Branch IN [CSE, IT].
                </p>
              </div>

              {/* Sample Student Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="p-2.5">Roll No</th>
                      <th className="p-2.5">Student Name</th>
                      <th className="p-2.5">Branch</th>
                      <th className="p-2.5">CGPA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    <tr>
                      <td className="p-2.5 font-mono text-cyan-400">2026CSE001</td>
                      <td className="p-2.5 font-semibold">Aarav Sharma</td>
                      <td className="p-2.5">CSE</td>
                      <td className="p-2.5 font-bold text-emerald-400">8.80</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono text-cyan-400">2026IT002</td>
                      <td className="p-2.5 font-semibold">Diya Patel</td>
                      <td className="p-2.5">IT</td>
                      <td className="p-2.5 font-bold text-emerald-400">8.20</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-auto pt-4 text-[11px] text-slate-500 border-t border-slate-800 flex justify-between">
                <span>Font: <strong>{uiSettings.fontFamily}</strong></span>
                <span>Size: <strong>{uiSettings.fontSize} ({uiSettings.textScale}%)</strong></span>
                <span>Wrap: <strong>{uiSettings.textWrap ? 'Yes' : 'No'}</strong></span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-slate-800 bg-slate-900/60 flex justify-between items-center">
          <span className="text-xs text-slate-400">
            Changes apply instantly to all 4 pages and remain saved across sessions.
          </span>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            Apply & Close
          </button>
        </div>

      </div>
    </div>
  );
};
