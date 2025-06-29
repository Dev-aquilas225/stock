import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ArrowLeft,
  Calendar,
  User,
  Building,
  Truck,
  RotateCcw,
  AlertTriangle,
  Check,
  X,
  FileText
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import { useToast } from '../../contexts/ToastContext';
import { useActivity } from '../../contexts/ActivityContext';

interface OrderItem {
  id: string;
  name: string;
  quantityOrdered: number;
  quantityReceived: number;
  quantityDefective: number;
  unitPrice: number;
  status: 'pending' | 'partial' | 'received' | 'defective';
}

interface Order {
  id: string;
  supplier: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'approved' | 'shipped' | 'delivered' | 'completed' | 'returned';
  orderDate: string;
  deliveryDate: string;
  receivedDate?: string;
  notes?: string;
}

interface ReturnRequest {
  id: string;
  orderId: string;
  items: { itemId: string; quantity: number; reason: string }[];
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  requestDate: string;
  reason: string;
}

const SupplyPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { showToast } = useToast();
  const { logActivity } = useActivity();

  const [formData, setFormData] = useState({
    supplier: '',
    products: '',
    quantity: '',
    unitPrice: '',
    deliveryDate: '',
    notes: '',
  });

  const [receiveData, setReceiveData] = useState<{[key: string]: { received: number; defective: number }}>({});
  const [returnData, setReturnData] = useState({
    reason: '',
    items: [] as { itemId: string; quantity: number; reason: string }[]
  });

  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'CMD-001',
      supplier: 'TechSupply SARL',
      items: [
        {
          id: 'ITEM-001',
          name: 'Ordinateurs portables HP',
          quantityOrdered: 25,
          quantityReceived: 0,
          quantityDefective: 0,
          unitPrice: 750,
          status: 'pending'
        }
      ],
      totalAmount: 18750,
      status: 'shipped',
      orderDate: '2024-01-15',
      deliveryDate: '2024-01-25',
    },
    {
      id: 'CMD-002',
      supplier: 'ElectroMax',
      items: [
        {
          id: 'ITEM-002',
          name: 'Smartphones Samsung',
          quantityOrdered: 50,
          quantityReceived: 45,
          quantityDefective: 3,
          unitPrice: 500,
          status: 'partial'
        }
      ],
      totalAmount: 25000,
      status: 'delivered',
      orderDate: '2024-01-12',
      deliveryDate: '2024-01-22',
      receivedDate: '2024-01-22'
    },
    {
      id: 'CMD-003',
      supplier: 'OfficeWorld',
      items: [
        {
          id: 'ITEM-003',
          name: 'Mobilier de bureau',
          quantityOrdered: 15,
          quantityReceived: 15,
          quantityDefective: 0,
          unitPrice: 300,
          status: 'received'
        }
      ],
      totalAmount: 4500,
      status: 'completed',
      orderDate: '2024-01-10',
      deliveryDate: '2024-01-20',
      receivedDate: '2024-01-20'
    },
  ]);

  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([
    {
      id: 'RET-001',
      orderId: 'CMD-002',
      items: [{ itemId: 'ITEM-002', quantity: 3, reason: 'Écrans défectueux' }],
      status: 'pending',
      requestDate: '2024-01-23',
      reason: 'Produits défectueux à la réception'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'approved': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'shipped': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'delivered': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'returned': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <Package className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'returned': return <RotateCcw className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrder: Order = {
      id: `CMD-${String(orders.length + 1).padStart(3, '0')}`,
      supplier: formData.supplier,
      items: [{
        id: `ITEM-${Date.now()}`,
        name: formData.products,
        quantityOrdered: parseInt(formData.quantity),
        quantityReceived: 0,
        quantityDefective: 0,
        unitPrice: parseFloat(formData.unitPrice),
        status: 'pending'
      }],
      totalAmount: parseInt(formData.quantity) * parseFloat(formData.unitPrice),
      status: 'pending',
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDate: formData.deliveryDate,
      notes: formData.notes
    };

    setOrders(prev => [newOrder, ...prev]);
    
    logActivity({
      type: 'create',
      module: 'Approvisionnements',
      description: `Nouvelle commande créée: ${newOrder.id}`,
      metadata: { orderId: newOrder.id, supplier: newOrder.supplier }
    });

    showToast({
      type: 'success',
      title: 'Commande créée',
      message: `La commande ${newOrder.id} a été créée avec succès`
    });

    setShowForm(false);
    setFormData({
      supplier: '',
      products: '',
      quantity: '',
      unitPrice: '',
      deliveryDate: '',
      notes: '',
    });
  };

  const handleReceiveOrder = (order: Order) => {
    setSelectedOrder(order);
    const initialReceiveData: {[key: string]: { received: number; defective: number }} = {};
    order.items.forEach(item => {
      initialReceiveData[item.id] = {
        received: item.quantityOrdered - item.quantityReceived,
        defective: 0
      };
    });
    setReceiveData(initialReceiveData);
    setShowReceiveModal(true);
  };

  const confirmReceive = () => {
    if (!selectedOrder) return;

    const updatedOrders = orders.map(order => {
      if (order.id === selectedOrder.id) {
        const updatedItems = order.items.map(item => {
          const receiveInfo = receiveData[item.id];
          if (receiveInfo) {
            return {
              ...item,
              quantityReceived: item.quantityReceived + receiveInfo.received,
              quantityDefective: item.quantityDefective + receiveInfo.defective,
              status: (item.quantityReceived + receiveInfo.received >= item.quantityOrdered) 
                ? (receiveInfo.defective > 0 ? 'defective' : 'received')
                : 'partial'
            };
          }
          return item;
        });

        const allReceived = updatedItems.every(item => 
          item.quantityReceived >= item.quantityOrdered
        );

        return {
          ...order,
          items: updatedItems,
          status: allReceived ? 'completed' : 'delivered',
          receivedDate: new Date().toISOString().split('T')[0]
        };
      }
      return order;
    });

    setOrders(updatedOrders);

    logActivity({
      type: 'update',
      module: 'Approvisionnements',
      description: `Réception confirmée pour la commande ${selectedOrder.id}`,
      metadata: { orderId: selectedOrder.id, receiveData }
    });

    showToast({
      type: 'success',
      title: 'Réception confirmée',
      message: `La réception de la commande ${selectedOrder.id} a été enregistrée`
    });

    setShowReceiveModal(false);
    setSelectedOrder(null);
    setReceiveData({});
  };

  const handleReturnRequest = (order: Order) => {
    setSelectedOrder(order);
    setReturnData({
      reason: '',
      items: order.items
        .filter(item => item.quantityDefective > 0)
        .map(item => ({
          itemId: item.id,
          quantity: item.quantityDefective,
          reason: 'Produit défectueux'
        }))
    });
    setShowReturnModal(true);
  };

  const submitReturnRequest = () => {
    if (!selectedOrder || returnData.items.length === 0) return;

    const newReturn: ReturnRequest = {
      id: `RET-${String(returnRequests.length + 1).padStart(3, '0')}`,
      orderId: selectedOrder.id,
      items: returnData.items,
      status: 'pending',
      requestDate: new Date().toISOString().split('T')[0],
      reason: returnData.reason
    };

    setReturnRequests(prev => [newReturn, ...prev]);

    logActivity({
      type: 'create',
      module: 'Approvisionnements',
      description: `Demande de retour créée: ${newReturn.id}`,
      metadata: { returnId: newReturn.id, orderId: selectedOrder.id }
    });

    showToast({
      type: 'info',
      title: 'Demande de retour envoyée',
      message: `La demande de retour ${newReturn.id} a été envoyée au fournisseur`
    });

    setShowReturnModal(false);
    setSelectedOrder(null);
    setReturnData({ reason: '', items: [] });
  };

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));

    logActivity({
      type: 'update',
      module: 'Approvisionnements',
      description: `Statut de la commande ${orderId} mis à jour: ${newStatus}`,
      metadata: { orderId, newStatus }
    });

    showToast({
      type: 'success',
      title: 'Statut mis à jour',
      message: `Le statut de la commande ${orderId} a été mis à jour`
    });
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
            <div className="p-3 bg-blue-500 rounded-lg mr-4">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                Gestion des Approvisionnements
              </h1>
              <p className="text-nexsaas-vanta-black dark:text-gray-300">
                Créez, suivez et gérez vos commandes fournisseurs
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8"
        >
          <Card className="text-center">
            <div className="p-3 bg-yellow-500/10 rounded-lg inline-block mb-3">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              {orders.filter(o => o.status === 'pending').length}
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              En attente
            </p>
          </Card>
          
          <Card className="text-center">
            <div className="p-3 bg-purple-500/10 rounded-lg inline-block mb-3">
              <Truck className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              {orders.filter(o => o.status === 'shipped').length}
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              Expédiées
            </p>
          </Card>
          
          <Card className="text-center">
            <div className="p-3 bg-orange-500/10 rounded-lg inline-block mb-3">
              <Package className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              {orders.filter(o => o.status === 'delivered').length}
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              Livrées
            </p>
          </Card>
          
          <Card className="text-center">
            <div className="p-3 bg-green-500/10 rounded-lg inline-block mb-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              {orders.filter(o => o.status === 'completed').length}
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              Terminées
            </p>
          </Card>
          
          <Card className="text-center">
            <div className="p-3 bg-red-500/10 rounded-lg inline-block mb-3">
              <RotateCcw className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              {returnRequests.filter(r => r.status === 'pending').length}
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              Retours en cours
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
                    placeholder="Rechercher une commande..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="approved">Approuvées</option>
                  <option value="shipped">Expédiées</option>
                  <option value="delivered">Livrées</option>
                  <option value="completed">Terminées</option>
                  <option value="returned">Retournées</option>
                </select>
              </div>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle commande
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Orders List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="space-y-4"
        >
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mr-3">
                        {order.id}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                      <div className="flex items-center">
                        <Building className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-nexsaas-vanta-black dark:text-gray-300">
                          {order.supplier}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-nexsaas-vanta-black dark:text-gray-300">
                          Livraison: {order.deliveryDate}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-nexsaas-vanta-black dark:text-gray-300">
                          {order.items.length} article{order.items.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-nexsaas-saas-green">
                          €{order.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Items Details */}
                    <div className="space-y-2">
                      {order.items.map(item => (
                        <div key={item.id} className="bg-nexsaas-light-gray dark:bg-gray-700 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                {item.name}
                              </h4>
                              <div className="flex items-center space-x-4 text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                <span>Commandé: {item.quantityOrdered}</span>
                                <span>Reçu: {item.quantityReceived}</span>
                                {item.quantityDefective > 0 && (
                                  <span className="text-red-500">Défectueux: {item.quantityDefective}</span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-nexsaas-saas-green">
                                €{item.unitPrice}
                              </span>
                              <div className="text-xs text-nexsaas-vanta-black dark:text-gray-300">
                                par unité
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 mt-4 lg:mt-0 lg:ml-4">
                    {order.status === 'pending' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'approved')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approuver
                      </Button>
                    )}
                    
                    {order.status === 'approved' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'shipped')}
                      >
                        <Truck className="w-4 h-4 mr-1" />
                        Marquer expédiée
                      </Button>
                    )}
                    
                    {(order.status === 'shipped' || order.status === 'delivered') && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleReceiveOrder(order)}
                      >
                        <Package className="w-4 h-4 mr-1" />
                        Confirmer réception
                      </Button>
                    )}
                    
                    {order.items.some(item => item.quantityDefective > 0) && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleReturnRequest(order)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Demander retour
                      </Button>
                    )}
                    
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Form Modal */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-nexsaas-pure-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-6">
                Nouvelle Commande Fournisseur
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Fournisseur"
                    value={formData.supplier}
                    onChange={(value) => setFormData({...formData, supplier: value})}
                    icon={Building}
                    required
                  />
                  <Input
                    label="Date de livraison"
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(value) => setFormData({...formData, deliveryDate: value})}
                    icon={Calendar}
                    required
                  />
                </div>
                
                <Input
                  label="Produits"
                  value={formData.products}
                  onChange={(value) => setFormData({...formData, products: value})}
                  placeholder="Description des produits commandés"
                  required
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Quantité"
                    type="number"
                    value={formData.quantity}
                    onChange={(value) => setFormData({...formData, quantity: value})}
                    required
                  />
                  <Input
                    label="Prix unitaire (€)"
                    type="number"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(value) => setFormData({...formData, unitPrice: value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                    Notes (optionnel)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                    placeholder="Informations complémentaires..."
                  />
                </div>
                
                <div className="flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowForm(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit">
                    Créer la commande
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Receive Modal */}
        {showReceiveModal && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowReceiveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-nexsaas-pure-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-6">
                Confirmer la Réception - {selectedOrder.id}
              </h2>
              
              <div className="space-y-6">
                {selectedOrder.items.map(item => (
                  <div key={item.id} className="border border-nexsaas-light-gray dark:border-gray-600 rounded-lg p-4">
                    <h3 className="font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-4">
                      {item.name}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                          Quantité commandée
                        </label>
                        <input
                          type="number"
                          value={item.quantityOrdered}
                          disabled
                          className="w-full px-4 py-2 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-nexsaas-deep-blue dark:text-nexsaas-pure-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                          Quantité reçue
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={item.quantityOrdered - item.quantityReceived}
                          value={receiveData[item.id]?.received || 0}
                          onChange={(e) => setReceiveData(prev => ({
                            ...prev,
                            [item.id]: {
                              ...prev[item.id],
                              received: parseInt(e.target.value) || 0
                            }
                          }))}
                          className="w-full px-4 py-2 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                          Quantité défectueuse
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={receiveData[item.id]?.received || 0}
                          value={receiveData[item.id]?.defective || 0}
                          onChange={(e) => setReceiveData(prev => ({
                            ...prev,
                            [item.id]: {
                              ...prev[item.id],
                              defective: parseInt(e.target.value) || 0
                            }
                          }))}
                          className="w-full px-4 py-2 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowReceiveModal(false)}
                  >
                    Annuler
                  </Button>
                  <Button onClick={confirmReceive}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirmer la réception
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Return Modal */}
        {showReturnModal && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowReturnModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-nexsaas-pure-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-6">
                Demande de Retour - {selectedOrder.id}
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                    Motif du retour
                  </label>
                  <textarea
                    value={returnData.reason}
                    onChange={(e) => setReturnData(prev => ({ ...prev, reason: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                    placeholder="Décrivez le motif du retour..."
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-4">
                    Articles à retourner
                  </h3>
                  
                  {returnData.items.map((returnItem, index) => {
                    const item = selectedOrder.items.find(i => i.id === returnItem.itemId);
                    if (!item) return null;
                    
                    return (
                      <div key={returnItem.itemId} className="border border-nexsaas-light-gray dark:border-gray-600 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                            {item.name}
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReturnData(prev => ({
                              ...prev,
                              items: prev.items.filter((_, i) => i !== index)
                            }))}
                            className="text-red-500 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                              Quantité à retourner
                            </label>
                            <input
                              type="number"
                              min="1"
                              max={item.quantityDefective}
                              value={returnItem.quantity}
                              onChange={(e) => {
                                const newItems = [...returnData.items];
                                newItems[index].quantity = parseInt(e.target.value) || 1;
                                setReturnData(prev => ({ ...prev, items: newItems }));
                              }}
                              className="w-full px-4 py-2 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                              Motif spécifique
                            </label>
                            <input
                              type="text"
                              value={returnItem.reason}
                              onChange={(e) => {
                                const newItems = [...returnData.items];
                                newItems[index].reason = e.target.value;
                                setReturnData(prev => ({ ...prev, items: newItems }));
                              }}
                              className="w-full px-4 py-2 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                              placeholder="Ex: Écran cassé, défaut de fabrication..."
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowReturnModal(false)}
                  >
                    Annuler
                  </Button>
                  <Button 
                    onClick={submitReturnRequest}
                    disabled={returnData.items.length === 0 || !returnData.reason}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Envoyer la demande
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SupplyPage;