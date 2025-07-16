import jwt from "jsonwebtoken"

export const generateToken = async (email: string, id: number) => {
  const payload = { id, email }
  const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "1d",
  })
  return token
}
