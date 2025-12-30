const sqlite3 = require("sqlite3").verbose();
const dbPath = "testdb.db";

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
    role TEXT DEFAULT 'user',
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
  CREATE TABLE IF NOT EXISTS monitor_notification_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    monitor_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    channel TEXT NOT NULL,
    notify_on_down INTEGER DEFAULT 1,
    notify_on_up INTEGER DEFAULT 1,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT (datetime('now')),
    updated_at DATETIME DEFAULT (datetime('now')),
    UNIQUE(monitor_id, channel),
    FOREIGN KEY(monitor_id) REFERENCES monitors(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`,
    (err) => {
      if (err) {
        console.error(
          "Error creating monitor_notification_settings table:",
          err.message
        );
      } else {
        console.log("Monitor notification settings table ready.");
      }
    }
  );
});

// Get all monitors
function getAllMonitors(userId, callback) {
  db.all(
    "SELECT * FROM monitors WHERE user_id = ? ORDER BY id",
    [userId],
    callback
  );
}

// Add a new monitor
function addMonitor(name, url, type = "http", userId, callback) {
  const stmt = db.prepare(
    "INSERT INTO monitors (name, url, type, favicon, user_id) VALUES (?, ?, ?, NULL, ?)"
  );
  stmt.run([name, url, type, userId], function (err) {
    callback(err, this.lastID);
  });
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
  if (typeof errorMessage === "function") {
    callback = errorMessage;
    errorMessage = null;
  }

  const stmt = db.prepare(
    'UPDATE monitors SET status = ?, response_time = ?, last_checked = datetime("now") WHERE id = ?'
  );
  stmt.run([status, responseTime, id], (err) => {
    if (err) {
      callback(err);
      return;
    }
    const historyStmt = db.prepare(
      'INSERT INTO monitor_history (monitor_id, status, response_time, error_message, checked_at) VALUES (?, ?, ?, ?, datetime("now"))'
    );
    historyStmt.run([id, status, responseTime, errorMessage], callback);
    historyStmt.finalize();
  });
  stmt.finalize();
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

function updateMonitor(id, name, url, type, user, callback) {
  let query;
  let params;

  if (user.role === "admin") {
    query = "UPDATE monitors SET name = ?, url = ?, type = ? WHERE id = ?";
    params = [name, url, type, id];
  } else {
    query =
      "UPDATE monitors SET name = ?, url = ?, type = ? WHERE id = ? AND user_id = ?";
    params = [name, url, type, id, user.id];
  }

  const stmt = db.prepare(query);
  stmt.run(params, function (err) {
    if (!err && this.changes === 0) {
      return callback(new Error("FORBIDDEN"));
    }
    callback(err);
  });
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

// Get all monitors for admin (without user filter)
function getAllMonitorsForAdmin(callback) {
  db.all("SELECT * FROM monitors ORDER BY id", callback);
}

function addUser(username, email, passwordHash, role = "user", callback) {
  const stmt = db.prepare(
    "INSERT INTO users (username, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, 1)"
  );
  stmt.run([username, email, passwordHash, role], function (err) {
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
    "SELECT id, username, email, role, is_active, created_at FROM users WHERE id = ?",
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
    "SELECT id, username, email, role, is_active, created_at FROM users WHERE id = ?",
    [id],
    callback
  );
}

function getAllUsers(callback) {
  db.all(
    "SELECT id, username, email, role, is_active, created_at FROM users ORDER BY id DESC",
    callback
  );
}

function createUser(
  username,
  email,
  passwordHash,
  role = "user",
  isActive = 1,
  callback
) {
  const stmt = db.prepare(
    "INSERT INTO users (username, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?)"
  );
  stmt.run([username, email, passwordHash, role, isActive], function (err) {
    callback(err, this.lastID);
  });
  stmt.finalize();
}

// Update user by admin
function updateUser(id, username, email, role, isActive, callback) {
  const stmt = db.prepare(
    "UPDATE users SET username = ?, email = ?, role = ?, is_active = ? WHERE id = ?"
  );
  stmt.run([username, email, role, isActive, id], function (err) {
    if (err) {
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
      callback(null, this.changes);
    }
  });
  stmt.finalize();
}

function deleteUser(id, callback) {
  const stmt = db.prepare("DELETE FROM users WHERE id = ?");
  stmt.run([id], function (err) {
    callback(err, this.changes);
  });
  stmt.finalize();
}

function checkMonitorOwnership(monitorId, userId, callback) {
  db.get(
    "SELECT id FROM monitors WHERE id = ? AND user_id = ?",
    [monitorId, userId],
    (err, row) => {
      if (err) {
        callback(err, false);
      } else {
        callback(null, !!row);
      }
    }
  );
}

function getMonitorNotificationSettings(monitorId, userId, callback) {
  const query = `
    SELECT * FROM monitor_notification_settings 
    WHERE monitor_id = ? AND user_id = ?
    ORDER BY created_at DESC
  `;
  db.all(query, [monitorId, userId], callback);
}

// Get single notification setting
function getNotificationSetting(settingId, monitorId, userId, callback) {
  const query = `
    SELECT * FROM monitor_notification_settings 
    WHERE id = ? AND monitor_id = ? AND user_id = ?
  `;
  db.get(query, [settingId, monitorId, userId], callback);
}

function createNotificationSetting(
  monitorId,
  userId,
  channel,
  notifyOnDown = 1,
  notifyOnUp = 1,
  isActive = 1,
  callback
) {
  const stmt = db.prepare(`
    INSERT INTO monitor_notification_settings 
    (monitor_id, user_id, channel, notify_on_down, notify_on_up, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);
  stmt.run(
    [monitorId, userId, channel, notifyOnDown, notifyOnUp, isActive],
    function (err) {
      callback(err, this ? this.lastID : null);
    }
  );
  stmt.finalize();
}

function updateNotificationSetting(
  settingId,
  monitorId,
  userId,
  notifyOnDown,
  notifyOnUp,
  isActive,
  callback
) {
  const stmt = db.prepare(`
    UPDATE monitor_notification_settings 
    SET notify_on_down = ?, notify_on_up = ?, is_active = ?, updated_at = datetime('now')
    WHERE id = ? AND monitor_id = ? AND user_id = ?
  `);
  stmt.run(
    [notifyOnDown, notifyOnUp, isActive, settingId, monitorId, userId],
    function (err) {
      callback(err, this ? this.changes : 0);
    }
  );
  stmt.finalize();
}

function deleteNotificationSetting(settingId, monitorId, userId, callback) {
  const stmt = db.prepare(`
    DELETE FROM monitor_notification_settings 
    WHERE id = ? AND monitor_id = ? AND user_id = ?
  `);
  stmt.run([settingId, monitorId, userId], function (err) {
    callback(err, this ? this.changes : 0);
  });
  stmt.finalize();
}

function checkNotificationSettingOwnership(
  settingId,
  monitorId,
  userId,
  callback
) {
  db.get(
    "SELECT id FROM monitor_notification_settings WHERE id = ? AND monitor_id = ? AND user_id = ?",
    [settingId, monitorId, userId],
    (err, row) => {
      if (err) {
        callback(err, false);
      } else {
        callback(null, !!row);
      }
    }
  );
}

module.exports = {
  db,
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
  getUserById,
  getUserByEmail,
  updateUserProfile,
  updateUserPassword,
  getUserProfileById,
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
};
