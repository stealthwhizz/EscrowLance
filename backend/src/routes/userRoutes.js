import express from "express";
import { listFreelancers } from "../controllers/userController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/freelancers", protect, requireRole(["client", "admin"]), listFreelancers);

export default router;