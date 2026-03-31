import React, { useEffect, useState } from "react";
import StatCard from "../../components/StatCard.jsx";
import { fetchProjects, listTransactions } from "../../services/api.js";
import MilestoneCard from "../../components/MilestoneCard.jsx";

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchProjects().then(setProjects).catch(console.error);
    listTransactions().then(setTransactions).catch(console.error);
  }, []);

  const activeMilestones = projects
    .flatMap((p) => (p.milestones || []).map((m) => ({ ...m, projectId: p._id, projectTitle: p.title })))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <StatCard label="Projects" value={projects.length} />
        <StatCard label="Transactions" value={transactions.length} />
        <StatCard label="Active Milestones" value={activeMilestones.length} />
      </div>

      <section>
        <h3 className="text-lg font-semibold mb-2">Recent milestones</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {activeMilestones.map((m) => (
            <MilestoneCard key={m._id} milestone={m} />
          ))}
          {!activeMilestones.length && <p className="text-slate-400">No milestones yet.</p>}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
