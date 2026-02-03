const db = require("../config/db");

module.exports = {
  // Get only active services
  getAllActive: async () => {
    const result = await db.query(
      `SELECT * FROM astrology_services 
       WHERE is_active = true 
       ORDER BY id ASC`
    );
    return result.rows;
  },

  // Get all services
  getAll: async () => {
    const result = await db.query(
      "SELECT * FROM astrology_services ORDER BY id ASC"
    );
    return result.rows;
  },

  // Create service
  create: async (data) => {
    const { name, icon, is_active } = data;

    const result = await db.query(
      `INSERT INTO astrology_services (name, icon, is_active)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, icon, is_active ?? true]
    );

    return result.rows[0];
  },

  // Update service
  update: async (id, data) => {
    const { name, icon, is_active } = data;

    const result = await db.query(
      `UPDATE astrology_services
       SET name=$1, icon=$2, is_active=$3
       WHERE id=$4
       RETURNING *`,
      [name, icon, is_active, id]
    );

    return result.rows[0];
  },

  // Delete service
  delete: async (id) => {
    await db.query(
      "DELETE FROM astrology_services WHERE id = $1",
      [id]
    );
    return true;
  },
};
