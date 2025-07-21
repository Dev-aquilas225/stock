import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Mail, Briefcase, Save, ArrowLeft, CheckCircle, AlertCircle, Lock, Eye, EyeOff } from 'lucide-react';
import Card from '../../components/UI/Card';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useActivity } from '../../contexts/ActivityContext';

const AgentsPage: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const { logActivity } = useActivity();

    const [agents, setAgents] = useState<{ id: number; name: string; email: string; role: string; password: string }[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'seller',
        password: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name) newErrors.name = 'Nom requis';
        if (!formData.email) {
            newErrors.email = 'Email requis';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email invalide';
        }
        if (!formData.role) newErrors.role = 'Rôle requis';
        if (!formData.password) {
            newErrors.password = 'Mot de passe requis';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500));

            const newAgent = { ...formData, id: agents.length + 1 };
            setAgents([...agents, newAgent]);
            setFormData({ name: '', email: '', role: 'seller', password: '' });

            logActivity({
                type: 'create',
                module: 'Agents',
                description: `Ajout d'un nouvel agent: ${formData.name}`,
                metadata: { email: formData.email, role: formData.role },
            });

            showToast({
                type: 'success',
                title: 'Agent ajouté',
                message: 'L\'agent a été ajouté avec succès',
            });
        } catch (err) {
            showToast({
                type: 'error',
                title: 'Erreur',
                message: 'Une erreur est survenue lors de l\'ajout de l\'agent',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-16 bg-gradient-to-br from-nexsaas-pure-white to-nexsaas-light-gray dark:from-nexsaas-vanta-black dark:to-gray-900">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
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
                        <div className="p-3 bg-nexsaas-deep-blue rounded-lg mr-4">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                Gestion des Agents
                            </h1>
                            <p className="text-nexsaas-vanta-black dark:text-gray-300">
                                Ajoutez et gérez vos gestionnaires, vendeurs et autres agents
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Add Agent Form */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-8"
                >
                    <Card>
                        <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-6">
                            Ajouter un nouvel agent
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Nom complet"
                                    value={formData.name}
                                    onChange={(value) => handleInputChange('name', value)}
                                    icon={Users}
                                    error={errors.name}
                                    required
                                    placeholder="Jean Dupont"
                                />
                                <Input
                                    label="Email"
                                    value={formData.email}
                                    onChange={(value) => handleInputChange('email', value)}
                                    icon={Mail}
                                    error={errors.email}
                                    required
                                    placeholder="jean.dupont@example.com"
                                />
                            </div>
                            <div className="relative">
                                <Input
                                    label="Mot de passe"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(value) => handleInputChange('password', value)}
                                    icon={Lock}
                                    error={errors.password}
                                    required
                                    placeholder="••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-9 text-gray-400 hover:text-nexsaas-deep-blue dark:hover:text-nexsaas-pure-white"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                    Rôle
                                </label>
                                <div className="relative">
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={(e) => handleInputChange('role', e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none appearance-none"
                                    >
                                        <option value="seller">Vendeur</option>
                                        <option value="manager">Gestionnaire</option>
                                        <option value="other">Autre</option>
                                    </select>
                                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                </div>
                                {errors.role && (
                                    <p className="mt-1 text-xs text-red-600">{errors.role}</p>
                                )}
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">
                                    Exigences du mot de passe :
                                </h4>
                                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                                    <li
                                        className={`flex items-center ${formData.password.length >= 6 ? 'text-green-600' : ''}`}
                                    >
                                        <CheckCircle
                                            className={`w-3 h-3 mr-2 ${formData.password.length >= 6 ? 'text-green-500' : 'text-gray-400'}`}
                                        />
                                        Au moins 6 caractères
                                    </li>
                                    <li
                                        className={`flex items-center ${/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}`}
                                    >
                                        <CheckCircle
                                            className={`w-3 h-3 mr-2 ${/[A-Z]/.test(formData.password) ? 'text-green-500' : 'text-gray-400'}`}
                                        />
                                        Une lettre majuscule (recommandé)
                                    </li>
                                    <li
                                        className={`flex items-center ${/[0-9]/.test(formData.password) ? 'text-green-600' : ''}`}
                                    >
                                        <CheckCircle
                                            className={`w-3 h-3 mr-2 ${/[0-9]/.test(formData.password) ? 'text-green-500' : 'text-gray-400'}`}
                                        />
                                        Un chiffre (recommandé)
                                    </li>
                                </ul>
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" loading={loading}>
                                    <Save className="w-4 h-4 mr-2" />
                                    Ajouter l'agent
                                </Button>
                            </div>
                        </form>
                    </Card>
                </motion.div>

                {/* Agents List */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <Card>
                        <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-6">
                            Liste des agents
                        </h2>
                        {agents.length === 0 ? (
                            <div className="text-center py-6">
                                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-nexsaas-vanta-black dark:text-gray-300">
                                    Aucun agent ajouté pour le moment.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-nexsaas-light-gray dark:divide-gray-600">
                                    <thead className="bg-nexsaas-light-gray dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-nexsaas-vanta-black dark:text-gray-300 uppercase tracking-wider">
                                                Nom
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-nexsaas-vanta-black dark:text-gray-300 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-nexsaas-vanta-black dark:text-gray-300 uppercase tracking-wider">
                                                Rôle
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-nexsaas-pure-white dark:bg-gray-800 divide-y divide-nexsaas-light-gray dark:divide-gray-600">
                                        {agents.map((agent) => (
                                            <tr key={agent.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                                    <div className="flex items-center">
                                                        <Users className="w-5 h-5 text-nexsaas-saas-green mr-2" />
                                                        {agent.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                                    {agent.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                                    <div className="flex items-center">
                                                        <Briefcase className="w-5 h-5 text-nexsaas-saas-green mr-2" />
                                                        {agent.role.charAt(0).toUpperCase() + agent.role.slice(1)}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default AgentsPage;