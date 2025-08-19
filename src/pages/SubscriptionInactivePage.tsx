import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  AlertTriangle,
  Crown,
  Check,
  X,
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
import { getFormules, Formule } from '../api/formuleApi';

const SubscriptionInactivePage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState('starter');
  const [plans, setPlans] = useState<Formule[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [errorPlans, setErrorPlans] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoadingPlans(true);
        const response = await getFormules();
        if (response.success) {
          setPlans(response.data);
        } else {
          setErrorPlans(response.message);
        }
      } catch (err) {
        setErrorPlans('Erreur lors du chargement des formules');
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  const getFeatures = (plan: Formule) => {
    return [
      { description: `Jusqu'à ${plan.maxClients} clients`, isAvailable: plan.maxClients > 0 },
      { description: `${plan.niveauxParrainage} niveau${plan.niveauxParrainage !== 1 ? 'x' : ''} de parrainage`, isAvailable: plan.niveauxParrainage > 0 },
      { description: `${plan.managersAutorises} manager${plan.managersAutorises !== 1 ? 's' : ''} autorisé${plan.managersAutorises !== 1 ? 's' : ''}`, isAvailable: plan.managersAutorises > 0 },
      { description: 'Gestion des stocks', isAvailable: plan.gestionStock },
      { description: 'Rapports de ventes', isAvailable: plan.rapportsVentes },
      { description: 'Facturation PDF', isAvailable: plan.facturationPDF },
      { description: 'Classement d\'équipe', isAvailable: plan.classementEquipe },
      { description: 'Notifications d\'objectifs', isAvailable: plan.notificationObjectifs },
      { description: 'Intégration ERP', isAvailable: plan.integrationERP },
      { description: 'Support prioritaire', isAvailable: plan.supportPrioritaire },
    ];
  };

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
              Réactivez votre plan pour retrouver l'accès complet à NexSaaS
            </p>
          </div>

          {loadingPlans ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-nexsaas-saas-green"></div>
            </div>
          ) : errorPlans ? (
            <div className="text-center text-nexsaas-vanta-black dark:text-gray-300">
              <p className="text-lg">{errorPlans}</p>
              <Link to="/" className="text-nexsaas-saas-green hover:underline mt-4 inline-block">
                Retour à l'accueil
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 + index * 0.2 }}
                  className="relative"
                >
                  {plan.nom === 'starter' && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="bg-nexsaas-saas-green text-nexsaas-pure-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                        <Star className="w-4 h-4 mr-1" />
                        Populaire
                      </div>
                    </div>
                  )}

                  <Card className={`h-full relative overflow-hidden ${plan.nom === 'starter' ? 'ring-2 ring-nexsaas-saas-green shadow-xl' : ''
                    } ${selectedPlan === plan.id ? 'ring-2 ring-nexsaas-deep-blue' : ''}`}>
                    {/* Background Gradient */}
                    <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${plan.nom === 'gratuit' ? 'from-gray-500 to-gray-600' :
                        plan.nom === 'starter' ? 'from-blue-500 to-blue-600' :
                          plan.nom === 'pro' ? 'from-nexsaas-saas-green to-green-600' :
                            plan.nom === 'manager' ? 'from-teal-500 to-teal-600' :
                              'from-purple-500 to-purple-600'
                      }`} />

                    <div className="pt-6">
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                          {plan.nom.charAt(0).toUpperCase() + plan.nom.slice(1)}
                        </h3>
                        <p className="text-nexsaas-vanta-black dark:text-gray-300 mb-4">
                          Parfait pour {plan.nom === 'gratuit' ? 'essayer gratuitement' :
                            plan.nom === 'starter' ? 'débuter' :
                              plan.nom === 'pro' ? 'les entreprises en croissance' :
                                plan.nom === 'manager' ? 'les équipes structurées' :
                                  'les solutions personnalisées'}
                        </p>

                        <div className="mb-4">
                          <span className="text-4xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                            {plan.nom === 'entreprise' ? '' : plan.prix === 0 ? 'Gratuit' : `${plan.prix} FCFA`}
                          </span>
                          {plan.prix !== 0 && plan.nom !== 'entreprise' && (
                            <span className="text-nexsaas-vanta-black dark:text-gray-300">/mois</span>
                          )}
                        </div>
                      </div>

                      <ul className="space-y-3 mb-8">
                        {getFeatures(plan).map((feature, featureIndex) => (
                          <li key={featureIndex} className={`flex items-center ${!feature.isAvailable ? 'opacity-60' : ''}`}>
                            {feature.isAvailable ? (
                              <Check className="w-5 h-5 text-nexsaas-saas-green mr-3 flex-shrink-0" />
                            ) : (
                              <X className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                            )}
                            <span className="text-nexsaas-vanta-black dark:text-gray-300 text-sm">
                              {feature.description}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        onClick={() => handleSubscribe(plan.id)}
                        className={`w-full ${plan.nom === 'starter'
                            ? 'bg-nexsaas-saas-green hover:bg-green-600'
                            : 'bg-nexsaas-deep-blue hover:bg-blue-700'
                          }`}
                        size="lg"
                      >
                        {plan.nom === 'entreprise' ? 'Faire un devis personnalisé' : 'Réactiver maintenant'}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
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