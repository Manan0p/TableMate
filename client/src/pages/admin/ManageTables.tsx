import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/lib/api';
import Modal from '@/components/Modal';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2,
  Table as TableIcon
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Table {
  _id: string;
  tableNumber: number;
  capacity: number;
  isActive: boolean;
}

const tableSchema = z.object({
  tableNumber: z.coerce.number().min(1, 'Table number must be at least 1'),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1').max(50, 'Capacity cannot exceed 50'),
  isActive: z.boolean().default(true),
});

type TableForm = z.infer<typeof tableSchema>;

const ManageTables = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TableForm>({
    resolver: zodResolver(tableSchema),
    defaultValues: {
      isActive: true,
    }
  });

  const { data: tables = [], isLoading } = useQuery({
    queryKey: ['tables', 'admin'],
    queryFn: async () => {
      const res = await api.get('/tables?includeInactive=true');
      return res.data.data.tables as Table[];
    },
  });

  const createMutation = useMutation({
    mutationFn: (newTable: TableForm) => api.post('/tables', newTable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Table created successfully');
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string, table: TableForm }) => api.put(`/tables/${data.id}`, data.table),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Table updated successfully');
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/tables/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Table deleted successfully');
    },
  });

  const openModal = (table?: Table) => {
    if (table) {
      setEditingTable(table);
      reset({
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        isActive: table.isActive,
      });
    } else {
      setEditingTable(null);
      reset({ isActive: true });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTable(null);
    reset();
  };

  const onSubmit = (data: TableForm) => {
    if (editingTable) {
      updateMutation.mutate({ id: editingTable._id, table: data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this table? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Manage Tables</h1>
          <p className="text-dark-400 mt-1">Add, edit, or remove restaurant tables.</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Add Table
        </button>
      </div>

      <div className="card-glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-800 border-b border-dark-700">
                <th className="p-4 text-sm font-semibold text-dark-300">Table #</th>
                <th className="p-4 text-sm font-semibold text-dark-300">Capacity</th>
                <th className="p-4 text-sm font-semibold text-dark-300">Status</th>
                <th className="p-4 text-sm font-semibold text-dark-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {tables.map((table, index) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={table._id} 
                  className="hover:bg-dark-800/50 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center text-white font-medium">
                      <TableIcon className="w-4 h-4 mr-2 text-brand-500" />
                      Table {table.tableNumber}
                    </div>
                  </td>
                  <td className="p-4 text-dark-300">{table.capacity} guests</td>
                  <td className="p-4">
                    <span className={`badge ${table.isActive ? 'badge-success' : 'badge-neutral'}`}>
                      {table.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 flex justify-end gap-2">
                    <button 
                      onClick={() => openModal(table)}
                      className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                      title="Edit Table"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(table._id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete Table"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
              {tables.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-dark-400">
                    No tables found. Add your first table to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingTable ? 'Edit Table' : 'Add New Table'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Table Number</label>
            <input
              {...register('tableNumber')}
              type="number"
              className={`input-field ${errors.tableNumber ? 'border-red-500/50 focus:border-red-500' : ''}`}
            />
            {errors.tableNumber && <p className="mt-1 text-sm text-red-400">{errors.tableNumber.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Capacity (Guests)</label>
            <input
              {...register('capacity')}
              type="number"
              className={`input-field ${errors.capacity ? 'border-red-500/50 focus:border-red-500' : ''}`}
            />
            {errors.capacity && <p className="mt-1 text-sm text-red-400">{errors.capacity.message}</p>}
          </div>

          <div className="flex items-center mt-4">
            <input
              {...register('isActive')}
              type="checkbox"
              id="isActive"
              className="w-4 h-4 rounded bg-dark-700 border-dark-600 text-brand-500 focus:ring-brand-500/50 focus:ring-offset-dark-800"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-white">
              Table is active and available for booking
            </label>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-dark-700">
            <button
              type="button"
              onClick={closeModal}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="btn-primary flex items-center min-w-[100px] justify-center"
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                editingTable ? 'Update' : 'Create'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageTables;
