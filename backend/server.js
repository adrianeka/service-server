const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const axios = require("axios");
const dns = require("dns").promises;
const ping = require("ping");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  getAllMonitors,
  addMonitor,
  deleteMonitor,
  updateMonitorStatus,
  getUptimePercentage,
  getUptimeChartData,
  getResponseTimeChartData,
  getMonitorHistory,
  updateMonitor,
  toggleMonitorPause,
  getMonitorUptimeChartData,
  getMonitorResponseTimeChartData,
  updateMonitorFavicon,
  addUser,
  getUserByEmail,
  getUserById,
  getUserProfileById,
  updateUserProfile,
  updateUserPassword,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllMonitorsForAdmin,
  checkMonitorOwnership,
  getMonitorNotificationSettings,
  getNotificationSetting,
  createNotificationSetting,
  updateNotificationSetting,
  deleteNotificationSetting,
  checkNotificationSettingOwnership,
} = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:5173",
  "https://uptime-kit.vercel.app",
  "https://uptime-kit.jiwamu.de",
];

const JWT_SECRET = process.env.JWT_SECRET || "48d874b79df7a52764ab06d2bd5a41ef";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (Postman, curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("UptimeKit backend is running 🚀");
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      status: false,
      message: "Access token required",
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        status: false,
        message: "Invalid or expired token",
      });
    }
    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      status: false,
      message: "Access denied. Admin privileges required.",
    });
  }
  next();
}

app.post("/api/auth/register", async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      password_confirmation,
      role = "user",
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

      addUser(username, email, passwordHash, role, (err, userId) => {
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
              role: user.role,
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
});

app.post("/api/auth/login", (req, res) => {
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
          email: user.email,
          role: user.role,
          username: user.username,
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
          role: user.role,
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
});

app.post("/api/auth/logout", authenticateToken, (req, res) => {
  res.json({
    status: true,
    message: "Logged out successfully",
  });
});

async function fetchFavicon(url) {
  try {
    const response = await axios.get(url, { timeout: 5000 });
    const html = response.data;

    const iconMatch = html.match(
      /<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']+)["'][^>]*>/i
    );
    if (iconMatch) {
      const iconUrl = iconMatch[1];
      if (iconUrl.startsWith("//")) {
        return "https:" + iconUrl;
      } else if (iconUrl.startsWith("/")) {
        const baseUrl = new URL(url);
        return `${baseUrl.protocol}//${baseUrl.host}${iconUrl}`;
      } else if (!iconUrl.startsWith("http")) {
        const baseUrl = new URL(url);
        return `${baseUrl.protocol}//${baseUrl.host}/${iconUrl}`;
      }
      return iconUrl;
    }
    const baseUrl = new URL(url);
    const faviconUrl = `${baseUrl.protocol}//${baseUrl.host}/favicon.ico`;
    try {
      await axios.head(faviconUrl, { timeout: 2000 });
      return faviconUrl;
    } catch {
      return null;
    }
  } catch (error) {
    console.error("Error fetching favicon:", error.message);
    return null;
  }
}

app.get("/api/monitors", authenticateToken, (req, res) => {
  const userId = req.user.id;
  getAllMonitors(userId, (err, rows) => {
    if (err) {
      console.error("Error fetching monitors:", err.message);
      return res.status(500).json({
        status: false,
        error: "Failed to fetch monitors",
      });
    }
    const monitorsWithType = rows.map((monitor) => ({
      ...monitor,
      type: monitor.type || "http",
      favicon: monitor.favicon || null,
    }));
    res.json(monitorsWithType);
  });
});

app.post("/api/monitors", authenticateToken, async (req, res) => {
  const { name, url, type = "http" } = req.body;
  const userId = req.user.id;

  if (!name || !url) {
    return res.status(400).json({ error: "Name and URL are required" });
  }

  addMonitor(name, url, type, userId, (err, id) => {
    if (err) {
      console.error("Error adding monitor:", err.message);
      if (err.message && err.message.includes("UNIQUE constraint failed")) {
        return res
          .status(400)
          .json({ error: "A monitor with this URL and type already exists" });
      }
      return res.status(500).json({ error: "Failed to add monitor" });
    }

    if (type === "http") {
      fetchFavicon(url)
        .then((favicon) => {
          if (favicon) {
            updateMonitorFavicon(id, favicon, userId, (updateErr) => {
              if (updateErr) {
                console.error("Error updating favicon:", updateErr.message);
              }
            });
          }
        })
        .catch((err) => {
          console.error("Error fetching favicon:", err.message);
        });
    }

    res.status(201).json({
      id,
      name,
      url,
      type: type || "http",
      status: "unknown",
      response_time: 0,
      paused: 0,
      favicon: null,
      message: "Monitor added successfully",
    });
  });
});

