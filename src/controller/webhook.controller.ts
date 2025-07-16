import { Request, Response } from "express"
import { AtlasWebhookPayload } from "../index.d"
import { webhookService } from "../service/webhook.service"
import { transactionService } from "../service/transaction.service"
import { accountService } from "../service/account.service"

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const payload: AtlasWebhookPayload = req.body

    const isValid = webhookService.verifySignature(req)
    if (!isValid) {
      return res.status(401).json({ message: "Invalid webhook signature" })
    }

    switch (payload.event) {
      case "transfer.success":
        await handleTransferSuccess(payload)
        break

      case "transfer.failed":
        await handleTransferFailed(payload)
        break

      case "deposit.success":
        await handleDepositSuccess(payload)
        break

      default:
        console.warn("Unhandled webhook event:", payload.event)
    }

    res.status(200).json({ message: "Webhook processed" })
  } catch (error) {
    console.error("Webhook processing error:", error)
    res.status(500).json({
      message: "Error processing webhook",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

async function handleTransferSuccess(payload: AtlasWebhookPayload) {
  const { data } = payload
  const transaction = await transactionService.findByReference(data.reference)

  if (!transaction) {
    throw new Error(`Transaction not found for reference: ${data.reference}`)
  }

  await transactionService.updateTransaction(transaction.id, {
    status: "completed",
    recipientAccountNumber: data.recipient_account_number,
    recipientBank: data.recipient_bank,
    webhookEventId: payload.id,
  })

  const account = await accountService.getAccountById(transaction.accountId)

  if (!account) {
    throw new Error(`Account not found for ID: ${transaction.accountId}`)
  }

  await webhookService.sendNotification({
    userId: account.userId,
    type: "transfer_success",
    message: `Your transfer of ${data.amount} to ${data.recipient_account_number} was successful`,
    metadata: {
      amount: data.amount,
      reference: data.reference,
      recipient: data.recipient_account_number,
    },
  })
}

async function handleDepositSuccess(payload: AtlasWebhookPayload) {
  const { data } = payload
  const account = await accountService.getAccountByAccountNumber(
    data.account_number as string
  )

  if (!account) {
    throw new Error(`Account not found: ${data.account_number}`)
  }

  await webhookService.sendNotification({
    userId: account.userId,
    type: "deposit_success",
    message: `Your account has been credited with ${data.amount}`,
    metadata: {
      amount: data.amount,
      reference: data.reference,
    },
  })
}

async function handleTransferFailed(payload: AtlasWebhookPayload) {
  const { data } = payload
  const transaction = await transactionService.findByReference(data.reference)

  if (!transaction) {
    throw new Error(`Transaction not found for reference: ${data.reference}`)
  }

  await transactionService.updateTransaction(transaction.id, {
    status: "failed",
    description: data.reason || "Transfer failed",
    webhookEventId: payload.id,
  })

  if (transaction.transactionType === "transfer") {
    const account = await accountService.getAccountById(transaction.accountId)
    await accountService.updateAccount(account?.id as number, {
      balance: (account?.balance as number) + transaction.amount,
    })
  }

  const account = await accountService.getAccountById(transaction.accountId)

  await webhookService.sendNotification({
    userId: account?.userId as number,
    type: "transfer_failed",
    message: `Your transfer of ${data.amount} failed: ${
      data.reason || "Unknown reason"
    }`,
    metadata: {
      amount: data.amount,
      reference: data.reference,
      reason: data.reason,
    },
  })
}
