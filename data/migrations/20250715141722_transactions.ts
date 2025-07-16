import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("transactions", (table) => {
    table.increments("id").primary()
    table
      .enum("transactionType", ["withdrawal", "deposit", "transfer"])
      .notNullable()
    table
      .enum("status", ["pending", "completed", "failed"])
      .defaultTo("pending")
    table.decimal("amount", 15, 2).notNullable()
    table.integer("accountId").notNullable().index()
    table.timestamp("createdAt").defaultTo(knex.fn.now()).notNullable()
    table.timestamp("updatedAt").defaultTo(knex.fn.now()).notNullable()
  })

  await knex.schema.alterTable("transactions", (table) => {
    table
      .foreign("accountId")
      .references("id")
      .inTable("accounts")
      .onDelete("CASCADE")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("transactions")
}
