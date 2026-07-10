import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  CalendarPlus, 
  ListOrdered, 
  UtensilsCrossed,
  Clock,
  MapPin,
  Phone
} from 'lucide-react';
import { motion } from 'framer-motion';

const CustomerDashboard = () => {
  const { user } = useAuth();

  // Fetch upcoming reservation
  const { data: upcoming } = useQuery({
    queryKey: ['upcoming-reservation'],
    queryFn: async () => {
      const res = await api.get('/reservations?status=confirmed&limit=1');
      return res.data.data?.[0];
    },
  });

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-dark-800 p-8 rounded-3xl border border-dark-700 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-500 rounded-full mix-blend-multiply filter blur-[80px] opacity-20"></div>
        
        <div className="z-10">
          <h1 className="text-4xl font-extrabold text-white mb-2">Welcome back, {user?.name.split(' ')[0]}!</h1>
          <p className="text-dark-400 text-lg">Ready for your next dining experience?</p>
        </div>
        
        <div className="z-10 w-full md:w-auto">
          <Link to="/reservations/new" className="w-full md:w-auto btn-primary flex items-center justify-center py-3 px-6 text-lg shadow-brand-lg">
            <CalendarPlus className="w-5 h-5 mr-2" />
            Book a Table
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-2xl font-bold text-white">Your Next Visit</h2>
          
          {upcoming ? (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="card-glass p-1 overflow-hidden"
            >
              <div className="bg-dark-800 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6">
                  <span className="badge badge-success px-3 py-1">Confirmed</span>
                </div>
                
                <div className="flex items-center space-x-4 mb-6">
                  <div className="bg-gradient-brand p-4 rounded-2xl shadow-brand-md">
                    <UtensilsCrossed className="w-8 h-8 text-pure-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">TableMate Restaurant</h3>
                    <p className="text-dark-400">Main Dining Room</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-6 border-t border-b border-dark-700 my-6">
                  <div>
                    <p className="text-sm text-dark-400 mb-1">Date</p>
                    <p className="text-white font-medium">{new Date(upcoming.reservationDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-dark-400 mb-1">Time</p>
                    <p className="text-white font-medium">{upcoming.startTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-dark-400 mb-1">Guests</p>
                    <p className="text-white font-medium">{upcoming.guestCount} People</p>
                  </div>
                  <div>
                    <p className="text-sm text-dark-400 mb-1">Table</p>
                    <p className="text-white font-medium">#{upcoming.table.tableNumber}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Link to="/reservations" className="btn-outline flex-1 text-center">Manage</Link>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="card-glass p-12 flex flex-col items-center justify-center text-center border-dashed border-2 border-dark-600 bg-dark-800/30">
              <div className="bg-dark-800 p-4 rounded-full mb-4">
                <CalendarPlus className="w-8 h-8 text-dark-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No upcoming reservations</h3>
              <p className="text-dark-400 mb-6 max-w-sm">You don't have any upcoming reservations. Book a table now to secure your spot.</p>
              <Link to="/reservations/new" className="btn-primary">Book Now</Link>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
          
          <div className="grid grid-cols-1 gap-4">
            <Link to="/reservations" className="card-glass p-4 flex items-center hover:bg-dark-700/50 transition-colors group cursor-pointer">
              <div className="bg-dark-700 p-3 rounded-xl group-hover:bg-brand-500/20 group-hover:text-brand-500 transition-colors">
                <ListOrdered className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="font-bold text-white">My History</h3>
                <p className="text-sm text-dark-400">View past reservations</p>
              </div>
            </Link>
          </div>

          <div className="card-glass p-6 mt-8">
            <h3 className="font-bold text-white mb-4">Restaurant Info</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-brand-500 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-sm text-dark-300">123 Culinary Avenue<br/>Food District, FD 10023</p>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-brand-500 mr-3 flex-shrink-0" />
                <p className="text-sm text-dark-300">Open Daily: 17:00 - 23:00</p>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-brand-500 mr-3 flex-shrink-0" />
                <p className="text-sm text-dark-300">+1 (555) 123-4567</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
