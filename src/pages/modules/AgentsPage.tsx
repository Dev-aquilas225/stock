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
    Eye,
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
    documentType: TypePiece;
    documentNumber: string;
    document: File | null;
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
        documentType: TypePiece.CNI,
        documentNumber: "",
        document: null,
        role: UserRole.VENDEUR,
    });
    const [errors, setErrors] = useState<Record<string, string | undefined>>({});
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"all" | "gestionnaire" | "vendeur">("all");
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [imageError, setImageError] = useState(false); // New state for image error

    // Validation en temps réel
    const validateField = (field: keyof FormData, value: string | File | null) => {
        const newErrors: Record<string, string | undefined> = { ...errors };

        if (field === "nom") {
            if (!value || (typeof value === "string" && value.trim() === "")) {
                newErrors.nom = "Nom requis";
            } else {
                delete newErrors.nom;
            }
        }
        if (field === "prenom") {
            if (!value || (typeof value === "string" && value.trim() === "")) {
                newErrors.prenom = "Prénom requis";
            } else {
                delete newErrors.prenom;
            }
        }
        if (field === "email") {
            if (!value || (typeof value === "string" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))) {
                newErrors.email = "Email invalide";
            } else {
                delete newErrors.email;
            }
        }
        if (field === "contact") {
            if (!value || (typeof value === "string" && !/^\+?[0-9\s-]{7,15}$/.test(value.trim()))) {
                newErrors.contact = "Numéro de contact invalide (7-15 chiffres)";
            } else {
                delete newErrors.contact;
            }
        }
        if (field === "documentType") {
            if (!Object.values(TypePiece).includes(value as TypePiece)) {
                newErrors.documentType = "Type de document invalide (CNI, RCCM, DFE)";
            } else {
                delete newErrors.documentType;
            }
        }
        if (field === "documentNumber") {
            const trimmedValue = typeof value === "string" ? value.trim() : "";
            if (!trimmedValue) {
                newErrors.documentNumber = "Numéro de document requis";
            } else if (formData.documentType === TypePiece.CNI && !/^CI\d{9}$/.test(trimmedValue)) {
                newErrors.documentNumber = "Le numéro CNI doit commencer par 'CI' suivi de 9 chiffres";
            } else {
                delete newErrors.documentNumber;
            }
        }
        if (field === "document") {
            if (!value) {
                newErrors.document = "Un document est requis";
            } else if (value instanceof File) {
                const validTypes = ["image/png", "image/jpeg"];
                if (!validTypes.includes(value.type)) {
                    newErrors.document = "Fichier invalide: PNG ou JPEG requis";
                } else if (value.size > 5 * 1024 * 1024) {
                    newErrors.document = "Fichier trop volumineux (max 5MB)";
                } else {
                    delete newErrors.document;
                }
            }
        }
        if (field === "role") {
            if (!Object.values(UserRole).includes(value as UserRole)) {
                newErrors.role = "Rôle invalide";
            } else {
                delete newErrors.role;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: keyof FormData, value: string | File | null) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
        validateField(field, value);
    };

    const validateForm = () => {
        const newErrors: Record<string, string | undefined> = {};

        if (!formData.nom || formData.nom.trim() === "") {
            newErrors.nom = "Nom requis";
        }
        if (!formData.prenom || formData.prenom.trim() === "") {
            newErrors.prenom = "Prénom requis";
        }
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            newErrors.email = "Email invalide";
        }
        if (!formData.contact || !/^\+?[0-9\s-]{7,15}$/.test(formData.contact.trim())) {
            newErrors.contact = "Numéro de contact invalide (7-15 chiffres)";
        }
        if (!Object.values(TypePiece).includes(formData.documentType)) {
            newErrors.documentType = "Type de document invalide (CNI, RCCM, DFE)";
        }
        if (!formData.documentNumber || formData.documentNumber.trim() === "") {
            newErrors.documentNumber = "Numéro de document requis";
        } else if (formData.documentType === TypePiece.CNI && !/^CI\d{9}$/.test(formData.documentNumber.trim())) {
            newErrors.documentNumber = "Le numéro CNI doit commencer par 'CI' suivi de 9 chiffres";
        }
        if (!formData.document) {
            newErrors.document = "Un document est requis";
        } else {
            const validTypes = ["image/png", "image/jpeg"];
            if (!validTypes.includes(formData.document.type)) {
                newErrors.document = "Fichier invalide: PNG ou JPEG requis";
            } else if (formData.document.size > 5 * 1024 * 1024) {
                newErrors.document = "Fichier trop volumineux (max 5MB)";
            }
        }
        if (!Object.values(UserRole).includes(formData.role)) {
            newErrors.role = "Rôle invalide";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Fetch agents
    const fetchAgents = async () => {
        try {
            setLoading(true);
            const data = await getAgents();
            setAgents(data);
        } catch (err: any) {
            console.error("Erreur dans fetchAgents:", err);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            console.error("Validation échouée:", errors);
            showToast({
                type: "error",
                title: "Erreur de validation",
                message: "Veuillez corriger les erreurs dans le formulaire",
                duration: 5000,
            });
            return;
        }

        setLoading(true);
        try {
            const agentData: CreateAgentDto = {
                nom: formData.nom.trim(),
                prenom: formData.prenom.trim(),
                email: formData.email.trim(),
                documentType: formData.documentType,
                documentNumber: formData.documentNumber.trim(),
                role: formData.role,
                document: formData.document!,
            };

            console.log("Données envoyées à addAgent:", agentData);

            const tempAgent: Agent = {
                ...agentData,
                id: "temp-" + Date.now(),
                actif: true,
                creeLe: new Date().toISOString(),
                typePiece: formData.documentType,
                numeroPiece: formData.documentNumber,
                contact: formData.contact,
                photoPiece: formData.document ? URL.createObjectURL(formData.document) : undefined,
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
                    documentType: formData.documentType,
                    documentNumber: formData.documentNumber,
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
                documentType: TypePiece.CNI,
                documentNumber: "",
                document: null,
                role: UserRole.VENDEUR,
            });
            setErrors({});
        } catch (err: any) {
            console.error("Erreur dans handleSubmit:", err);
            setAgents((prev) => prev.filter((agent) => !agent.id.startsWith("temp-")));
            await fetchAgents();
            let errorMessage = err.message || "Une erreur est survenue lors de l'ajout de l'agent";
            if (errorMessage.includes("documentType")) {
                errorMessage = "Le type de document doit être CNI, RCCM ou DFE.";
            } else if (errorMessage.includes("documentNumber")) {
                errorMessage = "Le numéro de document est invalide.";
            } else if (errorMessage.includes("document")) {
                errorMessage = "Un document valide est requis (PNG ou JPEG, max 5MB).";
            }
            showToast({
                type: "error",
                title: "Erreur",
                message: errorMessage,
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
            console.error("Erreur dans handleToggleStatus:", err);
            setAgents(previousAgents);
            await fetchAgents();
            showToast({
                type: "error",
                title: "Erreur",
                message: err.message || "Une erreur est survenue lors du changement de statut",
                duration: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (agent: Agent) => {
        setSelectedAgent(agent);
        setImageError(false); // Reset image error when opening modal
    };

    const closeModal = () => {
        setSelectedAgent(null);
        setImageError(false); // Reset image error when closing modal
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
                                        Type de document <span className="text-red-600">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={formData.documentType}
                                            onChange={(e) => handleInputChange("documentType", e.target.value as TypePiece)}
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none appearance-none"
                                            required
                                        >
                                            <option value={TypePiece.CNI}>CNI</option>
                                            <option value={TypePiece.RCCM}>RCCM</option>
                                            <option value={TypePiece.DFE}>DFE</option>
                                        </select>
                                        <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        {errors.documentType && (
                                            <p className="mt-1 text-sm text-red-600">{errors.documentType}</p>
                                        )}
                                    </div>
                                </div>
                                <Input
                                    label="Numéro de document"
                                    value={formData.documentNumber}
                                    onChange={(value) => handleInputChange("documentNumber", value)}
                                    icon={FileText}
                                    error={errors.documentNumber}
                                    required
                                    placeholder={formData.documentType === TypePiece.CNI ? "CI123456789" : "Numéro de document"}
                                />
                                <div>
                                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                        Document <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg"
                                        onChange={(e) =>
                                            handleInputChange("document", e.target.files ? e.target.files[0] : null)
                                        }
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                                        required
                                    />
                                    {errors.document && (
                                        <p className="mt-1 text-sm text-red-600">{errors.document}</p>
                                    )}
                                    {formData.document && (
                                        <img
                                            src={URL.createObjectURL(formData.document)}
                                            alt="Preview"
                                            className="mt-2 w-24 h-24 object-cover rounded"
                                        />
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                        Rôle <span className="text-red-600">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={formData.role}
                                            onChange={(e) => handleInputChange("role", e.target.value as UserRole)}
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none appearance-none"
                                            required
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
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="sm"
                                    loading={loading}
                                    disabled={loading || Object.keys(errors).length > 0 || !formData.nom || !formData.prenom || !formData.email || !formData.contact || !formData.documentNumber || !formData.document}
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
                                        {filteredAgents.map((agent) => (
                                            <motion.tr
                                                key={agent.id}
                                                whileHover={{ scaleX: 1.01, zIndex: 10 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <td className="px-4 sm:px-6 py-4 text-sm text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                                    <div className="flex items-center">
                                                        <Mail className="w-5 h-5 text-nexsaas-saas-green mr-2" />
                                                        <span className="truncate">{agent.email}</span>
                                                    </div>
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
                                                    <div className="flex gap-2">
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
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleViewDetails(agent)}
                                                            className="text-blue-600 hover:text-blue-800"
                                                            disabled={loading}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                </motion.div>

                {/* Floating Modal for Agent Details */}
                {selectedAgent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-nexsaas-pure-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full m-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-6">
                                Détails de l'agent
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-gray-300">
                                        Nom
                                    </label>
                                    <p className="text-nexsaas-deep-blue dark:text-nexsaas-pure-white mt-1">
                                        {selectedAgent.nom || "Non spécifié"}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-gray-300">
                                        Prénom
                                    </label>
                                    <p className="text-nexsaas-deep-blue dark:text-nexsaas-pure-white mt-1">
                                        {selectedAgent.prenom || "Non spécifié"}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-gray-300">
                                        Email
                                    </label>
                                    <p className="text-nexsaas-deep-blue dark:text-nexsaas-pure-white mt-1">
                                        {selectedAgent.email || "Non spécifié"}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-gray-300">
                                        Contact
                                    </label>
                                    <p className="text-nexsaas-deep-blue dark:text-nexsaas-pure-white mt-1">
                                        {selectedAgent.contact || "Non spécifié"}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-gray-300">
                                        Type de pièce
                                    </label>
                                    <p className="text-nexsaas-deep-blue dark:text-nexsaas-pure-white mt-1">
                                        {selectedAgent.typePiece || "Non spécifié"}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-gray-300">
                                        Numéro de pièce
                                    </label>
                                    <p className="text-nexsaas-deep-blue dark:text-nexsaas-pure-white mt-1">
                                        {selectedAgent.numeroPiece || "Non spécifié"}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-gray-300">
                                        Rôle
                                    </label>
                                    <p className="text-nexsaas-deep-blue dark:text-nexsaas-pure-white mt-1">
                                        {selectedAgent.role || "Non spécifié"}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-gray-300">
                                        Statut
                                    </label>
                                    <p className="text-nexsaas-deep-blue dark:text-nexsaas-pure-white mt-1">
                                        {selectedAgent.actif ? "Actif" : "Inactif"}
                                    </p>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-gray-300">
                                        Photo de la pièce
                                    </label>
                                    {selectedAgent.photoPiece ? (
                                        <>
                                            <img
                                                src={selectedAgent.photoPiece}
                                                alt="Document de l'agent"
                                                className="mt-2 w-32 h-32 object-cover rounded border border-nexsaas-light-gray dark:border-gray-600"
                                                onError={() => setImageError(true)}
                                            />
                                            {imageError && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    Erreur de chargement de l'image
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-nexsaas-deep-blue dark:text-nexsaas-pure-white mt-1">
                                            Aucune photo disponible
                                        </p>
                                    )}
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-gray-300">
                                        Créé le
                                    </label>
                                    <p className="text-nexsaas-deep-blue dark:text-nexsaas-pure-white mt-1">
                                        {selectedAgent.creeLe ? new Date(selectedAgent.creeLe).toLocaleDateString() : "Non spécifié"}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <Button variant="ghost" size="sm" onClick={closeModal}>
                                    Fermer
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default AgentsPage;
