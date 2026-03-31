import { db } from '../utils/db.js';
import {
    confirmOrderHelper,
    cancelOrderHelper
} from '../utils/controllerHelpers.js';

export const manageUsers = async (req,res) => {
    try {
        const adminId = req.user.id;

        const { rows: userRows } = await db.query(
            "SELECT id, username, role, is_active, created_at FROM users ORDER BY CASE role WHEN 'ADMIN' THEN 1 WHEN 'MODERATOR' THEN 2 WHEN 'USER' THEN 3 END, id ASC");

        return res.status(200).render("admin/manageUsers.ejs", {
            userList: userRows
        });

    } catch (err) {
        console.error("GET /admin/users error:", err.message);
        return res.status(500).send("Failed to load profile");
    }
}

export const manageProducts = async (req,res) => {
    try {
        const { rows: productList } = await db.query(
            "SELECT p.id, s.username AS seller, c.name AS category, p.title, p.description, p.price, p.quantity_available, p.status, m.username AS moderator FROM product p  JOIN users s ON p.seller_id=s.id JOIN category c ON p.category_id=c.id LEFT JOIN users m ON p.moderator=m.id ORDER BY id ASC");

        return res.status(200).render("admin/manageProducts.ejs", { productList });

  } catch (err) {
    console.error("GET /admin/products error:", err.message);

    return res.status(500).send("Failed to load marketplace");
  }
}

export const manageOrders = async (req,res) => {
    try {
        const { rows: orderList } = await db.query(
            "SELECT o.id AS order_id, b.username AS buyer, s.username AS seller, p.title AS product, o.quantity, o.total_amount, o.status AS order_status, pay.payment_status, o.created_at FROM orders o JOIN users b ON o.buyer_id = b.id JOIN users s ON o.seller_id = s.id JOIN product p ON o.product_id = p.id LEFT JOIN payment pay ON pay.order_id = o.id ORDER BY o.id DESC");

        return res.status(200).render("admin/manageOrders.ejs", { orderList });

    } catch (err) {
        console.error("GET /admin/orders error:", err.message);

        return res.status(500).send("Internal server error");
    }
}

export const manageAdminProfile = async (req,res) => {
    try {
        const userId = req.user.id;

        const { rows: userRows } = await db.query(
            "SELECT id, username, role, is_active FROM users WHERE id = $1",
            [userId]
        );

        const { rows: addressRows } = await db.query(
            "SELECT * FROM address WHERE user_id = $1",
            [userId]
        );

        return res.status(200).render("admin/manageAdminProfile.ejs", {
            user: userRows[0],
            address: addressRows[0]
        });

    } catch (err) {
        console.error("GET /admin/profile error:", err.message);
        return res.status(500).send("Failed to load profile");
    }
}

export const showOrderDetails = async (req, res) => {
    const client = await db.connect();
    try {
        const orderId = req.params.orderId;

        if (!orderId || isNaN(orderId)) {
            client.release();
            return res.status(400).send("Invalid order ID");
        }

        // ------------------------------
        // BEGIN TRANSACTION
        // ------------------------------
        await client.query("BEGIN");

        // 1) ORDER ROW
        const orderQuery = `SELECT * FROM orders WHERE id = $1`;
        const { rows: orderRows } = await client.query(orderQuery, [orderId]);
        if (orderRows.length === 0) {
            await client.query("ROLLBACK");
            client.release();
            return res.status(404).send("Order not found");
        }
        const order = orderRows[0];

        const { rows: buyerRows } = await client.query(
            `SELECT u.username, u.role, u.is_active, a.line1, a.city, a.state, a.pincode, a.phone FROM users u LEFT JOIN address a ON u.id = a.user_id WHERE u.id = $1`, 
            [order.buyer_id]
        );

        // 3) SELLER ROW (User + Address)
        const { rows: sellerRows } = await client.query(
            `SELECT u.username, u.role, u.is_active, a.line1, a.city, a.state, a.pincode, a.phone FROM users u LEFT JOIN address a ON u.id = a.user_id WHERE u.id = $1`,
            [order.seller_id]
        );

        // 4) PRODUCT ROW
        const { rows: productRows } = await client.query(
            `SELECT p.title, p.description, c.name AS category, p.price, p.quantity_available, p.status, m.username AS moderator FROM product p  JOIN category c ON p.category_id=c.id LEFT JOIN users m ON p.moderator=m.id WHERE p.id = $1`,
            [order.product_id]
        );

        // 5) PAYMENT ROW (might not exist)
        const { rows: paymentRows } = await client.query(
            `SELECT payment_status, paid_at FROM payment WHERE order_id = $1`,
            [orderId]
        );

        // ------------------------------
        // COMMIT TRANSACTION
        // ------------------------------
        await client.query("COMMIT");
        client.release();

        // Render EJS page
        return res.status(200).render("admin/adminOrderDetail.ejs", {
            buyer : buyerRows[0],
            seller : sellerRows[0],
            product : productRows[0],
            payment : paymentRows[0] || {}
        });

    } catch (err) {
        console.error("GET /admin/orders/:orderId error:", err.message);
        await client.query("ROLLBACK");
        client.release();
        return res.status(500).send("Internal server error");
    }
};

