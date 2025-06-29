import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  CreditCard, 
  AlertTriangle, 
  Crown, 
  Check,
  ArrowRight,
  Star,
  Zap,
  Shield,
  Headphones,
  RefreshCw,
  Calendar,
  DollarSign
} from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const SubscriptionInactivePage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState('professional');

  const subscriptions = [
    {
      id: 'starter',
      name: 'Starter',
      price: 29,
      originalPrice: 39,
      discount: '25% OFF',
      period: 'mois',
      description: 'Parfait pour débuter',
      color: 'from-blue-500 to-blue-600',
      features: [
        'Jusqu\'à 100 produits',
        'Gestion de base des stocks',
        'Facturation simple',
        'Support par email',
        '1 utilisateur',
      ],
      limitations: [
        'Pas de commissions multi-niveaux',
        'Pas d\'agent IA',
        'Rapports limités',
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 99,
      originalPrice: 129,
      discount: '23% OFF',
      period: 'mois',
      description: 'Le plus populaire',
      color: 'from-nexsaas-saas-green to-green-600',
      isPopular: true,
      features: [
        'Produits illimités',
        'Tous les modules ERP',
        'Commissions multi-niveaux',
        'Agent IA inclus',
        'Support prioritaire',
        'Rapports avancés',
        'Point de vente (POS)',
        'Jusqu\'à 5 utilisateurs',
      ],
      limitations: []
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 299,
      originalPrice: 399,
      discount: '25% OFF',
      period: 'mois',
      description: 'Pour les grandes entreprises',
      color: 'from-purple-500 to-purple-600',
      features: [
        'Tout du Professional',
        'API personnalisée',
        'Intégrations sur mesure',
        'Support dédié 24/7',
        'Formation équipe',
        'SLA garanti',
        'Utilisateurs illimités',
        'Serveur dédié',
      ],
      limitations: []
    },
  ];

  const restrictedFeatures = [
    {
      icon: CreditCard,
      title: 'Paiements et facturation',
      description: 'Traitement des paiements et génération de factures',
    },
    {
      icon: Crown,
      title: 'Commissions d\'affiliation',
      description: 'Gestion du réseau d\'affiliés multi-niveaux',
    },
    {
      icon: Zap,
      title: 'Agent IA Support',
      description: 'Assistant intelligent pour le support client',
    },
    {
      icon: Shield,
      title: 'Rapports avancés',
      description: 'Analytics et KPIs personnalisés',
    },
  ];

  const handleSubscribe = (planId: string) => {
    showToast({
      type: 'info',
      title: 'Redirection vers le paiement',
      message: `Redirection vers la page de paiement pour le plan ${planId}...`
    });
    
    // Simulate payment process
    setTimeout(() => {
      showToast({
        type: 'success',
        title: 'Abonnement activé !',
        message: 'Votre abonnement a été activé avec succès. Redirection...'
      });
    }, 2000);
  };

  const handleContactSales = () => {
    showToast({
      type: 'info',
      title: 'Contact commercial',
      message: 'Notre équipe commerciale vous contactera sous 24h.'
    });
  };

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-nexsaas-pure-white via-blue-50 to-purple-50 dark:from-nexsaas-vanta-black dark:via-gray-900 dark:to-purple-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: 'easeInOut' 
            }}
            className="p-4 bg-red-500/10 rounded-full inline-block mb-6"
          >
            <AlertTriangle className="w-16 h-16 text-red-500" />
          </motion.div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-4">
            Abonnement Inactif
          </h1>
          <p className="text-lg text-nexsaas-vanta-black dark:text-gray-300 max-w-2xl mx-auto">
            Bonjour {user?.nom}, votre abonnement a expiré. Réactivez-le pour continuer à profiter de toutes les fonctionnalités NexSaaS.
          </p>
        </motion.div>

        {/* Alert Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="w-6 h-6 text-red-500 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-400">
                    Accès limité aux fonctionnalités
                  </h3>
                  <p className="text-red-700 dark:text-red-300">
                    Votre abonnement a expiré le 15 janvier 2024. Certaines fonctionnalités sont désormais restreintes.
                  </p>
                </div>
              </div>
              <Button className="bg-red-500 hover:bg-red-600">
                <RefreshCw className="w-4 h-4 mr-2" />
                Réactiver maintenant
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Restricted Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <Card>
            <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-6">
              Fonctionnalités Restreintes
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {restrictedFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                  className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg opacity-60"
                >
                  <div className="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg mr-4">
                    <feature.icon className="w-6 h-6 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                      {feature.description}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Subscription Plans */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-4">
              Choisissez votre abonnement
            </h2>
            <p className="text-lg text-nexsaas-vanta-black dark:text-gray-300">
              Offre spéciale de réactivation - Économisez jusqu'à 25%
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {subscriptions.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.2 }}
                className="relative"
              >
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-nexsaas-saas-green text-nexsaas-pure-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      Le plus populaire
                    </div>
                  </div>
                )}
                
                <Card className={`h-full relative overflow-hidden ${
                  plan.isPopular ? 'ring-2 ring-nexsaas-saas-green shadow-xl' : ''
                } ${selectedPlan === plan.id ? 'ring-2 ring-nexsaas-deep-blue' : ''}`}>
                  {/* Background Gradient */}
                  <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${plan.color}`} />
                  
                  {/* Discount Badge */}
                  {plan.discount && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        {plan.discount}
                      </span>
                    </div>
                  )}

                  <div className="pt-6">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                        {plan.name}
                      </h3>
                      <p className="text-nexsaas-vanta-black dark:text-gray-300 mb-4">
                        {plan.description}
                      </p>
                      
                      <div className="mb-4">
                        {plan.originalPrice && (
                          <span className="text-lg text-gray-500 line-through mr-2">
                            {plan.originalPrice}€
                          </span>
                        )}
                        <span className="text-4xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                          {plan.price}€
                        </span>
                        <span className="text-nexsaas-vanta-black dark:text-gray-300">
                          /{plan.period}
                        </span>
                      </div>
                    </div>
                    
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center">
                          <Check className="w-5 h-5 text-nexsaas-saas-green mr-3 flex-shrink-0" />
                          <span className="text-nexsaas-vanta-black dark:text-gray-300 text-sm">
                            {feature}
                          </span>
                        </li>
                      ))}
                      
                      {plan.limitations.map((limitation, limitIndex) => (
                        <li key={limitIndex} className="flex items-center opacity-60">
                          <div className="w-5 h-5 mr-3 flex-shrink-0 flex items-center justify-center">
                            <div className="w-3 h-3 bg-gray-400 rounded-full" />
                          </div>
                          <span className="text-nexsaas-vanta-black dark:text-gray-300 text-sm line-through">
                            {limitation}
                          </span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      onClick={() => handleSubscribe(plan.id)}
                      className={`w-full ${
                        plan.isPopular 
                          ? 'bg-nexsaas-saas-green hover:bg-green-600' 
                          : 'bg-nexsaas-deep-blue hover:bg-blue-700'
                      }`}
                      size="lg"
                    >
                      {plan.id === 'enterprise' ? 'Contacter les ventes' : 'Réactiver maintenant'}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-nexsaas-deep-blue/5 to-nexsaas-saas-green/5 dark:from-nexsaas-deep-blue/10 dark:to-nexsaas-saas-green/10">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-4">
                Pourquoi réactiver maintenant ?
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="p-4 bg-nexsaas-saas-green/10 rounded-full inline-block mb-4">
                  <DollarSign className="w-8 h-8 text-nexsaas-saas-green" />
                </div>
                <h3 className="font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                  Économisez 25%
                </h3>
                <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                  Offre spéciale de réactivation valable 48h seulement
                </p>
              </div>
              
              <div className="text-center">
                <div className="p-4 bg-blue-500/10 rounded-full inline-block mb-4">
                  <Shield className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                  Données préservées
                </h3>
                <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                  Toutes vos données sont sauvegardées et prêtes à être restaurées
                </p>
              </div>
              
              <div className="text-center">
                <div className="p-4 bg-purple-500/10 rounded-full inline-block mb-4">
                  <Headphones className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                  Support prioritaire
                </h3>
                <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                  Assistance dédiée pour la réactivation et migration
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-center"
        >
          <Card>
            <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-4">
              Besoin d'aide pour choisir ?
            </h3>
            <p className="text-nexsaas-vanta-black dark:text-gray-300 mb-6">
              Notre équipe commerciale est là pour vous accompagner dans le choix de votre abonnement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" onClick={handleContactSales}>
                <Calendar className="w-4 h-4 mr-2" />
                Planifier un appel
              </Button>
              <Button variant="outline">
                <Headphones className="w-4 h-4 mr-2" />
                Chat en direct
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default SubscriptionInactivePage;