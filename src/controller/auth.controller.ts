import { Request, Response } from "express"
import { generateToken } from "../config/jwt.config"
import * as bcrypt from "bcryptjs"
import { userService } from "../service/user.service"

export const register = async (req: Request, res: Response) => {
  const { fullName, email, password, phoneNo } = req.body

  if (!fullName || !email || !password || !phoneNo) {
    res.status(400).json({
      message: "All fields are required: fullName, email, password",
    })
    return
  }

  try {
    const existingUser = await userService.getUserByEmail(email)
    if (existingUser) {
      res.status(409).json({
        message: "Email already registered",
      })
      return
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await userService.createUser({
      fullName,
      email,
      password: hashedPassword,
      phoneNo,
    })

    if (!user) {
      res.status(500).json({
        message: "Failed to create user",
      })
      return
    }

    const token = await generateToken(user.email, user.id)

    res.status(201).json({
      message: "User registered successfully",
      user,
      token,
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({
      message: "Registration failed",
      error: error instanceof Error ? error.message : "Internal server error",
    })
  }
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({
      message: "Email and password are required",
    })
    return
  }

  try {
    const user = await userService.getUserByEmail(email)
    if (!user) {
      res.status(401).json({
        message: "Invalid credentials",
      })
      return
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      res.status(401).json({
        message: "Invalid credentials",
      })
      return
    }

    const token = await generateToken(user.email, user.id)

    res.json({
      message: "Login successful",
      user,
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      message: "Login failed",
      error: error instanceof Error ? error.message : "Internal server error",
    })
  }
}
