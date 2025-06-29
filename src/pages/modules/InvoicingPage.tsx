import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Search, 
  Download, 
  Send, 
  Eye, 
  ArrowLeft,
  Calendar,
  User,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';

const InvoicingPage: React.FC = () => {
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [invoiceData, setInvoiceData] = useState({
    clientName: '',
    clientEmail: '',
    items: [{ description: '', quantity: 1, price: 0 }],
    dueDate: '',
    notes: '',
  });

  const invoices = [
    {
      id: 'INV-001',
      clientName: 'Marie Dubois',
      clientEmail: 'marie@example.com',
      amount: 2799,
      status: 'paid',
      issueDate: '2024-01-15',
      dueDate: '2024-02-15',
      items: ['MacBook Pro 14"', 'AirPods Pro'],
    },
    {
      id: 'INV-002',
      clientName: 'Jean Martin',
      clientEmail: 'jean@example.com',
      amount: 1199,
      status: 'pending',
      issueDate: '2024-01-14',
      dueDate: '2024-02-14',
      items: ['iPhone 15 Pro'],
    },
    {
      id: 'INV-003',
      clientName: 'Sophie Laurent',
      clientEmail: 'sophie@example.com',
      amount: 999,
      status: 'overdue',
      issueDate: '2024-01-10',
      dueDate: '2024-01-25',
      items: ['Samsung Galaxy S24'],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const addItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, { description: '', quantity: 1, price: 0 }]
    });
  };

  const removeItem = (index: number) => {
    const newItems = invoiceData.items.filter((_, i) => i !== index);
    setInvoiceData({ ...invoiceData, items: newItems });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...invoiceData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setInvoiceData({ ...invoiceData, items: newItems });
  };

  const calculateTotal = () => {
    return invoiceData.items.reduce((total, item) => total + (item.quantity * item.price), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Nouvelle facture:', invoiceData);
    setShowInvoiceForm(false);
    setInvoiceData({
      clientName: '',
      clientEmail: '',
      items: [{ description: '', quantity: 1, price: 0 }],
      dueDate: '',
      notes: '',
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
            <div className="p-3 bg-red-500 rounded-lg mr-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                Facturation & Documents
              </h1>
              <p className="text-nexsaas-vanta-black dark:text-gray-300">
                Génération et envoi automatiques
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
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              €18,450
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              Factures payées
            </p>
          </Card>
          
          <Card className="text-center">
            <div className="p-3 bg-yellow-500/10 rounded-lg inline-block mb-3">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              €5,200
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              En attente
            </p>
          </Card>
          
          <Card className="text-center">
            <div className="p-3 bg-red-500/10 rounded-lg inline-block mb-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              €1,800
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              En retard
            </p>
          </Card>
          
          <Card className="text-center">
            <div className="p-3 bg-blue-500/10 rounded-lg inline-block mb-3">
              <FileText className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              156
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              Total factures
            </p>
          </Card>
        </motion.div>

        {/* Actions Bar */}
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
                    placeholder="Rechercher une facture..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </Button>
              </div>
              <Button onClick={() => setShowInvoiceForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle facture
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Invoices List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="space-y-4"
        >
          {invoices.map((invoice, index) => (
            <motion.div
              key={invoice.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mr-3">
                        {invoice.id}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {getStatusIcon(invoice.status)}
                        <span className="ml-1 capitalize">{invoice.status}</span>
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <p className="text-nexsaas-vanta-black dark:text-gray-300 font-medium">
                            {invoice.clientName}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 text-xs">
                            {invoice.clientEmail}
                          </p>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Articles:</span>
                        <p className="text-nexsaas-vanta-black dark:text-gray-300 font-medium">
                          {invoice.items.join(', ')}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <p className="text-nexsaas-vanta-black dark:text-gray-300 font-medium">
                            Émise: {invoice.issueDate}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 text-xs">
                            Échéance: {invoice.dueDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-lg font-bold text-nexsaas-saas-green">
                          €{invoice.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-4 lg:mt-0">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Invoice Form Modal */}
        {showInvoiceForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowInvoiceForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-nexsaas-pure-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-6">
                Créer une Facture
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nom du client"
                    value={invoiceData.clientName}
                    onChange={(value) => setInvoiceData({...invoiceData, clientName: value})}
                    icon={User}
                    required
                  />
                  <Input
                    label="Email du client"
                    type="email"
                    value={invoiceData.clientEmail}
                    onChange={(value) => setInvoiceData({...invoiceData, clientEmail: value})}
                    required
                  />
                </div>

                <Input
                  label="Date d'échéance"
                  type="date"
                  value={invoiceData.dueDate}
                  onChange={(value) => setInvoiceData({...invoiceData, dueDate: value})}
                  icon={Calendar}
                  required
                />

                {/* Items */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                      Articles
                    </h3>
                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {invoiceData.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg">
                        <div className="md:col-span-2">
                          <input
                            type="text"
                            placeholder="Description de l'article"
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            placeholder="Quantité"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Prix"
                            value={item.price}
                            onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                            className="flex-1 px-3 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                          />
                          {invoiceData.items.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              ×
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 text-right">
                    <span className="text-lg font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                      Total: €{calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                    Notes (optionnel)
                  </label>
                  <textarea
                    value={invoiceData.notes}
                    onChange={(e) => setInvoiceData({...invoiceData, notes: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                    placeholder="Notes additionnelles..."
                  />
                </div>
                
                <div className="flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowInvoiceForm(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit">
                    Créer la facture
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

export default InvoicingPage;