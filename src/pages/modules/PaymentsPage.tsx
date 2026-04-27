import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import {
  CreditCard, Search, ArrowLeft, Smartphone, Globe, CheckCircle,
  Clock, AlertCircle, DollarSign, ArrowUpRight, ArrowDownRight,
  Settings, Download, Eye, RefreshCw, Shield, Zap, TrendingUp
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { ventesApi, Vente } from '../../api/ventesApi';
import axiosClient from '../../api/axiosClient';
import { caisseApi, SessionCaisse } from '../../api/caisseApi';
import { financeApi, FinanceDashboard } from '../../api/financeApi';

const MOYEN_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  WAVE:         { label: 'Wave',         color: '#00BFFF', icon: '🌊' },
  ORANGE_MONEY: { label: 'Orange Money', color: '#FF6600', icon: '📱' },
  MTN_MONEY:    { label: 'MTN MoMo',    color: '#FFCC00', icon: '📱' },
  MOOV_MONEY:   { label: 'Moov Money',  color: '#0047AB', icon: '📱' },
  AUTRE:        { label: 'Autre',       color: '#374151', icon: '💵' },
};

const paymentGateways = [
  { id: 'wave',        name: 'Wave',         icon: Smartphone, description: 'Transferts & paiements Wave', fees: '0%',  color: 'bg-blue-400' },
  { id: 'orange',      name: 'Orange Money', icon: Smartphone, description: 'Mobile Money Orange',          fees: '1%',  color: 'bg-orange-500' },
  { id: 'mtn',         name: 'MTN MoMo',     icon: Smartphone, description: 'Mobile Money MTN',             fees: '1%',  color: 'bg-yellow-500' },
  { id: 'moov',        name: 'Moov Money',   icon: Globe,      description: 'Mobile Money Moov',            fees: '1%',  color: 'bg-blue-600' },
];

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n);

interface CommissionRecord {
  id: string;
  affilieId: string;
  montantCommission: number;
  statut: string;
  creeLe: string;
  affilie?: { nom: string; prenom: string };
}

