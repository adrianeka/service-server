import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Loader2,
  MoreVertical,
  ArrowLeft,
  Edit3,
  Trash2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import Navbar from "../components/Navbar";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import AddNotificationDialog from "../components/AddNotificationDialog";
import EditNotificationDialog from "../components/EditNotificationDialog";
import DeleteNotificationDialog from "../components/DeleteNotificationDialog";
import {
  getNotificationSettings,
  deleteNotificationSetting,
} from "@/service/ApiService";

function NotificationPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dropdownRefs = useRef({});

  // State Management - Pindahkan semua ke dalam fungsi
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDropdownId, setShowDropdownId] = useState(null);
  
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  // Fetching Data
  const {
    data: notifications = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["notificationSettings"],
    queryFn: getNotificationSettings,
    refetchOnWindowFocus: false,
  });

  // Mutation logic
  const deleteMutation = useMutation({
    mutationFn: deleteNotificationSetting,
    onSuccess: () => {
      queryClient.invalidateQueries(["notificationSettings"]);
      handleDialogSuccess("Notification deleted successfully");
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      setErrorMessage(error.response?.data?.message || "Failed to delete notification");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    },
  });

  const handleEdit = (notification) => {
    setSelectedNotification(notification);
    setIsEditDialogOpen(true);
    setShowDropdownId(null);
  };

  const handleDelete = (notification) => {
    setSelectedNotification(notification);
    setIsDeleteDialogOpen(true);
    setShowDropdownId(null);
  };

  const handleDialogSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const toggleDropdown = (id, e) => {
    e.stopPropagation();
    setShowDropdownId(showDropdownId === id ? null : id);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      let isOutside = true;
      Object.values(dropdownRefs.current).forEach((ref) => {
        if (ref && ref.contains(event.target)) isOutside = false;
      });
      if (isOutside) setShowDropdownId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-[#F8FAFC]">
        <Navbar />
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20 overflow-x-hidden">
      <Navbar />

      <div className="max-w-7xl px-4 py-8 mx-auto md:px-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 mb-6 text-sm font-bold text-blue-500 transition-all hover:opacity-70"
        >
          <ArrowLeft size={18} strokeWidth={3} />
          Go to Dashboard
        </Link>

        {/* Banner Section */}
        <div className="relative h-48 md:h-56 bg-gradient-to-r from-blue-400 to-blue-500 rounded-[2.5rem] overflow-hidden shadow-lg shadow-blue-100 mb-12 flex items-center px-12">
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
            <div className="absolute w-[500px] h-[500px] border-[40px] border-white rounded-full -left-20 -bottom-40"></div>
            <div className="absolute w-80 h-80 border-[30px] border-white rounded-full right-10 -top-20"></div>
          </div>
          <h1 className="relative text-3xl font-black tracking-tight text-white md:text-5xl">
            Setting Notification
          </h1>
          {notifications.length > 0 && (
            <div className="absolute right-12 bottom-0 w-48 h-48 hidden md:block">
              <img src="/bell1.png" alt="Bell" className="object-contain w-full h-full drop-shadow-2xl" />
            </div>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
            <h2 className="text-2xl font-black text-slate-800 mb-2">Notifications Not Set Up</h2>
            <p className="text-slate-400 font-medium mb-8 max-w-md">Set up notifications to stay informed about your website status.</p>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-6 rounded-full font-black shadow-xl shadow-blue-200 h-auto gap-2"
            >
              <Plus size={20} strokeWidth={4} /> Set Up Notifications
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Your Channels</h2>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-full font-black shadow-lg shadow-blue-100 h-11 gap-2"
              >
                <Plus size={18} strokeWidth={3} /> Add Notification
              </Button>
            </div>

            <div className="flex flex-wrap gap-6">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className="bg-white border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-[1.5rem] flex-none relative"
                  style={{ width: '368px', height: '134px' }}
                >
                  <CardContent className="p-6 h-full flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-black text-slate-800 tracking-tight truncate flex-1 pr-2">
                        {notification.name}
                      </h3>
                      
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => toggleDropdown(notification.id, e)}
                          className="rounded-full hover:bg-slate-100 h-8 w-8 transition-colors"
                        >
                          <MoreVertical size={20} className="text-slate-400" />
                        </Button>

                        {showDropdownId === notification.id && (
                          <div
                            ref={(el) => (dropdownRefs.current[notification.id] = el)}
                            className="absolute right-0 mt-1 w-32 bg-white border border-slate-100 rounded-xl shadow-2xl z-[100] py-1 animate-in zoom-in-95 duration-200"
                          >
                            <button
                              onClick={() => handleEdit(notification)}
                              className="flex items-center w-full px-3 py-1.5 text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition-colors gap-2"
                            >
                              <Edit3 size={14} className="text-orange-400" strokeWidth={2.5} /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(notification)}
                              className="flex items-center w-full px-3 py-1.5 text-[12px] font-bold text-red-500 hover:bg-red-50 transition-colors gap-2 border-t border-slate-50"
                            >
                              <Trash2 size={14} className="text-red-500" strokeWidth={2.5} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-xs font-medium text-slate-400 leading-relaxed line-clamp-2 pr-4">
                      {notification.description || "Notification channel for heartbeat monitoring alerts."}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <AddNotificationDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onSuccess={() => refetch()} />
      <EditNotificationDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} notification={selectedNotification} onSuccess={() => refetch()} />
      <DeleteNotificationDialog 
         open={isDeleteDialogOpen} 
         onOpenChange={setIsDeleteDialogOpen} 
         notification={selectedNotification} 
         onDelete={() => deleteMutation.mutate(selectedNotification.id)} 
         isLoading={deleteMutation.isPending} 
      />

      {(showSuccess || showError) && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-3 px-8 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-bottom-10 duration-500 ${showSuccess ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
          {showSuccess ? <CheckCircle size={20} strokeWidth={3} /> : <AlertCircle size={20} strokeWidth={3} />}
          <span className="text-sm font-black tracking-tight">{successMessage || errorMessage}</span>
        </div>
      )}
    </div>
  );
}

export default NotificationPage;