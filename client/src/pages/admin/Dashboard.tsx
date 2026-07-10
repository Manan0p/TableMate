import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  Users, 
  CalendarDays, 
  CalendarX2, 
  TrendingUp,
  Loader2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { motion } from 'framer-motion';

interface DashboardStats {
  total: number;
  today: number;
  cancelled: number;
  upcoming: number;
  activeTables: number;
  chartData: {
    _id: string; // Date string
    count: number;
  }[];
}

const StatCard = ({ title, value, icon: Icon, color, delay }: { title: string, value: string | number, icon: any, color: string, delay: number }) => (
  <motion.div 
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay }}
    className="card-glass p-6"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-dark-400">{title}</p>
        <p className="text-3xl font-bold text-white mt-2">{value}</p>
      </div>
      <div className={`p-4 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </motion.div>
);

const AdminDashboard = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.get('/admin/dashboard');
      return res.data.data.stats as DashboardStats;
    },
  });

  if (isLoading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return <div className="text-red-400">Failed to load dashboard statistics.</div>;
  }

  // Format chart data
  const formattedChartData = data.chartData.map(item => ({
    date: new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    reservations: item.count,
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-dark-400 mt-1">Welcome back. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Today's Reservations" 
          value={data.today} 
          icon={CalendarDays} 
          color="bg-brand-500" 
          delay={0.1}
        />
        <StatCard 
          title="Upcoming" 
          value={data.upcoming} 
          icon={TrendingUp} 
          color="bg-emerald-500" 
          delay={0.2}
        />
        <StatCard 
          title="Total Reservations" 
          value={data.total} 
          icon={Users} 
          color="bg-blue-500" 
          delay={0.3}
        />
        <StatCard 
          title="Cancelled" 
          value={data.cancelled} 
          icon={CalendarX2} 
          color="bg-red-500" 
          delay={0.4}
        />
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="card-glass p-6"
      >
        <h2 className="text-xl font-bold text-white mb-6">Reservation Trends (Last 7 Days)</h2>
        <div className="h-[400px] w-full">
          {formattedChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReservations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e8562a" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#e8562a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2c2c3e" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#71717a" 
                  tick={{ fill: '#71717a' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#71717a" 
                  tick={{ fill: '#71717a' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a24', border: '1px solid #2c2c3e', borderRadius: '12px' }}
                  itemStyle={{ color: '#e8562a' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="reservations" 
                  stroke="#e8562a" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorReservations)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-dark-400">
              No reservation data available for the last 7 days.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
