import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  QrCode, 
  Package, 
  AlertTriangle,
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  Upload,
  BarChart3,
  Eye,
  Hash,
  Calendar,
  User,
  MapPin,
  CheckCircle,
  Clock,
  AlertCircle,
  Printer
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import QRCodePrint from '../../components/QRCode/QRCodePrint';
import { useToast } from '../../contexts/ToastContext';
import { useActivity } from '../../contexts/ActivityContext';

interface ProductUnit {
  id: string;
  qrCode: string;
  serialNumber: string;
  status: 'available' | 'sold' | 'reserved' | 'damaged' | 'returned';
  location: string;
  receivedDate: string;
  soldDate?: string;
  soldTo?: string;
  notes?: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  minStock: number;
  description: string;
  supplier: string;
  units: ProductUnit[];
  totalReceived: number;
  totalSold: number;
  totalAvailable: number;
  totalDamaged: number;
}

const StockPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: 'PRD-001',
      name: 'MacBook Pro 14"',
      category: 'Informatique',
      basePrice: 2499,
      minStock: 5,
      description: 'MacBook Pro 14 pouces avec puce M3',
      supplier: 'TechSupply SARL',
      totalReceived: 20,
      totalSold: 5,
      totalAvailable: 15,
      totalDamaged: 0,
      units: [
        {
          id: 'UNIT-001',
          qrCode: 'QR-PRD-001-UNIT-001',
          serialNumber: 'MBP14-2024-001',
          status: 'available',
          location: 'Entrepôt A - Étagère 1',
          receivedDate: '2024-01-10',
          notes: 'État neuf'
        },
        {
          id: 'UNIT-002',
          qrCode: 'QR-PRD-001-UNIT-002',
          serialNumber: 'MBP14-2024-002',
          status: 'sold',
          location: 'Vendu',
          receivedDate: '2024-01-10',
          soldDate: '2024-01-15',
          soldTo: 'Marie Dubois',
          notes: 'Vendu avec garantie étendue'
        },
        {
          id: 'UNIT-003',
          qrCode: 'QR-PRD-001-UNIT-003',
          serialNumber: 'MBP14-2024-003',
          status: 'reserved',
          location: 'Entrepôt A - Étagère 1',
          receivedDate: '2024-01-12',
          notes: 'Réservé pour commande client'
        }
      ]
    },
    {
      id: 'PRD-002',
      name: 'iPhone 15 Pro',
      category: 'Téléphonie',
      basePrice: 1199,
      minStock: 10,
      description: 'iPhone 15 Pro 128GB',
      supplier: 'ElectroMax',
      totalReceived: 50,
      totalSold: 47,
      totalAvailable: 3,
      totalDamaged: 0,
      units: [
        {
          id: 'UNIT-004',
          qrCode: 'QR-PRD-002-UNIT-004',
          serialNumber: 'IP15P-2024-001',
          status: 'available',
          location: 'Entrepôt B - Étagère 2',
          receivedDate: '2024-01-08',
          notes: 'Couleur Titane Naturel'
        },
        {
          id: 'UNIT-005',
          qrCode: 'QR-PRD-002-UNIT-005',
          serialNumber: 'IP15P-2024-002',
          status: 'available',
          location: 'Entrepôt B - Étagère 2',
          receivedDate: '2024-01-08',
          notes: 'Couleur Titane Bleu'
        },
        {
          id: 'UNIT-006',
          qrCode: 'QR-PRD-002-UNIT-006',
          serialNumber: 'IP15P-2024-003',
          status: 'available',
          location: 'Entrepôt B - Étagère 2',
          receivedDate: '2024-01-08',
          notes: 'Couleur Titane Blanc'
        }
      ]
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [showUnitsModal, setShowUnitsModal] = useState(false);
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [showQRPrint, setShowQRPrint] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<ProductUnit | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { showToast } = useToast();
  const { logActivity } = useActivity();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    basePrice: '',
    minStock: '',
    description: '',
    supplier: ''
  });

  const [unitForm, setUnitForm] = useState({
    serialNumber: '',
    location: '',
    notes: '',
    quantity: '1'
  });

  const resetForms = () => {
    setFormData({
      name: '',
      category: '',
      basePrice: '',
      minStock: '',
      description: '',
      supplier: ''
    });
    setUnitForm({
      serialNumber: '',
      location: '',
      notes: '',
      quantity: '1'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'sold': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'reserved': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'damaged': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'returned': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-4 h-4" />;
      case 'sold': return <ShoppingCart className="w-4 h-4" />;
      case 'reserved': return <Clock className="w-4 h-4" />;
      case 'damaged': return <AlertCircle className="w-4 h-4" />;
      case 'returned': return <Package className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getStockStatus = (product: Product) => {
    if (product.totalAvailable === 0) return { status: 'out_of_stock', text: 'Rupture', color: 'text-red-500' };
    if (product.totalAvailable <= product.minStock) return { status: 'low_stock', text: 'Stock faible', color: 'text-yellow-500' };
    return { status: 'in_stock', text: 'En stock', color: 'text-green-500' };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.basePrice) {
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Veuillez remplir tous les champs obligatoires'
      });
      return;
    }

    if (editingProduct) {
      // Update existing product
      setProducts(prev => prev.map(product => 
        product.id === editingProduct.id 
          ? {
              ...product,
              ...formData,
              basePrice: parseFloat(formData.basePrice) || 0,
              minStock: parseInt(formData.minStock) || 0
            }
          : product
      ));

      logActivity({
        type: 'update',
        module: 'Stocks',
        description: `Produit modifié: ${formData.name}`,
        metadata: { productId: editingProduct.id }
      });

      showToast({
        type: 'success',
        title: 'Produit modifié',
        message: 'Le produit a été mis à jour avec succès'
      });
    } else {
      // Add new product
      const newProduct: Product = {
        id: `PRD-${String(products.length + 1).padStart(3, '0')}`,
        ...formData,
        basePrice: parseFloat(formData.basePrice) || 0,
        minStock: parseInt(formData.minStock) || 0,
        units: [],
        totalReceived: 0,
        totalSold: 0,
        totalAvailable: 0,
        totalDamaged: 0
      };

      setProducts(prev => [newProduct, ...prev]);

      logActivity({
        type: 'create',
        module: 'Stocks',
        description: `Nouveau produit ajouté: ${formData.name}`,
        metadata: { productId: newProduct.id }
      });

      showToast({
        type: 'success',
        title: 'Produit ajouté',
        message: 'Le nouveau produit a été créé avec succès'
      });
    }

    setShowForm(false);
    setEditingProduct(null);
    resetForms();
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    resetForms();
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      basePrice: product.basePrice.toString(),
      minStock: product.minStock.toString(),
      description: product.description,
      supplier: product.supplier
    });
    setShowForm(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit et toutes ses unités ?')) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      
      logActivity({
        type: 'delete',
        module: 'Stocks',
        description: `Produit supprimé: ${productId}`,
        metadata: { productId }
      });

      showToast({
        type: 'success',
        title: 'Produit supprimé',
        message: 'Le produit et toutes ses unités ont été supprimés'
      });
    }
  };

  const handleViewUnits = (product: Product) => {
    setSelectedProduct(product);
    setShowUnitsModal(true);
  };

  const handleAddUnits = (product: Product) => {
    setSelectedProduct(product);
    setSelectedUnit(null);
    resetForms();
    setShowUnitForm(true);
  };

  const handleEditUnit = (product: Product, unit: ProductUnit) => {
    setSelectedProduct(product);
    setSelectedUnit(unit);
    setUnitForm({
      serialNumber: unit.serialNumber,
      location: unit.location,
      notes: unit.notes || '',
      quantity: '1'
    });
    setShowUnitForm(true);
  };

  const handleSaveUnit = () => {
    if (!selectedProduct || !unitForm.serialNumber) {
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Veuillez remplir tous les champs obligatoires'
      });
      return;
    }

    if (selectedUnit) {
      // Update existing unit
      setProducts(prev => prev.map(product => 
        product.id === selectedProduct.id
          ? {
              ...product,
              units: product.units.map(unit =>
                unit.id === selectedUnit.id
                  ? {
                      ...unit,
                      serialNumber: unitForm.serialNumber,
                      location: unitForm.location,
                      notes: unitForm.notes
                    }
                  : unit
              )
            }
          : product
      ));

      showToast({
        type: 'success',
        title: 'Unité modifiée',
        message: 'L\'unité a été mise à jour avec succès'
      });
    } else {
      // Add new units
      const quantity = parseInt(unitForm.quantity) || 1;
      const newUnits: ProductUnit[] = [];

      for (let i = 0; i < quantity; i++) {
        const unitNumber = selectedProduct.units.length + i + 1;
        const newUnit: ProductUnit = {
          id: `UNIT-${Date.now()}-${i}`,
          qrCode: `QR-${selectedProduct.id}-UNIT-${String(unitNumber).padStart(3, '0')}`,
          serialNumber: quantity === 1 ? unitForm.serialNumber : `${unitForm.serialNumber}-${String(i + 1).padStart(3, '0')}`,
          status: 'available',
          location: unitForm.location,
          receivedDate: new Date().toISOString().split('T')[0],
          notes: unitForm.notes
        };
        newUnits.push(newUnit);
      }

      setProducts(prev => prev.map(product => 
        product.id === selectedProduct.id
          ? {
              ...product,
              units: [...product.units, ...newUnits],
              totalReceived: product.totalReceived + quantity,
              totalAvailable: product.totalAvailable + quantity
            }
          : product
      ));

      logActivity({
        type: 'create',
        module: 'Stocks',
        description: `${quantity} unité(s) ajoutée(s) au produit ${selectedProduct.name}`,
        metadata: { 
          productId: selectedProduct.id, 
          quantity,
          units: newUnits.map(u => ({ id: u.id, qrCode: u.qrCode, serialNumber: u.serialNumber }))
        }
      });

      showToast({
        type: 'success',
        title: 'Unités ajoutées',
        message: `${quantity} unité(s) ajoutée(s) avec succès`
      });
    }

    setShowUnitForm(false);
    resetForms();
  };

  const handleDeleteUnit = (productId: string, unitId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette unité ?')) {
      setProducts(prev => prev.map(product => 
        product.id === productId
          ? {
              ...product,
              units: product.units.filter(unit => unit.id !== unitId),
              totalReceived: product.totalReceived - 1,
              totalAvailable: product.totalAvailable - 1
            }
          : product
      ));

      showToast({
        type: 'success',
        title: 'Unité supprimée',
        message: 'L\'unité a été supprimée avec succès'
      });
    }
  };

  const handleChangeUnitStatus = (productId: string, unitId: string, newStatus: ProductUnit['status']) => {
    setProducts(prev => prev.map(product => 
      product.id === productId
        ? {
            ...product,
            units: product.units.map(unit =>
              unit.id === unitId
                ? { 
                    ...unit, 
                    status: newStatus,
                    soldDate: newStatus === 'sold' ? new Date().toISOString().split('T')[0] : unit.soldDate
                  }
                : unit
            ),
            totalAvailable: product.units.filter(u => u.id !== unitId || newStatus === 'available').length,
            totalSold: product.units.filter(u => u.id !== unitId ? u.status === 'sold' : newStatus === 'sold').length
          }
        : product
    ));

    logActivity({
      type: 'update',
      module: 'Stocks',
      description: `Statut d'unité modifié: ${newStatus}`,
      metadata: { productId, unitId, newStatus }
    });

    showToast({
      type: 'success',
      title: 'Statut modifié',
      message: `Le statut de l'unité a été changé en "${newStatus}"`
    });
  };

  const handleGenerateQR = (product: Product) => {
    setSelectedProduct(product);
    setShowQRGenerator(true);
  };

  const handlePrintQRCodes = (product?: Product) => {
    if (product) {
      setSelectedProduct(product);
    }
    setShowQRPrint(true);
  };

  const getAllQRCodes = () => {
    const allCodes: Array<{
      id: string;
      qrCode: string;
      serialNumber: string;
      productName: string;
      status: string;
    }> = [];

    products.forEach(product => {
      product.units.forEach(unit => {
        allCodes.push({
          id: unit.id,
          qrCode: unit.qrCode,
          serialNumber: unit.serialNumber,
          productName: product.name,
          status: unit.status
        });
      });
    });

    return allCodes;
  };

  const getProductQRCodes = (product: Product) => {
    return product.units.map(unit => ({
      id: unit.id,
      qrCode: unit.qrCode,
      serialNumber: unit.serialNumber,
      productName: product.name,
      status: unit.status
    }));
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <div className="p-3 bg-green-500 rounded-lg mr-4">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                Gestion des Stocks & QR Code
              </h1>
              <p className="text-nexsaas-vanta-black dark:text-gray-300">
                Inventaire et traçabilité unitaire de vos produits
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6"
        >
          <Card className="text-center">
            <div className="p-3 bg-blue-500/10 rounded-lg inline-block mb-3">
              <Package className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              {products.length}
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              Produits
            </p>
          </Card>
          
          <Card className="text-center">
            <div className="p-3 bg-green-500/10 rounded-lg inline-block mb-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              {products.reduce((acc, p) => acc + p.totalAvailable, 0)}
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              Unités disponibles
            </p>
          </Card>
          
          <Card className="text-center">
            <div className="p-3 bg-purple-500/10 rounded-lg inline-block mb-3">
              <ShoppingCart className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              {products.reduce((acc, p) => acc + p.totalSold, 0)}
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              Unités vendues
            </p>
          </Card>
          
          <Card className="text-center">
            <div className="p-3 bg-yellow-500/10 rounded-lg inline-block mb-3">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              {products.filter(p => p.totalAvailable <= p.minStock).length}
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              Alertes stock
            </p>
          </Card>
          
          <Card className="text-center">
            <div className="p-3 bg-indigo-500/10 rounded-lg inline-block mb-3">
              <QrCode className="w-6 h-6 text-indigo-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              {products.reduce((acc, p) => acc + p.units.length, 0)}
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              QR Codes générés
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
                    placeholder="Rechercher un produit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Importer
                </Button>
                <Button variant="outline" size="sm" onClick={() => handlePrintQRCodes()}>
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimer QR
                </Button>
              </div>
              <Button onClick={handleAddProduct}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter produit
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Products List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="space-y-4"
        >
          {filteredProducts.map((product, index) => {
            const stockStatus = getStockStatus(product);
            
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                            {product.name}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                            {stockStatus.text}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-nexsaas-saas-green">
                            €{product.basePrice}
                          </p>
                          <p className="text-xs text-nexsaas-vanta-black dark:text-gray-300">
                            Prix de base
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 text-sm">Catégorie:</span>
                          <p className="text-nexsaas-vanta-black dark:text-gray-300 font-medium">
                            {product.category}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 text-sm">Fournisseur:</span>
                          <p className="text-nexsaas-vanta-black dark:text-gray-300 font-medium">
                            {product.supplier}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 text-sm">Stock min:</span>
                          <p className="text-nexsaas-vanta-black dark:text-gray-300 font-medium">
                            {product.minStock} unités
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 text-sm">Total unités:</span>
                          <p className="text-nexsaas-vanta-black dark:text-gray-300 font-medium">
                            {product.units.length} unités
                          </p>
                        </div>
                      </div>

                      {/* Stock Summary */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <p className="text-lg font-bold text-green-600">
                            {product.totalAvailable}
                          </p>
                          <p className="text-xs text-green-600">
                            Disponibles
                          </p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-lg font-bold text-blue-600">
                            {product.totalSold}
                          </p>
                          <p className="text-xs text-blue-600">
                            Vendues
                          </p>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <p className="text-lg font-bold text-yellow-600">
                            {product.units.filter(u => u.status === 'reserved').length}
                          </p>
                          <p className="text-xs text-yellow-600">
                            Réservées
                          </p>
                        </div>
                        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <p className="text-lg font-bold text-red-600">
                            {product.totalDamaged}
                          </p>
                          <p className="text-xs text-red-600">
                            Endommagées
                          </p>
                        </div>
                      </div>

                      {product.description && (
                        <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300 mb-4">
                          {product.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-2 mt-4 lg:mt-0 lg:ml-6">
                      <Button variant="outline" size="sm" onClick={() => handleViewUnits(product)}>
                        <Eye className="w-4 h-4 mr-1" />
                        Voir unités ({product.units.length})
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleAddUnits(product)}>
                        <Plus className="w-4 h-4 mr-1" />
                        Ajouter unités
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleGenerateQR(product)}>
                        <QrCode className="w-4 h-4 mr-1" />
                        QR Codes
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handlePrintQRCodes(product)}>
                        <Printer className="w-4 h-4 mr-1" />
                        Imprimer QR
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                        <Edit className="w-4 h-4 mr-1" />
                        Modifier
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Product Form Modal */}
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
                {editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nom du produit"
                    value={formData.name}
                    onChange={(value) => setFormData({...formData, name: value})}
                    required
                  />
                  <Input
                    label="Catégorie"
                    value={formData.category}
                    onChange={(value) => setFormData({...formData, category: value})}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Prix de base (€)"
                    type="number"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(value) => setFormData({...formData, basePrice: value})}
                    required
                  />
                  <Input
                    label="Stock minimum"
                    type="number"
                    value={formData.minStock}
                    onChange={(value) => setFormData({...formData, minStock: value})}
                    required
                  />
                  <Input
                    label="Fournisseur"
                    value={formData.supplier}
                    onChange={(value) => setFormData({...formData, supplier: value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                    placeholder="Description du produit..."
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
                    {editingProduct ? 'Modifier' : 'Ajouter'} le produit
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Units Modal */}
        {showUnitsModal && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowUnitsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-nexsaas-pure-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                  Unités - {selectedProduct.name}
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setShowUnitsModal(false)}>
                  ✕
                </Button>
              </div>
              
              <div className="mb-6 flex gap-2">
                <Button onClick={() => handleAddUnits(selectedProduct)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter des unités
                </Button>
                <Button variant="outline" onClick={() => handlePrintQRCodes(selectedProduct)}>
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimer QR codes
                </Button>
              </div>

              <div className="space-y-4">
                {selectedProduct.units.map((unit, index) => (
                  <motion.div
                    key={unit.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.05 }}
                    className="border border-nexsaas-light-gray dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(unit.status)}`}>
                            {getStatusIcon(unit.status)}
                            <span className="ml-1 capitalize">{unit.status}</span>
                          </span>
                          <span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {unit.qrCode}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center">
                            <Hash className="w-4 h-4 text-gray-400 mr-2" />
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Série:</span>
                              <p className="text-nexsaas-vanta-black dark:text-gray-300 font-medium">
                                {unit.serialNumber}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Localisation:</span>
                              <p className="text-nexsaas-vanta-black dark:text-gray-300 font-medium">
                                {unit.location}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Reçu le:</span>
                              <p className="text-nexsaas-vanta-black dark:text-gray-300 font-medium">
                                {unit.receivedDate}
                              </p>
                            </div>
                          </div>
                          {unit.soldDate && (
                            <div className="flex items-center">
                              <User className="w-4 h-4 text-gray-400 mr-2" />
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Vendu le:</span>
                                <p className="text-nexsaas-vanta-black dark:text-gray-300 font-medium">
                                  {unit.soldDate}
                                </p>
                                {unit.soldTo && (
                                  <p className="text-xs text-nexsaas-vanta-black dark:text-gray-300">
                                    à {unit.soldTo}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {unit.notes && (
                          <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300 mt-3 italic">
                            {unit.notes}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex flex-col space-y-2 mt-4 lg:mt-0 lg:ml-6">
                        <select
                          value={unit.status}
                          onChange={(e) => handleChangeUnitStatus(selectedProduct.id, unit.id, e.target.value as ProductUnit['status'])}
                          className="px-3 py-1 text-xs border border-nexsaas-light-gray dark:border-gray-600 rounded bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white"
                        >
                          <option value="available">Disponible</option>
                          <option value="sold">Vendu</option>
                          <option value="reserved">Réservé</option>
                          <option value="damaged">Endommagé</option>
                          <option value="returned">Retourné</option>
                        </select>
                        <Button variant="outline" size="sm" onClick={() => handleEditUnit(selectedProduct, unit)}>
                          <Edit className="w-3 h-3 mr-1" />
                          Modifier
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteUnit(selectedProduct.id, unit.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Unit Form Modal */}
        {showUnitForm && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowUnitForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-nexsaas-pure-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-6">
                {selectedUnit ? 'Modifier l\'unité' : 'Ajouter des unités'}
              </h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Numéro de série"
                    value={unitForm.serialNumber}
                    onChange={(value) => setUnitForm({...unitForm, serialNumber: value})}
                    required
                  />
                  {!selectedUnit && (
                    <Input
                      label="Quantité"
                      type="number"
                      min="1"
                      value={unitForm.quantity}
                      onChange={(value) => setUnitForm({...unitForm, quantity: value})}
                      required
                    />
                  )}
                </div>
                
                <Input
                  label="Localisation"
                  value={unitForm.location}
                  onChange={(value) => setUnitForm({...unitForm, location: value})}
                  placeholder="ex: Entrepôt A - Étagère 1"
                  required
                />
                
                <div>
                  <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                    Notes
                  </label>
                  <textarea
                    value={unitForm.notes}
                    onChange={(e) => setUnitForm({...unitForm, notes: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                    placeholder="Notes sur l'unité..."
                  />
                </div>
                
                {!selectedUnit && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>QR Codes générés automatiquement:</strong><br/>
                      Format: QR-{selectedProduct.id}-UNIT-XXX<br/>
                      {parseInt(unitForm.quantity) > 1 && 'Les numéros de série seront suffixés automatiquement'}
                    </p>
                  </div>
                )}
                
                <div className="flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowUnitForm(false)}
                  >
                    Annuler
                  </Button>
                  <Button onClick={handleSaveUnit}>
                    {selectedUnit ? 'Modifier' : 'Ajouter'} {selectedUnit ? 'l\'unité' : 'les unités'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* QR Generator Modal */}
        {showQRGenerator && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowQRGenerator(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-nexsaas-pure-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                  QR Codes - {selectedProduct.name}
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setShowQRGenerator(false)}>
                  ✕
                </Button>
              </div>
              
              <div className="mb-6 flex justify-between items-center">
                <p className="text-nexsaas-vanta-black dark:text-gray-300">
                  {selectedProduct.units.length} QR codes générés pour ce produit
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handlePrintQRCodes(selectedProduct)}>
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimer tous
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger tous
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedProduct.units.map((unit) => (
                  <div key={unit.id} className="border border-nexsaas-light-gray dark:border-gray-700 rounded-lg p-4 text-center">
                    <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <QrCode className="w-16 h-16 text-gray-400" />
                    </div>
                    <p className="text-sm font-mono text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                      {unit.qrCode}
                    </p>
                    <p className="text-xs text-nexsaas-vanta-black dark:text-gray-300 mb-2">
                      {unit.serialNumber}
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(unit.status)}`}>
                      {unit.status}
                    </span>
                    <div className="mt-3 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="w-3 h-3 mr-1" />
                        PNG
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Printer className="w-3 h-3 mr-1" />
                        Imprimer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* QR Print Modal */}
        <QRCodePrint
          qrCodes={selectedProduct ? getProductQRCodes(selectedProduct) : getAllQRCodes()}
          onClose={() => setShowQRPrint(false)}
          isOpen={showQRPrint}
        />
      </div>
    </div>
  );
};

export default StockPage;