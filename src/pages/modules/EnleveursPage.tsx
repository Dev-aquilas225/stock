import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
    User,
    AlertCircle,
    Plus,
    ArrowLeft,
    X,
    CheckCircle,
    XCircle,
    FileText,
} from "lucide-react";
import Card from "../../components/UI/Card";
import Input from "../../components/UI/Input";
import Button from "../../components/UI/Button";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useActivity } from "../../contexts/ActivityContext";
import {
    addEnleveur,
    getEnleveurs,
    deleteEnleveur,
    Enleveur,
    CreateEnleveurDto,
    TypePiece,
} from "../../api/enleveurApi";

interface FormData {
    nom: string;
    prenom: string;
    email: string;
    documentType: TypePiece;
    documentNumber: string;
    document: File | null;
}

const EnleveursPage: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const { logActivity } = useActivity();
    const navigate = useNavigate();
    const [enleveurs, setEnleveurs] = useState<Enleveur[]>([]);
    const [formData, setFormData] = useState<FormData>({
        nom: "",
        prenom: "",
        email: "",
        documentType: TypePiece.CNI,
        documentNumber: "",
        document: null,
    });
    const [errors, setErrors] = useState<Record<string, string | undefined>>({});
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem("token") || !user) {
            showToast({
                type: "error",
                title: "Session expirée",
                message: "Veuillez vous reconnecter.",
                duration: 5000,
            });
            navigate("/login-client");
            return;
        }
        fetchEnleveurs();
    }, [user, navigate, showToast]);

    const fetchEnleveurs = async () => {
        try {
            setLoading(true);
            const response = await getEnleveurs();
            setEnleveurs(response);
        } catch (err: any) {
            showToast({
                type: "error",
                title: "Erreur",
                message: err.message || "Erreur lors de la récupération des enleveurs",
                duration: 5000,
            });
            setEnleveurs([]);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string | undefined> = {};
        if (!formData.nom.trim()) newErrors.nom = "Nom requis";
        if (!formData.prenom.trim()) newErrors.prenom = "Prénom requis";
        if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Email invalide";
        }
        if (!formData.documentType) newErrors.documentType = "Type de document requis";
        if (!formData.documentNumber.trim()) newErrors.documentNumber = "Numéro de document requis";
        if (!formData.document) newErrors.document = "Document requis";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
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
            const enleveurData: CreateEnleveurDto = {
                nom: formData.nom,
                prenom: formData.prenom,
                email: formData.email,
                documentType: formData.documentType,
                documentNumber: formData.documentNumber,
                document: formData.document!,
            };
            const newEnleveur = await addEnleveur(enleveurData);
            setEnleveurs((prev) => [...prev, newEnleveur]);
            logActivity({
                type: "create",
                module: "Enleveurs",
                description: `Création de l'enleveur ${formData.nom} ${formData.prenom}`,
                userId: user?.id ?? "unknown",
                metadata: { enleveurId: newEnleveur.id },
            });
            showToast({
                type: "success",
                title: "Succès",
                message: "Enleveur créé avec succès",
                duration: 3000,
            });
            setIsModalOpen(false);
            setFormData({ nom: "", prenom: "", email: "", documentType: TypePiece.CNI, documentNumber: "", document: null });
            setErrors({});
        } catch (err: any) {
            const errorMessage = err.message.includes("Client non trouvé")
                ? "Le client associé à votre compte n'a pas été trouvé. Veuillez contacter le support."
                : err.message || "Erreur lors de la création de l'enleveur";
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

    const handleDelete = async (id: string) => {
        if (!window.confirm("Voulez-vous supprimer cet enleveur ?")) return;
        setLoading(true);
        try {
            await deleteEnleveur(id);
            setEnleveurs((prev) => prev.filter((e) => e.id !== id));
            logActivity({
                type: "delete",
                module: "Enleveurs",
                description: `Suppression de l'enleveur ${id}`,
                userId: user?.id ?? "unknown",
                metadata: { enleveurId: id },
            });
            showToast({
                type: "success",
                title: "Succès",
                message: "Enleveur supprimé avec succès",
                duration: 3000,
            });
        } catch (err: any) {
            showToast({
                type: "error",
                title: "Erreur",
                message: err.message || "Erreur lors de la suppression de l'enleveur",
                duration: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-16 bg-gradient-to-br from-nexsaas-pure-white to-nexsaas-light-gray dark:from-nexsaas-vanta-black dark:to-gray-900">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
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
                                <User className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                    Gestion des Enleveurs
                                </h1>
                                <p className="text-nexsaas-vanta-black dark:text-gray-300 text-sm sm:text-base">
                                    Gérez les enleveurs enregistrés
                                </p>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter un enleveur
                    </Button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <Card>
                        <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-6">
                            Liste des enleveurs
                        </h2>
                        {loading && (
                            <p className="text-center text-nexsaas-vanta-black dark:text-gray-300">Chargement...</p>
                        )}
                        {!loading && enleveurs.length === 0 && (
                            <div className="text-center py-6">
                                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-nexsaas-vanta-black dark:text-gray-300">Aucun enleveur pour le moment.</p>
                            </div>
                        )}
                        {enleveurs.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-nexsaas-light-gray dark:divide-gray-600">
                                    <thead className="bg-nexsaas-light-gray dark:bg-gray-700">
                                        <tr>
                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-nexsaas-vanta-black dark:text-gray-300 uppercase tracking-wider">
                                                Nom
                                            </th>
                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-nexsaas-vanta-black dark:text-gray-300 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-nexsaas-vanta-black dark:text-gray-300 uppercase tracking-wider">
                                                Statut
                                            </th>
                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-nexsaas-vanta-black dark:text-gray-300 uppercase tracking-wider">
                                                Document
                                            </th>
                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-nexsaas-vanta-black dark:text-gray-300 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-nexsaas-pure-white dark:bg-gray-800 divide-y divide-nexsaas-light-gray dark:divide-gray-600">
                                        {enleveurs.map((enleveur) => (
                                            <motion.tr key={enleveur.id} whileHover={{ scaleX: 1.01 }}>
                                                <td className="px-4 sm:px-6 py-4 text-sm">
                                                    <User className="w-5 h-5 text-nexsaas-saas-green mr-2 inline" />
                                                    {enleveur.nom} {enleveur.prenom}
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 text-sm">{enleveur.email}</td>
                                                <td className="px-4 sm:px-6 py-4 text-sm">
                                                    {enleveur.actif ? (
                                                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 inline" />
                                                    ) : (
                                                        <XCircle className="w-5 h-5 text-red-500 mr-2 inline" />
                                                    )}
                                                    {enleveur.actif ? "Actif" : "Inactif"}
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 text-sm">
                                                    {enleveur.documents[0] ? (
                                                        <>
                                                            <FileText className="w-5 h-5 text-nexsaas-saas-green mr-2 inline" />
                                                            {enleveur.documents[0].type} - {enleveur.documents[0].numero}
                                                        </>
                                                    ) : (
                                                        "Aucun document"
                                                    )}
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 text-sm">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(enleveur.id)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <X className="w-4 h-4" />
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

                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="bg-nexsaas-pure-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full m-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-6">
                                Ajouter un enleveur
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                        Nom <span className="text-red-600">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        value={formData.nom}
                                        onChange={(value) => setFormData({ ...formData, nom: value })}
                                        placeholder="Nom"
                                        icon={User}
                                        error={errors.nom}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                        Prénom <span className="text-red-600">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        value={formData.prenom}
                                        onChange={(value) => setFormData({ ...formData, prenom: value })}
                                        placeholder="Prénom"
                                        icon={User}
                                        error={errors.prenom}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                        Email <span className="text-red-600">*</span>
                                    </label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(value) => setFormData({ ...formData, email: value })}
                                        placeholder="Email"
                                        icon={User}
                                        error={errors.email}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                        Type de document <span className="text-red-600">*</span>
                                    </label>
                                    <select
                                        value={formData.documentType}
                                        onChange={(e) => setFormData({ ...formData, documentType: e.target.value as TypePiece })}
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none appearance-none"
                                    >
                                        {Object.values(TypePiece).map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.documentType && (
                                        <p className="mt-1 text-sm text-red-600">{errors.documentType}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                        Numéro de document <span className="text-red-600">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        value={formData.documentNumber}
                                        onChange={(value) => setFormData({ ...formData, documentNumber: value })}
                                        placeholder="Numéro de document"
                                        icon={FileText}
                                        error={errors.documentNumber}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                        Document <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="file"
                                        onChange={(e) => setFormData({ ...formData, document: e.target.files?.[0] || null })}
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                                    />
                                    {errors.document && (
                                        <p className="mt-1 text-sm text-red-600">{errors.document}</p>
                                    )}
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                                        Annuler
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="sm"
                                        loading={loading}
                                        disabled={loading || Object.keys(errors).length > 0}
                                    >
                                        Créer
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default EnleveursPage;