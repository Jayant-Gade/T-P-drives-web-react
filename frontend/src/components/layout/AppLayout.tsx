import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen max-w-screen w-full bg-slate-900 text-slate-100 font-sans flex flex-col">
      {/* Standalone Top Navbar Component */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-screen w-full mx-auto p-6 sm:p-8">
        <Outlet />
      </main>
    </div>
  );
};
