import React from 'react';
import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const PageLoader: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isDark ? 'bg-nexsaas-vanta-black' : 'bg-nexsaas-pure-white'
      }`}
    >
      <div className="text-center">
        {/* Logo animé */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: 'easeInOut' 
          }}
          className="mb-6"
        >
          <div className="p-4 bg-nexsaas-deep-blue rounded-2xl mx-auto w-fit">
            <Building2 className="w-12 h-12 text-nexsaas-pure-white" />
          </div>
        </motion.div>

        {/* Spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className={`w-12 h-12 border-4 border-t-transparent rounded-full mx-auto mb-4 ${
            isDark ? 'border-nexsaas-saas-green' : 'border-nexsaas-deep-blue'
          }`}
        />

        {/* Texte de chargement */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className={`text-xl font-semibold mb-2 ${
            isDark ? 'text-nexsaas-pure-white' : 'text-nexsaas-deep-blue'
          }`}>
            NexSaaS
          </h3>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`text-sm ${
              isDark ? 'text-gray-300' : 'text-nexsaas-vanta-black'
            }`}
          >
            Chargement en cours...
          </motion.p>
        </motion.div>

        {/* Barre de progression */}
        <div className={`w-48 h-1 mx-auto mt-6 rounded-full overflow-hidden ${
          isDark ? 'bg-gray-800' : 'bg-nexsaas-light-gray'
        }`}>
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="h-full w-1/3 bg-nexsaas-saas-green rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default PageLoader;