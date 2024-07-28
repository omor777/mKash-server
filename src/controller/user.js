import User from "../model/user.models.js";
import error from "../utils/error.js";

const getAllUsersController = async (req, res, next) => {
  const search = req.query?.search || "";
  const page = parseInt(req.query?.page) || 1;
  const limit = parseInt(req.query?.limit) || 10;
  try {
    const query = {
      name: { $regex: search, $options: "i" },
      role: { $ne: "ADMIN" },
    };

    const totalItems = await User.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      totalItems,
      totalPages,
      currentPage: page,
      pageSize: limit,
      users,
    });
  } catch (e) {
    next(e);
  }
};

const getSingleUserController = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw error("User not found", 404);
    }

    res.status(200).json(user);
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

export {
  getAllUsersController,
  updateStatusController,
  getSingleUserController,
};
