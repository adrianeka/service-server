const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

router.get("/profile/:id", authenticateToken, userController.getProfile);
router.patch(
  "/:id/update-profile",
  authenticateToken,
  userController.updateProfile
);
router.patch(
  "/:id/change-password",
  authenticateToken,
  userController.changePassword
);

module.exports = router;
