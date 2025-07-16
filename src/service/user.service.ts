import { User } from "../index.d"
import { userRepository, UserRepository } from "../repository/user.repository"

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(
    user: Omit<User, "id" | "createdAt" | "updatedAt">
  ): Promise<User | null> {
    const newUser = await this.userRepository.create(user)
    return this.getUserById(newUser)
  }

  async getUserById(id: number): Promise<User | null> {
    return this.userRepository.findById(id)
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email)
  }

  async getUserByOptions(options: {
    email?: string
    id?: number
  }): Promise<User[] | null> {
    return this.userRepository.findByOptions(options)
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll()
  }

  async updateUser(
    id: number,
    userData: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>
  ): Promise<User | null> {
    return this.userRepository.update(id, userData)
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.userRepository.delete(id)
  }
}

export const userService = new UserService(userRepository)
