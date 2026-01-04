const sqlite3 = require("sqlite3").verbose();
const dbPath = "testdb2.db";
const { sendEmail } = require("../services/email.service");
const { humanizeError } = require("../utils/monitorError");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
    console.error("Current working directory:", process.cwd());
  } else {
    console.log("Connected to the SQLite database.");
  }
});

db.run("PRAGMA foreign_keys = ON");

// Initialize database tables
db.serialize(() => {
  db.run(
    `
    CREATE TABLE IF NOT EXISTS monitors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      notification_setting_id INTEGER,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      type TEXT DEFAULT 'http',
      status TEXT DEFAULT 'unknown',
      response_time INTEGER DEFAULT 0,
      last_checked DATETIME DEFAULT (datetime('now')),
      paused INTEGER DEFAULT 0,
      UNIQUE(url, type, user_id),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `,
    (err) => {
      if (err) {
        console.error("Error creating table:", err.message);
      } else {
        console.log("Monitors table ready.");
      }
    }
  );

  db.run(
    `
    ALTER TABLE monitors ADD COLUMN paused INTEGER DEFAULT 0
  `,
    (err) => {
      if (err && err.code !== "SQLITE_ERROR") {
        console.error("Error adding paused column:", err.message);
      }
    }
  );

  db.run(
    `
    ALTER TABLE monitors ADD COLUMN type TEXT DEFAULT 'http'
  `,
    (err) => {
      if (err && err.code !== "SQLITE_ERROR") {
        console.error("Error adding type column:", err.message);
      }
    }
  );

  db.run(
    `
    ALTER TABLE monitors ADD COLUMN favicon TEXT
  `,
    (err) => {
      if (err && err.code !== "SQLITE_ERROR") {
        console.error("Error adding favicon column:", err.message);
      }
    }
  );

  db.run(
    `
    UPDATE monitors SET type = 'http' WHERE type IS NULL
  `,
    (err) => {
      if (err) {
        console.error("Error updating monitor types:", err.message);
      } else {
        console.log("Monitor types updated.");
      }
    }
  );

  db.run(
    `
  ALTER TABLE monitors ADD COLUMN user_id INTEGER DEFAULT 1
`,
    (err) => {
      if (err && err.code !== "SQLITE_ERROR") {
        console.error("Error adding user_id column:", err.message);
      } else {
        console.log("Added user_id column or already exists.");
      }
    }
  );

  db.run(
    `
  ALTER TABLE monitors ADD COLUMN heartbeat_sec INTEGER DEFAULT 60
  `,
    (err) => {
      if (err && err.code !== "SQLITE_ERROR") {
        console.error("Error adding heartbeat_sec column:", err.message);
      } else {
        console.log("heartbeat_sec column ready.");
      }
    }
  );

  db.run(
    `
  CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_monitor_per_user
  ON monitors (user_id, url, type)
`,
    (err) => {
      if (err) {
        console.error("Error creating unique index:", err.message);
      } else {
        console.log("Unique index (user_id, url, type) ready.");
      }
    }
  );

  db.run(
    `
  ALTER TABLE monitors ADD COLUMN notification_setting_id INTEGER
`,
    (err) => {
      if (err && err.code !== "SQLITE_ERROR") {
        console.error(
          "Error adding notification_setting_id column:",
          err.message
        );
      } else {
        console.log("Added notification_setting_id column or already exists.");
      }
    }
  );

  db.run(
    `
    CREATE TABLE IF NOT EXISTS monitor_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      monitor_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      response_time INTEGER DEFAULT 0,
      error_message TEXT,
      checked_at DATETIME DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY(monitor_id) REFERENCES monitors(id) ON DELETE CASCADE
    )
  `,
    (err) => {
      if (err) {
        console.error("Error creating history table:", err.message);
      } else {
        console.log("Monitor history table created or already exists.");
      }
    }
  );

  db.run(
    `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT (datetime('now'))
  )
`,
    (err) => {
      if (err) {
        console.error("Error creating users table:", err.message);
      } else {
        console.log("Users table ready.");
      }
    }
  );

  db.run(
    `
  CREATE TABLE IF NOT EXISTS notification_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    monitor_id INTEGER NOT NULL,
    event TEXT NOT NULL,
    message TEXT,
    is_sent INTEGER DEFAULT 0,
    sent_at DATETIME,
    created_at DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(monitor_id) REFERENCES monitors(id) ON DELETE CASCADE
  )
`,
    (err) => {
      if (err) {
        console.error("Error creating notifications_logs table:", err.message);
      } else {
        console.log("Notifications logs table ready.");
      }
    }
  );

  db.run(
    `
  CREATE TABLE IF NOT EXISTS notification_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    host TEXT NOT NULL,
    port INTEGER NOT NULL,
    security TEXT NOT NULL,
    from_email TEXT NOT NULL,
    to_email TEXT NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`,
    (err) => {
      if (err) {
        console.error(
          "Failed to create notification_settings table:",
          err.message
        );
      } else {
        console.log("notification_settings table ready");
      }
    }
  );

  db.run(
    `
  CREATE TABLE IF NOT EXISTS interact_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT UNIQUE,
  visited_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`,
    (err) => {
      if (err) {
        console.error("Failed to create interact_logs table:", err.message);
      } else {
        console.log("interact_logs table ready");
      }
    }
  );

  db.run(
    `
  ALTER TABLE users ADD COLUMN profile_picture TEXT
`,
    (err) => {
      if (err && err.code !== "SQLITE_ERROR") {
        console.error("Error adding profile_picture column:", err.message);
      } else {
        console.log("Added profile_picture column or already exists.");
      }
    }
  );
});

