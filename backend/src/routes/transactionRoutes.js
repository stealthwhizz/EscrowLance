import express from "express";
import { listTransactions, saveTransaction } from "../controllers/transactionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, listTransactions);
router.post("/save", protect, saveTransaction);

export default router;
