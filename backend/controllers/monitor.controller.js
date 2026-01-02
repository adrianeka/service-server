const axios = require("axios");

const {
  getAllMonitors,
  addMonitor,
  deleteMonitor,
  getUptimePercentage,
  getMonitorHistory,
  updateMonitor,
  toggleMonitorPause,
  getMonitorUptimeChartData,
  getMonitorResponseTimeChartData,
  updateMonitorFavicon,
  getMonitorById,
} = require("../models/database");

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

exports.getMonitor = (req, res) => {
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
};

exports.create = async (req, res) => {
  const {
    name,
    url,
    type = "http",
    notification_setting_id,
    heartbeat_sec = 60,
  } = req.body;
  const userId = req.user.id;

  if (!name || !url) {
    return res.status(400).json({ error: "Name and URL are required" });
  }

  if (heartbeat_sec < 10 || heartbeat_sec > 3600 || isNaN(heartbeat_sec)) {
    return res.status(400).json({
      error: "heartbeat_sec must be between 10 and 3600 seconds",
    });
  }

  addMonitor(
    name,
    url,
    type,
    heartbeat_sec,
    userId,
    notification_setting_id,
    (err, id) => {
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
        heartbeat_sec,
        status: "unknown",
        response_time: 0,
        paused: 0,
        favicon: null,
        notification_setting_id,
        message: "Monitor added successfully",
      });
    }
  );
};

exports.update = (req, res) => {
  const { id } = req.params;
  const { name, url, type = "http", notification_setting_id } = req.body;
  const userId = req.user.id;

  if (!name || !url) {
    return res.status(400).json({ error: "Name and URL are required" });
  }

  updateMonitor(id, name, url, type, notification_setting_id, userId, (err) => {
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
};

exports.delete = (req, res) => {
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
};

exports.pause = (req, res) => {
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
};

exports.history = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  getMonitorHistory(id, userId, (err, data) => {
    if (err) {
      console.error("Error fetching monitor history:", err.message);
      return res.status(500).json({ error: "Failed to fetch history" });
    }
    res.json(data || []);
  });
};

exports.downtime = (req, res) => {
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
};

exports.uptime = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  getUptimePercentage(id, userId, (err, percentage) => {
    if (err) {
      console.error("Error fetching uptime:", err.message);
      return res.status(500).json({ error: "Failed to fetch uptime" });
    }
    res.json({ uptime: percentage });
  });
};

exports.monitorUptimeChart = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  getMonitorUptimeChartData(id, userId, (err, data) => {
    if (err) {
      console.error("Error fetching monitor uptime chart data:", err.message);
      return res.status(500).json({ error: "Failed to fetch uptime data" });
    }
    res.json(data || []);
  });
};

exports.monitorResponseTimeChart = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  getMonitorResponseTimeChartData(id, userId, (err, data) => {
    if (err) {
      console.error("Error fetching monitor response time data:", err.message);
      return res
        .status(500)
        .json({ error: "Failed to fetch response time data" });
    }
    res.json(data || []);
  });
};

exports.show = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  getMonitorById(id, userId, (err, monitor) => {
    if (err) {
      console.error("Error fetching monitor detail:", err.message);
      return res.status(500).json({ error: "Failed to fetch monitor detail" });
    }

    if (!monitor) {
      return res.status(404).json({ error: "Monitor not found" });
    }

    res.json({
      id: monitor.id,
      name: monitor.name,
      url: monitor.url,
      type: monitor.type,
      status: monitor.status,
      response_time: monitor.response_time,
      last_checked: monitor.last_checked,
      paused: !!monitor.paused,
      favicon: monitor.favicon || null,
      created_at: monitor.created_at,
    });
  });
};
