import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Home, 
  Search, 
  ArrowLeft, 
  Compass,
  MapPin,
  RefreshCw
} from 'lucide-react';
import Button from '../components/UI/Button';
import { useTheme } from '../contexts/ThemeContext';

const NotFoundPage: React.FC = () => {
  const { isDark } = useTheme();

  const floatingElements = [
    { icon: Search, delay: 0, x: 100, y: 50 },
    { icon: Compass, delay: 0.5, x: -80, y: 100 },
    { icon: MapPin, delay: 1, x: 120, y: -60 },
    { icon: RefreshCw, delay: 1.5, x: -100, y: -80 },
  ];

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-nexsaas-pure-white via-nexsaas-light-gray to-blue-50 dark:from-nexsaas-vanta-black dark:via-gray-900 dark:to-blue-950 flex items-center justify-center px-4 relative overflow-hidden">
      
      {/* Floating Background Elements */}
      {floatingElements.map((element, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: 0.1, 
            scale: 1,
            x: [0, element.x, 0],
            y: [0, element.y, 0],
            rotate: [0, 360]
          }}
          transition={{ 
            duration: 8,
            delay: element.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute"
          style={{
            left: `${20 + index * 20}%`,
            top: `${30 + index * 15}%`,
          }}
        >
          <element.icon className="w-16 h-16 text-nexsaas-deep-blue dark:text-nexsaas-saas-green" />
        </motion.div>
      ))}

      <div className="text-center max-w-2xl mx-auto relative z-10">
        {/* 404 Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <motion.h1 
            className="text-8xl md:text-9xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-4"
            animate={{ 
              textShadow: [
                "0 0 0px rgba(52, 199, 89, 0)",
                "0 0 20px rgba(52, 199, 89, 0.5)",
                "0 0 0px rgba(52, 199, 89, 0)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            404
          </motion.h1>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-4">
            Page introuvable
          </h2>
          <p className="text-lg text-nexsaas-vanta-black dark:text-gray-300 mb-8 max-w-lg mx-auto">
            Oups ! Il semblerait que cette page ait disparu dans l'espace numérique. 
            Ne vous inquiétez pas, nous allons vous ramener en sécurité.
          </p>
        </motion.div>

        {/* Animated Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mb-8"
        >
          <div className="relative w-64 h-64 mx-auto">
            {/* Planet */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full bg-gradient-to-br from-nexsaas-saas-green to-green-600 opacity-20"
            />
            
            {/* Orbiting Elements */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                <Search className="w-8 h-8 text-nexsaas-deep-blue dark:text-nexsaas-saas-green" />
              </div>
            </motion.div>
            
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="absolute bottom-0 right-0 transform translate-x-2 translate-y-2">
                <Compass className="w-6 h-6 text-nexsaas-deep-blue dark:text-nexsaas-saas-green" />
              </div>
            </motion.div>

            {/* Center Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-6 bg-nexsaas-deep-blue dark:bg-nexsaas-saas-green rounded-full"
              >
                <MapPin className="w-12 h-12 text-nexsaas-pure-white dark:text-nexsaas-vanta-black" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/">
            <Button size="lg" className="w-full sm:w-auto">
              <Home className="w-5 h-5 mr-2" />
              Retour à l'accueil
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Page précédente
          </Button>
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-12 p-6 bg-nexsaas-pure-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-nexsaas-light-gray dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
            Besoin d'aide pour naviguer ?
          </h3>
          <p className="text-nexsaas-vanta-black dark:text-gray-300 mb-4">
            Explorez nos fonctionnalités principales ou contactez notre équipe support.
          </p>
          
          <div className="flex flex-wrap gap-2 justify-center">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                Tableau de bord
              </Button>
            </Link>
            <Link to="/stocks">
              <Button variant="ghost" size="sm">
                Gestion stocks
              </Button>
            </Link>
            <Link to="/pos">
              <Button variant="ghost" size="sm">
                Point de vente
              </Button>
            </Link>
            <Button variant="ghost" size="sm">
              Support
            </Button>
          </div>
        </motion.div>

        {/* Fun Fact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.5 }}
          className="mt-8 text-sm text-nexsaas-vanta-black dark:text-gray-400"
        >
          💡 Le saviez-vous ? L'erreur 404 tire son nom du bureau 404 du CERN où était hébergé le premier serveur web !
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage;