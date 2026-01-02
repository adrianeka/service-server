import { useState } from 'react';
import { Folder, HelpCircle, Edit, Plus, Trash2, Pencil } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { EmptyState } from '../components/ui/empty-state';

function Notification() {
  // Ganti [] dengan data dummy untuk menampilkan state dengan data
  // Gunakan [] untuk menampilkan empty state
  const [notifications] = useState([
    {
      id: 1,
      name: 'Notification Name',
      foundation: 'Foundation Name Field or Duplicate or Foundation',
      description: 'Notification Description'
    },
    {
      id: 2,
      name: 'Notification Name',
      foundation: 'Foundation Name Field or Duplicate or Foundation',
      description: 'Foundation Description'
    },
    {
      id: 3,
      name: 'Notification Name',
      foundation: 'Foundation Name Field or Duplicate or Foundation',
      description: 'Foundation Description'
    }
  ]);

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  // Fungsi untuk setup notifikasi
  const handleSetupNotification = () => {
    console.log('Setup notification clicked');
  };

  // Fungsi untuk edit notifikasi
  const handleEdit = (id) => {
    console.log('Edit notification:', id);
  };

  // Fungsi untuk delete notifikasi
  const handleDelete = (id) => {
    console.log('Delete notification:', id);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Navbar Placeholder - Ganti dengan komponen Navbar Anda */}
        <Navbar/>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-2xl font-bold mb-8">Setting Notification</h1>

            {notifications.length === 0 ? (
              <EmptyState
                title="Not Available"
                description={[
                  'Start setting up notifications to receive alerts about your',
                  'monitored websites.'
                ]}
                icon={() => (
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center relative">
                    <Folder className="w-[70px] h-[70px] text-blue-500" />
                    <HelpCircle className="w-[25px] h-[25px] text-blue-500 absolute" />
                  </div>
                )}
                action={(
                  <Button onClick={handleSetupNotification} className="rounded-full" size="default"   variant="default">
                    <Plus size={16} />
                    <span className="ml-2">Setup Notification</span>
                  </Button>
                )}
              />
            ) : (
              // Data State
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className="hover:shadow-md transition-shadow bg-[#FAFAFA]"
                  >
                    <CardContent className="relative p-4">
                      <div className="flex justify-between">
                        <div className="flex-1 pr-10">
                          <h1 className="font-bold text-xl">
                            {notification.name}
                          </h1>
                          <p className="text-xs text-gray-500 leading-tight">
                          </p>
                        </div>
                      </div>

                      {/* Button pojok kanan bawah */}
                      <div className="absolute bottom-3 right-3 flex gap-1">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleEdit(notification.id)}
                          aria-label="Edit"
                          className="h-7 w-7 bg-[#FFC04D]"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => handleDelete(notification.id)}
                          aria-label="Delete"
                          className="h-7 w-7"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      <p className="text-xs text-gray-400 mt-4 pr-10">
                        {notification.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      {showError && (
        <div className="fixed bottom-4 left-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <span className="text-sm">Di tahun ini tidak ada data yang bisa di tampilkan</span>
          <button
            onClick={() => setShowError(false)}
            className="text-white hover:text-gray-200"
          >
            ×
          </button>
        </div>
      )}

      {showSuccess && (
        <div className="fixed bottom-4 left-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <span className="text-sm">Notification created successfully</span>
          <button
            onClick={() => setShowSuccess(false)}
            className="text-white hover:text-gray-200"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default Notification;