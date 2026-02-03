/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable("astrology_services", (table) => {
    table.increments("id").primary();

    table.string("name").notNullable();        // Free Kundli
    table.string("icon").notNullable();        // menu_book
    table.string("slug").unique().notNullable(); // free-kundli

    table.boolean("is_active").defaultTo(true);

    table.timestamps(true, true); // created_at, updated_at
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("astrology_services");
};

