/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
  await knex("astrology_services").del();

  await knex("astrology_services").insert([
    { name: "Free Kundli", icon: "menu_book", slug: "free-kundli" },
    { name: "Daily Horoscope", icon: "ac_unit", slug: "daily-horoscope" },
    { name: "Kundali Match", icon: "style", slug: "kundali-match" },
    { name: "Live Chat", icon: "chat_bubble_outline", slug: "live-chat" },
    { name: "Zodiac", icon: "star_outline", slug: "zodiac" },
    { name: "Panchang", icon: "favorite_border", slug: "panchang" },
  ]);
};
