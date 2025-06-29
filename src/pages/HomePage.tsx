import React, { useState } from 'react';
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
  Check,
  Star,
  ArrowRight,
  Play,
  Shield,
  Zap,
  Globe,
  Award,
  ChevronRight,
  Quote,
  Building,
  Smartphone,
  Clock,
  Target
} from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';

const HomePage: React.FC = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const modules = [
    {
      icon: Package,
      title: 'Gestion des approvisionnements',
      description: 'Création de commandes avec workflow d\'approbation et tableaux de suivi interactifs',
      color: 'from-blue-500 to-blue-600',
      link: '/approvisionnements',
    },
    {
      icon: ShoppingCart,
      title: 'Gestion des stocks & QR code',
      description: 'Génération QR codes uniques, entrées/sorties, inventaires mobile',
      color: 'from-green-500 to-green-600',
      link: '/stocks',
    },
    {
      icon: TrendingUp,
      title: 'Gestion des ventes',
      description: 'Tunnel e-commerce optimisé multi-device avec remises et promotions',
      color: 'from-purple-500 to-purple-600',
      link: '/ventes',
    },
    {
      icon: Users,
      title: 'Commissions d\'affiliation',
      description: 'Calcul multi-niveaux automatique avec visualisation réseau',
      color: 'from-orange-500 to-orange-600',
      link: '/commissions',
    },
    {
      icon: FileText,
      title: 'Facturation & documents',
      description: 'Génération automatique et envoi par email ou WhatsApp',
      color: 'from-red-500 to-red-600',
      link: '/facturation',
    },
    {
      icon: BarChart3,
      title: 'Analyse & reporting',
      description: 'Dashboards personnalisés avec export KPIs PDF/Excel',
      color: 'from-indigo-500 to-indigo-600',
      link: '/analytics',
    },
    {
      icon: CreditCard,
      title: 'Paiement & finances',
      description: 'Intégration Mobile Money, Stripe, CinetPay',
      color: 'from-teal-500 to-teal-600',
      link: '/paiements',
    },
    {
      icon: MessageCircle,
      title: 'Agent IA support',
      description: 'Réponses automatisées WhatsApp, Messenger avec escalade humain',
      color: 'from-pink-500 to-pink-600',
      link: '/support',
    },
  ];

  const subscriptions = [
    {
      name: 'Starter',
      price: 29,
      originalPrice: 39,
      discount: '25% OFF',
      description: 'Parfait pour débuter',
      features: [
        'Jusqu\'à 100 produits',
        'Gestion de base des stocks',
        'Facturation simple',
        'Support par email',
      ],
      color: 'from-blue-500 to-blue-600',
    },
    {
      name: 'Professional',
      price: 99,
      originalPrice: 129,
      discount: '23% OFF',
      description: 'Le plus populaire',
      isPopular: true,
      features: [
        'Produits illimités',
        'Tous les modules ERP',
        'Commissions multi-niveaux',
        'Agent IA inclus',
        'Support prioritaire',
        'Rapports avancés',
      ],
      color: 'from-nexsaas-saas-green to-green-600',
    },
    {
      name: 'Enterprise',
      price: 299,
      originalPrice: 399,
      discount: '25% OFF',
      description: 'Pour les grandes entreprises',
      features: [
        'Tout du Professional',
        'API personnalisée',
        'Intégrations sur mesure',
        'Support dédié 24/7',
        'Formation équipe',
        'SLA garanti',
      ],
      color: 'from-purple-500 to-purple-600',
    },
  ];

  const testimonials = [
    {
      name: 'Marie Dubois',
      company: 'TechStart SARL',
      role: 'Directrice Générale',
      content: 'NexSaaS a révolutionné notre gestion. En 3 mois, nous avons augmenté notre chiffre d\'affaires de 40% grâce au système d\'affiliation.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    },
    {
      name: 'Jean-Pierre Martin',
      company: 'Commerce Plus',
      role: 'Responsable IT',
      content: 'L\'intégration Mobile Money était exactement ce dont nous avions besoin pour nos clients en Afrique. Interface intuitive et support excellent.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    },
    {
      name: 'Sophie Laurent',
      company: 'Digital Solutions',
      role: 'CEO',
      content: 'Le point de vente avec scanner QR a simplifié nos opérations. Nos équipes ont adopté la solution en quelques jours seulement.',
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
      description: 'Mise en place en moins de 24h avec migration de vos données existantes',
    },
    {
      icon: Shield,
      title: 'Sécurité maximale',
      description: 'Chiffrement bout en bout et conformité RGPD pour protéger vos données',
    },
    {
      icon: Globe,
      title: 'Multi-devises',
      description: 'Support de toutes les devises africaines et européennes',
    },
    {
      icon: Smartphone,
      title: 'Mobile-first',
      description: 'Interface optimisée pour mobile avec app native en développement',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-nexsaas-pure-white via-blue-50 to-purple-50 dark:from-nexsaas-vanta-black dark:via-gray-900 dark:to-purple-950">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-nexsaas-saas-green/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-nexsaas-deep-blue/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center px-4 py-2 bg-nexsaas-saas-green/10 rounded-full text-nexsaas-saas-green font-medium text-sm mb-6">
              <Star className="w-4 h-4 mr-2" />
              Nouveau : Agent IA Support maintenant disponible
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-6">
              <span className="bg-gradient-to-r from-nexsaas-deep-blue to-nexsaas-saas-green bg-clip-text text-transparent">
                NexSaaS
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-nexsaas-vanta-black dark:text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              La plateforme ERP tout-en-un qui révolutionne la gestion de votre réseau d'affiliés. 
              <span className="text-nexsaas-saas-green font-semibold"> Augmentez vos revenus de 40% en moyenne</span> 
              grâce à notre système intelligent.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Link to="/inscription">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-4">
                <Zap className="w-5 h-5 mr-2" />
                Commencer gratuitement
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-4">
              <Play className="w-5 h-5 mr-2" />
              Voir la démo
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                className="text-center"
              >
                <div className="p-3 bg-nexsaas-deep-blue/10 rounded-full inline-block mb-3">
                  <stat.icon className="w-6 h-6 text-nexsaas-deep-blue" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                  {stat.number}
                </div>
                <div className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                  {stat.label}
                </div>
              </motion.div>
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
              Pourquoi choisir NexSaaS ?
            </h2>
            <p className="text-lg text-nexsaas-vanta-black dark:text-gray-300 max-w-2xl mx-auto">
              Une solution pensée pour les entreprises africaines et européennes
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full text-center hover:shadow-lg transition-all duration-300 group">
                  <div className="p-4 bg-nexsaas-saas-green/10 rounded-full inline-block mb-4 group-hover:scale-110 transition-transform">
                    <benefit.icon className="w-8 h-8 text-nexsaas-saas-green" />
                  </div>
                  <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-3">
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
              Modules fonctionnels
            </h2>
            <p className="text-lg text-nexsaas-vanta-black dark:text-gray-300 max-w-2xl mx-auto">
              Une suite complète d'outils pour gérer efficacement votre entreprise et votre réseau d'affiliés
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module, index) => (
              <motion.div
                key={module.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Link to={module.link}>
                  <Card className="h-full text-center group cursor-pointer hover:shadow-xl transition-all duration-300">
                    <div className={`p-4 bg-gradient-to-r ${module.color} rounded-lg inline-block mb-4 group-hover:scale-110 transition-transform`}>
                      <module.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-3 group-hover:text-nexsaas-saas-green transition-colors">
                      {module.title}
                    </h3>
                    <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300 mb-4">
                      {module.description}
                    </p>
                    <div className="flex items-center justify-center text-nexsaas-saas-green opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-sm font-medium mr-2">En savoir plus</span>
                      <ChevronRight className="w-4 h-4" />
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
              Ce que disent nos clients
            </h2>
            <p className="text-lg text-nexsaas-vanta-black dark:text-gray-300 max-w-2xl mx-auto">
              Plus de 10,000 entreprises nous font confiance
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="text-center p-8">
                <Quote className="w-12 h-12 text-nexsaas-saas-green mx-auto mb-6" />
                <p className="text-xl text-nexsaas-vanta-black dark:text-gray-300 mb-6 italic">
                  "{testimonials[activeTestimonial].content}"
                </p>
                
                <div className="flex items-center justify-center mb-4">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <div className="flex items-center justify-center">
                  <img
                    src={testimonials[activeTestimonial].avatar}
                    alt={testimonials[activeTestimonial].name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                      {testimonials[activeTestimonial].name}
                    </h4>
                    <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                      {testimonials[activeTestimonial].role}, {testimonials[activeTestimonial].company}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === activeTestimonial ? 'bg-nexsaas-saas-green' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-4">
              Choisissez votre abonnement
            </h2>
            <p className="text-lg text-nexsaas-vanta-black dark:text-gray-300 max-w-2xl mx-auto">
              Des plans adaptés à chaque taille d'entreprise avec une offre de lancement exceptionnelle
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-red-100 dark:bg-red-900/20 rounded-full text-red-600 dark:text-red-400 font-medium text-sm mt-4">
              <Target className="w-4 h-4 mr-2" />
              Offre limitée : Jusqu'à 25% de réduction
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {subscriptions.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-nexsaas-saas-green text-nexsaas-pure-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      Populaire
                    </div>
                  </div>
                )}
                
                <Card className={`h-full text-center relative overflow-hidden ${
                  plan.isPopular ? 'ring-2 ring-nexsaas-saas-green shadow-xl scale-105' : ''
                }`}>
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
                    <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-nexsaas-vanta-black dark:text-gray-300 mb-4">
                      {plan.description}
                    </p>
                    
                    <div className="mb-6">
                      {plan.originalPrice && (
                        <span className="text-lg text-gray-500 line-through mr-2">
                          {plan.originalPrice}€
                        </span>
                      )}
                      <span className="text-4xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                        {plan.price}€
                      </span>
                      <span className="text-nexsaas-vanta-black dark:text-gray-300">/mois</span>
                    </div>
                    
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center">
                          <Check className="w-5 h-5 text-nexsaas-saas-green mr-3 flex-shrink-0" />
                          <span className="text-nexsaas-vanta-black dark:text-gray-300 text-left text-sm">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    
                    <Link to="/inscription" className="block">
                      <Button 
                        variant={plan.isPopular ? 'primary' : 'outline'}
                        className="w-full"
                        size="lg"
                      >
                        Commencer maintenant
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
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
              Prêt à révolutionner votre business ?
            </h2>
            <p className="text-lg text-nexsaas-pure-white/90 mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers d'entreprises qui ont déjà transformé leur gestion avec NexSaaS. 
              Essai gratuit de 14 jours, sans engagement.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/inscription">
                <Button size="lg" className="bg-nexsaas-pure-white text-nexsaas-deep-blue hover:bg-gray-100 w-full sm:w-auto">
                  <Zap className="w-5 h-5 mr-2" />
                  Démarrer gratuitement
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-nexsaas-deep-blue w-full sm:w-auto">
                <MessageCircle className="w-5 h-5 mr-2" />
                Parler à un expert
              </Button>
            </div>

            <div className="mt-8 flex items-center justify-center space-x-8 text-nexsaas-pure-white/80 text-sm">
              <div className="flex items-center">
                <Check className="w-4 h-4 mr-2" />
                Essai gratuit 14 jours
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 mr-2" />
                Sans engagement
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 mr-2" />
                Support inclus
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;