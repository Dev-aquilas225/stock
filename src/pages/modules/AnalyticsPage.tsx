import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar, 
  ArrowLeft,
  DollarSign,
  Users,
  ShoppingCart,
  Eye,
  Filter,
  RefreshCw
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';

const AnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState('30d');
  const [reportType, setReportType] = useState('sales');

  const kpis = [
    {
      title: 'Chiffre d\'affaires',
      value: '€45,230',
      change: '+12.5%',
      isPositive: true,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Nouveaux clients',
      value: '156',
      change: '+8.2%',
      isPositive: true,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Commandes',
      value: '1,247',
      change: '+15.3%',
      isPositive: true,
      icon: ShoppingCart,
      color: 'bg-purple-500',
    },
    {
      title: 'Taux de conversion',
      value: '3.2%',
      change: '-2.1%',
      isPositive: false,
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  const reports = [
    {
      id: 'RPT-001',
      name: 'Rapport mensuel des ventes',
      type: 'Ventes',
      lastGenerated: '2024-01-15',
      status: 'ready',
      format: 'PDF',
    },
    {
      id: 'RPT-002',
      name: 'Analyse des commissions',
      type: 'Commissions',
      lastGenerated: '2024-01-14',
      status: 'generating',
      format: 'Excel',
    },
    {
      id: 'RPT-003',
      name: 'Performance des affiliés',
      type: 'Affiliés',
      lastGenerated: '2024-01-13',
      status: 'ready',
      format: 'PDF',
    },
  ];

  const topProducts = [
    { name: 'MacBook Pro 14"', sales: 45, revenue: 112500 },
    { name: 'iPhone 15 Pro', sales: 38, revenue: 45620 },
    { name: 'Samsung Galaxy S24', sales: 32, revenue: 28800 },
    { name: 'AirPods Pro', sales: 67, revenue: 16750 },
    { name: 'iPad Air', sales: 28, revenue: 16800 },
  ];

  const topAffiliates = [
    { name: 'Pierre Durand', sales: 15420, commission: 1542 },
    { name: 'Marie Leblanc', sales: 9800, commission: 980 },
    { name: 'Jean Moreau', sales: 6200, commission: 620 },
    { name: 'Sophie Martin', sales: 4800, commission: 480 },
    { name: 'Luc Bernard', sales: 3600, commission: 360 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'generating': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
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
            <div className="p-3 bg-indigo-500 rounded-lg mr-4">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                Analytics & Reporting
              </h1>
              <p className="text-nexsaas-vanta-black dark:text-gray-300">
                Rapports et KPIs personnalisés
              </p>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Card>
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4">
                <div>
                  <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                    Période
                  </label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="px-4 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                  >
                    <option value="7d">7 derniers jours</option>
                    <option value="30d">30 derniers jours</option>
                    <option value="90d">3 derniers mois</option>
                    <option value="1y">12 derniers mois</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                    Type de rapport
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="px-4 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                  >
                    <option value="sales">Ventes</option>
                    <option value="commissions">Commissions</option>
                    <option value="products">Produits</option>
                    <option value="affiliates">Affiliés</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Actualiser
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* KPIs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {kpis.map((kpi, index) => (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="text-center">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 ${kpi.color}/10 rounded-lg`}>
                    <kpi.icon className={`w-6 h-6 text-${kpi.color.split('-')[1]}-500`} />
                  </div>
                  <div className={`flex items-center text-sm font-medium ${
                    kpi.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUp className={`w-4 h-4 mr-1 ${kpi.isPositive ? '' : 'rotate-180'}`} />
                    {kpi.change}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-1">
                  {kpi.value}
                </h3>
                <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                  {kpi.title}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-8"
        >
          <Card>
            <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-6">
              Évolution des Ventes
            </h2>
            <div className="h-64 bg-nexsaas-light-gray dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Graphique des ventes - Intégration en cours
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Top Products & Affiliates */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
        >
          {/* Top Products */}
          <Card>
            <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-6">
              Top Produits
            </h2>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 bg-nexsaas-light-gray dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-nexsaas-saas-green rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                        {product.name}
                      </h3>
                      <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                        {product.sales} ventes
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-nexsaas-saas-green">
                      €{product.revenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Affiliates */}
          <Card>
            <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-6">
              Top Affiliés
            </h2>
            <div className="space-y-4">
              {topAffiliates.map((affiliate, index) => (
                <div key={affiliate.name} className="flex items-center justify-between p-3 bg-nexsaas-light-gray dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-nexsaas-deep-blue rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                        {affiliate.name}
                      </h3>
                      <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                        €{affiliate.sales.toLocaleString()} de ventes
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-nexsaas-saas-green">
                      €{affiliate.commission.toLocaleString()}
                    </p>
                    <p className="text-xs text-nexsaas-vanta-black dark:text-gray-300">
                      commission
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Reports */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                Rapports Configurés
              </h2>
              <Button>
                <Calendar className="w-4 h-4 mr-2" />
                Programmer un rapport
              </Button>
            </div>

            <div className="space-y-4">
              {reports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="border border-nexsaas-light-gray dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mr-3">
                          {report.name}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-nexsaas-vanta-black dark:text-gray-300">
                        <span>Type: {report.type}</span>
                        <span>•</span>
                        <span>Format: {report.format}</span>
                        <span>•</span>
                        <span>Dernière génération: {report.lastGenerated}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsPage;