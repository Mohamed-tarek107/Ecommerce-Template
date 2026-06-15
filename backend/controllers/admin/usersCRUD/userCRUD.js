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


