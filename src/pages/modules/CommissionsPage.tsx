import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Search, 
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Award,
  Network,
  Eye,
  UserPlus,
  Calendar,
  Percent
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';

const CommissionsPage: React.FC = () => {
  const [showAffiliateForm, setShowAffiliateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const affiliates = [
    {
      id: 'AFF-001',
      name: 'Pierre Durand',
      email: 'pierre@example.com',
      level: 1,
      recruits: 12,
      totalSales: 15420,
      commission: 1542,
      status: 'active',
      joinDate: '2024-01-10',
    },
    {
      id: 'AFF-002',
      name: 'Marie Leblanc',
      email: 'marie@example.com',
      level: 2,
      recruits: 8,
      totalSales: 9800,
      commission: 980,
      status: 'active',
      joinDate: '2024-01-05',
    },
    {
      id: 'AFF-003',
      name: 'Jean Moreau',
      email: 'jean@example.com',
      level: 1,
      recruits: 5,
      totalSales: 6200,
      commission: 620,
      status: 'pending',
      joinDate: '2024-01-12',
    },
  ];

  const commissionLevels = [
    { level: 1, percentage: 10, color: 'bg-green-500' },
    { level: 2, percentage: 5, color: 'bg-blue-500' },
    { level: 3, percentage: 3, color: 'bg-purple-500' },
    { level: 4, percentage: 2, color: 'bg-orange-500' },
    { level: 5, percentage: 1, color: 'bg-red-500' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
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
            <div className="p-3 bg-orange-500 rounded-lg mr-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                Commissions d'Affiliation
              </h1>
              <p className="text-nexsaas-vanta-black dark:text-gray-300">
                Réseau d'affiliés multi-niveaux
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
              <Users className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              45
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              Affiliés actifs
            </p>
          </Card>
          
          <Card className="text-center">
            <div className="p-3 bg-blue-500/10 rounded-lg inline-block mb-3">
              <DollarSign className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              €12,450
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              Commissions ce mois
            </p>
          </Card>
          
          <Card className="text-center">
            <div className="p-3 bg-purple-500/10 rounded-lg inline-block mb-3">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              €85,230
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              Ventes générées
            </p>
          </Card>
          
          <Card className="text-center">
            <div className="p-3 bg-orange-500/10 rounded-lg inline-block mb-3">
              <Award className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              5
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              Niveaux actifs
            </p>
          </Card>
        </motion.div>

        {/* Commission Levels */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <Card>
            <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-6">
              Structure des Commissions Multi-Niveaux
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {commissionLevels.map((level, index) => (
                <motion.div
                  key={level.level}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className={`${level.color} rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3`}>
                    <span className="text-white font-bold text-lg">{level.level}</span>
                  </div>
                  <h3 className="font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-1">
                    Niveau {level.level}
                  </h3>
                  <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                    {level.percentage}% commission
                  </p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Affiliates List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card>
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                  Réseau d'Affiliés
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un affilié..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                  />
                </div>
              </div>
              <Button onClick={() => setShowAffiliateForm(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Inviter un affilié
              </Button>
            </div>

            <div className="space-y-4">
              {affiliates.map((affiliate, index) => (
                <motion.div
                  key={affiliate.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="border border-nexsaas-light-gray dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mr-3">
                          {affiliate.name}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(affiliate.status)}`}>
                          {affiliate.status}
                        </span>
                        <div className="ml-3 flex items-center">
                          <Award className="w-4 h-4 text-orange-500 mr-1" />
                          <span className="text-sm font-medium text-orange-500">
                            Niveau {affiliate.level}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Email:</span>
                          <p className="text-nexsaas-vanta-black dark:text-gray-300 font-medium">
                            {affiliate.email}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Recrues:</span>
                          <p className="text-nexsaas-vanta-black dark:text-gray-300 font-medium">
                            {affiliate.recruits} personnes
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Ventes:</span>
                          <p className="text-nexsaas-saas-green font-bold">
                            €{affiliate.totalSales.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Commission:</span>
                          <p className="text-nexsaas-saas-green font-bold">
                            €{affiliate.commission.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Inscription:</span>
                          <p className="text-nexsaas-vanta-black dark:text-gray-300 font-medium">
                            {affiliate.joinDate}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-4 lg:mt-0">
                      <Button variant="ghost" size="sm">
                        <Network className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Affiliate Invitation Modal */}
        {showAffiliateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAffiliateForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-nexsaas-pure-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-6">
                Inviter un Affilié
              </h2>
              
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                    Email de l'affilié *
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                    placeholder="affilié@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                    Message personnalisé
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                    placeholder="Rejoignez notre réseau d'affiliés et commencez à gagner des commissions..."
                  />
                </div>
                
                <div className="flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAffiliateForm(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit">
                    Envoyer l'invitation
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

export default CommissionsPage;