import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { Trash2, X, AlertTriangle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteMonitor } from '../service/ApiService';

const DeleteMonitorDialog = ({ open, onOpenChange, monitor }) => {
  const [error, setError] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const deleteMutation = useMutation({
    mutationFn: () => deleteMonitor(monitor?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
      onOpenChange(false);
      setError('');
      navigate('/dashboard'); 
    },
    onError: (error) => {
      setError(error.response?.data?.error || 'Failed to delete monitor');
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  if (!monitor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* UPDATE DI SINI: Mengubah max-w-sm menjadi max-w-[500px] w-full */}
      <DialogContent className="max-w-[500px] w-full p-8 border-none rounded-[2.5rem] shadow-2xl overflow-hidden bg-white">
        
        {/* Tombol Close */}
        <button 
          onClick={() => onOpenChange(false)}
          className="absolute right-6 top-6 text-slate-300 hover:text-slate-500 transition-colors z-10"
        >
          <X size={24} strokeWidth={2.5} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-[#FF4D15] p-1.5 rounded-lg shadow-lg shadow-red-100">
            <AlertTriangle className="text-white h-5 w-5" strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            Delete this monitor?
          </h2>
        </div>
        <p className="text-slate-400 text-sm font-bold mb-6">
          This action can't be undone.
        </p>

        {/* Ilustrasi Center */}
        <div className="flex justify-center mb-8 relative">
          <div className="relative w-48 h-36 flex items-center justify-center">
            <img 
              src="/Image2.png" 
              alt="Delete Illustration" 
              className="w-full h-full object-contain"
            />
            <div className="absolute bottom-2 right-6 w-12 h-12 flex items-center justify-center pointer-events-none transform translate-x-2">
              <img 
                src="/Image3.png" 
                alt="X Badge" 
                className="w-full h-full object-contain drop-shadow-xl"
              />
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-[#FFF1F0] rounded-2xl p-5 mb-6 border border-red-100/50">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">
            You're going to delete the monitor below:
          </p>
          <div className="space-y-1">
            <p className="text-slate-700 font-black text-sm">
              Name: <span className="text-slate-500 font-bold">{monitor.name}</span>
            </p>
            <p className="text-slate-700 font-black text-sm truncate">
              URL: <span className="text-slate-500 font-bold">{monitor.url}</span>
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-xl text-center">
            <p className="text-xs text-red-600 font-bold">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
            className="flex-1 border-2 border-slate-100 text-slate-400 py-6 rounded-full font-black text-xs hover:bg-slate-50 transition-all gap-2"
          >
            <X size={18} strokeWidth={3} /> Cancel
          </Button>
          
          <Button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="flex-1 bg-[#FF2D00] text-white py-6 rounded-full font-black text-xs shadow-xl shadow-red-200 hover:bg-red-700 transition-all gap-2 border-none"
          >
            {deleteMutation.isPending ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Trash2 size={18} strokeWidth={3} /> Delete
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteMonitorDialog;