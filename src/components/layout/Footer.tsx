
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <motion.div 
              className="flex items-center space-x-2 mb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-medical-primary text-white">
                <span className="text-lg font-semibold">M</span>
              </div>
              <h3 className="text-lg font-bold text-medical-primary">Teethli</h3>
            </motion.div>
            <motion.p 
              className="text-sm text-gray-600"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              A professional platform for doctors to manage patients and generate
              AI-powered medical prescriptions.
            </motion.p>
          </div>
          
          <div>
            <motion.h3 
              className="text-lg font-bold text-medical-primary mb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Quick Links
            </motion.h3>
            <motion.ul 
              className="space-y-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <li>
                <Link to="/" className="text-sm text-gray-600 hover:text-medical-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-sm text-gray-600 hover:text-medical-primary transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-sm text-gray-600 hover:text-medical-primary transition-colors">
                  Register
                </Link>
              </li>
            </motion.ul>
          </div>
          
          <div>
            <motion.h3 
              className="text-lg font-bold text-medical-primary mb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Contact
            </motion.h3>
            <motion.ul 
              className="space-y-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <li className="text-sm text-gray-600">
                <span className="font-medium">Email:</span> tb123983@gmai.com
              </li>
              <li className="text-sm text-gray-600">
                <span className="font-medium">Phone:</span> +91 7407902174
              </li>
              <li className="text-sm text-gray-600">
                <span className="font-medium">Address:</span> Barasat, Healthcare City
              </li>
            </motion.ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-6 text-center">
          <motion.p 
            className="text-sm text-gray-500"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            &copy; {currentYear} Teethli. All rights reserved.
          </motion.p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
