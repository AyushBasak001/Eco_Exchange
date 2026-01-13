import { db } from '../utils/db.js';

export const renderUserPage = async (req, res) => {
  try {
    return res.status(200).render("user.ejs");

  } catch (err) {
    console.error("GET /user error:", err.message);

    return res.status(500).send("Internal server error");
  }
}