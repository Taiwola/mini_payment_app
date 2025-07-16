import express from "express"
import { handleWebhook } from "../controller/webhook.controller"

const router = express.Router()

router.post("/", express.raw({ type: "*/*" }), handleWebhook)

export default router
