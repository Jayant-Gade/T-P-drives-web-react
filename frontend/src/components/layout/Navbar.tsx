import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { SettingsModal } from '../settings/SettingsModal';
import { Database, Users, Briefcase, PlusCircle, GraduationCap, Layers, Settings, Server, WifiOff, ChevronDown } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { datasets, activeDatasetId, setActiveDatasetId, activeDataset, students, drives, uiSettings, updateUISettings, setIsSettingsOpen, isBackendConnected } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/datasets', label: 'Datasets & CSV', shortLabel: 'Datasets', icon: Database },
    { path: '/students', label: 'Student Directory', shortLabel: 'Students', icon: Users },
    { path: '/drives', label: 'Drive Records', shortLabel: 'Drives', icon: Briefcase },
    { path: '/create-drive', label: 'Create Drive', shortLabel: 'New Drive', icon: PlusCircle },
  ];

  const currentPath = location.pathname;

  return (
    <>
      <header className="sticky top-0 z-30 bg-slate-950/90 border-b border-slate-800 backdrop-blur-xl transition-all duration-300">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3 flex-wrap">
            
            {/* Brand Logo & Title */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30 animate-pulse-glow">
                T&P
              </div>
              <div className="hidden sm:block">
                <span className="text-base font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Placement Hub
                </span>
                <span className="block text-[10px] text-slate-400 font-medium">College T&P Cell</span>
              </div>
            </div>

            {/* Desktop Horizontal Navigation Tabs (Hidden on small screens / tight viewports) */}
            <nav className="hidden lg:flex items-center gap-1.5 shrink-0">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 shrink-0 whitespace-nowrap ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                        : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Dropdown Menu for Navigation (Visible on Mobile / Compact screens / When horizontal bar overflows) */}
            <div className="flex lg:hidden items-center shrink-0">
              <div className="relative flex items-center">
                <select
                  value={currentPath}
                  onChange={(e) => navigate(e.target.value)}
                  className="bg-indigo-600/90 text-white border border-indigo-500 font-semibold text-xs rounded-xl px-3 py-2 pr-7 appearance-none cursor-pointer shadow-md focus:outline-none"
                >
                  {navItems.map((item) => (
                    <option key={item.path} value={item.path} className="bg-slate-900 text-slate-100 font-semibold">
                      {currentPath === item.path ? `✓ ${item.label}` : item.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-white absolute right-2 pointer-events-none" />
              </div>
            </div>

            {/* Active Dataset Selector, Demo Mode Button, Backend API Status & Settings Trigger Button */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="hidden md:flex items-center gap-2 shrink-0">
                <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium shrink-0">
                  <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> Batch:
                </span>
                <select
                  value={activeDatasetId}
                  onChange={(e) => setActiveDatasetId(e.target.value)}
                  className="bg-slate-800/90 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-100 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer shadow-sm hover:border-slate-600 shrink-0"
                >
                  {datasets.map((ds) => (
                    <option key={ds.id} value={ds.id}>
                      {ds.name} ({ds.totalStudents})
                    </option>
                  ))}
                </select>
              </div>

              {activeDataset && (
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border hidden xl:inline-block transition-all shrink-0 ${
                    activeDataset.status === 'Active'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {activeDataset.status}
                </span>
              )}

              {/* Demo Mode Button Indicator in Top Navbar */}
              <button
                onClick={() => updateUISettings({ isDemoMode: !uiSettings.isDemoMode })}
                title={uiSettings.isDemoMode ? 'Click to switch to Backend API Mode' : 'Click to enable Demo Mode with static data'}
                className={`text-[11px] px-3 py-1.5 rounded-xl font-bold border flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shrink-0 hover:scale-105 active:scale-95 ${
                  uiSettings.isDemoMode
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-400 shadow-amber-500/20 animate-pulse'
                    : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Server className="w-3.5 h-3.5 shrink-0" />
                <span>{uiSettings.isDemoMode ? '⚡ Demo Mode (Static Data)' : 'API Mode'}</span>
              </button>

              {/* Top Settings Trigger Button */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                title="UI Customization Settings"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer shrink-0"
              >
                <Settings className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="hidden sm:inline">Settings</span>
              </button>
            </div>

          </div>
        </div>

        {/* Secondary Metrics Bar */}
        <div className="bg-slate-950/40 border-t border-b border-slate-800/60 py-2 px-6">
          <div className="max-w-full mx-auto flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span>Total Students: <strong className="text-slate-200">{students.length}</strong></span>
              <span>Total Drives: <strong className="text-slate-200">{drives.length}</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-medium text-slate-300">T&P Officer Portal Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      <SettingsModal />
    </>
  );
};
