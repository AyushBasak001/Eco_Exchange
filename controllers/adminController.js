import { db } from '../utils/db.js';

export const manageUsers = async (req,res) => {
    try {
        const adminId = req.user.id;

        const { rows: userRows } = await db.query(
            "SELECT id, username, role, is_active, is_verified, created_at FROM users ORDER BY created_at DESC");

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
    const { rows: productList } = await db.query(`
            SELECT 
                p.id,
                p.title,
                p.price,
                p.quantity_available,
                u.username AS seller_name
            FROM product p
            JOIN users u ON p.seller_id = u.id
            WHERE p.status = 'APPROVED'
            GROUP BY p.id, u.username
            ORDER BY p.created_at DESC
        `);

        return res.status(200).render("admin/manageProducts.ejs", { productList });

  } catch (err) {
    console.error("GET /admin/products error:", err.message);

    return res.status(500).send("Failed to load marketplace");
  }
}

export const manageOrders = async (req,res) => {
    try {
        return res.status(200).render("admin/manageOrders.ejs");

    } catch (err) {
        console.error("GET /admin/orders error:", err.message);

        return res.status(500).send("Internal server error");
    }
}

export const manageAdminProfile = async (req,res) => {
    try {
        const userId = req.user.id;

        const { rows: userRows } = await db.query(
            "SELECT id, username, role, is_active, is_verified FROM users WHERE id = $1",
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

export const editUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const {is_active, is_verified} = req.body;

        await db.query(
            `UPDATE users 
            SET
                is_active = $1,
                is_verified = $2
            WHERE id = $3`,
            [is_active, is_verified, userId]
        );

        return res.status(200).redirect("/admin/users");

    } catch (err) {
        console.error("POST /admin/users/:userId error:", err.message);
        return res.status(500).send("Failed to edit user details");
    }
};

export const editAdminAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        // Destructure all possible fields from req.body
        const { line1, line2, city, state, pincode, phone } = req.body;

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