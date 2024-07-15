import { model, Schema } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    pin: {
      type: Number,
      required: true,
    },
    mobile_number: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["ADMIN", "AGENT", "USER"],
      required: true,
    },
    account_status: {
      type: String,
      enum: ["PENDING", "APPROVED"],
      default: "PENDING",
    },
    balance: {
      type: Number,
      default: 0.0,
    },
  },
  { timestamps: true }
);

const User = model("User", userSchema);
export default User;