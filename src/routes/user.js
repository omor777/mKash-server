import express from "express";
import isAdmin from "../middleware/isAdmin.js";
import {
  getAllUsersController,
  updateStatusController,
} from "../controller/user.js";
import authentication from "../middleware/authentication.js";
const router = express.Router();

router.get("/", getAllUsersController);
router.patch("/:userId", authentication, isAdmin, updateStatusController);

export default router;
