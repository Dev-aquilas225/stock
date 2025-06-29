import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Star,
  Package,
  TrendingUp,
  Clock,
  DollarSign,
  X,
  Save,
  AlertTriangle,
  History,
  ShoppingCart,
  Award,
  MessageCircle
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import { useToast } from '../../contexts/ToastContext';
import { useActivity } from '../../contexts/ActivityContext';

interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  category: 'principal' | 'secondaire';
  rating: number;
  paymentTerms: string;
  deliveryTime: string;
  minimumOrder: number;
  discount: number;
  status: 'active' | 'inactive';
  createdAt: string;
  lastOrder: string;
  totalOrders: number;
  totalAmount: number;
  products: Product[];
  contacts: Contact[];
  notes: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  currentPrice: number;
  previousPrice?: number;
  deliveryTime: string;
  minimumQuantity: number;
  packaging: string;
  priceHistory: PriceHistory[];
}

interface PriceHistory {
  id: string;
  price: number;
  date: string;
  negotiatedBy: string;
  notes: string;
}

interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: 'SUP-001',
      name: 'TechSupply SARL',
      email: 'contact@techsupply.com',
      phone: '+33 1 23 45 67 89',
      address: '123 Rue de la Tech, 75001 Paris',
      category: 'principal',
      rating: 4.5,
      paymentTerms: '30 jours',
      deliveryTime: '5-7 jours',
      minimumOrder: 1000,
      discount: 5,
      status: 'active',
      createdAt: '2024-01-10',
      lastOrder: '2024-01-15',
      totalOrders: 25,
      totalAmount: 125000,
      products: [
        {
          id: 'PROD-001',
          name: 'Ordinateur portable HP',
          category: 'Informatique',
          currentPrice: 750,
          previousPrice: 800,
          deliveryTime: '3-5 jours',
          minimumQuantity: 10,
          packaging: 'Carton de 10',
          priceHistory: [
            {
              id: 'PH-001',
              price: 800,
              date: '2023-12-01',
              negotiatedBy: 'Jean Dupont',
              notes: 'Prix initial'
            },
            {
              id: 'PH-002',
              price: 750,
              date: '2024-01-01',
              negotiatedBy: 'Marie Martin',
              notes: 'Négociation volume - commande 100+ unités'
            }
          ]
        }
      ],
      contacts: [
        {
          id: 'CONT-001',
          name: 'Pierre Durand',
          role: 'Commercial',
          email: 'pierre@techsupply.com',
          phone: '+33 1 23 45 67 90',
          isPrimary: true
        }
      ],
      notes: 'Fournisseur fiable, délais respectés'
    },
    {
      id: 'SUP-002',
      name: 'ElectroMax',
      email: 'info@electromax.fr',
      phone: '+33 1 98 76 54 32',
      address: '456 Avenue de l\'Électronique, 69000 Lyon',
      category: 'secondaire',
      rating: 3.8,
      paymentTerms: '45 jours',
      deliveryTime: '7-10 jours',
      minimumOrder: 500,
      discount: 3,
      status: 'active',
      createdAt: '2024-01-05',
      lastOrder: '2024-01-12',
      totalOrders: 12,
      totalAmount: 45000,
      products: [],
      contacts: [],
      notes: ''
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showPriceHistoryModal, setShowPriceHistoryModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newRating, setNewRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');

  const { showToast } = useToast();
  const { logActivity } = useActivity();

  const [supplierForm, setSupplierForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    category: 'principal' as 'principal' | 'secondaire',
    paymentTerms: '',
    deliveryTime: '',
    minimumOrder: '',
    discount: '',
    notes: ''
  });

  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    currentPrice: '',
    deliveryTime: '',
    minimumQuantity: '',
    packaging: ''
  });

  const [contactForm, setContactForm] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    isPrimary: false
  });

  const resetForms = () => {
    setSupplierForm({
      name: '',
      email: '',
      phone: '',
      address: '',
      category: 'principal',
      paymentTerms: '',
      deliveryTime: '',
      minimumOrder: '',
      discount: '',
      notes: ''
    });
    setProductForm({
      name: '',
      category: '',
      currentPrice: '',
      deliveryTime: '',
      minimumQuantity: '',
      packaging: ''
    });
    setContactForm({
      name: '',
      role: '',
      email: '',
      phone: '',
      isPrimary: false
    });
  };

  const handleAddSupplier = () => {
    setEditingSupplier(null);
    resetForms();
    setShowSupplierModal(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setSupplierForm({
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      category: supplier.category,
      paymentTerms: supplier.paymentTerms,
      deliveryTime: supplier.deliveryTime,
      minimumOrder: supplier.minimumOrder.toString(),
      discount: supplier.discount.toString(),
      notes: supplier.notes
    });
    setShowSupplierModal(true);
  };

  const handleDeleteSupplier = (supplierId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      setSuppliers(prev => prev.filter(s => s.id !== supplierId));
      
      logActivity({
        type: 'delete',
        module: 'Fournisseurs',
        description: `Fournisseur supprimé: ${supplierId}`,
        metadata: { supplierId }
      });

      showToast({
        type: 'success',
        title: 'Fournisseur supprimé',
        message: 'Le fournisseur a été supprimé avec succès'
      });
    }
  };

  const handleSaveSupplier = () => {
    if (!supplierForm.name || !supplierForm.email) {
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Veuillez remplir tous les champs obligatoires'
      });
      return;
    }

    if (editingSupplier) {
      // Update existing supplier
      setSuppliers(prev => prev.map(supplier => 
        supplier.id === editingSupplier.id 
          ? {
              ...supplier,
              ...supplierForm,
              minimumOrder: parseFloat(supplierForm.minimumOrder) || 0,
              discount: parseFloat(supplierForm.discount) || 0
            }
          : supplier
      ));

      logActivity({
        type: 'update',
        module: 'Fournisseurs',
        description: `Fournisseur modifié: ${supplierForm.name}`,
        metadata: { supplierId: editingSupplier.id }
      });

      showToast({
        type: 'success',
        title: 'Fournisseur modifié',
        message: 'Les informations du fournisseur ont été mises à jour'
      });
    } else {
      // Add new supplier
      const newSupplier: Supplier = {
        id: `SUP-${String(suppliers.length + 1).padStart(3, '0')}`,
        ...supplierForm,
        minimumOrder: parseFloat(supplierForm.minimumOrder) || 0,
        discount: parseFloat(supplierForm.discount) || 0,
        rating: 0,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
        lastOrder: '',
        totalOrders: 0,
        totalAmount: 0,
        products: [],
        contacts: []
      };

      setSuppliers(prev => [newSupplier, ...prev]);

      logActivity({
        type: 'create',
        module: 'Fournisseurs',
        description: `Nouveau fournisseur ajouté: ${supplierForm.name}`,
        metadata: { supplierId: newSupplier.id }
      });

      showToast({
        type: 'success',
        title: 'Fournisseur ajouté',
        message: 'Le nouveau fournisseur a été créé avec succès'
      });
    }

    setShowSupplierModal(false);
    resetForms();
  };

  const handleAddProduct = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setEditingProduct(null);
    resetForms();
    setShowProductModal(true);
  };

  const handleEditProduct = (supplier: Supplier, product: Product) => {
    setSelectedSupplier(supplier);
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      currentPrice: product.currentPrice.toString(),
      deliveryTime: product.deliveryTime,
      minimumQuantity: product.minimumQuantity.toString(),
      packaging: product.packaging
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = () => {
    if (!selectedSupplier || !productForm.name) return;

    if (editingProduct) {
      // Update existing product
      setSuppliers(prev => prev.map(supplier => 
        supplier.id === selectedSupplier.id
          ? {
              ...supplier,
              products: supplier.products.map(product =>
                product.id === editingProduct.id
                  ? {
                      ...product,
                      ...productForm,
                      currentPrice: parseFloat(productForm.currentPrice) || 0,
                      minimumQuantity: parseInt(productForm.minimumQuantity) || 0
                    }
                  : product
              )
            }
          : supplier
      ));

      showToast({
        type: 'success',
        title: 'Produit modifié',
        message: 'Le produit a été mis à jour avec succès'
      });
    } else {
      // Add new product
      const newProduct: Product = {
        id: `PROD-${Date.now()}`,
        ...productForm,
        currentPrice: parseFloat(productForm.currentPrice) || 0,
        minimumQuantity: parseInt(productForm.minimumQuantity) || 0,
        priceHistory: [{
          id: `PH-${Date.now()}`,
          price: parseFloat(productForm.currentPrice) || 0,
          date: new Date().toISOString().split('T')[0],
          negotiatedBy: 'Système',
          notes: 'Prix initial'
        }]
      };

      setSuppliers(prev => prev.map(supplier => 
        supplier.id === selectedSupplier.id
          ? { ...supplier, products: [...supplier.products, newProduct] }
          : supplier
      ));

      showToast({
        type: 'success',
        title: 'Produit ajouté',
        message: 'Le nouveau produit a été ajouté au catalogue'
      });
    }

    setShowProductModal(false);
    resetForms();
  };

  const handleShowPriceHistory = (product: Product) => {
    setSelectedProduct(product);
    setShowPriceHistoryModal(true);
  };

  const handleRateSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setNewRating(supplier.rating);
    setRatingComment('');
    setShowRatingModal(true);
  };

  const handleSaveRating = () => {
    if (!selectedSupplier) return;

    setSuppliers(prev => prev.map(supplier => 
      supplier.id === selectedSupplier.id
        ? { ...supplier, rating: newRating }
        : supplier
    ));

    logActivity({
      type: 'update',
      module: 'Fournisseurs',
      description: `Note attribuée au fournisseur ${selectedSupplier.name}: ${newRating}/5`,
      metadata: { 
        supplierId: selectedSupplier.id, 
        rating: newRating,
        comment: ratingComment 
      }
    });

    showToast({
      type: 'success',
      title: 'Note enregistrée',
      message: `Note de ${newRating}/5 attribuée au fournisseur`
    });

    setShowRatingModal(false);
  };

  const getCategoryColor = (category: string) => {
    return category === 'principal' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
  };

  const getStatusColor = (status: string) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
  };

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && onRate && onRate(star)}
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star 
              className={`w-4 h-4 ${
                star <= rating 
                  ? 'text-yellow-400 fill-current' 
                  : 'text-gray-300'
              }`} 
            />
          </button>
        ))}
        <span className="text-sm text-nexsaas-vanta-black dark:text-gray-300 ml-2">
          ({rating.toFixed(1)})
        </span>
      </div>
    );
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || supplier.category === categoryFilter;
    return matchesSearch && matchesCategory;
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
            <div className="p-3 bg-indigo-500 rounded-lg mr-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                Gestion des Fournisseurs
              </h1>
              <p className="text-nexsaas-vanta-black dark:text-gray-300">
                Gestion complète de vos partenaires fournisseurs
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
            <div className="p-3 bg-indigo-500/10 rounded-lg inline-block mb-3">
              <Building2 className="w-6 h-6 text-indigo-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              {suppliers.length}
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              Fournisseurs actifs
            </p>
          </Card>
          
          <Card className="text-center">
            <div className="p-3 bg-green-500/10 rounded-lg inline-block mb-3">
              <Star className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              {(suppliers.reduce((acc, s) => acc + s.rating, 0) / suppliers.length).toFixed(1)}
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              Note moyenne
            </p>
          </Card>
          
          <Card className="text-center">
            <div className="p-3 bg-blue-500/10 rounded-lg inline-block mb-3">
              <Package className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              {suppliers.reduce((acc, s) => acc + s.products.length, 0)}
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              Produits catalogués
            </p>
          </Card>
          
          <Card className="text-center">
            <div className="p-3 bg-purple-500/10 rounded-lg inline-block mb-3">
              <DollarSign className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              €{suppliers.reduce((acc, s) => acc + s.totalAmount, 0).toLocaleString()}
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              Volume d'achats
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
                    placeholder="Rechercher un fournisseur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                  />
                </div>
                
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                >
                  <option value="all">Toutes catégories</option>
                  <option value="principal">Principal</option>
                  <option value="secondaire">Secondaire</option>
                </select>
              </div>
              
              <Button onClick={handleAddSupplier}>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau fournisseur
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Suppliers List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="space-y-6"
        >
          {filteredSuppliers.map((supplier, index) => (
            <motion.div
              key={supplier.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                          {supplier.name}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(supplier.category)}`}>
                          {supplier.category}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(supplier.status)}`}>
                          {supplier.status}
                        </span>
                      </div>
                      {renderStars(supplier.rating)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                          {supplier.email}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                          {supplier.phone}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                          {supplier.address}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                          Délai: {supplier.deliveryTime}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                          Min: €{supplier.minimumOrder}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                          Remise: {supplier.discount}%
                        </span>
                      </div>
                    </div>

                    {/* Products */}
                    {supplier.products.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                          Produits ({supplier.products.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {supplier.products.slice(0, 4).map((product) => (
                            <div key={product.id} className="bg-nexsaas-light-gray dark:bg-gray-700 rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h5 className="font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white text-sm">
                                    {product.name}
                                  </h5>
                                  <p className="text-xs text-nexsaas-vanta-black dark:text-gray-300">
                                    {product.category} • Min: {product.minimumQuantity}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-nexsaas-saas-green">
                                    €{product.currentPrice}
                                  </p>
                                  <div className="flex space-x-1">
                                    <button
                                      onClick={() => handleShowPriceHistory(product)}
                                      className="text-xs text-blue-500 hover:text-blue-600"
                                    >
                                      <History className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => handleEditProduct(supplier, product)}
                                      className="text-xs text-gray-500 hover:text-gray-600"
                                    >
                                      <Edit className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {supplier.products.length > 4 && (
                          <p className="text-xs text-nexsaas-vanta-black dark:text-gray-300 mt-2">
                            +{supplier.products.length - 4} autres produits
                          </p>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-lg font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                          {supplier.totalOrders}
                        </p>
                        <p className="text-xs text-nexsaas-vanta-black dark:text-gray-300">
                          Commandes
                        </p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-nexsaas-saas-green">
                          €{supplier.totalAmount.toLocaleString()}
                        </p>
                        <p className="text-xs text-nexsaas-vanta-black dark:text-gray-300">
                          Volume total
                        </p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                          {supplier.lastOrder || 'Aucune'}
                        </p>
                        <p className="text-xs text-nexsaas-vanta-black dark:text-gray-300">
                          Dernière commande
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 mt-4 lg:mt-0 lg:ml-6">
                    <Button variant="outline" size="sm" onClick={() => handleRateSupplier(supplier)}>
                      <Award className="w-4 h-4 mr-1" />
                      Noter
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleAddProduct(supplier)}>
                      <Plus className="w-4 h-4 mr-1" />
                      Produit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditSupplier(supplier)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Modifier
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteSupplier(supplier.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Supplier Modal */}
        {showSupplierModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowSupplierModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-nexsaas-pure-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                  {editingSupplier ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setShowSupplierModal(false)}>
                  <X className="w-6 h-6" />
                </Button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nom du fournisseur"
                    value={supplierForm.name}
                    onChange={(value) => setSupplierForm(prev => ({ ...prev, name: value }))}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={supplierForm.email}
                    onChange={(value) => setSupplierForm(prev => ({ ...prev, email: value }))}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Téléphone"
                    value={supplierForm.phone}
                    onChange={(value) => setSupplierForm(prev => ({ ...prev, phone: value }))}
                  />
                  <div>
                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                      Catégorie
                    </label>
                    <select
                      value={supplierForm.category}
                      onChange={(e) => setSupplierForm(prev => ({ ...prev, category: e.target.value as 'principal' | 'secondaire' }))}
                      className="w-full px-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                    >
                      <option value="principal">Principal</option>
                      <option value="secondaire">Secondaire</option>
                    </select>
                  </div>
                </div>
                
                <Input
                  label="Adresse"
                  value={supplierForm.address}
                  onChange={(value) => setSupplierForm(prev => ({ ...prev, address: value }))}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Conditions de paiement"
                    value={supplierForm.paymentTerms}
                    onChange={(value) => setSupplierForm(prev => ({ ...prev, paymentTerms: value }))}
                    placeholder="ex: 30 jours"
                  />
                  <Input
                    label="Délai de livraison"
                    value={supplierForm.deliveryTime}
                    onChange={(value) => setSupplierForm(prev => ({ ...prev, deliveryTime: value }))}
                    placeholder="ex: 5-7 jours"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Commande minimum (€)"
                    type="number"
                    value={supplierForm.minimumOrder}
                    onChange={(value) => setSupplierForm(prev => ({ ...prev, minimumOrder: value }))}
                  />
                  <Input
                    label="Remise (%)"
                    type="number"
                    value={supplierForm.discount}
                    onChange={(value) => setSupplierForm(prev => ({ ...prev, discount: value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                    Notes
                  </label>
                  <textarea
                    value={supplierForm.notes}
                    onChange={(e) => setSupplierForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                    placeholder="Notes sur le fournisseur..."
                  />
                </div>
                
                <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={() => setShowSupplierModal(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleSaveSupplier}>
                    <Save className="w-4 h-4 mr-2" />
                    {editingSupplier ? 'Modifier' : 'Créer'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Product Modal */}
        {showProductModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowProductModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-nexsaas-pure-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                  {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setShowProductModal(false)}>
                  <X className="w-6 h-6" />
                </Button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nom du produit"
                    value={productForm.name}
                    onChange={(value) => setProductForm(prev => ({ ...prev, name: value }))}
                    required
                  />
                  <Input
                    label="Catégorie"
                    value={productForm.category}
                    onChange={(value) => setProductForm(prev => ({ ...prev, category: value }))}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Prix actuel (€)"
                    type="number"
                    step="0.01"
                    value={productForm.currentPrice}
                    onChange={(value) => setProductForm(prev => ({ ...prev, currentPrice: value }))}
                    required
                  />
                  <Input
                    label="Quantité minimum"
                    type="number"
                    value={productForm.minimumQuantity}
                    onChange={(value) => setProductForm(prev => ({ ...prev, minimumQuantity: value }))}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Délai de livraison"
                    value={productForm.deliveryTime}
                    onChange={(value) => setProductForm(prev => ({ ...prev, deliveryTime: value }))}
                    placeholder="ex: 3-5 jours"
                  />
                  <Input
                    label="Conditionnement"
                    value={productForm.packaging}
                    onChange={(value) => setProductForm(prev => ({ ...prev, packaging: value }))}
                    placeholder="ex: Carton de 10"
                  />
                </div>
                
                <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={() => setShowProductModal(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleSaveProduct}>
                    <Save className="w-4 h-4 mr-2" />
                    {editingProduct ? 'Modifier' : 'Ajouter'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Price History Modal */}
        {showPriceHistoryModal && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowPriceHistoryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-nexsaas-pure-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                  Historique des prix - {selectedProduct.name}
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setShowPriceHistoryModal(false)}>
                  <X className="w-6 h-6" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {selectedProduct.priceHistory.map((history, index) => (
                  <div key={history.id} className="border border-nexsaas-light-gray dark:border-gray-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg font-bold text-nexsaas-saas-green">
                          €{history.price}
                        </span>
                        {index === 0 && (
                          <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-full">
                            Prix actuel
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                        {history.date}
                      </span>
                    </div>
                    <div className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                      <p><strong>Négocié par:</strong> {history.negotiatedBy}</p>
                      <p><strong>Notes:</strong> {history.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Rating Modal */}
        {showRatingModal && selectedSupplier && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowRatingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-nexsaas-pure-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                  Noter le fournisseur
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setShowRatingModal(false)}>
                  <X className="w-6 h-6" />
                </Button>
              </div>
              
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                    {selectedSupplier.name}
                  </h3>
                  <p className="text-nexsaas-vanta-black dark:text-gray-300 mb-4">
                    Évaluez la performance de ce fournisseur
                  </p>
                  
                  <div className="flex justify-center mb-4">
                    {renderStars(newRating, true, setNewRating)}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                    Commentaire (optionnel)
                  </label>
                  <textarea
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                    placeholder="Votre évaluation..."
                  />
                </div>
                
                <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={() => setShowRatingModal(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleSaveRating} disabled={newRating === 0}>
                    <Award className="w-4 h-4 mr-2" />
                    Enregistrer la note
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

export default SuppliersPage;