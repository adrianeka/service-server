const cron = require("node-cron");
const axios = require("axios");
const dns = require("dns").promises;
const ping = require("ping");

const {
  updateMonitorStatus,
  getAllMonitorsCron,
} = require("../models/database");

let isRunning = false;

function normalizeHostname(url) {
  if (!url) throw new Error("Invalid URL");
  if (url.startsWith("http")) {
    return new URL(url).hostname;
  }
  return url;
}

function shouldCheck(monitor) {
  const heartbeat = (monitor.heartbeat_sec || 60) * 1000;

  if (!monitor.last_checked) return true;

  const lastChecked = new Date(monitor.last_checked).getTime();
  const now = Date.now();

  return now - lastChecked >= heartbeat;
}

async function safeUpdate(monitorId, status, start, error = null) {
  const responseTime = Date.now() - start;
  updateMonitorStatus(monitorId, status, responseTime, error, () => {});
}

async function checkHttp(monitor) {
  const start = Date.now();
  try {
    await axios.get(monitor.url, {
      timeout: 10000,
      validateStatus: () => true,
    });
    await safeUpdate(monitor.id, "up", start);
  } catch (err) {
    await safeUpdate(monitor.id, "down", start, err.message);
  }
}

async function checkDns(monitor) {
  const start = Date.now();
  try {
    const hostname = normalizeHostname(monitor.url);
    await dns.resolve4(hostname);
    await safeUpdate(monitor.id, "up", start);
  } catch (err) {
    await safeUpdate(monitor.id, "down", start, err.message);
  }
}

async function checkPing(monitor) {
  const start = Date.now();
  try {
    const hostname = normalizeHostname(monitor.url);
    const result = await ping.promise.probe(hostname, { timeout: 3 });

    const status = result.alive ? "up" : "down";
    await safeUpdate(
      monitor.id,
      status,
      start,
      result.alive ? null : "Host unreachable"
    );
  } catch (err) {
    await safeUpdate(monitor.id, "down", start, err.message);
  }
}

async function runChecks() {
  if (isRunning) {
    console.log("⏳ Previous cron still running, skipping...");
    return;
  }

  isRunning = true;
  console.log("⏱ Running uptime checks...");

  getAllMonitorsCron(async (err, monitors) => {
    if (err) {
      console.error("Failed to fetch monitors:", err.message);
      isRunning = false;
      return;
    }

    for (const monitor of monitors) {
      if (monitor.paused) continue;
      if (!shouldCheck(monitor)) continue;

      try {
        switch (monitor.type) {
          case "dns":
            await checkDns(monitor);
            break;
          case "icmp":
            await checkPing(monitor);
            break;
          default:
            await checkHttp(monitor);
        }
      } catch (e) {
        console.error(`Monitor ${monitor.id} check failed:`, e.message);
      }
    }

    isRunning = false;
    console.log("✅ Uptime checks completed");
  });
}

module.exports = () => {
  cron.schedule("* * * * *", runChecks, {
    scheduled: true,
    timezone: "Asia/Jakarta",
  });
};
