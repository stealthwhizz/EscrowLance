import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";

const DashboardLayout = () => {
  return (
    <div className="relative min-h-screen text-slate-100 flex overflow-hidden">
      <span className="accent-pill" aria-hidden />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10">
        <Topbar />
        <main className="p-6 bg-grid flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-4 fade-in-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
