import User from "../model/user.models.js";
import error from "../utils/error.js";

const getAllUsersController = async (req, res, next) => {
  const search = req.query?.search || "";
  try {
    const query = {
      name: { $regex: search, $options: "i" },
      role: { $ne: "ADMIN" },
    };

    const users = await User.find(query);

    res.status(200).json(users);
  } catch (e) {
    next(e);
  }
};

const updateStatusController = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      throw error("User not found", 404);
    }

    if (user.account_status === "APPROVED") {
      throw error("This account is already approved", 400);
    }

    if (user.role === "USER") {
      user.account_status = "APPROVED";
      user.balance += 40;
    }
    if (user.role === "AGENT") {
      user.account_status = "APPROVED";
      user.balance += 10000;
    }
    await user.save();

    res.status(200).json({ success: true, message: "Account is approved" });
  } catch (e) {
    next(e);
  }
};

export { getAllUsersController, updateStatusController };