app.delete("/api/monitors/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  deleteMonitor(id, userId, (err, changes) => {
    if (err) {
      console.error("Error deleting monitor:", err.message);
      return res.status(500).json({
        status: false,
        error: "Failed to delete monitor. Please try again.",
      });
    }

    if (changes === 0) {
      return res.status(404).json({
        status: false,
        error: "Monitor not found or you don't have permission to delete it",
      });
    }

    res.json({
      status: true,
      message: "Monitor deleted successfully",
    });
  });
});

app.get("/api/monitors/:id/uptime", authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  getUptimePercentage(id, userId, (err, percentage) => {
    if (err) {
      console.error("Error fetching uptime:", err.message);
      return res.status(500).json({ error: "Failed to fetch uptime" });
    }
    res.json({ uptime: percentage });
  });
});

app.get("/api/charts/uptime", authenticateToken, (req, res) => {
  const userId = req.user.id;
  getUptimeChartData(userId, (err, data) => {
    if (err) {
      console.error("Error fetching uptime chart data:", err.message);
      return res.status(500).json({ error: "Failed to fetch uptime data" });
    }
    res.json(data || []);
  });
});

app.get("/api/charts/response-time", authenticateToken, (req, res) => {
  const userId = req.user.id;
  getResponseTimeChartData(userId, (err, data) => {
    if (err) {
      console.error("Error fetching response time data:", err.message);
      return res
        .status(500)
        .json({ error: "Failed to fetch response time data" });
    }
    res.json(data || []);
  });
});

app.put("/api/monitors/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, url, type = "http" } = req.body;
  const userId = req.user.id;

  if (!name || !url) {
    return res.status(400).json({ error: "Name and URL are required" });
  }

  updateMonitor(id, name, url, type, req.user, (err) => {
    if (err) {
      if (err.message === "FORBIDDEN") {
        return res.status(403).json({ error: "Access denied" });
      }

      if (err.message.includes("UNIQUE constraint failed")) {
        return res.status(400).json({
          error: "You already have a monitor with this URL and type",
        });
      }

      return res.status(500).json({ error: "Failed to update monitor" });
    }

    res.json({ message: "Monitor updated successfully" });
  });
});

app.patch("/api/monitors/:id/pause", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { paused } = req.body;
  const userId = req.user.id;

  toggleMonitorPause(id, paused, userId, (err, changes) => {
    if (err) {
      console.error("Error updating pause status:", err.message);
      return res.status(500).json({ error: "Failed to update pause status" });
    }

    if (changes === 0) {
      return res.status(404).json({
        error: "Monitor not found or you do not have access",
      });
    }

    res.json({
      paused,
      message: paused ? "Monitoring paused" : "Monitoring resumed",
    });
  });
});

app.get("/api/monitors/:id/history", authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  getMonitorHistory(id, userId, (err, data) => {
    if (err) {
      console.error("Error fetching monitor history:", err.message);
      return res.status(500).json({ error: "Failed to fetch history" });
    }
    res.json(data || []);
  });
});

app.get("/api/monitors/:id/chart/uptime", authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  getMonitorUptimeChartData(id, userId, (err, data) => {
    if (err) {
      console.error("Error fetching monitor uptime chart data:", err.message);
      return res.status(500).json({ error: "Failed to fetch uptime data" });
    }
    res.json(data || []);
  });
});

app.get(
  "/api/monitors/:id/chart/response-time",
  authenticateToken,
  (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    getMonitorResponseTimeChartData(id, userId, (err, data) => {
      if (err) {
        console.error(
          "Error fetching monitor response time data:",
          err.message
        );
        return res
          .status(500)
          .json({ error: "Failed to fetch response time data" });
      }
      res.json(data || []);
    });
  }
);

