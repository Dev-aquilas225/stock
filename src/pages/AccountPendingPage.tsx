import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  Mail, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  MessageCircle,
  User,
  Shield,
  ArrowLeft
} from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const AccountPendingPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const steps = [
    {
      id: 1,
      title: 'Inscription effectuée',
      description: 'Votre compte a été créé avec succès',
      status: 'completed',
      icon: CheckCircle,
    },
    {
      id: 2,
      title: 'Vérification des documents',
      description: 'Nos équipes vérifient vos informations',
      status: 'in_progress',
      icon: Shield,
    },
    {
      id: 3,
      title: 'Activation du compte',
      description: 'Accès complet à toutes les fonctionnalités',
      status: 'pending',
      icon: User,
    },
  ];

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'in_progress': return 'text-yellow-500';
      case 'pending': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStepBg = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 dark:bg-green-900/20';
      case 'in_progress': return 'bg-yellow-100 dark:bg-yellow-900/20';
      case 'pending': return 'bg-gray-100 dark:bg-gray-900/20';
      default: return 'bg-gray-100 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-nexsaas-pure-white to-nexsaas-light-gray dark:from-nexsaas-vanta-black dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: 'easeInOut' 
            }}
            className="p-4 bg-yellow-500/10 rounded-full inline-block mb-6"
          >
            <Clock className="w-16 h-16 text-yellow-500" />
          </motion.div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-4">
            Compte en attente d'activation
          </h1>
          <p className="text-lg text-nexsaas-vanta-black dark:text-gray-300 max-w-2xl mx-auto">
            Bonjour {user?.nom}, votre compte est en cours de vérification par nos équipes.
          </p>
        </motion.div>

        {/* Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="mr-4"
                >
                  <RefreshCw className="w-6 h-6 text-yellow-600" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-400">
                    Vérification en cours
                  </h3>
                  <p className="text-yellow-700 dark:text-yellow-300">
                    Temps d'attente estimé : 24-48 heures • En attente depuis : {formatTime(timeElapsed)}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <Card>
            <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-6">
              Processus d'activation
            </h2>
            
            <div className="space-y-6">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                  className="flex items-center"
                >
                  <div className={`p-3 rounded-full ${getStepBg(step.status)} mr-4`}>
                    <step.icon className={`w-6 h-6 ${getStepColor(step.status)}`} />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                      {step.title}
                    </h3>
                    <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                      {step.description}
                    </p>
                  </div>
                  
                  {step.status === 'in_progress' && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-3 h-3 bg-yellow-500 rounded-full"
                    />
                  )}
                  
                  {step.status === 'completed' && (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  )}
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Information Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          <Card>
            <div className="flex items-center mb-4">
              <Mail className="w-6 h-6 text-nexsaas-deep-blue mr-3" />
              <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                Notification par email
              </h3>
            </div>
            <p className="text-nexsaas-vanta-black dark:text-gray-300 mb-4">
              Vous recevrez un email de confirmation dès que votre compte sera activé.
            </p>
            <div className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              <strong>Email :</strong> {user?.email}
            </div>
          </Card>

          <Card>
            <div className="flex items-center mb-4">
              <MessageCircle className="w-6 h-6 text-nexsaas-saas-green mr-3" />
              <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                Support disponible
              </h3>
            </div>
            <p className="text-nexsaas-vanta-black dark:text-gray-300 mb-4">
              Notre équipe support est disponible pour répondre à vos questions.
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Contacter le support
            </Button>
          </Card>
        </motion.div>

        {/* What's Next */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-nexsaas-deep-blue/5 to-nexsaas-saas-green/5 dark:from-nexsaas-deep-blue/10 dark:to-nexsaas-saas-green/10">
            <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-4">
              Que se passe-t-il ensuite ?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                  Une fois activé, vous pourrez :
                </h3>
                <ul className="text-sm text-nexsaas-vanta-black dark:text-gray-300 space-y-1">
                  <li>• Accéder à tous les modules ERP</li>
                  <li>• Gérer vos stocks et approvisionnements</li>
                  <li>• Utiliser le point de vente</li>
                  <li>• Configurer votre réseau d'affiliés</li>
                  <li>• Générer des rapports détaillés</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                  En attendant :
                </h3>
                <ul className="text-sm text-nexsaas-vanta-black dark:text-gray-300 space-y-1">
                  <li>• Consultez notre documentation</li>
                  <li>• Regardez nos tutoriels vidéo</li>
                  <li>• Préparez vos données d'import</li>
                  <li>• Contactez-nous pour toute question</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button variant="outline" size="lg">
            <MessageCircle className="w-5 h-5 mr-2" />
            Contacter le support
          </Button>
          
          <Button variant="outline" size="lg">
            Consulter la documentation
          </Button>
          
          <Button 
            variant="ghost" 
            size="lg" 
            onClick={logout}
            className="text-red-500 hover:text-red-600"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Se déconnecter
          </Button>
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-12 text-center"
        >
          <div className="p-4 bg-nexsaas-light-gray dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              <AlertCircle className="w-4 h-4 inline mr-2" />
              Si vous n'avez pas de nouvelles dans les 48 heures, n'hésitez pas à nous contacter.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AccountPendingPage;