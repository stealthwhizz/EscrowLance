import Dispute from "../models/Dispute.js";
import Project from "../models/Project.js";
import Transaction from "../models/Transaction.js";
import {
  raiseDisputeOnChain,
  resolveDisputeOnChain,
} from "../services/blockchainService.js";

export const listDisputes = async (req, res) => {
  const filter = {};
  if (req.user.role === "client") {
    filter.raisedBy = req.user._id;
  } else if (req.user.role === "freelancer") {
    filter.raisedBy = req.user._id;
  }
  const disputes = await Dispute.find(filter)
    .sort({ createdAt: -1 })
    .populate("projectId")
    .populate("milestoneId")
    .populate("comments.user")
    .populate("evidence.uploadedBy");
  res.json(disputes);
};

export const createDispute = async (req, res) => {
  try {
    const { projectId, milestoneId, reason } = req.body;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (!project.contractProjectId || project.contractProjectId === undefined || project.contractProjectId === null) {
      return res.status(400).json({ message: `Project not deployed on-chain yet. Missing contractProjectId. Project ID: ${project._id}` });
    }

    console.log(`Raising dispute for project ${projectId} (contract ID: ${project.contractProjectId})`);
    const tx = await raiseDisputeOnChain({ projectId: project.contractProjectId, reason });
    console.log(`Dispute tx sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`Dispute tx mined: ${receipt.hash}`);

    const dispute = await Dispute.create({
      projectId,
      milestoneId,
      reason,
      raisedBy: req.user._id,
      raiseTxHash: receipt.hash,
    });
    project.status = "Disputed";
    await project.save();

    await Transaction.create({
      projectId,
      milestoneId,
      disputeId: dispute._id,
      txHash: receipt.hash,
      status: "Completed",
      action: "raiseDispute",
      userId: req.user._id,
    });
    res.status(201).json(dispute);
  } catch (err) {
    console.error("createDispute error:", err.message, err.stack);
    res.status(500).json({ message: `Dispute creation failed: ${err.message}` });
  }
};

export const resolveDispute = async (req, res) => {
  const { projectId, refundClient, resolution } = req.body;
  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: "Project not found" });

  const tx = await resolveDisputeOnChain({ projectId: project.contractProjectId, refundClient });
  const receipt = await tx.wait();
  await Dispute.updateMany({ projectId }, { status: "Resolved", resolution, resolveTxHash: receipt.hash });
  project.status = refundClient ? "Refunded" : "Completed";
  await project.save();

  await Transaction.create({
    projectId,
    txHash: receipt.hash,
    status: "Completed",
    action: "resolveDispute",
    userId: req.user._id,
  });

  res.json({ message: "Dispute resolved", txHash: receipt.hash });
};

export const addComment = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: "Comment text required" });
  const dispute = await Dispute.findById(id);
  if (!dispute) return res.status(404).json({ message: "Dispute not found" });
  dispute.comments.push({ text, user: req.user._id });
  await dispute.save();
  await dispute.populate("comments.user");
  res.json(dispute);
};

export const addEvidence = async (req, res) => {
  const { id } = req.params;
  const { ipfsHash, filename } = req.body;
  if (!ipfsHash) return res.status(400).json({ message: "ipfsHash required" });
  const dispute = await Dispute.findById(id);
  if (!dispute) return res.status(404).json({ message: "Dispute not found" });
  dispute.evidence.push({ ipfsHash, filename, uploadedBy: req.user._id });
  await dispute.save();
  await dispute.populate("evidence.uploadedBy");
  res.json(dispute);
};
