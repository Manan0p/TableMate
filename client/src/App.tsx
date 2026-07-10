import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { Loader2 } from 'lucide-react';

// Pages - Auth
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';

// Pages - Customer
import CustomerDashboard from '@/pages/customer/Dashboard';
import CreateReservation from '@/pages/customer/CreateReservation';
import MyReservations from '@/pages/customer/MyReservations';

// Pages - Admin
import AdminDashboard from '@/pages/admin/Dashboard';
import ManageReservations from '@/pages/admin/ManageReservations';
import ManageTables from '@/pages/admin/ManageTables';

// Pages - Misc
import NotFound from '@/pages/NotFound';

// Wrapper to handle root redirect based on auth status
const RootRedirect = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/dashboard" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Customer Routes */}
      <Route element={<ProtectedRoute allowedRoles={['user']} />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/reservations" element={<MyReservations />} />
          <Route path="/reservations/new" element={<CreateReservation />} />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<Layout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/reservations" element={<ManageReservations />} />
          <Route path="/admin/tables" element={<ManageTables />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
