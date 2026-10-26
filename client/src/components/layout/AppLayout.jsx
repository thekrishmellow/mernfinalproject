import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar.jsx';
import { Sidebar } from './Sidebar.jsx';
import { LearnerNavbar } from '../learner/LearnerNavbar.jsx';

export function AppLayout() {
  const location = useLocation();
  const isLearnerSpace = location.pathname.startsWith('/client');

  if (isLearnerSpace) {
    return (
      <div className="min-h-dvh flex flex-col bg-[#F8F9FE] text-slate-800">
        <LearnerNavbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col bg-[#F8F9FE] text-slate-800">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
