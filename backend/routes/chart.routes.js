const express = require("express");
const router = express.Router();
const controller = require("../controllers/chart.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

router.get("/uptime", authenticateToken, controller.chartsUptime);
router.get("/response-time", authenticateToken, controller.chartsResponseTime);

module.exports = router;
