const express = require("express");
const router = express.Router();
const controller = require("../controllers/monitor.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

router.get("/", authenticateToken, controller.getMonitor);
router.post("/", authenticateToken, controller.create);
router.put("/:id", authenticateToken, controller.update);
router.delete("/:id", authenticateToken, controller.delete);
router.patch("/:id/pause", authenticateToken, controller.pause);
router.get("/:id/history", authenticateToken, controller.history);
router.get("/:id/downtime", authenticateToken, controller.downtime);
router.get("/:id/uptime", authenticateToken, controller.uptime);
router.get(
  "/:id/chart/uptime",
  authenticateToken,
  controller.monitorUptimeChart
);
router.get(
  "/:id/chart/response-time",
  authenticateToken,
  controller.monitorResponseTimeChart
);
router.get("/:id", authenticateToken, controller.show);

module.exports = router;
