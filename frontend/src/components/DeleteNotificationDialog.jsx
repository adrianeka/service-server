// components/DeleteNotificationDialog.jsx
import { AlertTriangle, Trash2, X, Loader2, Bell } from "lucide-react";

export default function DeleteNotificationDialog({
  open,
  onClose,
  onDelete,
  isLoading = false,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-xl">
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

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-24 h-24 bg-red-100 rounded-full">
              <img src="/bell.png" className="w-[128px] rotate-[15deg]" />
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
        <div className="flex justify-center gap-4 p-6 border-t">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2.5 border border-gray-300 rounded-full flex items-center gap-2 hover:bg-gray-50 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>

          <button
            onClick={onDelete}
            disabled={isLoading}
            className="px-6 py-2.5 bg-red-600 text-white rounded-full flex items-center gap-2 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
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