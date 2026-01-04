const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");
const { upload, handleUploadError } = require("../controllers/user.controller");

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

router.post(
  "/:id/upload-profile-picture",
  authenticateToken,
  upload.single("profile_picture"),
  handleUploadError,
  userController.uploadProfilePicture
);

router.get(
  "/:id/profile-picture",
  authenticateToken,
  userController.getProfilePicture
);
router.delete(
  "/:id/profile-picture",
  authenticateToken,
  userController.deleteProfilePicture
);

module.exports = router;