// Check DNS resolution
async function checkDns(monitor) {
  const start = Date.now();
  try {
    // Extract hostname from URL
    let hostname = monitor.url;
    if (hostname.startsWith("http://") || hostname.startsWith("https://")) {
      hostname = new URL(monitor.url).hostname;
    }

    await dns.resolve4(hostname);
    const responseTime = Date.now() - start;

    let status = "down";
    if (responseTime < 1000) {
      status = "up";
    } else if (responseTime < 5000) {
      status = "slow";
    } else {
      status = "down";
    }

    updateMonitorStatus(monitor.id, status, responseTime, null, (err) => {
      if (err) {
        console.error(`Error updating DNS monitor ${monitor.id}:`, err.message);
      }
    });
  } catch (error) {
    const responseTime = Date.now() - start;
    const errorMessage = error.message || "DNS resolution failed";
    updateMonitorStatus(
      monitor.id,
      "down",
      responseTime,
      errorMessage,
      (err) => {
        if (err) {
          console.error(
            `Error updating DNS monitor ${monitor.id}:`,
            err.message
          );
        }
      }
    );
  }
}

// Check ICMP ping
async function checkPing(monitor) {
  const start = Date.now();
  try {
    let hostname = monitor.url;
    if (hostname.startsWith("http://") || hostname.startsWith("https://")) {
      hostname = new URL(monitor.url).hostname;
    }

    const result = await ping.promise.probe(hostname, {
      timeout: 2,
    });

    const responseTime = Date.now() - start;

    let status = "down";
    if (result.alive) {
      const pingTime =
        typeof result.time === "number" ? result.time : responseTime;
      if (pingTime < 1000) {
        status = "up";
      } else if (pingTime < 5000) {
        status = "slow";
      } else {
        status = "down";
      }
    }

    updateMonitorStatus(monitor.id, status, responseTime, null, (err) => {
      if (err) {
        console.error(
          `Error updating PING monitor ${monitor.id}:`,
          err.message
        );
      }
    });
  } catch (error) {
    const responseTime = Date.now() - start;
    const errorMessage = error.message || "Ping failed";
    updateMonitorStatus(
      monitor.id,
      "down",
      responseTime,
      errorMessage,
      (err) => {
        if (err) {
          console.error(
            `Error updating PING monitor ${monitor.id}:`,
            err.message
          );
        }
      }
    );
  }
}

// Check monitor status
async function checkUptime(monitor) {
  const start = Date.now();
  try {
    const response = await axios.get(monitor.url, { timeout: 10000 });
    const responseTime = Date.now() - start;

    let status = "down";
    if (response.status === 200) {
      if (responseTime < 1000) {
        status = "up";
      } else if (responseTime < 5000) {
        status = "slow";
      } else {
        status = "down";
      }
    }

    updateMonitorStatus(monitor.id, status, responseTime, null, (err) => {
      if (err) {
        console.error(`Error updating monitor ${monitor.id}:`, err.message);
      }
    });
  } catch (error) {
    const responseTime = Date.now() - start;
    const errorMessage =
      error.response?.statusText || error.message || "Unknown error";
    updateMonitorStatus(
      monitor.id,
      "down",
      responseTime,
      errorMessage,
      (err) => {
        if (err) {
          console.error(`Error updating monitor ${monitor.id}:`, err.message);
        }
      }
    );
  }
}

// Run checks every minute
cron.schedule("* * * * *", () => {
  console.log("Running uptime checks...");
  getAllMonitorsForAdmin((err, monitors) => {
    if (err) {
      console.error("Error fetching monitors for check:", err.message);
      return;
    }
    monitors.forEach((monitor) => {
      if (!monitor.paused) {
        if (monitor.type === "dns") {
          checkDns(monitor);
        } else if (monitor.type === "icmp") {
          checkPing(monitor);
        } else {
          checkUptime(monitor);
        }
      }
    });
  });
});

