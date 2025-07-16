import axios from "axios"
import { Request } from "express"
import { NotificationPayload } from "../index.d"
import { notificationService } from "./notification.service"

export class WebhookService {
  private readonly webhookSecret: string

  constructor() {
    this.webhookSecret = process.env.WEBHOOK_SECRET || ""
  }

  public verifySignature(req: Request): boolean {
    const signature = req.headers["x-raven-signature"]

    console.log(signature)

    return true
  }

  public async sendNotification(payload: NotificationPayload): Promise<void> {
    try {
      await notificationService.createNotification({
        userId: payload.userId,
        type: payload.type,
        message: payload.message,
        metadata: payload.metadata,
        status: "sent",
      })

      console.log(`Notification sent: ${payload.message}`)
    } catch (error) {
      console.error("Failed to send notification:", error)
      throw error
    }
  }
}

export const webhookService = new WebhookService()
