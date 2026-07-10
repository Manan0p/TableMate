import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { 
  Calendar, 
  Clock, 
  Users, 
  XCircle,
  Loader2,
  UtensilsCrossed
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Reservation {
  _id: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  table: {
    tableNumber: number;
  };
}

const MyReservations = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['my-reservations', page, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (statusFilter) params.append('status', statusFilter);

      const res = await api.get(`/reservations?${params.toString()}`);
      return res.data;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/reservations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-reservation'] });
      toast.success('Reservation cancelled successfully');
    },
  });

  const handleCancel = (id: string) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      cancelMutation.mutate(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'pending': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'cancelled': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'completed': return 'text-dark-300 bg-dark-700/50 border-dark-600';
      default: return 'text-dark-300 bg-dark-700/50 border-dark-600';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">My Reservations</h1>
          <p className="text-dark-400 mt-1">View and manage your dining history.</p>
        </div>
        
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field max-w-xs"
        >
          <option value="">All Reservations</option>
          <option value="confirmed">Upcoming</option>
          <option value="completed">Past (Completed)</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {data?.data?.map((res: Reservation, index: number) => {
            const isPast = new Date(res.reservationDate) < new Date(new Date().setHours(0,0,0,0));
            const canCancel = !isPast && (res.status === 'confirmed' || res.status === 'pending');
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={res._id}
                className="card-glass p-6 hover:bg-dark-800/90 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-dark-700 p-4 rounded-2xl hidden sm:block">
                      <UtensilsCrossed className="w-6 h-6 text-brand-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-white">TableMate Restaurant</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(res.status)}`}>
                          {res.status.charAt(0).toUpperCase() + res.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center text-sm text-dark-300 gap-y-2 gap-x-4">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-dark-400" />
                          {new Date(res.reservationDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-dark-400" />
                          {res.startTime}
                        </span>
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1 text-dark-400" />
                          {res.guestCount} guests
                        </span>
                        <span className="flex items-center font-medium text-white">
                          Table {res.table.tableNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {canCancel && (
                    <div className="flex justify-end border-t border-dark-700 md:border-0 pt-4 md:pt-0">
                      <button 
                        onClick={() => handleCancel(res._id)}
                        disabled={cancelMutation.isPending}
                        className="btn-danger flex items-center"
                      >
                        {cancelMutation.isPending && cancelMutation.variables === res._id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4 mr-2" />
                        )}
                        Cancel Booking
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
          
          {data?.data?.length === 0 && (
            <div className="card-glass p-12 text-center border-dashed border-2 border-dark-600 bg-dark-800/30">
              <Calendar className="w-12 h-12 text-dark-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No reservations found</h3>
              <p className="text-dark-400">You don't have any reservations matching these criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-4">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-outline"
          >
            Previous
          </button>
          <span className="text-sm text-dark-400">
            Page {data.meta.page} of {data.meta.totalPages}
          </span>
          <button 
            onClick={() => setPage(p => Math.min(data.meta.totalPages, p + 1))}
            disabled={page === data.meta.totalPages}
            className="btn-outline"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default MyReservations;
