import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  Search, 
  Filter,
  ArrowLeft,
  User,
  ShoppingCart,
  Package,
  CreditCard,
  Eye,
  Edit,
  Trash2,
  LogIn,
  LogOut,
  Plus,
  Scan,
  BarChart3,
  Download,
  RefreshCw,
  Calendar,
  Clock,
  AlertCircle,
  TrendingUp,
  Users,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { useActivity, ActivityType, ActivityFilters } from '../contexts/ActivityContext';
// import { ApiDiagnostics } from '../utils/diagnostics';

const ActivityPage: React.FC = () => {
  const { 
    activities, 
    loading, 
    error, 
    stats,
    fetchActivities,
    fetchStats,
    exportActivities,
    filters,
    setFilters 
  } = useActivity();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Calcul des statistiques locales si les stats du contexte ne sont pas disponibles
  const localStats = useMemo(() => {
    if (stats) return stats;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayActivities = activities.filter(a => a.timestamp >= today);
    const salesActivities = activities.filter(a => a.type === 'sale');
    const scanActivities = activities.filter(a => a.type === 'scan');
    
    return {
      totalActivities: activities.length,
      todayActivities: todayActivities.length,
      sales: salesActivities.length,
      scans: scanActivities.length,
      topActivities: [],
      moduleStats: []
    };
  }, [activities, stats]);

  const getActivityIcon = (type: ActivityType | undefined) => {
    if (!type) return <Activity className="w-4 h-4 text-gray-500" />;

    const iconMap: Partial<Record<ActivityType, JSX.Element>> = {
      login: <LogIn className="w-4 h-4 text-green-500" />,
      logout: <LogOut className="w-4 h-4 text-red-500" />,
      reset_password: <AlertCircle className="w-4 h-4 text-orange-500" />,
      change_password: <AlertCircle className="w-4 h-4 text-blue-500" />,
      create: <Plus className="w-4 h-4 text-blue-500" />,
      update: <Edit className="w-4 h-4 text-yellow-500" />,
      delete: <Trash2 className="w-4 h-4 text-red-500" />,
      view: <Eye className="w-4 h-4 text-gray-500" />,
      scan: <Scan className="w-4 h-4 text-purple-500" />,
      sale: <ShoppingCart className="w-4 h-4 text-green-500" />,
      payment: <CreditCard className="w-4 h-4 text-blue-500" />,
      refund: <CreditCard className="w-4 h-4 text-red-500" />,
      invoice: <FileText className="w-4 h-4 text-blue-500" />,
      quote: <FileText className="w-4 h-4 text-gray-500" />,
      stock_in: <Package className="w-4 h-4 text-green-500" />,
      stock_out: <Package className="w-4 h-4 text-red-500" />,
      stock_adjustment: <Package className="w-4 h-4 text-yellow-500" />,
      inventory: <Package className="w-4 h-4 text-blue-500" />,
    };

    return iconMap[type] || <Activity className="w-4 h-4 text-gray-500" />;
  };

  const getModuleIcon = (module: string | undefined) => {
    if (!module) return <Activity className="w-4 h-4 text-gray-500" />;

    const moduleMap: Record<string, JSX.Element> = {
      pos: <ShoppingCart className="w-4 h-4 text-green-500" />,
      stocks: <Package className="w-4 h-4 text-blue-500" />,
      ventes: <BarChart3 className="w-4 h-4 text-purple-500" />,
      auth: <User className="w-4 h-4 text-orange-500" />,
      users: <Users className="w-4 h-4 text-blue-500" />,
      products: <Package className="w-4 h-4 text-green-500" />,
      suppliers: <TrendingUp className="w-4 h-4 text-orange-500" />,
      system: <AlertCircle className="w-4 h-4 text-gray-500" />,
      reports: <BarChart3 className="w-4 h-4 text-purple-500" />,
    };
    
    return moduleMap[module.toLowerCase()] || <Activity className="w-4 h-4 text-gray-500" />;
  };

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const module = activity.module || '';
      const type = activity.type || '';
      const matchesSearch = activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           module.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           activity.userName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesModule = filterModule === 'all' || module.toLowerCase() === filterModule.toLowerCase();
      const matchesType = filterType === 'all' || type === filterType;
      
      return matchesSearch && matchesModule && matchesType;
    });
  }, [activities, searchTerm, filterModule, filterType]);

  const modules = [...new Set(activities.map(a => a.module))];
  const types: ActivityType[] = [
    'login', 'logout', 'create', 'update', 'delete', 'view', 'scan', 
    'sale', 'payment', 'stock_in', 'stock_out', 'inventory'
  ];

  const handleApplyFilters = useCallback(() => {
    const newFilters: ActivityFilters = {
      startDate: dateRange.startDate ? new Date(dateRange.startDate) : undefined,
      endDate: dateRange.endDate ? new Date(dateRange.endDate) : undefined,
      activityType: filterType !== 'all' ? filterType as ActivityType : undefined,
      module: filterModule !== 'all' ? filterModule : undefined,
      search: searchTerm || undefined,
      page: currentPage,
      limit: 50,
    };

    setFilters(newFilters);
    fetchActivities(newFilters);
  }, [dateRange, filterType, filterModule, searchTerm, currentPage, setFilters, fetchActivities]);

  const handleRefresh = useCallback(() => {
    fetchActivities(filters);
    fetchStats();
  }, [fetchActivities, fetchStats, filters]);

  const handleExport = useCallback(() => {
    const exportFilters: ActivityFilters = {
      ...filters,
      startDate: dateRange.startDate ? new Date(dateRange.startDate) : undefined,
      endDate: dateRange.endDate ? new Date(dateRange.endDate) : undefined,
    };
    exportActivities(exportFilters);
  }, [exportActivities, filters, dateRange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleApplyFilters();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, handleApplyFilters]);

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
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                Suivi des Activités
              </h1>
              <p className="text-nexsaas-vanta-black dark:text-gray-300">
                Historique des interactions dans l'application
              </p>
            </div>
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Cards - Design simplifié comme la version de base */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="text-center">
            <div className="p-3 bg-blue-500/10 rounded-lg inline-block mb-3">
              <Activity className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              {localStats.totalActivities}
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              Total activités
            </p>
          </Card>
          
          <Card className="text-center">
            <div className="p-3 bg-green-500/10 rounded-lg inline-block mb-3">
              <BarChart3 className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              {localStats.todayActivities}
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              Aujourd'hui
            </p>
          </Card>
          
          <Card className="text-center">
            <div className="p-3 bg-purple-500/10 rounded-lg inline-block mb-3">
              <ShoppingCart className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              {localStats.sales || 0}
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              Ventes effectuées
            </p>
          </Card>
          
          <Card className="text-center">
            <div className="p-3 bg-orange-500/10 rounded-lg inline-block mb-3">
              <Scan className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              {localStats.scans || 0}
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              Codes scannés
            </p>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-6"
        >
          <Card>
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une activité..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                  />
                </div>
                
                <select
                  value={filterModule}
                  onChange={(e) => setFilterModule(e.target.value)}
                  className="px-4 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                >
                  <option value="all">Tous les modules</option>
                  {modules.map(module => (
                    <option key={module} value={module}>{module}</option>
                  ))}
                </select>
                
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                >
                  <option value="all">Tous les types</option>
                  {types.map(type => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Actualiser
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtres avancés
                  {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-nexsaas-light-gray dark:border-gray-700 pt-4 mt-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-nexsaas-vanta-black dark:text-gray-300 mb-2">
                      Date de début
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-nexsaas-vanta-black dark:text-gray-300 mb-2">
                      Date de fin
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-end">
                    <Button
                      onClick={handleApplyFilters}
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? 'Chargement...' : 'Appliquer les filtres'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </Card>
        </motion.div>

        {/* Activities List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card>
            <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-6">
              Historique des Activités ({filteredActivities.length})
            </h2>

            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
                <p className="text-nexsaas-vanta-black dark:text-gray-300">
                  Chargement des activités...
                </p>
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-nexsaas-vanta-black dark:text-gray-300">
                  Aucune activité trouvée
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.05 }}
                    className="border border-nexsaas-light-gray dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {getActivityIcon(activity.type || undefined)}
                          {getModuleIcon(activity.module || '')}
                        </div>
                        <div>
                          <h3 className="font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                            {activity.description}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-nexsaas-vanta-black dark:text-gray-300">
                            <span className="capitalize">{activity.module}</span>
                            <span>•</span>
                            <span className="capitalize">
                              {activity.type ? activity.type.replace(/_/g, ' ') : 'unknown'}
                            </span>
                            {activity.userName && (
                              <>
                                <span>•</span>
                                <span>{activity.userName}</span>
                              </>
                            )}
                            <span>•</span>
                            <span>{activity.timestamp.toLocaleString('fr-FR')}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* {activity.metadata && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          <details className="cursor-pointer">
                            <summary>Détails</summary>
                            <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-auto max-w-xs">
                              {JSON.stringify(activity.metadata, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )} */}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ActivityPage;
