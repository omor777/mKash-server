import express from "express";
import { sendMoneyController } from "../controller/transaction.js";
import authentication from "../middleware/authentication.js";
const router = express.Router();

// send money to other user
router.post("/sendMoney",authentication, sendMoneyController);

export default router;
