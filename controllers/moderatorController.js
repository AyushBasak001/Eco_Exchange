import { db } from '../utils/db.js';

export const manageModeratorProfile = async (req,res) => {
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

        return res.status(200).render("moderator/manageModeratorProfile.ejs", {
            user: userRows[0],
            address: addressRows[0]
        });

    } catch (err) {
        console.error("GET /moderator/profile error:", err.message);
        return res.status(500).send("Failed to load profile");
    }
}

export const editModeratorAddress = async (req, res) => {
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

        return res.status(200).redirect("/moderator/profile");

    } catch (err) {
        console.error("POST /moderator/profile error:", err.message);
        return res.status(500).send("Failed to edit address");
    }
};