function getAllMonitorsCron(callback) {
  db.all("SELECT * FROM monitors ORDER BY id", callback);
}

// Get all monitors
function getAllMonitors(userId, callback) {
  db.all(
    "SELECT * FROM monitors WHERE user_id = ? ORDER BY id",
    [userId],
    callback
  );
}

// Add a new monitor
function addMonitor(
  name,
  url,
  type = "http",
  heartbeatSec = 60,
  userId,
  notificationSettingId = null,
  callback
) {
  const stmt = db.prepare(
    `
    INSERT INTO monitors 
    (name, url, type, favicon, user_id, notification_setting_id, heartbeat_sec)
    VALUES (?, ?, ?, NULL, ?, ?, ?)
    `
  );

  stmt.run(
    [name, url, type, userId, notificationSettingId, heartbeatSec],
    function (err) {
      callback(err, this.lastID);
    }
  );

  stmt.finalize();
}

// Delete a monitor
function deleteMonitor(id, userId, callback) {
  const stmt = db.prepare("DELETE FROM monitors WHERE id = ? AND user_id = ?");
  stmt.run([id, userId], function (err) {
    callback(err, this.changes);
  });
  stmt.finalize();
}

// Update monitor status and response time
function updateMonitorStatus(
  id,
  status,
  responseTime,
  errorMessage = null,
  callback
) {
  db.get(
    "SELECT status, user_id FROM monitors WHERE id = ?",
    [id],
    (err, old) => {
      if (err || !old) return callback(err || new Error("Monitor not found"));

      const previousStatus = old.status;
      const readableError = humanizeError(errorMessage);

      const stmt = db.prepare(
        `UPDATE monitors
         SET status = ?, response_time = ?, last_checked = datetime('now')
         WHERE id = ?`
      );

      stmt.run([status, responseTime, id], async (err) => {
        if (err) return callback(err);

        // save history (SIMPAN ERROR ASLI)
        db.run(
          `
          INSERT INTO monitor_history
          (monitor_id, status, response_time, error_message)
          VALUES (?, ?, ?, ?)
          `,
          [id, status, responseTime, errorMessage]
        );

        // 🔥 STATUS CHANGE: UP -> DOWN
        if (previousStatus !== "down" && status === "down") {
          getMonitorWithNotification(id, async (err, monitor) => {
            if (err || !monitor || !monitor.notification_setting_id) return;

            try {
              await sendEmail(
                monitor,
                `🚨 [DOWN] ${monitor.name}`,
                `
                <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333">
                  <h2 style="color:#d32f2f;">🚨 Monitor Status: DOWN</h2>

                  <table cellpadding="6" cellspacing="0" style="border-collapse: collapse;">
                    <tr>
                      <td><b>Monitor</b></td>
                      <td>: ${monitor.name}</td>
                    </tr>
                    <tr>
                      <td><b>Type</b></td>
                      <td>: ${monitor.type.toUpperCase()}</td>
                    </tr>
                    <tr>
                      <td><b>Target</b></td>
                      <td>: ${monitor.url}</td>
                    </tr>
                    <tr>
                      <td><b>Status</b></td>
                      <td style="color:#d32f2f;">: <b>DOWN</b></td>
                    </tr>
                    <tr>
                      <td><b>Reason</b></td>
                      <td style="color:#b71c1c;">: 
                        ${readableError}
                      </td>
                    </tr>
                    <tr>
                      <td><b>Checked At</b></td>
                      <td>: ${new Date().toLocaleString("id-ID")}</td>
                    </tr>
                  </table>

                  <details style="margin-top:12px;font-size:12px;color:#777">
                    <summary>Technical detail</summary>
                    <pre>${errorMessage || "-"}</pre>
                  </details>

                  <hr style="margin:16px 0;" />

                  <p style="font-size:12px;color:#777">
                    This alert was generated automatically by Uptime Monitor.
                  </p>
                </div>
                `
              );

              createNotificationLog(
                monitor.user_id,
                id,
                "DOWN",
                errorMessage,
                true,
                () => {}
              );
            } catch (e) {
              createNotificationLog(
                monitor.user_id,
                id,
                "DOWN",
                e.message,
                false,
                () => {}
              );
            }
          });
        }

        callback(null);
      });

      stmt.finalize();
    }
  );
}

