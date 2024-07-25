import error from "../utils/error.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const authentication = async (req, _res, next) => {
  try {
    const authHeader = req.headers?.authorization;
    const token = authHeader.split(" ")[1];

    if (!token) {
      throw error("Unauthorized Access", 401);
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        throw error("Forbidden access", 403);
      }
      req.user = decoded;
      next();
    });
  } catch (e) {
    next(e);
  }
};

export default authentication;
