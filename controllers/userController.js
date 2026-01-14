import { db } from '../utils/db.js';

export const renderUserPage = async (req, res) => {
  try {
    return res.status(200).render("user.ejs");

  } catch (err) {
    console.error("GET /user error:", err.message);

    return res.status(500).send("Internal server error");
  }
}

export const renderMarketplace = async (req, res) => {
  try {
    return res.status(200).render("userMarketplace.ejs");

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

export const renderUserOrders = async (req, res) => {
  try {
    return res.status(200).render("userOrders.ejs");

  } catch (err) {
    console.error("GET /user/buyingHistory error:", err.message);

    return res.status(500).send("Internal server error");
  }
}

export const renderUserProfile = async (req, res) => {
  try {
    return res.status(200).render("userProfile.ejs");

  } catch (err) {
    console.error("GET /user/sellingHistory error:", err.message);

    return res.status(500).send("Internal server error");
  }
}