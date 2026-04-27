import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { ventesApi, Vente } from '../../api/ventesApi';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid,
  PolarAngleAxis
} from 'recharts';
import {
  BarChart3, TrendingUp, Download, Calendar, ArrowLeft,
  DollarSign, Users, ShoppingCart, ArrowUpRight, ArrowDownRight,
  RefreshCw, Package, Target, Globe, Award
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';

const MOIS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
const MOYEN_COLORS: Record<string, string> = {
  ORANGE_MONEY: '#FF9500', WAVE: '#00BFFF', MTN_MONEY: '#FFCC00', MOOV_MONEY: '#0047AB', AUTRE: '#374151',
};
const MOYEN_LABELS: Record<string, string> = {
  ORANGE_MONEY: 'Orange Money', WAVE: 'Wave', MTN_MONEY: 'MTN Money', MOOV_MONEY: 'Moov Money', AUTRE: 'Autre',
};

const performanceData = [
  { sujet: 'Ventes', score: 85 },
  { sujet: 'Recrutement', score: 70 },
  { sujet: 'Fidélisation', score: 90 },
  { sujet: 'Satisfaction', score: 88 },
  { sujet: 'Conversion', score: 65 },
  { sujet: 'Rétention', score: 78 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg text-sm">
        <p className="font-semibold text-nexsaas-deep-blue dark:text-white mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: {typeof p.value === 'number' ? `€${p.value.toLocaleString()}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState('1y');
  const [activeTab, setActiveTab] = useState<'ventes' | 'affilies' | 'produits' | 'performance'>('ventes');
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [commStats, setCommStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ventesApi.obtenirVentes().catch(() => [] as Vente[]),
      axiosClient.get('/commissions/stats').then(r => r.data ?? []).catch(() => []),
      axiosClient.get('/commissions/affilies').then(r => r.data ?? []).catch(() => []),
    ]).then(([v, cs]) => {
      setVentes(v);
      setCommStats(Array.isArray(cs) ? cs : []);
    }).finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n);

  // Build monthly data from real ventes
  const salesData = useMemo(() => {
    const map = new Map<string, { ventes: number; commandes: number }>();
    ventes.forEach(v => {
      const k = MOIS[new Date(v.dateVente).getMonth()];
      const prev = map.get(k) ?? { ventes: 0, commandes: 0 };
      map.set(k, { ventes: prev.ventes + Number(v.total), commandes: prev.commandes + 1 });
    });
    return MOIS.map(m => ({ mois: m, ventes: map.get(m)?.ventes ?? 0, commandes: map.get(m)?.commandes ?? 0, affilies: Math.round((map.get(m)?.ventes ?? 0) * 0.3) })).filter(d => d.ventes > 0);
  }, [ventes]);

  // Build canal data from moyenPaiement
  const canalData = useMemo(() => {
    const map = new Map<string, number>();
    ventes.forEach(v => {
      const k = v.moyenPaiement ?? 'AUTRE';
      map.set(k, (map.get(k) ?? 0) + Number(v.total));
    });
    return Array.from(map.entries()).map(([k, total]) => ({
      canal: MOYEN_LABELS[k] ?? k,
      ventes: total,
      fill: MOYEN_COLORS[k] ?? '#6B7280',
    }));
  }, [ventes]);

  // Top products from ventes produits
  const topProducts = useMemo(() => {
    const map = new Map<string, { sales: number; revenue: number }>();
    ventes.forEach(v => {
      (v.produits ?? []).forEach((p: any) => {
        const nom = p.produitFournisseur?.nom ?? 'Produit inconnu';
        const prev = map.get(nom) ?? { sales: 0, revenue: 0 };
        map.set(nom, { sales: prev.sales + 1, revenue: prev.revenue + (p.prixVente || p.prix || 0) });
      });
    });
    return Array.from(map.entries()).map(([name, d]) => ({ name, ...d, growth: 0 })).sort((a, b) => b.sales - a.sales).slice(0, 5);
  }, [ventes]);

  // Top affiliates from commissions stats
  const topAffiliates = useMemo(() => {
    return (commStats ?? []).map((s: any) => ({
      name: s.affilie ? `${s.affilie.nom} ${s.affilie.prenom}` : 'Affilié',
      level: s.niveau ?? 'N1',
      sales: Number(s.montantVente ?? s.total ?? 0),
      commission: Number(s.total ?? 0),
      recruits: 0,
    })).slice(0, 5);
  }, [commStats]);

  const totalCA = ventes.reduce((s, v) => s + Number(v.total), 0);
  const totalCommissions = commStats.reduce((s: number, c: any) => s + Number(c.total ?? 0), 0);

  const categorieData = [
    { name: 'Beauté & Soin', value: 38, color: '#223B7B' },
    { name: 'Santé', value: 28, color: '#34C759' },
    { name: 'Nutrition', value: 18, color: '#FF9500' },
    { name: 'Bien-être', value: 11, color: '#5856D6' },
    { name: 'Autres', value: 5, color: '#FF2D55' },
  ];

  const kpis = [
    { title: "Chiffre d'affaires", value: loading ? '...' : fmt(totalCA), change: `${ventes.length} ventes`, positive: true, icon: DollarSign, color: 'from-blue-500 to-blue-600' },
    { title: 'Ventes totales', value: loading ? '...' : String(ventes.length), change: `+${ventes.filter(v => { const d = new Date(v.dateVente); return d.getMonth() === new Date().getMonth(); }).length} ce mois`, positive: true, icon: ShoppingCart, color: 'from-green-500 to-green-600' },
    { title: 'Commissions', value: loading ? '...' : fmt(totalCommissions), change: `${commStats.length} niveaux`, positive: true, icon: Users, color: 'from-purple-500 to-purple-600' },
    { title: 'Top produits', value: loading ? '...' : String(topProducts.length), change: 'références actives', positive: true, icon: Target, color: 'from-orange-500 to-orange-600' },
  ];

  const tabs = [
    { id: 'ventes', label: 'Ventes', icon: TrendingUp },
    { id: 'affilies', label: 'Affiliés', icon: Users },
    { id: 'produits', label: 'Produits', icon: Package },
    { id: 'performance', label: 'Performance', icon: Target },
  ];

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-nexsaas-pure-white to-nexsaas-light-gray dark:from-nexsaas-vanta-black dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <Link to="/dashboard" className="mr-4">
                <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Retour</Button>
              </Link>
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl mr-4 shadow-lg">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-nexsaas-deep-blue dark:text-white">Analytics & Reporting</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tableau de bord de pilotage stratégique</p>
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
              >
                <option value="7d">7 jours</option>
                <option value="30d">30 jours</option>
                <option value="90d">3 mois</option>
                <option value="1y">12 mois</option>
              </select>
              <Button variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-1" />Actualiser</Button>
              <Button size="sm"><Download className="w-4 h-4 mr-1" />Exporter</Button>
            </div>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpis.map((kpi, i) => (
            <motion.div key={kpi.title} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
              <Card className="overflow-hidden">
                <div className={`h-1 w-full bg-gradient-to-r ${kpi.color} mb-4 -mt-6 -mx-6 px-6`} style={{ marginTop: '-1.5rem', marginLeft: '-1.5rem', width: 'calc(100% + 3rem)' }} />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">{kpi.title}</p>
                    <h3 className="text-lg sm:text-2xl font-bold text-nexsaas-deep-blue dark:text-white">{kpi.value}</h3>
                  </div>
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${kpi.color}`}>
                    <kpi.icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className={`flex items-center mt-2 text-xs font-medium ${kpi.positive ? 'text-green-600' : 'text-red-500'}`}>
                  {kpi.positive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                  {kpi.change} vs période précédente
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
          <div className="flex gap-1 bg-nexsaas-light-gray dark:bg-gray-800 p-1 rounded-xl w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-nexsaas-deep-blue dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-nexsaas-deep-blue dark:hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Charts Section */}
        {activeTab === 'ventes' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Area Chart - Revenue Evolution */}
            <Card>
              <h2 className="text-lg font-bold text-nexsaas-deep-blue dark:text-white mb-6">Évolution du Chiffre d'Affaires</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#223B7B" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#223B7B" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorAffiliés" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34C759" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#34C759" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mois" tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(v) => `€${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="ventes" name="Ventes directes" stroke="#223B7B" strokeWidth={2} fill="url(#colorVentes)" />
                  <Area type="monotone" dataKey="affilies" name="Via affiliés" stroke="#34C759" strokeWidth={2} fill="url(#colorAffiliés)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Bar Chart - Sales by Channel + Pie Chart - Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h2 className="text-lg font-bold text-nexsaas-deep-blue dark:text-white mb-6">Ventes par Canal</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={canalData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="canal" tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} tickFormatter={(v) => `€${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value: any) => [`€${value.toLocaleString()}`, 'Ventes']} />
                    <Bar dataKey="ventes" radius={[6, 6, 0, 0]}>
                      {canalData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card>
                <h2 className="text-lg font-bold text-nexsaas-deep-blue dark:text-white mb-4">Répartition par Catégorie</h2>
                <div className="flex items-center">
                  <ResponsiveContainer width="60%" height={220}>
                    <PieChart>
                      <Pie data={categorieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                        {categorieData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2">
                    {categorieData.map((cat) => (
                      <div key={cat.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                          <span className="text-gray-600 dark:text-gray-400 leading-tight">{cat.name}</span>
                        </div>
                        <span className="font-semibold text-nexsaas-deep-blue dark:text-white">{cat.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Orders Line Chart */}
            <Card>
              <h2 className="text-lg font-bold text-nexsaas-deep-blue dark:text-white mb-6">Volume de Commandes</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={salesData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mois" tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="commandes" name="Commandes" stroke="#FF9500" strokeWidth={2.5} dot={{ fill: '#FF9500', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        )}

        {activeTab === 'affilies' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card>
              <h2 className="text-lg font-bold text-nexsaas-deep-blue dark:text-white mb-6">Performance Réseau d'Affiliés</h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={salesData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mois" tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(v) => `€${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="affilies" name="Ventes affiliés" fill="#34C759" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-nexsaas-deep-blue dark:text-white">Top Affiliés du Mois</h2>
                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">Décembre 2024</span>
              </div>
              <div className="space-y-3">
                {topAffiliates.map((aff, i) => (
                  <div key={aff.name} className="flex items-center gap-4 p-3 rounded-xl bg-nexsaas-light-gray dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-400' : 'bg-nexsaas-deep-blue'}`}>
                      {i < 3 ? <Award className="w-4 h-4" /> : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-nexsaas-deep-blue dark:text-white text-sm truncate">{aff.name}</p>
                      <p className="text-xs text-gray-500">Niveau {aff.level} • {aff.recruits} recrues</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-nexsaas-saas-green text-sm">€{aff.commission.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">€{aff.sales.toLocaleString()} ventes</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'produits' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h2 className="text-lg font-bold text-nexsaas-deep-blue dark:text-white mb-6">Répartition Catégories</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={categorieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${value}%`} labelLine={true}>
                      {categorieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, '']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              <Card>
                <h2 className="text-lg font-bold text-nexsaas-deep-blue dark:text-white mb-6">Top 5 Produits</h2>
                <div className="space-y-4">
                  {topProducts.map((prod, i) => (
                    <div key={prod.name}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-nexsaas-deep-blue dark:text-white truncate mr-2">{prod.name}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs font-medium ${prod.growth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {prod.growth >= 0 ? '+' : ''}{prod.growth}%
                          </span>
                          <span className="text-xs font-bold text-nexsaas-saas-green">€{prod.revenue.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-nexsaas-deep-blue to-nexsaas-saas-green"
                          style={{ width: `${(prod.sales / 312) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{prod.sales} unités vendues</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === 'performance' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h2 className="text-lg font-bold text-nexsaas-deep-blue dark:text-white mb-6">Radar de Performance Globale</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={performanceData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="sujet" tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <Radar name="Score" dataKey="score" stroke="#223B7B" fill="#223B7B" fillOpacity={0.25} strokeWidth={2} />
                    <Tooltip formatter={(v) => [`${v}/100`, 'Score']} />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>

              <Card>
                <h2 className="text-lg font-bold text-nexsaas-deep-blue dark:text-white mb-6">Scores de Performance</h2>
                <div className="space-y-4">
                  {performanceData.map((item) => (
                    <div key={item.sujet}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-nexsaas-deep-blue dark:text-white">{item.sujet}</span>
                        <span className="text-sm font-bold text-nexsaas-deep-blue dark:text-white">{item.score}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${item.score >= 85 ? 'bg-green-500' : item.score >= 70 ? 'bg-blue-500' : 'bg-orange-500'}`}
                          style={{ width: `${item.score}%`, transition: 'width 1s ease-in-out' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Rapports configurés */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-nexsaas-deep-blue dark:text-white">Rapports Programmés</h2>
                <Button size="sm"><Calendar className="w-4 h-4 mr-2" />Nouveau rapport</Button>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'Rapport mensuel des ventes', type: 'Ventes', freq: 'Mensuel', status: 'Prêt', format: 'PDF' },
                  { name: 'Analyse commissions affiliés', type: 'Commissions', freq: 'Hebdomadaire', status: 'En génération', format: 'Excel' },
                  { name: 'Performance réseau affiliation', type: 'Affiliés', freq: 'Mensuel', status: 'Prêt', format: 'PDF' },
                  { name: 'Inventaire & mouvements stock', type: 'Stock', freq: 'Quotidien', status: 'Prêt', format: 'CSV' },
                ].map((report) => (
                  <div key={report.name} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-nexsaas-deep-blue/10 rounded-lg">
                        <Globe className="w-4 h-4 text-nexsaas-deep-blue" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-nexsaas-deep-blue dark:text-white">{report.name}</p>
                        <p className="text-xs text-gray-500">{report.type} • {report.freq} • {report.format}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${report.status === 'Prêt' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'}`}>
                        {report.status}
                      </span>
                      <Button variant="ghost" size="sm"><Download className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
