import { db } from '../utils/db.js';

export const renderMarketplace = async (req, res) => {
  try {
    const { rows: products } = await db.query(`
            SELECT 
                p.id,
                p.title,
                p.price,
                p.quantity_available,
                u.username AS seller_name,
                ARRAY_AGG(pi.image_url) AS images
            FROM product p
            JOIN users u ON p.seller_id = u.id
            LEFT JOIN product_image pi ON p.id = pi.product_id
            WHERE p.status = 'APPROVED'
            GROUP BY p.id, u.username
            ORDER BY p.created_at DESC
        `);

        return res.status(200).render("userMarketplace", { products });

  } catch (err) {
    console.error("GET /user/marketplace error:", err.message);

    return res.status(500).send("Failed to load marketplace");
  }
}

export const renderSellPage = async (req, res) => {
  try {
        const userId = req.user.id;

        const { rows: products } = await db.query(
            `
            SELECT id, title, status, quantity_available
            FROM product
            WHERE seller_id = $1
            ORDER BY created_at DESC
            `,
            [userId]
        );

        const { rows: categories } = await db.query(
            "SELECT id, name FROM category ORDER BY name"
        );

        const { rows: wasteTypes } = await db.query(
            "SELECT id, name FROM waste_type ORDER BY name"
        );

        return res.status(200).render("userSell", { categories, wasteTypes, products });
    } catch (err) {
        console.error("GET /user/sell error:", err.message);
        return res.status(500).send("Failed to load sell page");
    }
}

export const renderUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;

        /* ================= BOUGHT ORDERS ================= */
        const { rows: boughtOrders } = await db.query(`
            SELECT 
                o.id,
                o.order_status,
                o.total_amount,
                o.created_at,
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'product_title', p.title,
                        'quantity', oi.quantity,
                        'price_at_purchase', oi.price_at_purchase
                    )
                ) AS items
            FROM orders o
            JOIN order_item oi ON o.id = oi.order_id
            JOIN product p ON oi.product_id = p.id
            WHERE o.buyer_id = $1
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `, [userId]);

        /* ================= SOLD ORDERS ================= */
        const { rows: soldOrders } = await db.query(`
            SELECT 
                o.id,
                o.order_status,
                o.total_amount,
                o.created_at,
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'product_title', p.title,
                        'quantity', oi.quantity,
                        'price_at_purchase', oi.price_at_purchase
                    )
                ) AS items
            FROM orders o
            JOIN order_item oi ON o.id = oi.order_id
            JOIN product p ON oi.product_id = p.id
            WHERE o.seller_id = $1
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `, [userId]);

        return res.status(200).render("userOrders", {
            boughtOrders,
            soldOrders
        });

    } catch (err) {
        console.error("GET /user/orders error:", err.message);
        res.status(500).send("Failed to load orders");
    }
};

