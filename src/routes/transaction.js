import express from "express";
import {
  cashOutController,
  getAgentTransactionController,
  sendMoneyController,
} from "../controller/transaction.js";
import authentication from "../middleware/authentication.js";
const router = express.Router();

router.get("/agent", authentication, getAgentTransactionController);

// send money to other user
router.post("/sendMoney", authentication, sendMoneyController);

router.post("/cashOut", authentication, cashOutController);

export default router;