app.get("/api/monitors/:id/downtime", authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  getMonitorHistory(id, userId, (err, history) => {
    if (err) {
      console.error("Error fetching monitor history:", err.message);
      return res.status(500).json({ error: "Failed to fetch history" });
    }

    if (!history || history.length === 0) {
      return res.json({ downtimes: [], message: "No history available" });
    }

    const sortedHistory = [...history].reverse();
    const downtimes = [];
    let currentDownStart = null;

    for (let i = 0; i < sortedHistory.length; i++) {
      const entry = sortedHistory[i];
      if (entry.status === "down") {
        if (!currentDownStart) {
          currentDownStart = entry.checked_at;
        }
      } else if (
        (entry.status === "up" || entry.status === "slow") &&
        currentDownStart
      ) {
        const downEnd = entry.checked_at;
        const duration = new Date(downEnd) - new Date(currentDownStart);
        downtimes.push({
          start: currentDownStart,
          end: downEnd,
          duration: Math.floor(duration / 1000),
        });
        currentDownStart = null;
      }
    }

    const recentDowntimes = downtimes.reverse().slice(0, 30);
    res.json({
      downtimes: recentDowntimes,
      total: downtimes.length,
    });
  });
});

app.get("/api/admin/monitors", authenticateToken, (req, res) => {
  // Check if user is admin
  if (req.user.role !== "admin") {
    return res.status(403).json({
      status: false,
      message: "Access denied. Admin privileges required.",
    });
  }

  getAllMonitorsForAdmin((err, rows) => {
    if (err) {
      console.error("Error fetching all monitors:", err.message);
      return res.status(500).json({
        status: false,
        error: "Failed to fetch monitors",
      });
    }
    res.json(rows);
  });
});

app.get("/api/users/profile/:id", authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    const currentUser = req.user;

    if (currentUser.role !== "admin" && currentUser.id !== userId) {
      return res.status(403).json({
        status: false,
        message: "You can only view your own profile",
      });
    }

    getUserProfileById(userId, (err, user) => {
      if (err) {
        console.error("Error fetching user profile:", err.message);
        return res.status(500).json({
          status: false,
          message: "Failed to fetch user profile",
        });
      }

      if (!user) {
        return res.status(404).json({
          status: false,
          message: "User not found",
        });
      }

      res.json({
        status: true,
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          is_active: user.is_active === 1,
          created_at: user.created_at,
        },
      });
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
});

app.patch("/api/user/:id/update-profile", authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    const currentUser = req.user;
    const { username, email } = req.body;

    if (currentUser.role !== "admin" && currentUser.id !== userId) {
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: false,
        message: "Invalid email format",
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

        console.error("Error updating user profile:", err.message);
        return res.status(500).json({
          status: false,
          message: "Failed to update user profile",
        });
      }

      if (!updatedUser) {
        return res.status(404).json({
          status: false,
          message: "User not found",
        });
      }

      res.json({
        status: true,
        data: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role,
          is_active: updatedUser.is_active === 1,
        },
        message: "Profile updated successfully",
      });
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
});

app.patch("/api/user/:id/change-password", authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    const currentUser = req.user;
    const { current_password, new_password, new_password_confirmation } =
      req.body;

    if (currentUser.role !== "admin" && currentUser.id !== userId) {
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
        message: "New password confirmation does not match",
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        status: false,
        message: "New password must be at least 6 characters",
      });
    }

    if (current_password === new_password) {
      return res.status(400).json({
        status: false,
        message: "New password must be different from current password",
      });
    }

    getUserById(userId, async (err, user) => {
      if (err) {
        console.error("Error fetching user:", err.message);
        return res.status(500).json({
          status: false,
          message: "Server error",
        });
      }

      if (!user) {
        return res.status(404).json({
          status: false,
          message: "User not found",
        });
      }

      let skipCurrentPasswordCheck = false;
      if (currentUser.role === "admin" && currentUser.id !== userId) {
        skipCurrentPasswordCheck = true;
      }

      if (!skipCurrentPasswordCheck) {
        getUserByEmail(user.email, async (err, fullUser) => {
          if (err || !fullUser) {
            return res.status(500).json({
              status: false,
              message: "Failed to verify current password",
            });
          }

          const validPassword = await bcrypt.compare(
            current_password,
            fullUser.password_hash
          );
          if (!validPassword) {
            return res.status(401).json({
              status: false,
              message: "Current password is incorrect",
            });
          }

          const salt = await bcrypt.genSalt(10);
          const newPasswordHash = await bcrypt.hash(new_password, salt);

          updateUserPassword(userId, newPasswordHash, (updateErr, changes) => {
            if (updateErr) {
              console.error("Error updating password:", updateErr.message);
              return res.status(500).json({
                status: false,
                message: "Failed to update password",
              });
            }

            res.json({
              status: true,
              message: "Password changed successfully",
            });
          });
        });
      } else {
        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(new_password, salt);

        updateUserPassword(userId, newPasswordHash, (updateErr, changes) => {
          if (updateErr) {
            console.error("Error updating password:", updateErr.message);
            return res.status(500).json({
              status: false,
              message: "Failed to update password",
            });
          }

          res.json({
            status: true,
            message: "Password changed successfully by admin",
          });
        });
      }
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
});

