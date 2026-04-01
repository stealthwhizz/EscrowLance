import React, { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useWallet } from "../../hooks/useWallet.js";

const Profile = () => {
  const { user } = useAuth();
  const { address, network, connect, isConnected } = useWallet();
  const [copied, setCopied] = useState(false);

  if (!user) return <p className="text-slate-400">Loading profile...</p>;

  const initials = useMemo(() => {
    if (!user.name) return "?";
    return user.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user.name]);

  const shortAddress = (addr) => (addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "—");
  const profileWallet = user.walletAddress || "";
  const walletMatches =
    isConnected && profileWallet && address && address.toLowerCase() === profileWallet.toLowerCase();
  const joined = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

  const networkOk = network?.name?.toLowerCase().includes("sepolia");
  const profileReady = Boolean(user.name && user.email && profileWallet);
  const checklist = [
    { label: "Profile details", ok: profileReady },
    { label: "Wallet connected", ok: isConnected },
    { label: "Wallet matches profile", ok: walletMatches },
    { label: "Network set to Sepolia", ok: networkOk },
  ];

  const copyWallet = async () => {
    if (!profileWallet || typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(profileWallet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      console.error("Failed to copy wallet", err);
    }
  };

  const handleConnect = async () => {
    try {
      await connect();
    } catch (err) {
      console.error("Wallet connect failed", err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-8 shadow-[0_20px_60px_-24px_rgba(6,182,212,0.45)]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-10 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-accent/15 blur-3xl" />
        </div>
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Identity • Wallet</p>
            <h1 className="text-3xl font-semibold">Profile & Readiness</h1>
            <p className="text-slate-300 max-w-2xl">
              Keep your account details and on-chain identity aligned before funding or releasing milestones.
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-slate-300">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Sepolia escrow</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Profile-bound payouts</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">MetaMask required</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs uppercase tracking-[0.2em]">
              {network?.name || "No network"}
            </span>
            <button
              onClick={handleConnect}
              className="bg-primary text-slate-950 font-semibold px-4 py-2 rounded-lg shadow-[0_12px_30px_-12px_rgba(6,182,212,0.6)] hover:translate-y-[-1px] transition-transform"
            >
              {isConnected ? shortAddress(address) : "Connect wallet"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.8fr_1fr] gap-6">
        <section className="glass-panel rounded-2xl border border-white/10 p-6 shadow-lg shadow-primary/10">
          <div className="flex flex-wrap items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-slate-950 font-bold text-xl shadow-lg shadow-accent/20 overflow-hidden">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-semibold">{user.name}</h2>
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs uppercase tracking-wide">
                  {user.role || "user"}
                </span>
              </div>
              <p className="text-slate-300">{user.email}</p>
              <p className="text-slate-500 text-sm">Joined {joined}</p>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Profile wallet</p>
              <div className="mt-2 font-mono text-sm break-all">{profileWallet || "Not set"}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={copyWallet}
                  className="px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-sm hover:border-primary/60 transition-colors"
                >
                  {copied ? "Copied" : "Copy address"}
                </button>
                <button
                  onClick={handleConnect}
                  className="px-3 py-2 rounded-lg bg-primary text-slate-950 font-semibold text-sm hover:translate-y-[-1px] transition-transform"
                >
                  {walletMatches ? "Wallet linked" : isConnected ? "Switch to profile wallet" : "Connect MetaMask"}
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {walletMatches
                  ? "Connected wallet matches your profile."
                  : isConnected
                    ? "Connected wallet differs from profile. Switch in MetaMask to keep payouts aligned."
                    : "Connect MetaMask to verify and sign transactions."}
              </p>
            </div>

            <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 space-y-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Session status</p>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Connected wallet</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${walletMatches
                    ? "bg-primary/10 border-primary/50 text-primary"
                    : isConnected
                      ? "bg-amber-500/10 border-amber-500/40 text-amber-200"
                      : "bg-white/5 border-white/10 text-slate-200"}`}
                >
                  {walletMatches ? "Synced" : isConnected ? "Mismatch" : "Disconnected"}
                </span>
              </div>
              <div className="text-sm text-slate-200">{isConnected ? shortAddress(address) : "No wallet connected"}</div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Network</span>
                <span className="font-semibold text-slate-200">{network?.name || "Not set"}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="glass-panel rounded-2xl border border-white/10 p-5 shadow-lg shadow-primary/10">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Identity summary</p>
            <div className="mt-3 space-y-2 text-sm text-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Role</span>
                <span className="font-semibold text-slate-100">{user.role || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Email</span>
                <span className="font-semibold text-slate-100">{user.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Wallet</span>
                <span className="font-mono text-xs">{profileWallet ? shortAddress(profileWallet) : "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Member since</span>
                <span className="font-semibold text-slate-100">{joined}</span>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl border border-white/10 p-5 shadow-lg shadow-primary/10">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Readiness checklist</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              {checklist.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-2"
                >
                  <span>{item.label}</span>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                      item.ok
                        ? "bg-primary/10 border-primary/40 text-primary"
                        : "bg-amber-500/10 border-amber-500/40 text-amber-100"
                    }`}
                  >
                    {item.ok ? "Ready" : "Action"}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-panel rounded-2xl border border-white/10 p-5 shadow-lg shadow-primary/10">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Demo tips</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-200 list-disc list-inside">
              <li>Connect MetaMask first, then assign freelancers to avoid payout misrouting.</li>
              <li>Verify the network pill shows Sepolia before funding or releasing.</li>
              <li>Copy your profile wallet into MetaMask to keep payouts aligned.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Profile;
