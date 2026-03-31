import React, { useEffect, useState } from "react";
import { submitMilestone, fetchProjects, listMilestones, uploadProofFile } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

const SubmitMilestone = () => {
  const [form, setForm] = useState({ projectId: "", milestoneId: "", workHash: "", ipfsHash: "" });
  const [message, setMessage] = useState(null);
  const [projects, setProjects] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const { user } = useAuth();
  const { addToast } = useToast();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  useEffect(() => {
    fetchProjects().then(setProjects).catch(console.error);
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
    setError(null);
    if (!form.projectId || !form.milestoneId) {
      setError("Select a project and milestone first");
      return;
    }
    const target = milestones.find((m) => m._id === form.milestoneId);
    if (target && target.status !== "Pending") {
      setError("Only Pending milestones can be submitted.");
      return;
    }
    setLoading(true);
    try {
      const data = await submitMilestone({ ...form, milestoneId: form.milestoneId });
      setMessage(`Submitted milestone ${data._id || form.milestoneId}`);
      addToast("Milestone submitted", "success");
    } catch (err) {
      console.error("Submit error:", err);
      const msg = err?.response?.data?.message || err?.message || "Submission failed. Check status or try again.";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const onUpload = async () => {
    if (!file) {
      setError("Choose a file to upload.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const res = await uploadProofFile(file);
      setForm((prev) => ({ ...prev, ipfsHash: res.ipfsHash }));
      setMessage(`Uploaded proof: ${res.ipfsHash}`);
      addToast("Proof uploaded to IPFS", "success");
    } catch (err) {
      console.error("Upload error:", err);
      const msg = err?.response?.data?.message || err?.message || "Upload failed. Try again.";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded p-6 max-w-xl">
      <h3 className="text-xl font-semibold mb-4">Submit milestone</h3>
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
        <input className="w-full bg-slate-800 px-3 py-2 rounded" name="workHash" placeholder="Work hash (e.g. IPFS)" onChange={onChange} />
        <div className="space-y-2">
          <input
            className="w-full bg-slate-800 px-3 py-2 rounded text-sm"
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <div className="flex items-center gap-3 text-sm">
            <button
              type="button"
              className="bg-slate-700 px-3 py-2 rounded disabled:opacity-60"
              onClick={onUpload}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload proof to IPFS"}
            </button>
            {form.ipfsHash && (
              <a className="text-primary underline" href={`https://ipfs.io/ipfs/${form.ipfsHash}`} target="_blank" rel="noreferrer">
                View proof
              </a>
            )}
          </div>
          <input className="w-full bg-slate-800 px-3 py-2 rounded" name="ipfsHash" placeholder="Or paste IPFS hash" value={form.ipfsHash} onChange={onChange} />
        </div>
        <div className="text-sm text-slate-300">Status: {form.milestoneId ? milestones.find((m) => m._id === form.milestoneId)?.status || "-" : "Select milestone"}</div>
        <button className="bg-primary px-4 py-2 rounded disabled:opacity-60" type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
        {message && <p className="text-sm text-emerald-400">{message}</p>}
        {error && <p className="text-sm text-amber-300">{error}</p>}
      </form>
    </div>
  );
};

export default SubmitMilestone;
