import express from "express"
import { login, register } from "../controller/auth.controller"

const router = express.Router()

router.post("/register", register)
router.post("/login", login)

export default router