export const toggleUserStatus = async (req, res) => {
    try {
        const userId = req.params.userId;

        await db.query(
            `UPDATE users 
            SET
                is_active = NOT is_active
            WHERE id = $1`,
            [userId]
        );

        return res.status(200).redirect("/admin/users");

    } catch (err) {
        console.error("POST /admin/users/:userId error:", err.message);
        return res.status(500).send("Failed to edit user details");
    }
};

export const changeProductStatus = async (req, res) => {
    try {
        const productId = req.params.productId;
        const statusId = req.params.statusId; 
        const userId = req.user.id;

        //Autherization

        const { rows: userRows } = await db.query(
            "SELECT username, role, is_active FROM users WHERE id=$1",[userId]);
        const { rows: productRows } = await db.query(
            "SELECT status FROM product WHERE id=$1",[productId]);
        if (
            userRows.length !== 1 || 
            userRows[0].is_active === false || 
            (userRows[0].role !== "ADMIN" && userRows[0].role !== "MODERATOR")
        ) {
            return res.status(403).send("Not authorized");
        }

        if (productRows.length !== 1) {
            return res.status(403).send("Product Not Found");
        }

        if ((statusId !== '1' && statusId !== '2') ||
            (statusId === '1' && productRows[0].status !== "PENDING") || 
            (statusId === '2' && productRows[0].status !== "APPROVED")) 
        {
            return res.status(403).send("Invalid Request");
        }

        //Changeing Status

        await db.query(
            `UPDATE product 
            SET
                status = $1,
                moderator = $2
            WHERE id = $3`,
            [statusId === '1' ? 'APPROVED' : 'REMOVED', userId, productId]
        );
        
        return res.status(200).redirect("/admin/products");

    } catch (err) {
        console.error("POST /admin/products/:productId error:", err.message);
        return res.status(500).send("Failed to edit product status");
    }
};

export const changeOrderStatus = async (req, res) => {
    try {
        const { orderId, statusId } = req.params;

        // Basic Authorization
        const { rows } = await db.query(
            `SELECT role, is_active
             FROM users WHERE id=$1`,
            [req.user.id]
        );

        const user = rows[0];

        if (!user || !user.is_active || !["ADMIN", "MODERATOR"].includes(user.role))
            return res.status(403).send("Not authorized");

        // Route to modular functions
        if (statusId === "1") {
            await confirmOrderHelper(orderId);
        } else if (statusId === "2") {
            await cancelOrderHelper(orderId);
        } else {
            return res.status(400).send("Invalid status id");
        }

        return res.redirect("/admin/orders");

    } catch (err) {
        console.error("Status update error:", err.message);
        return res.status(500).send(err.message || "Failed to update order");
    }
};

export const editAdminAddress = async (req, res) => {
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

        return res.status(200).redirect("/admin/profile");

    } catch (err) {
        console.error("POST /admin/profile error:", err.message);
        return res.status(500).send("Failed to edit address");
    }
};