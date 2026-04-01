import React, { useEffect, useMemo, useState } from "react";
import {
  raiseDispute,
  listDisputes,
  resolveDispute,
  fetchProjects,
  listMilestones,
  addDisputeComment,
  addDisputeEvidence,
  uploadProofFile,
} from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

const etherscanTx = (hash) =>
  hash ? `${import.meta.env.VITE_ETHERSCAN_BASE || "https://sepolia.etherscan.io"}/tx/${hash}` : null;

const Disputes = () => {
  const [form, setForm] = useState({ projectId: "", milestoneId: "", reason: "" });
  const [message, setMessage] = useState(null);
  const [disputes, setDisputes] = useState([]);
  const [resolutionDrafts, setResolutionDrafts] = useState({});
  const [projects, setProjects] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [evidenceDrafts, setEvidenceDrafts] = useState({});
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { addToast } = useToast();

  const stats = useMemo(() => {
    const total = disputes.length;
    const open = disputes.filter((d) => d.status?.toLowerCase() === "open").length;
    const resolved = disputes.filter((d) => d.status?.toLowerCase() === "resolved").length;
    return { total, open, resolved };
  }, [disputes]);

  const loadDisputes = async () => {
    const data = await listDisputes();
    setDisputes(data);
  };

  const loadProjects = async () => {
    const data = await fetchProjects();
    setProjects(data);
  };

  useEffect(() => {
    Promise.all([loadDisputes(), loadProjects()]).catch(console.error);
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!form.projectId) {
        setMilestones([]);
        return;
      }
      const data = await listMilestones(form.projectId);
      setMilestones(data);
    };
    load().catch(console.error);
  }, [form.projectId]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await raiseDispute(form);
      setMessage(`Dispute created ${res._id || ""}`);
      await loadDisputes();
      addToast("Dispute raised", "success");
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to raise dispute";
      setMessage(msg);
      addToast(msg, "error");
    }
  };

  const handleResolveChange = (id, field, value) => {
    setResolutionDrafts((prev) => ({
      ...prev,
      [id]: {
        refundClient: prev[id]?.refundClient ?? true,
        resolution: prev[id]?.resolution ?? "",
        [field]: value,
      },
    }));
  };

  const onResolve = async (dispute) => {
    const draft = resolutionDrafts[dispute._id] || {};
    if (!draft.resolution) {
      setMessage("Add a resolution summary first.");
      return;
    }
    try {
      await resolveDispute({
        projectId: dispute.projectId?._id || dispute.projectId,
        refundClient: draft.refundClient ?? true,
        resolution: draft.resolution,
      });
      setMessage("Resolution submitted.");
      await loadDisputes();
      addToast("Resolution submitted", "success");
    } catch (err) {
      setMessage("Failed to submit resolution.");
      console.error(err);
      addToast("Resolution failed", "error");
    }
  };

  const onComment = async (dispute) => {
    const text = commentDrafts[dispute._id] || "";
    if (!text.trim()) return;
    try {
      const updated = await addDisputeComment(dispute._id, { text });
      setDisputes((prev) => prev.map((d) => (d._id === dispute._id ? updated : d)));
      setCommentDrafts((prev) => ({ ...prev, [dispute._id]: "" }));
      addToast("Comment added", "success");
    } catch (err) {
      console.error(err);
      addToast("Failed to add comment", "error");
    }
  };

  const onEvidenceUpload = async (dispute) => {
    const file = evidenceDrafts[dispute._id];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadProofFile(file);
      const updated = await addDisputeEvidence(dispute._id, { ipfsHash: res.ipfsHash, filename: file.name });
      setDisputes((prev) => prev.map((d) => (d._id === dispute._id ? updated : d)));
      setEvidenceDrafts((prev) => ({ ...prev, [dispute._id]: null }));
      addToast("Evidence uploaded", "success");
    } catch (err) {
      console.error(err);
      addToast("Evidence upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const statusPill = (status) => {
    const value = status?.toLowerCase();
    if (value === "resolved") return "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30";
    if (value === "open") return "bg-amber-500/10 text-amber-300 border border-amber-500/30";
    return "bg-slate-700 text-slate-200 border border-slate-600";
  };

  const friendlyDate = (ts) => (ts ? new Date(ts).toLocaleString() : "");

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Ops / Trust & Safety</p>
            <h1 className="text-2xl font-semibold text-white">Disputes desk</h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              Raise, review, and resolve disputes with clear context, on-chain links, and evidence in one place.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
              <div className="text-slate-400">Open</div>
              <div className="text-xl font-semibold text-amber-200">{stats.open}</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
              <div className="text-slate-400">Resolved</div>
              <div className="text-xl font-semibold text-emerald-200">{stats.resolved}</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
              <div className="text-slate-400">Total</div>
              <div className="text-xl font-semibold text-white">{stats.total}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">New dispute</p>
                <h3 className="text-xl font-semibold text-white">Raise a dispute</h3>
                <p className="text-slate-400 text-sm">Select a project, pick the milestone, and share the dispute reason.</p>
              </div>
            </div>

            <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs uppercase tracking-[0.18em] text-slate-400">Project</label>
                <select
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                  name="projectId"
                  value={form.projectId}
                  onChange={(e) => setForm({ ...form, projectId: e.target.value, milestoneId: "" })}
                >
                  <option value="">Select project</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title} ({p.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.18em] text-slate-400">Milestone</label>
                <select
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                  name="milestoneId"
                  value={form.milestoneId}
                  onChange={(e) => setForm({ ...form, milestoneId: e.target.value })}
                  disabled={!form.projectId || !milestones.length}
                >
                  <option value="">Select milestone</option>
                  {milestones.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title} - {m.amount} ETH
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs uppercase tracking-[0.18em] text-slate-400">Reason</label>
                <textarea
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-3 text-sm text-white focus:border-primary focus:outline-none"
                  name="reason"
                  placeholder="Summarize what went wrong and what you’re requesting."
                  rows={3}
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-3 md:col-span-2">
                <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-primary/30" type="submit">
                  Raise dispute
                </button>
                {message && <p className="text-sm text-emerald-400">{message}</p>}
              </div>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Inbox</p>
                <h3 className="text-lg font-semibold text-white">Disputes</h3>
                <p className="text-slate-400 text-sm">Review disputes with status, evidence, comments, and on-chain links.</p>
              </div>
            </div>

            <div className="space-y-4">
              {disputes.map((d) => (
                <div key={d._id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 shadow-sm">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusPill(d.status)}`}>{d.status || "Unknown"}</span>
                        <span className="text-slate-500">{friendlyDate(d.createdAt)}</span>
                      </div>
                      <div className="text-white text-sm font-semibold">{d.projectId?.title || d.projectId}</div>
                      <div className="text-slate-400 text-sm">Milestone: {d.milestoneId?.title || d.milestoneId}</div>
                      {d.reason && <div className="text-slate-200 text-sm pt-1">{d.reason}</div>}
                      {d.resolution && <div className="text-xs text-emerald-300">Resolution: {d.resolution}</div>}
                    </div>

                    <div className="flex flex-col gap-2 text-xs text-primary">
                      {d.raiseTxHash && (
                        <a className="underline" href={etherscanTx(d.raiseTxHash)} target="_blank" rel="noreferrer">
                          Raise tx →
                        </a>
                      )}
                      {d.resolveTxHash && (
                        <a className="underline" href={etherscanTx(d.resolveTxHash)} target="_blank" rel="noreferrer">
                          Resolve tx →
                        </a>
                      )}
                    </div>
                  </div>

                  {Boolean(d.evidence?.length) && (
                    <div className="mt-3 text-xs text-slate-200 space-y-2">
                      <div className="font-semibold text-slate-100">Evidence</div>
                      {d.evidence.map((ev) => (
                        <div key={ev._id || ev.ipfsHash} className="flex flex-wrap items-center gap-2 rounded border border-slate-800 bg-slate-900/60 px-2 py-1">
                          <a className="text-primary underline" href={`https://ipfs.io/ipfs/${ev.ipfsHash}`} target="_blank" rel="noreferrer">
                            {ev.filename || ev.ipfsHash}
                          </a>
                          {ev.uploadedBy?.name && <span className="text-slate-500">by {ev.uploadedBy.name}</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 grid gap-4 lg:grid-cols-3">
                    <div className="space-y-2 lg:col-span-2">
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span className="font-semibold text-slate-100">Comments</span>
                        <span className="text-slate-500">{d.comments?.length || 0} entries</span>
                      </div>
                      <div className="space-y-2">
                        {d.comments?.map((c, idx) => (
                          <div key={idx} className="rounded border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs text-slate-200">
                            <div className="flex items-center justify-between gap-2">
                              <span>{c.text}</span>
                              <span className="text-slate-500">{c.user?.name || ""}</span>
                            </div>
                            <div className="text-slate-500">{c.createdAt ? friendlyDate(c.createdAt) : ""}</div>
                          </div>
                        ))}
                        <textarea
                          className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
                          placeholder="Add a comment"
                          value={commentDrafts[d._id] || ""}
                          onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [d._id]: e.target.value }))}
                        />
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          <input
                            type="file"
                            className="text-slate-300"
                            onChange={(e) => setEvidenceDrafts((prev) => ({ ...prev, [d._id]: e.target.files?.[0] || null }))}
                          />
                          <button
                            className="rounded border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-100 disabled:opacity-60"
                            type="button"
                            onClick={() => onEvidenceUpload(d)}
                            disabled={uploading}
                          >
                            {uploading ? "Uploading..." : "Attach evidence"}
                          </button>
                          <button
                            className="rounded bg-primary px-3 py-1 text-xs font-semibold text-slate-950"
                            type="button"
                            onClick={() => onComment(d)}
                          >
                            Post comment
                          </button>
                        </div>
                      </div>
                    </div>

                    {user?.role && ["client", "admin"].includes(user.role) && d.status === "Open" && (
                      <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/70 p-3 text-sm text-slate-200">
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Resolution</div>
                        <textarea
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                          placeholder="Share how you want to close this dispute."
                          value={resolutionDrafts[d._id]?.resolution || ""}
                          onChange={(e) => handleResolveChange(d._id, "resolution", e.target.value)}
                        />
                        <div className="flex flex-col gap-2 text-xs text-slate-200">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`refund-${d._id}`}
                              checked={resolutionDrafts[d._id]?.refundClient !== false}
                              onChange={() => handleResolveChange(d._id, "refundClient", true)}
                            />
                            Refund client
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`refund-${d._id}`}
                              checked={resolutionDrafts[d._id]?.refundClient === false}
                              onChange={() => handleResolveChange(d._id, "refundClient", false)}
                            />
                            Release to freelancer
                          </label>
                        </div>
                        <button
                          className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-slate-950"
                          type="button"
                          onClick={() => onResolve(d)}
                        >
                          Submit resolution
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {!disputes.length && <p className="text-sm text-slate-500">No disputes yet.</p>}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-lg">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Playbook</p>
            <h4 className="text-lg font-semibold text-white">Resolution checklist</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>1) Confirm project and milestone match the dispute.</li>
              <li>2) Attach at least one piece of evidence (screenshots, links, IPFS files).</li>
              <li>3) Add a clear resolution note: refund vs release.</li>
              <li>4) Submit and track the resolve transaction on-chain.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg space-y-3">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Shortcuts</div>
            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 px-3 py-2">
                <span>Open disputes</span>
                <span className="rounded-full bg-amber-500/20 px-2 py-1 text-xs text-amber-200">{stats.open}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 px-3 py-2">
                <span>Resolved</span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-200">{stats.resolved}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 px-3 py-2">
                <span>Total cases</span>
                <span className="rounded-full bg-slate-700 px-2 py-1 text-xs text-white">{stats.total}</span>
              </div>
            </div>
            <p className="text-xs text-slate-500">Keep MetaMask on Sepolia and share tx links for transparency.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Disputes;
