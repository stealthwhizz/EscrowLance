import React from "react";
import { useAuth } from "../../context/AuthContext.jsx";

const Profile = () => {
  const { user } = useAuth();

  if (!user) return <p>No user loaded</p>;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded p-6 max-w-lg">
      <h3 className="text-xl font-semibold mb-4">Profile</h3>
      <div className="space-y-2">
        <div><span className="text-slate-400 text-sm">Name</span><div>{user.name}</div></div>
        <div><span className="text-slate-400 text-sm">Email</span><div>{user.email}</div></div>
        <div><span className="text-slate-400 text-sm">Role</span><div>{user.role}</div></div>
        <div><span className="text-slate-400 text-sm">Wallet</span><div className="font-mono text-sm">{user.walletAddress}</div></div>
      </div>
    </div>
  );
};

export default Profile;
