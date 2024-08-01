import Transaction from "../model/transaction.models.js";
import User from "../model/user.models.js";
import { checkHashPassword } from "../service/hashPassword.js";
import error from "../utils/error.js";
import { v4 as uuidv4 } from "uuid";

const sendMoneyController = async (req, res, next) => {
  const { pin, mobile_number, balance, transaction_type } = req.body;

  const transaction_id = uuidv4();
  let fee;
  try {
    if (!pin || !mobile_number || !balance || !transaction_type) {
      throw error("All field is required", 400);
    }
    const receiverUser = await User.findOne({ mobile_number });
    const senderUser = await User.findById({ _id: req.user.id });
    //    console.log(receiverUser);
    if (!receiverUser) {
      throw error("Provided number do not have any account", 404);
    }
    if (balance < 50) {
      throw error("Balance must be minimum 50tk", 400);
    }
    if (balance > senderUser.balance) {
      throw error("Do not have sufficient balance!", 400);
    }
    // check is provided pic is correct
    const isMatch = await checkHashPassword({
      pass: pin,
      hashPass: senderUser.pin,
    });
    if (!isMatch) {
      throw error("Your pin is incorrect!", 400);
    }
    if (balance >= 100) {
      senderUser.balance -= parseInt(balance) + 5;
      fee = 5;
      receiverUser.balance += parseInt(balance);
    } else {
      senderUser.balance -= parseInt(balance);
      receiverUser.balance += parseInt(balance);
    }
    const sendMoney = new Transaction({
      transaction_type,
      amount: balance,
      fee,
      from: senderUser._id,
      to: receiverUser._id,
      transaction_id,
    });
    await senderUser.save();
    await receiverUser.save();
    await sendMoney.save();
    res.status(201).json({ success: true, message: "Send money successful" });
  } catch (e) {
    next(e);
  }
};

const cashOutController = async (req, res, next) => {
  const { pin, agent_number, balance, transaction_type } = req.body;

  const transaction_id = uuidv4();

  const fee = balance * (1.5 / 100);

  try {
    if (!pin || !agent_number || !balance || !transaction_type) {
      throw error("All input field are required", 400);
    }
    const agentUser = await User.findOne({ mobile_number: agent_number });
    const user = await User.findById(req.user.id);

    if (!agentUser) {
      throw error("Phone number is incorrect", 404);
    }
    if (agentUser.role !== "AGENT") {
      throw error("Please provide an agent number", 400);
    }
    if (balance < 50) {
      throw error("Amount minimum 50tk required", 400);
    }

    const isMatch = await checkHashPassword({ pass: pin, hashPass: user.pin });
    if (!isMatch) {
      throw error("Pin is incorrect!", 400);
    }
    if (balance + fee > user.balance) {
      throw error("Do not have sufficient balance", 400);
    }

    const cashOut = new Transaction({
      transaction_type,
      amount: balance,
      transaction_id,
      from: user._id,
      to: agentUser._id,
      fee,
      status: "PENDING",
    });

    await cashOut.save();

    res.status(201).json({
      success: true,
      message: "Cashout request successful wait for agent approval",
    });
  } catch (e) {
    next(e);
  }
};

const cashInController = async (req, res, next) => {
  const { pin, agent_number, balance, transaction_type } = req.body;

  const transaction_id = uuidv4();

  try {
    if (!pin || !agent_number || !balance || !transaction_type) {
      throw error("All input field are required", 400);
    }
    const agentUser = await User.findOne({ mobile_number: agent_number });
    const user = await User.findById(req.user.id);

    if (!agentUser) {
      throw error("Phone number is incorrect", 404);
    }
    if (agentUser.role !== "AGENT") {
      throw error("Please provide an agent number", 400);
    }
    if (balance < 50) {
      throw error("Amount minimum 50tk required", 400);
    }

    const isMatch = await checkHashPassword({ pass: pin, hashPass: user.pin });
    if (!isMatch) {
      throw error("Pin is incorrect!", 400);
    }

    const cashOut = new Transaction({
      transaction_type,
      amount: balance,
      transaction_id,
      from: user._id,
      to: agentUser._id,
      status: "PENDING",
    });

    await cashOut.save();

    res.status(201).json({
      success: true,
      message: "Cashin request successful wait for agent approval",
    });
  } catch (e) {
    next(e);
  }
};

const getAgentTransactionController = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  try {
    if (req.user.role !== "AGENT") {
      throw error("This route only agent can access", 400);
    }
    const transactions = await Transaction.find({
      to: req.user.id,
    })
      .populate("from")
      .skip((page - 1) * limit)
      .limit(limit);

    const transactionCount = await Transaction.countDocuments({
      to: req.user.id,
    });

    const hasMore = page * limit < transactionCount;

    res.status(200).json({
      success: true,
      data: transactions,
      totalPages: Math.ceil(transactionCount / limit),
      currentPage: page,
      hasMore,
    });
  } catch (e) {
    next(e);
  }
};

const TransactionApprovedController = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (req.user.role !== "AGENT") {
      throw error("Unauthorized access", 401);
    }

    const transaction = await Transaction.findById(id);
    const user = await User.findById(transaction.from);
    const agent = await User.findById(req.user.id);

    if (!transaction) {
      throw error("Document not found", 404);
    }
    if (!user) {
      throw error("User not found", 404);
    }
    if (!agent) {
      throw error("User not found", 404);
    }

    if (transaction.transaction_type === "cashOut") {
      if (user.balance < transaction.amount + transaction.fee) {
        transaction.status = "FAILED";
        await transaction.save();
        throw error("User do not have sufficient balance");
      }

      user.balance -= transaction.amount + transaction.fee;
      agent.balance += transaction.amount + transaction.fee;
      transaction.status = "COMPLETED";
    } else {
      // check if agent have sufficient balance
      if (agent.balance < transaction.amount) {
        transaction.status = "FAILED";
        await transaction.save();
        throw error("Agent do not have sufficient balance", 400);
      } else {
        user.balance += transaction.amount;
        agent.balance -= transaction.amount;
        transaction.status = "COMPLETED";
      }
    }

    const message =
      transaction.transaction_type === "cashOut"
        ? "Cashout successful"
        : "Cashin successful";

    await user.save();
    await agent.save();
    await transaction.save();

    res.status(200).json({ success: true, message });
  } catch (e) {
    next(e);
  }
};

const getAllTransactionHistoryController = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    if (req.user.role === "USER") {
      throw error("User can not access this route", 400);
    }

    if (req.user.role === "ADMIN") {
      const transactions = await Transaction.find({ status: "COMPLETED" })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("from")
        .populate("to");
      const totalCounts = await Transaction.countDocuments({
        status: "COMPLETED",
      });
      const hasMore = page * limit < totalCounts;

      res.status(200).json({
        success: true,
        data: transactions,
        currentPage: page,
        totalPages: Math.ceil(totalCounts / limit),
        hasMore,
      });
    } else {
      const transactions = await Transaction.find({ status: "COMPLETED" })
        .sort({
          createdAt: -1,
        })
        .limit(20)
        .populate("from");

      res.status(200).json({ success: true, data: transactions });
    }
  } catch (e) {
    next(e);
  }
};

export {
  sendMoneyController,
  cashOutController,
  cashInController,
  getAgentTransactionController,
  TransactionApprovedController,
  getAllTransactionHistoryController,
};
