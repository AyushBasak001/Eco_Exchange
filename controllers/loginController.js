import { db } from '../utils/db.js';

export const renderLoginPage = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM users"
    );
    return res.status(200).render("login.ejs", {
      userList: result.rows
    });

  } catch (err) {
    console.error("GET /enquiry error:", err.message);

    return res.status(500).send("Internal server error");
  }
}