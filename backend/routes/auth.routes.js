const express = require("express");
const { registerRoute, loginUser, refreshRoute, logout } = require("../controllers/auth.controller.js");
const { loginLimiter, registerLimiter } = require("../middlewares/ratelimiters.js")
const router = express.Router();


router.post("/register", registerLimiter, registerRoute) 
router.post("/login", loginLimiter, loginUser)
router.post("/refresh-token", refreshRoute)
router.post("/logout", logout)

module.exports = router