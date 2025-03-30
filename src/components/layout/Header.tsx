
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);
  
  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  
  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-200 ${scrolled ? 'bg-white shadow-md' : 'bg-white/90 backdrop-blur-sm border-b'}`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 z-10">
            <motion.div 
              className="flex h-9 w-9 items-center justify-center rounded-full bg-medical-primary text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-xl font-semibold">M</span>
            </motion.div>
            <motion.span 
              className="text-xl font-bold text-medical-primary"
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              Teethli
            </motion.span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <NavLink to="/" label="Home" />
            {currentUser ? (
              <>
                <NavLink to="/dashboard" label="Dashboard" />
                <NavLink to="/dashboard/patients" label="Patients" />
                <NavLink to="/dashboard/prescriptions" label="Prescriptions" />
              </>
            ) : (
              <>
                <NavLink to="/login" label="Login" />
                <NavLink to="/register" label="Register" />
              </>
            )}
          </nav>
          
          {currentUser && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="hidden md:flex"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          )}
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden z-10"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? 
              <X className="h-6 w-6 text-gray-700" /> : 
              <Menu className="h-6 w-6 text-gray-700" />
            }
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              <MobileNavLink to="/" label="Home" onClick={() => setIsOpen(false)} />
              {currentUser ? (
                <>
                  <MobileNavLink to="/dashboard" label="Dashboard" onClick={() => setIsOpen(false)} />
                  <MobileNavLink to="/dashboard/patients" label="Patients" onClick={() => setIsOpen(false)} />
                  <MobileNavLink to="/dashboard/prescriptions" label="Prescriptions" onClick={() => setIsOpen(false)} />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout}
                    className="w-full mt-4"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <MobileNavLink to="/login" label="Login" onClick={() => setIsOpen(false)} />
                  <MobileNavLink to="/register" label="Register" onClick={() => setIsOpen(false)} />
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const NavLink = ({ to, label }: { to: string; label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to || 
    (to !== '/' && location.pathname.startsWith(to));
    
  return (
    <Link 
      to={to} 
      className={`relative font-medium transition-colors hover:text-medical-primary
        ${isActive ? 'text-medical-primary' : 'text-gray-700'}`}
    >
      {label}
      {isActive && (
        <motion.div
          className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-medical-primary"
          layoutId="navbar-indicator"
          transition={{ type: 'spring', bounce: 0.25 }}
        />
      )}
    </Link>
  );
};

const MobileNavLink = ({ to, label, onClick }: { to: string; label: string; onClick: () => void }) => {
  const location = useLocation();
  const isActive = location.pathname === to || 
    (to !== '/' && location.pathname.startsWith(to));
    
  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={`block py-2 px-4 rounded-md transition-colors
        ${isActive ? 
          'bg-medical-primary/10 text-medical-primary font-medium' : 
          'text-gray-700 hover:bg-gray-100'}`}
    >
      {label}
    </Link>
  );
};

export default Header;