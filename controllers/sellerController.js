import { db } from '../utils/db.js';

export const renderSellerPage = async (req, res) => {
  try {
    return res.status(200).render("seller.ejs");

  } catch (err) {
    console.error("GET /seller error:", err.message);

    return res.status(500).send("Internal server error");
  }
}