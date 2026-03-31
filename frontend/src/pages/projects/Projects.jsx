import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProjects } from "../../services/api.js";

const Projects = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProjects().then(setProjects).catch(console.error);
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Projects</h3>
      <div className="grid md:grid-cols-2 gap-3">
        {projects.map((p) => (
          <Link
            key={p._id}
            to={`/projects/${p._id}`}
            className="block border border-slate-800 rounded p-4 bg-slate-900 hover:border-primary"
          >
            <div className="text-sm text-slate-400">Status: {p.status}</div>
            <div className="font-semibold">{p.title}</div>
            <div className="text-slate-400 text-sm">Budget: {p.budget} ETH</div>
          </Link>
        ))}
        {!projects.length && <p className="text-slate-400">No projects yet.</p>}
      </div>
    </div>
  );
};

export default Projects;
