import React from "react";

const StatCard = ({ label, value, icon }) => (
  <div className="bg-card border border-slate-800 rounded-lg p-4 shadow-lg shadow-primary/5">
    <div className="text-slate-400 text-sm flex items-center gap-2">{icon}{label}</div>
    <div className="text-2xl font-bold mt-2">{value}</div>
  </div>
);

export default StatCard;
