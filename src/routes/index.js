import express from "express";
const router = express.Router();

import authRoutes from "./auth.js";
import userRoutes from "./user.js";
import transactionRoutes from "./transaction.js";
router.use("/api/v1/auth", authRoutes);
router.use("/api/v1/users", userRoutes);
router.use("/api/v1/transaction", transactionRoutes);

export default router;
