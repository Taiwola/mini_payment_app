import { Knex } from "knex"
import {
  Account,
  createAccountInput,
  UpdateAccountInput,
  UpdateUserInput,
} from "../index.d"
import {
  accountRepository,
  AccountRepository,
} from "../repository/account.repository"

export class AccountService {
  constructor(private accountRepository: AccountRepository) {}

  async createAccount(
    accountData: createAccountInput,
    trx?: Knex.Transaction
  ): Promise<Account | null> {
    const account = await this.accountRepository.create(accountData)
    return await this.accountRepository.findById(account, trx)
  }

  async getAccountById(
    id: number,
    trx?: Knex.Transaction
  ): Promise<Account | null> {
    return this.accountRepository.findById(id, trx)
  }

  async getAccountByUserId(
    userId: number,
    trx?: Knex.Transaction
  ): Promise<Account | null> {
    return this.accountRepository.findByUserId(userId, trx)
  }

  async getAccountByAccountNumber(
    accountNo: string,
    trx?: Knex.Transaction
  ): Promise<Account | null> {
    const account = await this.accountRepository.findByOptions(
      {
        accountNo: accountNo,
      },
      trx
    )
    return account ? account[0] : null
  }

  async updateAccount(
    id: number,
    updates: UpdateAccountInput,
    trx?: Knex.Transaction
  ): Promise<Account | null> {
    console.log({ id, updates })
    const account = await this.accountRepository.update(id, updates, trx)
    return await this.accountRepository.findById(account as number, trx)
  }

  async deleteAccount(id: number, trx?: Knex.Transaction): Promise<boolean> {
    return this.accountRepository.delete(id, trx)
  }

  async updateAccountBalance(
    accountId: number,
    amount: number,
    trx?: Knex.Transaction
  ): Promise<Account | null> {
    try {
      const account = await this.getAccountById(accountId, trx)

      if (!account) {
        throw new Error("Account not found")
      }

      const newBalance = account.balance + amount

      if (newBalance < 0) {
        throw new Error("Insufficient funds")
      }

      return await this.updateAccount(accountId, { balance: newBalance }, trx)
    } catch (error) {
      throw new Error(
        `Failed to update account balance: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }
}

export const accountService = new AccountService(accountRepository)
export type AccountServiceType = typeof accountService
