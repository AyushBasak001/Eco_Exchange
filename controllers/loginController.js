import { db } from '../utils/db.js';

export const renderLoginPage = async (req, res) => {
  try {
    return res.status(200).render("login.ejs");

  } catch (err) {
    console.error("GET /login error:", err.message);

    return res.status(500).send("Internal server error");
  }
}

export const loginUser = async (req, res) => {
  try {
    return res.status(200).render("user.ejs", { username: req.body.username });

  } catch (err) {
    console.error("GET /login error:", err.message);

    return res.status(500).send("Internal server error");
  }
}

export const signupUser = async (req, res) => {
  try {
    return res.status(200).render("user.ejs", { username: req.body.username });

  } catch (err) {
    console.error("GET /login/signup error:", err.message);

    return res.status(500).send("Internal server error");
  }
}