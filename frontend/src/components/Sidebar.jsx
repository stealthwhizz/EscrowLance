import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const baseLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/projects", label: "Projects" },
  { to: "/disputes", label: "Disputes" },
  { to: "/wallet", label: "Wallet" },
  { to: "/profile", label: "Profile" },
];

const clientExtras = [
  { to: "/projects/new", label: "Create Project" },
  { to: "/transactions", label: "Transactions" },
];

const freelancerExtras = [
  { to: "/milestones/submit", label: "Submit Milestone" },
];

const adminExtras = [
  { to: "/projects/new", label: "Create Project" },
  { to: "/transactions", label: "Transactions" },
  { to: "/milestones/submit", label: "Submit Milestone" },
];

const linksForRole = (role) => {
  if (role === "client") return [...baseLinks, ...clientExtras];
  if (role === "freelancer") return [...baseLinks, ...freelancerExtras];
  if (role === "admin") return [...baseLinks, ...adminExtras];
  return baseLinks; // fallback
};

const Sidebar = () => {
  const { logout, user } = useAuth();
  const links = linksForRole(user?.role);
  return (
    <aside className="w-64 glass-panel p-5 hidden md:flex flex-col gap-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-60 pointer-events-none bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.14),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(249,115,22,0.12),transparent_26%)]" />
      <div className="relative z-10">
        <div className="text-2xl font-bold tracking-tight">ChainEscrow</div>
        <p className="text-xs text-slate-400">On-chain trust for projects</p>
      </div>
      <nav className="relative z-10 space-y-2">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-primary/15 text-primary border border-primary/30 shadow-[0_10px_30px_-12px_rgba(6,182,212,0.7)]"
                  : "hover:bg-white/5 hover:translate-x-1"
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
      <button
        onClick={logout}
        className="relative z-10 mt-auto text-sm text-slate-300 hover:text-white transition"
      >
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
