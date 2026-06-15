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


const listAllOrders = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit

    try {
        const [countRows] = await db.execute("SELECT COUNT(*) AS total FROM orders")
        const total = countRows[0]?.total || 0

        const [rows] = await db.execute(
            `SELECT
                o.id,
                o.user_id,
                COALESCE(u.fullname, o.guest_name, 'Guest') AS ordered_by,
                o.total,
                o.is_paid,
                o.status,
                o.payment_method,
                o.created_at
            FROM orders o
            LEFT JOIN users u ON u.id = o.user_id
            ORDER BY o.created_at DESC
            LIMIT ? OFFSET ?`,
            [limit, offset],
        )

        return res.status(200).json({
            orders: rows,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        })
    } catch (error) {
        console.error("List orders error:", error)
        return res.status(500).json({ message: "Server error" })
    }
}

const orderInfo = async (req,res) => {
    const order_id = req.query.id

    try {
        if (!order_id) {
            return res.status(400).json({ message: "Order id is required" })
        }

        const [orderRows] = await db.execute(
            `SELECT
                o.id,
                o.user_id,
                o.address_id,
                o.guest_name,
                o.guest_email,
                o.guest_phone,
                o.guest_address,
                o.shipping_cost,
                o.total,
                o.status,
                o.payment_method,
                o.payment_proof_url,
                o.is_paid,
                o.paid_at,
                o.refund_note,
                o.created_at,
                u.fullname AS user_fullname,
                u.email AS user_email,
                u.phone AS user_phone,
                a.label AS address_label,
                a.street,
                a.city,
                a.governorate,
                a.is_default
            FROM orders o
            LEFT JOIN users u ON u.id = o.user_id
            LEFT JOIN addresses a ON a.id = o.address_id
            WHERE o.id = ?
            LIMIT 1`,
            [order_id],
        )

        if (!orderRows.length) {
            return res.status(404).json({ message: "Order not found" })
        }

        const order = orderRows[0]

        const customer = order.user_id
            ? {
                user_id: order.user_id,
                name: order.user_fullname,
                email: order.user_email,
                phone: order.user_phone,
            }
            : {
                user_id: null,
                name: order.guest_name,
                email: order.guest_email,
                phone: order.guest_phone,
            }

        const address = order.user_id
            ? {
                address_id: order.address_id,
                label: order.address_label,
                street: order.street,
                city: order.city,
                governorate: order.governorate,
                is_default: order.is_default,
            }
            : {
                address_id: null,
                address: order.guest_address,
            }

        const [itemsRows] = await db.execute(
            `SELECT
                oi.id,
                oi.order_id,
                oi.product_id,
                oi.quantity,
                oi.unit_price,
                oi.selected_color,
                oi.selected_size,
                oi.created_at,
                p.name AS product_name,
                p.description AS product_description,
                p.price AS product_price,
                p.category_id,
                p.stock
            FROM order_items oi
            LEFT JOIN products p ON p.id = oi.product_id
            WHERE oi.order_id = ?
            ORDER BY oi.created_at ASC`,
            [order_id],
        )

        return res.status(200).json({
            order,
            customer,
            address,
            items: itemsRows,
        })
    } catch (error) {
        console.error("Order info error:", error)
        return res.status(500).json({ message: "Server error" })
    }
}

module.exports = {
    listAllUsers,
    userinfo,
    listAllOrders,
    orderInfo
}