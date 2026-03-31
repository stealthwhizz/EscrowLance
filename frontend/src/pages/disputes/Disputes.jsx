import React, { useEffect, useState } from "react";
import { raiseDispute, listDisputes, resolveDispute, fetchProjects, listMilestones, addDisputeComment, addDisputeEvidence, uploadProofFile } from "../../services/api.js";
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

  return (
    <div className="space-y-6">
      <div className="max-w-lg bg-slate-900 border border-slate-800 rounded p-6">
        <h3 className="text-xl font-semibold mb-4">Raise a dispute</h3>
        <form className="space-y-3" onSubmit={onSubmit}>
          <select
            className="w-full bg-slate-800 px-3 py-2 rounded text-sm"
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
          <select
            className="w-full bg-slate-800 px-3 py-2 rounded text-sm"
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
          <textarea className="w-full bg-slate-800 px-3 py-2 rounded" name="reason" placeholder="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          <button className="bg-primary px-4 py-2 rounded" type="submit">Raise</button>
          {message && <p className="text-sm text-emerald-400">{message}</p>}
        </form>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded p-6">
        <h3 className="text-lg font-semibold mb-3">Your disputes</h3>
        <div className="space-y-3">
          {disputes.map((d) => (
            <div key={d._id} className="border border-slate-800 rounded p-3 bg-slate-800/50">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Project: {d.projectId?.title || d.projectId}</span>
                <span className="text-xs px-2 py-1 rounded bg-slate-700">{d.status}</span>
              </div>
              <div className="text-sm text-slate-400 mt-1">Milestone: {d.milestoneId?.title || d.milestoneId}</div>
              <div className="text-sm text-slate-200 mt-2">{d.reason}</div>
              {d.resolution && <div className="text-xs text-emerald-300 mt-1">Resolution: {d.resolution}</div>}
              <div className="text-xs text-slate-500 mt-1">Raised: {new Date(d.createdAt).toLocaleString()}</div>
              <div className="text-xs text-slate-500 mt-1 space-y-1">
                {d.raiseTxHash && (
                  <a className="text-primary underline" href={etherscanTx(d.raiseTxHash)} target="_blank" rel="noreferrer">
                    Raise tx
                  </a>
                )}
                {d.resolveTxHash && (
                  <a className="block text-primary underline" href={etherscanTx(d.resolveTxHash)} target="_blank" rel="noreferrer">
                    Resolve tx
                  </a>
                )}
              </div>
              {user?.role && ["client", "admin"].includes(user.role) && d.status === "Open" && (
                <div className="mt-3 space-y-2">
                  <textarea
                    className="w-full bg-slate-900 px-3 py-2 rounded text-sm"
                    placeholder="Resolution note"
                    value={resolutionDrafts[d._id]?.resolution || ""}
                    onChange={(e) => handleResolveChange(d._id, "resolution", e.target.value)}
                  />
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <label className="flex items-center gap-1">
                      <input
                        type="radio"
                        name={`refund-${d._id}`}
                        checked={resolutionDrafts[d._id]?.refundClient !== false}
                        onChange={() => handleResolveChange(d._id, "refundClient", true)}
                      />
                      Refund client
                    </label>
                    <label className="flex items-center gap-1">
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
                    className="bg-primary px-3 py-2 rounded text-sm"
                    type="button"
                    onClick={() => onResolve(d)}
                  >
                    Submit resolution
                  </button>
                </div>
              )}
              {Boolean(d.evidence?.length) && (
                <div className="mt-3 text-xs text-slate-300 space-y-1">
                  <div className="font-semibold text-slate-200">Evidence</div>
                  {d.evidence.map((ev) => (
                    <div key={ev._id || ev.ipfsHash} className="flex items-center gap-2">
                      <a className="text-primary underline" href={`https://ipfs.io/ipfs/${ev.ipfsHash}`} target="_blank" rel="noreferrer">
                        {ev.filename || ev.ipfsHash}
                      </a>
                      {ev.uploadedBy?.name && <span className="text-slate-500">by {ev.uploadedBy.name}</span>}
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3 space-y-2 text-xs text-slate-300">
                <div className="font-semibold text-slate-200">Comments</div>
                {d.comments?.map((c, idx) => (
                  <div key={idx} className="border border-slate-800 rounded p-2 bg-slate-900/60">
                    <div className="flex items-center justify-between">
                      <span>{c.text}</span>
                      <span className="text-slate-500">{c.user?.name || ""}</span>
                    </div>
                    <div className="text-slate-500">{c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}</div>
                  </div>
                ))}
                <textarea
                  className="w-full bg-slate-900 px-3 py-2 rounded text-sm"
                  placeholder="Add a comment"
                  value={commentDrafts[d._id] || ""}
                  onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [d._id]: e.target.value }))}
                />
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    className="text-xs text-slate-300"
                    onChange={(e) => setEvidenceDrafts((prev) => ({ ...prev, [d._id]: e.target.files?.[0] || null }))}
                  />
                  <button
                    className="bg-slate-700 px-2 py-1 rounded disabled:opacity-60"
                    type="button"
                    onClick={() => onEvidenceUpload(d)}
                    disabled={uploading}
                  >
                    {uploading ? "Uploading..." : "Attach evidence"}
                  </button>
                </div>
                <button
                  className="bg-primary px-3 py-2 rounded text-sm"
                  type="button"
                  onClick={() => onComment(d)}
                >
                  Post comment
                </button>
              </div>
            </div>
          ))}
          {!disputes.length && <p className="text-sm text-slate-500">No disputes yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default Disputes;
