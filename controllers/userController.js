import { db } from '../utils/db.js';

export const renderUserPage = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect("/auth");
    }
    const { username } = req.user;

    return res.status(200).render("user.ejs", {username});

  } catch (err) {
    console.error("GET /user error:", err.message);

    return res.status(500).send("Internal server error");
  }
}

export const renderMarketplace = async (req, res) => {
  try {
    return res.status(200).render("userMarketplace.ejs");

  } catch (err) {
    console.error("GET /user/marketplace error:", err.message);

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
    console.error("GET /user/orders error:", err.message);

    return res.status(500).send("Internal server error");
  }
}

export const renderUserProfile = async (req, res) => {
  try {
    return res.status(200).render("userProfile.ejs");

  } catch (err) {
    console.error("GET /user/profile error:", err.message);

    return res.status(500).send("Internal server error");
  }
}