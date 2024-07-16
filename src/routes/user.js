import express from 'express'
import { getAllUsersController } from '../controller/user.js'
const router = express.Router()


router.get('/',getAllUsersController)

export default router