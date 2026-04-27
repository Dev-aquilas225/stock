import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FileText, Plus, Search, Download, Send, Eye, ArrowLeft,
  Calendar, User, DollarSign, CheckCircle, Clock, AlertCircle,
  Printer, X, Building2, Phone, Mail, Package, RefreshCw
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import axiosClient from '../../api/axiosClient';

interface InvoiceItem { description: string; quantity: number; price: number }
interface InvoiceData {
  clientName: string; clientEmail: string; clientPhone: string; clientAddress: string;
  items: InvoiceItem[]; dueDate: string; notes: string;
}

interface Facture {
  id: string;
  numero?: string;
  clientNom?: string;
  clientEmail?: string;
  montantTotal: number;
  statut: string;
  creeLe: string;
  dateEcheance?: string;
  lignes?: Array<{ description: string; quantite: number; prixUnitaire: number }>;
}

const defaultInvoice: InvoiceData = {
  clientName: '', clientEmail: '', clientPhone: '', clientAddress: '',
  items: [{ description: '', quantity: 1, price: 0 }],
  dueDate: '', notes: '',
};

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n);

const statusConfig: Record<string, { cls: string; label: string; icon: React.ReactNode }> = {
  PAYEE: { cls: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400', label: 'Payée', icon: <CheckCircle className="w-3 h-3" /> },
  paid: { cls: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400', label: 'Payée', icon: <CheckCircle className="w-3 h-3" /> },
  EN_ATTENTE: { cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400', label: 'En attente', icon: <Clock className="w-3 h-3" /> },
  pending: { cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400', label: 'En attente', icon: <Clock className="w-3 h-3" /> },
  EN_RETARD: { cls: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400', label: 'En retard', icon: <AlertCircle className="w-3 h-3" /> },
  overdue: { cls: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400', label: 'En retard', icon: <AlertCircle className="w-3 h-3" /> },
  BROUILLON: { cls: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400', label: 'Brouillon', icon: <FileText className="w-3 h-3" /> },
  draft: { cls: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400', label: 'Brouillon', icon: <FileText className="w-3 h-3" /> },
};

const normalizeStatut = (s: string) => {
  if (['PAYEE', 'paid'].includes(s)) return 'paid';
  if (['EN_RETARD', 'overdue'].includes(s)) return 'overdue';
  if (['BROUILLON', 'draft'].includes(s)) return 'draft';
  return 'pending';
};

const InvoicingPage: React.FC = () => {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Facture | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(defaultInvoice);

  const fetchFactures = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/facturation');
      setFactures(res.data || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFactures(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axiosClient.post('/facturation', {
        clientNom: invoiceData.clientName,
        clientEmail: invoiceData.clientEmail,
        clientTelephone: invoiceData.clientPhone,
        dateEcheance: invoiceData.dueDate,
        notes: invoiceData.notes,
        lignes: invoiceData.items.map((i) => ({
          description: i.description,
          quantite: i.quantity,
          prixUnitaire: i.price,
        })),
      });
      setShowForm(false);
      setInvoiceData(defaultInvoice);
      await fetchFactures();
    } catch {
      // keep form open on error
    } finally {
      setSaving(false);
    }
  };

  const filtered = factures.filter((inv) => {
    const matchSearch = (inv.clientNom ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.numero ?? inv.id).toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || normalizeStatut(inv.statut) === statusFilter;
    return matchSearch && matchStatus;
  });

  const calcTotal = () => invoiceData.items.reduce((s, i) => s + i.quantity * i.price, 0);
  const addItem = () => setInvoiceData({ ...invoiceData, items: [...invoiceData.items, { description: '', quantity: 1, price: 0 }] });
  const removeItem = (i: number) => setInvoiceData({ ...invoiceData, items: invoiceData.items.filter((_, idx) => idx !== i) });
  const updateItem = (i: number, field: string, value: any) => {
    const items = [...invoiceData.items];
    items[i] = { ...items[i], [field]: value };
    setInvoiceData({ ...invoiceData, items });
  };

  const totalPaid = factures.filter((i) => normalizeStatut(i.statut) === 'paid').reduce((s, i) => s + i.montantTotal, 0);
  const totalPending = factures.filter((i) => normalizeStatut(i.statut) === 'pending').reduce((s, i) => s + i.montantTotal, 0);
  const totalOverdue = factures.filter((i) => normalizeStatut(i.statut) === 'overdue').reduce((s, i) => s + i.montantTotal, 0);

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-nexsaas-pure-white to-nexsaas-light-gray dark:from-nexsaas-vanta-black dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <Link to="/dashboard" className="mr-4">
                <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Retour</Button>
              </Link>
              <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl mr-4 shadow-lg">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-nexsaas-deep-blue dark:text-white">Facturation & Documents</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Génération automatique • Envoi email/WhatsApp</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchFactures} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button size="sm" onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-1" />Nouvelle facture
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Factures payées', value: loading ? '...' : `${fmt(totalPaid)} FCFA`, icon: CheckCircle, color: 'from-green-500 to-emerald-500', sub: `${factures.filter(i => normalizeStatut(i.statut) === 'paid').length} factures` },
            { label: 'En attente', value: loading ? '...' : `${fmt(totalPending)} FCFA`, icon: Clock, color: 'from-yellow-400 to-orange-500', sub: `${factures.filter(i => normalizeStatut(i.statut) === 'pending').length} factures` },
            { label: 'En retard', value: loading ? '...' : `${fmt(totalOverdue)} FCFA`, icon: AlertCircle, color: 'from-red-500 to-rose-600', sub: `${factures.filter(i => normalizeStatut(i.statut) === 'overdue').length} factures` },
            { label: 'Total documents', value: loading ? '...' : String(factures.length), icon: FileText, color: 'from-blue-500 to-blue-600', sub: 'Toutes périodes' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
              <Card>
                <div className={`h-1 w-full bg-gradient-to-r ${stat.color} -mt-6 -mx-6 mb-4`} style={{ marginTop: '-1.5rem', marginLeft: '-1.5rem', width: 'calc(100% + 3rem)' }} />
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

        {/* Filters bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
          <Card padding="sm">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {['all', 'paid', 'pending', 'overdue', 'draft'].map((s) => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      statusFilter === s
                        ? 'bg-nexsaas-deep-blue text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}>
                    {s === 'all' ? 'Toutes' : statusConfig[s]?.label || s}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-white focus:ring-2 focus:ring-red-400 focus:outline-none" />
              </div>
            </div>
          </Card>
        </motion.div>

        {loading && <div className="text-center py-12 text-gray-400">Chargement des factures...</div>}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            {factures.length === 0 ? 'Aucune facture créée — cliquez sur «Nouvelle facture» pour commencer' : 'Aucune facture correspond aux filtres'}
          </div>
        )}

        {!loading && (
          <div className="space-y-3">
            {filtered.map((inv, i) => {
              const sc = statusConfig[inv.statut] ?? statusConfig['pending'];
              const num = inv.numero ?? `FAC-${inv.id.slice(0, 6).toUpperCase()}`;
              return (
                <motion.div key={inv.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card padding="sm" className="hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {num.slice(-3)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-bold text-nexsaas-deep-blue dark:text-white text-sm">{num}</span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc?.cls}`}>
                              {sc?.icon}{sc?.label}
                            </span>
                          </div>
                          <p className="text-sm text-nexsaas-deep-blue dark:text-gray-200 font-medium">{inv.clientNom ?? '—'}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                            <span><Calendar className="inline w-3 h-3 mr-1" />Créée: {new Date(inv.creeLe).toLocaleDateString('fr-FR')}</span>
                            {inv.dateEcheance && <span>Échéance: {new Date(inv.dateEcheance).toLocaleDateString('fr-FR')}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        <span className="text-lg font-black text-nexsaas-saas-green">{fmt(inv.montantTotal)} FCFA</span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setPreviewInvoice(inv)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm"><Download className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm"><Send className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Invoice Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500 rounded-xl"><FileText className="w-5 h-5 text-white" /></div>
                  <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-white">Créer une Facture</h2>
                </div>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="p-4 bg-nexsaas-deep-blue/5 dark:bg-blue-900/10 rounded-xl border border-nexsaas-deep-blue/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4 text-nexsaas-deep-blue dark:text-blue-400" />
                    <span className="text-sm font-semibold text-nexsaas-deep-blue dark:text-white">FOREVER Distribution SARL</span>
                  </div>
                  <p className="text-xs text-gray-400">Dakar, Sénégal • Tél: +221 77 000 0000</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-white mb-2">Nom du client *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="text" value={invoiceData.clientName} onChange={(e) => setInvoiceData({ ...invoiceData, clientName: e.target.value })}
                        placeholder="Nom complet" required className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-nexsaas-deep-blue dark:text-white focus:ring-2 focus:ring-red-400 focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-white mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="email" value={invoiceData.clientEmail} onChange={(e) => setInvoiceData({ ...invoiceData, clientEmail: e.target.value })}
                        placeholder="email@example.com" className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-nexsaas-deep-blue dark:text-white focus:ring-2 focus:ring-red-400 focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-white mb-2">Téléphone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="tel" value={invoiceData.clientPhone} onChange={(e) => setInvoiceData({ ...invoiceData, clientPhone: e.target.value })}
                        placeholder="+221 77 000 0000" className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-nexsaas-deep-blue dark:text-white focus:ring-2 focus:ring-red-400 focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-white mb-2">Date d'échéance *</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="date" value={invoiceData.dueDate} onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
                        required className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-nexsaas-deep-blue dark:text-white focus:ring-2 focus:ring-red-400 focus:outline-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-nexsaas-deep-blue dark:text-white flex items-center gap-2">
                      <Package className="w-4 h-4" />Articles
                    </h3>
                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                      <Plus className="w-3 h-3 mr-1" />Ajouter
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {invoiceData.items.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <div className="col-span-5">
                          <input type="text" placeholder="Description produit" value={item.description} onChange={(e) => updateItem(idx, 'description', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-white focus:ring-2 focus:ring-red-400 focus:outline-none" />
                        </div>
                        <div className="col-span-2">
                          <input type="number" placeholder="Qté" value={item.quantity} min={1} onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-white focus:ring-2 focus:ring-red-400 focus:outline-none" />
                        </div>
                        <div className="col-span-3">
                          <input type="number" placeholder="Prix" value={item.price} min={0} onChange={(e) => updateItem(idx, 'price', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-white focus:ring-2 focus:ring-red-400 focus:outline-none" />
                        </div>
                        <div className="col-span-2 flex items-center justify-between">
                          <span className="text-xs font-bold text-nexsaas-saas-green">{fmt(item.quantity * item.price)}</span>
                          {invoiceData.items.length > 1 && (
                            <button type="button" onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-3 bg-nexsaas-deep-blue/5 dark:bg-blue-900/10 rounded-xl flex justify-between items-center">
                    <span className="font-medium text-gray-600 dark:text-gray-400">Total HT</span>
                    <span className="text-xl font-black text-nexsaas-deep-blue dark:text-white">{fmt(calcTotal())} FCFA</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-white mb-2">Notes</label>
                  <textarea value={invoiceData.notes} onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
                    rows={2} placeholder="Conditions de paiement, notes..."
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-nexsaas-deep-blue dark:text-white focus:ring-2 focus:ring-red-400 focus:outline-none resize-none text-sm" />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
                  <Button type="submit" disabled={saving} className="bg-gradient-to-r from-red-500 to-rose-500">
                    <Send className="w-4 h-4 mr-1" />{saving ? 'Création...' : 'Créer la facture'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invoice Preview Modal */}
      <AnimatePresence>
        {previewInvoice && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setPreviewInvoice(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 bg-nexsaas-deep-blue rounded-lg"><Building2 className="w-4 h-4 text-white" /></div>
                    <span className="font-black text-nexsaas-deep-blue dark:text-white text-lg">FOREVER SARL</span>
                  </div>
                  <p className="text-xs text-gray-400">Distribution Forever</p>
                  <p className="text-xs text-gray-400">Dakar, Sénégal</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-nexsaas-deep-blue dark:text-white">
                    {previewInvoice.numero ?? `FAC-${previewInvoice.id.slice(0, 6).toUpperCase()}`}
                  </p>
                  <p className="text-xs text-gray-400">Créée: {new Date(previewInvoice.creeLe).toLocaleDateString('fr-FR')}</p>
                  {previewInvoice.dateEcheance && (
                    <p className="text-xs text-gray-400">Échéance: {new Date(previewInvoice.dateEcheance).toLocaleDateString('fr-FR')}</p>
                  )}
                </div>
              </div>
              <div className="border-t border-b border-gray-200 dark:border-gray-700 py-4 mb-6">
                <p className="text-xs text-gray-400 mb-1">Facturé à:</p>
                <p className="font-bold text-nexsaas-deep-blue dark:text-white">{previewInvoice.clientNom ?? '—'}</p>
                {previewInvoice.clientEmail && <p className="text-sm text-gray-500">{previewInvoice.clientEmail}</p>}
              </div>
              {previewInvoice.lignes && previewInvoice.lignes.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Articles</p>
                  {previewInvoice.lignes.map((l, i) => (
                    <div key={i} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 text-sm">
                      <span className="text-nexsaas-deep-blue dark:text-gray-200">{l.description} × {l.quantite}</span>
                      <span className="font-medium">{fmt(l.prixUnitaire * l.quantite)} FCFA</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between items-center p-4 bg-nexsaas-deep-blue rounded-xl text-white mb-6">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-black">{fmt(previewInvoice.montantTotal)} FCFA</span>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setPreviewInvoice(null)}><X className="w-4 h-4 mr-1" />Fermer</Button>
                <Button className="flex-1"><Download className="w-4 h-4 mr-1" />Télécharger PDF</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InvoicingPage;
