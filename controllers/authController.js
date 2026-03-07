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
        `SELECT id, username, password_hash, role, is_active
            FROM users
            WHERE username = $1 AND role = $2`,
        [username, role]
    );

    if (!result.rows.length) {
        return res.status(401).render("login.ejs", {error: "Invalid credentials" });
    }

    const user = result.rows[0];

    if (!user.is_active) {
        return res.status(403).render("login.ejs", {error: "Account disabled" });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
        return res.status(401).render("login.ejs", {error: "Invalid credentials" });
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

    if(role === 'USER') return res.redirect("/user/profile"); 
    else if(role === 'MODERATOR') return res.redirect("/moderator/profile");
    else if(role === 'ADMIN') return res.redirect("/admin/profile");
}

export async function signup(req, res) {

    const { username, password, role } = req.body;

    if (role === "ADMIN") {
        try {
        const { rows } = await db.query(
            `SELECT COUNT(*) FROM users WHERE role = $1`, ["ADMIN"]);

        if (rows[0].count == 1) {
            return res.status(500).render("login.ejs", {error: "Admin already exists" });
        } else {
            const is_verified = true;
            const hash = await bcrypt.hash(password, 12);

            await signupQuery(res, username, role, is_verified, hash);
        }

        } catch (err) {
            console.error("GET /admin/signup error:", err.message);
            return res.status(500).render("login.ejs", {error: "Failed to Sign up Admin" });
        }
    } else {
        
        const is_verified = role === "USER";
        const hash = await bcrypt.hash(password, 12);

        await signupQuery(res, username, role, is_verified, hash);
    }
}

export function logout(req, res) {
    res.clearCookie("auth_token");
    res.redirect("/");
}


//Helper Functions

async function signupQuery(res, username, role, is_verified, hash){
    // Using a transaction for atomicity
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        // 1. Insert User and return the new user_id
        const userRes = await client.query(
            `INSERT INTO users (username, password_hash, role, is_verified)
            VALUES ($1, $2, $3, $4)
            RETURNING id`,
            [username, hash, role, is_verified]
        );

        const newUserId = userRes.rows[0].id;

        // 2. Insert Address using the returned user_id
        await client.query(
            `INSERT INTO address (user_id)
            VALUES ($1)`,
            [newUserId]
        );

        await client.query('COMMIT');
        
        res.redirect("/auth/");
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Signup Error:", error);
        res.status(500).send("Registration failed.");
    } finally {
        client.release();
    }
}
