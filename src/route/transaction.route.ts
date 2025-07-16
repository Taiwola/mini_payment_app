import express from "express"
import { authentication } from "../middleware/authenticate"
import { getTransactionHistory } from "../controller/transaction.controller"

const router = express.Router()

router.get("/", authentication, getTransactionHistory)

export default router
