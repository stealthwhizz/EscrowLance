import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

const Signup = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "client", walletAddress: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await register(form);
      login(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setError("Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-8 rounded w-full max-w-md space-y-4">
        <h2 className="text-2xl font-semibold">Create account</h2>
        <input className="w-full bg-slate-800 px-4 py-3 rounded" name="name" placeholder="Name" onChange={onChange} />
        <input className="w-full bg-slate-800 px-4 py-3 rounded" name="email" placeholder="Email" onChange={onChange} />
        <input className="w-full bg-slate-800 px-4 py-3 rounded" type="password" name="password" placeholder="Password" onChange={onChange} />
        <input className="w-full bg-slate-800 px-4 py-3 rounded" name="walletAddress" placeholder="Wallet address" onChange={onChange} />
        <select className="w-full bg-slate-800 px-4 py-3 rounded" name="role" onChange={onChange}>
          <option value="client">Client</option>
          <option value="freelancer">Freelancer</option>
        </select>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button className="w-full bg-primary py-3 rounded" type="submit">Sign up</button>
        <p className="text-sm text-slate-400">Have an account? <Link className="text-primary" to="/login">Login</Link></p>
      </form>
    </div>
  );
};

export default Signup;
