import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-20"></div>
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center z-10"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-dark-800 p-4 rounded-full border border-dark-700">
            <AlertCircle className="w-16 h-16 text-brand-500" />
          </div>
        </div>
        
        <h1 className="text-6xl font-extrabold text-white tracking-tight mb-2">404</h1>
        <h2 className="text-2xl font-bold text-dark-300 mb-6">Page not found</h2>
        <p className="text-dark-400 mb-8 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
        
        <Link to="/" className="inline-flex btn-primary items-center px-6">
          <Home className="w-5 h-5 mr-2" />
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
