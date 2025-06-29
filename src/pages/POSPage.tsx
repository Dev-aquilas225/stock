import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Scan, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeft,
  User,
  CreditCard,
  Receipt,
  RotateCcw
} from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import QRScanner from '../components/QRScanner/QRScanner';
import { useToast } from '../contexts/ToastContext';
import { useActivity } from '../contexts/ActivityContext';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
}

interface Customer {
  name: string;
  email: string;
  phone: string;
}

const POSPage: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [customer, setCustomer] = useState<Customer>({ name: '', email: '', phone: '' });
  const [discount, setDiscount] = useState(0);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const { showToast } = useToast();
  const { logActivity } = useActivity();

  // Mock products database
  const products = {
    'PRD-001': { id: 'PRD-001', name: 'MacBook Pro 14"', price: 2499, stock: 15 },
    'PRD-002': { id: 'PRD-002', name: 'iPhone 15 Pro', price: 1199, stock: 3 },
    'PRD-003': { id: 'PRD-003', name: 'Samsung Galaxy S24', price: 899, stock: 8 },
  };

  const handleScan = (qrCode: string) => {
    const product = products[qrCode as keyof typeof products];
    
    if (!product) {
      showToast({
        type: 'error',
        title: 'Produit non trouvé',
        message: `Le code QR "${qrCode}" ne correspond à aucun produit.`
      });
      setShowScanner(false);
      return;
    }

    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        showToast({
          type: 'warning',
          title: 'Stock insuffisant',
          message: `Stock disponible: ${product.stock} unités`
        });
        setShowScanner(false);
        return;
      }
      updateQuantity(product.id, existingItem.quantity + 1);
    } else {
      if (product.stock === 0) {
        showToast({
          type: 'error',
          title: 'Produit en rupture',
          message: `${product.name} n'est plus en stock.`
        });
        setShowScanner(false);
        return;
      }
      
      setCart(prev => [...prev, { ...product, quantity: 1 }]);
      showToast({
        type: 'success',
        title: 'Produit ajouté',
        message: `${product.name} ajouté au panier`
      });
    }

    logActivity({
      type: 'scan',
      module: 'POS',
      description: `Produit scanné: ${product.name}`,
      metadata: { productId: product.id, qrCode }
    });

    setShowScanner(false);
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    const product = products[productId as keyof typeof products];
    
    if (newQuantity > product.stock) {
      showToast({
        type: 'warning',
        title: 'Stock insuffisant',
        message: `Stock disponible: ${product.stock} unités`
      });
      return;
    }

    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prev => prev.map(item => 
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
    showToast({
      type: 'info',
      title: 'Produit retiré',
      message: 'Produit retiré du panier'
    });
  };

  const clearCart = () => {
    setCart([]);
    setCustomer({ name: '', email: '', phone: '' });
    setDiscount(0);
    showToast({
      type: 'info',
      title: 'Panier vidé',
      message: 'Le panier a été vidé'
    });
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateDiscount = () => {
    return (calculateSubtotal() * discount) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      showToast({
        type: 'warning',
        title: 'Panier vide',
        message: 'Ajoutez des produits avant de procéder au paiement'
      });
      return;
    }

    const saleData = {
      items: cart,
      customer,
      subtotal: calculateSubtotal(),
      discount: calculateDiscount(),
      total: calculateTotal(),
      timestamp: new Date()
    };

    logActivity({
      type: 'sale',
      module: 'POS',
      description: `Vente effectuée - Total: €${calculateTotal().toFixed(2)}`,
      metadata: saleData
    });

    showToast({
      type: 'success',
      title: 'Vente effectuée',
      message: `Total: €${calculateTotal().toFixed(2)} - Reçu généré`
    });

    clearCart();
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
            <div className="p-3 bg-nexsaas-saas-green rounded-lg mr-4">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                Point de Vente (POS)
              </h1>
              <p className="text-nexsaas-vanta-black dark:text-gray-300">
                Scanner et vendre vos produits
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Scanner & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card>
              <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-6">
                Scanner Produit
              </h2>
              
              <div className="text-center mb-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowScanner(true)}
                  className="w-32 h-32 bg-nexsaas-saas-green hover:bg-green-600 rounded-full flex items-center justify-center text-white shadow-lg mx-auto mb-4"
                >
                  <Scan className="w-12 h-12" />
                </motion.button>
                <p className="text-nexsaas-vanta-black dark:text-gray-300">
                  Appuyez pour scanner un code QR
                </p>
              </div>

              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={clearCart}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Vider panier
                </Button>
                <Button variant="outline" onClick={() => setShowCustomerForm(!showCustomerForm)}>
                  <User className="w-4 h-4 mr-2" />
                  Client
                </Button>
              </div>

              {/* Customer Form */}
              {showCustomerForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 p-4 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg"
                >
                  <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-4">
                    Informations Client (Optionnel)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Nom"
                      value={customer.name}
                      onChange={(e) => setCustomer(prev => ({ ...prev, name: e.target.value }))}
                      className="px-4 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={customer.email}
                      onChange={(e) => setCustomer(prev => ({ ...prev, email: e.target.value }))}
                      className="px-4 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                    />
                    <input
                      type="tel"
                      placeholder="Téléphone"
                      value={customer.phone}
                      onChange={(e) => setCustomer(prev => ({ ...prev, phone: e.target.value }))}
                      className="px-4 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                    />
                  </div>
                </motion.div>
              )}
            </Card>
          </motion.div>

          {/* Cart */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card>
              <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-6">
                Panier ({cart.length})
              </h2>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-nexsaas-vanta-black dark:text-gray-300">
                    Panier vide
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white text-sm">
                            {item.name}
                          </h3>
                          <p className="text-nexsaas-saas-green font-bold">
                            €{item.price}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-900/40 text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Discount */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                      Remise (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                    />
                  </div>

                  {/* Totals */}
                  <div className="space-y-2 mb-6 p-4 bg-nexsaas-light-gray dark:bg-gray-700 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-nexsaas-vanta-black dark:text-gray-300">Sous-total:</span>
                      <span className="font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                        €{calculateSubtotal().toFixed(2)}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-nexsaas-vanta-black dark:text-gray-300">Remise ({discount}%):</span>
                        <span className="font-medium text-red-500">
                          -€{calculateDiscount().toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold border-t border-nexsaas-vanta-black dark:border-gray-600 pt-2">
                      <span className="text-nexsaas-deep-blue dark:text-nexsaas-pure-white">Total:</span>
                      <span className="text-nexsaas-saas-green">
                        €{calculateTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button onClick={handleCheckout} className="w-full" size="lg">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Encaisser
                  </Button>
                </>
              )}
            </Card>
          </motion.div>
        </div>
      </div>

      {/* QR Scanner */}
      <QRScanner
        isOpen={showScanner}
        onScan={handleScan}
        onClose={() => setShowScanner(false)}
      />
    </div>
  );
};

export default POSPage;