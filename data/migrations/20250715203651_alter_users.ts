import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("users", (table) => {
    table.string("phoneNo").defaultTo("00000000000").notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {}
