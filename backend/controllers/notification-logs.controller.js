const {
  createNotificationLog,
  getNotificationLogs,
  deleteNotificationLog,
  getNotificationLogById,
} = require("../models/database");

exports.getNotificationLogs = (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  // Jika admin, pass null untuk mendapatkan semua logs
  // Jika user biasa, pass userId untuk mendapatkan hanya logs miliknya
  const userIdForQuery = userRole === "admin" ? null : userId;

  getNotificationLogs(userIdForQuery, (err, logs) => {
    if (err) {
      console.error("Error fetching notification logs:", err.message);
      return res.status(500).json({
        status: false,
        error: "Failed to fetch notification logs",
      });
    }

    res.json({
      status: true,
      data: logs || [],
    });
  });
};

exports.create = (req, res) => {
  const { monitor_id, event, message } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  // Validasi input
  if (!monitor_id || isNaN(parseInt(monitor_id))) {
    return res.status(400).json({
      status: false,
      error: "Valid monitor_id is required",
    });
  }

  if (!event || typeof event !== "string") {
    return res.status(400).json({
      status: false,
      error: "Event is required and must be a string",
    });
  }

  // Validasi event hanya boleh 'down' atau 'up'
  const validEvents = ["down", "up", "slow", "recovery"];
  if (!validEvents.includes(event.toLowerCase())) {
    return res.status(400).json({
      status: false,
      error: `Event must be one of: ${validEvents.join(", ")}`,
    });
  }

  // Jika bukan admin, cek apakah monitor milik user
  if (userRole !== "admin") {
    checkMonitorOwnership(monitor_id, userId, (err, isOwner) => {
      if (err) {
        console.error("Error checking monitor ownership:", err.message);
        return res.status(500).json({
          status: false,
          error: "Failed to create notification log",
        });
      }

      if (!isOwner) {
        return res.status(403).json({
          status: false,
          error:
            "You don't have permission to create notification log for this monitor",
        });
      }

      createAndReturnLog();
    });
  } else {
    // Admin bisa membuat log untuk monitor apapun
    createAndReturnLog();
  }

  // Helper function untuk membuat log dan mengembalikan response
  function createAndReturnLog() {
    createNotificationLog(userId, monitor_id, event, message, (err, logId) => {
      if (err) {
        console.error("Error creating notification log:", err.message);
        return res.status(500).json({
          status: false,
          error: "Failed to create notification log",
        });
      }

      // Get the created log
      getNotificationLogById(logId, userId, (getErr, log) => {
        if (getErr || !log) {
          console.error(
            "Error fetching created notification log:",
            getErr?.message
          );
          // Return basic success response
          return res.status(201).json({
            status: true,
            data: {
              id: logId,
              user_id: userId,
              monitor_id: parseInt(monitor_id),
              event: event,
              message: message || "",
              is_sent: 0,
              sent_at: null,
              created_at: new Date().toISOString(),
            },
          });
        }

        res.status(201).json({
          status: true,
          data: log,
        });
      });
    });
  }
};

exports.delete = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  // Validasi ID
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({
      status: false,
      error: "Invalid notification log ID",
    });
  }

  // Jika bukan admin, cek apakah log milik user
  if (userRole !== "admin") {
    // Cek apakah log ada dan milik user
    getNotificationLogById(id, userId, (err, log) => {
      if (err) {
        console.error("Error fetching notification log:", err.message);
        return res.status(500).json({
          status: false,
          error: "Failed to delete notification log",
        });
      }

      if (!log) {
        return res.status(404).json({
          status: false,
          error:
            "Notification log not found or you don't have permission to delete it",
        });
      }

      deleteLog();
    });
  } else {
    // Admin bisa menghapus log apapun
    deleteLog();
  }

  // Helper function untuk menghapus log
  function deleteLog() {
    deleteNotificationLog(id, userId, (err, changes) => {
      if (err) {
        console.error("Error deleting notification log:", err.message);
        return res.status(500).json({
          status: false,
          error: "Failed to delete notification log",
        });
      }

      if (changes === 0) {
        return res.status(404).json({
          status: false,
          error: "Notification log not found or already deleted",
        });
      }

      res.json({
        status: true,
        message: "Notification log deleted successfully",
        data: {
          id: parseInt(id),
        },
      });
    });
  }
};
