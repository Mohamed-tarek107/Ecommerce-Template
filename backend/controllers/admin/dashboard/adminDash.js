
//========================
//  Expected Return 
//========================

// {
//   "stats": {
//     "totalOrders": 156,
//     "totalRevenue": 45890.50,
//     "pendingOrders": 12,
//     "totalUsers": 98,
//     "totalProducts": 43
//   },

//   "lowStockProducts": [
//     {
//       "id": "1",
//       "name": "Snake Plant",
//       "stock": 3
//     },
//     {
//       "id": "2",
//       "name": "Monstera",
//       "stock": 2
//     }
//   ],

//   "recentOrders": [
//     {
//       "id": "123",
//       "customerName": "Mohamed Tarek",
//       "totalAmount": 850,
//       "status": "pending",
//       "createdAt": "2026-06-15T12:00:00Z"
//     },
//     {
//       "id": "124",
//       "customerName": "Ahmed Ali",
//       "totalAmount": 450,
//       "status": "completed",
//       "createdAt": "2026-06-15T11:00:00Z"
//     }
//   ]
// }

const db = require("../../config/db.js");

const dashboardStats = async (req, res) => {
    try {
        // One compact aggregate query for the top dashboard numbers.
        const [statsRows] = await db.query(`
            SELECT
                (SELECT COUNT(*) FROM orders) AS totalOrders,
                COALESCE((SELECT SUM(total) FROM orders), 0) AS totalRevenue,
                (SELECT COUNT(*) FROM orders WHERE status = 'pending') AS pendingOrders,
                (SELECT COUNT(*) FROM users) AS totalUsers,
                (SELECT COUNT(*) FROM products) AS totalProducts
        `);

        // Keep the low-stock list simple and easy to tune later.
        const [lowStockProducts] = await db.query(
            `
            SELECT id, name, stock
            FROM products
            WHERE stock <= ?
            ORDER BY stock ASC, name ASC
            LIMIT 5
        `,
            [5],
        );

        // Recent orders with a fallback for guest checkouts.
        const [recentOrders] = await db.query(`
            SELECT
                o.id,
                COALESCE(u.fullname, o.guest_name, 'Guest') AS customerName,
                o.total AS totalAmount,
                o.status,
                o.created_at AS createdAt
            FROM orders o
            LEFT JOIN users u ON u.id = o.user_id
            ORDER BY o.created_at DESC
            LIMIT 10
        `);

        const stats = statsRows[0] || {};

        return res.status(200).json({
            stats: {
                totalOrders: Number(stats.totalOrders || 0),
                totalRevenue: Number(stats.totalRevenue || 0),
                pendingOrders: Number(stats.pendingOrders || 0),
                totalUsers: Number(stats.totalUsers || 0),
                totalProducts: Number(stats.totalProducts || 0),
            },
            lowStockProducts: lowStockProducts.map((product) => ({
                id: product.id,
                name: product.name,
                stock: Number(product.stock || 0),
            })),
            
            recentOrders: recentOrders.map((order) => ({
                id: order.id,
                customerName: order.customerName,
                totalAmount: Number(order.totalAmount || 0),
                status: order.status,
                createdAt: order.createdAt,
            })),
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    dashboardStats,
};