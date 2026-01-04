// pages/DetailMonitorPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow, format, isValid } from "date-fns";
import { parseUTC } from "@/lib/timezone";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/ui/tooltip";
import {
  Activity, Globe, Network, Wifi, ExternalLink, CheckCircle, XCircle,
  AlertTriangle, Clock, History, AlertCircle, Play, Pause, Edit,
  Trash2, ArrowLeft, Loader2, RefreshCw, AlertOctagon,
} from "lucide-react";
import EditMonitorDialog from "@/components/EditMonitorDialog";
import DeleteMonitorDialog from "@/components/DeleteMonitorDialog";
import {
  getMonitorDetail, pauseMonitor, deleteMonitor, getMonitorHistory,
  getMonitorDowntime, getMonitorUptime, getMonitorUptimeChart,
  getMonitorResponseTimeChart,
} from "@/service/ApiService";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
} from "recharts";
import Footer2 from "../components/Footer2";

function DetailMonitorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("history");
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [monitorData, setMonitorData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [downtimeData, setDowntimeData] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingDowntime, setIsLoadingDowntime] = useState(false);

  // --- LOGIC INTEGRATION (Existing) ---
  const { data: monitor, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["monitor", id],
    queryFn: () => getMonitorDetail(id),
    enabled: !!id,
  });

  const { data: uptimeData, isLoading: uptimeLoading } = useQuery({
    queryKey: ["monitor-uptime", id],
    queryFn: () => getMonitorUptime(id),
    enabled: !!id,
    refetchInterval: 30000,
  });

  const { data: uptimeChartData = [] } = useQuery({
    queryKey: ["monitor-uptime-chart", id],
    queryFn: () => getMonitorUptimeChart(id),
    enabled: !!id,
    refetchInterval: 60000,
  });

  const { data: responseTimeChartData = [] } = useQuery({
    queryKey: ["monitor-response-time-chart", id],
    queryFn: () => getMonitorResponseTimeChart(id),
    enabled: !!id,
    refetchInterval: 60000,
  });

  useEffect(() => { if (monitor) setMonitorData(monitor); }, [monitor]);
  useEffect(() => { if (activeTab === "history" && id) fetchHistoryData(); }, [activeTab, id]);
  useEffect(() => { if (activeTab === "downtime" && id) fetchDowntimeData(); }, [activeTab, id]);

  const fetchHistoryData = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await getMonitorHistory(id);
      setHistoryData(Array.isArray(data) ? data.slice(0, 50) : []);
    } catch (e) { setHistoryData([]); } finally { setIsLoadingHistory(false); }
  };

  const fetchDowntimeData = async () => {
    setIsLoadingDowntime(true);
    try {
      const data = await getMonitorDowntime(id);
      setDowntimeData(Array.isArray(data) ? data : []);
    } catch (e) { setDowntimeData([]); } finally { setIsLoadingDowntime(false); }
  };

  const pauseMutation = useMutation({
    mutationFn: ({ id, paused }) => pauseMonitor(id, paused),
    onSuccess: () => {
      queryClient.invalidateQueries(["monitor", id]);
      queryClient.invalidateQueries(["monitors"]);
    },
  });

  const handleTogglePause = (val) => {
    if (!monitorData) return;
    pauseMutation.mutate({ id: monitorData.id, paused: val });
  };

  // --- STYLING HELPERS ---
  const getStatusStyle = (status) => {
    switch (status) {
      case "up": return { bg: "bg-emerald-50 border-emerald-100", text: "text-emerald-600", badge: "bg-emerald-500", icon: CheckCircle, label: "Operational" };
      case "slow": return { bg: "bg-amber-50 border-amber-100", text: "text-amber-600", badge: "bg-amber-500", icon: AlertTriangle, label: "Degraded" };
      case "down": return { bg: "bg-red-50 border-red-100", text: "text-red-500", badge: "bg-red-400", icon: XCircle, label: "Down" };
      default: return { bg: "bg-slate-50 border-slate-100", text: "text-slate-400", badge: "bg-slate-400", icon: Clock, label: "Checking..." };
    }
  };

  const safeFormatDate = (d) => { if (!d) return null; const date = parseUTC(d); return isValid(date) ? date : null; };

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary w-12 h-12" /></div>;
  if (isError || !monitorData) return <div className="p-20 text-center">Monitor Not Found</div>;

  const style = getStatusStyle(monitorData.status);
  const uptimeVal = uptimeData?.uptime || monitorData.uptime_percentage || 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="container max-w-7xl mx-auto px-4 py-8">
        
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-8 font-bold text-blue-600 hover:bg-blue-50">
          <ArrowLeft className="w-4 h-4 mr-2" /> Go to Dashboard
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT COLUMN: Summary Card */}
          <div className="space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-sm p-2 overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white italic font-black text-xs">
                    {monitorData.name.substring(0,2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-black text-slate-800 tracking-tight">{monitorData.name}</h1>
                      <Badge variant="outline" className="rounded-full text-[10px] font-bold text-slate-400 uppercase"># {monitorData.type}</Badge>
                    </div>
                    <p className="text-sm text-slate-400 font-medium truncate max-w-xs">{monitorData.url}</p>
                  </div>
                </div>

                <div className={`flex items-center justify-between p-5 rounded-2xl border ${style.bg} transition-all`}>
                  <div className="flex items-center gap-3 font-bold text-lg tracking-tight">
                    <style.icon className={`w-6 h-6 ${style.text}`} />
                    <span className={style.text}>{style.label}</span>
                  </div>
                  <Badge className={`${style.badge} text-white border-none rounded-lg font-black px-3`}>UP</Badge>
                </div>
              </CardHeader>

              <CardContent className="px-8 pb-8 space-y-8">
                {/* Uptime bar */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Uptime</span>
                    <span className="text-blue-600 font-black text-xl">{uptimeVal.toFixed(1)}%</span>
                  </div>
                  <Progress value={uptimeVal} className="h-3 bg-slate-100" />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">Response Time</p>
                    <p className="text-4xl font-black text-emerald-500">{monitorData.response_time || 0}<span className="text-sm font-bold opacity-40 ml-1">ms</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">Last Check</p>
                    <p className="text-lg font-bold text-slate-700 mt-2">
                      {monitorData.last_checked ? formatDistanceToNow(safeFormatDate(monitorData.last_checked), { addSuffix: true }) : "Never"}
                    </p>
                  </div>
                </div>

                {/* Avg/Min/Max box */}
                <div className="grid grid-cols-3 py-5 bg-slate-50/50 rounded-3xl border border-slate-100">
                   <div className="text-center border-r border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Avg Response</p>
                      <p className="text-lg font-black text-blue-600 mt-1">34<span className="text-xs font-bold opacity-50 ml-0.5">ms</span></p>
                   </div>
                   <div className="text-center border-r border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Min Response</p>
                      <p className="text-lg font-black text-emerald-500 mt-1">19<span className="text-xs font-bold opacity-50 ml-0.5">ms</span></p>
                   </div>
                   <div className="text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Max Response</p>
                      <p className="text-lg font-black text-red-400 mt-1">305<span className="text-xs font-bold opacity-50 ml-0.5">ms</span></p>
                   </div>
                </div>

                {/* Chart Area */}
                <div className="pt-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">24-Hour Uptime</p>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={uptimeChartData}>
                        <defs>
                          <linearGradient id="colorUp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="uptime" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorUp)" />
                        <XAxis dataKey="time" hide />
                        <YAxis hide domain={[0, 100]} />
                        <RechartsTooltip />
                      </AreaChart>
                    </ResponsiveContainer>
                    <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
                      <span>05:53 AM</span><span>09:22 PM</span><span>06:52 AM</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: Tabs & History */}
          <div className="space-y-8">
            {/* Custom Tabs Navigation */}
            <div className="flex justify-center">
  <div className="inline-flex items-center gap-4 bg-white/60 p-2 rounded-full border border-slate-100 shadow-sm">
    <button 
      onClick={() => setActiveTab("history")}
      className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all ${activeTab === 'history' ? 'bg-blue-100/60 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
    >
      <History className="w-4 h-4" /> View History
    </button>

    <button 
      onClick={() => setActiveTab("downtime")}
      className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all ${activeTab === 'downtime' ? 'bg-red-50 text-red-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
    >
      <AlertCircle className="w-4 h-4" /> View Downtime
    </button>
  </div>
</div>

            {/* List Content */}
            <Card className="rounded-[2.5rem] border-none shadow-sm p-4 h-[550px] flex flex-col overflow-hidden">
               <div className="p-4 text-center border-b border-slate-50">
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">Monitoring History</h2>
                  <p className="text-xs text-slate-400 font-bold mt-1">Last 30 checks for {monitorData.url}</p>
               </div>
               
               <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar">
                  {activeTab === "history" ? (
                    isLoadingHistory ? <Loader2 className="animate-spin mx-auto mt-20 text-slate-200" /> :
                    historyData.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <Badge className={`${item.status === 'up' ? 'bg-emerald-500' : 'bg-red-400'} border-none text-[9px] font-black w-14 justify-center`}>{item.status.toUpperCase()}</Badge>
                          <div>
                            <p className="text-sm font-black text-slate-700">{formatDistanceToNow(safeFormatDate(item.checked_at), { addSuffix: true })}</p>
                            <p className="text-[10px] font-bold text-slate-300">{format(safeFormatDate(item.checked_at), "dd/MM/yyyy, HH:mm:ss")}</p>
                          </div>
                        </div>
                        <span className={`text-lg font-black ${item.status === 'up' ? 'text-emerald-500' : 'text-red-400'}`}>{item.response_time}ms</span>
                      </div>
                    ))
                  ) : (
                    downtimeData.map((item, idx) => (
                      <div key={idx} className="p-4 bg-red-50/50 rounded-2xl border border-red-100 flex justify-between items-center">
                         <div>
                            <p className="text-red-500 font-black text-sm">Offline for {item.duration_seconds}s</p>
                            <p className="text-[10px] text-red-300 font-bold">{item.reason}</p>
                         </div>
                         <p className="text-[10px] font-black text-red-400">{format(safeFormatDate(item.start_time), "dd MMM HH:mm")}</p>
                      </div>
                    ))
                  )}
               </div>
            </Card>

            {/* Bottom Actions Area */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-200">
               <div className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monitor Status & Actions</div>
               
               <div className="flex bg-slate-100 p-1.5 rounded-full">
                  <button 
                    onClick={() => handleTogglePause(0)}
                    disabled={pauseMutation.isLoading}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all ${!monitorData.paused ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}
                  >
                    <Play className="w-4 h-4" fill={!monitorData.paused ? 'white' : 'none'} /> Active
                  </button>
                  <button 
                    onClick={() => handleTogglePause(1)}
                    disabled={pauseMutation.isLoading}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all ${monitorData.paused ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}
                  >
                    <Pause className="w-4 h-4" fill={monitorData.paused ? 'white' : 'none'} /> Pause
                  </button>
               </div>

               <Button onClick={() => setEditOpen(true)} className="bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full px-8 py-6 h-auto font-black gap-2 shadow-none border-none">
                  <Edit className="w-5 h-5" /> Edit
               </Button>

               <Button onClick={() => setDeleteOpen(true)} variant="outline" className="ml-auto border-2 border-red-50 text-red-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 rounded-full px-8 py-6 h-auto font-black gap-2">
                  <Trash2 className="w-5 h-5" /> Delete
               </Button>
            </div>
          </div>
        </div>
      </div>

      <EditMonitorDialog open={editOpen} onOpenChange={setEditOpen} monitor={monitorData} onMonitorUpdated={refetch} />
      <DeleteMonitorDialog open={deleteOpen} onOpenChange={setDeleteOpen} monitor={monitorData} onMonitorDeleted={() => navigate("/dashboard")} />
      <Footer2 />
    </div>
  );
}

export default DetailMonitorPage;