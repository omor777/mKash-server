import User from "../model/user.models.js";
import error from "../utils/error.js";
import isEmail from "../utils/isEmail.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

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

    res.status(201).json({ success: true, user });
  } catch (e) {
    next(e);
  }
};

const loginController = async (req, res, next) => {
  const { identifier, pin } = req.body;
  try {
    if (!identifier || !pin) {
      throw error("Please provide both identifier and pin", 400);
    }

    const query = isEmail(identifier)
      ? { email: identifier }
      : { mobile_number: identifier };

    const user = await User.findOne(query);
    if (!user) {
      throw error("User Not Found!", 404);
    }

    const hashPin = user.pin;
    const isMatch = await bcrypt.compare(pin, hashPin);

    if (!isMatch) {
      throw error("Invalid Credential!", 401);
    }

    const token = jwt.sign(
      { id: user._doc._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30d" }
    );
    // Set the token in a cookie
    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "strict",
    // });

    res.status(200).json({ success: true, user,token });
  } catch (e) {
    next(e);
  }
};

export { registerController, loginController };
