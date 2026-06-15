const express = require("express");
const {
    ensureAuthenticated,
    requireAdmin,
} = require("../middlewares/authmiddlewares.js");
const {
    dashboardStats,
} = require("../controllers/admin/dashboard/adminDash.js");

const router = express.Router();

// Admin dashboard data.
router.get("/dashboard", ensureAuthenticated, requireAdmin, dashboardStats);

module.exports = router;