const PaymentsPage: React.FC = () => {
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showConfig, setShowConfig] = useState(false);
  const [sessionCaisse, setSessionCaisse] = useState<SessionCaisse | null>(null);
  const [finDashboard, setFinDashboard] = useState<FinanceDashboard | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ventesData, commRes] = await Promise.allSettled([
        ventesApi.obtenirVentes(),
        axiosClient.get('/commissions'),
      ]);
      if (ventesData.status === 'fulfilled') setVentes(ventesData.value);
      if (commRes.status === 'fulfilled') setCommissions(commRes.value.data || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    caisseApi.getActive().then(setSessionCaisse).catch(console.error);
    financeApi.getDashboard().then(setFinDashboard).catch(console.error);
  }, []);

  type TxRow = {
    id: string; customer: string; amount: number; method: string;
    status: string; date: string; ref?: string; type: 'entrant' | 'sortant';
  };

  const transactions = useMemo((): TxRow[] => [
    ...ventes.map((v): TxRow => {
      const pct = v.total > 0 ? v.totalPaye / v.total : 0;
      const status = pct >= 1 ? 'completed' : pct > 0 ? 'pending' : 'pending';
      const clientNom = v.nomClient ? `${v.nomClient} ${v.prenomClient ?? ''}` : '—';
      return {
        id: `V-${v.id}`,
        customer: clientNom.trim(),
        amount: Number(v.totalPaye),
        method: MOYEN_CONFIG[v.moyenPaiement]?.label ?? v.moyenPaiement ?? 'Autre',
        status,
        date: new Date(v.dateVente).toLocaleDateString('fr-FR'),
        type: 'entrant',
      };
    }),
    ...commissions.filter((c) => c.statut === 'paid').map((c): TxRow => ({
      id: `COM-${c.id.slice(0, 6)}`,
      customer: c.affilie ? `${c.affilie.nom} ${c.affilie.prenom}` : c.affilieId.slice(0, 8),
      amount: Number(c.montantCommission),
      method: 'Mobile Money',
      status: 'completed',
      date: new Date(c.creeLe).toLocaleDateString('fr-FR'),
      type: 'sortant',
    })),
  ], [ventes, commissions]);

  const transactionHistory = useMemo(() => {
    const map = new Map<string, { montant: number; count: number }>();
    ventes.slice(-50).forEach((v) => {
      const d = new Date(v.dateVente);
      const key = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
      const prev = map.get(key) ?? { montant: 0, count: 0 };
      map.set(key, { montant: prev.montant + Number(v.totalPaye), count: prev.count + 1 });
    });
    return Array.from(map.entries()).slice(-7).map(([jour, v]) => ({ jour, ...v }));
  }, [ventes]);

  const methodData = useMemo(() => {
    const map = new Map<string, number>();
    ventes.forEach((v) => {
      const k = v.moyenPaiement ?? 'AUTRE';
      map.set(k, (map.get(k) ?? 0) + Number(v.totalPaye));
    });
    const total = Array.from(map.values()).reduce((s, v) => s + v, 0) || 1;
    return Array.from(map.entries()).map(([k, val]) => ({
      name: MOYEN_CONFIG[k]?.label ?? k,
      value: Math.round((val / total) * 100),
      color: MOYEN_CONFIG[k]?.color ?? '#6B7280',
      icon: MOYEN_CONFIG[k]?.icon ?? '💳',
    })).sort((a, b) => b.value - a.value);
  }, [ventes]);

  const gatewayStats = useMemo(() => {
    const map = new Map<string, { monthly: number; txCount: number }>();
    ventes.forEach((v) => {
      const k = v.moyenPaiement ?? 'AUTRE';
      const prev = map.get(k) ?? { monthly: 0, txCount: 0 };
      map.set(k, { monthly: prev.monthly + Number(v.totalPaye), txCount: prev.txCount + 1 });
    });
    return paymentGateways.map((gw) => {
      const key = Object.keys(MOYEN_CONFIG).find((k) => MOYEN_CONFIG[k].label === gw.name) ?? '';
      const stats = map.get(key) ?? { monthly: 0, txCount: 0 };
      return { ...gw, ...stats, status: 'active' };
    });
  }, [ventes]);

  const filtered = transactions.filter((t) => {
    const matchSearch = t.customer.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalVolume = transactions.filter((t) => t.type === 'entrant' && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
  const pendingCount = transactions.filter((t) => t.status === 'pending').length;
  const completedCount = transactions.filter((t) => t.status === 'completed').length;
  const successRate = transactions.length > 0 ? Math.round((completedCount / transactions.length) * 100) : 0;

  const statusBadge = (status: string) => {
    const map: Record<string, { cls: string; label: string; icon: React.ReactNode }> = {
      completed: { cls: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400', label: 'Complété', icon: <CheckCircle className="w-3 h-3" /> },
      pending: { cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400', label: 'En attente', icon: <Clock className="w-3 h-3" /> },
      failed: { cls: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400', label: 'Échoué', icon: <AlertCircle className="w-3 h-3" /> },
    };
    const s = map[status] || map.pending;
    return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>{s.icon}{s.label}</span>;
  };

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-nexsaas-pure-white to-nexsaas-light-gray dark:from-nexsaas-vanta-black dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <Link to="/dashboard" className="mr-4">
                <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Retour</Button>
              </Link>
              <div className="p-3 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl mr-4 shadow-lg">
                <CreditCard className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-nexsaas-deep-blue dark:text-white">Paiements & Finances</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Wave · Orange Money · MTN · Moov</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowConfig(true)}>
                <Settings className="w-4 h-4 mr-1" />Config
              </Button>
              <Button size="sm"><Download className="w-4 h-4 mr-1" />Exporter</Button>
            </div>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Volume encaissé', value: loading ? '...' : `${fmt(totalVolume)} FCFA`, change: '+', positive: true, icon: TrendingUp, color: 'from-teal-500 to-emerald-600' },
            { label: 'Transactions', value: loading ? '...' : String(transactions.length), change: null, positive: true, icon: Zap, color: 'from-blue-500 to-blue-600' },
            { label: 'En attente', value: loading ? '...' : String(pendingCount), change: 'À traiter', positive: null, icon: Clock, color: 'from-yellow-500 to-orange-500' },
            { label: 'Taux succès', value: loading ? '...' : `${successRate}%`, change: null, positive: successRate >= 80, icon: Shield, color: 'from-green-500 to-emerald-500' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
              <Card>
                <div className={`h-1 w-full bg-gradient-to-r ${stat.color} -mt-6 -mx-6 mb-4`} style={{ marginTop: '-1.5rem', marginLeft: '-1.5rem', width: 'calc(100% + 3rem)' }} />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                    <h3 className="text-xl font-bold text-nexsaas-deep-blue dark:text-white">{stat.value}</h3>
                  </div>
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                {stat.positive !== null && stat.change && (
                  <div className={`flex items-center mt-2 text-xs font-medium ${stat.positive ? 'text-green-600' : 'text-red-500'}`}>
                    {stat.positive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                    {stat.change}
                  </div>
                )}
                {stat.positive === null && stat.change && <p className="text-xs text-yellow-600 mt-2">{stat.change}</p>}
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Finance & Caisse Dashboard */}
        {finDashboard && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
              <div className="text-sm text-gray-500">Créances clients</div>
              <div className="text-2xl font-bold text-nexsaas-deep-blue">
                {finDashboard.totalCreancesClients?.toLocaleString('fr-FR')} FCFA
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-500">Dettes fournisseurs</div>
              <div className="text-2xl font-bold text-orange-600">
                {finDashboard.totalDettessFournisseurs?.toLocaleString('fr-FR')} FCFA
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-500">Session caisse</div>
              <div className="text-2xl font-bold">
                {sessionCaisse ? (
                  <span className="text-green-600">Ouverte</span>
                ) : (
                  <span className="text-gray-400">Fermée</span>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <h2 className="text-lg font-bold text-nexsaas-deep-blue dark:text-white mb-6">Volume des Encaissements (7 derniers jours)</h2>
            {transactionHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">Aucune donnée disponible</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={transactionHistory} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorPay" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="jour" tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(v) => `${fmt(v / 1000)}k`} />
                  <Tooltip formatter={(v: any) => [`${fmt(v)} FCFA`, 'Montant']} />
                  <Area type="monotone" dataKey="montant" stroke="#0D9488" strokeWidth={2} fill="url(#colorPay)" name="Montant" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-nexsaas-deep-blue dark:text-white mb-4">Répartition Moyens</h2>
            {methodData.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">Aucune donnée</div>
            ) : (
              <div className="space-y-3">
                {methodData.map((m) => (
                  <div key={m.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">{m.icon} {m.name}</span>
                      <span className="font-bold text-nexsaas-deep-blue dark:text-white">{m.value}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${m.value}%`, backgroundColor: m.color }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Gateways */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
          <h2 className="text-lg font-bold text-nexsaas-deep-blue dark:text-white mb-4">Moyens de Paiement</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {gatewayStats.map((gw, i) => (
              <motion.div key={gw.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 ${gw.color} rounded-xl`}>
                      <gw.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                  <h3 className="font-bold text-nexsaas-deep-blue dark:text-white mb-1">{gw.name}</h3>
                  <p className="text-xs text-gray-400 mb-3 leading-tight">{gw.description}</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Frais: <span className="text-nexsaas-deep-blue dark:text-white font-medium">{gw.fees}</span></span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-nexsaas-saas-green font-bold">{fmt(gw.monthly)} FCFA</p>
                    <p className="text-xs text-gray-400">{gw.txCount} transactions</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Transactions list */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-nexsaas-deep-blue dark:text-white">Historique Transactions</h2>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none" />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none">
                  <option value="all">Tous</option>
                  <option value="completed">Complétés</option>
                  <option value="pending">En attente</option>
                </select>
                <Button variant="ghost" size="sm" onClick={fetchData}><RefreshCw className="w-4 h-4" /></Button>
              </div>
            </div>

            {loading && <div className="text-center py-8 text-gray-400">Chargement...</div>}

            {!loading && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      {['Réf.', 'Client', 'Montant', 'Méthode', 'Type', 'Statut', 'Date', ''].map((h) => (
                        <th key={h} className="text-left py-3 px-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {filtered.length === 0 && (
                      <tr><td colSpan={8} className="text-center py-8 text-gray-400">Aucune transaction</td></tr>
                    )}
                    {filtered.map((tx, i) => (
                      <motion.tr key={tx.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="py-3 px-2">
                          <span className="text-xs font-mono text-gray-500">{tx.id}</span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="font-medium text-nexsaas-deep-blue dark:text-white truncate max-w-[120px] block">{tx.customer}</span>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`font-bold ${tx.type === 'entrant' ? 'text-nexsaas-saas-green' : 'text-red-500'}`}>
                            {tx.type === 'sortant' ? '−' : '+'}{fmt(tx.amount)} FCFA
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-xs text-gray-500">{tx.method}</span>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`text-xs font-medium ${tx.type === 'entrant' ? 'text-green-600' : 'text-red-500'}`}>
                            {tx.type === 'entrant' ? 'Entrant' : 'Sortant'}
                          </span>
                        </td>
                        <td className="py-3 px-2">{statusBadge(tx.status)}</td>
                        <td className="py-3 px-2">
                          <span className="text-xs text-gray-400">{tx.date}</span>
                        </td>
                        <td className="py-3 px-2">
                          <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Config Modal */}
      <AnimatePresence>
        {showConfig && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowConfig(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-teal-500 rounded-lg"><Settings className="w-5 h-5 text-white" /></div>
                <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-white">Moyens de Paiement Actifs</h2>
              </div>
              <div className="space-y-4">
                {paymentGateways.map((gw) => (
                  <div key={gw.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${gw.color} rounded-lg`}><gw.icon className="w-4 h-4 text-white" /></div>
                      <div>
                        <p className="font-medium text-nexsaas-deep-blue dark:text-white text-sm">{gw.name}</p>
                        <p className="text-xs text-gray-400">Frais: {gw.fees}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-10 h-5 bg-gray-200 peer-checked:bg-nexsaas-saas-green rounded-full transition-colors" />
                    </label>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-6" onClick={() => setShowConfig(false)}>Fermer</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentsPage;
