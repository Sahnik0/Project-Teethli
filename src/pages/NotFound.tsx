
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 py-20">
      <motion.div 
        className="text-center max-w-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1 
          className="text-8xl font-bold text-medical-primary mb-4"
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
        >
          404
        </motion.h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          We couldn't find the page you're looking for. The page might have been moved,
          deleted, or never existed.
        </p>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button asChild className="bg-medical-primary hover:bg-medical-secondary px-8 py-6 text-lg">
            <Link to="/">Return Home</Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;