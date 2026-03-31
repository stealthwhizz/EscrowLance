import React from "react";
import { Link } from "react-router-dom";

const Landing = () => (
  <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-6">
    <div className="max-w-3xl text-center space-y-6">
      <p className="text-primary uppercase tracking-widest text-xs">On-chain escrow</p>
      <h1 className="text-4xl md:text-5xl font-bold">Build trust with milestone-based smart contracts</h1>
      <p className="text-slate-400">
        ChainEscrow lets clients fund work securely, freelancers submit verifiable proofs, and payments release automatically when milestones are approved.
      </p>
      <div className="flex gap-4 justify-center">
        <Link className="bg-primary px-5 py-3 rounded text-white" to="/signup">Get started</Link>
        <Link className="border border-slate-700 px-5 py-3 rounded" to="/login">Login</Link>
      </div>
    </div>
  </div>
);

export default Landing;
