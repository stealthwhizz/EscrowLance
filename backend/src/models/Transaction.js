import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    milestoneId: { type: mongoose.Schema.Types.ObjectId, ref: "Milestone" },
    disputeId: { type: mongoose.Schema.Types.ObjectId, ref: "Dispute" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: {
      type: String,
      enum: [
        "createProject",
        "fundProject",
        "assignFreelancer",
        "submitMilestone",
        "approveMilestone",
        "releasePayment",
        "raiseDispute",
        "resolveDispute",
        "refundClient",
      ],
    },
    amount: { type: Number },
    txHash: { type: String, required: true },
    status: { type: String, enum: ["Pending", "Completed", "Failed"], default: "Pending" },
    network: { type: String, default: "sepolia" },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
