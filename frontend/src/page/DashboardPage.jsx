<<<<<<< HEAD
import { useState } from "react";
import Navbar from "../components/Navbar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../components/ui/tooltip";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Progress } from "../components/ui/progress";
import {
  Activity,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
=======
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "../components/Navbar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/ui/tooltip";
import { Activity, RefreshCw, TrendingUp,TriangleAlert, TrendingDown, CheckCircle2, XCircle, AlertTriangle, Loader2, Plus, Globe, Settings, Heart, Clock } from "lucide-react";
>>>>>>> 9bcab8c (Finish,Tester)
import { Badge } from "../components/ui/badge";
import MonitorCard from "../components/MonitorCard";
import AddMonitorDialog from "../components/AddMonitorDialog";
<<<<<<< HEAD
=======
import { getMonitors, pauseMonitor, deleteMonitor } from "@/service/ApiService";
import Footer from "../components/Footer";
>>>>>>> 9bcab8c (Finish,Tester)

// Dummy monitors data
const dummyMonitors = [
  {
    id: 1,
    name: "API Server",
    url: "https://api.example.com",
    status: "up",
    response_time: 45,
    type: "http",
  },
  {
    id: 2,
    name: "Database",
    url: "db.example.com",
    status: "up",
    response_time: 120,
    type: "dns",
  },
  {
    id: 3,
    name: "Web Server",
    url: "https://example.com",
    status: "up",
    response_time: 200,
    type: "http",
  },
  {
    id: 4,
    name: "Mail Server",
    url: "mail.example.com",
    status: "down",
    response_time: 0,
    type: "dns",
  },
  {
    id: 5,
    name: "Backup Server",
    url: "8.8.8.8",
    status: "slow",
    response_time: 450,
    type: "icmp",
  },
];

function DashboardPage({ theme, setTheme }) {
  const [activeTab, setActiveTab] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const { data: monitors = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ["monitors"],
    queryFn: getMonitors,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const pauseMutation = useMutation({
    mutationFn: ({ id, paused }) => pauseMonitor(id, paused),
    onSuccess: () => queryClient.invalidateQueries(["monitors"]),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMonitor,
    onSuccess: () => queryClient.invalidateQueries(["monitors"]),
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const getMonitorStatus = (monitor) => {
    if (monitor.status === "down") return "down";
    if (monitor.status === "up" && monitor.response_time > 1000) return "slow";
    return monitor.status;
  };

  const processedMonitors = monitors.map((monitor) => ({
    ...monitor,
    displayStatus: getMonitorStatus(monitor),
  }));

  const stats = {
    total: processedMonitors.length,
    up: processedMonitors.filter((m) => m.displayStatus === "up").length,
    down: processedMonitors.filter((m) => m.displayStatus === "down").length,
    slow: processedMonitors.filter((m) => m.displayStatus === "slow").length,
    avgResponseTime: processedMonitors.length > 0 ? Math.round(processedMonitors.reduce((acc, m) => acc + (m.response_time || 0), 0) / processedMonitors.length) : 0,
  };

  const responseTimes = processedMonitors.map((m) => m.response_time).filter((x) => x > 0);
  const uptimePercent = stats.total > 0 ? (stats.up / stats.total) * 100 : 0;
  
  // Health Score Logic
  const p95 = (arr) => {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    return sorted[Math.floor(0.95 * (sorted.length - 1))];
  };
  const p95Val = p95(responseTimes);
  const healthScore = stats.total > 0 ? Math.round((uptimePercent * 0.5) + ((1 - (stats.down / stats.total)) * 30) + (Math.max(0, (1 - p95Val/2000)) * 20)) : 0;

  const filteredMonitors = processedMonitors.filter(m => activeTab === "all" ? true : m.displayStatus === activeTab);

  if (isLoading) return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar />
      <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)]">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500 font-medium">Loading your monitors...</p>
      </div>
    </div>
  );

  return (
<>
    <div className="min-h-screen bg-[#F9FAFB] font-sans pb-20">
      <Navbar onRefresh={handleRefresh} isRefreshing={isRefreshing} />

      <main className="px-6 lg:px-20 py-10">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hi, {user?.username || "there"} 👋</h1>
            <p className="text-gray-500 mt-1">Easily monitor your website uptime here.</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          {[
            { label: "Total Monitors", value: stats.total, icon: <Globe size={16} />, color: "text-black-400" },
            { label: "Operational", value: stats.up, icon: <Settings size={16} />, color: "text-emerald-500" },
            { label: "Down", value: stats.down, icon: <TriangleAlert size={16} />, color: "text-red-500" },
            { label: "Uptime", value: `${uptimePercent.toFixed(1)}%`, icon: <Clock size={16} />, color: "text-black-500" },
            { label: "Health Score", value: `${healthScore}/100`, icon: <Heart size={16} />, color: "text-orange-500" },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm transition-hover hover:shadow-md">
              <div className="flex items-center gap-2 text-gray-400 mb-3">
                {stat.icon} <span className="text-sm font-medium">{stat.label}</span>
              </div>
              <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="w-full bg-gray-50 h-1.5 mt-4 rounded-full overflow-hidden">
                <div className={`h-full bg-current opacity-20 ${stat.color}`} style={{ width: `${stat.label === 'Total Monitors' ? 100 : (stat.label === 'Uptime' ? uptimePercent : healthScore)}%` }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          {/* Custom Tabs */}
          <div className="flex justify-center p-6 border-b border-gray-50 bg-gray-50/30">
            <div className="flex bg-gray-100 p-1.5 rounded-full gap-1">
              {['all', 'up', 'slow', 'down'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all text-sm font-semibold ${
                    activeTab === tab ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <span className="capitalize">{tab}</span>
                  <Badge variant="secondary" className="bg-gray-200 text-gray-700 text-[10px] h-4 min-w-[1.25rem] px-1">
                    {tab === 'all' ? stats.total : stats[tab]}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          <div className="p-8 flex-1 flex flex-col">
            {monitors.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
                <Activity size={48} className="text-gray-300 mb-4" />
                <p className="text-gray-400 font-medium text-lg italic">No monitors found. Add your first monitor to start.</p>
              </div>
            ) : filteredMonitors.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                <p className="text-gray-400 font-medium italic">No monitors in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {filteredMonitors.map((monitor) => (
                  <MonitorCard
                    key={monitor.id}
                    monitor={monitor}
                    onDelete={() => handleDelete(monitor.id)}
                    onPause={() => handlePause(monitor.id, monitor.paused)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
              <Footer/>
</>
  );
}

export default DashboardPage;