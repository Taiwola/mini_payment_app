import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("notifications", (table) => {
    table.increments("id").primary()
    table.integer("userId").unsigned().notNullable()
    table.string("type").notNullable()
    table.text("message").notNullable()
    table.json("metadata").nullable()
    table.string("status").defaultTo("pending")
    table.timestamp("createdAt").defaultTo(knex.fn.now())
    table.timestamp("updatedAt").defaultTo(knex.fn.now())
  })
  await knex.schema.alterTable("notification", (table) =>
    table.foreign("userId").references("id").inTable("users")
  )
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("notifications")
}
