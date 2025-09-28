import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
    AlertCircle,
    Plus,
    ArrowLeft,
    X,
    CheckCircle,
    XCircle,
    Package,
    RefreshCw,
} from "lucide-react";
import Card from "../../components/UI/Card";
import Input from "../../components/UI/Input";
import Button from "../../components/UI/Button";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useActivity } from "../../contexts/ActivityContext";
import { getEnleveurs, Enleveur } from "../../api/enleveurapi";
import {
    addEnlevement,
    getEnlevements,
    deleteEnlevement,
    Enlevement,
    CreateEnlevementDto,
} from "../../api/enlevementApi";
import { getProduitsStock, ProduitStock, ProduitStockGroup } from "../../api/produitApi";

interface FormData {
    enleveurId: number;
    produitId: number;
    quantite: number;
}

const EnlevementsPage: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const { logActivity } = useActivity();
    const navigate = useNavigate();
    const [enlevements, setEnlevements] = useState<Enlevement[]>([]);
    const [enleveurs, setEnleveurs] = useState<Enleveur[]>([]);
    const [produits, setProduits] = useState<ProduitStock[]>([]);
    const [formData, setFormData] = useState<FormData>({
        enleveurId: 0,
        produitId: 0,
        quantite: 1,
    });
    const [errors, setErrors] = useState<Record<string, string | undefined>>({});
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [enlevementsError, setEnlevementsError] = useState<string | null>(null);
    const [enleveursError, setEnleveursError] = useState<string | null>(null);
    const [produitsError, setProduitsError] = useState<string | null>(null);

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
        fetchEnlevements();
        fetchEnleveurs();
        fetchProduits();
    }, [user, navigate, showToast]);

    const fetchEnlevements = async () => {
        try {
            setLoading(true);
            setEnlevementsError(null);
            const response = await getEnlevements();
            setEnlevements(response);
        } catch (err: any) {
            console.error("Erreur lors de la récupération des enlèvements:", {
                message: err.message,
                status: err.response?.status,
                data: err.response?.data,
            });
            let errorMessage = err.response?.data?.message || "Erreur lors de la récupération des enlèvements";
            if (err.response?.status === 401) {
                errorMessage = "Authentification échouée. Veuillez vous reconnecter.";
            } else if (err.response?.status === 404) {
                errorMessage = "Aucun enlèvement trouvé.";
            } else if (err.message.includes("Network")) {
                errorMessage = "Erreur réseau. Vérifiez votre connexion.";
            }
            setEnlevementsError(errorMessage);
            showToast({
                type: "error",
                title: "Erreur",
                message: errorMessage,
                duration: 5000,
            });
            setEnlevements([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchEnleveurs = async () => {
        try {
            setLoading(true);
            setEnleveursError(null);
            const response = await getEnleveurs();
            if (!Array.isArray(response)) {
                throw new Error("Réponse inattendue : la liste des enleveurs n'est pas un tableau");
            }
            setEnleveurs(response);
        } catch (err: any) {
            console.error("Erreur lors de la récupération des enleveurs:", {
                message: err.message,
                status: err.response?.status,
                data: err.response?.data,
            });
            let errorMessage = err.response?.data?.message || "Erreur lors de la récupération des enleveurs";
            if (err.response?.status === 401) {
                errorMessage = "Authentification échouée. Veuillez vous reconnecter.";
            } else if (err.response?.status === 404) {
                errorMessage = "Aucun enleveur trouvé.";
            } else if (err.message.includes("Network")) {
                errorMessage = "Erreur réseau. Vérifiez votre connexion.";
            }
            setEnleveursError(errorMessage);
            showToast({
                type: "error",
                title: "Erreur",
                message: errorMessage,
                duration: 5000,
            });
            setEnleveurs([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchProduits = async () => {
        try {
            setLoading(true);
            setProduitsError(null);
            const response = await getProduitsStock();
            if (!Array.isArray(response)) {
                throw new Error("Réponse inattendue : la liste des produits n'est pas un tableau");
            }
            const produitsList = response
                .flatMap((group: ProduitStockGroup) => group.stocks)
                .filter((p: ProduitStock) => p.statut === "DISPONIBLE" && p.estActif);
            setProduits(produitsList);
        } catch (err: any) {
            console.error("Erreur lors de la récupération des produits:", {
                message: err.message,
                status: err.response?.status,
                data: err.response?.data,
            });
            let errorMessage = err.response?.data?.message || "Erreur lors de la récupération des produits en stock";
            if (err.response?.status === 401) {
                errorMessage = "Authentification échouée. Veuillez vous reconnecter.";
            } else if (err.response?.status === 404) {
                errorMessage = "Aucun produit trouvé.";
            } else if (err.message.includes("Network")) {
                errorMessage = "Erreur réseau. Vérifiez votre connexion.";
            }
            setProduitsError(errorMessage);
            showToast({
                type: "error",
                title: "Erreur",
                message: errorMessage,
                duration: 5000,
            });
            setProduits([]);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string | undefined> = {};
        if (formData.enleveurId === 0) newErrors.enleveurId = "Enleveur requis";
        if (formData.produitId === 0) newErrors.produitId = "Produit requis";
        if (formData.quantite < 1) newErrors.quantite = "Quantité doit être supérieure à 0";
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
            const enlevementData: CreateEnlevementDto = {
                enleveurId: formData.enleveurId,
                produits: [{ produitId: formData.produitId, quantite: formData.quantite }],
            };
            const newEnlevement = await addEnlevement(enlevementData);
            setEnlevements((prev) => [...prev, newEnlevement]);
            logActivity({
                type: "create",
                module: "Enlevements",
                description: `Création de l'enlèvement #${newEnlevement.id} pour l'enleveur ${formData.enleveurId}`,
                userId: user?.id ?? "unknown",
                metadata: { enlevementId: newEnlevement.id },
            });
            showToast({
                type: "success",
                title: "Succès",
                message: "Enlèvement créé avec succès",
                duration: 3000,
            });
            setIsModalOpen(false);
            setFormData({ enleveurId: 0, produitId: 0, quantite: 1 });
            setErrors({});
        } catch (err: any) {
            console.error("Erreur lors de la création de l'enlèvement:", {
                message: err.message,
                status: err.response?.status,
                data: err.response?.data,
            });
            const errorMessage = err.response?.status === 401
                ? "Authentification échouée. Veuillez vous reconnecter."
                : err.message || "Erreur lors de la création de l’enlèvement";
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

    const handleDelete = async (enlevementId: number) => {
        if (!window.confirm("Voulez-vous supprimer cet enlèvement ?")) return;
        setLoading(true);
        try {
            await deleteEnlevement(enlevementId);
            setEnlevements((prev) => prev.filter((e) => e.id !== enlevementId));
            logActivity({
                type: "delete",
                module: "Enlevements",
                description: `Suppression de l'enlèvement ${enlevementId}`,
                userId: user?.id ?? "unknown",
                metadata: { enlevementId },
            });
            showToast({
                type: "success",
                title: "Succès",
                message: "Enlèvement supprimé avec succès",
                duration: 3000,
            });
        } catch (err: any) {
            console.error("Erreur lors de la suppression de l'enlèvement:", {
                message: err.message,
                status: err.response?.status,
                data: err.response?.data,
            });
            const errorMessage = err.response?.status === 401
                ? "Authentification échouée. Veuillez vous reconnecter."
                : err.message || "Erreur lors de la suppression de l’enlèvement";
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

    const handleRetryEnlevements = () => {
        fetchEnlevements();
    };

    const handleRetryEnleveurs = () => {
        fetchEnleveurs();
    };

    const handleRetryProduits = () => {
        fetchProduits();
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
                                <Package className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                    Gestion des Enlèvements
                                </h1>
                                <p className="text-nexsaas-vanta-black dark:text-gray-300 text-sm sm:text-base">
                                    Gérez les enlèvements enregistrés
                                </p>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setIsModalOpen(true)}
                        disabled={enleveursError || produitsError}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter un enlèvement
                    </Button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <Card>
                        <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-6">
                            Liste des enlèvements
                        </h2>
                        {loading && (
                            <p className="text-center text-nexsaas-vanta-black dark:text-gray-300">Chargement...</p>
                        )}
                        {!loading && enlevementsError && (
                            <div className="text-center py-6">
                                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                <p className="text-nexsaas-vanta-black dark:text-gray-300 mb-4">{enlevementsError}</p>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleRetryEnlevements}
                                    className="flex items-center mx-auto"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Réessayer Enlèvements
                                </Button>
                            </div>
                        )}
                        {!loading && !enlevementsError && enlevements.length === 0 && (
                            <div className="text-center py-6">
                                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-nexsaas-vanta-black dark:text-gray-300">Aucun enlèvement pour le moment.</p>
                            </div>
                        )}
                        {!loading && !enlevementsError && enlevements.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-nexsaas-light-gray dark:divide-gray-600">
                                    <thead className="bg-nexsaas-light-gray dark:bg-gray-700">
                                        <tr>
                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-nexsaas-vanta-black dark:text-gray-300 uppercase tracking-wider">
                                                ID Enlèvement
                                            </th>
                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-nexsaas-vanta-black dark:text-gray-300 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-nexsaas-vanta-black dark:text-gray-300 uppercase tracking-wider">
                                                Statut
                                            </th>
                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-nexsaas-vanta-black dark:text-gray-300 uppercase tracking-wider">
                                                Enleveur
                                            </th>
                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-nexsaas-vanta-black dark:text-gray-300 uppercase tracking-wider">
                                                Produits
                                            </th>
                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-nexsaas-vanta-black dark:text-gray-300 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-nexsaas-pure-white dark:bg-gray-800 divide-y divide-nexsaas-light-gray dark:divide-gray-600">
                                        {enlevements.map((enlevement) => (
                                            <motion.tr key={enlevement.id} whileHover={{ scaleX: 1.01 }}>
                                                <td className="px-4 sm:px-6 py-4 text-sm">#{enlevement.id}</td>
                                                <td className="px-4 sm:px-6 py-4 text-sm">
                                                    {new Date(enlevement.createdAt).toLocaleDateString("fr-CI")}
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 text-sm">
                                                    {enlevement.actif ? (
                                                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 inline" />
                                                    ) : (
                                                        <XCircle className="w-5 h-5 text-red-500 mr-2 inline" />
                                                    )}
                                                    {enlevement.actif ? "Actif" : "Inactif"}
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 text-sm">
                                                    {enlevement.enleveur.nom} {enlevement.enleveur.prenom}
                                                    <br />
                                                    {enlevement.enleveur.documents[0] ? (
                                                        <span className="text-xs text-gray-500">
                                                            {enlevement.enleveur.documents[0].type} - {enlevement.enleveur.documents[0].numero}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-gray-500">Aucun document</span>
                                                    )}
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 text-sm">
                                                    <ul className="list-disc pl-5">
                                                        {enlevement.produitsEnleves.map((produit) => (
                                                            <li key={produit.id}>
                                                                {produit.produit.sku} (ID: {produit.produit.id}, QR: {produit.produit.qrCode}, Qté: {produit.quantite}, Statut: {produit.statut})
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 text-sm">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(enlevement.id)}
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
                                Ajouter un enlèvement
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                        Enleveur <span className="text-red-600">*</span>
                                    </label>
                                    <select
                                        value={formData.enleveurId}
                                        onChange={(e) => setFormData({ ...formData, enleveurId: Number(e.target.value) })}
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                                        disabled={enleveurs.length === 0}
                                    >
                                        <option value={0}>Sélectionner un enleveur</option>
                                        {enleveurs.map((enleveur) => (
                                            <option key={enleveur.id} value={enleveur.id}>
                                                {enleveur.nom} {enleveur.prenom} ({enleveur.documents[0] ? `${enleveur.documents[0].type} - ${enleveur.documents[0].numero}` : "Aucun document"})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.enleveurId && (
                                        <p className="mt-1 text-sm text-red-600">{errors.enleveurId}</p>
                                    )}
                                    {enleveurs.length === 0 && (
                                        <p className="mt-1 text-sm text-red-600">Aucun enleveur disponible. Veuillez réessayer.</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                        Produit <span className="text-red-600">*</span>
                                    </label>
                                    <select
                                        value={formData.produitId}
                                        onChange={(e) => setFormData({ ...formData, produitId: Number(e.target.value) })}
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                                        disabled={produits.length === 0}
                                    >
                                        <option value={0}>Sélectionner un produit</option>
                                        {produits.map((produit) => (
                                            <option key={produit.id} value={produit.id}>
                                                {produit.sku} - {produit.qrCode} (Lot: {produit.lot})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.produitId && (
                                        <p className="mt-1 text-sm text-red-600">{errors.produitId}</p>
                                    )}
                                    {produits.length === 0 && (
                                        <p className="mt-1 text-sm text-red-600">Aucun produit disponible. Veuillez réessayer.</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                        Quantité <span className="text-red-600">*</span>
                                    </label>
                                    <Input
                                        type="number"
                                        value={formData.quantite.toString()}
                                        onChange={(value) => setFormData({ ...formData, quantite: Number(value) })}
                                        placeholder="Quantité"
                                        icon={Package}
                                        error={errors.quantite}
                                        min="1"
                                    />
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
                                        disabled={loading || Object.keys(errors).length > 0 || enleveurs.length === 0 || produits.length === 0}
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

export default EnlevementsPage;