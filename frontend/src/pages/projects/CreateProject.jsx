import React, { useEffect, useState } from "react";
import { createProject, listFreelancers } from "../../services/api.js";

const newMilestone = () => ({ title: "", description: "", amount: "", deadline: "" });

const CreateProject = () => {
  const [form, setForm] = useState({ title: "", description: "", budget: "", deadline: "", freelancerId: "" });
  const [milestones, setMilestones] = useState([newMilestone()]);
  const [message, setMessage] = useState(null);
  const [freelancers, setFreelancers] = useState([]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const updateMilestone = (idx, key, value) => {
    const copy = [...milestones];
    copy[idx][key] = value;
    setMilestones(copy);
  };

  const addMilestone = () => setMilestones([...milestones, newMilestone()]);

  useEffect(() => {
    listFreelancers().then(setFreelancers).catch(console.error);
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    const sum = milestones.reduce((acc, m) => acc + Number(m.amount || 0), 0);
    if (!form.title || !form.description || !form.budget) {
      setMessage("Title, description, and budget are required");
      return;
    }
    if (Number(form.budget) <= 0) {
      setMessage("Budget must be greater than 0");
      return;
    }
    if (form.deadline && new Date(form.deadline) < new Date()) {
      setMessage("Deadline must be in the future");
      return;
    }
    if (Math.abs(sum - Number(form.budget)) > 1e-9) {
      setMessage("Milestone total must equal budget");
      return;
    }
    const payload = {
      ...form,
      budget: Number(form.budget),
      milestones: milestones.map((m) => ({
        ...m,
        amount: Number(m.amount),
      })),
    };
    const res = await createProject(payload);
    setMessage(`Project created with id ${res.project._id}`);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded p-6">
      <h3 className="text-xl font-semibold mb-4">Create project</h3>
      <form onSubmit={onSubmit} className="space-y-4">
        <input className="w-full bg-slate-800 px-3 py-2 rounded" name="title" placeholder="Title" onChange={onChange} />
        <textarea className="w-full bg-slate-800 px-3 py-2 rounded" name="description" placeholder="Description" onChange={onChange} />
        <input className="w-full bg-slate-800 px-3 py-2 rounded" name="budget" placeholder="Budget (ETH)" onChange={onChange} />
        <input className="w-full bg-slate-800 px-3 py-2 rounded" type="date" name="deadline" onChange={onChange} />
        <select
          className="w-full bg-slate-800 px-3 py-2 rounded text-sm"
          name="freelancerId"
          value={form.freelancerId}
          onChange={onChange}
        >
          <option value="">Select freelancer (optional)</option>
          {freelancers.map((f) => (
            <option key={f._id} value={f._id}>
              {f.name} — {f.email}
            </option>
          ))}
        </select>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold">Milestones</p>
            <button type="button" onClick={addMilestone} className="text-sm text-primary">+ Add</button>
          </div>
          {milestones.map((m, idx) => (
            <div key={idx} className="grid md:grid-cols-4 gap-2">
              <input className="bg-slate-800 px-3 py-2 rounded" placeholder="Title" value={m.title} onChange={(e) => updateMilestone(idx, "title", e.target.value)} />
              <input className="bg-slate-800 px-3 py-2 rounded" placeholder="Description" value={m.description} onChange={(e) => updateMilestone(idx, "description", e.target.value)} />
              <input className="bg-slate-800 px-3 py-2 rounded" placeholder="Amount (ETH)" value={m.amount} onChange={(e) => updateMilestone(idx, "amount", e.target.value)} />
              <input className="bg-slate-800 px-3 py-2 rounded" type="date" placeholder="Deadline" value={m.deadline} onChange={(e) => updateMilestone(idx, "deadline", e.target.value)} />
            </div>
          ))}
        </div>

        <button className="bg-primary px-4 py-2 rounded" type="submit">Create</button>
        {message && <p className="text-sm text-emerald-400">{message}</p>}
      </form>
    </div>
  );
};

export default CreateProject;
