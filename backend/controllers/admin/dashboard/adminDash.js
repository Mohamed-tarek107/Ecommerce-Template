
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

const db = require("../../config/db");

const dashboardStats = async (req,res) => {
    const userId = req.user.id;

    try {
        const [data] = db.executre
    } catch (error) {
        
    }

}