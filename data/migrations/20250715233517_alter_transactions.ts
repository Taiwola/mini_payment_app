import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("transactions", (table) => {
    table.string("transactionReference", 100).unique().index().after("amount")
    table
      .integer("fromAccountId")
      .unsigned()
      .index()
      .nullable()
      .after("accountId")
    table
      .integer("toAccountId")
      .unsigned()
      .index()
      .nullable()
      .after("fromAccountId")
    table.string("recipientAccountNumber", 50).nullable().after("toAccountId")
    table
      .string("recipientBank", 100)
      .nullable()
      .after("recipientAccountNumber")
    table.string("description", 255).nullable().after("recipientBank")
    table.string("webhookEventId", 100).nullable().after("description")
  })

  await knex.schema.alterTable("transactions", (table) => {
    table
      .foreign("fromAccountId")
      .references("id")
      .inTable("accounts")
      .onDelete("SET NULL")
    table
      .foreign("toAccountId")
      .references("id")
      .inTable("accounts")
      .onDelete("SET NULL")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("transactions", (table) => {
    table.dropForeign(["fromAccountId"])
    table.dropForeign(["toAccountId"])
    table.dropColumn("transactionReference")
    table.dropColumn("fromAccountId")
    table.dropColumn("toAccountId")
    table.dropColumn("recipientAccountNumber")
    table.dropColumn("recipientBank")
    table.dropColumn("description")
    table.dropColumn("webhookEventId")
  })
}
