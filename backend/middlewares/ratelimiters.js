const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 5,
    message: "Too many login attempts",
    legacyHeaders: false,
    skip: (req) => req.method !== "POST",
})

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 registrations per hour
    message: "Too many accounts created, try again later",
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { registerLimiter, loginLimiter }