import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable("accounts")
  if (!hasTable) {
    await knex.schema.createTable("accounts", (table) => {
      table.increments("id").primary()
      table.string("accountNo").unique().notNullable()
      table.integer("userId").notNullable()
      table.decimal("balance", 15, 2).notNullable().defaultTo(0.0)
      table.timestamp("createdAt").defaultTo(knex.fn.now()).notNullable()
      table.timestamp("updatedAt").defaultTo(knex.fn.now()).notNullable()
    })

    await knex.schema.alterTable("accounts", (table) => {
      table
        .foreign("userId")
        .references("id")
        .inTable("users")
        .onDelete("CASCADE")
    })
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("accounts")
}
