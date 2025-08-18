import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
    Users,
    Mail,
    Briefcase,
    Save,
    ArrowLeft,
    AlertCircle,
    ToggleLeft,
    ToggleRight,
    Phone,
    FileText,
} from "lucide-react";
import Card from "../../components/UI/Card";
import Input from "../../components/UI/Input";
import Button from "../../components/UI/Button";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useActivity } from "../../contexts/ActivityContext";
import {
    addAgent,
    getAgents,
    toggleAgentActif,
    Agent,
    CreateAgentDto,
    UserRole,
    TypePiece,
} from "../../api/agentApi";

interface FormData {
    nom: string;
    prenom: string;
    email: string;
    contact: string;
    typePiece: TypePiece;
    numeroPiece: string;
    photoPiece?: File | null;
    role: UserRole;
}

const AgentsPage: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const { logActivity } = useActivity();

    const [agents, setAgents] = useState<Agent[]>([]);
    const [formData, setFormData] = useState<FormData>({
        nom: "",
        prenom: "",
        email: "",
        contact: "",
        typePiece: TypePiece.CNI,
        numeroPiece: "",
        photoPiece: null,
        role: UserRole.VENDEUR,
    });
    const [errors, setErrors] = useState<Record<string, string | undefined>>({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"all" | "gestionnaire" | "vendeur">("all");

    // Fetch agents
    const fetchAgents = async () => {
        try {
            setLoading(true);
            const data = await getAgents();
            setAgents(data);
        } catch (err: any) {
            showToast({
                type: "error",
                title: "Erreur",
                message: err.message || "Erreur lors de la récupération des agents",
                duration: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    // Fetch agents on mount
    useEffect(() => {
        fetchAgents();
    }, [showToast]);

    const validateForm = () => {
        const newErrors: Record<string, string | undefined> = {};

        if (!formData.nom.trim()) newErrors.nom = "Nom requis";
        if (!formData.prenom.trim()) newErrors.prenom = "Prénom requis";
        if (!formData.email) {
            newErrors.email = "Email requis";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Email invalide";
        }
        if (!formData.contact.trim()) {
            newErrors.contact = "Contact requis";
        } else if (!/^\+?[0-9\s-]{7,15}$/.test(formData.contact)) {
            newErrors.contact = "Numéro de contact invalide (7-15 chiffres)";
        }
        if (!Object.values(TypePiece).includes(formData.typePiece)) {
            newErrors.typePiece = "Type de pièce invalide: choisissez Passeport ou CNI";
        }
        if (!formData.numeroPiece.trim()) {
            newErrors.numeroPiece = "Numéro de pièce requis";
        }
        if (formData.photoPiece) {
            const validTypes = ["image/png", "image/jpeg"];
            if (!validTypes.includes(formData.photoPiece.type)) {
                newErrors.photoPiece = "Fichier invalide: PNG ou JPEG requis";
            } else if (formData.photoPiece.size > 5 * 1024 * 1024) {
                newErrors.photoPiece = "Fichier trop volumineux (max 5MB)";
            }
        }
        if (!Object.values(UserRole).includes(formData.role)) {
            newErrors.role = "Rôle invalide: choisissez Vendeur ou Gestionnaire";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: keyof FormData, value: string | File | null) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
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
                contact: formData.contact.trim(),
                typePiece: formData.typePiece,
                numeroPiece: formData.numeroPiece.trim(),
                photoPiece: formData.photoPiece || undefined,
                role: formData.role,
            };

            const tempAgent: Agent = {
                ...agentData,
                id: "temp-" + Date.now(),
                actif: true,
                creeLe: new Date().toISOString(),
                photoPiece: formData.photoPiece ? URL.createObjectURL(formData.photoPiece) : undefined,
            };
            setAgents((prev) => [...prev, tempAgent]);

            const newAgent = await addAgent(agentData);
            setAgents((prev) =>
                prev.map((agent) => (agent.id === tempAgent.id ? newAgent : agent)),
            );

            logActivity({
                type: "create",
                module: "Agents",
                description: `Ajout d'un nouvel agent: ${formData.nom} ${formData.prenom}`,
                userId: user?.id ?? "unknown",
                metadata: {
                    email: formData.email,
                    contact: formData.contact,
                    typePiece: formData.typePiece,
                    numeroPiece: formData.numeroPiece,
                    role: formData.role,
                },
            });

            showToast({
                type: "success",
                title: "Succès",
                message: "Agent ajouté avec succès",
                duration: 3000,
            });

            setFormData({
                nom: "",
                prenom: "",
                email: "",
                contact: "",
                typePiece: TypePiece.CNI,
                numeroPiece: "",
                photoPiece: null,
                role: UserRole.VENDEUR,
            });
            setErrors({});
        } catch (err: any) {
            setAgents((prev) => prev.filter((agent) => !agent.id.startsWith("temp-")));
            await fetchAgents();
            showToast({
                type: "error",
                title: "Erreur",
                message: err.message || "Une erreur est survenue lors de l'opération",
                duration: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id: string, name: string, actif: boolean) => {
        if (!window.confirm(`Voulez-vous vraiment ${actif ? "désactiver" : "activer"} l'agent ${name} ?`))
            return;

        setLoading(true);
        const previousAgents = agents;
        setAgents((prev) => prev.map((agent) => (agent.id === id ? { ...agent, actif: !actif } : agent)));

        try {
            const updatedAgent = await toggleAgentActif(id);
            setAgents((prev) => prev.map((agent) => (agent.id === id ? updatedAgent : agent)));

            logActivity({
                type: "update",
                module: "Agents",
                description: `Changement de statut de l'agent: ${name} (${actif ? "désactivé" : "activé"})`,
                userId: user?.id ?? "unknown",
                metadata: { id, actif: !actif },
            });

            showToast({
                type: "success",
                title: "Succès",
                message: `Agent ${actif ? "désactivé" : "activé"} avec succès`,
                duration: 3000,
            });

            await fetchAgents();
        } catch (err: any) {
            setAgents(previousAgents);
            await fetchAgents();
            const status = err.response?.status;
            if (status === 403 || status === 500) {
                showToast({
                    type: "error",
                    title: "Erreur",
                    message: err.message || "Une erreur est survenue lors du changement de statut",
                    duration: 5000,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    // Filter agents based on active tab
    const filteredAgents =
        activeTab === "all"
            ? agents
            : activeTab === "gestionnaire"
                ? agents.filter((agent) => agent.role === UserRole.GESTIONNAIRE)
                : agents.filter((agent) => agent.role === UserRole.VENDEUR);

    return (
        <div className="min-h-screen pt-16 bg-gradient-to-br from-nexsaas-pure-white to-nexsaas-light-gray dark:from-nexsaas-vanta-black dark:to-gray-900">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
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
                                    onChange={(value) => handleInputChange("nom", value)}
                                    icon={Users}
                                    error={errors.nom}
                                    required
                                    placeholder="Dupont"
                                />
                                <Input
                                    label="Prénom"
                                    value={formData.prenom}
                                    onChange={(value) => handleInputChange("prenom", value)}
                                    icon={Users}
                                    error={errors.prenom}
                                    required
                                    placeholder="Jean"
                                />
                                <Input
                                    label="Email"
                                    value={formData.email}
                                    onChange={(value) => handleInputChange("email", value)}
                                    icon={Mail}
                                    error={errors.email}
                                    required
                                    placeholder="jean.dupont@example.com"
                                />
                                <Input
                                    label="Contact"
                                    value={formData.contact}
                                    onChange={(value) => handleInputChange("contact", value)}
                                    icon={Phone}
                                    error={errors.contact}
                                    required
                                    placeholder="+1234567890"
                                />
                                <div>
                                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                        Type de pièce d'identité
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={formData.typePiece}
                                            onChange={(e) => handleInputChange("typePiece", e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none appearance-none"
                                        >
                                            <option value={TypePiece.CNI}>CNI</option>
                                            <option value={TypePiece.PASSEPORT}>Passeport</option>
                                        </select>
                                        <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        {errors.typePiece && (
                                            <p className="mt-1 text-sm text-red-600">{errors.typePiece}</p>
                                        )}
                                    </div>
                                </div>
                                <Input
                                    label="Numéro de pièce"
                                    value={formData.numeroPiece}
                                    onChange={(value) => handleInputChange("numeroPiece", value)}
                                    icon={FileText}
                                    error={errors.numeroPiece}
                                    required
                                    placeholder="123456789"
                                />
                                <div>
                                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                        Photo de la pièce
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg"
                                        onChange={(e) =>
                                            handleInputChange("photoPiece", e.target.files ? e.target.files[0] : null)
                                        }
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                                    />
                                    {errors.photoPiece && (
                                        <p className="mt-1 text-sm text-red-600">{errors.photoPiece}</p>
                                    )}
                                    {formData.photoPiece && (
                                        <img
                                            src={URL.createObjectURL(formData.photoPiece)}
                                            alt="Preview"
                                            className="mt-2 w-24 h-24 object-cover rounded"
                                        />
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                    Rôle
                                </label>
                                <div className="relative">
                                    <select
                                        value={formData.role}
                                        onChange={(e) => handleInputChange("role", e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none appearance-none"
                                    >
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
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="sm"
                                    loading={loading}
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Ajouter l'agent
                                </Button>
                            </div>
                        </form>
                    </Card>
                </motion.div>

                {/* Agents List with Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <Card>
                        <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-6">
                            Liste des agents
                        </h2>
                        {/* Tabs */}
                        <div className="flex border-b border-nexsaas-light-gray dark:border-gray-600 mb-6">
                            <button
                                className={`px-4 py-2 text-sm font-medium ${activeTab === "all"
                                    ? "border-b-2 border-nexsaas-saas-green text-nexsaas-deep-blue dark:text-nexsaas-pure-white"
                                    : "text-gray-500 hover:text-nexsaas-deep-blue dark:hover:text-nexsaas-pure-white"
                                    }`}
                                onClick={() => setActiveTab("all")}
                            >
                                Tous
                            </button>
                            <button
                                className={`px-4 py-2 text-sm font-medium ${activeTab === "gestionnaire"
                                    ? "border-b-2 border-nexsaas-saas-green text-nexsaas-deep-blue dark:text-nexsaas-pure-white"
                                    : "text-gray-500 hover:text-nexsaas-deep-blue dark:hover:text-nexsaas-pure-white"
                                    }`}
                                onClick={() => setActiveTab("gestionnaire")}
                            >
                                Gestionnaires
                            </button>
                            <button
                                className={`px-4 py-2 text-sm font-medium ${activeTab === "vendeur"
                                    ? "border-b-2 border-nexsaas-saas-green text-nexsaas-deep-blue dark:text-nexsaas-pure-white"
                                    : "text-gray-500 hover:text-nexsaas-deep-blue dark:hover:text-nexsaas-pure-white"
                                    }`}
                                onClick={() => setActiveTab("vendeur")}
                            >
                                Vendeurs
                            </button>
                        </div>
                        {loading && (
                            <p className="text-center text-nexsaas-vanta-black dark:text-gray-300">
                                Chargement des agents...
                            </p>
                        )}
                        {!loading && filteredAgents.length === 0 && (
                            <div className="text-center py-6">
                                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-nexsaas-vanta-black dark:text-gray-300">
                                    Aucun agent{" "}
                                    {activeTab === "all"
                                        ? "ajouté"
                                        : activeTab === "gestionnaire"
                                            ? "gestionnaire"
                                            : "vendeur"}{" "}
                                    pour le moment.
                                </p>
                            </div>
                        )}
                        {filteredAgents.length > 0 && (
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
                                                Contact
                                            </th>
                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-nexsaas-vanta-black dark:text-gray-300 uppercase tracking-wider">
                                                Type de pièce
                                            </th>
                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-nexsaas-vanta-black dark:text-gray-300 uppercase tracking-wider">
                                                Numéro de pièce
                                            </th>
                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-nexsaas-vanta-black dark:text-gray-300 uppercase tracking-wider">
                                                Photo
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
                                        {filteredAgents.map((agent) => (
                                            <motion.tr
                                                key={agent.id}
                                                whileHover={{ scaleX: 1.01, zIndex: 10 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                                    <div className="flex items-center">
                                                        <Users className="w-5 h-5 text-nexsaas-saas-green mr-2" />
                                                        <span className="truncate">{agent.nom}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                                    <span className="truncate">{agent.prenom}</span>
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 text-sm text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                                    <span className="truncate">{agent.email}</span>
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 text-sm text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                                    <div className="flex items-center">
                                                        <Phone className="w-5 h-5 text-nexsaas-saas-green mr-2" />
                                                        <span className="truncate">{agent.contact}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                                    <div className="flex items-center">
                                                        <FileText className="w-5 h-5 text-nexsaas-saas-green mr-2" />
                                                        {agent.typePiece}
                                                    </div>
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                                    <span className="truncate">{agent.numeroPiece}</span>
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                                    {agent.photoPiece ? (
                                                        <a
                                                            href={agent.photoPiece}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-nexsaas-saas-green hover:underline"
                                                        >
                                                            Voir photo
                                                        </a>
                                                    ) : (
                                                        "Aucune photo"
                                                    )}
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                                    <div className="flex items-center">
                                                        <Briefcase className="w-5 h-5 text-nexsaas-saas-green mr-2" />
                                                        {agent.role}
                                                    </div>
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                                    <div className="flex items-center">
                                                        {agent.actif ? (
                                                            <ToggleRight className="w-5 h-5 text-green-500 mr-2" />
                                                        ) : (
                                                            <ToggleLeft className="w-5 h-5 text-red-500 mr-2" />
                                                        )}
                                                        {agent.actif ? "Actif" : "Inactif"}
                                                    </div>
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleToggleStatus(
                                                                agent.id,
                                                                `${agent.nom} ${agent.prenom}`,
                                                                agent.actif,
                                                            )
                                                        }
                                                        className={
                                                            agent.actif
                                                                ? "text-yellow-600 hover:text-yellow-800"
                                                                : "text-green-600 hover:text-green-800"
                                                        }
                                                        disabled={loading}
                                                    >
                                                        {agent.actif ? (
                                                            <ToggleLeft className="w-4 h-4" />
                                                        ) : (
                                                            <ToggleRight className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                </td>
                                            </motion.tr>
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