import api from "@/lib/api";
import { parseUTC } from "@/lib/timezone";

export const createMonitor = async (data) => {
  try {
    const response = await api.post("/api/monitors", data);
    return response.data;
  } catch (error) {
    console.error("Create monitor failed:", error);
    throw error;
  }
};

export const getMonitors = async () => {
  try {
    const response = await api.get("/api/monitors");
    return response.data;
  } catch (error) {
    console.error("Get monitors failed:", error);
    throw error;
  }
};

export const deleteMonitor = async (id) => {
  try {
    const response = await api.delete(`/api/monitors/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Delete monitor ${id} failed:`, error);
    throw error;
  }
};

export const getMonitorDowntime = async (monitorId) => {
  try {
    const response = await api.get(`/api/monitors/${monitorId}/downtime`);
    return response.data.downtimes || [];
  } catch (error) {
    console.error(`Error fetching downtime for monitor ${monitorId}:`, error);
    throw error;
  }
};

export const updateMonitor = async (id, monitorData) => {
  try {
    const response = await api.put(`/api/monitors/${id}`, monitorData);
    return response.data;
  } catch (error) {
    console.error(`Update monitor ${id} failed:`, error);
    throw error;
  }
};

export const getMonitorUptime = async (monitorId) => {
  try {
    const response = await api.get(`/api/monitors/${monitorId}/uptime`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching uptime for monitor ${monitorId}:`, error);
    throw error;
  }
};

export const getMonitorUptimeChart = async (monitorId) => {
  try {
    const response = await api.get(`/api/monitors/${monitorId}/chart/uptime`);
    return response.data.map((item) => ({
      ...item,
      time: parseUTC(item.time).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));
  } catch (error) {
    console.error(
      `Error fetching uptime chart for monitor ${monitorId}:`,
      error
    );
    throw error;
  }
};

export const getMonitorResponseTimeChart = async (monitorId) => {
  try {
    const response = await api.get(
      `/api/monitors/${monitorId}/chart/response-time`
    );
    return response.data.map((item) => ({
      ...item,
      time: parseUTC(item.time).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));
  } catch (error) {
    console.error(
      `Error fetching response time chart for monitor ${monitorId}:`,
      error
    );
    throw error;
  }
};

export const pauseMonitor = async (monitorId, paused) => {
  try {
    const response = await api.patch(`/api/monitors/${monitorId}/pause`, {
      paused,
    });
    return response.data;
  } catch (error) {
    console.error(
      `Failed to ${paused ? "pause" : "resume"} monitor ${monitorId}:`,
      error
    );
    throw error;
  }
};

export const getMonitorHistory = async (monitorId) => {
  try {
    const response = await api.get(`/api/monitors/${monitorId}/history`);
    // Pastikan selalu mengembalikan array
    return Array.isArray(response.data)
      ? response.data
      : response.data.history || [];
  } catch (error) {
    console.error(`Error fetching history for monitor ${monitorId}:`, error);
    return []; // fallback ke array kosong
  }
};
