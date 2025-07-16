import { CreateNotificationInput, Notification } from "../index.d"
import {
  notificationRepository,
  NotificationRepository,
} from "../repository/notification.repository"
import { userService } from "./user.service"

export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository
  ) {}

  async createNotification(
    notification: CreateNotificationInput
  ): Promise<Notification> {
    try {
      const notificationId = await this.notificationRepository.create(
        notification
      )
      const createdNotification = await this.notificationRepository.findById(
        notificationId
      )

      if (!createdNotification) {
        throw new Error("Failed to retrieve created notification")
      }

      await this.sendNotificationThroughChannels(createdNotification)

      return createdNotification
    } catch (error) {
      throw new Error(
        `Failed to create notification: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  private async sendNotificationThroughChannels(
    notification: Notification
  ): Promise<void> {
    try {
      const user = await userService.getUserById(notification.userId)
      if (!user) {
        throw new Error(`User not found: ${notification.userId}`)
      }

      // Send email notification

      // Send push notification

      await this.notificationRepository.update(notification.id, {
        status: "delivered",
      })
    } catch (error) {
      console.error("Failed to send notification through all channels:", error)
      await this.notificationRepository.update(notification.id, {
        status: "failed",
      })
      throw error
    }
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    try {
      return await this.notificationRepository.findByUserId(userId)
    } catch (error) {
      throw new Error(
        `Failed to get user notifications: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    try {
      return await this.notificationRepository.findByOptions({
        userId,
        status: "pending",
      })
    } catch (error) {
      throw new Error(
        `Failed to get unread notifications: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    try {
      return await this.notificationRepository.markAsRead(id)
    } catch (error) {
      throw new Error(
        `Failed to mark notification as read: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  async getRecentNotifications(
    userId: number,
    limit: number = 5
  ): Promise<Notification[]> {
    try {
      const notifications = await this.notificationRepository.findByOptions({
        userId,
      })
      return notifications.slice(0, limit)
    } catch (error) {
      throw new Error(
        `Failed to get recent notifications: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }
}

export const notificationService = new NotificationService(
  notificationRepository
)
