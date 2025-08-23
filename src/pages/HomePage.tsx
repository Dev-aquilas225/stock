import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Package,
  TrendingUp,
  Users,
  FileText,
  BarChart3,
  CreditCard,
  MessageCircle,
  RotateCcw,
  Check,
  X,
  Star,
  ArrowRight,
  Play,
  Shield,
  Zap,
  Globe,
  Quote,
  Building,
  Smartphone,
  Clock,
} from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { getFormules, Formule } from '../api/formuleApi';

const HomePage: React.FC = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [plans, setPlans] = useState<Formule[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [errorPlans, setErrorPlans] = useState<string | null>(null);

  const scrollToSubscriptions = () => {
    const subscriptionsSection = document.getElementById('subscriptions');
    if (subscriptionsSection) {
      subscriptionsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const modules = [
    {
      icon: Package,
      title: 'Gestion des approvisionnements',
      description: 'Créez des commandes avec workflow d\'approbation et suivez-les en temps réel.',
      color: 'from-blue-500 to-blue-600',
      link: '/approvisionnements',
    },
    {
      icon: RotateCcw,
      title: 'Retours Approvisionnements',
      description: 'Gérez les retours fournisseurs avec validation et suivi des statuts.',
      color: 'from-yellow-500 to-yellow-600',
      link: '/returns',
    },
    {
      icon: ShoppingCart,
      title: 'Gestion des stocks & QR code',
      description: 'Générez des QR codes, gérez entrées/sorties et inventaires sur mobile.',
      color: 'from-green-500 to-green-600',
      link: '/stocks',
    },
    {
      icon: TrendingUp,
      title: 'Gestion des ventes',
      description: 'Optimisez vos ventes avec un tunnel e-commerce multi-device.',
      color: 'from-purple-500 to-purple-600',
      link: '/ventes',
    },
    {
      icon: Users,
      title: 'Commissions d\'affiliation',
      description: 'Automatisez le calcul des commissions avec visualisation réseau.',
      color: 'from-orange-500 to-orange-600',
      link: '/commissions',
    },
    {
      icon: FileText,
      title: 'Facturation & documents',
      description: 'Générez et envoyez automatiquement factures par email ou WhatsApp.',
      color: 'from-red-500 to-red-600',
      link: '/facturation',
    },
    {
      icon: BarChart3,
      title: 'Analyse & reporting',
      description: 'Créez des dashboards personnalisés avec export PDF/Excel.',
      color: 'from-indigo-500 to-indigo-600',
      link: '/analytics',
    },
    {
      icon: CreditCard,
      title: 'Paiement & finances',
      description: 'Intégrez Mobile Money, Stripe, et CinetPay pour paiements fluides.',
      color: 'from-teal-500 to-teal-600',
      link: '/paiements',
    },
    {
      icon: MessageCircle,
      title: 'Agent IA support',
      description: 'Automatisez le support client via WhatsApp et Messenger.',
      color: 'from-pink-500 to-pink-600',
      link: '/support',
    },
  ];

  const testimonials = [
    {
      name: 'Marie Dubois',
      company: 'TechStart SARL',
      role: 'Directrice Générale',
      content: 'NexSaaS a transformé notre gestion. En 3 mois, notre chiffre d\'affaires a bondi de 40% grâce au système d\'affiliation.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    },
    {
      name: 'Jean-Pierre Martin',
      company: 'Commerce Plus',
      role: 'Responsable IT',
      content: 'L\'intégration Mobile Money a simplifié nos transactions en Afrique. Interface fluide et support réactif.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    },
    {
      name: 'Sophie Laurent',
      company: 'Digital Solutions',
      role: 'CEO',
      content: 'Le scanner QR pour les stocks a révolutionné nos opérations. Adoption rapide par nos équipes.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    },
  ];

  const stats = [
    { number: '10,000+', label: 'Entreprises actives', icon: Building },
    { number: '€50M+', label: 'Transactions traitées', icon: CreditCard },
    { number: '99.9%', label: 'Temps de disponibilité', icon: Shield },
    { number: '24/7', label: 'Support client', icon: Clock },
  ];

  const benefits = [
    {
      icon: Zap,
      title: 'Déploiement rapide',
      description: 'Activez votre compte en moins de 24h avec migration des données incluse.',
    },
    {
      icon: Shield,
      title: 'Sécurité maximale',
      description: 'Chiffrement avancé et conformité RGPD pour protéger vos données.',
    },
    {
      icon: Globe,
      title: 'Multi-devises',
      description: 'Support des devises africaines et européennes pour vos transactions.',
    },
    {
      icon: Smartphone,
      title: 'Mobile-first',
      description: 'Interface optimisée pour mobile avec une app native à venir.',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

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
      {
        description: plan.nom === 'entreprise' ? 'Illimité' : `Jusqu'à ${plan.maxClients} clients`,
        isAvailable: plan.maxClients > 0 || plan.nom === 'entreprise',
      },
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

  return (
      <div className="min-h-screen bg-gradient-to-br from-nexsaas-pure-white via-blue-50 to-purple-50 dark:from-nexsaas-vanta-black dark:via-gray-900 dark:to-purple-950">
          {/* Hero Section */}
          <section className="pt-24 pb-16 px-4 relative overflow-hidden">
              <div className="absolute inset-0">
                  <div className="absolute -top-40 -right-40 w-96 h-96 bg-nexsaas-saas-green/20 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-nexsaas-deep-blue/20 rounded-full blur-3xl animate-pulse" />
              </div>

              <div className="container mx-auto text-center relative z-10">
                  <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                      <div className="inline-flex items-center px-4 py-2 bg-nexsaas-saas-green/10 rounded-full text-nexsaas-saas-green font-medium text-sm mb-6">
                          <Star className="w-4 h-4 mr-2" />
                          Nouvelle version : Agent IA et Retours
                          Approvisionnements
                      </div>
                      <h1 className="text-5xl md:text-6xl font-extrabold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-6 tracking-tight">
                          Boostez votre entreprise avec{" "}
                          <span className="bg-gradient-to-r from-nexsaas-deep-blue to-nexsaas-saas-green bg-clip-text text-transparent">
                              NexSaaS
                          </span>
                      </h1>
                      <p className="text-xl md:text-2xl text-nexsaas-vanta-black dark:text-gray-200 mb-10 max-w-3xl mx-auto leading-relaxed">
                          La plateforme ERP tout-en-un pour gérer vos stocks,
                          ventes, retours et affiliés.{" "}
                          <span className="text-nexsaas-saas-green font-semibold">
                              +40% de revenus
                          </span>{" "}
                          en moyenne.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          <Link to="/inscription">
                              <Button
                                  size="lg"
                                  className="w-full sm:w-auto text-lg px-8 py-4 bg-nexsaas-saas-green hover:bg-green-600 text-white"
                              >
                                  <Zap className="w-5 h-5 mr-2" />
                                  Commencer gratuitement
                              </Button>
                          </Link>
                          <Button
                              size="lg"
                              variant="outline"
                              className="w-full sm:w-auto text-lg px-8 py-4 border-nexsaas-saas-green text-nexsaas-saas-green hover:bg-nexsaas-saas-green hover:text-white"
                              onClick={scrollToSubscriptions}
                          >
                              Voir les abonnements
                              <ArrowRight className="w-5 h-5 ml-2" />
                          </Button>
                      </div>
                  </motion.div>

                  <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-12"
                  >
                      {stats.map((stat, index) => (
                          <div key={stat.label} className="text-center">
                              <div className="p-3 bg-nexsaas-deep-blue/10 rounded-full inline-block mb-3">
                                  <stat.icon className="w-6 h-6 text-nexsaas-deep-blue" />
                              </div>
                              <div className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                  {stat.number}
                              </div>
                              <div className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                  {stat.label}
                              </div>
                          </div>
                      ))}
                  </motion.div>
              </div>
          </section>

          {/* Benefits Section */}
          <section className="py-16 px-4 bg-nexsaas-pure-white dark:bg-gray-900">
              <div className="container mx-auto">
                  <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      className="text-center mb-12"
                  >
                      <h2 className="text-3xl md:text-4xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-4">
                          Pourquoi NexSaaS ?
                      </h2>
                      <p className="text-lg text-nexsaas-vanta-black dark:text-gray-300 max-w-2xl mx-auto">
                          Une solution ERP conçue pour simplifier et accélérer
                          la croissance de votre entreprise.
                      </p>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {benefits.map((benefit, index) => (
                          <motion.div
                              key={benefit.title}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                          >
                              <Card className="h-full text-center p-6 hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700">
                                  <div className="p-3 bg-nexsaas-saas-green/10 rounded-full inline-block mb-4">
                                      <benefit.icon className="w-7 h-7 text-nexsaas-saas-green" />
                                  </div>
                                  <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                      {benefit.title}
                                  </h3>
                                  <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                      {benefit.description}
                                  </p>
                              </Card>
                          </motion.div>
                      ))}
                  </div>
              </div>
          </section>

          {/* Modules Section */}
          <section className="py-16 px-4">
              <div className="container mx-auto">
                  <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      className="text-center mb-12"
                  >
                      <h2 className="text-3xl md:text-4xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-4">
                          Nos modules ERP
                      </h2>
                      <p className="text-lg text-nexsaas-vanta-black dark:text-gray-300 max-w-2xl mx-auto">
                          Une suite complète pour gérer vos processus métier
                          avec efficacité.
                      </p>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {modules.map((module, index) => (
                          <motion.div
                              key={module.title}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                          >
                              <Link to={module.link}>
                                  <Card className="h-full p-6 hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group">
                                      <div
                                          className={`p-4 bg-gradient-to-r ${module.color} rounded-lg inline-block mb-4 group-hover:scale-105 transition-transform`}
                                      >
                                          <module.icon className="w-8 h-8 text-white" />
                                      </div>
                                      <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2 group-hover:text-nexsaas-saas-green">
                                          {module.title}
                                      </h3>
                                      <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300 mb-4">
                                          {module.description}
                                      </p>
                                      <div className="flex items-center justify-center text-nexsaas-saas-green opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                          <span className="text-sm font-medium mr-2">
                                              Découvrir
                                          </span>
                                          <ArrowRight className="w-4 h-4" />
                                      </div>
                                  </Card>
                              </Link>
                          </motion.div>
                      ))}
                  </div>
              </div>
          </section>

          {/* Testimonials Section */}
          <section className="py-16 px-4 bg-nexsaas-pure-white dark:bg-gray-900">
              <div className="container mx-auto">
                  <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      className="text-center mb-12"
                  >
                      <h2 className="text-3xl md:text-4xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-4">
                          Les avis de nos clients
                      </h2>
                      <p className="text-lg text-nexsaas-vanta-black dark:text-gray-300 max-w-2xl mx-auto">
                          Plus de 10,000 entreprises font confiance à NexSaaS.
                      </p>
                  </motion.div>

                  <motion.div
                      key={activeTestimonial}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                      className="max-w-3xl mx-auto"
                  >
                      <Card className="text-center p-8 border border-gray-200 dark:border-gray-700">
                          <Quote className="w-10 h-10 text-nexsaas-saas-green mx-auto mb-6" />
                          <p className="text-lg text-nexsaas-vanta-black dark:text-gray-200 mb-6 italic">
                              "{testimonials[activeTestimonial].content}"
                          </p>
                          <div className="flex items-center justify-center mb-4">
                              {[
                                  ...Array(
                                      testimonials[activeTestimonial].rating,
                                  ),
                              ].map((_, i) => (
                                  <Star
                                      key={i}
                                      className="w-5 h-5 text-yellow-400 fill-current"
                                  />
                              ))}
                          </div>
                          <div className="flex items-center justify-center">
                              <img
                                  src={testimonials[activeTestimonial].avatar}
                                  alt={testimonials[activeTestimonial].name}
                                  className="w-12 h-12 rounded-full mr-4 object-cover"
                              />
                              <div>
                                  <h3 className="font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                      {testimonials[activeTestimonial].name}
                                  </h3>
                                  <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                      {testimonials[activeTestimonial].role},{" "}
                                      {testimonials[activeTestimonial].company}
                                  </p>
                              </div>
                          </div>
                      </Card>
                  </motion.div>

                  <div className="flex justify-center mt-6 space-x-2">
                      {testimonials.map((_, index) => (
                          <button
                              key={index}
                              onClick={() => setActiveTestimonial(index)}
                              className={`w-3 h-3 rounded-full transition-colors ${
                                  index === activeTestimonial
                                      ? "bg-nexsaas-saas-green"
                                      : "bg-gray-300 dark:bg-gray-600"
                              }`}
                          />
                      ))}
                  </div>
              </div>
          </section>

          {/* Subscriptions Section */}
          {/* Subscriptions Section */}
          <section id="subscriptions" className="py-16 px-4">
              <div className="container mx-auto">
                  <div className="text-center mb-12">
                      <h2 className="text-3xl md:text-4xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-4">
                          Choisissez votre abonnement
                      </h2>
                      <p className="text-lg text-nexsaas-vanta-black dark:text-gray-300 max-w-2xl mx-auto">
                          Des plans adaptés à chaque taille d'entreprise
                      </p>
                  </div>

                  {loadingPlans ? (
                      <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-nexsaas-saas-green"></div>
                      </div>
                  ) : errorPlans ? (
                      <div className="text-center text-nexsaas-vanta-black dark:text-gray-300">
                          <p className="text-lg">{errorPlans}</p>
                          <Link
                              to="/"
                              className="text-nexsaas-saas-green hover:underline mt-4 inline-block"
                          >
                              Retour à l'accueil
                          </Link>
                      </div>
                  ) : (
                      <div className="flex flex-row overflow-x-auto snap-x snap-mandatory no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-2">
                          {plans.map((plan, index) => (
                              <div
                                  key={plan.id}
                                  className={`relative snap-center flex-shrink-0 w-[200px] md:w-auto ${
                                      plan.nom === "starter"
                                          ? "highlight-plan"
                                          : ""
                                  }`}
                              >
                                  {plan.nom === "starter" && (
                                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                                          <div className="bg-nexsaas-saas-green text-white px-2 py-0.5 rounded-full text-xs font-semibold flex items-center shadow-sm">
                                              <Star className="w-3 h-3 mr-1" />
                                              Populaire
                                          </div>
                                      </div>
                                  )}
                                  <Card
                                      className={`max-w-[200px] min-h-[400px] flex flex-col justify-between text-center p-3 border ${
                                          plan.nom === "starter"
                                              ? "border-nexsaas-saas-green bg-green-50 dark:bg-green-900/20 shadow-md"
                                              : "border-gray-200 dark:border-gray-700"
                                      } rounded-lg mx-auto`}
                                  >
                                      <div>
                                          <h3 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                              {plan.nom
                                                  .charAt(0)
                                                  .toUpperCase() +
                                                  plan.nom.slice(1)}
                                          </h3>
                                          <p className="text-nexsaas-vanta-black dark:text-gray-300 mb-2 text-xs">
                                              Parfait pour{" "}
                                              {plan.nom === "gratuit"
                                                  ? "essayer gratuitement"
                                                  : plan.nom === "starter"
                                                  ? "débuter"
                                                  : plan.nom === "pro"
                                                  ? "les entreprises en croissance"
                                                  : plan.nom === "manager"
                                                  ? "les équipes structurées"
                                                  : "les solutions personnalisées"}
                                          </p>
                                          <div className="mb-2">
                                              <span className="text-3xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                                  {plan.nom === "entreprise"
                                                      ? ""
                                                      : plan.prix === 0
                                                      ? "Gratuit"
                                                      : `${plan.prix} FCFA`}
                                              </span>
                                              {plan.prix !== 0 &&
                                                  plan.nom !== "entreprise" && (
                                                      <span className="text-nexsaas-vanta-black dark:text-gray-300 text-sm">
                                                          /mois
                                                      </span>
                                                  )}
                                          </div>
                                          <ul className="space-y-1 mb-4 text-xs">
                                              {getFeatures(plan).map(
                                                  (feature, featureIndex) => (
                                                      <li
                                                          key={featureIndex}
                                                          className="flex items-center"
                                                      >
                                                          {feature.isAvailable ? (
                                                              <Check className="w-4 h-4 text-nexsaas-saas-green mr-2 flex-shrink-0" />
                                                          ) : (
                                                              <X className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
                                                          )}
                                                          <span className="text-nexsaas-vanta-black dark:text-gray-300 text-left text-xs">
                                                              {
                                                                  feature.description
                                                              }
                                                          </span>
                                                      </li>
                                                  ),
                                              )}
                                          </ul>
                                      </div>
                                      <Link to="/inscription" className="block">
                                          <Button
                                              variant={
                                                  plan.nom === "starter"
                                                      ? "primary"
                                                      : "outline"
                                              }
                                              className="w-full bg-nexsaas-saas-green text-white hover:bg-green-600 text-sm"
                                              size="md"
                                          >
                                              {plan.nom === "entreprise"
                                                  ? "Faire un devis"
                                                  : "Commencer"}
                                              <ArrowRight className="w-3 h-3 ml-1" />
                                          </Button>
                                      </Link>
                                  </Card>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 px-4 bg-gradient-to-r from-nexsaas-deep-blue to-nexsaas-saas-green">
              <div className="container mx-auto text-center">
                  <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                  >
                      <h2 className="text-3xl md:text-4xl font-bold text-nexsaas-pure-white mb-4">
                          Transformez votre gestion dès aujourd'hui
                      </h2>
                      <p className="text-lg text-nexsaas-pure-white/90 mb-8 max-w-2xl mx-auto">
                          Rejoignez les milliers d'entreprises qui optimisent
                          leurs processus avec NexSaaS. Commencez gratuitement
                          dès maintenant.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          <Link to="/inscription">
                              <Button
                                  size="lg"
                                  className="w-full sm:w-auto bg-nexsaas-pure-white text-nexsaas-deep-blue hover:bg-gray-100"
                              >
                                  <Zap className="w-5 h-5 mr-2" />
                                  Commencer gratuitement
                              </Button>
                          </Link>
                      </div>
                      <div className="mt-6 flex items-center justify-center space-x-6 text-nexsaas-pure-white/80 text-sm">
                          <div className="flex items-center">
                              <Check className="w-4 h-4 mr-2" />
                              Commencer gratuitement
                          </div>
                          <div className="flex items-center">
                              <Check className="w-4 h-4 mr-2" />
                              Sans engagement
                          </div>
                      </div>
                  </motion.div>
              </div>
          </section>
      </div>
  );
};

export default HomePage;