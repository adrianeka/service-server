import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { 
  Globe, 
  Network, 
  Wifi, 
  Bell, 
  Timer, 
  AlertCircle, 
  X, 
  Edit3, 
  Check, 
  RotateCcw,
  ChevronDown
} from "lucide-react";
import { updateMonitor, getNotificationSettings } from "../service/ApiService";

const EditMonitorDialog = ({ open, onOpenChange, monitor }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [monitorType, setMonitorType] = useState('http');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const { data: notificationSettings = [], isLoading: isLoadingNotifications } =
    useQuery({
      queryKey: ["notificationSettings"],
      queryFn: getNotificationSettings,
      enabled: open,
    });

  useEffect(() => {
    if (monitor && open) {
      reset({
        name: monitor.name || "",
        url: monitor.url || "",
        heartbeat_sec: monitor.heartbeat_sec || 60,
        notification_setting_id: monitor.notification_setting_id || "",
      });
      setMonitorType(monitor.type || "http");
      setError("");
    }
  }, [monitor, open]);

  const updateMutation = useMutation({
    mutationFn: (data) => {
      const updateData = {
        ...data,
        type: monitorType,
        heartbeat_sec: parseInt(data.heartbeat_sec),
        notification_setting_id: data.notification_setting_id ? parseInt(data.notification_setting_id) : null,
      };
      return updateMonitor(monitor.id, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitors"] });
      queryClient.invalidateQueries({ queryKey: ["monitor", monitor?.id] });
      onOpenChange(false);
    },
    onError: (err) => setError(err.response?.data?.message || "Failed to update monitor"),
  });

  const onSubmit = (data) => updateMutation.mutate(data);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* 1. Perbaikan: Tambahkan max-h-[95vh] dan flex flex-col */}
      <DialogContent className="max-w-[450px] w-[95%] p-0 border-none rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* 2. Header: Dibuat tetap di atas (sticky) */}
        <DialogHeader className="p-6 pb-2 relative flex flex-row items-start gap-3 space-y-0">
          <div className="p-2 text-blue-600 rounded-lg bg-blue-50 flex-shrink-0">
            <Edit3 className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <div className="flex-1 pr-8">
            <DialogTitle className="text-xl font-bold tracking-tight text-slate-800">
              Edit Monitor
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-slate-400">
              Update the monitor details
            </DialogDescription>
          </div>
          {/* Tombol Close bawaan Dialog biasanya sudah ada, jika tertutup pastikan tidak ada absolute manual yang menabrak */}
        </DialogHeader>

        {/* 3. Body: Tambahkan overflow-y-auto agar tombol di bawah tidak terdorong keluar */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col overflow-hidden">
          <div className="p-6 pt-2 space-y-5 overflow-y-auto custom-scrollbar" style={{ maxHeight: "calc(95vh - 160px)" }}>
            
            {/* Monitor Type Selection */}
            <div className="space-y-2">
              <Label className="block text-[10px] font-black tracking-widest uppercase text-slate-400">
                Monitor Type
              </Label>
              <div className="grid grid-cols-3 gap-1.5 p-1 border border-slate-100 bg-slate-50 rounded-xl">
                {/* ... (button seleksi tipe tetap sama namun kurangi padding) */}
                {["http", "dns", "icmp"].map((type) => (
                   <button
                    key={type}
                    type="button"
                    onClick={() => setMonitorType(type)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg font-bold text-[10px] transition-all ${
                      monitorType === type
                        ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {/* Icon mapping sesuai tipe */}
                    {type === "http" && <Globe className="w-3 h-3" />}
                    {type === "dns" && <Network className="w-3 h-3" />}
                    {type === "icmp" && <Wifi className="w-3 h-3" />}
                    {type.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Inputs */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black tracking-widest uppercase text-slate-400">Name</Label>
                <Input
                  {...register("name", { required: true })}
                  className="h-11 px-4 bg-slate-50 border-slate-100 rounded-xl font-bold text-slate-700 text-sm focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black tracking-widest uppercase text-slate-400">URL to Monitor</Label>
                <Input
                  {...register("url", { required: true })}
                  className="h-11 px-4 bg-slate-50 border-slate-100 rounded-xl font-bold text-slate-700 text-sm focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black tracking-widest uppercase text-slate-400">Heartbeat (Sec)</Label>
                <Input
                  type="number"
                  {...register("heartbeat_sec", { required: true, min: 30 })}
                  className="h-11 px-4 bg-slate-50 border-slate-100 rounded-xl font-bold text-slate-700 text-sm focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black tracking-widest uppercase text-slate-400">Notification</Label>
                <div className="relative">
                  <select
                    {...register("notification_setting_id")}
                    className="w-full h-11 pl-4 pr-10 appearance-none bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-500 text-sm focus:bg-white focus:outline-none"
                  >
                    <option value="">Setup Notification</option>
                    {notificationSettings.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute w-4 h-4 right-3 top-3.5 text-slate-300 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-[10px] font-bold text-red-500 bg-red-50 p-2 rounded-lg italic flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {error}
              </p>
            )}

            {/* Info Badge */}
            <div className="flex flex-wrap gap-3 text-[9px] font-bold text-slate-300 uppercase italic">
              <span className="flex items-center gap-1"><Check className="w-2.5 h-2.5" /> Checked 1m ago</span>
              <span className="flex items-center gap-1"><Check className="w-2.5 h-2.5" /> Response tracked</span>
            </div>
          </div>

          {/* 4. Footer: Tetap di bawah (sticky) */}
          <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-12 rounded-xl border-2 border-slate-200 text-slate-500 font-black text-xs hover:bg-white"
            >
              <X className="w-3.5 h-3.5 mr-1" strokeWidth={3} /> Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 h-12 bg-blue-600 rounded-xl font-black text-xs hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-1"
            >
              {updateMutation.isPending ? (
                 <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5 mr-1" strokeWidth={3} />
                  Update
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditMonitorDialog;