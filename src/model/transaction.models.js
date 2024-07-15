import { model, Schema } from "mongoose";

const transactionSchema = new Schema({
  transaction_type: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  transaction_id: {
    type: String,
    required: true,
  },
  from: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  to: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  status: {
    type: String,
    enum: ["PENDING", "COMPLETED", "FAILED"],
  },
  fee: {
    type: Number,
  },
});

const Transaction = model("Transaction", transactionSchema);
export default Transaction;
