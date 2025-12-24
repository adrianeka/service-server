import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const ApiService = {
  getMonitors: async () => {
    const res = await api.get('/api/monitors');
    return res.data;
  },

  addMonitor: async (payload) => {
    const res = await api.post('/api/monitors', payload);
    return res.data;
  },

  deleteMonitor: async (id) => {
    const res = await api.delete(`/api/monitors/${id}`);
    return res.data;
  },

  updateMonitor: async (id, payload) => {
    const res = await api.put(`/api/monitors/${id}`, payload);
    return res.data;
  },

  pauseMonitor: async (id, paused) => {
    const res = await api.patch(`/api/monitors/${id}/pause`, { paused });
    return res.data;
  },

  getMonitorUptime: async (id) => {
    const res = await api.get(`/api/monitors/${id}/uptime`);
    return res.data;
  },

  getMonitorUptimeChart: async (id) => {
    const res = await api.get(`/api/monitors/${id}/chart/uptime`);
    return res.data;
  },

  getMonitorResponseTimeChart: async (id) => {
    const res = await api.get(`/api/monitors/${id}/chart/response-time`);
    return res.data;
  },

  getMonitorHistory: async (id) => {
    const res = await api.get(`/api/monitors/${id}/history`);
    return res.data;
  },

  getMonitorDowntime: async (id) => {
    const res = await api.get(`/api/monitors/${id}/downtime`);
    return res.data;
  },
};

export default ApiService;
export { api };

