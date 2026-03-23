import { db } from '../utils/db.js';

export const renderMarketplace = async (req, res) => {
  try {

    const { rows: categories } = await db.query(`
        SELECT id, name, icon
        FROM category
    `);

    return res.status(200).render("user/userMarketplace.ejs", { categories });

  } catch (err) {
    console.error("GET /user/marketplace error:", err.message);
    return res.status(500).send("Failed to load marketplace");
  }
};

export const renderMarketplaceCategory = async (req, res) => {
  try {

    const categoryId = req.params.categoryId;

    const { rows: categories } = await db.query(`
        SELECT name
        FROM category
        WHERE id = $1
        `, [categoryId]);

    if (categories.length != 1) {
        console.log(categories);
        return res.status(500).send("Failed to load marketplace");
    }

    const { rows: products } = await db.query(`
        SELECT id, seller_id, title, description, price, quantity_available
        FROM product
        WHERE status = 'APPROVED' AND category_id = $1
        ORDER BY created_at;
        `, [categoryId]);

    return res.status(200).render("user/userMarketplaceCategory.ejs", { products, categoryName: categories[0].name.toUpperCase()});

  } catch (err) {
    console.error("GET /user/marketplace/category error:", err.message);
    return res.status(500).send("Failed to load marketplace");
  }
};

export const renderSellPage = async (req, res) => {
  try {
        const userId = req.user.id;

        const { rows: products } = await db.query(
            `
            SELECT p.id, title, c.name category_name, status, price, quantity_available
            FROM product p
            JOIN category c ON p.category_id = c.id
            WHERE seller_id = $1
            ORDER BY created_at DESC
            `,
            [userId]
        );

        const { rows: categories } = await db.query(
            "SELECT id, name FROM category ORDER BY name"
        );

        return res.status(200).render("user/userSell.ejs", { categories, products });
    } catch (err) {
        console.error("GET /user/sell error:", err.message);
        return res.status(500).send("Failed to load sell page");
    }
}

export const renderUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;

        // Orders the user bought
        const { rows: bought } = await db.query(`
            SELECT 
                o.id AS order_id,
                o.seller_id,
                o.product_id,
                o.quantity,
                o.price_at_purchase,
                o.total_amount,
                o.status,
                o.created_at,
                p.title,
                c.name AS category_name,
                u.username
            FROM orders o
            JOIN product p ON o.product_id = p.id
            JOIN category c ON p.category_id = c.id
            JOIN users u ON o.seller_id = u.id
            WHERE o.buyer_id = $1
            ORDER BY o.created_at DESC
        `, [userId]);

        // Orders the user sold
        const { rows: sold } = await db.query(`
            SELECT 
                o.id AS order_id,
                o.buyer_id,
                o.product_id,
                o.quantity,
                o.price_at_purchase,
                o.total_amount,
                o.status,
                o.created_at,
                p.title,
                c.name AS category_name,
                u.username
            FROM orders o
            JOIN product p ON o.product_id = p.id
            JOIN category c ON p.category_id = c.id
            JOIN users u ON o.buyer_id = u.id
            WHERE p.seller_id = $1
            ORDER BY o.created_at DESC
        `, [userId]);

        res.status(200).render("user/userOrders.ejs", {bought, sold});

    } catch (err) {
        console.error("GET /user/orders error:", err.message);
        res.status(500).send("Failed to load orders");
    }
};

export const renderUserProfile = async (req, res) => {
  try {
        const userId = req.user.id;

        const { rows: userRows } = await db.query(
            "SELECT id, username, role FROM users WHERE id = $1",
            [userId]
        );

        const { rows: addressRows } = await db.query(
            "SELECT * FROM address WHERE user_id = $1",
            [userId]
        );

        return res.status(200).render("user/userProfile.ejs", {
            user: userRows[0],
            address: addressRows[0],
        });
    } catch (err) {
        console.error("GET /user/profile error:", err.message);
        return res.status(500).send("Failed to load profile");
    }
}

export const editUserAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        // Destructure all possible fields from req.body
        const { line1, city, state, pincode, phone } = req.body;

        await db.query(
            `UPDATE address 
             SET 
                line1   = COALESCE($1, line1),
                city    = COALESCE($2, city),
                state   = COALESCE($3, state),
                pincode = COALESCE($4, pincode),
                phone   = COALESCE($5, phone)
             WHERE user_id = $6`,
            [line1, city, state, pincode, phone, userId]
        );

        return res.status(200).redirect("/user/profile");

    } catch (err) {
        console.error("POST /user/profile error:", err.message);
        return res.status(500).send("Failed to edit address");
    }
};

export const sellNewProduct = async (req, res) => {
    try {
        const userId = req.user.id;
        const { title, description, price, quantity_available, category_id} = req.body;

        const result = await db.query(
            `INSERT INTO product 
                (seller_id, title, description, price, quantity_available, category_id, status)
             VALUES 
                ($1, $2, $3, $4, $5, $6, 'PENDING')
             RETURNING id`,
            [userId, title, description, price, quantity_available, category_id]
        );

        return res.status(201).redirect("/user/sell");

    } catch (err) {
        console.error("POST /user/sell error:", err.message);
        return res.status(500).send("Failed to list new product");
    }
};

