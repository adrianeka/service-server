import { useState } from "react";
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
  Network,
  Wifi,
  Check,
  ChevronDown,
  AlertCircle
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
    formState: { errors },
    setError, // Digunakan jika ingin memetakan error backend ke field input
  } = useForm({
    defaultValues: {
      name: "",
      url: "",
      heartbeat_sec: 60,
      notification_setting_id: "",
    },
  });

  // Fungsi Helper untuk memicu Alert melayang
  const triggerAlert = (message, type = "success") => {
    setAlert({ show: true, message, type });
    // Alert hilang otomatis setelah 4 detik
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
      
      // Delay penutupan dialog agar user sempat melihat feedback sukses
      setTimeout(() => {
        setOpen(false);
        reset();
        setMonitorType('http');
      }, 800);
    },
    onError: (error) => {
      // Menangkap pesan error dari response backend (Axios)
      // Struktur umum: error.response.data.message
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error || 
        "Network error: Failed to reach server.";
      
      triggerAlert(errorMessage, "error");
      
      // Log untuk keperluan debugging developer
      console.error("Mutation Error:", error);
    },
  });

  const onSubmit = (data) => {
    addMonitorMutation.mutate(data);
  };

  const getURLPlaceholder = () => {
    switch (monitorType) {
      case "dns": return "example.com";
      case "icmp": return "8.8.8.8 or example.com";
      default: return "https://example.com";
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(val) => {
        setOpen(val);
        if(!val) reset(); // Reset form saat dialog ditutup manual
      }}>
        <DialogTrigger asChild>
          <Button className="flex items-center justify-center transition-all rounded-full shadow-lg h-11 bg-primary hover:bg-primary/90 text-primary-foreground hover:shadow-xl px-6">
            <Plus className="w-5 h-5 mr-2" strokeWidth={3} />
            <span className="font-bold">Add Monitor</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-[440px] w-[95%] p-0 border-none rounded-[2rem] shadow-2xl overflow-hidden bg-white flex flex-col max-h-[90vh]">
          <div className="p-6 pb-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-100">
                <Plus size={20} strokeWidth={3} />
              </div>
              <DialogTitle className="text-xl font-black text-slate-800 tracking-tight">
                New Monitor
              </DialogTitle>
            </div>
            <DialogDescription className="text-slate-400 text-xs font-medium">
              Configure your endpoint tracking settings below.
            </DialogDescription>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col overflow-hidden">
            <div className="px-6 py-2 space-y-4 overflow-y-auto" style={{ maxHeight: "calc(90vh - 160px)" }}>
              
              {/* Monitor Type Selection */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Monitor Type
                </Label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-slate-50 rounded-xl border border-slate-100">
                  {[
                    { id: "http", icon: Globe, label: "HTTP" },
                    { id: "dns", icon: Network, label: "DNS" },
                    { id: "icmp", icon: Wifi, label: "PING" },
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setMonitorType(type.id)}
                      className={`flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-[10px] transition-all ${
                        monitorType === type.id
                          ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      <type.icon size={14} strokeWidth={2.5} /> {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name Input */}
              <div className="space-y-1">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register("name", { 
                    required: "Monitor name is required",
                    minLength: { value: 3, message: "Minimum 3 characters" }
                  })}
                  placeholder="My Website"
                  className={`h-11 px-4 bg-slate-50 border-slate-100 rounded-xl font-bold text-slate-700 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all ${errors.name ? 'border-red-500 bg-red-50' : ''}`}
                />
                {errors.name && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.name.message}</p>}
              </div>

              {/* URL Input */}
              <div className="space-y-1">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">
                  URL / IP Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register("url", { 
                    required: "URL or IP is required",
                  })}
                  placeholder={getURLPlaceholder()}
                  className={`h-11 px-4 bg-slate-50 border-slate-100 rounded-xl font-bold text-slate-700 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all ${errors.url ? 'border-red-500 bg-red-50' : ''}`}
                />
                {errors.url && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.url.message}</p>}
              </div>

              {/* Heartbeat Input */}
              <div className="space-y-1">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">
                  Heartbeat Interval
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    {...register("heartbeat_sec", { 
                      required: true, 
                      min: { value: 10, message: "Min. 10s" },
                      max: { value: 3600, message: "Max. 3600s" }
                    })}
                    className={`h-11 px-4 bg-slate-50 border-slate-100 rounded-xl font-bold text-slate-700 text-sm focus:bg-white transition-all ${errors.heartbeat_sec ? 'border-red-500 bg-red-50' : ''}`}
                  />
                  <span className="absolute right-4 top-3 text-[10px] font-black text-slate-300 uppercase">sec</span>
                </div>
                {errors.heartbeat_sec && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.heartbeat_sec.message}</p>}
              </div>

              {/* Notification Setting */}
              <div className="space-y-1">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">
                  Notification Channel
                </Label>
                <div className="relative">
                  <select
                    {...register("notification_setting_id")}
                    className="w-full h-11 pl-4 pr-10 appearance-none bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer"
                  >
                    <option value="">No notification</option>
                    {notificationSettings.map((s) => (
                      <option key={s.id} value={s.id} className="text-slate-700">{s.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-3.5 text-slate-300 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex gap-3 mt-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setOpen(false); reset(); }}
                className="flex-1 h-12 rounded-xl border-2 border-slate-200 text-slate-400 font-black text-xs hover:bg-white transition-all"
              >
                <X size={16} strokeWidth={3} className="mr-1" /> CANCEL
              </Button>
              <Button 
                type="submit" 
                disabled={addMonitorMutation.isPending}
                className="flex-1 h-12 bg-blue-600 rounded-xl font-black text-xs text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                {addMonitorMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent" />
                ) : (
                  <><Plus size={16} strokeWidth={3} /> ADD MONITOR</>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- Floating Custom Alert --- */}
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