app.get("/api/admin/users", authenticateToken, requireAdmin, (req, res) => {
  try {
    getAllUsers((err, users) => {
      if (err) {
        console.error("Error fetching users:", err.message);
        return res.status(500).json({
          status: false,
          message: "Failed to fetch users",
        });
      }

      const formattedUsers = users.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        is_active: user.is_active === 1,
        created_at: user.created_at,
      }));

      res.json({
        status: true,
        data: formattedUsers,
      });
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
});

app.get("/api/admin/users/:id", authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return res.status(400).json({
        status: false,
        message: "Invalid user ID",
      });
    }

    getUserById(userId, (err, user) => {
      if (err) {
        console.error("Error fetching user:", err.message);
        return res.status(500).json({
          status: false,
          message: "Failed to fetch user",
        });
      }

      if (!user) {
        return res.status(404).json({
          status: false,
          message: "User not found",
        });
      }

      res.json({
        status: true,
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          is_active: user.is_active === 1,
          created_at: user.created_at,
        },
      });
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
});

app.post(
  "/api/admin/users",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        username,
        email,
        password,
        password_confirmation,
        role = "user",
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

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          status: false,
          message: "Invalid email format",
        });
      }

      const allowedRoles = ["user", "admin"];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          status: false,
          message: "Invalid role. Allowed roles: user, admin",
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

        const isActiveInt = is_active ? 1 : 0;

        createUser(
          username,
          email,
          passwordHash,
          role,
          isActiveInt,
          (err, userId) => {
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
                  role: user.role,
                  is_active: user.is_active === 1,
                  created_at: user.created_at,
                },
                message: "User created successfully",
              });
            });
          }
        );
      });
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({
        status: false,
        message: "Internal server error",
      });
    }
  }
);

app.put("/api/admin/users/:id", authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    const { username, email, role, is_active } = req.body;

    if (isNaN(userId)) {
      return res.status(400).json({
        status: false,
        message: "Invalid user ID",
      });
    }

    if (!username || !email || !role) {
      return res.status(400).json({
        status: false,
        message: "Username, email, and role are required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: false,
        message: "Invalid email format",
      });
    }

    const allowedRoles = ["user", "admin"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        status: false,
        message: "Invalid role. Allowed roles: user, admin",
      });
    }

    const isActiveInt = is_active ? 1 : 0;

    if (req.user.id === userId && role !== "admin") {
      return res.status(400).json({
        status: false,
        message: "You cannot change your own role from admin",
      });
    }

    updateUser(userId, username, email, role, isActiveInt, (err, changes) => {
      if (err) {
        if (err.code === "EMAIL_EXISTS") {
          return res.status(400).json({
            status: false,
            message: "Email already exists",
          });
        }

        console.error("Error updating user:", err.message);
        return res.status(500).json({
          status: false,
          message: "Failed to update user",
        });
      }

      if (changes === 0) {
        return res.status(404).json({
          status: false,
          message: "User not found",
        });
      }

      getUserById(userId, (err, user) => {
        if (err) {
          console.error("Error fetching updated user:", err.message);
          return res.status(500).json({
            status: false,
            message: "User updated but failed to fetch data",
          });
        }

        res.json({
          status: true,
          data: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            is_active: user.is_active === 1,
            created_at: user.created_at,
          },
          message: "User updated successfully",
        });
      });
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
});

