import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  AreaChart, Area, ResponsiveContainer
} from "recharts";
import {
  ShoppingCart, Package, TrendingUp, Users, FileText, BarChart3,
  CreditCard, MessageCircle, ArrowUpRight, ArrowDownRight, DollarSign,
  ChevronRight, Scan, Activity, Building2, RotateCcw, Bell, Calendar,
  AlertTriangle, CheckCircle, Clock, Zap
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import Card from "../components/UI/Card";
import { ventesApi, VentesStats } from "../api/ventesApi";
import { notificationApi, NotificationResponse } from "../api/notificationApi";
import Button from "../components/UI/Button";

const DashboardPage = () => {
  const { user, displayUser } = useAuth();
  const { showToast } = useToast();
  const [imageError, setImageError] = useState(false);
  const [imageKey] = useState(0);
  const [ventesStats, setVentesStats] = useState<VentesStats | null>(null);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    Promise.all([
      ventesApi.obtenirStatistiques().catch(() => null),
      notificationApi.getNotifications({ limit: 4 }).catch(() => null),
    ]).then(([stats, notifs]) => {
      if (stats) setVentesStats(stats);
      if (notifs?.data) setNotifications(notifs.data);
    }).finally(() => setLoadingStats(false));
  }, []);

  const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n);

  const stats = [
    {
      title: "Chiffre d'affaires",
      value: loadingStats ? "..." : fmt(ventesStats?.totalMontant ?? 0),
      change: ventesStats ? `${ventesStats.ventesMoisCourant} ce mois` : "—",
      isPositive: true,
      icon: DollarSign,
      color: "from-blue-500 to-blue-600",
      spark: [{ v: 18 }, { v: 22 }, { v: 19 }, { v: 28 }, { v: 31 }, { v: 35 }, { v: ventesStats?.montantMoisCourant ? 40 : 29 }],
      sparkColor: "#3B82F6",
    },
    {
      title: "Ventes totales",
      value: loadingStats ? "..." : String(ventesStats?.totalVentes ?? 0),
      change: ventesStats ? `${ventesStats.ventesAujourdhui} auj.` : "—",
      isPositive: true,
      icon: ShoppingCart,
      color: "from-green-500 to-emerald-600",
      spark: [{ v: 12 }, { v: 18 }, { v: 14 }, { v: 20 }, { v: 24 }, { v: 27 }, { v: ventesStats?.ventesAujourdhui ?? 10 }],
      sparkColor: "#10B981",
    },
    {
      title: "CA du mois",
      value: loadingStats ? "..." : fmt(ventesStats?.montantMoisCourant ?? 0),
      change: `${ventesStats?.ventesMoisCourant ?? 0} ventes`,
      isPositive: true,
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600",
      spark: [{ v: 3 }, { v: 5 }, { v: 4 }, { v: 7 }, { v: 6 }, { v: 8 }, { v: ventesStats?.ventesMoisCourant ?? 5 }],
      sparkColor: "#8B5CF6",
    },
    {
      title: "CA aujourd'hui",
      value: loadingStats ? "..." : fmt(ventesStats?.montantAujourdhui ?? 0),
      change: `${ventesStats?.ventesAujourdhui ?? 0} ventes`,
      isPositive: (ventesStats?.montantAujourdhui ?? 0) >= 0,
      icon: TrendingUp,
      color: "from-orange-500 to-red-500",
      spark: [{ v: 2 }, { v: 4 }, { v: 3 }, { v: 5 }, { v: 4 }, { v: 6 }, { v: ventesStats?.ventesAujourdhui ?? 3 }],
      sparkColor: "#EF4444",
    },
  ];

  const modules = [
    { icon: Package, title: "Approvisionnements", description: "Commandes & fournisseurs", color: "bg-blue-500", stats: "12 commandes en cours", link: "/approvisionnements", badge: "12" },
    { icon: RotateCcw, title: "Retours", description: "Retours approvisionnements", color: "bg-yellow-500", stats: "3 retours en attente", link: "/returns", badge: "3" },
    { icon: Building2, title: "Fournisseurs", description: "Gestion complète", color: "bg-indigo-500", stats: "8 fournisseurs actifs", link: "/fournisseurs" },
    { icon: ShoppingCart, title: "Stocks & QR Code", description: "Inventaire & traçabilité", color: "bg-green-500", stats: "1,250 produits", link: "/stocks" },
    { icon: TrendingUp, title: "Ventes", description: "E-commerce & promotions", color: "bg-purple-500", stats: "+15% ce mois", link: "/ventes" },
    { icon: Users, title: "Commissions", description: "Réseau multi-niveaux", color: "bg-orange-500", stats: "45 affiliés actifs", link: "/commissions" },
    { icon: FileText, title: "Facturation", description: "Documents automatiques", color: "bg-red-500", stats: "23 factures ce mois", link: "/facturation" },
    { icon: BarChart3, title: "Analytics", description: "Rapports & KPIs", color: "bg-indigo-500", stats: "5 rapports configurés", link: "/analytics" },
    { icon: CreditCard, title: "Paiements", description: "Mobile Money & Stripe", color: "bg-teal-500", stats: "€12,450 ce mois", link: "/paiements" },
    { icon: MessageCircle, title: "Support IA", description: "Agent intelligent multi-canal", color: "bg-pink-500", stats: "89% satisfaction", link: "/support" },
    { icon: Scan, title: "Point de Vente", description: "Scanner & vendre", color: "bg-nexsaas-saas-green", stats: "POS activé", link: "/pos" },
    { icon: Activity, title: "Activités", description: "Historique en temps réel", color: "bg-gray-600", stats: "Temps réel", link: "/activites" },
    { icon: Users, title: "Agents", description: "Gestionnaires & vendeurs", color: "bg-cyan-500", stats: "10 agents actifs", link: "/agents" },
  ];

  const iconForType = (type: string) => {
    if (type === 'warning' || type === 'error') return AlertTriangle;
    if (type === 'success') return CheckCircle;
    return Bell;
  };
  const colorForType = (type: string) => {
    if (type === 'error') return 'text-red-500 bg-red-50 dark:bg-red-900/20';
    if (type === 'warning') return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
    if (type === 'success') return 'text-green-500 bg-green-50 dark:bg-green-900/20';
    return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
  };
  const alerts = notifications.length > 0
    ? notifications.map(n => ({
        type: n.type,
        message: n.message,
        time: new Date(n.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        icon: iconForType(n.type),
        color: colorForType(n.type),
      }))
    : [
        { type: "info", message: "Aucune notification récente", time: "—", icon: Bell, color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20" },
      ];

  const handleImageError = () => setImageError(true);
  const currentUser = user || displayUser;

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-nexsaas-pure-white to-nexsaas-light-gray dark:from-nexsaas-vanta-black dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">

        {/* Welcome Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="bg-gradient-to-r from-nexsaas-deep-blue via-blue-600 to-purple-600 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border border-white/30">
                  {currentUser?.profilePicture && !imageError ? (
                    <img src={`${currentUser.profilePicture}?t=${imageKey}`} alt="Profile" className="w-full h-full object-cover" onError={handleImageError} />
                  ) : (
                    <span className="text-xl font-bold">{currentUser?.nom?.[0]}{currentUser?.prenom?.[0]}</span>
                  )}
                </div>
                <div>
                  <p className="text-white/70 text-sm">Bienvenue de retour 👋</p>
                  <h1 className="text-2xl sm:text-3xl font-bold">{currentUser?.nom || 'Utilisateur'} {currentUser?.prenom || ''}</h1>
                  <p className="text-white/60 text-xs mt-1">
                    <Calendar className="inline w-3 h-3 mr-1" />
                    {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex flex-col items-end gap-2">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs">
                  <Zap className="w-3 h-3 text-yellow-300" />
                  <span>Système en ligne</span>
                </div>
                <p className="text-white/50 text-xs">ERP FOREVER v1.0</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards with Sparklines */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
              <Card className="overflow-hidden" hover={true}>
                <div className={`h-1 w-full bg-gradient-to-r ${stat.color} -mt-6 -mx-6 mb-4`} style={{ marginTop: '-1.5rem', marginLeft: '-1.5rem', width: 'calc(100% + 3rem)' }} />
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{stat.title}</p>
                    <h3 className="text-lg sm:text-2xl font-bold text-nexsaas-deep-blue dark:text-white">{stat.value}</h3>
                  </div>
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                {/* Mini sparkline */}
                <div className="h-8 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stat.spark} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <defs>
                        <linearGradient id={`spark-${index}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={stat.sparkColor} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={stat.sparkColor} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="v" stroke={stat.sparkColor} strokeWidth={1.5} fill={`url(#spark-${index})`} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className={`flex items-center mt-2 text-xs font-medium ${stat.isPositive ? "text-green-600" : "text-red-500"}`}>
                  {stat.isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                  {stat.change} ce mois
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* Modules grid */}
          <div className="xl:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-white">Modules ERP</h2>
                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">{modules.length} modules</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {modules.map((module, index) => (
                  <motion.div key={module.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 + index * 0.04 }}>
                    <Link to={module.link}>
                      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg hover:border-nexsaas-saas-green/50 transition-all duration-200 group cursor-pointer h-full relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50/50 dark:to-gray-700/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {module.badge && (
                          <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{module.badge}</span>
                        )}
                        <div className={`p-2 ${module.color} rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform`}>
                          <module.icon className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-sm font-semibold text-nexsaas-deep-blue dark:text-white mb-1 group-hover:text-nexsaas-saas-green transition-colors leading-tight">
                          {module.title}
                        </h3>
                        <p className="text-xs text-gray-400 leading-tight hidden sm:block">{module.description}</p>
                        <p className="text-xs text-nexsaas-saas-green font-medium mt-2">{module.stats}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Alerts */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-nexsaas-deep-blue dark:text-white">Alertes Récentes</h3>
                  <Bell className="w-4 h-4 text-gray-400" />
                </div>
                <div className="space-y-3">
                  {alerts.map((alert, i) => (
                    <div key={i} className={`flex items-start gap-3 p-2.5 rounded-lg ${alert.color}`}>
                      <alert.icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${alert.color.split(' ')[0]}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-nexsaas-deep-blue dark:text-gray-200 leading-tight">{alert.message}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{alert.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/notifications">
                  <Button variant="ghost" size="sm" className="w-full mt-3 text-xs">
                    Voir toutes les alertes <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </Card>
            </motion.div>

            {/* Quick actions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card>
                <h3 className="font-bold text-nexsaas-deep-blue dark:text-white mb-4">Actions Rapides</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Scanner', icon: Scan, link: '/pos', color: 'bg-nexsaas-saas-green' },
                    { label: 'Commande', icon: Package, link: '/approvisionnements', color: 'bg-blue-500' },
                    { label: 'Vente', icon: ShoppingCart, link: '/ventes', color: 'bg-purple-500' },
                    { label: 'Rapport', icon: BarChart3, link: '/analytics', color: 'bg-indigo-500' },
                    { label: 'Retour', icon: RotateCcw, link: '/returns', color: 'bg-yellow-500' },
                    { label: 'Facture', icon: FileText, link: '/facturation', color: 'bg-red-500' },
                  ].map((action) => (
                    <Link key={action.label} to={action.link}>
                      <div className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group">
                        <div className={`p-1.5 ${action.color} rounded-lg`}>
                          <action.icon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-xs font-medium text-nexsaas-deep-blue dark:text-white group-hover:text-nexsaas-saas-green transition-colors">{action.label}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
