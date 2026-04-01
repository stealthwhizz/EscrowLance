import React, { useEffect, useMemo, useState } from "react";
import { listTransactions } from "../../services/api.js";

const statusTone = {
  Completed: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40",
  Pending: "bg-amber-500/10 text-amber-300 border border-amber-500/40",
  Failed: "bg-rose-500/10 text-rose-300 border border-rose-500/40",
};

const formatAmount = (val) => {
  if (val === null || val === undefined) return "—";
  const num = Number(val);
  if (Number.isNaN(num)) return val;
  const assumedEth = num > 1e9 ? num / 1e18 : num;
  const precision = assumedEth >= 1 ? 3 : 6;
  return `${assumedEth.toFixed(precision)} ETH`;
};

const short = (value, head = 6, tail = 4) => {
  if (!value) return "—";
  if (value.length <= head + tail) return value;
  return `${value.slice(0, head)}...${value.slice(-tail)}`;
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
};

const explorerUrl = (hash, network = "sepolia") => {
  if (!hash) return null;
  if (network && network.toLowerCase() === "sepolia") {
    return `https://sepolia.etherscan.io/tx/${hash}`;
  }
  return `https://etherscan.io/tx/${hash}`;
};

const Transactions = () => {
  const [txs, setTxs] = useState([]);

  useEffect(() => {
    listTransactions().then(setTxs).catch(console.error);
  }, []);

  const stats = useMemo(() => {
    const completed = txs.filter((t) => t.status === "Completed").length;
    const pending = txs.filter((t) => t.status === "Pending").length;
    const failed = txs.filter((t) => t.status === "Failed").length;
    const volume = txs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    return { total: txs.length, completed, pending, failed, volume };
  }, [txs]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/30">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Ledger</p>
            <h2 className="text-2xl font-semibold text-white">Transaction desk</h2>
            <p className="text-sm text-slate-400">
              Track on-chain activity across projects and milestones, with quick links to Etherscan.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-emerald-200">
              Completed {stats.completed}
            </span>
            <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-amber-200">
              Pending {stats.pending}
            </span>
            <span className="rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1 text-rose-200">
              Failed {stats.failed}
            </span>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <StatCard label="Total transactions" value={stats.total} hint="All tracked actions" />
          <StatCard label="Completed" value={stats.completed} hint="Successfully settled" />
          <StatCard label="In flight" value={stats.pending} hint="Awaiting confirmations" />
          <StatCard label="Volume" value={formatAmount(stats.volume)} hint="Aggregate amount" />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg shadow-black/20">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Ledger feed</p>
            <h3 className="text-lg font-semibold text-white">Latest transactions</h3>
          </div>
          <p className="text-xs text-slate-500">Auto-refreshed on page load</p>
        </div>

        {txs.length === 0 ? (
          <div className="px-4 py-10 text-center text-slate-400">
            No transactions yet. Fund a project, approve a milestone, or release a payment to see activity here.
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-950/60 text-slate-300">
                <tr>
                  <th className="px-4 py-3 text-left">Action</th>
                  <th className="px-4 py-3 text-left">Project / Milestone</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Network</th>
                  <th className="px-4 py-3 text-left">Tx hash</th>
                  <th className="px-4 py-3 text-left">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {txs.map((tx) => {
                  const network = tx.network || "sepolia";
                  const link = explorerUrl(tx.txHash, network);
                  return (
                    <tr key={tx._id} className="border-t border-slate-800/80 bg-slate-950/30 hover:bg-slate-900/40">
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{tx.action || "—"}</div>
                        <div className="text-xs text-slate-400">{tx.userId ? short(tx.userId) : "User"}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-200">
                        <div className="font-medium">{short(tx.projectId)}</div>
                        <div className="text-xs text-slate-400">Milestone {tx.milestoneId ? short(tx.milestoneId) : "—"}</div>
                      </td>
                      <td className="px-4 py-3 text-white">{formatAmount(tx.amount)}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[tx.status] || "bg-slate-800 text-slate-200 border border-slate-700"}`}>
                          {tx.status || "Unknown"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-200 capitalize">{network}</td>
                      <td className="px-4 py-3 text-primary">
                        {link ? (
                          <a href={link} className="hover:underline" target="_blank" rel="noreferrer">
                            {short(tx.txHash)}
                          </a>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-300">{formatDate(tx.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, hint }) => (
  <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
    <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
    <p className="text-xs text-slate-500">{hint}</p>
  </div>
);

export default Transactions;
