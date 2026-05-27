const bcrypt = require("bcryptjs");
const db = require("../config/db");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");


const registerRoute = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: "Validation failed",
            errors: errors.array()
        });
    }

    const { fullname, email, phonenumber, password, confirmpassword } = req.body

    if (!email && !phonenumber) return res.status(400).json({ message: "Provide Email or Phone Number" })
    if (password !== confirmpassword) return res.status(400).json({ message: "Password doesn't match confirmation" })

    try {
        let existingUser;
        if (email) {
            const result = await db.query(
                `SELECT id FROM users WHERE email = $1`, [email]
            );
            existingUser = result.rows;
        } else {
            const result = await db.query(
                `SELECT id FROM users WHERE phonenumber = $1`, [phonenumber]
            );
            existingUser = result.rows;
        }

        if (existingUser.length) return res.status(400).json({ message: "User already registered" });

        const hashedPass = await bcrypt.hash(password, 12);
        await db.query(
            `INSERT INTO users (fullname, email, phonenumber, hashedpass, is_firstlogin, role) VALUES($1, $2, $3, $4, $5, $6)`,
            [fullname, email || null, phonenumber || null, hashedPass, true, 'user']
        );

        return res.status(201).json({ message: "User registered successfully" })
    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

const loginUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: "Validation failed",
            errors: errors.array()
        });
    }

    const { email, phonenumber, password } = req.body

    if (!email && !phonenumber) return res.status(400).json({ message: "Provide Email or Phone Number" })

    try {
        // Find user by email or phone
        let result;
        if (email) {
            result = await db.query(
                `SELECT id, fullname, hashedpass, is_firstlogin, email, role FROM users WHERE email = $1`,
                [email]
            );
        } else {
            result = await db.query(
                `SELECT id, fullname, hashedpass, is_firstlogin, email, role FROM users WHERE phonenumber = $1`,
                [phonenumber]
            );
        }

        const existingUser = result.rows;
        if (!existingUser.length) return res.status(400).json({ message: "User not registered" });

        const user = existingUser[0];

        const isMatch = await bcrypt.compare(password, user.hashedpass);
        if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

        const payload = {
            id: user.id,
            role: user.role
        };
        const accesstoken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
        const refreshtoken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
        await db.query("DELETE FROM refresh_tokens WHERE user_id = $1", [user.id]);
        await db.query(
            "INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)",
            [user.id, refreshtoken]
        );

        res.cookie("refreshToken", refreshtoken, {
            httpOnly: true,
            secure: true,        // HTTPS only — mandatory for Safari
            sameSite: "None",
            maxAge: 30 * 24 * 60 * 60 * 1000 //30 days
        });
        res.status(200).json({
            message: "User logged in successfully",
            accessToken: accesstoken,
            user: {
                id: user.id,
                name: user.fullname,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

const refreshRoute = async (req, res) => {
    try {
        const refreshtoken = req.cookies.refreshToken;

        if (!refreshtoken) return res.status(401).json({ message: "No token" });

        // check it exists in DB
        const saved = await db.query(
            "SELECT * FROM refresh_tokens WHERE token = $1", [refreshtoken]
        );
        if (!saved.rows.length) return res.status(401).json({ message: "Invalid token" });

        const decoded = jwt.verify(refreshtoken, process.env.JWT_REFRESH_SECRET);
        const accessToken = jwt.sign(
            { id: decoded.id, role: decoded.role },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: "15m" }
        );

        res.status(200).json({ accessToken });
    } catch (error) {
        console.error("Refresh error:", error);
        return res.status(500).json({ message: "Server error" });
    }
}