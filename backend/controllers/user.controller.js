const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { getBaseUrl } = require("../utils/url");

const {
  getUserProfileById,
  updateUserProfile,
  updateUserPassword,
  getUserById,
  getUserByEmail,
  updateUserProfilePicture,
  getUserProfilePicture,
} = require("../models/database");

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/profile_pictures";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const userId = req.params.id;
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `profile-${userId}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
  }
};

// Create upload instance
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        status: false,
        message: "File size too large. Maximum size is 5MB",
      });
    }
    return res.status(400).json({
      status: false,
      message: `Upload error: ${err.message}`,
    });
  } else if (err) {
    return res.status(400).json({
      status: false,
      message: err.message,
    });
  }
  next();
};

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

    const profileData = {
      id: user.id,
      username: user.username,
      email: user.email,
      is_active: user.is_active === 1,
      created_at: user.created_at,
      profile_picture: user.profile_picture,
    };

    if (user.profile_picture) {
      profileData.profile_picture_url = `${req.protocol}://${req.get("host")}${
        user.profile_picture
      }`;
    }

    res.json({
      status: true,
      data: profileData,
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

exports.uploadProfilePicture = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const baseUrl = getBaseUrl(req);

    if (req.user.id !== userId) {
      return res.status(403).json({
        status: false,
        message: "You can only update your own profile picture",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: false,
        message: "No file uploaded",
      });
    }

    getUserProfilePicture(userId, async (err, user) => {
      if (err) {
        return res.status(500).json({
          status: false,
          message: "Failed to check existing profile picture",
        });
      }

      if (user && user.profile_picture) {
        const oldFilePath = path.join(__dirname, "..", user.profile_picture);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      const relativePath = `/uploads/profile_pictures/${req.file.filename}`;

      updateUserProfilePicture(userId, relativePath, (err) => {
        if (err) {
          fs.unlinkSync(req.file.path);
          return res.status(500).json({
            status: false,
            message: "Failed to update profile picture in database",
          });
        }

        res.json({
          status: true,
          message: "Profile picture uploaded successfully",
          data: {
            profile_picture_url: relativePath,
            full_url: `${baseUrl}${relativePath}`,
          },
        });
      });
    });
  } catch (error) {
    console.error("Upload profile picture error:", error);
    res.status(500).json({
      status: false,
      message: "Server error during upload",
    });
  }
};

// Get foto profil
exports.getProfilePicture = (req, res) => {
  const userId = parseInt(req.params.id);

  // Bisa melihat foto sendiri atau foto user lain (untuk kebutuhan tampilan)
  getUserProfilePicture(userId, (err, user) => {
    if (err) {
      return res.status(500).json({
        status: false,
        message: "Failed to get profile picture",
      });
    }

    if (!user || !user.profile_picture) {
      return res.status(404).json({
        status: false,
        message: "Profile picture not found",
      });
    }

    const fullUrl = `${req.protocol}://${req.get("host")}${
      user.profile_picture
    }`;

    res.json({
      status: true,
      data: {
        profile_picture_url: user.profile_picture,
        full_url: fullUrl,
      },
    });
  });
};

// Delete foto profil
exports.deleteProfilePicture = (req, res) => {
  const userId = parseInt(req.params.id);

  // Validasi akses
  if (req.user.id !== userId) {
    return res.status(403).json({
      status: false,
      message: "You can only delete your own profile picture",
    });
  }

  getUserProfilePicture(userId, (err, user) => {
    if (err) {
      return res.status(500).json({
        status: false,
        message: "Failed to get profile picture",
      });
    }

    if (!user || !user.profile_picture) {
      return res.status(404).json({
        status: false,
        message: "Profile picture not found",
      });
    }

    // Hapus dari sistem file
    const filePath = path.join(__dirname, "..", user.profile_picture);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Hapus dari database (set null)
    updateUserProfilePicture(userId, null, (err) => {
      if (err) {
        return res.status(500).json({
          status: false,
          message: "Failed to delete profile picture from database",
        });
      }

      res.json({
        status: true,
        message: "Profile picture deleted successfully",
      });
    });
  });
};

exports.upload = upload;
exports.handleUploadError = handleUploadError;
