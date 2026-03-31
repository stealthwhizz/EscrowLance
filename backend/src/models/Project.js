import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    budget: { type: Number, required: true },
    deadline: { type: Date },
    status: {
      type: String,
      enum: [
        "Created",
        "Funded",
        "InProgress",
        "Submitted",
        "Completed",
        "Cancelled",
        "Disputed",
      ],
      default: "Created",
    },
    contractProjectId: { type: Number },
    funded: { type: Boolean, default: false },
    remainingBalance: { type: Number, default: 0 },
    milestones: [{ type: mongoose.Schema.Types.ObjectId, ref: "Milestone" }],
    createTxHash: String,
    fundTxHash: String,
    assignTxHash: String,
    refundTxHash: String,
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);
export default Project;
