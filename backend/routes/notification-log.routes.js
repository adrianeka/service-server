const express = require("express");
const router = express.Router();
const controller = require("../controllers/notification-logs.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

router.get("/", authenticateToken, controller.getNotificationLogs);
router.post("/", authenticateToken, controller.create);
router.delete("/:id", authenticateToken, controller.delete);

module.exports = router;
