const path = require("path");
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mysql = require("mysql2/promise");



const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DBPass,
    database: process.env.DB_NAME,
    timezone: process.env.DB_TZ
});

(async () => {
    try {
        const connection = await db.getConnection();
        console.log("Connected to MySQL successfully!");
        connection.release();
    } catch (err) {
        console.error("Error connecting to MySQL:", err.message);
    }
})();

module.exports = db;