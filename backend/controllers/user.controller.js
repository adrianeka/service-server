const bcrypt = require("bcryptjs");
const {
  getUserProfileById,
  updateUserProfile,
  updateUserPassword,
  getUserById,
  getUserByEmail,
} = require("../models/database");

exports.getProfile = (req, res) => {
  const userId = parseInt(req.params.id);

  if (req.user.id !== userId) {
    return res.status(403).json({
      status: false,
      message: "You can only view your own profile",
    });
  }

  getUserProfileById(userId, (err, user) => {
    if (err) {
      return res.status(500).json({ status: false, message: "Server error" });
    }

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    res.json({
      status: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        is_active: user.is_active === 1,
        created_at: user.created_at,
      },
    });
  });
};

exports.updateProfile = (req, res) => {
  const userId = parseInt(req.params.id);
  const { username, email } = req.body;

  if (req.user.id !== userId) {
    return res.status(403).json({
      status: false,
      message: "You can only update your own profile",
    });
  }

  if (!username || !email) {
    return res.status(400).json({
      status: false,
      message: "Username and email are required",
    });
  }

  updateUserProfile(userId, username, email, (err, updatedUser) => {
    if (err) {
      if (err.code === "EMAIL_EXISTS") {
        return res.status(400).json({
          status: false,
          message: "Email already exists",
        });
      }
      return res.status(500).json({
        status: false,
        message: "Failed to update profile",
      });
    }

    res.json({
      status: true,
      message: "Profile updated successfully",
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        is_active: updatedUser.is_active === 1,
      },
    });
  });
};

exports.changePassword = async (req, res) => {
  const userId = parseInt(req.params.id);
  const { current_password, new_password, new_password_confirmation } =
    req.body;

  if (req.user.id !== userId) {
    return res.status(403).json({
      status: false,
      message: "You can only change your own password",
    });
  }

  if (!current_password || !new_password || !new_password_confirmation) {
    return res.status(400).json({
      status: false,
      message: "All password fields are required",
    });
  }

  if (new_password !== new_password_confirmation) {
    return res.status(400).json({
      status: false,
      message: "Password confirmation does not match",
    });
  }

  getUserByEmail(req.user.email, async (err, user) => {
    if (err || !user) {
      return res.status(500).json({
        status: false,
        message: "Failed to verify user",
      });
    }

    const validPassword = await bcrypt.compare(
      current_password,
      user.password_hash
    );

    if (!validPassword) {
      return res.status(401).json({
        status: false,
        message: "Current password is incorrect",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(new_password, salt);

    updateUserPassword(userId, newHash, () => {
      res.json({
        status: true,
        message: "Password changed successfully",
      });
    });
  });
};
