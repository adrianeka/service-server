import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Plus, Globe, Type, Zap, X, Network, Server, Wifi } from 'lucide-react';
import { createMonitor } from '../service/ApiService';

const AddMonitorDialog = () => {
  const [open, setOpen] = useState(false);
  const [monitorType, setMonitorType] = useState('http');
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      url: ''
    }
  });

  const addMonitorMutation = useMutation({
    mutationFn: (data) => createMonitor({ ...data, type: monitorType }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
      setOpen(false);
      reset();
      setMonitorType('http');
    },
    onError: (error) => {
      console.error('Error adding monitor:', error);
    },
  });

  const onSubmit = (data) => {
    addMonitorMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="md:w-auto w-auto">
          <Button 
            className="md:size-auto md:gap-2 md:px-6 md:py-2 md:h- h-10 w-10 md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all flex items-center justify-center rounded-full"
          >
            <Plus className="h-5 w-5" />
            <span className="font-semibold hidden md:inline ml-2">Add Monitor</span>
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] gap-0 p-0 overflow-hidden rounded-lg shadow-lg border border-gray-200 bg-card">
        <div className="bg-[#1976d2] px-6 py-4 rounded-t-lg">
          <DialogHeader className="border-0">
            <DialogTitle className="text-lg text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-white" />
              Add Monitor
            </DialogTitle>
            <DialogDescription className="text-white/90 text-sm">
              Start monitoring your website's uptime and performance instantly
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-6 py-6 bg-card">
          <div className="space-y-3">
            <Label className="flex items-center gap-2 font-semibold">
              <Server className="h-4 w-4 text-primary" />
              Monitor Type
            </Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setMonitorType('http')}
                className={`flex-1 p-2 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                  monitorType === 'http'
                    ? 'border-primary bg-primary/10'
                    : 'border-muted hover:border-primary'
                }`}
              >
                <Globe className="h-4 w-4" />
                <span className="font-medium">HTTP/HTTPS</span>
              </button>
              <button
                type="button"
                onClick={() => setMonitorType('dns')}
                className={`flex-1 p-2 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                  monitorType === 'dns'
                    ? 'border-primary bg-primary/10'
                    : 'border-muted hover:border-primary'
                }`}
              >
                <Network className="h-4 w-4" />
                <span className="font-medium">DNS</span>
              </button>
              <button
                type="button"
                onClick={() => setMonitorType('icmp')}
                className={`flex-1 p-2 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                  monitorType === 'icmp'
                    ? 'border-primary bg-primary/10'
                    : 'border-muted hover:border-primary'
                }`}
              >
                <Wifi className="h-4 w-4" />
                <span className="font-medium">ICMP Ping</span>
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="name" className="flex items-center gap-2 font-semibold">
              Name
            </Label>
            <Input
              id="name"
              placeholder={monitorType === 'dns' ? 'My DNS Server' : monitorType === 'icmp' ? 'My Ping Monitor' : 'My API Server'}
              className="h-11 border-2 border-muted hover:border-primary transition-colors bg-card"
              {...register('name', { 
                required: 'Please give your monitor a name',
                minLength: {
                  value: 2,
                  message: 'Name should be at least 2 characters'
                }
              })}
            />
            {errors.name && (
              <p className="text-sm text-destructive font-medium">
                ⚠ {errors.name.message}
              </p>
            )}
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="url" className="flex items-center gap-2 font-semibold">
            {monitorType === 'dns' ? 'Domain to Monitor' : monitorType === 'icmp' ? 'Host to Ping' : 'URL to Monitor'}
            </Label>
            <Input
              id="url"
              type={monitorType === 'http' ? 'url' : 'text'}
              placeholder={monitorType === 'dns' ? 'example.com or https://example.com' : monitorType === 'icmp' ? '8.8.8.8 or example.com' : 'https://example.com'}
              className="h-11 border-2 border-muted hover:border-primary transition-colors font-mono text-sm bg-card"
              {...register('url', { 
                required: monitorType === 'dns' ? 'Enter the domain name you want to monitor' : monitorType === 'icmp' ? 'Enter the host or IP address to ping' : 'Enter the URL you want to monitor',
                pattern: monitorType === 'http' 
                  ? {
                      value: /^https?:\/\/.+\..+/,
                      message: 'Invalid URL - must start with http:// or https://'
                    }
                  : undefined
              })}
            />
            {errors.url && (
              <p className="text-sm text-destructive font-medium">
                ⚠ {errors.url.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="name" className="flex items-center gap-2 font-semibold">
              Heartbeat Interval (Check every 60 second)
            </Label>
            <Input
              id="name"
              placeholder={monitorType === 'dns' ? 'My DNS Server' : monitorType === 'icmp' ? 'My Ping Monitor' : 'My API Server'}
              className="h-11 border-2 border-muted hover:border-primary transition-colors bg-card"
              {...register('name', { 
                required: 'Please give your monitor a name',
                minLength: {
                  value: 2,
                  message: 'Name should be at least 2 characters'
                }
              })}
            />
            {errors.name && (
              <p className="text-sm text-destructive font-medium">
                ⚠ {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="name" className="flex items-center gap-2 font-semibold">
              Notification
            </Label>
            <select
              id="name"
              className="h-11 w-full border-2 border-muted hover:border-primary transition-colors px-3 bg-white"
              {...register('name', { 
                required: 'Please select a notification',
              })}
              defaultValue=""
            >
              <option value="" disabled>
                {monitorType === 'dns' ? 'Select DNS Server' : monitorType === 'icmp' ? 'Select Ping Monitor' : 'Select API Server'}
              </option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="webhook">Webhook</option>
            </select>
            {errors.name && (
              <p className="text-sm text-destructive font-medium">
                ⚠ {errors.name.message}
              </p>
            )}
          </div>
          <DialogFooter className="gap-3 pt-4 bg-white border-t border-gray-100">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setOpen(false);
                reset();
                setMonitorType('http');
              }}
              className="px-4 h-9 border-2 border-[#1976d2] text-[#1976d2] hover:bg-[#eaf4ff] transition-all rounded-md"
            >
              <X className="h-4 w-4 mr-2 text-[#1976d2]" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={addMonitorMutation.isPending}
              className="px-6 h-9 bg-[#1976d2] hover:bg-[#1565c0] shadow-md transition-all font-semibold text-white rounded-md"
            >
              {addMonitorMutation.isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Monitor
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMonitorDialog;