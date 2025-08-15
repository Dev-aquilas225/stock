import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Package,
  TrendingUp,
  Users,
  FileText,
  BarChart3,
  CreditCard,
  MessageCircle,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ChevronRight,
  Scan,
  Activity,
  Building2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';

const DashboardPage: React.FC = () => {
  const { user, displayUser } = useAuth();
  const { showToast } = useToast();
  const [imageKey, setImageKey] = useState(0); // For cache-busting
  const [imageError, setImageError] = useState(false); // Track image load failure

  const modules = [
    {
      icon: Package,
      title: 'Approvisionnements',
      description: 'Gérer les commandes et fournisseurs',
      color: 'bg-blue-500',
      stats: '12 commandes en cours',
      link: '/approvisionnements',
    },
    {
      icon: Building2,
      title: 'Fournisseurs',
      description: 'Gestion complète des fournisseurs',
      color: 'bg-indigo-500',
      stats: '8 fournisseurs actifs',
      link: '/fournisseurs',
    },
    {
      icon: ShoppingCart,
      title: 'Stocks & QR Code',
      description: 'Inventaire et traçabilité',
      color: 'bg-green-500',
      stats: '1,250 produits en stock',
      link: '/stocks',
    },
    {
      icon: TrendingUp,
      title: 'Ventes',
      description: 'Tunnel e-commerce et promotions',
      color: 'bg-purple-500',
      stats: '+15% ce mois',
      link: '/ventes',
    },
    {
      icon: Users,
      title: 'Commissions',
      description: 'Réseau d\'affiliés multi-niveaux',
      color: 'bg-orange-500',
      stats: '45 affiliés actifs',
      link: '/commissions',
    },
    {
      icon: FileText,
      title: 'Facturation',
      description: 'Documents et envois automatiques',
      color: 'bg-red-500',
      stats: '23 factures ce mois',
      link: '/facturation',
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Rapports et KPIs personnalisés',
      color: 'bg-indigo-500',
      stats: '5 rapports configurés',
      link: '/analytics',
    },
    {
      icon: CreditCard,
      title: 'Paiements',
      description: 'Mobile Money, Stripe, CinetPay',
      color: 'bg-teal-500',
      stats: '€12,450 ce mois',
      link: '/paiements',
    },
    {
      icon: MessageCircle,
      title: 'Support IA',
      description: 'Agent intelligent multi-canal',
      color: 'bg-pink-500',
      stats: '89% satisfaction',
      link: '/support',
    },
    {
      icon: Scan,
      title: 'Point de Vente (POS)',
      description: 'Scanner et vendre vos produits',
      color: 'bg-nexsaas-saas-green',
      stats: 'Scanner QR activé',
      link: '/pos',
    },
    {
      icon: Activity,
      title: 'Suivi des Activités',
      description: 'Historique des interactions',
      color: 'bg-gray-600',
      stats: 'Temps réel',
      link: '/activites',
    },
    {
      icon: Users,
      title: 'Agents',
      description: 'Gérer les gestionnaires et vendeurs',
      color: 'bg-cyan-500',
      stats: '10 agents actifs',
      link: '/agents',
    },
  ];

  const stats = [
    {
      title: 'Chiffre d\'affaires',
      value: '€24,580',
      change: '+12.5%',
      isPositive: true,
      icon: DollarSign,
    },
    {
      title: 'Commandes',
      value: '1,247',
      change: '+8.2%',
      isPositive: true,
      icon: ShoppingCart,
    },
    {
      title: 'Affiliés actifs',
      value: '45',
      change: '+22.1%',
      isPositive: true,
      icon: Users,
    },
    {
      title: 'Taux de conversion',
      value: '3.2%',
      change: '-2.1%',
      isPositive: false,
      icon: TrendingUp,
    },
  ];

  const handleImageError = async (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error("Image load error:", (user || displayUser)?.profilePicture, e);
    try {
      const response = await fetch((user || displayUser)?.profilePicture || '');
      console.error("Image fetch status:", response.status, response.statusText);
    } catch (fetchError) {
      console.error("Image fetch error:", fetchError);
    }
    setImageError(true);
    showToast({
      type: "error",
      title: "Erreur",
      message: "Impossible de charger l'image",
      duration: 4000,
    });
  };

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-nexsaas-pure-white to-nexsaas-light-gray dark:from-nexsaas-vanta-black dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center mb-4">
            <div className="relative w-12 h-12 bg-nexsaas-deep-blue rounded-full flex items-center justify-center overflow-hidden mr-4">
              {(user || displayUser)?.profilePicture && !imageError ? (
                <img
                  src={`${(user || displayUser)?.profilePicture}?t=${imageKey}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              ) : (
                <span className="text-xl font-bold text-white">
                  {(user || displayUser)?.nom?.[0] || ''}{(user || displayUser)?.prenom?.[0] || ''}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                Bonjour, {(user || displayUser)?.nom} {(user || displayUser)?.prenom} 👋
              </h1>
              <p className="text-lg text-nexsaas-vanta-black dark:text-gray-300">
                Voici un aperçu de votre activité aujourd'hui
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="text-center">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-nexsaas-saas-green/10 rounded-lg">
                    <stat.icon className="w-6 h-6 text-nexsaas-saas-green" />
                  </div>

                  <div className={`flex items-center text-sm font-medium ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.isPositive ? (
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 mr-1" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-1">
                  {stat.value}
                </h3>
                <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                  {stat.title}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Modules Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-6">
            Modules ERP
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {modules.map((module, index) => (
              <motion.div
                key={module.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              >
                <Link to={module.link}>
                  <Card className="h-full group cursor-pointer hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 ${module.color} rounded-lg group-hover:scale-110 transition-transform`}>
                        <module.icon className="w-6 h-6 text-white" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>

                    <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2 group-hover:text-nexsaas-saas-green transition-colors">
                      {module.title}
                    </h3>

                    <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300 mb-3">
                      {module.description}
                    </p>

                    <p className="text-xs text-nexsaas-saas-green font-medium">
                      {module.stats}
                    </p>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card>
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                  Actions rapides
                </h3>
                <p className="text-nexsaas-vanta-black dark:text-gray-300">
                  Commencez par ces tâches importantes
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
                <Link to="/pos">
                  <Button size="sm">
                    <Scan className="w-4 h-4 mr-2" />
                    Scanner produit
                  </Button>
                </Link>
                <Link to="/approvisionnements">
                  <Button variant="outline" size="sm">
                    Créer une commande
                  </Button>
                </Link>
                <Link to="/analytics">
                  <Button variant="outline" size="sm">
                    Générer un rapport
                  </Button>
                </Link>
                <Link to="/agents">
                  <Button variant="outline" size="sm">
                    Ajouter un agent
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;