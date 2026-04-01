import React from "react";
import { useWallet } from "../hooks/useWallet.js";
import { useAuth } from "../context/AuthContext.jsx";

const Topbar = () => {
  const { address, connect, disconnect, network, isConnected } = useWallet();
  const { user } = useAuth();

  const chainName = network?.name || "";
  const chainId = network?.chainId ? Number(network.chainId) : null;
  const isSepolia = chainId === 11155111;
  const walletLabel = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connect wallet";

  return (
    <header className="glass-panel flex items-center justify-between px-6 py-4 border border-white/10 text-slate-100 bg-gradient-to-r from-slate-950/70 via-slate-900/60 to-slate-950/70">
      <div className="flex flex-col gap-1">
        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-300/80">Welcome back</p>
        <p className="font-semibold text-lg leading-tight">{user?.name || "Guest"}</p>
        <p className="text-xs text-slate-300/80">Ensure your wallet stays on Sepolia before you launch on-chain actions.</p>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <span
          className={`px-3 py-1 rounded-full border text-xs font-semibold tracking-wide ${
            isSepolia ? "bg-emerald-500/10 border-emerald-400/40 text-emerald-100" : "bg-amber-500/10 border-amber-400/40 text-amber-100"
          }`}
        >
          {chainName ? `${chainName}${isSepolia ? " • ready" : " • switch"}` : "Network"}
        </span>

        <span
          className={`px-3 py-1 rounded-full border text-xs font-semibold tracking-wide ${
            isConnected ? "bg-cyan-500/10 border-cyan-400/40 text-cyan-100" : "bg-white/5 border-white/20 text-slate-100"
          }`}
        >
          {walletLabel}
        </span>

        <button
          onClick={isConnected ? disconnect : connect}
          className="bg-primary text-slate-950 font-semibold px-4 py-2 rounded-lg shadow-[0_14px_34px_-14px_rgba(6,182,212,0.8)] hover:translate-y-[-1px] active:translate-y-[0px] transition-transform"
        >
          {isConnected ? "Disconnect" : "Connect"}
        </button>
      </div>
    </header>
  );
};

export default Topbar;
