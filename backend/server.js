const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: path.join(__dirname, '../.env') });
}
const app = express();

console.log('Environment:', process.env.NODE_ENV);

const corsOrigin = (process.env.FRONTEND_URL || 'http://localhost:4200').replace(/\/+$/, '');

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        return callback(null, origin.replace(/\/+$/, '') === corsOrigin);
    },
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

const adminRoutes = require("./routes/admin.routes.js");

app.get('/', (req, res) => res.json({ ok: true }));
app.use("/admin", adminRoutes);
// Minimal global error handler
app.use((err, req, res, next) => {
    console.error(err && err.stack ? err.stack : err);
    res.status(500).json({ message: 'Something went wrong' });
});

const PORT = process.env.PORT || process.env.SERVER_PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));