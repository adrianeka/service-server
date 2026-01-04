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
import {
  Globe, Clock, History, AlertCircle, Play, Pause, Edit,
  Trash2, ArrowLeft, Loader2, CheckCircle2, AlertTriangle, XCircle
} from "lucide-react";
import EditMonitorDialog from "@/components/EditMonitorDialog";
import DeleteMonitorDialog from "@/components/DeleteMonitorDialog";
import {
  getMonitorDetail, pauseMonitor, getMonitorHistory,
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

  // --- API INTEGRATION ---
  const { data: monitor, isLoading, isError, refetch } = useQuery({
    queryKey: ["monitor", id],
    queryFn: () => getMonitorDetail(id),
    enabled: !!id,
  });

  const { data: uptimeData } = useQuery({
    queryKey: ["monitor-uptime", id],
    queryFn: () => getMonitorUptime(id),
    enabled: !!id,
    refetchInterval: 30000,
  });

  const { data: uptimeChartData = [] } = useQuery({
    queryKey: ["monitor-uptime-chart", id],
    queryFn: () => getMonitorUptimeChart(id),
    enabled: !!id,
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
    try {
      const data = await getMonitorDowntime(id);
      setDowntimeData(Array.isArray(data) ? data : []);
    } catch (e) { setDowntimeData([]); }
  };

  const pauseMutation = useMutation({
    mutationFn: ({ id, paused }) => pauseMonitor(id, paused),
    onSuccess: () => {
      queryClient.invalidateQueries(["monitor", id]);
      refetch();
    },
  });

  // --- HELPERS ---
  const getStatusStyle = (status) => {
    switch (status) {
      case "up": return { bg: "bg-emerald-50 border-emerald-100", text: "text-emerald-600", badge: "bg-emerald-500", icon: CheckCircle2, label: "Operational" };
      case "down": return { bg: "bg-red-50 border-red-100", text: "text-red-500", badge: "bg-red-500", icon: XCircle, label: "Down" };
      default: return { bg: "bg-slate-50 border-slate-100", text: "text-slate-400", badge: "bg-slate-400", icon: Clock, label: "Checking..." };
    }
  };

    const handleTogglePause = () => {
    if (!monitorData) return;
    pauseMutation.mutate({
      id: monitorData.id,
      paused: monitorData.paused ? 0 : 1,
    });
  };
  
  const safeFormatDate = (d) => {
    if (!d) return null;
    const date = new Date(d); // Menggunakan standar Date constructor untuk ISO strings
    return isValid(date) ? date : null;
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600 w-12 h-12" /></div>;
  if (isError || !monitorData) return <div className="p-20 text-center font-bold text-slate-400">Monitor Not Found</div>;

  const style = getStatusStyle(monitorData.status);
  const uptimeVal = uptimeData?.uptime || monitorData.uptime_percentage || 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="container max-w-7xl mx-auto px-4 py-8">
        
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-8 font-bold text-blue-500 hover:bg-blue-50 rounded-full">
          <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={3} /> Go to Dashboard
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white italic font-black text-xs">
                    {monitorData.name.substring(0,2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-black text-slate-800 tracking-tight">{monitorData.name}</h1>
                      <Badge variant="outline" className="rounded-full text-[10px] font-black text-slate-300 uppercase border-slate-100"># {monitorData.type}</Badge>
                    </div>
                    <p className="text-sm text-slate-400 font-medium truncate italic">{monitorData.url}</p>
                  </div>
                </div>

                <div className={`flex items-center justify-between p-5 rounded-2xl border ${style.bg} transition-all`}>
                  <div className="flex items-center gap-3 font-black text-lg tracking-tight">
                    <style.icon className={`w-6 h-6 ${style.text}`} strokeWidth={2.5} />
                    <span className={style.text}>{style.label}</span>
                  </div>
                  <Badge className={`${style.badge} text-white border-none rounded-lg font-black px-3 py-1 text-[10px]`}>UP</Badge>
                </div>
              </CardHeader>

              <CardContent className="px-8 pb-8 space-y-8">
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Uptime</span>
                    <span className="text-blue-600 font-black text-xl">{uptimeVal.toFixed(1)}%</span>
                  </div>
                  <Progress value={uptimeVal} className="h-3 bg-slate-50" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">Response Time</p>
                    <p className="text-4xl font-black text-emerald-500 italic">{monitorData.last_response_time || 0}<span className="text-sm font-bold opacity-30 ml-1 uppercase">ms</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">Last Check</p>
                    <p className="text-base font-bold text-slate-700 mt-2">
                      {monitorData.last_checked ? formatDistanceToNow(safeFormatDate(monitorData.last_checked), { addSuffix: true }) : "Checking..."}
                    </p>
                  </div>
                </div>

                {/* Avg/Min/Max box */}
                <div className="grid grid-cols-3 py-6 bg-slate-50/50 rounded-[2rem] border border-slate-50">
                   <div className="text-center border-r border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Avg Response</p>
                      <p className="text-xl font-black text-blue-600 mt-1 italic">34<span className="text-xs font-bold opacity-30 ml-0.5">ms</span></p>
                   </div>
                   <div className="text-center border-r border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Min Response</p>
                      <p className="text-xl font-black text-emerald-500 mt-1 italic">19<span className="text-xs font-bold opacity-30 ml-0.5">ms</span></p>
                   </div>
                   <div className="text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Max Response</p>
                      <p className="text-xl font-black text-red-400 mt-1 italic">305<span className="text-xs font-bold opacity-30 ml-0.5">ms</span></p>
                   </div>
                </div>

                <div className="pt-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">24-Hour Uptime</p>
                  <div className="h-44 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={uptimeChartData}>
                        <defs>
                          <linearGradient id="colorUp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="uptime" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorUp)" />
                        <XAxis dataKey="time" hide />
                        <YAxis hide domain={[0, 100]} />
                        <RechartsTooltip />
                      </AreaChart>
                    </ResponsiveContainer>
                    <div className="flex justify-between mt-4 text-[9px] font-black text-slate-300 uppercase tracking-tighter italic">
                      <span>05:53 AM</span><span>09:22 PM</span><span>06:52 AM</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-8">
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 bg-white/80 p-1.5 rounded-full border border-slate-100 shadow-sm">
                <button 
                  onClick={() => setActiveTab("history")}
                  className={`flex items-center gap-2 px-8 py-2.5 rounded-full font-black text-xs transition-all ${activeTab === 'history' ? 'bg-blue-100/60 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <History size={16} strokeWidth={3} /> View History
                </button>
                <button 
                  onClick={() => setActiveTab("downtime")}
                  className={`flex items-center gap-2 px-8 py-2.5 rounded-full font-black text-xs transition-all ${activeTab === 'downtime' ? 'bg-red-50 text-red-500' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <AlertCircle size={16} strokeWidth={3} /> View Downtime
                </button>
              </div>
            </div>

            <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden flex flex-col h-[600px]">
               <div className="p-8 text-center border-b border-slate-50">
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">Monitoring History</h2>
                  <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-1">Last 30 checks for {monitorData.name}</p>
               </div>
               
               <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar">
                  {activeTab === "history" ? (
                    isLoadingHistory ? <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-slate-200" /></div> :
                    historyData.map((item, idx) => {
                      const itemDate = safeFormatDate(item.created_at || item.checked_at);
                      return (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                          <div className="flex items-center gap-4">
                            <Badge className={`${item.status === 'up' ? 'bg-emerald-500' : 'bg-red-500'} border-none text-[9px] font-black w-14 py-1.5 justify-center rounded-lg shadow-sm`}>{item.status.toUpperCase()}</Badge>
                            <div>
                              <p className="text-sm font-black text-slate-700">{itemDate ? formatDistanceToNow(itemDate, { addSuffix: true }) : "N/A"}</p>
                              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
                                {itemDate ? format(itemDate, "dd/MM/yyyy, HH:mm:ss") : "Invalid Date"}
                              </p>
                            </div>
                          </div>
                          <span className={`text-xl font-black italic ${item.status === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>{item.response_time || 0}<span className="text-[10px] not-italic ml-1 opacity-40 uppercase">ms</span></span>
                        </div>
                      );
                    })
                  ) : (
                    downtimeData.map((item, idx) => {
                      const startDate = safeFormatDate(item.start_time);
                      return (
                        <div key={idx} className="p-5 bg-red-50/30 rounded-2xl border border-red-50 flex justify-between items-center group hover:bg-red-50 transition-all">
                           <div>
                              <p className="text-red-500 font-black text-sm italic">Offline for {item.duration_seconds}s</p>
                              <p className="text-[10px] text-red-300 font-bold uppercase tracking-tighter">{item.reason || "Connection Timeout"}</p>
                           </div>
                           <p className="text-[10px] font-black text-red-400 bg-white px-3 py-1 rounded-full shadow-sm">{startDate ? format(startDate, "dd MMM HH:mm") : "N/A"}</p>
                        </div>
                      );
                    })
                  )}
               </div>
            </Card>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
               <div className="w-full text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 ml-4">Status Control & Actions</div>
               
               <div className="flex bg-slate-100 p-1.5 rounded-full border border-slate-200">
                  <button 
                    onClick={() => handleTogglePause(0)}
                    disabled={pauseMutation.isLoading}
                    className={`flex items-center gap-2 px-8 py-3 rounded-full font-black text-xs transition-all ${!monitorData.paused ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400'}`}
                  >
                    <Play className="w-4 h-4" fill={!monitorData.paused ? 'white' : 'none'} /> Active
                  </button>
                  <button 
                    onClick={() => handleTogglePause(1)}
                    disabled={pauseMutation.isLoading}
                    className={`flex items-center gap-2 px-8 py-3 rounded-full font-black text-xs transition-all ${monitorData.paused ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400'}`}
                  >
                    <Pause className="w-4 h-4" fill={monitorData.paused ? 'white' : 'none'} /> Pause
                  </button>
               </div>

               <Button onClick={() => setEditOpen(true)} className="bg-blue-50 text-blue-500 hover:bg-blue-100 rounded-full px-10 py-6 h-auto font-black text-xs gap-2 shadow-none transition-all">
                  <Edit size={18} strokeWidth={3} /> Edit
               </Button>

               <Button onClick={() => setDeleteOpen(true)} variant="outline" className="ml-auto border-2 border-red-50 text-red-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 rounded-full px-8 py-6 h-auto font-black text-xs gap-2 transition-all">
                  <Trash2 size={18} strokeWidth={3} /> Delete
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