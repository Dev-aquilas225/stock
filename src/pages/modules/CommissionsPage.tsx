import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line
} from 'recharts';
import {
  Users, Plus, Search, ArrowLeft, DollarSign, TrendingUp,
  Award, Network, Eye, UserPlus, ChevronDown, ChevronRight,
  Calculator, CheckCircle, Clock, XCircle, GitBranch, RefreshCw
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import axiosClient from '../../api/axiosClient';
import { commissionPlanApi, CommissionPlan } from '../../api/commissionPlanApi';

const MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

const LEVEL_CONFIG: Record<string, { label: string; color: string; bgColor: string; percentage: number }> = {
  N1: { label: 'Vendeur Direct', color: '#34C759', bgColor: 'bg-green-500', percentage: 10 },
  N2: { label: 'Manager', color: '#223B7B', bgColor: 'bg-blue-600', percentage: 5 },
  N3: { label: 'Directeur Régional', color: '#FF9500', bgColor: 'bg-orange-500', percentage: 3 },
  N4: { label: 'Directeur National', color: '#AF52DE', bgColor: 'bg-purple-500', percentage: 2 },
  N5: { label: 'Vice-Président', color: '#FF2D55', bgColor: 'bg-red-500', percentage: 1 },
};

const STATIC_COMMISSION_LEVELS = Object.entries(LEVEL_CONFIG).map(([level, cfg]) => ({ level, ...cfg }));

interface Affilie {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  niveau: string;
  recrues?: number;
  totalVentes?: number;
  totalCommissions?: number;
  statut: string;
}

interface CommissionRecord {
  id: string;
  affilieId: string;
  montantCommission: number;
  niveau: string;
  statut: string;
  creeLe: string;
  affilie?: { nom: string; prenom: string };
}

interface CommStat {
  niveau: string;
  total: number | string;
  count: number | string;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n);

const TreeNode: React.FC<{ node: any; depth: number }> = ({ node, depth }) => {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = node.children && node.children.length > 0;
  const levelColors = ['bg-nexsaas-deep-blue', 'bg-green-500', 'bg-orange-500', 'bg-purple-500'];
  const levelColor = levelColors[node.level] || 'bg-gray-500';

  return (
    <div className="relative">
      <div
        className={`flex items-center gap-2 p-3 rounded-xl mb-2 border transition-all cursor-pointer
          ${node.status === 'active' ? 'border-gray-200 dark:border-gray-700 hover:border-nexsaas-saas-green' : 'border-dashed border-gray-300 dark:border-gray-600 opacity-60'}
          bg-white dark:bg-gray-800`}
        style={{ marginLeft: `${depth * 24}px` }}
        onClick={() => setExpanded(!expanded)}
      >
        {hasChildren && (
          <button className="text-gray-400">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        )}
        {!hasChildren && <div className="w-4" />}
        <div className={`w-8 h-8 rounded-full ${levelColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
          {node.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-nexsaas-deep-blue dark:text-white truncate">{node.name}</p>
          <p className="text-xs text-gray-500">N{node.level} • {fmt(node.sales)} ventes</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold text-nexsaas-saas-green">{fmt(node.commission)}</p>
          <p className="text-xs text-gray-400">commission</p>
        </div>
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${node.status === 'active' ? 'bg-green-500' : node.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-300'}`} />
      </div>
      {hasChildren && expanded && (
        <div>
          {node.children.map((child: any) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const CommissionsPage: React.FC = () => {
  const [affilies, setAffilies] = useState<Affilie[]>([]);
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [commStats, setCommStats] = useState<CommStat[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAffiliateForm, setShowAffiliateForm] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'reseau' | 'paiements'>('overview');
  const [calcAmount, setCalcAmount] = useState('');
  const [calcLevel, setCalcLevel] = useState('N1');
  const [commissionPlans, setCommissionPlans] = useState<CommissionPlan[]>([]);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [simulationMontant, setSimulationMontant] = useState<number>(0);

  useEffect(() => {
    commissionPlanApi.getAll().then(setCommissionPlans).catch(console.error);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [affiliesRes, commissionsRes, statsRes] = await Promise.allSettled([
        axiosClient.get('/commissions/affilies'),
        axiosClient.get('/commissions'),
        axiosClient.get('/commissions/stats'),
      ]);
      if (affiliesRes.status === 'fulfilled') setAffilies(affiliesRes.value.data || []);
      if (commissionsRes.status === 'fulfilled') setCommissions(commissionsRes.value.data || []);
      if (statsRes.status === 'fulfilled') setCommStats(statsRes.value.data || []);
    } catch {
      // silently fail — UI shows empty state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const commissionHistory = useMemo(() => {
    const map = new Map<string, number>();
    commissions.forEach((c) => {
      const m = MOIS[new Date(c.creeLe).getMonth()];
      map.set(m, (map.get(m) ?? 0) + Number(c.montantCommission));
    });
    return MOIS.map((m) => ({ mois: m, montant: map.get(m) ?? 0 })).filter((d) => d.montant > 0);
  }, [commissions]);

  const commissionLevels = useMemo(() => {
    if (commStats.length > 0) {
      return commStats.map((s) => ({
        level: s.niveau,
        ...LEVEL_CONFIG[s.niveau] ?? { label: s.niveau, color: '#6B7280', bgColor: 'bg-gray-500', percentage: 0 },
        count: Number(s.count),
        total: Number(s.total),
      }));
    }
    return STATIC_COMMISSION_LEVELS.map((l) => ({ ...l, count: 0, total: 0 }));
  }, [commStats]);

  const affiliateTree = useMemo(() => {
    const n1 = affilies.filter((a) => a.niveau === 'N1').slice(0, 3);
    return {
      id: 'ROOT', name: 'Vous (Directeur)', level: 0,
      sales: affilies.reduce((s, a) => s + (a.totalVentes ?? 0), 0),
      commission: affilies.reduce((s, a) => s + (a.totalCommissions ?? 0), 0),
      status: 'active',
      children: n1.map((a) => ({
        id: a.id, name: `${a.nom} ${a.prenom}`, level: 1,
        sales: a.totalVentes ?? 0, commission: a.totalCommissions ?? 0,
        status: a.statut === 'ACTIF' ? 'active' : 'inactive',
        children: [],
      })),
    };
  }, [affilies]);

  const filteredAffilies = affilies.filter((a) =>
    `${a.nom} ${a.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
      ACTIF: { label: 'Actif', cls: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400', icon: <CheckCircle className="w-3 h-3" /> },
      active: { label: 'Actif', cls: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400', icon: <CheckCircle className="w-3 h-3" /> },
      INACTIF: { label: 'Inactif', cls: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400', icon: <XCircle className="w-3 h-3" /> },
      inactive: { label: 'Inactif', cls: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400', icon: <XCircle className="w-3 h-3" /> },
    };
    const s = map[status] ?? { label: status, cls: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-3 h-3" /> };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>
        {s.icon}{s.label}
      </span>
    );
  };

  const calcCommission = () => {
    const amount = parseFloat(calcAmount) || 0;
    const rates: Record<string, number> = { N1: 0.10, N2: 0.05, N3: 0.03, N4: 0.02, N5: 0.01 };
    return (amount * (rates[calcLevel] || 0)).toFixed(0);
  };

  const totalCommissions = commissions.reduce((s, c) => s + Number(c.montantCommission), 0);
  const totalSales = affilies.reduce((s, a) => s + (a.totalVentes ?? 0), 0);
  const activeCount = affilies.filter((a) => a.statut === 'ACTIF' || a.statut === 'active').length;

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-nexsaas-pure-white to-nexsaas-light-gray dark:from-nexsaas-vanta-black dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <Link to="/dashboard" className="mr-4">
                <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Retour</Button>
              </Link>
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl mr-4 shadow-lg">
                <Network className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-nexsaas-deep-blue dark:text-white">Commissions d'Affiliation</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Réseau multi-niveaux Forever Distribution</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />Actualiser
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowCalculator(true)}>
                <Calculator className="w-4 h-4 mr-1" />Simulateur
              </Button>
              <Button size="sm" onClick={() => setShowAffiliateForm(true)}>
                <UserPlus className="w-4 h-4 mr-1" />Inviter
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Affiliés actifs', value: loading ? '...' : String(activeCount), sub: `${affilies.length} au total`, icon: Users, color: 'from-green-500 to-emerald-600' },
            { label: 'Commissions totales', value: loading ? '...' : fmt(totalCommissions), sub: `${commissions.length} transactions`, icon: DollarSign, color: 'from-blue-500 to-blue-600' },
            { label: 'Ventes générées', value: loading ? '...' : fmt(totalSales), sub: 'Via réseau affiliés', icon: TrendingUp, color: 'from-purple-500 to-purple-600' },
            { label: 'Niveaux actifs', value: '5', sub: 'Structure multi-niveaux', icon: GitBranch, color: 'from-orange-500 to-red-500' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
              <Card>
                <div className={`h-1 w-full bg-gradient-to-r ${stat.color} mb-4 -mt-6 -mx-6`} style={{ marginTop: '-1.5rem', marginLeft: '-1.5rem', width: 'calc(100% + 3rem)' }} />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                    <h3 className="text-xl font-bold text-nexsaas-deep-blue dark:text-white">{stat.value}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
                  </div>
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-nexsaas-light-gray dark:bg-gray-800 p-1 rounded-xl w-fit mb-6">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: Award },
            { id: 'reseau', label: 'Réseau', icon: Network },
            { id: 'paiements', label: 'Paiements', icon: DollarSign },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
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

        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card>
              <h2 className="text-lg font-bold text-nexsaas-deep-blue dark:text-white mb-6">Structure des Commissions Multi-Niveaux</h2>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                {commissionLevels.map((lvl, i) => (
                  <motion.div key={lvl.level} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className="text-center p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                    <div className={`w-14 h-14 rounded-2xl ${lvl.bgColor} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                      <span className="text-white font-bold text-lg">{lvl.level}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{lvl.label}</p>
                    <p className="text-2xl font-black text-nexsaas-deep-blue dark:text-white">{lvl.percentage}%</p>
                    <p className="text-xs text-gray-400 mt-1">{lvl.count} affiliés</p>
                    <p className="text-sm font-bold text-nexsaas-saas-green mt-1">{fmt(lvl.total)}</p>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Plans de commission personnalisés */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-white mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-nexsaas-saas-green" />
                Plans de commission
              </h3>
              {commissionPlans.length === 0 ? (
                <p className="text-gray-500 text-sm">Aucun plan configuré. Les taux standards s'appliquent.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {commissionPlans.map(plan => (
                    <div key={plan.id} className="border border-gray-200 dark:border-gray-600 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-nexsaas-deep-blue dark:text-white">{plan.nom}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${plan.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {plan.actif ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-1 text-xs">
                        {['N1','N2','N3','N4','N5'].map((n, i) => (
                          <div key={n} className="text-center">
                            <div className="text-gray-500">{n}</div>
                            <div className="font-semibold text-nexsaas-deep-blue dark:text-white">
                              {[plan.tauxN1, plan.tauxN2, plan.tauxN3, plan.tauxN4, plan.tauxN5][i]}%
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        className="mt-3 text-xs text-nexsaas-saas-green underline"
                        onClick={async () => {
                          const montant = parseFloat(prompt('Montant de vente à simuler (FCFA):') || '0');
                          if (montant > 0) {
                            const result = await commissionPlanApi.simuler(plan.id, montant);
                            setSimulationResult(result);
                          }
                        }}
                      >
                        Simuler
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {simulationResult && (
                <div className="mt-4 p-4 bg-nexsaas-light-gray dark:bg-gray-700 rounded-xl">
                  <div className="font-medium mb-2">Résultat simulation — {simulationResult.plan}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Vente: {simulationResult.montantVente?.toLocaleString('fr-FR')} FCFA</div>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {simulationResult.simulation?.map((s: any) => (
                      <div key={s.niveau} className="text-center text-xs">
                        <div className="text-gray-500">{s.niveau} ({s.taux}%)</div>
                        <div className="font-semibold text-nexsaas-deep-blue dark:text-white">{Math.round(s.commission).toLocaleString('fr-FR')} F</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-sm font-semibold mt-2 text-nexsaas-saas-green">
                    Total: {Math.round(simulationResult.totalCommissions)?.toLocaleString('fr-FR')} FCFA
                  </div>
                  <button className="text-xs text-gray-400 mt-2" onClick={() => setSimulationResult(null)}>Fermer</button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h2 className="text-lg font-bold text-nexsaas-deep-blue dark:text-white mb-6">Historique Commissions</h2>
                {commissionHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">Aucune commission enregistrée</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={commissionHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="mois" tick={{ fontSize: 12, fill: '#6B7280' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: any) => [fmt(v), 'Commissions']} />
                      <Line type="monotone" dataKey="montant" stroke="#34C759" strokeWidth={2.5} dot={{ fill: '#34C759', r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Card>

              <Card>
                <h2 className="text-lg font-bold text-nexsaas-deep-blue dark:text-white mb-4">Commissions par Niveau</h2>
                {commissionLevels.every((l) => l.total === 0) ? (
                  <div className="text-center py-8 text-gray-400 text-sm">Aucune donnée</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={commissionLevels} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="level" tick={{ fontSize: 12, fill: '#6B7280' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: any) => [fmt(v), 'Total']} />
                      <Bar dataKey="total" radius={[6, 6, 0, 0]} fill="#34C759" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Card>
            </div>

            <Card>
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-nexsaas-deep-blue dark:text-white">Réseau d'Affiliés</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Rechercher..." value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                  />
                </div>
              </div>
              {loading && <div className="text-center py-8 text-gray-400">Chargement...</div>}
              {!loading && filteredAffilies.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">Aucun affilié trouvé</div>
              )}
              <div className="space-y-3">
                {filteredAffilies.map((aff, i) => (
                  <motion.div key={aff.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nexsaas-deep-blue to-blue-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {aff.nom[0]}{aff.prenom[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-nexsaas-deep-blue dark:text-white text-sm truncate">{aff.nom} {aff.prenom}</p>
                        <p className="text-xs text-gray-400 truncate">{aff.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="bg-nexsaas-deep-blue/10 text-nexsaas-deep-blue dark:bg-blue-900/20 dark:text-blue-400 px-2 py-0.5 rounded text-xs font-medium">{aff.niveau}</span>
                      {getStatusBadge(aff.statut)}
                      <span className="font-bold text-nexsaas-saas-green">{fmt(aff.totalCommissions ?? 0)}</span>
                    </div>
                    <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'reseau' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-nexsaas-deep-blue dark:text-white">Arborescence du Réseau</h2>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"/>Actif</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-300"/>Inactif</span>
                </div>
              </div>
              <div className="overflow-auto">
                <TreeNode node={affiliateTree} depth={0} />
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'paiements' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-nexsaas-deep-blue dark:text-white">Commissions en Attente de Paiement</h2>
              </div>
              {loading && <div className="text-center py-8 text-gray-400">Chargement...</div>}
              {!loading && commissions.filter((c) => c.statut !== 'paid').length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">Aucune commission en attente</div>
              )}
              <div className="space-y-3">
                {commissions.filter((c) => c.statut !== 'paid').map((c) => (
                  <div key={c.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex-1">
                      <p className="font-semibold text-nexsaas-deep-blue dark:text-white">
                        {c.affilie ? `${c.affilie.nom} ${c.affilie.prenom}` : c.affilieId.slice(0, 8)}
                      </p>
                      <p className="text-xs text-gray-400">{c.niveau} • {new Date(c.creeLe).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold text-nexsaas-saas-green">{fmt(Number(c.montantCommission))}</p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">En attente</p>
                      </div>
                      <Button size="sm" variant="outline"><CheckCircle className="w-4 h-4 mr-1" />Valider</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Calculator Modal */}
      <AnimatePresence>
        {showCalculator && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowCalculator(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-500 rounded-lg"><Calculator className="w-5 h-5 text-white" /></div>
                <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-white">Simulateur de Commission</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-white mb-2">Montant de la vente (FCFA)</label>
                  <input type="number" value={calcAmount} onChange={(e) => setCalcAmount(e.target.value)}
                    placeholder="Ex: 50000" className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-nexsaas-deep-blue dark:text-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none text-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-white mb-2">Niveau</label>
                  <select value={calcLevel} onChange={(e) => setCalcLevel(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-nexsaas-deep-blue dark:text-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none">
                    {STATIC_COMMISSION_LEVELS.map(l => <option key={l.level} value={l.level}>{l.level} - {l.label} ({l.percentage}%)</option>)}
                  </select>
                </div>
                {calcAmount && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gradient-to-r from-nexsaas-saas-green/10 to-blue-500/10 rounded-xl border border-nexsaas-saas-green/30">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Commission estimée pour {calcLevel}:</p>
                    <p className="text-3xl font-black text-nexsaas-saas-green">{fmt(Number(calcCommission()))}</p>
                    <p className="text-xs text-gray-400 mt-1">Sur {fmt(parseFloat(calcAmount))} de ventes</p>
                  </motion.div>
                )}
                <div className="grid grid-cols-5 gap-2">
                  {STATIC_COMMISSION_LEVELS.map(l => (
                    <div key={l.level} className="text-center text-xs p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="font-bold" style={{ color: l.color }}>{l.level}</p>
                      <p className="text-gray-500">{l.percentage}%</p>
                    </div>
                  ))}
                </div>
              </div>
              <Button className="w-full mt-6" onClick={() => setShowCalculator(false)}>Fermer</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invite Form Modal */}
      <AnimatePresence>
        {showAffiliateForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowAffiliateForm(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-nexsaas-deep-blue rounded-lg"><UserPlus className="w-5 h-5 text-white" /></div>
                <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-white">Inviter un Affilié</h2>
              </div>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-white mb-2">Email de l'affilié *</label>
                  <input type="email" placeholder="affilié@example.com"
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-nexsaas-deep-blue dark:text-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-white mb-2">Niveau d'affiliation</label>
                  <select className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-nexsaas-deep-blue dark:text-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none">
                    {STATIC_COMMISSION_LEVELS.map(l => <option key={l.level} value={l.level}>{l.level} - {l.label}</option>)}
                  </select>
                </div>
                <div className="flex gap-3 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowAffiliateForm(false)}>Annuler</Button>
                  <Button type="submit">Envoyer l'invitation</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommissionsPage;
