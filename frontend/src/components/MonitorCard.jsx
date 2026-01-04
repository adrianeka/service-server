import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  ExternalLink,
  Trash2,
  Activity,
  MoreVertical,
  Pause,
  Play,
  Edit,
  History,
  Globe,
  GripVertical,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Progress } from "./ui/progress";
import MonitorHistoryDialog from "./MonitorHistoryDialog";
import EditMonitorDialog from "./EditMonitorDialog";
import DeleteMonitorDialog from "./DeleteMonitorDialog";
import DowntimeDialog from "./DowntimeDialog";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { parseUTC } from "../lib/timezone";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import {
  getMonitorUptime,
  getMonitorUptimeChart,
  getMonitorResponseTimeChart,
  pauseMonitor,
} from "../service/ApiService";

/**
 * Fungsi helper untuk mendapatkan styling berdasarkan status
 */
const getStatusInfo = (status) => {
  switch (status) {
    case "up":
      return {
        bgColor: "bg-emerald-50 border-emerald-100",
        textColor: "text-emerald-600",
        badgeColor: "bg-emerald-500",
        chartColor: "#10b981", // Hijau
        icon: CheckCircle,
        label: 'Operational'
      };
    case "slow":
      return {
        bgColor: "bg-amber-50 border-amber-100",
        textColor: "text-amber-600",
        badgeColor: "bg-amber-500",
        chartColor: "#f59e0b", // Kuning/Amber
        icon: AlertTriangle,
        label: 'Degraded'
      };
    case "down":
      return {
        bgColor: "bg-red-50 border-red-100",
        textColor: "text-red-500",
        badgeColor: "bg-red-400",
        chartColor: "#ef4444", // Merah
        icon: XCircle,
        label: 'Down'
      };
    default:
      return {
        bgColor: "bg-blue-50 border-blue-100",
        textColor: "text-blue-500",
        badgeColor: "bg-blue-400",
        chartColor: "#3b82f6", // Biru
        icon: Clock,
        label: "Checking...",
      };
  }
};

