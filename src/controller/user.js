import User from "../model/user.models.js";

const getAllUsersController = async (req, res, next) => {
  const search = req.query?.search || "";
  try {
    const query = {
      name: { $regex: search, $options: "i" },
      role: { $ne: "ADMIN" },
    };

    const users = await await User.find(query);

    res.status(200).json(users);
  } catch (e) {
    next(e);
  }
};

export { getAllUsersController };
