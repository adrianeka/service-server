import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Plus,
  Globe,
  X,
  TrendingUp,
  AlertTriangle,
  Check,
  ChevronDown,
  AlertCircle,
  Grid2x2Plus,
  Search
} from "lucide-react";
import { createMonitor, getNotificationSettings } from "@/service/ApiService";

const AddMonitorDialog = () => {
  const [open, setOpen] = useState(false);
  const [monitorType, setMonitorType] = useState('http');
  const [alert, setAlert] = useState({ show: false, message: "", type: "success" });
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    trigger,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: "",
      url: "",
      heartbeat_sec: 60,
      notification_setting_id: "",
    },
  });

  const heartbeatValue = watch("heartbeat_sec");
  const urlValue = watch("url");

  // Validasi ulang URL saat tipe monitor berubah
  useEffect(() => {
    if (urlValue) {
      trigger("url");
    }
  }, [monitorType, trigger, urlValue]);

  const triggerAlert = (message, type = "success") => {
    setAlert({ show: true, message, type });
    // Alert akan hilang otomatis dalam 4 detik (jika tidak reload)
    setTimeout(() => setAlert({ show: false, message: "", type: "success" }), 4000);
  };

  const { data: notificationSettings = [] } = useQuery({
    queryKey: ["notificationSettings"],
    queryFn: getNotificationSettings,
    enabled: open,
  });

  const addMonitorMutation = useMutation({
    mutationFn: (data) => {
      const monitorData = {
        name: data.name,
        url: data.url,
        type: monitorType,
        heartbeat_sec: parseInt(data.heartbeat_sec) || 60,
        ...(data.notification_setting_id && {
          notification_setting_id: parseInt(data.notification_setting_id),
        }),
      };
      return createMonitor(monitorData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
      triggerAlert("Monitor successfully created!", "success");
      
      // Delay sebentar agar user sempat melihat pesan sukses sebelum reload
      setTimeout(() => {
        setOpen(false);
        reset();
        setMonitorType('http');
        
        // 🔥 AUTO RELOAD DITAMBAHKAN DISINI
        window.location.reload(); 
      }, 1000); // 1 detik delay
    },
    onError: (error) => {
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error || 
        "Network error: Failed to reach server.";
      triggerAlert(errorMessage, "error");
    },
  });

  const onSubmit = (data) => {
    addMonitorMutation.mutate(data);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(val) => {
        setOpen(val);
        if(!val) reset();
      }}>
        <DialogTrigger asChild>
          <Button className="flex items-center justify-center transition-all rounded-full shadow-lg h-11 bg-primary hover:bg-primary/90 text-primary-foreground hover:shadow-xl px-6">
            <Plus className="w-5 h-5 mr-2" strokeWidth={3} />
            <span className="font-bold">Add Monitor</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-[500px] w-[95%] p-0 border-none rounded-[1.5rem] shadow-2xl overflow-hidden bg-white flex flex-col max-h-[95vh]">
          
          {/* HEADER */}
          <div className="px-8 pt-8">
            <div className="flex items-start gap-4 mb-1">
              <div className="mt-1">
                 <Grid2x2Plus className="text-blue-600" size={28} strokeWidth={2.5} />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-blue-600 tracking-tight mb-1">
                  Add Monitor
                </DialogTitle>
                <DialogDescription className="text-slate-400 text-[13px] font-normal leading-tight">
                  Start monitoring your website's uptime and performance instantly
                </DialogDescription>
              </div>
              <button onClick={() => setOpen(false)} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
            <div className="px-8 space-y-2">
              
              {/* Monitor Type Selection */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-slate-600 block">
                  Monitor Type
                </Label>
                <div className="flex gap-3">
                  {[
                    { id: "http", icon: Globe, label: "HTTP/HTTPS" },
                    { id: "dns", icon: TrendingUp, label: "DNS" },
                    { id: "icmp", icon: AlertTriangle, label: "ICMP Ping" },
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setMonitorType(type.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full font-bold text-[13px] transition-all border ${
                        monitorType === type.id
                          ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                          : "bg-slate-50 text-blue-400 border-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      <type.icon size={14} strokeWidth={2.5} /> {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name Input */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 block">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register("name", { required: "Monitor name is required" })}
                  placeholder="My API Server"
                  className="h-11 px-4 bg-slate-50 border-slate-200 rounded-xl text-slate-600 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* URL Input */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 block">
                  URL to Monitor <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register("url", { 
                    required: "URL is required",
                    validate: (value) => {
                      if (!value) return true;
                      
                      if (monitorType === 'http') {
                        const isValidHttp = /^https?:\/\//i.test(value);
                        return isValidHttp || "The URL format is invalid. Please check and try again.";
                      }
                      
                      if (monitorType === 'dns') {
                        const isUrl = /^https?:\/\//i.test(value);
                        const isValidDomain = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
                        if (isUrl || !isValidDomain) {
                            return "Invalid domain or URL format.";
                        }
                      }
                      
                      if (monitorType === 'icmp') {
                        const isUrl = /^https?:\/\//i.test(value);
                        const isValidHost = /^[a-zA-Z0-9.-]+$/.test(value); 
                        if (isUrl || !isValidHost) {
                            return "Invalid host format. Enter a valid IP address or domain name (without http/https).";
                        }
                      }
                      
                      return true;
                    }
                  })}
                  placeholder={
                    monitorType === 'http' ? "https://example.com" : 
                    monitorType === 'dns' ? "example.com" : "192.168.1.1"
                  }
                  className={`h-11 px-4 bg-slate-50 border-slate-200 rounded-xl text-slate-600 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400 ${errors.url ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200' : ''}`}
                />
                
                {errors.url && (
                  <div className="flex items-start gap-1.5 mt-1.5 text-[11px] font-bold text-red-500 animate-in slide-in-from-top-1">
                    <AlertCircle size={14} className="mt-[1px] flex-shrink-0" />
                    <span>{errors.url.message}</span>
                  </div>
                )}
              </div>

              {/* Heartbeat Input */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 block">
                  Heartbeat Interval <span className="text-slate-400 italic font-normal">(Check every {heartbeatValue || 60} seconds)</span>
                </Label>
                <Input
                  type="number"
                  {...register("heartbeat_sec", { required: true, min: 10 })}
                  className="h-11 px-4 bg-slate-50 border-slate-200 rounded-xl text-slate-600 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Notification Setting */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 block">
                  Notification <span className="text-slate-400 italic font-normal">(Opsional)</span>
                </Label>
                <div className="relative">
                  <select
                    {...register("notification_setting_id")}
                    className="w-full h-11 pl-4 pr-10 appearance-none bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer placeholder:text-slate-400"
                  >
                    <option value="" className="text-slate-400">Setup Notification</option>
                    {notificationSettings.map((s) => (
                      <option key={s.id} value={s.id} className="text-slate-700">{s.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

               {/* Footer Info Text */}
               <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1 pb-2">
                  <Search size={12} className="text-slate-400" />
                  <span>Checked 1 minute • Response time tracked • Auto status updates</span>
               </div>

            </div>

            {/* Footer Buttons */}
            <div className="p-8 pt-4 flex gap-3 justify-end">
              <Button
                type="button"
                onClick={() => { setOpen(false); reset(); }}
                className="w-32 h-11 rounded-full border border-blue-500 bg-white text-blue-500 font-semibold hover:bg-blue-50 transition-all"
              >
                <X size={16} strokeWidth={2.5} className="mr-1" /> Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={addMonitorMutation.isPending}
                className="w-32 h-11 bg-slate-400 hover:bg-slate-500 text-white rounded-full font-semibold shadow-none transition-all flex items-center justify-center gap-2"
              >
                {addMonitorMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent" />
                ) : (
                  <><Plus size={18} strokeWidth={2.5} /> Add</>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Floating Alert */}
      {alert.show && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-bottom-10 duration-500 ${
          alert.type === 'success' 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
            : 'bg-white border-red-100 text-red-600 shadow-red-100'
        }`}>
          {alert.type === 'success' ? (
            <div className="bg-emerald-500 rounded-full p-1.5 shadow-lg shadow-emerald-200">
              <Check size={16} className="text-white" strokeWidth={4} />
            </div>
          ) : (
            <div className="bg-red-500 rounded-full p-1.5 shadow-lg shadow-red-200 animate-pulse">
              <AlertCircle size={16} className="text-white" strokeWidth={4} />
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black tracking-widest opacity-50">
              {alert.type === 'success' ? 'Success' : 'Attention Required'}
            </span>
            <span className="text-sm font-bold tracking-tight">{alert.message}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default AddMonitorDialog;