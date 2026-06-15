const bcrypt = require("bcryptjs");
const db = require("../../config/db");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

const isProduction = process.env.NODE_ENV === "production";


const sameSite = isProduction ? "None" : "Lax";


    // REGISTER (PHONE ONLY + EMAIL OPTIONAL)

const registerRoute = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: "Validation failed",
            errors: errors.array(),
        });
    }

    const { fullname, email, phone, password, confirmpass } = req.body;

    // FIX: phone is required always
    if (!phone || !password) {
        return res.status(400).json({
            message: "Phone and password are required",
        });
    }

    if (password !== confirmpass) {
        return res.status(400).json({
            message: "Password doesn't match confirmation",
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            message: "Password must be at least 8 characters",
        });
    }

    try {
        // FIX: check both phone OR email in one query
        const [existingUsers] = await db.query(
            `SELECT id FROM users WHERE phone = ? OR email = ?`,
            [phone, email || null],
        );

        if (existingUsers.length) {
            return res.status(400).json({
                message: "User already exists",
            });
        }

        const hashedPass = await bcrypt.hash(password, 12);

        // FIX: want_promotion = true ONLY if email exists
        const wantPromotion = email ? true : false;

        await db.query(
            `INSERT INTO users
            (fullname, email, phone, password_hash, role, want_promotion)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [fullname, email || null, phone, hashedPass, "customer", wantPromotion],
        );

        return res.status(201).json({
            message: "User registered successfully",
        });
    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};


    // LOGIN (PHONE ONLY)
const loginUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: "Validation failed",
            errors: errors.array(),
        });
    }

    const { phone, password } = req.body;

    // FIX: login is phone ONLY
    if (!phone || !password) {
        return res.status(400).json({
            message: "Phone and password are required",
        });
    }

    try {
        
        const [rows] = await db.query(
                `SELECT id, fullname, password_hash, email, role
                FROM users
                WHERE phone = ?`,
            [phone],
        );

        if (!rows.length) {
            return res.status(400).json({
                message: "Invalid credentials",
            });
        }

        const user = rows[0];

        
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid credentials",
            });
        }

        const payload = {
            id: user.id,
            role: user.role,
        };

        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
            expiresIn: "15m",
        });

        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
            expiresIn: "7d",
        });

        // FIX: MySQL syntax + cleanup old tokens
        await db.query(`DELETE FROM refresh_tokens WHERE user_id = ?`, [user.id]);

        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await db.query(
            `INSERT INTO refresh_tokens
            (user_id, token, expires_at)
            VALUES (?, ?, ?)`,
            [user.id, refreshToken, expiresAt],
        );

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: sameSite,
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            message: "Login successful",
            accessToken,
            user: {
                id: user.id,
                name: user.fullname,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};


    // REFRESH TOKEN(rotation)

const refreshRoute = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: "No token" });
        }

        // FIX: MySQL + expiry check
        const [saved] = await db.query(
                `SELECT *
                FROM refresh_tokens
                WHERE token = ?
                AND expires_at > NOW()`,
            [refreshToken],
        );

        if (!saved.length) {
            return res.status(401).json({ message: "Invalid token" });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        const accessToken = jwt.sign(
            { id: decoded.id, role: decoded.role },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: "15m" },
        );

        return res.status(200).json({ accessToken });
    } catch (error) {
        console.error("Refresh error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

//    LOGOUT
const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(400).json({
                message: "No refresh token found",
            });
        }
        // FIX: correct table name
        await db.query(`DELETE FROM refresh_tokens WHERE token = ?`, [
            refreshToken,
        ]);

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: isProduction,
            sameSite: sameSite,
            path: "/",
        });

        return res.status(200).json({
            message: "Logged out",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    registerRoute,
    loginUser,
    refreshRoute,
    logout,
};
