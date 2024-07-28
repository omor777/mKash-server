import express from "express";
import isAdmin from "../middleware/isAdmin.js";
import {
  getAllUsersController,
  getSingleUserController,
  updateStatusController,
} from "../controller/user.js";
import authentication from "../middleware/authentication.js";
const router = express.Router();

router.get("/", getAllUsersController);

router.get("/single", authentication, getSingleUserController);

router.patch("/:userId", authentication, isAdmin, updateStatusController);

export default router;
