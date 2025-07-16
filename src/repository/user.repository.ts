import { Knex } from "knex"
import {
  CreateUserInput,
  FindUserOptions,
  IUserRepository,
  UpdateUserInput,
  User,
} from "../index.d"
import knexInstance from "../config/kenex"

export class UserRepository implements IUserRepository {
  private readonly tableName = "users"

  constructor(private readonly knex: Knex) {}

  async create(user: CreateUserInput): Promise<number> {
    try {
      const [newUser] = await this.knex(this.tableName).insert(user)
      return newUser
    } catch (error) {
      throw new Error(
        `Failed to create user: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  async findById(id: number): Promise<User | null> {
    return (await this.knex(this.tableName).where({ id }).first()) || null
  }

  async findByEmail(email: string): Promise<User | null> {
    return (await this.knex(this.tableName).where({ email }).first()) || null
  }

  async findByOptions(options: FindUserOptions): Promise<User[] | null> {
    try {
      const query = this.knex(this.tableName).select("*")

      if (options.email) {
        query.where("email", options.email)
      }
      if (options.id) {
        query.where("id", options.id)
      }

      const user = await query
      return user || null
    } catch (error) {
      throw new Error(
        `Failed to find user: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.knex(this.tableName).select("*")
    } catch (error) {
      throw new Error(
        `Failed to fetch users: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  async update(id: number, updates: UpdateUserInput): Promise<User | null> {
    try {
      const [updatedUser] = await this.knex(this.tableName)
        .where({ id })
        .update({
          ...updates,
          updatedAt: this.knex.fn.now(),
        })
        .returning("*")
      return updatedUser || null
    } catch (error) {
      throw new Error(
        `Failed to update user: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await this.knex(this.tableName).where({ id }).del()
      return result > 0
    } catch (error) {
      throw new Error(
        `Failed to delete user: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }
}

export const userRepository = new UserRepository(knexInstance)
