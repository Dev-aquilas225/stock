import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  Calendar,
  User,
  Percent,
  Gift
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';

const SalesPage: React.FC = () => {
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [promoData, setPromoData] = useState({
    name: '',
    type: 'percentage',
    value: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    description: '',
  });

  const sales = [
    {
      id: 'VTE-001',
      customer: 'Marie Dubois',
      products: 'MacBook Pro 14", AirPods Pro',
      amount: 2799,
      status: 'completed',
      date: '2024-01-15',
      paymentMethod: 'Carte bancaire',
    },
    {
      id: 'VTE-002',
      customer: 'Jean Martin',
      products: 'iPhone 15 Pro',
      amount: 1199,
      status: 'pending',
      date: '2024-01-15',
      paymentMethod: 'Mobile Money',
    },
    {
      id: 'VTE-003',
      customer: 'Sophie Laurent',
      products: 'Samsung Galaxy S24, Écouteurs',
      amount: 999,
      status: 'shipped',
      date: '2024-01-14',
      paymentMethod: 'Stripe',
    },
  ];

  const promotions = [
    {
      id: 'PROMO-001',
      name: 'Soldes d\'hiver',
      type: 'percentage',
      value: 20,
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      status: 'active',
      used: 45,
    },
    {
      id: 'PROMO-002',
      name: 'Livraison gratuite',
      type: 'shipping',
      value: 0,
      startDate: '2024-01-10',
      endDate: '2024-01-31',
      status: 'active',
      used: 123,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'shipped': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Nouvelle promotion:', promoData);
    setShowPromoForm(false);
    setPromoData({
      name: '',
      type: 'percentage',
      value: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      description: '',
    });
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
            <div className="p-3 bg-purple-500 rounded-lg mr-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                Gestion des Ventes
              </h1>
              <p className="text-nexsaas-vanta-black dark:text-gray-300">
                Tunnel e-commerce et promotions
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
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              €45,230
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              Ventes ce mois
            </p>
          </Card>
          
          <Card className="text-center">
            <div className="p-3 bg-blue-500/10 rounded-lg inline-block mb-3">
              <ShoppingBag className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              156
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              Commandes
            </p>
          </Card>
          
          <Card className="text-center">
            <div className="p-3 bg-purple-500/10 rounded-lg inline-block mb-3">
              <Percent className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              3.2%
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              Taux conversion
            </p>
          </Card>
          
          <Card className="text-center">
            <div className="p-3 bg-orange-500/10 rounded-lg inline-block mb-3">
              <Gift className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              12
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              Promotions actives
            </p>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-6"
        >
          <div className="border-b border-nexsaas-light-gray dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button className="border-b-2 border-nexsaas-saas-green py-2 px-1 text-sm font-medium text-nexsaas-saas-green">
                Ventes récentes
              </button>
              <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-nexsaas-vanta-black dark:text-gray-300 hover:text-nexsaas-deep-blue dark:hover:text-nexsaas-pure-white">
                Promotions
              </button>
            </nav>
          </div>
        </motion.div>

        {/* Sales List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-8"
        >
          <Card>
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une vente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtrer
              </Button>
            </div>

            <div className="space-y-4">
              {sales.map((sale, index) => (
                <motion.div
                  key={sale.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="border border-nexsaas-light-gray dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mr-3">
                          {sale.id}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sale.status)}`}>
                          {sale.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-nexsaas-vanta-black dark:text-gray-300">
                            {sale.customer}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <ShoppingBag className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-nexsaas-vanta-black dark:text-gray-300">
                            {sale.products}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <CreditCard className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-nexsaas-vanta-black dark:text-gray-300">
                            {sale.paymentMethod}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-nexsaas-vanta-black dark:text-gray-300">
                            {sale.date}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <span className="text-lg font-bold text-nexsaas-saas-green">
                          €{sale.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-4 lg:mt-0">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Promotions Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                Promotions actives
              </h2>
              <Button onClick={() => setShowPromoForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle promotion
              </Button>
            </div>

            <div className="space-y-4">
              {promotions.map((promo, index) => (
                <motion.div
                  key={promo.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="border border-nexsaas-light-gray dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mr-3">
                          {promo.name}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(promo.status)}`}>
                          {promo.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-nexsaas-vanta-black dark:text-gray-300">
                        <span>
                          {promo.type === 'percentage' ? `${promo.value}% de réduction` : 'Livraison gratuite'}
                        </span>
                        <span>•</span>
                        <span>{promo.startDate} - {promo.endDate}</span>
                        <span>•</span>
                        <span>{promo.used} utilisations</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Promotion Form Modal */}
        {showPromoForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowPromoForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-nexsaas-pure-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-6">
                Créer une Promotion
              </h2>
              
              <form onSubmit={handlePromoSubmit} className="space-y-6">
                <Input
                  label="Nom de la promotion"
                  value={promoData.name}
                  onChange={(value) => setPromoData({...promoData, name: value})}
                  required
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                      Type de promotion *
                    </label>
                    <select
                      value={promoData.type}
                      onChange={(e) => setPromoData({...promoData, type: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                    >
                      <option value="percentage">Pourcentage</option>
                      <option value="fixed">Montant fixe</option>
                      <option value="shipping">Livraison gratuite</option>
                    </select>
                  </div>
                  
                  {promoData.type !== 'shipping' && (
                    <Input
                      label={promoData.type === 'percentage' ? 'Pourcentage (%)' : 'Montant (€)'}
                      type="number"
                      value={promoData.value}
                      onChange={(value) => setPromoData({...promoData, value: value})}
                      required
                    />
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Date de début"
                    type="date"
                    value={promoData.startDate}
                    onChange={(value) => setPromoData({...promoData, startDate: value})}
                    required
                  />
                  <Input
                    label="Date de fin"
                    type="date"
                    value={promoData.endDate}
                    onChange={(value) => setPromoData({...promoData, endDate: value})}
                    required
                  />
                </div>
                
                <Input
                  label="Montant minimum (€)"
                  type="number"
                  step="0.01"
                  value={promoData.minAmount}
                  onChange={(value) => setPromoData({...promoData, minAmount: value})}
                  placeholder="Optionnel"
                />
                
                <div>
                  <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                    Description
                  </label>
                  <textarea
                    value={promoData.description}
                    onChange={(e) => setPromoData({...promoData, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                    placeholder="Description de la promotion..."
                  />
                </div>
                
                <div className="flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowPromoForm(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit">
                    Créer la promotion
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SalesPage;