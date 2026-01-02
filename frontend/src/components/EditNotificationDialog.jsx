import { X, Bell } from 'lucide-react';
import { useState } from 'react';

export default function EditNotificationModal({ open, onClose, onSubmit }) {
  if (!open) return null;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    host: '',
    port: '587',
    security: 'None',
    fromEmail: '',
    toEmail: '',
    username: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  return (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-blue-600">Edit Notification</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-500">Configure notifications to receive alerts from your monitored websites.</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Notification name (e.g. API Server Alert)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description*
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Short description of this notification"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>

          {/* Server Configuration */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Server Configuration</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Host*
                </label>
                <input
                  type="text"
                  name="host"
                  value={formData.host}
                  onChange={handleChange}
                  placeholder="smtp.example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Port*
                </label>
                <input
                  type="text"
                  name="port"
                  value={formData.port}
                  onChange={handleChange}
                  placeholder="587"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Security*
              </label>
              <div className="relative">
                <select
                  name="security"
                  value={formData.security}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none bg-gray-50"
                >
                  <option>None</option>
                  <option>TLS</option>
                  <option>SSL</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs text-gray-600">👤</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Email Settings */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Email Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Email*
                </label>
                <input
                  type="email"
                  name="fromEmail"
                  value={formData.fromEmail}
                  onChange={handleChange}
                  placeholder="alerts@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Email*
                </label>
                <input
                  type="email"
                  name="toEmail"
                  value={formData.toEmail}
                  onChange={handleChange}
                  placeholder="recipient@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username*
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Email username or SMTP user"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password*
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="SMTP password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-400 rounded-lg hover:bg-gray-500 transition-colors"
          >
            + Add
          </button>
        </div>
      </div>
    </div>
  );
}
