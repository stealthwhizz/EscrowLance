import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "./layout/DashboardLayout.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/auth/Login.jsx";
import Signup from "./pages/auth/Signup.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import CreateProject from "./pages/projects/CreateProject.jsx";
import Projects from "./pages/projects/Projects.jsx";
import ProjectDetails from "./pages/projects/ProjectDetails.jsx";
import SubmitMilestone from "./pages/milestones/SubmitMilestone.jsx";
import Transactions from "./pages/transactions/Transactions.jsx";
import Disputes from "./pages/disputes/Disputes.jsx";
import Wallet from "./pages/wallet/Wallet.jsx";
import Profile from "./pages/profile/Profile.jsx";
import { useAuth } from "./context/AuthContext.jsx";

const Protected = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <p className="p-6">Loading...</p>;
  return user ? children : <Navigate to="/login" />;
};

const App = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />

    <Route
      path="/"
      element={
        <Protected>
          <DashboardLayout />
        </Protected>
      }
    >
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="projects" element={<Projects />} />
      <Route path="projects/new" element={<CreateProject />} />
      <Route path="projects/:id" element={<ProjectDetails />} />
      <Route path="milestones/submit" element={<SubmitMilestone />} />
      <Route path="transactions" element={<Transactions />} />
      <Route path="disputes" element={<Disputes />} />
      <Route path="wallet" element={<Wallet />} />
      <Route path="profile" element={<Profile />} />
    </Route>
  </Routes>
);

export default App;
