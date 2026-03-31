import mongoose from "mongoose";

const milestoneSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    title: { type: String, required: true },
    description: String,
    amount: { type: Number, required: true },
    deadline: { type: Date },
    status: {
      type: String,
      enum: ["Pending", "Submitted", "Approved", "Paid", "Disputed"],
      default: "Pending",
    },
    ipfsHash: String,
    workHash: String,
    contractMilestoneId: Number,
    submitTxHash: String,
    approveTxHash: String,
    payTxHash: String,
  },
  { timestamps: true }
);

const Milestone = mongoose.model("Milestone", milestoneSchema);
export default Milestone;
