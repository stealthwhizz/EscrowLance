import express from "express";
import {
  createMilestone,
  submitMilestone,
  approveMilestone,
  releasePayment,
  listByProject,
} from "../controllers/milestoneController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, requireRole(["client", "admin"]), createMilestone);
router.post("/submit", protect, requireRole(["freelancer"]), submitMilestone);
router.post("/approve", protect, requireRole(["client", "admin"]), approveMilestone);
router.post("/release", protect, requireRole(["client", "admin"]), releasePayment);
router.get("/project/:projectId", protect, listByProject);

export default router;
