// components/AddNotificationDialog.jsx
import { useState, useEffect } from "react";
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
import {
  Plus,
  X,
  Bell,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNotificationSetting } from "@/service/ApiService";

const AddNotificationDialog = ({ open, onOpenChange, onSuccess }) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      host: "",
      port: 587,
      security: "tls",
      from_email: "",
      to_email: "",
      username: "",
      password: "",
    },
  });

  // Reset form saat dialog dibuka
  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const createMutation = useMutation({
    mutationFn: createNotificationSetting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificationSettings"] });
      onOpenChange(false);
      reset();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Failed to create notification");
    },
  });

  const onSubmit = (data) => {
    createMutation.mutate({
      ...data,
      port: parseInt(data.port),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Container Modal dengan Radius Besar */}
      <DialogContent className="max-w-4xl p-0 border-none rounded-[2rem] shadow-2xl overflow-hidden bg-white max-h-[95vh] flex flex-col">
        
        {/* Header Section */}
        <div className="p-8 pb-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <div className="p-2 text-blue-600 rounded-xl bg-blue-50">
                <Bell size={24} fill="currentColor" />
              </div>
              <DialogTitle className="text-2xl font-black tracking-tight text-slate-800">
                Add Notification
              </DialogTitle>
            </div>
            <button 
              onClick={() => onOpenChange(false)}
              className="p-2 transition-colors rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            >
              <X size={20} strokeWidth={3} />
            </button>
          </div>
          <DialogDescription className="text-sm font-medium text-slate-400">
            Configure notifications to receive alerts from your monitored websites.
          </DialogDescription>
        </div>

        {/* Form Body dengan Scroll Internal */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col overflow-hidden">
          <div className="flex-1 px-8 py-4 space-y-8 overflow-y-auto custom-scrollbar">
            
            {/* Section 1: Basic Information */}
            <div className="space-y-4">
              <h3 className="text-[13px] font-black text-slate-700 uppercase tracking-wider">Basic Information</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Name <span className="text-red-500">*</span></Label>
                  <Input
                    {...register("name", { required: "Required" })}
                    placeholder="Notification name (e.g. API Server Alert)"
                    className="h-12 px-5 bg-slate-50 border-slate-100 rounded-2xl font-bold text-slate-700 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description <span className="text-red-500">*</span></Label>
                  <Input
                    {...register("description", { required: "Required" })}
                    placeholder="Short description of this notification"
                    className="h-12 px-5 bg-slate-50 border-slate-100 rounded-2xl font-bold text-slate-700 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Server Configuration */}
            <div className="space-y-4">
              <h3 className="text-[13px] font-black text-slate-700 uppercase tracking-wider">Server Configuration</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Host <span className="text-red-500">*</span></Label>
                  <Input
                    {...register("host", { required: "Required" })}
                    placeholder="smtp.example.com"
                    className="h-12 px-5 bg-slate-50 border-slate-100 rounded-2xl font-bold text-slate-700 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Port <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    {...register("port", { required: "Required" })}
                    placeholder="587"
                    className="h-12 px-5 bg-slate-50 border-slate-100 rounded-2xl font-bold text-slate-700 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <select
                      {...register("security")}
                      className="w-full h-12 px-5 font-bold transition-all border outline-none appearance-none bg-slate-50 border-slate-100 rounded-2xl text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                    >
                      <option value="tls">TLS</option>
                      <option value="ssl">SSL</option>
                      <option value="none">None</option>
                    </select>
                    <ChevronDown className="absolute w-5 h-5 pointer-events-none right-5 top-3.5 text-slate-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Email Settings */}
            <div className="space-y-4">
              <h3 className="text-[13px] font-black text-slate-700 uppercase tracking-wider">Email Settings</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">From Email <span className="text-red-500">*</span></Label>
                  <Input
                    type="email"
                    {...register("from_email", { required: "Required" })}
                    placeholder="alerts@example.com"
                    className="h-12 px-5 bg-slate-50 border-slate-100 rounded-2xl font-bold text-slate-700 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">To Email <span className="text-red-500">*</span></Label>
                  <Input
                    type="email"
                    {...register("to_email", { required: "Required" })}
                    placeholder="recipient@example.com"
                    className="h-12 px-5 bg-slate-50 border-slate-100 rounded-2xl font-bold text-slate-700 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username <span className="text-red-500">*</span></Label>
                  <Input
                    {...register("username", { required: "Required" })}
                    placeholder="Email username or SMTP user"
                    className="h-12 px-5 bg-slate-50 border-slate-100 rounded-2xl font-bold text-slate-700 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password <span className="text-red-500">*</span></Label>
                  <Input
                    type="password"
                    {...register("password", { required: "Required" })}
                    placeholder="Enter password"
                    className="h-12 px-5 bg-slate-50 border-slate-100 rounded-2xl font-bold text-slate-700 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer: Action Buttons */}
          <div className="flex justify-end gap-4 p-8 border-t border-slate-50 bg-slate-50/30">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-10 h-12 rounded-full border-2 border-blue-500 text-blue-500 font-black text-xs hover:bg-blue-50 transition-all flex items-center gap-2"
            >
              <X size={16} strokeWidth={3} /> Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || !isValid}
              className={`px-10 h-12 rounded-full font-black text-xs text-white shadow-xl transition-all flex items-center gap-2 ${
                createMutation.isPending || !isValid 
                  ? "bg-slate-300 shadow-slate-100 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"
              }`}
            >
              {createMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent" />
              ) : (
                <Plus size={16} strokeWidth={3} />
              )}
              {createMutation.isPending ? "Adding..." : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddNotificationDialog;