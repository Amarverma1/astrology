const pool = require("../config/db");

/* ---------------- ADD PRODUCT ---------------- */

const slugify = require("slugify");


exports.createProduct = async (req, res) => {
  try {
    let {
      category_id,
      name,
      slug,
      short_description,
      description,
      price,
      mrp,
      discount_percent,
      stock,
      sku,
      meta_title,
      meta_description,
      is_featured,
      is_best_seller
    } = req.body;

    // ✅ IMAGE PATH (IMPORTANT FIX)
    const image = req.file
      ? `/assets/products/${req.file.filename}`
      : null;

    // 🔹 Validation
    if (!category_id || !name || !price) {
      return res.status(400).json({
        success: false,
        message: "category_id, name, and price are required",
      });
    }

    // 🔹 Slug
    slug = slug || slugify(name, { lower: true, strict: true });

    // 🔹 Defaults
    discount_percent = discount_percent || 0;
    stock = stock || 0;
    is_featured =
      is_featured === "true" || is_featured === true ? true : false;
    is_best_seller =
      is_best_seller === "true" || is_best_seller === true ? true : false;

    meta_title = meta_title || name;

    const query = `
      INSERT INTO products (
        category_id,
        name,
        slug,
        short_description,
        description,
        price,
        mrp,
        discount_percent,
        stock,
        sku,
        image,
        meta_title,
        meta_description,
        is_featured,
        is_best_seller,
        created_at
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,NOW()
      )
      RETURNING *
    `;

    const values = [
      Number(category_id),
      name,
      slug,
      short_description || null,
      description || null,
      Number(price),
      mrp ? Number(mrp) : null,
      Number(discount_percent),
      Number(stock),
      sku || null,
      image, // ✅ FULL PATH STORED
      meta_title,
      meta_description || null,
      is_featured,
      is_best_seller,
    ];

    const result = await pool.query(query, values);

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: result.rows[0],
    });

  } catch (error) {
    console.error("Create Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};



/* ---------------- UPDATE PRODUCT ---------------- */
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // ✅ IMAGE PATH FIX
    let image = data.image;

    if (req.file) {
      image = `/assets/products/${req.file.filename}`;
    }

    const query = `
      UPDATE products SET
        category_id = $1,
        name = $2,
        slug = $3,
        short_description = $4,
        description = $5,
        price = $6,
        mrp = $7,
        discount_percent = $8,
        stock = $9,
        sku = $10,
        image = $11,
        rating = $12,
        reviews_count = $13,
        is_featured = $14,
        is_best_seller = $15,
        status = $16,
        meta_title = $17,
        meta_description = $18,
        updated_at = NOW()
      WHERE id = $19
      RETURNING *
    `;

    const values = [
      data.category_id ? Number(data.category_id) : null,
      data.name,
      data.slug,
      data.short_description || null,
      data.description || null,
      Number(data.price),
      data.mrp ? Number(data.mrp) : null,
      Number(data.discount_percent || 0),
      Number(data.stock || 0),
      data.sku || null,
      image || null,
      Number(data.rating || 0),
      Number(data.reviews_count || 0),
      data.is_featured === "true" || data.is_featured === true,
      data.is_best_seller === "true" || data.is_best_seller === true,
      data.status === "true" || data.status === true,
      data.meta_title || data.name,
      data.meta_description || null,
      id,
    ];

    const result = await pool.query(query, values);

    res.json({
      success: true,
      product: result.rows[0],
    });

  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await pool.query(
      "UPDATE products SET status=$1 WHERE id=$2",
      [status, id]
    );

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/* ---------------- GET ALL PRODUCTS ---------------- */

exports.getAllProducts = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const offset = (page - 1) * limit;

    const minPrice = parseFloat(req.query.minPrice) || 0;
    const maxPrice = parseFloat(req.query.maxPrice) || 100000;

    const sort = req.query.sort || "new";

    const inStock = req.query.inStock === "true";
    const outStock = req.query.outStock === "true";

    let orderBy = "p.created_at DESC";

    if (sort === "low") orderBy = "p.price ASC";
    if (sort === "high") orderBy = "p.price DESC";

    let stockFilter = "";

    if (inStock && !outStock) stockFilter = "AND p.stock > 0";
    if (!inStock && outStock) stockFilter = "AND p.stock = 0";

    /* TOTAL COUNT */

    const countResult = await pool.query(
      `
      SELECT COUNT(*) 
      FROM products p
      WHERE p.price BETWEEN $1 AND $2
      ${stockFilter}
      `,
      [minPrice, maxPrice]
    );

    const total = parseInt(countResult.rows[0].count);

    /* PRODUCTS */

    const result = await pool.query(
      `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c
      ON p.category_id = c.id
      WHERE p.price BETWEEN $1 AND $2
      ${stockFilter}
      ORDER BY ${orderBy}
      LIMIT $3 OFFSET $4
      `,
      [minPrice, maxPrice, limit, offset]
    );

    res.json({
      products: result.rows,
      total: total
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



/* ---------------- GET PRODUCTS BY CATEGORY ---------------- */

exports.getProductsByCategory = async (req, res) => {
  try {

    const { categoryId } = req.params;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const offset = (page - 1) * limit;

    const minPrice = parseFloat(req.query.minPrice) || 0;
    const maxPrice = parseFloat(req.query.maxPrice) || 100000;

    const sort = req.query.sort || "new";

    const inStock = req.query.inStock === "true";
    const outStock = req.query.outStock === "true";

    let orderBy = "p.created_at DESC";

    if (sort === "low") orderBy = "p.price ASC";
    if (sort === "high") orderBy = "p.price DESC";

    let stockFilter = "";

    if (inStock && !outStock) stockFilter = "AND p.stock > 0";
    if (!inStock && outStock) stockFilter = "AND p.stock = 0";

    /* TOTAL PRODUCTS */

    const countResult = await pool.query(
      `
      SELECT COUNT(*) 
      FROM products p
      WHERE p.category_id=$1
      AND p.price BETWEEN $2 AND $3
      ${stockFilter}
      `,
      [categoryId, minPrice, maxPrice]
    );

    const total = parseInt(countResult.rows[0].count);

    /* FETCH PRODUCTS */

    const result = await pool.query(
      `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c
      ON p.category_id = c.id
      WHERE p.category_id=$1
      AND p.price BETWEEN $2 AND $3
      ${stockFilter}
      ORDER BY ${orderBy}
      LIMIT $4 OFFSET $5
      `,
      [categoryId, minPrice, maxPrice, limit, offset]
    );

    res.json({
      products: result.rows,
      total: total
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ---------------- GET TOP PRODUCTS ---------------- */

exports.getTopProducts = async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT * FROM products
      WHERE is_featured = true
      OR is_best_seller = true
      LIMIT 10
    `);

    res.json(result.rows);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



/* ---------------- GET PRODUCT BY ID ---------------- */

exports.getProductById = async (req, res) => {
  try {

    const { id } = req.params;

    const product = await pool.query(
      `SELECT * FROM products WHERE id=$1`,
      [id]
    );

    const images = await pool.query(
      `SELECT * FROM product_images WHERE product_id=$1`,
      [id]
    );

    res.json({
      product: product.rows[0],
      images: images.rows
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



/* ---------------- SEARCH PRODUCTS ---------------- */

exports.searchProducts = async (req, res) => {
  try {

    const { q } = req.query;

    const result = await pool.query(
      `SELECT * FROM products
       WHERE name ILIKE $1`,
      [`%${q}%`]
    );

    res.json(result.rows);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};






/* ---------------- DELETE PRODUCT ---------------- */

exports.deleteProduct = async (req, res) => {
  try {

    const { id } = req.params;

    await pool.query(
      `DELETE FROM products WHERE id=$1`,
      [id]
    );

    res.json({
      success: true,
      message: "Product deleted"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



//Add product	POST /api/products/add
//All products	GET /api/products
//Top products	GET /api/products/top
//By category	GET /api/products/category/:id
//Search	GET /api/products/search?q=rudraksha
//Single product	GET /api/products/:id
//Update product	PUT /api/products/update/:id
//Delete product	DELETE /api/products/delete/:id