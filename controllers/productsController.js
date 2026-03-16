const pool = require("../config/db");

/* ---------------- ADD PRODUCT ---------------- */

exports.createProduct = async (req, res) => {
  try {
    const {
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
      is_best_seller
    } = req.body;

    const result = await pool.query(
      `INSERT INTO products
      (category_id,name,slug,short_description,description,price,mrp,discount_percent,stock,sku,image,meta_title,meta_description,is_featured,is_best_seller)
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING *`,
      [
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
        is_best_seller
      ]
    );

    res.json({
      success: true,
      product: result.rows[0]
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
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



/* ---------------- UPDATE PRODUCT ---------------- */

exports.updateProduct = async (req, res) => {
  try {

    const { id } = req.params;
    const { name, price, stock, description, image } = req.body;

    const result = await pool.query(
      `UPDATE products
       SET name=$1, price=$2, stock=$3, description=$4, image=$5
       WHERE id=$6
       RETURNING *`,
      [name, price, stock, description, image, id]
    );

    res.json({
      success: true,
      product: result.rows[0]
    });

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