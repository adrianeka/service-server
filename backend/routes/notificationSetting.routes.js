const express = require("express");
const router = express.Router();
const controller = require("../controllers/notificationSetting.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

router.get("/", authenticateToken, controller.index);
router.get("/:id", authenticateToken, controller.show);
router.post("/", authenticateToken, controller.create);
router.put("/:id", authenticateToken, controller.update);
router.delete("/:id", authenticateToken, controller.destroy);

module.exports = router;
