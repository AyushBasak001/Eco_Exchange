import { db } from '../utils/db.js';

export const renderAdminPage = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect("/auth");
    }
    const { username } = req.user;

    return res.status(200).render("adminDashboard.ejs", {username});

  } catch (err) {
    console.error("GET /admin error:", err.message);

    return res.status(500).send("Internal server error");
  }
}

export const manageUsers = async (req,res) => {
    try {
        return res.status(200).render("manageUsers.ejs");

    } catch (err) {
        console.error("GET /admin/users error:", err.message);

        return res.status(500).send("Internal server error");
    }
}

export const manageProducts = async (req,res) => {
    try {
        return res.status(200).render("manageProducts.ejs");

    } catch (err) {
        console.error("GET /admin/products error:", err.message);

        return res.status(500).send("Internal server error");
    }
}

export const manageOrders = async (req,res) => {
    try {
        return res.status(200).render("manageOrders.ejs");

    } catch (err) {
        console.error("GET /admin/orders error:", err.message);

        return res.status(500).send("Internal server error");
    }
}

export const manageAdminProfile = async (req,res) => {
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

        return res.status(200).render("manageAdminProfile.ejs", {
            user: userRows[0],
            address: addressRows[0]
        });

    } catch (err) {
        console.error("GET /admin/profile error:", err.message);
        return res.status(500).send("Failed to load profile");
    }
}

export const editAdminAddress = async (req, res) => {
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

        return res.status(200).redirect("/admin/profile");

    } catch (err) {
        console.error("POST /admin/profile error:", err.message);
        return res.status(500).send("Failed to edit address");
    }
};