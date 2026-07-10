import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { 
  Calendar, 
  Clock, 
  Users, 
  MessageSquare,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const today = new Date();
today.setHours(0, 0, 0, 0);

const reservationSchema = z.object({
  reservationDate: z.string().min(1, 'Date is required').refine(val => {
    const date = new Date(val);
    date.setHours(0, 0, 0, 0);
    return date >= today;
  }, 'Cannot reserve in the past'),
  startTime: z.string().min(1, 'Start time is required').regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'),
  endTime: z.string().min(1, 'End time is required').regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'),
  guestCount: z.coerce.number().min(1, 'At least 1 guest required').max(50, 'Max 50 guests'),
  specialRequests: z.string().max(500, 'Requests too long').optional(),
}).refine(data => {
  if (data.startTime && data.endTime) {
    return data.endTime > data.startTime;
  }
  return true;
}, {
  message: 'End time must be after start time',
  path: ['endTime']
});

type ReservationForm = z.infer<typeof reservationSchema>;

const CreateReservation = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ReservationForm>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      guestCount: 2,
    }
  });

  // Helper to auto-set end time to 2 hours after start time (common dining duration)
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const start = e.target.value;
    setValue('startTime', start, { shouldValidate: true });
    
    if (start) {
      const [hours, minutes] = start.split(':').map(Number);
      const endHours = (hours + 2).toString().padStart(2, '0');
      if (parseInt(endHours) < 24) {
        setValue('endTime', `${endHours}:${minutes.toString().padStart(2, '0')}`, { shouldValidate: true });
      }
    }
  };

  const createMutation = useMutation({
    mutationFn: (data: ReservationForm) => api.post('/reservations', data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['upcoming-reservation'] });
      queryClient.invalidateQueries({ queryKey: ['my-reservations'] });
      
      const tableInfo = res.data.data.reservation.table.tableNumber;
      toast.success(`Reservation confirmed! You've been assigned Table ${tableInfo}.`);
      
      navigate('/dashboard');
    },
    onError: (error: any) => {
      // If 409 Conflict (no tables), the global interceptor will catch it, but we can also display a specific message
      if (error.response?.status === 409) {
        toast.error('No tables are available for the selected time and party size. Please try a different time or date.', { duration: 5000 });
      }
    }
  });

  const onSubmit = (data: ReservationForm) => {
    createMutation.mutate(data);
  };

  // Generate time slots (17:00 to 22:00 every 30 mins)
  const timeSlots = [];
  for (let h = 17; h <= 22; h++) {
    timeSlots.push(`${h.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${h.toString().padStart(2, '0')}:30`);
  }
  const endSlots = [];
  for (let h = 18; h <= 23; h++) {
    endSlots.push(`${h.toString().padStart(2, '0')}:00`);
    endSlots.push(`${h.toString().padStart(2, '0')}:30`);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white">Book a Table</h1>
        <p className="text-dark-400 mt-1">Select your date and time. We'll automatically find the best table for your party.</p>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="card-glass p-6 md:p-8"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Date */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-dark-300">
                <Calendar className="w-4 h-4 mr-2 text-brand-500" /> Date
              </label>
              <input
                {...register('reservationDate')}
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className={`input-field ${errors.reservationDate ? 'border-red-500/50' : ''}`}
              />
              {errors.reservationDate && <p className="text-sm text-red-400">{errors.reservationDate.message}</p>}
            </div>

            {/* Guests */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-dark-300">
                <Users className="w-4 h-4 mr-2 text-brand-500" /> Number of Guests
              </label>
              <input
                {...register('guestCount')}
                type="number"
                min="1"
                max="50"
                className={`input-field ${errors.guestCount ? 'border-red-500/50' : ''}`}
              />
              {errors.guestCount && <p className="text-sm text-red-400">{errors.guestCount.message}</p>}
            </div>

            {/* Start Time */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-dark-300">
                <Clock className="w-4 h-4 mr-2 text-brand-500" /> Start Time
              </label>
              <select
                {...register('startTime')}
                onChange={handleStartTimeChange}
                className={`input-field appearance-none ${errors.startTime ? 'border-red-500/50' : ''}`}
              >
                <option value="">Select time...</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
              {errors.startTime && <p className="text-sm text-red-400">{errors.startTime.message}</p>}
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-dark-300">
                <Clock className="w-4 h-4 mr-2 text-dark-500" /> End Time
              </label>
              <select
                {...register('endTime')}
                className={`input-field appearance-none ${errors.endTime ? 'border-red-500/50' : ''}`}
              >
                <option value="">Select end time...</option>
                {endSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
              <p className="text-xs text-dark-400">Default dining time is 2 hours.</p>
              {errors.endTime && <p className="text-sm text-red-400">{errors.endTime.message}</p>}
            </div>
          </div>

          {/* Special Requests */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-dark-300">
              <MessageSquare className="w-4 h-4 mr-2 text-brand-500" /> Special Requests (Optional)
            </label>
            <textarea
              {...register('specialRequests')}
              rows={4}
              placeholder="Allergies, high chair needed, anniversary celebration..."
              className={`input-field resize-none ${errors.specialRequests ? 'border-red-500/50' : ''}`}
            ></textarea>
            {errors.specialRequests && <p className="text-sm text-red-400">{errors.specialRequests.message}</p>}
          </div>

          <div className="pt-6 border-t border-dark-700 flex justify-end">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="btn-primary w-full md:w-auto px-8 py-3 flex justify-center items-center text-lg"
            >
              {createMutation.isPending ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Confirm Booking
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateReservation;