export const renderUserProfile = async (req, res) => {
  try {
        const userId = req.user.id;

        const { rows: userRows } = await db.query(
            "SELECT id, username, email, role FROM users WHERE id = $1",
            [userId]
        );

        const { rows: addressRows } = await db.query(
            "SELECT * FROM address WHERE user_id = $1",
            [userId]
        );

        const { rows: products } = await db.query(
            `
            SELECT id, title, status, quantity_available
            FROM product
            WHERE seller_id = $1
            ORDER BY created_at DESC
            `,
            [userId]
        );

        return res.status(200).render("userProfile.ejs", {
            user: userRows[0],
            address: addressRows[0],
            products
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
        const { line1, line2, city, state, pincode, phone } = req.body;

        await db.query(
            `UPDATE address 
             SET 
                line1   = COALESCE($1, line1),
                line2   = COALESCE($2, line2),
                city    = COALESCE($3, city),
                state   = COALESCE($4, state),
                pincode = COALESCE($5, pincode),
                phone   = COALESCE($6, phone)
             WHERE user_id = $7`,
            [line1, line2, city, state, pincode, phone, userId]
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
        const { title, description, price, quantity_available, category_id, waste_type_id } = req.body;

        const result = await db.query(
            `INSERT INTO product 
                (seller_id, title, description, price, quantity_available, category_id, waste_type_id, status, created_at)
             VALUES 
                ($1, $2, $3, $4, $5, $6, $7, 'APPROVED', NOW())
             RETURNING id`,
            [userId, title, description, price, quantity_available, category_id, waste_type_id]
        );

        return res.status(201).redirect("/user/sell");

    } catch (err) {
        console.error("POST /user/sell error:", err.message);
        return res.status(500).send("Failed to list new product");
    }
};

export const createNewOrder = async (req, res) => {
    try {
        const buyerId = req.user.id;
        const { product_id, quantity } = req.body;

        // Fetch product details
        const { rows: productRows } = await db.query(
            "SELECT seller_id, price, quantity_available FROM product WHERE id = $1 AND status = 'APPROVED'",
            [product_id]
        );

        if (productRows.length === 0) {
            return res.status(404).send("Product not found or not available");
        }

        const product = productRows[0];

        if (product.quantity_available < quantity) {
            return res.status(400).send("Insufficient product quantity available");
        }

        const totalAmount = product.price * quantity;
        const sellerId = product.seller_id;

        // Start transaction
        await db.query('BEGIN');

        // Create order
        const { rows: orderRows } = await db.query(
            `INSERT INTO orders (buyer_id, seller_id, total_amount, delivery_address_id, order_status, created_at)
             VALUES ($1, $2, $3, $4, 'PLACED', NOW())
             RETURNING id`,
            [buyerId, sellerId, totalAmount, sellerId]
        );

        const orderId = orderRows[0].id;

        // Create order item
        await db.query(
            `INSERT INTO order_item (order_id, product_id, quantity, price_at_purchase)
             VALUES ($1, $2, $3, $4)`,
            [orderId, product_id, quantity, product.price]
        );

        // Update product quantity
        await db.query(
            `UPDATE product
             SET quantity_available = quantity_available - $1
             WHERE id = $2`,
            [quantity, product_id]
        );

        // Commit transaction
        await db.query('COMMIT');

        return res.status(201).redirect("/user/orders");
        
    } catch (err) {
        await db.query('ROLLBACK');
        console.error("POST /user/orders/create error:", err.message);
        return res.status(500).send("Failed to create order");
    }
};

export const cancelOrder = async (req, res) => {
    const client = await db.connect();

    try {
        const userId = req.user.id;
        const orderId = req.params.orderId;

        await client.query("BEGIN");

        // 1. Fetch order
        const { rows } = await client.query(`
            SELECT id, buyer_id, seller_id, order_status
            FROM orders
            WHERE id = $1
            FOR UPDATE
        `, [orderId]);

        if (rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).send("Order not found");
        }

        const order = rows[0];

        // 2. Authorization
        if (order.buyer_id !== userId && order.seller_id !== userId) {
            await client.query("ROLLBACK");
            return res.status(403).send("Not authorized to cancel this order");
        }

        // 3. Status validation
        if (['COMPLETED', 'CANCELLED'].includes(order.order_status)) {
            await client.query("ROLLBACK");
            return res.status(400).send("Order cannot be cancelled");
        }

        // 4. Restore inventory
        const { rows: items } = await client.query(`
            SELECT product_id, quantity
            FROM order_item
            WHERE order_id = $1
        `, [orderId]);

        for (const item of items) {
            await client.query(`
                UPDATE product
                SET quantity_available = quantity_available + $1
                WHERE id = $2
            `, [item.quantity, item.product_id]);
        }

        // 5. Update order status
        await client.query(`
            UPDATE orders
            SET order_status = 'CANCELLED'
            WHERE id = $1
        `, [orderId]);

        await client.query("COMMIT");

        return res.redirect("/user/orders");

    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Cancel order error:", err.message);
        res.status(500).send("Failed to cancel order");
    } finally {
        client.release();
    }
};

export const confirmOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const orderId = req.params.orderId;

        // 1. Fetch order
        const { rows } = await db.query(`
            SELECT id, seller_id, order_status
            FROM orders
            WHERE id = $1
        `, [orderId]);

        if (rows.length === 0) {
            return res.status(404).send("Order not found");
        }

        const order = rows[0];

        // 2. Authorization (seller only)
        if (order.seller_id !== userId) {
            return res.status(403).send("Only seller can confirm this order");
        }

        // 3. State validation
        if (order.order_status !== 'PLACED') {
            return res.status(400).send("Only PLACED orders can be confirmed");
        }

        // 4. Update status
        // Currently, we directly set to COMPLETED. In real scenarios, you might have more complex logic for CONFIRMED and SHIPPED.
        await db.query(`
            UPDATE orders
            SET order_status = 'COMPLETED' 
            WHERE id = $1
        `, [orderId]);

        return res.redirect("/user/orders");

    } catch (err) {
        console.error("Confirm order error:", err.message);
        res.status(500).send("Failed to confirm order");
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
            return res.redirect("/sell");
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
