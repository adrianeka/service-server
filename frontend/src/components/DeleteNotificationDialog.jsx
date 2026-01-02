import { AlertTriangle, Trash2, X } from "lucide-react";

export default function DeleteNotificationModal({ open, onClose, onDelete }) {
  if (!open) return null; // ⬅️ PENTING

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Delete Notification
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
            <div className="flex justify-center">
            <img src="/bell.png" className="w-[128px] rotate-[15deg]" />
            </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Are you sure you want to delete this notification?
          </h3>
          <p className="text-sm text-gray-600">
            You will stop receiving alerts for the selected monitor.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-center gap-4 p-6 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border rounded-full flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>

          <button
            onClick={onDelete}
            className="px-6 py-2.5 bg-red-600 text-white rounded-full flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
