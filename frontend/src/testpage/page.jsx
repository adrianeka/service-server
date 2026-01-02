import { useState } from "react";
import Navbar from "../components/Navbar";
import NotificationModal from "@/components/AddNotificationDialog";
import EditNotificationModal from "../components/EditNotificationDialog";
import DeleteNotificationModal from "@/components/DeleteNotificationDialog";

export default function TestPage() {
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const handleAddSubmit = (data) => {
    console.log("Add Notification:", data);
  };

  const handleEditSubmit = (data) => {
    console.log("Edit Notification:", data);
  };

  const handleDeleteConfirm = () => {
    console.log("Delete Notification");
  };

  return (
    <>
      <Navbar />

      <div className="p-6 space-x-3">
        <button
          onClick={() => setOpenAdd(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          + Add Notification
        </button>

        <button
          onClick={() => setOpenEdit(true)}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg"
        >
          Edit Notification
        </button>

        <button
          onClick={() => setOpenDelete(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg"
        >
          Delete Notification
        </button>
      </div>

      {/* ADD */}
      <NotificationModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSubmit={handleAddSubmit}
      />

      {/* EDIT */}
      <EditNotificationModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        onSubmit={handleEditSubmit}
      />

      {/* DELETE */}
      <DeleteNotificationModal
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
