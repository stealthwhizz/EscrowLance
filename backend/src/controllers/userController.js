import User from "../models/User.js";

export const listFreelancers = async (_req, res) => {
  const freelancers = await User.find({ role: "freelancer" })
    .select("name email walletAddress role")
    .sort({ createdAt: -1 });
  res.json(freelancers);
};