app.delete(
  "/api/admin/users/:id",
  authenticateToken,
  requireAdmin,
  (req, res) => {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      if (isNaN(userId)) {
        return res.status(400).json({
          status: false,
          message: "Invalid user ID",
        });
      }

      if (req.user.id === userId) {
        return res.status(400).json({
          status: false,
          message: "You cannot delete your own account",
        });
      }

      deleteUser(userId, (err, changes) => {
        if (err) {
          console.error("Error deleting user:", err.message);
          return res.status(500).json({
            status: false,
            message: "Failed to delete user",
          });
        }

        if (changes === 0) {
          return res.status(404).json({
            status: false,
            message: "User not found",
          });
        }

        res.json({
          status: true,
          message: "User deleted successfully",
        });
      });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({
        status: false,
        message: "Internal server error",
      });
    }
  }
);

app.get(
  "/api/monitors/:id/notification-settings",
  authenticateToken,
  (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    // Validasi ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        status: false,
        error: "Invalid monitor ID",
      });
    }

    checkMonitorOwnership(id, userId, (err, isOwner) => {
      if (err) {
        console.error("Error checking monitor ownership:", err.message);
        return res.status(500).json({
          status: false,
          error: "Failed to fetch notification settings",
        });
      }

      if (!isOwner) {
        return res.status(404).json({
          status: false,
          error:
            "Monitor not found or you don't have permission to view notification settings",
        });
      }

      getMonitorNotificationSettings(id, userId, (settingsErr, settings) => {
        if (settingsErr) {
          console.error(
            "Error fetching notification settings:",
            settingsErr.message
          );
          return res.status(500).json({
            status: false,
            error: "Failed to fetch notification settings",
          });
        }

        res.json({
          status: true,
          data: settings || [],
        });
      });
    });
  }
);

app.post(
  "/api/monitors/:id/notification-settings",
  authenticateToken,
  (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const {
      channel,
      notify_on_down = 1,
      notify_on_up = 1,
      is_active = 1,
    } = req.body;

    // Validasi input
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        status: false,
        error: "Invalid monitor ID",
      });
    }

    if (!channel || typeof channel !== "string" || channel.trim() === "") {
      return res.status(400).json({
        status: false,
        error: "Channel is required and must be a non-empty string",
      });
    }

    const notifyDown = notify_on_down ? 1 : 0;
    const notifyUp = notify_on_up ? 1 : 0;
    const isActive = is_active ? 1 : 0;

    checkMonitorOwnership(id, userId, (err, isOwner) => {
      if (err) {
        console.error("Error checking monitor ownership:", err.message);
        return res.status(500).json({
          status: false,
          error: "Failed to create notification setting",
        });
      }

      if (!isOwner) {
        return res.status(404).json({
          status: false,
          error:
            "Monitor not found or you don't have permission to add notification settings",
        });
      }

      createNotificationSetting(
        id,
        userId,
        channel,
        notifyDown,
        notifyUp,
        isActive,
        (createErr, settingId) => {
          if (createErr) {
            console.error(
              "Error creating notification setting:",
              createErr.message
            );

            if (
              createErr.code === "SQLITE_CONSTRAINT" &&
              createErr.message.includes("UNIQUE constraint failed")
            ) {
              return res.status(400).json({
                status: false,
                error: `Notification setting for channel '${channel}' already exists for this monitor`,
              });
            }

            return res.status(500).json({
              status: false,
              error: "Failed to create notification setting",
            });
          }

          getNotificationSetting(settingId, id, userId, (getErr, setting) => {
            if (getErr || !setting) {
              console.error(
                "Error fetching created notification setting:",
                getErr?.message
              );
              return res.status(201).json({
                status: true,
                data: {
                  id: settingId,
                  monitor_id: parseInt(id),
                  user_id: userId,
                  channel,
                  notify_on_down: notifyDown,
                  notify_on_up: notifyUp,
                  is_active: isActive,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              });
            }

            res.status(201).json({
              status: true,
              data: setting,
            });
          });
        }
      );
    });
  }
);

