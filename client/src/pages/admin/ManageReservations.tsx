import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Modal from '@/components/Modal';
import { toast } from 'sonner';
import { 
  Search, 
  Filter, 
  Loader2, 
  MoreVertical,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  Users,
  PauseCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Reservation {
  _id: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  specialRequests?: string;
  customer: {
    name: string;
    email: string;
  };
  table: {
    tableNumber: number;
    capacity: number;
  };
}

const ManageReservations = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reservations', page, search, statusFilter, dateFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (dateFilter) params.append('date', dateFilter);

      const res = await api.get(`/admin/reservations?${params.toString()}`);
      return res.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data: { id: string, status: string }) => 
      api.put(`/admin/reservations/${data.id}`, { status: data.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Reservation status updated');
      setOpenDropdownId(null);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/reservations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Reservation cancelled successfully');
      setOpenDropdownId(null);
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed': return <span className="badge badge-success">Confirmed</span>;
      case 'pending': return <span className="badge badge-warning">Pending</span>;
      case 'cancelled': return <span className="badge badge-danger">Cancelled</span>;
      case 'completed': return <span className="badge badge-neutral">Completed</span>;
      default: return <span className="badge badge-neutral">{status}</span>;
    }
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    if (newStatus === 'cancelled') {
      if (window.confirm('Are you sure you want to cancel this reservation?')) {
        cancelMutation.mutate(id);
      }
    } else {
      updateStatusMutation.mutate({ id, status: newStatus });
    }
  };

  const viewDetails = (res: Reservation) => {
    setSelectedRes(res);
    setIsModalOpen(true);
    setOpenDropdownId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">All Reservations</h1>
          <p className="text-dark-400 mt-1">Manage and update all restaurant bookings.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card-glass p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input 
            type="text" 
            placeholder="Search by customer name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-48">
            <input 
              type="date" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="relative w-full md:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400 z-10" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field pl-10 appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card-glass overflow-visible">
        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-dark-800 border-b border-dark-700">
                  <th className="p-4 text-sm font-semibold text-dark-300">Customer</th>
                  <th className="p-4 text-sm font-semibold text-dark-300">Date & Time</th>
                  <th className="p-4 text-sm font-semibold text-dark-300">Details</th>
                  <th className="p-4 text-sm font-semibold text-dark-300">Status</th>
                  <th className="p-4 text-sm font-semibold text-dark-300 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {data?.data?.map((res: Reservation, index: number) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={res._id} 
                    className="hover:bg-dark-800/50 transition-colors"
                  >
                    <td className="p-4">
                      <p className="font-medium text-white">{res.customer.name}</p>
                      <p className="text-xs text-dark-400">{res.customer.email}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-white">{new Date(res.reservationDate).toLocaleDateString()}</p>
                      <p className="text-sm text-dark-400">{res.startTime} - {res.endTime}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-white">Table {res.table.tableNumber}</p>
                      <p className="text-sm text-dark-400">{res.guestCount} guests</p>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(res.status)}
                    </td>
                    <td className="p-4 text-right relative">
                      <button 
                        onClick={() => setOpenDropdownId(openDropdownId === res._id ? null : res._id)}
                        className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      <AnimatePresence>
                        {openDropdownId === res._id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setOpenDropdownId(null)}
                            />
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              className="absolute right-8 top-10 w-48 bg-dark-800 border border-dark-700 rounded-xl shadow-xl z-20 overflow-hidden"
                            >
                              <div className="py-1">
                                <button
                                  onClick={() => viewDetails(res)}
                                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-dark-700"
                                >
                                  View Details
                                </button>
                                {res.status !== 'completed' && res.status !== 'cancelled' && (
                                  <>
                                    {res.status === 'confirmed' && (
                                      <button
                                        onClick={() => handleStatusChange(res._id, 'pending')}
                                        className="w-full text-left px-4 py-2 text-sm text-amber-400 hover:bg-dark-700 flex items-center"
                                      >
                                        <PauseCircle className="w-4 h-4 mr-2" /> Put on Hold
                                      </button>
                                    )}
                                    {res.status === 'pending' && (
                                      <button
                                        onClick={() => handleStatusChange(res._id, 'confirmed')}
                                        className="w-full text-left px-4 py-2 text-sm text-emerald-400 hover:bg-dark-700 flex items-center"
                                      >
                                        <CheckCircle className="w-4 h-4 mr-2" /> Confirm Booking
                                      </button>
                                    )}
                                    {res.status === 'confirmed' && (
                                      <button
                                        onClick={() => handleStatusChange(res._id, 'completed')}
                                        className="w-full text-left px-4 py-2 text-sm text-emerald-400 hover:bg-dark-700 flex items-center"
                                      >
                                        <CheckCircle className="w-4 h-4 mr-2" /> Mark Completed
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleStatusChange(res._id, 'cancelled')}
                                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-dark-700 flex items-center"
                                    >
                                      <XCircle className="w-4 h-4 mr-2" /> Cancel Booking
                                    </button>
                                  </>
                                )}
                              </div>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </td>
                  </motion.tr>
                ))}
                {data?.data?.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-dark-400">
                      No reservations found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination */}
        {data?.meta && data.meta.totalPages > 1 && (
          <div className="p-4 border-t border-dark-700 flex justify-between items-center bg-dark-800">
            <span className="text-sm text-dark-400">
              Page {data.meta.page} of {data.meta.totalPages}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-outline py-1 px-3 text-sm"
              >
                Previous
              </button>
              <button 
                onClick={() => setPage(p => Math.min(data.meta.totalPages, p + 1))}
                disabled={page === data.meta.totalPages}
                className="btn-outline py-1 px-3 text-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Reservation Details"
      >
        {selectedRes && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-dark-700 pb-4">
              <div>
                <h4 className="text-lg font-bold text-white">{selectedRes.customer.name}</h4>
                <p className="text-dark-400 text-sm">{selectedRes.customer.email}</p>
              </div>
              <div>{getStatusBadge(selectedRes.status)}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-700/30 p-3 rounded-xl border border-dark-700">
                <div className="flex items-center text-dark-400 text-sm mb-1">
                  <Calendar className="w-4 h-4 mr-2 text-brand-500" /> Date
                </div>
                <p className="text-white font-medium">{new Date(selectedRes.reservationDate).toLocaleDateString()}</p>
              </div>
              <div className="bg-dark-700/30 p-3 rounded-xl border border-dark-700">
                <div className="flex items-center text-dark-400 text-sm mb-1">
                  <Clock className="w-4 h-4 mr-2 text-brand-500" /> Time
                </div>
                <p className="text-white font-medium">{selectedRes.startTime} - {selectedRes.endTime}</p>
              </div>
              <div className="bg-dark-700/30 p-3 rounded-xl border border-dark-700">
                <div className="flex items-center text-dark-400 text-sm mb-1">
                  <Users className="w-4 h-4 mr-2 text-brand-500" /> Guests
                </div>
                <p className="text-white font-medium">{selectedRes.guestCount} people</p>
              </div>
              <div className="bg-dark-700/30 p-3 rounded-xl border border-dark-700">
                <div className="flex items-center text-dark-400 text-sm mb-1">
                  <div className="w-4 h-4 mr-2 text-brand-500 flex items-center justify-center border border-brand-500 rounded-sm text-[10px]">#</div> 
                  Table
                </div>
                <p className="text-white font-medium">Table {selectedRes.table.tableNumber} (Cap: {selectedRes.table.capacity})</p>
              </div>
            </div>

            {selectedRes.specialRequests && (
              <div className="bg-dark-700/30 p-4 rounded-xl border border-dark-700">
                <p className="text-sm text-dark-400 mb-1">Special Requests</p>
                <p className="text-white italic">"{selectedRes.specialRequests}"</p>
              </div>
            )}
            
            <div className="flex justify-end pt-4">
              <button onClick={() => setIsModalOpen(false)} className="btn-primary">Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageReservations;
