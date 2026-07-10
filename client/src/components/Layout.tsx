import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Settings, 
  LogOut, 
  Menu,
  X,
  UtensilsCrossed
} from 'lucide-react';

export const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = user?.role === 'admin';
  
  const navItems = isAdmin 
    ? [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Reservations', path: '/admin/reservations', icon: CalendarDays },
        { name: 'Manage Tables', path: '/admin/tables', icon: Settings },
      ]
    : [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'My Reservations', path: '/reservations', icon: CalendarDays },
      ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-dark-800 border-r border-dark-700 h-screen sticky top-0">
        <div className="p-6 flex items-center space-x-3">
          <div className="bg-gradient-brand p-2 rounded-xl">
            <UtensilsCrossed className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">TableMate</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                             (item.path !== (isAdmin ? '/admin' : '/dashboard') && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-brand-500/10 text-brand-500 font-medium' 
                    : 'text-dark-400 hover:text-white hover:bg-dark-700/50'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-brand-500' : ''}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-dark-700">
          <div className="mb-4 px-4">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-dark-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-2 w-full text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header & Menu */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-dark-800/90 backdrop-blur-xl border-b border-dark-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
             <div className="bg-gradient-brand p-1.5 rounded-lg">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">TableMate</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-dark-400 hover:text-white p-2">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-dark-800 border-b border-dark-700 shadow-xl px-4 py-4 flex flex-col space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-dark-400 hover:text-white hover:bg-dark-700"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            ))}
            <button
              onClick={() => { logout(); closeMobileMenu(); }}
              className="flex items-center space-x-3 px-4 py-3 mt-4 text-red-400 hover:bg-red-500/10 rounded-xl w-full text-left"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen pt-[72px] md:pt-0 max-w-[100vw]">
        <div className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
