import bcrypt from "bcryptjs";
import User from "../model/user.models.js";
import error from "../utils/error.js";
import isEmail from "../utils/isEmail.js";

const registerController = async (req, res, next) => {
  const { name, email, pin, mobile_number, role } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashPin = await bcrypt.hash(pin, salt);
    const alreadyExist = await User.findOne({ email });
    if (alreadyExist) {
      throw error("User Already Exist!", 400);
    }
    const user = new User({
      name,
      email,
      pin: hashPin,
      mobile_number,
      role,
    });
    await user.save();

    res.status(201).json(user);
  } catch (e) {
    next(e);
  }
};

const loginController = async (req, res, next) => {
 
};

export { registerController, loginController };
