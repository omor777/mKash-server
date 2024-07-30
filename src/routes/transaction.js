import express from "express";
import {
  cashInController,
  cashOutController,
  getAgentTransactionController,
  sendMoneyController,
  TransactionApprovedController,
} from "../controller/transaction.js";
import authentication from "../middleware/authentication.js";
const router = express.Router();

router.get("/agent", authentication, getAgentTransactionController);

// send money to other user
router.post("/sendMoney", authentication, sendMoneyController);

// cash out request route
router.post("/cashOut", authentication, cashOutController);

router.post("/cashIn", authentication, cashInController);

// approved transaction request
router.patch("/agent/:id", authentication, TransactionApprovedController);

export default router;
