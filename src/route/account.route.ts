import express from "express"
import { createAccount, transferFunds } from "../controller/account.controller"
import { authentication } from "../middleware/authenticate"

const router = express.Router()

router.post("/create", authentication, createAccount)
router.post("/transfer", authentication, transferFunds)

export default router
