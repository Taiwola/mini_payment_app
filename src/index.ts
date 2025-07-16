import dotenv from "dotenv"
dotenv.config()

import express from "express"
import options from "./config/db"
import knex from "knex"
import morgan from "morgan"

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number
        email: string
      }
    }
  }
}

const app = express()
const PORT = process.env.PORT || "5000"

app.use(express.json())
app.use(morgan("dev"))

const db = knex(options)

async function testDbConnection() {
  try {
    await db.raw("SELECT 1 + 1 AS result")
    console.log("Database connected successfully!")
  } catch (error) {
    console.error("Failed to connect to the database:", error)
  }
}

testDbConnection()

import authRoutes from "./route/auth.route"
import accountRoutes from "./route/account.route"
import webhookRoutes from "./route/webhook.route"
import transactionRoutes from "./route/transaction.route"

app.get("/", (req, res) => {
  res.json({ message: "Hello" })
})

app.use("/api/auth", authRoutes)
app.use("/api/account", accountRoutes)
app.use("/api/webhook", webhookRoutes)
app.use("/api/transactions", transactionRoutes)

app.listen(PORT, () => {
  console.log(`Server started at ${PORT}`)
})
