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

    const { fullname, email, phonenumber, password, confirmpassword  } = req.body
    
    if(!email && !phonenumber) return res.status(400).json({ message: "Provide Email or Phone Number" })
    if (password !== confirmpassword) return res.status(400).json({ message: "Password doesn't match confirmation" })

    try {
        // Check for existing user by email or phone
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
            `INSERT INTO users (fullname, email, phonenumber, hashedpass, is_firstlogin, role) VALUES($1, $2, $3, $4, $5)`,
            [fullname, email || null, phonenumber || null, hashedPass, true, 'user']
        );
        
        return res.status(201).json({ message: "User registered successfully" })
    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

const loginUser = async (req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: "Validation failed",
            errors: errors.array()
        });
    }

    const { email, phonenumber, password } = req.body

    if(!email && !phonenumber) return res.status(400).json({ message: "Provide Email or Phone Number" })

    try {
        // Find user by email or phone
        let result;
        if (email) {
            result = await db.query(
                `SELECT id, fullname, hashedpass, is_firstlogin FROM users WHERE email = $1`,
                [email]
            );
        } else {
            result = await db.query(
                `SELECT id, fullname, hashedpass, is_firstlogin FROM users WHERE phoneNum = $1`,
                [phonenumber]
            );
        }

        const existingUser = result.rows;
        if (!existingUser.length) return res.status(400).json({ message: "User not registered" });

        const user = existingUser[0];

        const isMatch = await bcrypt.compare(password, user.hashedpass);
        if(!isMatch) return res.status(400).json({ message: "Incorrect password" });

        let payload = { 
            id: user.id,
            role: user.role
        }
        const accesstoken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
        const refreshtoken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })


        return res.status(200).json({ token, user: { id: user.id, fullname: user.fullname, is_firstlogin: user.is_firstlogin } });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Server error" });
    }
}