import { Request, Response } from "express"
import { atlasService } from "../service/atlas.service"
import { accountService } from "../service/account.service"
import { userService } from "../service/user.service"
import { transactionService } from "../service/transaction.service"
import { accountRepository } from "../repository/account.repository"

const reference = `TRF-${Date.now()}-${Math.random()
  .toString(36)
  .substring(2, 8)}`

export const createAccount = async (req: Request, res: Response) => {
  const userId = req.user?.id

  if (!userId) {
    res.status(400).json({ message: "User ID is required" })
    return
  }
  const userAccount = await accountService.getAccountByUserId(userId)

  if (userAccount) {
    res.status(400).json({ message: "Account already exists for this user" })
    return
  }
  const user = await userService.getUserById(userId)

  if (!user) {
    res.status(404).json({ message: "User not found" })
    return
  }

  try {
    const atlasResponse = await atlasService.generateAccount({
      first_name: user.fullName.split(" ")[0],
      last_name: user.fullName.split(" ")[1] || "",
      phone: user.phoneNo,
      amount: "100.00",
      email: user.email,
    })
  
    const accountData = {
      userId,
      accountNo: atlasResponse.data.account_number,
      balance: 100.0,
      currency: "NGN",
      bankName: atlasResponse.data.bank,
    }
    const account = await accountService.createAccount(accountData)

    res.status(201).json({
      message: "Account created successfully",
      account,
    })
  } catch (error) {
    console.error("Error creating account:", error)
    res.status(500).json({
      message: "Failed to create account",
      error: error instanceof Error ? error.message : "Internal server error",
    })
  }
}

export const transferFunds = async (req: Request, res: Response) => {
  const { amount, recipientAccountNo, bankName } = req.body
  const userId = req.user?.id

  if (!userId || !amount || !recipientAccountNo || !bankName) {
    res.status(400).json({
      message:
        "User ID, amount, bank name and recipient account number are required",
    })
    return
  }

  try {
    await accountRepository.knex.transaction(async (trx) => {
      const userAccount = await accountService.getAccountByUserId(userId, trx)

      if (!userAccount) {
        throw new Error("User account not found")
      }

      if (userAccount.balance < amount) {
        throw new Error("Insufficient funds")
      }

      const transaction = await transactionService.createTransaction(
        {
          accountId: userAccount.id,
          amount: parseFloat(amount.toString()),
          transactionType: "transfer",
          status: "pending",
          transactionReference: reference,
        },
        trx
      )


      await accountService.updateAccount(
        userAccount.id,
        { balance: userAccount.balance - amount },
        trx
      )

      const atlasTransfer = await atlasService.transferOrDepositFunds({
        amount: amount.toString(),
        account_number: recipientAccountNo,
        narration: `Transfer of ${amount} to ${recipientAccountNo}`,
        reference: transaction?.transactionReference as string,
        bankName: bankName,
      })

      await transactionService.updateTransaction(
        transaction?.id as number,
        { status: "completed" },
        trx
      )

      res.status(200).json({
        message: "Funds transferred successfully",
        atlasTransfer,
      })
    })
  } catch (error) {
    console.error("Error transferring funds:", error)
    res.status(500).json({
      message:
        error instanceof Error ? error.message : "Failed to transfer funds",
      error: error instanceof Error ? error.message : "Internal server error",
    })
  }
}
