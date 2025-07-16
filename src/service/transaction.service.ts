import { Knex } from "knex"
import {
  CreateTransactionInput,
  FindTransactionOptions,
  Transaction,
  UpdateTransactionInput,
} from "../index.d"
import {
  transactionRepository,
  TransactionRepository,
} from "../repository/transaction.repository"

export class TransactionService {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async createTransaction(
    transactionData: CreateTransactionInput,
    trx?: Knex.Transaction
  ): Promise<Transaction | null> {
    const transaction = await this.transactionRepository.create(
      transactionData,
      trx
    )
    console.log(transaction)
    return this.getTransactionById(transaction, trx)
  }

  async getTransactionById(
    id: number,
    trx?: Knex.Transaction
  ): Promise<Transaction | null> {
    return this.transactionRepository.findById(id, trx)
  }

  async getTransactionByOptions(
    options: FindTransactionOptions,
    trx?: Knex.Transaction
  ): Promise<Transaction[] | null> {
    return this.transactionRepository.findByOptions(options, trx)
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return this.transactionRepository.findAll()
  }

  async updateTransaction(
    id: number,
    updates: UpdateTransactionInput,
    trx?: Knex.Transaction
  ): Promise<Transaction | null> {
    return this.transactionRepository.update(id, updates, trx)
  }

  async findByReference(
    reference: string,
    trx?: Knex.Transaction
  ): Promise<Transaction | null> {
    return this.transactionRepository.findByReference(reference, trx)
  }

  async deleteTransaction(id: number): Promise<boolean> {
    return this.transactionRepository.delete(id)
  }
}

export const transactionService = new TransactionService(transactionRepository)
