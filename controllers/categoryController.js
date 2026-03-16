const pool = require("../config/db");

/**
 * =========================
 * CATEGORY APIs
 * =========================
 */

// GET /api/categories
exports.getAllCategories = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, slug, image, description, created_at
       FROM categories
       ORDER BY id ASC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("getAllCategories error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// GET /api/categories/:slug
exports.getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await pool.query(
      `SELECT id, name, slug, image, description
       FROM categories
       WHERE slug = $1`,
      [slug]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("getCategoryBySlug error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// POST /api/categories
exports.createCategory = async (req, res) => {
  try {
    const { name, slug, image, description } = req.body;

    const result = await pool.query(
      `INSERT INTO categories (name, slug, image, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, slug, image, description]
    );

    res.status(201).json({
      message: "Category created successfully",
      category: result.rows[0],
    });
  } catch (err) {
    console.error("createCategory error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// PUT /api/categories/:id
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, image, description } = req.body;

    const result = await pool.query(
      `UPDATE categories
       SET name=$1, slug=$2, image=$3, description=$4
       WHERE id=$5
       RETURNING *`,
      [name, slug, image, description, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({
      message: "Category updated successfully",
      category: result.rows[0],
    });
  } catch (err) {
    console.error("updateCategory error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// DELETE /api/categories/:id
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM categories
       WHERE id=$1
       RETURNING *`,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error("deleteCategory error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


//GET /api/categories	All categories
//GET	/api/categories/love	Single category
//POST	/api/categories	Create category
//PUT	/api/categories/1	Update
//DELETE	/api/categories/1