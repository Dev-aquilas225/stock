import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, Target, Star, ArrowRight } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { getFormules, Formule } from '../../api/formuleApi';

const PricingPage: React.FC = () => {
    const [plans, setPlans] = useState<Formule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                setLoading(true);
                const response = await getFormules();
                if (response.success) {
                    setPlans(response.data);
                } else {
                    setError(response.message);
                }
            } catch (err) {
                setError('Erreur lors du chargement des formules');
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const getFeatures = (plan: Formule) => {
        const features: string[] = [];
        if (plan.maxClients > 0) features.push(`Jusqu'à ${plan.maxClients} clients`);
        if (plan.gestionStock) features.push('Gestion des stocks');
        if (plan.facturationPDF) features.push('Facturation PDF');
        if (plan.rapportsVentes) features.push('Rapports de ventes');
        if (plan.niveauxParrainage > 0) features.push(`${plan.niveauxParrainage} niveaux de parrainage`);
        if (plan.classementEquipe) features.push('Classement d\'équipe');
        if (plan.notificationObjectifs) features.push('Notifications d\'objectifs');
        if (plan.integrationERP) features.push('Intégration ERP');
        if (plan.supportPrioritaire) features.push('Support prioritaire');
        if (plan.managersAutorises > 0) features.push(`${plan.managersAutorises} managers autorisés`);
        return features;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-nexsaas-pure-white via-blue-50 to-purple-50 dark:from-nexsaas-vanta-black dark:via-gray-900 dark:to-purple-950">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-nexsaas-saas-green"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-nexsaas-pure-white via-blue-50 to-purple-50 dark:from-nexsaas-vanta-black dark:via-gray-900 dark:to-purple-950">
                <div className="text-center text-nexsaas-vanta-black dark:text-gray-300">
                    <p className="text-lg">{error}</p>
                    <Link to="/" className="text-nexsaas-saas-green hover:underline mt-4 inline-block">
                        Retour à l'accueil
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-nexsaas-pure-white via-blue-50 to-purple-50 dark:from-nexsaas-vanta-black dark:via-gray-900 dark:to-purple-950">
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
                        {plans.map((plan, index) => (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                                className="relative"
                            >
                                {plan.nom === 'Professional' && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <div className="bg-nexsaas-saas-green text-nexsaas-pure-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                                            <Star className="w-4 h-4 mr-1" />
                                            Populaire
                                        </div>
                                    </div>
                                )}

                                <Card className={`h-full text-center relative overflow-hidden ${plan.nom === 'Professional' ? 'ring-2 ring-nexsaas-saas-green shadow-xl scale-105' : ''
                                    }`}>
                                    <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${plan.nom === 'Starter' ? 'from-blue-500 to-blue-600' :
                                        plan.nom === 'Professional' ? 'from-nexsaas-saas-green to-green-600' :
                                            'from-purple-500 to-purple-600'
                                        }`} />
                                    <div className="pt-6">
                                        <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                            {plan.nom}
                                        </h3>
                                        <p className="text-nexsaas-vanta-black dark:text-gray-300 mb-4">
                                            Parfait pour {plan.nom === 'Starter' ? 'débuter' :
                                                plan.nom === 'Professional' ? 'les entreprises en croissance' :
                                                    'les grandes entreprises'}
                                        </p>

                                        <div className="mb-6">
                                            <span className="text-4xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                                {plan.prix}€
                                            </span>
                                            <span className="text-nexsaas-vanta-black dark:text-gray-300">/mois</span>
                                        </div>

                                        <ul className="space-y-3 mb-8">
                                            {getFeatures(plan).map((feature, featureIndex) => (
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
                                                variant={plan.nom === 'Professional' ? 'primary' : 'outline'}
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
        </div>
    );
};

export default PricingPage;