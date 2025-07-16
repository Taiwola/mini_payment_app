import crypto from "crypto"

export function generateUniqueNumbers(): string {
  const min = 1000000000
  const max = 9999999999
  const randomNum = min + crypto.randomInt(0, max - min + 1)
  return randomNum.toString()
}
