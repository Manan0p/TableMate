import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { UtensilsCrossed, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const autofillCustomer = () => {
    setValue('email', 'customer@example.com', { shouldValidate: true });
    setValue('password', 'password123', { shouldValidate: true });
  };

  const autofillAdmin = () => {
    setValue('email', 'admin@example.com', { shouldValidate: true });
    setValue('password', 'password123', { shouldValidate: true });
  };

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      const res = await api.post('/auth/login', data);
      
      login(res.data.data.token, res.data.data.user);
      
      const from = location.state?.from?.pathname || 
                  (res.data.data.user.role === 'admin' ? '/admin' : '/dashboard');
      navigate(from, { replace: true });
    } catch (error) {
      // Error is handled by global interceptor (toast)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-brand-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-slow"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex justify-center"
        >
          <div className="bg-gradient-brand p-3 rounded-2xl shadow-brand-lg">
            <UtensilsCrossed className="w-10 h-10 text-pure-white" />
          </div>
        </motion.div>
        <motion.h2 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight"
        >
          Welcome back
        </motion.h2>
        <motion.p 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-2 text-center text-sm text-dark-400"
        >
          Sign in to manage your reservations
        </motion.p>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10"
      >
        <div className="card-glass py-8 px-4 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Email address</label>
              <input
                {...register('email')}
                type="email"
                className={`input-field ${errors.email ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50' : ''}`}
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Password</label>
              <input
                {...register('password')}
                type="password"
                className={`input-field ${errors.password ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50' : ''}`}
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-2 text-sm text-red-400">{errors.password.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                onClick={autofillCustomer}
                className="btn-secondary text-xs py-2 px-3 text-center border-dashed"
              >
                Customer
              </button>
              <button
                type="button"
                onClick={autofillAdmin}
                className="btn-secondary text-xs py-2 px-3 text-center border-dashed"
              >
                Admin
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex justify-center py-3 text-base"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-dark-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-brand-500 hover:text-brand-400 transition-colors">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
