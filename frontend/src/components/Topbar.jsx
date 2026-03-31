import React from "react";
import { useWallet } from "../hooks/useWallet.js";
import { useAuth } from "../context/AuthContext.jsx";

const Topbar = () => {
  const { address, connect, network } = useWallet();
  const { user } = useAuth();
  const chainName = network?.name || "";

  return (
    <header className="glass-panel flex items-center justify-between px-6 py-4 border border-white/10 text-slate-100">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-slate-200/90">Welcome back</p>
        <p className="font-semibold text-lg">{user?.name || "Guest"}</p>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-slate-100 px-3 py-1 rounded-full bg-white/10 border border-white/15">
          {chainName || ""}
        </span>
        <button
          onClick={connect}
          className="bg-primary text-slate-950 font-semibold px-4 py-2 rounded-lg shadow-[0_12px_30px_-12px_rgba(6,182,212,0.6)] hover:translate-y-[-1px] transition-transform"
        >
          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connect Wallet"}
        </button>
      </div>
    </header>
  );
};

export default Topbar;
