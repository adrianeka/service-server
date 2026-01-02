const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { addUser, getUserByEmail, getUserById } = require("../models/database");

const JWT_SECRET = process.env.JWT_SECRET || "48d874b79df7a52764ab06d2bd5a41ef";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

exports.register = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      password_confirmation,
      is_active = true,
    } = req.body;

    if (!username || !email || !password || !password_confirmation) {
      return res.status(400).json({
        status: false,
        message: "All fields are required",
      });
    }

    if (password !== password_confirmation) {
      return res.status(400).json({
        status: false,
        message: "Password confirmation does not match",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: false,
        message: "Password must be at least 6 characters",
      });
    }

    getUserByEmail(email, async (err, existingUser) => {
      if (err) {
        console.error("Error checking existing user:", err.message);
        return res.status(500).json({
          status: false,
          message: "Server error",
        });
      }

      if (existingUser) {
        return res.status(400).json({
          status: false,
          message: "Email already registered",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      addUser(username, email, passwordHash, (err, userId) => {
        if (err) {
          console.error("Error creating user:", err.message);
          return res.status(500).json({
            status: false,
            message: "Failed to create user",
          });
        }

        getUserById(userId, (err, user) => {
          if (err) {
            console.error("Error fetching created user:", err.message);
            return res.status(500).json({
              status: false,
              message: "User created but failed to fetch data",
            });
          }

          res.status(201).json({
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
      });
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

exports.login = (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "Email and password are required",
      });
    }

    getUserByEmail(email, async (err, user) => {
      if (err) {
        console.error("Error finding user:", err.message);
        return res.status(500).json({
          status: false,
          message: "Server error",
        });
      }

      if (!user) {
        return res.status(401).json({
          status: false,
          message: "Invalid email or password",
        });
      }

      if (user.is_active === 0) {
        return res.status(403).json({
          status: false,
          message: "Account is inactive",
        });
      }

      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({
          status: false,
          message: "Invalid email or password",
        });
      }

      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          email: user.email,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.json({
        status: true,
        token: token,
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

exports.logout = (req, res) => {
  res.json({
    status: true,
    message: "Logged out successfully",
  });
};
