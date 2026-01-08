// components/DeleteNotificationDialog.jsx
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";

export default function DeleteNotificationDialog({
  open,
  onClose,
  onDelete,
  isLoading = false,
}) {
  // Jika tidak open, jangan render apapun
  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity"
      // 1. Klik di area hitam (backdrop) akan menutup dialog
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white shadow-2xl rounded-xl animate-in fade-in zoom-in duration-200"
        // 2. Mencegah klik di dalam kotak dialog menutup modal
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Delete Notification
            </h2>
          </div>

          {/* Tombol X di Header */}
          <button
            type="button"
            onClick={onClose} // ✅ Sudah ditambahkan di sini
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-24 h-24 bg-red-100 rounded-full">
              <img 
                src="/bell.png" 
                alt="alert"
                className="w-[128px] rotate-[15deg]"
                onError={(e) => e.target.style.display = 'none'}
              />
            </div>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Are you sure you want to delete this notification?
          </h3>
          <p className="text-sm text-gray-600">
            You will stop receiving alerts for monitors using this notification
            setting. This action cannot be undone.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-center gap-4 p-6 border-t bg-gray-50/50 rounded-b-xl">
          {/* Tombol Cancel */}
          <button
            type="button"
            onClick={onClose} // ✅ Sudah ditambahkan di sini
            disabled={isLoading}
            className="px-6 py-2.5 border border-gray-300 rounded-full flex items-center gap-2 hover:bg-white hover:shadow-sm disabled:opacity-50 transition-all text-sm font-medium text-gray-700 bg-white"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>

          {/* Tombol Delete */}
          <button
            type="button"
            onClick={onDelete}
            disabled={isLoading}
            className="px-6 py-2.5 bg-red-600 text-white rounded-full flex items-center gap-2 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-200 text-sm font-medium"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}