import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  CreditCard, 
  Plus, 
  Search, 
  ArrowLeft,
  Smartphone,
  Globe,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Calendar,
  User,
  Settings
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';

const PaymentsPage: React.FC = () => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const paymentMethods = [
    {
      id: 'stripe',
      name: 'Stripe',
      icon: CreditCard,
      status: 'active',
      description: 'Cartes bancaires internationales',
      fees: '2.9% + 0.30€',
      color: 'bg-blue-500',
    },
    {
      id: 'mobile_money',
      name: 'Mobile Money',
      icon: Smartphone,
      status: 'active',
      description: 'Orange Money, MTN Money, Moov Money',
      fees: '1.5%',
      color: 'bg-orange-500',
    },
    {
      id: 'cinetpay',
      name: 'CinetPay',
      icon: Globe,
      status: 'inactive',
      description: 'Paiements locaux Afrique de l\'Ouest',
      fees: '2.5%',
      color: 'bg-green-500',
    },
  ];

  const transactions = [
    {
      id: 'TXN-001',
      customer: 'Marie Dubois',
      amount: 2799,
      method: 'Stripe',
      status: 'completed',
      date: '2024-01-15 14:30',
      reference: 'pi_1234567890',
    },
    {
      id: 'TXN-002',
      customer: 'Jean Martin',
      amount: 1199,
      method: 'Mobile Money',
      status: 'pending',
      date: '2024-01-15 13:45',
      reference: 'MM_9876543210',
    },
    {
      id: 'TXN-003',
      customer: 'Sophie Laurent',
      amount: 999,
      method: 'Stripe',
      status: 'failed',
      date: '2024-01-15 12:20',
      reference: 'pi_0987654321',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-nexsaas-pure-white to-nexsaas-light-gray dark:from-nexsaas-vanta-black dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center mb-4">
            <Link to="/dashboard" className="mr-4">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
            </Link>
            <div className="p-3 bg-teal-500 rounded-lg mr-4">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                Paiements & Finances
              </h1>
              <p className="text-nexsaas-vanta-black dark:text-gray-300">
                Mobile Money, Stripe, CinetPay
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="text-center">
            <div className="p-3 bg-green-500/10 rounded-lg inline-block mb-3">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              €45,230
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              Revenus ce mois
            </p>
          </Card>
          
          <Card className="text-center">
            <div className="p-3 bg-blue-500/10 rounded-lg inline-block mb-3">
              <CheckCircle className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              156
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              Paiements réussis
            </p>
          </Card>
          
          <Card className="text-center">
            <div className="p-3 bg-yellow-500/10 rounded-lg inline-block mb-3">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              12
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              En attente
            </p>
          </Card>
          
          <Card className="text-center">
            <div className="p-3 bg-red-500/10 rounded-lg inline-block mb-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              3
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              Échecs
            </p>
          </Card>
        </motion.div>

        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                Méthodes de Paiement
              </h2>
              <Button onClick={() => setShowConfigModal(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Configurer
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {paymentMethods.map((method, index) => (
                <motion.div
                  key={method.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="border border-nexsaas-light-gray dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 ${method.color} rounded-lg`}>
                      <method.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(method.status)}`}>
                      {method.status}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                    {method.name}
                  </h3>
                  
                  <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300 mb-3">
                    {method.description}
                  </p>
                  
                  <div className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Frais: </span>
                    <span className="font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                      {method.fees}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card>
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                Transactions Récentes
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une transaction..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              {transactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="border border-nexsaas-light-gray dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mr-3">
                          {transaction.id}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {getStatusIcon(transaction.status)}
                          <span className="ml-1 capitalize">{transaction.status}</span>
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-nexsaas-vanta-black dark:text-gray-300">
                            {transaction.customer}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <CreditCard className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-nexsaas-vanta-black dark:text-gray-300">
                            {transaction.method}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-nexsaas-vanta-black dark:text-gray-300">
                            {transaction.date}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Ref: </span>
                          <span className="text-nexsaas-vanta-black dark:text-gray-300 font-mono text-xs">
                            {transaction.reference}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <span className="text-lg font-bold text-nexsaas-saas-green">
                          €{transaction.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Configuration Modal */}
        {showConfigModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowConfigModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-nexsaas-pure-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-6">
                Configuration des Paiements
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-4">
                    Stripe
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                        Clé publique
                      </label>
                      <input
                        type="text"
                        placeholder="pk_test_..."
                        className="w-full px-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                        Clé secrète
                      </label>
                      <input
                        type="password"
                        placeholder="sk_test_..."
                        className="w-full px-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-4">
                    Mobile Money
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                        API Key
                      </label>
                      <input
                        type="text"
                        placeholder="Votre clé API Mobile Money"
                        className="w-full px-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-4">
                    CinetPay
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                        Site ID
                      </label>
                      <input
                        type="text"
                        placeholder="Votre Site ID CinetPay"
                        className="w-full px-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                        API Key
                      </label>
                      <input
                        type="password"
                        placeholder="Votre clé API CinetPay"
                        className="w-full px-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 mt-8">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowConfigModal(false)}
                >
                  Annuler
                </Button>
                <Button>
                  Sauvegarder
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;