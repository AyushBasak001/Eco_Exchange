import { db } from '../utils/db.js';

export const renderUserPage = async (req, res) => {
  try {
    return res.status(200).render("user.ejs");

  } catch (err) {
    console.error("GET /user error:", err.message);

    return res.status(500).send("Internal server error");
  }
}

export const renderBuyPage = async (req, res) => {
  try {
    return res.status(200).render("userBuy.ejs");

  } catch (err) {
    console.error("GET /user/buy error:", err.message);

    return res.status(500).send("Internal server error");
  }
}

export const renderSellPage = async (req, res) => {
  try {
    return res.status(200).render("userSell.ejs");

  } catch (err) {
    console.error("GET /user/sell error:", err.message);

    return res.status(500).send("Internal server error");
  }
}

export const renderBuyingHistory = async (req, res) => {
  try {
    return res.status(200).render("userBuyingHistory.ejs");

  } catch (err) {
    console.error("GET /user/buyingHistory error:", err.message);

    return res.status(500).send("Internal server error");
  }
}

export const renderSellingHistory = async (req, res) => {
  try {
    return res.status(200).render("userSellingHistory.ejs");

  } catch (err) {
    console.error("GET /user/sellingHistory error:", err.message);

    return res.status(500).send("Internal server error");
  }
}