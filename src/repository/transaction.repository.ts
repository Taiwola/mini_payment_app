import { Knex } from "knex"
import {
  CreateTransactionInput,
  FindTransactionOptions,
  ITransactionRepository,
  Transaction,
  UpdateTransactionInput,
} from "../index.d"
import knexInstance from "../config/kenex"

export class TransactionRepository implements ITransactionRepository {
  private readonly tableName = "transactions"

  constructor(readonly knex: Knex) {}

  private getQueryBuilder(trx?: Knex.Transaction) {
    return trx ? trx(this.tableName) : this.knex(this.tableName)
  }

  async create(
    transaction: CreateTransactionInput,
    trx?: Knex.Transaction
  ): Promise<number> {
    try {
      const [newTransaction] = await this.getQueryBuilder(trx).insert({
        ...transaction,
      })
      return newTransaction
    } catch (error) {
      console.error("Error creating transaction:", error)
      throw new Error(
        `Failed to create transaction: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  async findById(
    id: number,
    trx?: Knex.Transaction
  ): Promise<Transaction | null> {
    try {
      const transaction = await this.getQueryBuilder(trx).where({ id }).first()
      return transaction || null
    } catch (error) {
      console.error("Error finding transaction by id:", error)
      throw new Error(
        `Failed to find transaction by id: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  async findByReference(
    reference: string,
    trx?: Knex.Transaction
  ): Promise<Transaction | null> {
    try {
      const transaction = await this.getQueryBuilder(trx)
        .where({ transactionReference: reference })
        .first()
      return transaction || null
    } catch (error) {
      console.error("Error finding transaction by reference:", error)
      throw new Error(
        `Failed to find transaction by reference: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  async findByOptions(
    options: FindTransactionOptions,
    trx?: Knex.Transaction
  ): Promise<Transaction[] | null> {
    try {
      const query = this.getQueryBuilder(trx)

      if (options.id) {
        query.where("id", options.id)
      }
      if (options.accountId) {
        query.where("accountId", options.accountId)
      }
      if (options.transactionReference) {
        query.where("transactionReference", options.transactionReference)
      }
      if (options.webhookEventId) {
        query.where("webhookEventId", options.webhookEventId)
      }
      if (options.transactionType) {
        query.where("transactionType", options.transactionType)
      }
      if (options.status) {
        query.where("status", options.status)
      }

      const transactions = await query
      return transactions.length > 0 ? transactions : null
    } catch (error) {
      console.error("Error finding transaction by options:", error)
      throw new Error(
        `Failed to find transaction: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  async findAll(trx?: Knex.Transaction): Promise<Transaction[]> {
    try {
      return await this.getQueryBuilder(trx).select("*")
    } catch (error) {
      console.error("Error fetching all transactions:", error)
      throw new Error(
        `Failed to fetch transactions: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  async update(
    id: number,
    updates: UpdateTransactionInput,
    trx?: Knex.Transaction
  ): Promise<Transaction | null> {
    try {
      const [updatedTransaction] = await this.getQueryBuilder(trx)
        .where({ id })
        .update({
          ...updates,
          updatedAt: this.knex.fn.now(),
        })
        .returning("*")
      return updatedTransaction || null
    } catch (error) {
      console.error("Error updating transaction:", error)
      throw new Error(
        `Failed to update transaction: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  async updateStatusByReference(
    reference: string,
    status: "pending" | "completed" | "failed",
    trx?: Knex.Transaction
  ): Promise<boolean> {
    try {
      const result = await this.getQueryBuilder(trx)
        .where({ transactionReference: reference })
        .update({
          status,
          updatedAt: this.knex.fn.now(),
        })
      return result > 0
    } catch (error) {
      console.error("Error updating transaction status:", error)
      throw new Error(
        `Failed to update transaction status: ${
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
      console.error("Error deleting transaction:", error)
      throw new Error(
        `Failed to delete transaction: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }
}

export const transactionRepository = new TransactionRepository(knexInstance)
