import { Knex } from "knex"
import {
  CreateNotificationInput,
  FindNotificationOptions,
  Notification,
  UpdateNotificationInput,
} from "../index.d"
import knexInstance from "../config/kenex"

export class NotificationRepository {
  private readonly tableName = "notifications"

  constructor(private readonly knex: Knex) {}

  private getQueryBuilder(trx?: Knex.Transaction) {
    return trx ? trx(this.tableName) : this.knex(this.tableName)
  }

  async create(
    notification: CreateNotificationInput,
    trx?: Knex.Transaction
  ): Promise<number> {
    try {
      const [newNotification] = await this.getQueryBuilder(trx).insert({
        ...notification,
      })
      return newNotification
    } catch (error) {
      throw new Error(
        `Failed to create notification: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  async findById(
    id: number,
    trx?: Knex.Transaction
  ): Promise<Notification | null> {
    try {
      const notification = await this.getQueryBuilder(trx).where({ id }).first()
      return notification || null
    } catch (error) {
      throw new Error(
        `Failed to find notification by id: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  async findByUserId(
    userId: number,
    trx?: Knex.Transaction
  ): Promise<Notification[]> {
    try {
      return await this.getQueryBuilder(trx)
        .where({ userId })
        .orderBy("createdAt", "desc")
    } catch (error) {
      throw new Error(
        `Failed to find notifications by user id: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  async findByOptions(
    options: FindNotificationOptions,
    trx?: Knex.Transaction
  ): Promise<Notification[]> {
    try {
      const query = this.getQueryBuilder(trx)

      if (options.userId) {
        query.where("userId", options.userId)
      }
      if (options.type) {
        query.where("type", options.type)
      }
      if (options.status) {
        query.where("status", options.status)
      }
      if (options.startDate) {
        query.where("createdAt", ">=", options.startDate)
      }
      if (options.endDate) {
        query.where("createdAt", "<=", options.endDate)
      }

      return await query.orderBy("createdAt", "desc")
    } catch (error) {
      throw new Error(
        `Failed to find notifications by options: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  async update(
    id: number,
    updates: UpdateNotificationInput,
    trx?: Knex.Transaction
  ): Promise<Notification | null> {
    try {
      const [updatedNotification] = await this.getQueryBuilder(trx)
        .where({ id })
        .update({
          ...updates,
          updatedAt: this.knex.fn.now(),
        })
        .returning("*")
      return updatedNotification || null
    } catch (error) {
      throw new Error(
        `Failed to update notification: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  async markAsRead(id: number, trx?: Knex.Transaction): Promise<boolean> {
    try {
      const result = await this.getQueryBuilder(trx)
        .where({ id })
        .update({ status: "read", updatedAt: this.knex.fn.now() })
      return result > 0
    } catch (error) {
      throw new Error(
        `Failed to mark notification as read: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  async delete(id: number, trx?: Knex.Transaction): Promise<boolean> {
    try {
      const result = await this.getQueryBuilder(trx).where({ id }).del()
      return result > 0
    } catch (error) {
      throw new Error(
        `Failed to delete notification: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }
}

export const notificationRepository = new NotificationRepository(knexInstance)
