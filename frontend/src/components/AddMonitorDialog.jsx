// components/AddMonitorDialog.jsx
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
  Search,
  Check,
  ChevronDown
} from "lucide-react";
import { createMonitor, getNotificationSettings } from "@/service/ApiService";

const AddMonitorDialog = () => {
  const [open, setOpen] = useState(false);
  const [monitorType, setMonitorType] = useState('http');
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      url: "",
      heartbeat_sec: 60,
      notification_setting_id: "",
    },
  });

  const { data: notificationSettings = [], isLoading: isLoadingNotifications } = useQuery({
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
      setOpen(false);
      reset();
      setMonitorType('http');
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Failed to add monitor");
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center justify-center transition-all rounded-full shadow-lg h-11 bg-primary hover:bg-primary/90 text-primary-foreground hover:shadow-xl px-6">
          <Plus className="w-5 h-5 mr-2" strokeWidth={3} />
          <span className="font-bold">Add Monitor</span>
        </Button>
      </DialogTrigger>

      {/* PERBAIKAN: max-w-[440px] dan max-h-[90vh] untuk mencegah tampilan terpotong */}
      <DialogContent className="max-w-[440px] w-[95%] p-0 border-none rounded-[2rem] shadow-2xl overflow-hidden bg-white flex flex-col max-h-[90vh]">
        
        {/* HEADER: Tetap di atas (Sticky) */}
        <div className="p-6 pb-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-100">
              <Plus size={20} strokeWidth={3} />
            </div>
            <DialogTitle className="text-xl font-black text-slate-800 tracking-tight">
              Add Monitor
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-400 text-xs font-medium">
            Start monitoring your website's uptime instantly
          </DialogDescription>
        </div>

        {/* CONTENT AREA: Dengan sistem scroll internal */}
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

            {/* Input Fields */}
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register("name", { required: "Name is required" })}
                  className="h-11 px-4 bg-slate-50 border-slate-100 rounded-xl font-bold text-slate-700 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  URL to Monitor <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register("url", { required: "URL is required" })}
                  placeholder={getURLPlaceholder()}
                  className="h-11 px-4 bg-slate-50 border-slate-100 rounded-xl font-bold text-slate-700 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Heartbeat (Seconds)
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    {...register("heartbeat_sec", { required: true, min: 30 })}
                    className="h-11 px-4 bg-slate-50 border-slate-100 rounded-xl font-bold text-slate-700 text-sm focus:bg-white transition-all"
                  />
                  <span className="absolute right-4 top-3 text-[10px] font-black text-slate-300 uppercase">sec</span>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Notification
                </Label>
                <div className="relative">
                  <select
                    {...register("notification_setting_id")}
                    className="w-full h-11 pl-4 pr-10 appearance-none bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-400 text-sm focus:bg-white focus:outline-none transition-all"
                  >
                    <option value="">Setup Notification</option>
                    {notificationSettings.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-3.5 text-slate-300 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Microcopy Info */}
            <div className="flex gap-4 text-[9px] font-bold text-slate-300 uppercase tracking-tighter italic">
              <span className="flex items-center gap-1"><Search size={10} strokeWidth={3} /> Response tracked</span>
              <span className="flex items-center gap-1"><Check size={10} strokeWidth={3} /> Auto status updates</span>
            </div>
          </div>

          {/* FOOTER: Tetap di bawah (Fixed) */}
          <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex gap-3">
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
                <><Plus size={16} strokeWidth={3} /> ADD</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMonitorDialog;