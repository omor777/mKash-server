import Transaction from "../model/transaction.models.js";
import User from "../model/user.models.js";
import error from "../utils/error.js";
import bcrypt from "bcryptjs";
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
    const hashPin = await bcrypt.compare(pin, senderUser.pin);
    if (!hashPin) {
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

export { sendMoneyController };
