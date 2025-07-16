import { Knex } from "knex"

interface User {
  id: number
  fullName: string
  email: string
  password: string
  phoneNo: string
  createdAt: Date | Knex.Raw
  updatedAt: Date | Knex.Raw
}

interface Account {
  id: number
  accountNo: string
  userId: number
  balance: number
  currency: string
  bankName: string
  createdAt: Date | Knex.Raw
  updatedAt: Date | Knex.Raw
}

interface Transaction {
  id: number
  transactionType: "withdrawal" | "deposit" | "transfer"
  status: "pending" | "completed" | "failed"
  amount: number
  accountId: number
  transactionReference: string
  fromAccountId?: number
  toAccountId?: number
  recipientAccountNumber?: string
  recipientBank?: string
  description?: string
  webhookEventId?: string
  createdAt: Date | Knex.Raw
  updatedAt: Date | Knex.Raw
}

export enum StatusEnum {
  "PENDING" = "pending",
}

type CreateUserInput = Omit<User, "id" | "createdAt" | "updatedAt">
type UpdateUserInput = Partial<Omit<User, "id" | "createdAt" | "updatedAt">>
type FindUserOptions = {
  email?: string
  id?: Number
}
type createAccountInput = Omit<Account, "id" | "createdAt" | "updatedAt">
type UpdateAccountInput = Partial<
  Omit<Account, "id" | "createdAt" | "updatedAt">
>
type FindAccountOptions = {
  id?: Number
  userId?: Number
  accountNo?: string
  bankName?: string
}

type CreateTransactionInput = Omit<
  Transaction,
  "id" | "createdAt" | "updatedAt"
>
type UpdateTransactionInput = Partial<
  Omit<Transaction, "id" | "createdAt" | "updatedAt">
>

type FindTransactionOptions = {
  id?: number
  accountId?: number
  transactionReference?: string
  webhookEventId?: string
  transactionType?: "withdrawal" | "deposit" | "transfer"
  status?: "pending" | "completed" | "failed"
}

export interface IUserRepository {
  create(user: CreateUserInput, trx?: Knex.Transaction): Promise<number>
  findById(id: number, trx?: Knex.Transaction): Promise<T | null>
  findByEmail(email: string, trx?: Knex.Transaction): Promise<T | null>
  findByOptions(
    options: FindUserOptions,
    trx?: Knex.Transaction
  ): Promise<T[] | null>
  findAll(): Promise<T[]>
  update(
    id: number,
    updates: UpdateUserInput,
    trx?: Knex.Transaction
  ): Promise<T | null>
  delete(id: number): Promise<boolean>
}
export interface IAccountRepository {
  create(account: createAccountInput, trx?: Knex.Transaction): Promise<number>
  findById(id: number, trx?: Knex.Transaction): Promise<T | null>
  findByUserId(id: number, trx?: Knex.Transaction): Promise<T | null>
  findByOptions(
    options: FindAccountOptions,
    trx?: Knex.Transaction
  ): Promise<T[] | null>
  findAll(): Promise<T[]>
  update(
    id: number,
    updates: UpdateAccountInput,
    trx?: Knex.Transaction
  ): Promise<T | null>
  delete(id: number): Promise<boolean>
}

export interface ITransactionRepository {
  create(
    transaction: CreateTransactionInput,
    trx?: Knex.Transaction
  ): Promise<number>
  findById(id: number): Promise<Transaction | null>
  findByOptions(
    options: FindTransactionOptions,
    trx?: Knex.Transaction
  ): Promise<Transaction[] | null>
  findAll(): Promise<Transaction[]>
  update(
    id: number,
    updates: UpdateTransactionInput
  ): Promise<Transaction | null>
  delete(id: number): Promise<boolean>
}

declare module "knex/types/tables" {
  interface Tables {
    users: Knex.CompositeTableType<
      User,
      Pick<User, "fullName" | "email" | "password">,
      Partial<Omit<User, "id">>
    >

    accounts: Knex.CompositeTableType<
      Account,
      Pick<Account, "accountNo" | "userId"> & Partial<Pick<Account, "balance">>,
      Partial<Omit<Account, "id">>
    >

    transactions: Knex.CompositeTableType<
      Transaction,
      Pick<Transaction, "transactionType" | "amount" | "accountId"> &
        Partial<Pick<Transaction, "status">>,
      Partial<Omit<Transaction, "id">>
    >
  }
}

export interface AtlasCreateAccountResponse {
  status: string
  message: string
  data: {
    account_number: string
    account_name: string
    bank: string
    customer: {
      email: string
      first_name: string
      last_name: string
      phone: string
    }
    isPermanent: boolean
    amount: string
  }
}

export interface AtlasWebhookPayload {
  event: "transfer.success" | "transfer.failed" | "deposit.success"
  id: string
  createdAt: string
  data: {
    reference: string
    amount: string
    account_number?: string
    recipient_account_number?: string
    recipient_bank?: string
    reason?: string
  }
}

export interface NotificationPayload {
  userId: number
  type: string
  message: string
  metadata: Record<string, any>
}

export interface Notification {
  id: number
  userId: number
  type: string
  message: string
  metadata: Record<string, any>
  status: "pending" | "sent" | "delivered" | "read" | "failed"
  createdAt: Date | Knex.Raw
  updatedAt: Date | Knex.Raw
}

export type CreateNotificationInput = Omit<
  Notification,
  "id" | "createdAt" | "updatedAt" | "status"
> & {
  status?: Notification["status"]
}

export type UpdateNotificationInput = Partial<
  Omit<Notification, "id" | "userId" | "createdAt">
>

export interface FindNotificationOptions {
  userId?: number
  type?: string
  status?: Notification["status"]
  startDate?: Date
  endDate?: Date
}

declare module "knex/types/tables" {
  interface Tables {
    notifications: Knex.CompositeTableType<
      Notification,
      CreateNotificationInput,
      UpdateNotificationInput
    >
  }
}
