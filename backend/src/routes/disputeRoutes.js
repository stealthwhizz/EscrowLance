import express from "express";
import { createDispute, resolveDispute, listDisputes, addComment, addEvidence } from "../controllers/disputeController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, createDispute);
router.post("/resolve", protect, requireRole(["admin", "client"]), resolveDispute);
router.get("/", protect, listDisputes);
router.post("/:id/comment", protect, addComment);
router.post("/:id/evidence", protect, addEvidence);

export default router;
