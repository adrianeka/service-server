const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173", // vite preview default port
  "https://uptime-kit.vercel.app",
  "https://uptime-kit.jiwamu.de",
  ...(process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
        .map((o) => o.trim())
        .filter(Boolean)
    : []),
];

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
app.use(
  "/uploads",
  cors({
    origin: "*", // image boleh diakses dari mana saja
  }),
  express.static("uploads")
);
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("UptimeKit backend is running 🚀");
});

const authRoutes = require("./routes/auth.routes");
app.use("/api/auth", authRoutes);

const userRoutes = require("./routes/user.routes");
app.use("/api/user", userRoutes);

const monitorRoutes = require("./routes/monitor.routes");
app.use("/api/monitors", monitorRoutes);

const chartRoutes = require("./routes/chart.routes");
app.use("/api/charts", chartRoutes);

require("./cron/uptime.cron")();

const notificationSettingRoutes = require("./routes/notificationSetting.routes");
app.use("/api/notification/settings", notificationSettingRoutes);

const notificationLogRoutes = require("./routes/notification-log.routes");
app.use("/api/notification/log", notificationLogRoutes);

const visitorRoutes = require("./routes/visitor.routes");
app.use("/api/visitor", visitorRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`UptimeKit backend server running on port ${PORT}`);
});
