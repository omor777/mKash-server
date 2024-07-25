import error from "../utils/error.js";

const isAdmin = (req, _res, next) => {
  try {
    if (req.user.role !== "ADMIN") {
      throw error("Only Admin Can Access This Route", 400);
    }
    next();
  } catch (e) {
    next(e);
  }
};

export default isAdmin;
