import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Mail, Briefcase, Save, ArrowLeft, CheckCircle, AlertCircle, ToggleLeft, ToggleRight, Lock, Eye, EyeOff } from 'lucide-react';

import Card from '../../components/UI/Card';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useActivity } from '../../contexts/ActivityContext';

import { addAgent, getAgents, toggleAgentActif, Agent, CreateAgentDto, UserRole } from '../../api/agentApi';

interface FormData {
    nom: string;
    prenom: string;
    email: string;
    role: UserRole;
}

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

    const handleInputChange = (field: keyof FormData, value: string) => {
        console.debug(`Mise à jour du champ ${field}:`, value);
        setFormData((prev) => {
            const newFormData = {
                ...prev,
                [field]: field === 'role' ? (value as UserRole) : value,
            };
            console.debug("Nouvel état formData:", JSON.stringify(newFormData, null, 2));
            return newFormData;
        });
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            const agentData: CreateAgentDto = {
                nom: formData.nom.trim(),
                prenom: formData.prenom.trim(),
                email: formData.email,
                role: formData.role,
            };

            console.debug("Envoi de l'agentData:", JSON.stringify(agentData, null, 2));
            // Optimistic update: add temporary agent to UI
            const tempAgent: Agent = {
                ...agentData,
                id: 'temp-' + Date.now(),
                actif: true,
                creeLe: new Date().toISOString(),
            };
            setAgents((prev) => [...prev, tempAgent]);

            const newAgent = await addAgent(agentData);
            console.debug("Nouvel agent reçu:", JSON.stringify(newAgent, null, 2));
            // Replace temporary agent with real one
            setAgents((prev) => prev.map((agent) => (agent.id === tempAgent.id ? newAgent : agent)));


            showToast({
                type: 'success',

                title: 'Succès',
                message: 'Agent ajouté avec succès',
                duration: 3000,
            });

            setFormData({ nom: '', prenom: '', email: '', role: UserRole.VENDEUR });
            setErrors({});
        } catch (err: any) {
            console.error("Erreur dans handleSubmit:", {
                message: err.message,
                status: err.response?.status,
                response: JSON.stringify(err.response?.data, null, 2),
            });
            // Revert optimistic update and refresh agents
            setAgents((prev) => prev.filter((agent) => !agent.id.startsWith('temp-')));
            try {
                const data = await getAgents();
                setAgents(data);
            } catch (refreshErr: any) {
                console.error("Erreur lors du rafraîchissement des agents:", refreshErr.message);
            }
            showToast({
                type: 'error',
                title: 'Erreur',
                message: err.message || 'Une erreur est survenue lors de l\'opération',
                duration: 5000,
            });
        } finally {
            setLoading(false);
        }
    };


    const handleToggleStatus = async (id: string, name: string, actif: boolean) => {
        if (!window.confirm(`Voulez-vous vraiment ${actif ? 'désactiver' : 'activer'} l'agent ${name} ?`)) return;

        setLoading(true);
        console.debug(`Tentative de changement de statut pour l'agent ID: ${id}, actif: ${actif}`);
        // Optimistic update: update status in UI immediately
        const previousAgents = agents;
        setAgents((prev) =>
            prev.map((agent) =>
                agent.id === id ? { ...agent, actif: !actif } : agent
            )
        );

        try {
            const updatedAgent = await toggleAgentActif(id);
            console.debug("Agent mis à jour:", JSON.stringify(updatedAgent, null, 2));
            // Update with actual API response
            setAgents((prev) =>
                prev.map((agent) => (agent.id === id ? updatedAgent : agent))
            );

            logActivity({
                type: 'update',
                module: 'Agents',
                description: `Changement de statut de l'agent: ${name} (${actif ? 'désactivé' : 'activé'})`,
                userId: user?.id ?? 'unknown',
                metadata: { id, actif: !actif },
            });

            showToast({
                type: 'success',
                title: 'Succès',
                message: `Agent ${actif ? 'désactivé' : 'activé'} avec succès`,
                duration: 3000,
            });
        } catch (err: any) {
            console.error("Erreur dans handleToggleStatus:", {
                message: err.message,
                status: err.response?.status,
                response: JSON.stringify(err.response?.data, null, 2),
                id,
            });

            // Only show toast for critical errors (e.g., 403, 500)
            const status = err.response?.status;
            const isCriticalError = status === 403 || status === 500;
            if (isCriticalError) {
                showToast({
                    type: 'error',
                    title: 'Erreur',
                    message: err.message || 'Une erreur est survenue lors du changement de statut',
                    duration: 5000,
                });
            } else {
                console.debug("Erreur non critique, toast supprimé:", err.message);
            }

            // Revert optimistic update and refresh agents
            setAgents(previousAgents);
            try {
                const data = await getAgents();
                console.debug("Agents rafraîchis après erreur:", JSON.stringify(data, null, 2));
                setAgents(data);
            } catch (refreshErr: any) {
                console.error("Erreur lors du rafraîchissement des agents:", refreshErr.message);
                showToast({
                    type: 'error',
                    title: 'Erreur',
                    message: 'Erreur lors du rafraîchissement des agents',
                    duration: 5000,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-16 bg-gradient-to-br from-nexsaas-pure-white to-nexsaas-light-gray dark:from-nexsaas-vanta-black dark:to-gray-900">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >

                    <div className="flex flex-col sm:flex-row items-center mb-4 gap-4">
                        <Link to="/dashboard">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Retour
                            </Button>
                        </Link>

                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-nexsaas-deep-blue rounded-lg">
                                <Users className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                    Gestion des Agents
                                </h1>
                                <p className="text-nexsaas-vanta-black dark:text-gray-300 text-sm sm:text-base">
                                    Ajoutez et gérez vos gestionnaires et vendeurs
                                </p>
                            </div>
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="Nom"
                                    value={formData.nom}
                                    onChange={(value) => handleInputChange('nom', value)}
                                    icon={Users}
                                    error={errors.nom}
                                    required
                                    placeholder="Dupont"
                                />
                                <Input
                                    label="Prénom"
                                    value={formData.prenom}
                                    onChange={(value) => handleInputChange('prenom', value)}
                                    icon={Users}
                                    error={errors.prenom}
                                    required
                                    placeholder="Jean"
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

                                        <option value={UserRole.VENDEUR}>Vendeur</option>
                                        <option value={UserRole.GESTIONNAIRE}>Gestionnaire</option>
                                    </select>
                                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    {errors.role && (
                                        <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" variant="primary" size="sm" loading={loading}>
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

                        {loading && <p className="text-center text-nexsaas-vanta-black dark:text-gray-300">Chargement des agents...</p>}
                        {!loading && agents.length === 0 && (
                            <div className="text-center py-6">
                                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-nexsaas-vanta-black dark:text-gray-300">
                                    Aucun agent ajouté pour le moment.
                                </p>
                            </div>

                        )}
                        {agents.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-nexsaas-light-gray dark:divide-gray-600">
                                    <thead className="bg-nexsaas-light-gray dark:bg-gray-700">
                                        <tr>

                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-nexsaas-vanta-black dark:text-gray-300 uppercase tracking-wider">
                                                Nom
                                            </th>
                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-nexsaas-vanta-black dark:text-gray-300 uppercase tracking-wider">
                                                Prénom
                                            </th>
                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-nexsaas-vanta-black dark:text-gray-300 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-nexsaas-vanta-black dark:text-gray-300 uppercase tracking-wider">
                                                Rôle
                                            </th>
                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-nexsaas-vanta-black dark:text-gray-300 uppercase tracking-wider">
                                                Statut
                                            </th>
                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-nexsaas-vanta-black dark:text-gray-300 uppercase tracking-wider">
                                                Actions
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