import { db } from '../utils/db.js';

export const renderBuyerPage = async (req, res) => {
  try {
    return res.status(200).render("buyer.ejs");

  } catch (err) {
    console.error("GET /buyer error:", err.message);

    return res.status(500).send("Internal server error");
  }
}