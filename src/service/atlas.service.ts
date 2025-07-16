import axios from "axios"
import qs from "qs"
import { AtlasCreateAccountResponse } from "../index.d"

export class AtlasService {
  async generateAccount(data: {
    first_name: string
    last_name: string
    phone: string
    amount: string
    email: string
  }): Promise<AtlasCreateAccountResponse> {
    const config = {
      method: "post",
      url: "https://integrations.getravenbank.com/v1/pwbt/generate_account",
      headers: {
        Authorization: `Bearer ${process.env.ATLAS_API_KEY}`,
        "Content-Type": "application/json",
      },
      data: data,
    }

    try {
      const response = await axios(config)
      return response.data as AtlasCreateAccountResponse
    } catch (error) {
      console.error("Error generating account:", error)
      throw error
    }
  }

  async transferOrDepositFunds(data: {
    amount: string
    account_number: string
    narration: string
    reference: string
    bankName: string
  }) {
    const config = {
      method: "post",
      url: "https://integrations.getravenbank.com/v1/transfers/create",
      headers: {
        Authorization: `Bearer ${process.env.ATLAS_API_KEY}`,
        "Content-Type": "application/json",
      },
      data: data,
    }

    try {
      const response = await axios(config)
      return response.data
    } catch (error) {
      console.error("Error generating account:", error)
      throw error
    }
  }
}

export const atlasService = new AtlasService()