// Get uptime percentage for a monitor (last 24 hours)
function getUptimePercentage(id, userId, callback) {
  const query = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN mh.status = 'up' THEN 1 ELSE 0 END) as up_count
    FROM monitor_history mh
    JOIN monitors m ON mh.monitor_id = m.id
    WHERE mh.monitor_id = ? 
    AND m.user_id = ?
    AND mh.checked_at > datetime('now', '-24 hours')
  `;
  db.get(query, [id, userId], (err, row) => {
    if (err) {
      callback(err, null);
      return;
    }
    if (!row || row.total === 0) {
      callback(null, 100);
      return;
    }
    const percentage = ((row.up_count / row.total) * 100).toFixed(1);
    callback(null, parseFloat(percentage));
  });
}

// Get uptime chart data for all monitors (last 24 hours)
function getUptimeChartData(userId, callback) {
  const query = `
    SELECT 
      strftime('%H:%M', mh.checked_at) as time,
      AVG(CASE WHEN mh.status = 'up' THEN 100 ELSE 0 END) as uptime
    FROM monitor_history mh
    JOIN monitors m ON mh.monitor_id = m.id
    WHERE m.user_id = ?
    AND mh.checked_at > datetime('now', '-24 hours')
    GROUP BY strftime('%H', mh.checked_at)
    ORDER BY mh.checked_at ASC
  `;
  db.all(query, [userId], callback);
}

// Get response time chart data for all monitors (last 24 hours)
function getResponseTimeChartData(userId, callback) {
  const query = `
    SELECT 
      strftime('%H:%M', mh.checked_at) as time,
      AVG(mh.response_time) as avgResponse
    FROM monitor_history mh
    JOIN monitors m ON mh.monitor_id = m.id
    WHERE m.user_id = ?
    AND mh.checked_at > datetime('now', '-24 hours')
    GROUP BY strftime('%H', mh.checked_at)
    ORDER BY mh.checked_at ASC
  `;
  db.all(query, [userId], callback);
}

// Get monitor history (last 30 checks)
function getMonitorHistory(id, userId, callback) {
  const query = `
    SELECT mh.id, mh.status, mh.response_time, mh.checked_at, mh.error_message
    FROM monitor_history mh
    JOIN monitors m ON mh.monitor_id = m.id
    WHERE mh.monitor_id = ? 
    AND m.user_id = ?
    ORDER BY mh.checked_at DESC
    LIMIT 30
  `;
  db.all(query, [id, userId], callback);
}

// Get uptime chart data for a specific monitor (last 24 hours, 10-minute intervals)
function getMonitorUptimeChartData(id, userId, callback) {
  const query = `
    SELECT 
      mh.checked_at as time,
      AVG(CASE WHEN mh.status = 'up' THEN 100 ELSE 0 END) as uptime
    FROM monitor_history mh
    JOIN monitors m ON mh.monitor_id = m.id
    WHERE mh.monitor_id = ? 
    AND m.user_id = ?
    AND mh.checked_at > datetime('now', '-24 hours')
    GROUP BY datetime(mh.checked_at, '-10 minutes')
    ORDER BY mh.checked_at ASC
  `;
  db.all(query, [id, userId], callback);
}

// Get response time chart data for a specific monitor (last 24 hours, 10-minute intervals)
function getMonitorResponseTimeChartData(id, userId, callback) {
  const query = `
    SELECT 
      mh.checked_at as time,
      AVG(mh.response_time) as avgResponse
    FROM monitor_history mh
    JOIN monitors m ON mh.monitor_id = m.id
    WHERE mh.monitor_id = ? 
    AND m.user_id = ?
    AND mh.checked_at > datetime('now', '-24 hours')
    GROUP BY datetime(mh.checked_at, '-10 minutes')
    ORDER BY mh.checked_at ASC
  `;
  db.all(query, [id, userId], callback);
}

function updateMonitor(
  id,
  name,
  url,
  type,
  heartbeatSec,
  notificationSettingId,
  userId,
  callback
) {
  const stmt = db.prepare(
    `
    UPDATE monitors
    SET 
      name = ?, 
      url = ?, 
      type = ?, 
      heartbeat_sec = ?, 
      notification_setting_id = ?
    WHERE id = ? AND user_id = ?
    `
  );

  stmt.run(
    [name, url, type, heartbeatSec, notificationSettingId, id, userId],
    function (err) {
      if (err) return callback(err);

      if (this.changes === 0) {
        return callback(new Error("FORBIDDEN"));
      }

      callback(null);
    }
  );

  stmt.finalize();
}

function updateMonitorFavicon(id, favicon, userId, callback) {
  const stmt = db.prepare(
    "UPDATE monitors SET favicon = ? WHERE id = ? AND user_id = ?"
  );
  stmt.run([favicon, id, userId], callback);
  stmt.finalize();
}

function toggleMonitorPause(id, paused, userId, callback) {
  const stmt = db.prepare(
    "UPDATE monitors SET paused = ? WHERE id = ? AND user_id = ?"
  );

  stmt.run([paused ? 1 : 0, id, userId], function (err) {
    if (err) {
      callback(err);
    } else {
      callback(null, this.changes);
    }
  });

  stmt.finalize();
}

function getMonitorWithNotification(monitorId, callback) {
  const query = `
    SELECT 
      m.*,
      ns.host,
      ns.port,
      ns.security,
      ns.from_email,
      ns.to_email,
      ns.username,
      ns.password
    FROM monitors m
    LEFT JOIN notification_settings ns
      ON m.notification_setting_id = ns.id
    WHERE m.id = ?
  `;

  db.get(query, [monitorId], callback);
}

function getMonitorById(id, userId, callback) {
  db.get(
    `
    SELECT *
    FROM monitors
    WHERE id = ? AND user_id = ?
    LIMIT 1
    `,
    [id, userId],
    callback
  );
}

function addUser(username, email, passwordHash, callback) {
  const stmt = db.prepare(
    "INSERT INTO users (username, email, password_hash, is_active) VALUES (?, ?, ?, 1)"
  );
  stmt.run([username, email, passwordHash], function (err) {
    callback(err, this.lastID);
  });
  stmt.finalize();
}

// Get user by email
function getUserByEmail(email, callback) {
  db.get("SELECT * FROM users WHERE email = ?", [email], callback);
}

// Get user by id
function getUserById(id, callback) {
  db.get(
    "SELECT id, username, email, is_active, created_at FROM users WHERE id = ?",
    [id],
    callback
  );
}

function updateUserProfile(id, username, email, callback) {
  const stmt = db.prepare(
    "UPDATE users SET username = ?, email = ? WHERE id = ?"
  );
  stmt.run([username, email, id], function (err) {
    if (err) {
      // Check if it's a unique constraint error (duplicate email)
      if (
        err.code === "SQLITE_CONSTRAINT" &&
        err.message.includes("users.email")
      ) {
        const error = new Error("Email already exists");
        error.code = "EMAIL_EXISTS";
        callback(error);
      } else {
        callback(err);
      }
    } else {
      // Return the updated user data
      getUserById(id, callback);
    }
  });
  stmt.finalize();
}

function updateUserPassword(id, passwordHash, callback) {
  const stmt = db.prepare("UPDATE users SET password_hash = ? WHERE id = ?");
  stmt.run([passwordHash, id], function (err) {
    callback(err, this.changes);
  });
  stmt.finalize();
}

function getUserProfileById(id, callback) {
  db.get(
    "SELECT id, username, email, is_active, created_at FROM users WHERE id = ?",
    [id],
    callback
  );
}

function getAllNotificationSettings(userId, callback) {
  db.all(
    "SELECT id, name, description, host, port, security, from_email, to_email, username, created_at FROM notification_settings WHERE user_id = ? ORDER BY id DESC",
    [userId],
    callback
  );
}

/* Get single setting */
function getNotificationSettingById(id, userId, callback) {
  db.get(
    "SELECT * FROM notification_settings WHERE id = ? AND user_id = ?",
    [id, userId],
    callback
  );
}

/* Create */
function createNotificationSetting(data, userId, callback) {
  const stmt = db.prepare(`
    INSERT INTO notification_settings
    (user_id, name, description, host, port, security, from_email, to_email, username, password)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    [
      userId,
      data.name,
      data.description || null,
      data.host,
      data.port,
      data.security,
      data.from_email,
      data.to_email,
      data.username,
      data.password,
    ],
    function (err) {
      callback(err, this?.lastID);
    }
  );

  stmt.finalize();
}

