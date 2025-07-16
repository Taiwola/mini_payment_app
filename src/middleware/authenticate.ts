import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"
import { userService } from "../service/user.service"

interface Decoded {
  id: number
  email: string
}

export const authentication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res
        .status(400)
        .json({ success: false, message: "Not authorized, no token" })
    }
    const token = authHeader.split(" ")[1]
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Token not provided" })
    }

    try {
      const decode = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as Decoded
      if (!decode) {
        return res.status(403).json({ success: false, message: "Forbidden" })
      }

      const user = await userService.getUserById(decode.id)
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "Token not authorized" })
      }

      req.user = user
      next()
    } catch (error) {
      console.log(error)
      return res.status(401).json({ success: false, message: "Invalid token" })
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}
