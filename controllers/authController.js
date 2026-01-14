import bcrypt from "bcrypt";
import { signToken } from "../utils/jwt.js";
import { db } from '../utils/db.js';

export const renderLoginPage = async (req, res) => {
  try {
    return res.status(200).render("login.ejs");

  } catch (err) {
    console.error("GET /auth error:", err.message);

    return res.status(500).send("Internal server error");
  }
}

export const login = async (req, res) => {
    const { username, email, password, role } = req.body;

    const result = await db.query(
        `SELECT id, username, email, password_hash, role, is_active
            FROM users
            WHERE username = $1 AND email = $2 AND role = $3`,
        [username, email, role]
    );

    if (!result.rows.length) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];

    if (!user.is_active) {
        return res.status(403).json({ message: "Account disabled" });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken({
        id: user.id,
        username: user.username,
        role: user.role
    });

    res.cookie("auth_token", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 1000 // 1 hour
    });

    return res.redirect("/user"); 
}

export async function signup(req, res) {
    const { username, email, password, role } = req.body;
    
    const is_verified = role === "USER";

    const hash = await bcrypt.hash(password, 12);

    await db.query(
        `INSERT INTO users (username, email, password_hash, role, is_verified)
         VALUES ($1, $2, $3, $4, $5)`,
        [username, email, hash, role, is_verified]
    );

    res.redirect("/auth/");
}

export function logout(req, res) {
    res.clearCookie("auth_token");
    res.redirect("/");
}