/* Update */
function updateNotificationSetting(id, data, userId, callback) {
  const stmt = db.prepare(`
    UPDATE notification_settings SET
      name = ?,
      description = ?,
      host = ?,
      port = ?,
      security = ?,
      from_email = ?,
      to_email = ?,
      username = ?,
      password = ?,
      updated_at = datetime('now')
    WHERE id = ? AND user_id = ?
  `);

  stmt.run(
    [
      data.name,
      data.description || null,
      data.host,
      data.port,
      data.security,
      data.from_email,
      data.to_email,
      data.username,
      data.password,
      id,
      userId,
    ],
    function (err) {
      callback(err, this?.changes);
    }
  );

  stmt.finalize();
}

/* Delete */
function deleteNotificationSetting(id, userId, callback) {
  const stmt = db.prepare(
    "DELETE FROM notification_settings WHERE id = ? AND user_id = ?"
  );

  stmt.run([id, userId], function (err) {
    callback(err, this?.changes);
  });

  stmt.finalize();
}

function createNotificationLog(
  userId,
  monitorId,
  event,
  message,
  isSent,
  callback
) {
  const stmt = db.prepare(`
    INSERT INTO notification_logs
    (user_id, monitor_id, event, message, is_sent, sent_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `);

  stmt.run([userId, monitorId, event, message, isSent ? 1 : 0], callback);

  stmt.finalize();
}

