import { Knex } from "knex"
import {
  Account,
  createAccountInput,
  FindAccountOptions,
  IAccountRepository,
  UpdateAccountInput,
} from "../index.d"
import knexInstance from "../config/kenex"

export class AccountRepository implements IAccountRepository {
  private readonly tableName = "accounts"

  constructor(readonly knex: Knex) {}

  private getQueryBuilder(trx?: Knex.Transaction) {
    return trx ? trx(this.tableName) : this.knex(this.tableName)
  }

  async create(
    account: createAccountInput,
    trx?: Knex.Transaction
  ): Promise<number> {
    try {
      const query = this.getQueryBuilder(trx)
      const [newAccount] = await query.insert(account).returning("id")
      return newAccount.id
    } catch (error) {
      throw new Error(
        `Failed to create account: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  async findById(id: number, trx?: Knex.Transaction): Promise<Account | null> {
    try {
      const account = await this.getQueryBuilder(trx).where({ id }).first()
      return account || null
    } catch (error) {
      console.error("Error finding account by id:", error)
      throw new Error(
        `Failed to find account by id: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  async findByUserId(
    userId: number,
    trx?: Knex.Transaction
  ): Promise<Account | null> {
    try {
      const account = await this.getQueryBuilder(trx).where({ userId }).first()
      return account || null
    } catch (error) {
      console.error("Error finding account by userId:", error)
      throw new Error(
        `Failed to find account by userId: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  async findByAccountNumber(
    accountNo: string,
    trx?: Knex.Transaction
  ): Promise<Account | null> {
    try {
      const account = await this.getQueryBuilder(trx)
        .where({ accountNo })
        .first()
      return account || null
    } catch (error) {
      console.error("Error finding account by account number:", error)
      throw new Error(
        `Failed to find account by account number: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  async findByOptions(
    options: FindAccountOptions,
    trx?: Knex.Transaction
  ): Promise<Account[] | null> {
    try {
      const query = this.getQueryBuilder(trx)

      if (options.id) {
        query.where("id", options.id)
      }
      if (options.userId) {
        query.where("userId", options.userId)
      }
      if (options.accountNo) {
        query.where("accountNo", options.accountNo)
      }
      if (options.bankName) {
        query.where("bankName", options.bankName)
      }

      const accounts = await query
      return accounts.length > 0 ? accounts : null
    } catch (error) {
      console.error("Error finding account by options:", error)
      throw new Error(
        `Failed to find account: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  async findAll(trx?: Knex.Transaction): Promise<Account[]> {
    try {
      return await this.getQueryBuilder(trx).select("*")
    } catch (error) {
      console.error("Error fetching all accounts:", error)
      throw new Error(
        `Failed to fetch accounts: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  async update(
    id: number,
    updates: UpdateAccountInput,
    trx?: Knex.Transaction
  ): Promise<number | null> {
    try {
      const updatedAccount = await this.getQueryBuilder(trx)
        .where({ id })
        .update({
          ...updates,
          updatedAt: this.knex.fn.now(),
        })
      return updatedAccount || null
    } catch (error) {
      console.error("Error updating account:", error)
      throw new Error(
        `Failed to update account: ${
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
      console.error("Error deleting account:", error)
      throw new Error(
        `Failed to delete account: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }
}

export const accountRepository = new AccountRepository(knexInstance)
