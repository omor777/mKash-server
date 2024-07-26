import { model, Schema } from "mongoose";

const transactionSchema = new Schema(
  {
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
      required: true,
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED"],
    },
    fee: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Transaction = model("Transaction", transactionSchema);
export default Transaction;
