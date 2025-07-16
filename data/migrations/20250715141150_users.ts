import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("users", (table) => {
    table.increments("id").primary()
    table.string("fullName").notNullable()
    table.string("email").unique().notNullable()
    table.string("password").notNullable()
    table.timestamp("createdAt").defaultTo(knex.fn.now()).notNullable()
    table.timestamp("updatedAt").defaultTo(knex.fn.now()).notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("users")
}
