const db = require("../../config/db.js");


const listAllUsers = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit

    const [rows] = await db.execute("SELECT * FROM users LIMIT ? OFFSET ?",[limit, offset])
    return res.status(200).json({ 
        users: rows,
        page,
        limit
    })
}


const userinfo = async (req,res) => {
    const user_id = req.query.id

    try {
        if (!user_id) {
            return res.status(400).json({ message: "User id is required" })
        }

        const [userRows] = await db.execute("SELECT * FROM users WHERE id = ?", [user_id])

        if (!userRows.length) {
            return res.status(404).json({ message: "User not found" })
        }

        const [addressesRows] = await db.execute(
            "SELECT * FROM addresses WHERE user_id = ? ORDER BY created_at DESC",
            [user_id],
        )

        const [ordersRows] = await db.execute(
            `SELECT 
                id,
                user_id,
                address_id,
                shipping_cost,
                total,
                status,
                payment_method,
                payment_proof_url,
                is_paid,
                paid_at,
                refund_note,
                created_at
            FROM orders
            WHERE user_id = ?
            ORDER BY created_at DESC`,
            [user_id],
        )

        return res.status(200).json({
            user: userRows[0],
            addresses: addressesRows,
            orders: ordersRows,
        })
    } catch (error) {
        console.error("User info error:", error)
        return res.status(500).json({ message: "Server error" })
    }
}


