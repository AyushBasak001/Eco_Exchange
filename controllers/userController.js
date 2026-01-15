import { db } from '../utils/db.js';

export const renderUserPage = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect("/auth");
    }
    const { username } = req.user;

    return res.status(200).render("user.ejs", {username});

  } catch (err) {
    console.error("GET /user error:", err.message);

    return res.status(500).send("Internal server error");
  }
}

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
        const { rows: categories } = await db.query(
            "SELECT id, name FROM category ORDER BY name"
        );

        const { rows: wasteTypes } = await db.query(
            "SELECT id, name FROM waste_type ORDER BY name"
        );

        return res.status(200).render("userSell", { categories, wasteTypes });
    } catch (err) {
        console.error("GET /user/sell error:", err.message);
        return res.status(500).send("Failed to load sell page");
    }
}

export const renderUserOrders = async (req, res) => {
  try {
        const userId = req.user.id;

        const { rows: orders } = await db.query(`
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
            WHERE o.buyer_id = $1 OR o.seller_id = $1
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `, [userId]);

        return res.status(200).render("userOrders", { orders });
    } catch (err) {
        console.error("GET /user/orders error:", err.message);
        res.status(500).send("Failed to load orders");
    }
}

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