const MonitorCard = ({ monitor, onDelete }) => {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [downtimeOpen, setDowntimeOpen] = useState(false);
  const queryClient = useQueryClient();

  // --- Data Fetching ---
  const { data: uptimeData, isLoading: uptimeLoading } = useQuery({
    queryKey: ['monitor-uptime', monitor.id],
    queryFn: () => getMonitorUptime(monitor.id),
    refetchInterval: 30000,
  });

  const uptimePercentage = uptimeData?.uptime;

  const { data: uptimeChartData = [] } = useQuery({
    queryKey: ['monitor-uptime-chart', monitor.id],
    queryFn: () => getMonitorUptimeChart(monitor.id),
    refetchInterval: 60000,
  });

  const { data: responseTimeChartData = [] } = useQuery({
    queryKey: ['monitor-response-time-chart', monitor.id],
    queryFn: () => getMonitorResponseTimeChart(monitor.id),
    refetchInterval: 60000,
  });

  const pauseMutation = useMutation({
    mutationFn: (paused) => pauseMonitor(monitor.id, paused),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
    },
  });

  const handleTogglePause = () => {
    pauseMutation.mutate(!monitor.paused);
  };

 const handleDetailMonitor = (id) => {
  navigate(`/monitor/${id}`);
};
  // --- Styling Helpers ---
  const { bgColor, textColor, badgeColor, chartColor, icon: StatusIcon, label } = getStatusInfo(monitor.status);

  const getResponseTimeColor = (time) => {
    if (time < 500) return "text-emerald-500 font-black";
    if (time < 2000) return "text-amber-500 font-black";
    return "text-red-500 font-black";
  };

  const truncateText = (text, maxWords = 8) => {
    const words = text.split(/\s+/);
    if (words.length > maxWords) return words.slice(0, maxWords).join(" ") + "...";
    return text;
  };

  return (
    <Card className={`group relative hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] border-slate-100 overflow-hidden bg-white ${monitor.paused === 1 ? "opacity-60" : ""}`}>
      
      <CardHeader className="p-7 pb-2">
        <div className="flex items-start justify-between">
          {/* Brand & Identity */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {monitor.favicon && monitor.type === "http" ? (
              <img 
                src={monitor.favicon} 
                className="w-10 h-10 rounded-full shadow-sm border border-slate-50" 
                alt="icon" 
                onError={(e) => (e.target.style.display = "none")}
              />
            ) : (
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white italic font-black text-[10px] shadow-lg shadow-blue-100">
                {monitor.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-800 truncate leading-none">
                  {truncateText(monitor.name, 5)}
                </h3>
                <Badge variant="secondary" className="bg-slate-100 text-slate-400 border-none rounded-full text-[9px] font-black px-2 py-0.5">
                  {monitor.type?.toUpperCase() || 'HTTP'}
                </Badge>
              </div>
              <p className="text-sm text-slate-400 truncate mt-1">{monitor.url}</p>
            </div>
          </div>

          {/* DRAG HANDLE & MENU ACTION */}
          <div className="flex items-center gap-1 relative z-30">
            {/* AREA KHUSUS GESER (DRAG HANDLE) */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  data-swapy-handle 
                  className="flex items-center justify-center w-10 h-10 rounded-full cursor-grab active:cursor-grabbing hover:bg-slate-50 transition-colors text-slate-300 hover:text-slate-500"
                >
                  <GripVertical className="w-6 h-6" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">Tahan untuk geser urutan</TooltipContent>
            </Tooltip>

            {/* TOMBOL MENU TITIK TIGA */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0 hover:bg-slate-50">
                  <MoreVertical className="w-5 h-5 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-2xl p-2 shadow-xl border-slate-100">
                <DropdownMenuItem   onClick={() => handleDetailMonitor(monitor.id)} className="rounded-xl cursor-pointer">
                  <Edit className="w-4 h-4 mr-2" /> Detail Monitor
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleTogglePause} className="rounded-xl cursor-pointer">
                  {monitor.paused ? <><Play className="w-4 h-4 mr-2" /> Resume</> : <><Pause className="w-4 h-4 mr-2" /> Pause Monitoring</>}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="rounded-xl cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-7 pt-4 space-y-6">
        
        {/* Status Highlight Box */}
        <div className={`flex items-center justify-between p-4 rounded-[1.5rem] border ${bgColor} transition-all duration-500`}>
          <div className="flex items-center gap-3">
            <StatusIcon className={`h-6 w-6 ${textColor}`} />
            <span className={`font-bold text-lg tracking-tight ${textColor}`}>{label}</span>
          </div>
          <Badge className={`${badgeColor} text-white border-0 rounded-full px-3 py-0.5 text-[10px] font-black tracking-widest`}>
            {monitor.status?.toUpperCase() || 'UNKNOWN'}
          </Badge>
        </div>

        {/* Uptime Progress Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-slate-400 uppercase text-[11px] tracking-wider">Uptime Percentage</span>
            <span className={`font-black text-lg ${uptimePercentage < 90 ? 'text-orange-500' : 'text-blue-600'}`}>
              {uptimeLoading ? "..." : `${uptimePercentage || 0}%`}
            </span>
          </div>
          <Progress value={uptimePercentage || 0} className="h-2.5 bg-slate-100" />
        </div>

        {/* Real-time Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Response Time</p>
            <p className={`text-3xl font-black ${getResponseTimeColor(monitor.response_time)}`}>
              {monitor.response_time}<span className="text-sm ml-1 font-bold opacity-30">ms</span>
            </p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Last Check</p>
            <p className="text-sm font-bold text-slate-600 mt-2 italic">
              {formatDistanceToNow(parseUTC(monitor.last_checked), { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Averages Box Section */}
        <div className="grid grid-cols-3 py-5 border border-slate-50 rounded-[1.5rem] bg-slate-50/50">
          <div className="text-center border-r border-slate-100 px-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Avg Res</p>
            <p className="text-sm font-black text-blue-500 mt-1">
              {responseTimeChartData.length > 0 ? Math.round(responseTimeChartData.reduce((acc, d) => acc + d.avgResponse, 0) / responseTimeChartData.length) : monitor.response_time} <span className="text-[9px] opacity-60 font-medium">ms</span>
            </p>
          </div>
          <div className="text-center border-r border-slate-100 px-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Min Res</p>
            <p className="text-sm font-black text-emerald-500 mt-1">
              {responseTimeChartData.length > 0 ? Math.min(...responseTimeChartData.map(d => d.avgResponse)).toFixed(0) : monitor.response_time} <span className="text-[9px] opacity-60 font-medium">ms</span>
            </p>
          </div>
          <div className="text-center px-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Max Res</p>
            <p className="text-sm font-black text-red-400 mt-1">
               {responseTimeChartData.length > 0 ? Math.max(...responseTimeChartData.map(d => d.avgResponse)).toFixed(0) : monitor.response_time} <span className="text-[9px] opacity-60 font-medium">ms</span>
            </p>
          </div>
        </div>

        {/* Area Chart Section with Dynamic Colors */}
        <div className="pt-2">
          <p className="mb-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">24-Hour Performance</p>
          <div className="h-[140px] w-full relative">
            {uptimeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={uptimeChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`chartColor-${monitor.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColor} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" hide />
                  <YAxis domain={[0, 100]} hide />
                  <RechartsTooltip 
                    cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                    contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold' }}
                    formatter={(val) => [`${val.toFixed(1)}%`, 'Uptime']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="uptime" 
                    stroke={chartColor} 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill={`url(#chartColor-${monitor.id})`} 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <Activity className="w-6 h-6 text-slate-300 animate-pulse mb-2" />
                <span className="text-xs text-slate-400 font-medium">Collecting history...</span>
              </div>
            )}
            
            {/* Timeline Legends */}
            {uptimeChartData.length > 0 && (
              <div className="flex justify-between mt-2 px-1 text-[9px] font-black text-slate-300 uppercase tracking-tighter">
                <span>{uptimeChartData[0].time}</span>
                <span>{uptimeChartData[Math.floor(uptimeChartData.length / 2)]?.time}</span>
                <span>{uptimeChartData[uptimeChartData.length - 1].time}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* Logic Dialog Components */}
      <EditMonitorDialog open={editOpen} onOpenChange={setEditOpen} monitor={monitor} />
      <MonitorHistoryDialog open={historyOpen} onOpenChange={setHistoryOpen} monitor={monitor} />
      <DeleteMonitorDialog open={deleteOpen} onOpenChange={setDeleteOpen} monitor={monitor} />
      <DowntimeDialog monitorId={monitor.id} isOpen={downtimeOpen} onClose={setDowntimeOpen} />
    </Card>
  );
};

export default MonitorCard;