app.put(
  "/api/monitors/:id/notification-settings/:settingId",
  authenticateToken,
  (req, res) => {
    const { id, settingId } = req.params;
    const userId = req.user.id;
    const { notify_on_down, notify_on_up, is_active } = req.body;

    // Validasi IDs
    if (
      !id ||
      isNaN(parseInt(id)) ||
      !settingId ||
      isNaN(parseInt(settingId))
    ) {
      return res.status(400).json({
        status: false,
        error: "Invalid monitor ID or setting ID",
      });
    }

    checkNotificationSettingOwnership(
      settingId,
      id,
      userId,
      (checkErr, isOwner) => {
        if (checkErr) {
          console.error(
            "Error checking notification setting ownership:",
            checkErr.message
          );
          return res.status(500).json({
            status: false,
            error: "Failed to update notification setting",
          });
        }

        if (!isOwner) {
          return res.status(404).json({
            status: false,
            error:
              "Notification setting not found or you don't have permission to update it",
          });
        }

        getNotificationSetting(
          settingId,
          id,
          userId,
          (getErr, currentSetting) => {
            if (getErr) {
              console.error(
                "Error fetching current notification setting:",
                getErr.message
              );
              return res.status(500).json({
                status: false,
                error: "Failed to update notification setting",
              });
            }

            if (!currentSetting) {
              return res.status(404).json({
                status: false,
                error: "Notification setting not found",
              });
            }

            const notifyDown =
              notify_on_down !== undefined
                ? notify_on_down
                  ? 1
                  : 0
                : currentSetting.notify_on_down;
            const notifyUp =
              notify_on_up !== undefined
                ? notify_on_up
                  ? 1
                  : 0
                : currentSetting.notify_on_up;
            const isActive =
              is_active !== undefined
                ? is_active
                  ? 1
                  : 0
                : currentSetting.is_active;

            updateNotificationSetting(
              settingId,
              id,
              userId,
              notifyDown,
              notifyUp,
              isActive,
              (updateErr, changes) => {
                if (updateErr) {
                  console.error(
                    "Error updating notification setting:",
                    updateErr.message
                  );
                  return res.status(500).json({
                    status: false,
                    error: "Failed to update notification setting",
                  });
                }

                if (changes === 0) {
                  return res.status(404).json({
                    status: false,
                    error: "Notification setting not found or no changes made",
                  });
                }

                getNotificationSetting(
                  settingId,
                  id,
                  userId,
                  (getUpdatedErr, updatedSetting) => {
                    if (getUpdatedErr || !updatedSetting) {
                      console.error(
                        "Error fetching updated notification setting:",
                        getUpdatedErr?.message
                      );
                      return res.json({
                        status: true,
                        data: {
                          id: parseInt(settingId),
                          monitor_id: parseInt(id),
                          channel: currentSetting.channel,
                          notify_on_down: notifyDown,
                          notify_on_up: notifyUp,
                          is_active: isActive,
                          updated_at: new Date().toISOString(),
                        },
                      });
                    }

                    res.json({
                      status: true,
                      data: updatedSetting,
                    });
                  }
                );
              }
            );
          }
        );
      }
    );
  }
);

app.delete(
  "/api/monitors/:id/notification-settings/:settingId",
  authenticateToken,
  (req, res) => {
    const { id, settingId } = req.params;
    const userId = req.user.id;

    // Validasi IDs
    if (
      !id ||
      isNaN(parseInt(id)) ||
      !settingId ||
      isNaN(parseInt(settingId))
    ) {
      return res.status(400).json({
        status: false,
        error: "Invalid monitor ID or setting ID",
      });
    }

    checkNotificationSettingOwnership(
      settingId,
      id,
      userId,
      (checkErr, isOwner) => {
        if (checkErr) {
          console.error(
            "Error checking notification setting ownership:",
            checkErr.message
          );
          return res.status(500).json({
            status: false,
            error: "Failed to delete notification setting",
          });
        }

        if (!isOwner) {
          return res.status(404).json({
            status: false,
            error:
              "Notification setting not found or you don't have permission to delete it",
          });
        }

        deleteNotificationSetting(
          settingId,
          id,
          userId,
          (deleteErr, changes) => {
            if (deleteErr) {
              console.error(
                "Error deleting notification setting:",
                deleteErr.message
              );
              return res.status(500).json({
                status: false,
                error: "Failed to delete notification setting",
              });
            }

            if (changes === 0) {
              return res.status(404).json({
                status: false,
                error: "Notification setting not found or already deleted",
              });
            }

            res.json({
              status: true,
              message: "Notification setting deleted successfully",
              data: {
                id: parseInt(settingId),
                monitor_id: parseInt(id),
              },
            });
          }
        );
      }
    );
  }
);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`UptimeKit backend server running on port ${PORT}`);
});
