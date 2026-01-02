const {
  getUptimeChartData,
  getResponseTimeChartData,
} = require("../models/database");

exports.chartsUptime = (req, res) => {
  const userId = req.user.id;
  getUptimeChartData(userId, (err, data) => {
    if (err) {
      console.error("Error fetching uptime chart data:", err.message);
      return res.status(500).json({ error: "Failed to fetch uptime data" });
    }
    res.json(data || []);
  });
};

exports.chartsResponseTime = (req, res) => {
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
};
