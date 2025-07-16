import { Request, Response } from "express"
import { transactionService } from "../service/transaction.service"
import { accountService } from "../service/account.service"

export const getTransactionHistory = async (req: Request, res: Response) => {
  const userId = req.user?.id
  const { transactionType } = req.query

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" })
  }

  if (
    transactionType !== "transfer" &&
    transactionType !== "withdrawal" &&
    transactionType !== "deposit"
  ) {
    return res.status(400).json({
      message:
        "Invalid transaction type. Must be 'transfer', 'withdrawal', or 'deposit'.",
    })
  }

  try {
    const userAccount = await accountService.getAccountByUserId(userId)
    const transactions = await transactionService.getTransactionByOptions({
      accountId: userAccount?.id,
      transactionType: transactionType as "transfer" | "withdrawal" | "deposit",
    })

    if (!transactions || transactions.length === 0) {
      return res.status(404).json({ message: "No transactions found" })
    }

    res.status(200).json(transactions)
  } catch (error) {
    console.error("Error fetching transaction history:", error)
    res.status(500).json({
      message: "Error fetching transaction history",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