function getNotificationLogs(userId, callback) {
  let query;
  let params;

  if (userId) {
    // User biasa: hanya dapatkan logs miliknya
    query = `
      SELECT nl.*, m.name as monitor_name, m.url as monitor_url, u.username as user_name
      FROM notification_logs nl
      LEFT JOIN monitors m ON nl.monitor_id = m.id
      LEFT JOIN users u ON nl.user_id = u.id
      WHERE nl.user_id = ?
      ORDER BY nl.created_at DESC
    `;
    params = [userId];
  } else {
    // Admin: dapatkan semua logs
    query = `
      SELECT nl.*, m.name as monitor_name, m.url as monitor_url, u.username as user_name
      FROM notification_logs nl
      LEFT JOIN monitors m ON nl.monitor_id = m.id
      LEFT JOIN users u ON nl.user_id = u.id
      ORDER BY nl.created_at DESC
    `;
    params = [];
  }

  db.all(query, params, callback);
}

function deleteNotificationLog(logId, userId, callback) {
  const stmt = db.prepare(`
    DELETE FROM notification_logs 
    WHERE id = ? AND user_id = ?
  `);
  stmt.run([logId, userId], function (err) {
    callback(err, this ? this.changes : 0);
  });
  stmt.finalize();
}

function getNotificationLogById(logId, userId, callback) {
  const query = `
    SELECT nl.*, m.name as monitor_name, m.url as monitor_url
    FROM notification_logs nl
    LEFT JOIN monitors m ON nl.monitor_id = m.id
    WHERE nl.id = ? AND nl.user_id = ?
  `;
  db.get(query, [logId, userId], callback);
}

function createVisitor(sessionId, callback) {
  const sql = `
    INSERT INTO interact_logs (session_id, visited_at)
    VALUES (?, datetime('now'))
  `;
  db.run(sql, [sessionId], function (err) {
    if (err) return callback(err);
    callback(null, this.lastID);
  });
}

function countVisitors(callback) {
  db.get("SELECT COUNT(*) AS total FROM interact_logs", [], (err, row) => {
    if (err) return callback(err);
    callback(null, row.total);
  });
}

function updateUserProfilePicture(id, profilePicture, callback) {
  const stmt = db.prepare("UPDATE users SET profile_picture = ? WHERE id = ?");
  stmt.run([profilePicture, id], function (err) {
    callback(err, this.changes);
  });
  stmt.finalize();
}

function getUserProfilePicture(id, callback) {
  db.get("SELECT profile_picture FROM users WHERE id = ?", [id], callback);
}

module.exports = {
  db,
  getAllMonitors,
  getAllMonitorsCron,
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
  getMonitorWithNotification,
  getMonitorById,
  addUser,
  getUserById,
  getUserByEmail,
  updateUserProfile,
  updateUserPassword,
  getUserProfileById,
  getAllNotificationSettings,
  getNotificationSettingById,
  createNotificationSetting,
  updateNotificationSetting,
  deleteNotificationSetting,
  getNotificationLogs,
  createNotificationLog,
  deleteNotificationLog,
  getNotificationLogById,
  createVisitor,
  countVisitors,
  updateUserProfilePicture,
  getUserProfilePicture,
};