export const restockProduct = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const productId = req.params.productId;
        const { quantity } = req.body;

        const addQty = parseInt(quantity, 10);

        if (!addQty || addQty <= 0) {
            return res.status(400).send("Invalid restock quantity");
        }

        // Fetch product
        const { rows } = await db.query(`
            SELECT id, seller_id, status
            FROM product
            WHERE id = $1
        `, [productId]);

        if (rows.length === 0) {
            return res.status(404).send("Product not found");
        }

        const product = rows[0];

        // Authorization
        if (product.seller_id !== sellerId) {
            return res.status(403).send("Not authorized");
        }

        // State validation
        if (product.status === 'REMOVED') {
            return res.status(400).send("Cannot restock a removed product");
        }

        // Update quantity
        await db.query(`
            UPDATE product
            SET quantity_available = quantity_available + $1
            WHERE id = $2
        `, [addQty, productId]);

        return res.redirect("/user/sell");

    } catch (err) {
        console.error("Restock product error:", err.message);
        res.status(500).send("Failed to restock product");
    }
};

export const removeProduct = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const productId = req.params.productId;

        // Fetch product
        const { rows } = await db.query(`
            SELECT id, seller_id, status
            FROM product
            WHERE id = $1
        `, [productId]);

        if (rows.length === 0) {
            return res.status(404).send("Product not found");
        }

        const product = rows[0];

        // Authorization
        if (product.seller_id !== sellerId) {
            return res.status(403).send("Not authorized");
        }

        // Idempotent remove
        if (product.status === 'REMOVED') {
            return res.redirect("/user/sell");
        }

        await db.query(`
            UPDATE product
            SET status = 'REMOVED'
            WHERE id = $1
        `, [productId]);

        return res.redirect("/user/sell");

    } catch (err) {
        console.error("Remove product error:", err.message);
        res.status(500).send("Failed to remove product");
    }
};

export const relistProduct = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const productId = req.params.productId;

        // Fetch product
        const { rows } = await db.query(`
            SELECT id, seller_id, status
            FROM product
            WHERE id = $1
        `, [productId]);

        if (rows.length === 0) {
            return res.status(404).send("Product not found");
        }

        const product = rows[0];

        // Authorization
        if (product.seller_id !== sellerId) {
            return res.status(403).send("Not authorized");
        }

        // Idempotent remove
        if (product.status !== 'REMOVED') {
            return res.redirect("/user/sell");
        }

        await db.query(`
            UPDATE product
            SET status = 'PENDING'
            WHERE id = $1
        `, [productId]);

        return res.redirect("/user/sell");

    } catch (err) {
        console.error("Relist product error:", err.message);
        res.status(500).send("Failed to relist product");
    }
};

export const placeOrder = async (req, res) => {
    try {
        const buyerId = req.user.id;
        const productId = req.params.productId;
        const {quantity} = req.body;

        // Fetch product
        const { rows } = await db.query(`
            SELECT id, seller_id, price, quantity_available, status
            FROM product
            WHERE id = $1
        `, [productId]);

        if (rows.length === 0) {
            return res.status(404).send("Product not found");
        }

        const product = rows[0];

        if (product.seller_id === buyerId) {
            return res.status(403).send("Can't Buy your own product.");
        }

        if (product.status !== 'APPROVED' || quantity<=0 || product.quantity_available < quantity) {
            return res.status(403).send("Invalid Request");
        }

        const amount = product.price * quantity;

        // Inserting into order table
        await db.query(
            `INSERT INTO orders (buyer_id, seller_id, product_id, quantity, price_at_purchase, status, total_amount)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [buyerId, product.seller_id, productId, quantity, product.price, 'PLACED', amount]
        );

        return res.redirect("/user/orders");

    } catch (err) {
        console.error("Order placement error:", err.message);
        res.status(500).send("Failed to place order");
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const orderId = req.params.orderId;
        const userType = req.params.userType;

        // Fetch order
        const { rows } = await db.query(`
            SELECT id, buyer_id, seller_id, status
            FROM orders
            WHERE id = $1
        `, [orderId]);

        if (rows.length === 0) {
            return res.status(404).send("Order not found");
        }

        const order = rows[0];

        // Authorization
        if ((userType === 1 && order.buyer_id !== userId) || 
            (userType === 0 && order.seller_id !== userId)) 
        {
            return res.status(403).send("Not authorized");
        }

        // Idempotent remove
        if (order.status === 'CANCELLED' || order.status === 'COMPLETED') {
            return res.redirect("/user/orders");
        }

        await db.query(`
            UPDATE orders
            SET status = 'CANCELLED'
            WHERE id = $1
        `, [orderId]);

        return res.redirect("/user/orders");

    } catch (err) {
        console.error("Cancel order error:", err.message);
        res.status(500).send("Failed to cancel order");
    }
};