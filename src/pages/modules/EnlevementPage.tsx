import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
    Package,
    Calendar,
    User,
    Hash,
    AlertCircle,
    Plus,
    ArrowLeft,
    X,
    CheckCircle,
    XCircle,
    Eye,
    RotateCcw,
} from "lucide-react";
import { LucideIcon } from "lucide-react";
import Card from "../../components/UI/Card";
import Input from "../../components/UI/Input";
import Button from "../../components/UI/Button";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useActivity } from "../../contexts/ActivityContext";
import {
    addEnlevement,
    getEnlevements,
    getEnlevementById,
    cancelEnlevement,
    Enlevement,
    CreateEnlevementDto,
    EnlevementStatus,
    getProduitsStock,
    Enleveur,
    getEnleveurs,
} from "../../api/enlevementApi";
import { ProduitStock, StatutProduitStock } from "../../api/produitApi";

interface FormData {
    enleveurId: string;
    produits: { produitStockId: number; quantite: number }[];
}

// Extended ProduitStock to include nom from getProduitsStock
interface ExtendedProduitStock extends ProduitStock {
    nom: string;
}

const EnlevementsPage: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const { logActivity } = useActivity();

    const [enlevements, setEnlevements] = useState<Enlevement[]>([]);
    const [enleveurs, setEnleveurs] = useState<Enleveur[]>([]);
    const [produitsStock, setProduitsStock] = useState<ExtendedProduitStock[]>([]);
    const [formData, setFormData] = useState<FormData>({
        enleveurId: "",
        produits: [],
    });
    const [errors, setErrors] = useState<Record<string, string | undefined>>({});
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduit, setSelectedProduit] = useState<{ produitStockId: number; quantite: number }>({
        produitStockId: 0,
        quantite: 0,
    });

    const fetchEnlevements = async () => {
        try {
            setLoading(true);
            const response = await getEnlevements();
            setEnlevements(response);
        } catch (err: any) {
            showToast({
                type: "error",
                title: "Erreur",
                message: err.message || "Erreur lors de la récupération des enlèvements",
                duration: 5000,
            });
            setEnlevements([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchEnleveurs = async () => {
        try {
            const response = await getEnleveurs();
            setEnleveurs(response.filter((enleveur: Enleveur) => enleveur.actif));
        } catch (err: any) {
            showToast({
                type: "error",
                title: "Erreur",
                message: "Erreur lors de la récupération des enleveurs",
                duration: 5000,
            });
            setEnleveurs([]);
        }
    };

    const fetchProduitsStock = async () => {
        try {
            const response = await getProduitsStock();
            setProduitsStock(response as ExtendedProduitStock[]);
        } catch (err: any) {
            showToast({
                type: "error",
                title: "Erreur",
                message: "Erreur lors de la récupération des produits en stock",
                duration: 5000,
            });
            setProduitsStock([]);
        }
    };

    useEffect(() => {
        fetchEnlevements();
        fetchEnleveurs();
        fetchProduitsStock();
    }, []);

    const validateForm = () => {
        const newErrors: Record<string, string | undefined> = {};
        const enleveur = enleveurs.find((e: Enleveur) => e.id === formData.enleveurId);
        if (!formData.enleveurId || !enleveur) {
            newErrors.enleveurId = "Enleveur requis et doit être actif";
        } else if (!enleveur.actif) {
            newErrors.enleveurId = "L'enleveur sélectionné est inactif";
        }
        if (formData.produits.length === 0) {
            newErrors.produits = "Au moins un produit requis";
        } else {
            formData.produits.forEach((item, index) => {
                const produitStock = produitsStock.find((p) => p.id === item.produitStockId);
                if (!produitStock || item.quantite <= 0) {
                    newErrors[`produit_${index}`] = "Produit ou quantité invalide";
                } else if (produitStock.statut !== StatutProduitStock.DISPONIBLE || !produitStock.estActif) {
                    newErrors[`produit_${index}`] = `Produit ${produitStock.nom || `ID: ${produitStock.id}`} non disponible`;
                } else if (item.quantite > 1) {
                    newErrors[`produit_${index}`] = `Quantité maximale de 1 pour ${produitStock.nom || `ID: ${produitStock.id}`}`;
                }
            });
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddProduit = () => {
        if (selectedProduit.produitStockId && selectedProduit.quantite > 0) {
            setFormData((prev) => ({ ...prev, produits: [...prev.produits, selectedProduit] }));
            setSelectedProduit({ produitStockId: 0, quantite: 0 });
        }
    };

    const handleRemoveProduit = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            produits: prev.produits.filter((_, i) => i !== index),
        }));
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[`produit_${index}`];
            return newErrors;
        });
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
                produits: formData.produits,
                userId: user?.id ?? "unknown",
            };
            const newEnlevement = await addEnlevement(enlevementData);
            setEnlevements((prev) => [...prev, newEnlevement]);
            logActivity({
                type: "create",
                module: "Enlevements",
                description: `Création d'un enlèvement par ${enleveurs.find((e: Enleveur) => e.id === formData.enleveurId)?.nom || "Inconnu"
                    }`,
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
            setFormData({ enleveurId: "", produits: [] });
            setErrors({});
            await fetchProduitsStock();
        } catch (err: any) {
            showToast({
                type: "error",
                title: "Erreur",
                message: err.message || "Erreur lors de la création de l'enlèvement",
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
                                <Package className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                    Gestion des Enlèvements
                                </h1>
                                <p className="text-nexsaas-vanta-black dark:text-gray-300 text-sm sm:text-base">
                                    Gérez les enlèvements de produits
                                </p>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setIsModalOpen(true)}
                        disabled={enleveurs.length === 0 || produitsStock.length === 0}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Créer un enlèvement
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
                        {!loading && enlevements.length === 0 && (
                            <div className="text-center py-6">
                                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-nexsaas-vanta-black dark:text-gray-300">Aucun enlèvement pour le moment.</p>
                            </div>
                        )}
                        {enlevements.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-nexsaas-light-gray dark:divide-gray-600">
                                    <thead className="bg-nexsaas-light-gray dark:bg-gray-700">
                                        <tr>
                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-nexsaas-vanta-black dark:text-gray-300 uppercase tracking-wider">
                                                ID
                                            </th>
                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-nexsaas-vanta-black dark:text-gray-300 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-nexsaas-vanta-black dark:text-gray-300 uppercase tracking-wider">
                                                Enleveur
                                            </th>
                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-nexsaas-vanta-black dark:text-gray-300 uppercase tracking-wider">
                                                Nombre de produits
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
                                        {enlevements.map((enlevement) => (
                                            <motion.tr key={enlevement.id} whileHover={{ scaleX: 1.01 }}>
                                                <td className="px-4 sm:px-6 py-4 text-sm">
                                                    <Hash className="w-5 h-5 text-nexsaas-saas-green mr-2 inline" />
                                                    {enlevement.id}
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 text-sm">
                                                    <Calendar className="w-5 h-5 text-nexsaas-saas-green mr-2 inline" />
                                                    {new Date(enlevement.date).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 text-sm">
                                                    <User className="w-5 h-5 text-nexsaas-saas-green mr-2 inline" />
                                                    {enlevement.enleveurNom}
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 text-sm">{enlevement.produits.length}</td>
                                                <td className="px-4 sm:px-6 py-4 text-sm">
                                                    {enlevement.statut === EnlevementStatus.EN_COURS ? (
                                                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 inline" />
                                                    ) : (
                                                        <XCircle className="w-5 h-5 text-red-500 mr-2 inline" />
                                                    )}
                                                    {enlevement.statut}
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 text-sm">
                                                    <Link to={`/dashboard/enlevements/${enlevement.id}`}>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-blue-600 hover:text-blue-800"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
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
                                Créer un enlèvement
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                        Enleveur <span className="text-red-600">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={formData.enleveurId}
                                            onChange={(e) => setFormData({ ...formData, enleveurId: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none appearance-none"
                                            required
                                        >
                                            <option value="">Sélectionnez un enleveur</option>
                                            {enleveurs.map((enleveur) => (
                                                <option key={enleveur.id} value={enleveur.id}>
                                                    {enleveur.nom} {enleveur.prenom}
                                                </option>
                                            ))}
                                        </select>
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        {errors.enleveurId && (
                                            <p className="mt-1 text-sm text-red-600">{errors.enleveurId}</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                        Ajouter un produit
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={selectedProduit.produitStockId}
                                            onChange={(e) =>
                                                setSelectedProduit({
                                                    ...selectedProduit,
                                                    produitStockId: parseInt(e.target.value) || 0,
                                                })
                                            }
                                            className="w-full mb-2 pl-10 pr-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none appearance-none"
                                        >
                                            <option value="0">Sélectionnez un produit</option>
                                            {produitsStock.map((produit) => (
                                                <option key={produit.id} value={produit.id}>
                                                    {produit.nom || `Produit ID: ${produit.id}`} (ID: {produit.id}, Lot: {produit.lot})
                                                </option>
                                            ))}
                                        </select>
                                        <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    </div>
                                    <Input
                                        type="number"
                                        value={selectedProduit.quantite.toString()}
                                        onChange={(value: string) =>
                                            setSelectedProduit({
                                                ...selectedProduit,
                                                quantite: parseInt(value) || 0,
                                            })
                                        }
                                        placeholder="Quantité (max 1)"
                                        icon={Package}
                                    />
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={handleAddProduit}
                                        className="mt-2"
                                    >
                                        Ajouter
                                    </Button>
                                </div>
                                {formData.produits.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center">
                                        <span>
                                            {produitsStock.find((p) => p.id === item.produitStockId)?.nom ||
                                                `Produit ID: ${item.produitStockId}`} (ID: {item.produitStockId}) - Qté: {item.quantite}
                                        </span>
                                        <Button variant="ghost" size="sm" onClick={() => handleRemoveProduit(index)}>
                                            <X className="w-4 h-4 text-red-600" />
                                        </Button>
                                        {errors[`produit_${index}`] && (
                                            <p className="mt-1 text-sm text-red-600">{errors[`produit_${index}`]}</p>
                                        )}
                                    </div>
                                ))}
                                {errors.produits && <p className="mt-1 text-sm text-red-600">{errors.produits}</p>}
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                                        Annuler
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="sm"
                                        loading={loading}
                                        disabled={
                                            loading ||
                                            Object.keys(errors).length > 0 ||
                                            !formData.enleveurId ||
                                            formData.produits.length === 0
                                        }
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

const EnlevementDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();
    const { logActivity } = useActivity();
    const [enlevement, setEnlevement] = useState<Enlevement | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchEnlevement = async () => {
            if (!id) {
                showToast({
                    type: "error",
                    title: "Erreur",
                    message: "ID d'enlèvement manquant",
                    duration: 5000,
                });
                navigate("/dashboard/enlevements");
                return;
            }
            try {
                setLoading(true);
                const response = await getEnlevementById(parseInt(id));
                setEnlevement(response);
            } catch (err: any) {
                showToast({
                    type: "error",
                    title: "Erreur",
                    message: err.message || "Erreur lors de la récupération des détails",
                    duration: 5000,
                });
                navigate("/dashboard/enlevements");
            } finally {
                setLoading(false);
            }
        };
        fetchEnlevement();
    }, [id, navigate, showToast]);

    const handleCancel = async () => {
        if (!id || !window.confirm("Voulez-vous annuler cet enlèvement ? Cela remettra les produits en stock.")) return;
        setLoading(true);
        try {
            const updated = await cancelEnlevement(parseInt(id));
            setEnlevement(updated);
            logActivity({
                type: "update",
                module: "Enlevements",
                description: `Annulation de l'enlèvement ${id}`,
                userId: user?.id ?? "unknown",
                metadata: { enlevementId: parseInt(id) },
            });
            showToast({
                type: "success",
                title: "Succès",
                message: "Enlèvement annulé et stock mis à jour",
                duration: 3000,
            });
        } catch (err: any) {
            showToast({
                type: "error",
                title: "Erreur",
                message: err.message || "Erreur lors de l'annulation",
                duration: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-16 flex items-center justify-center">
                <p className="text-nexsaas-vanta-black dark:text-gray-300">Chargement...</p>
            </div>
        );
    }
    if (!enlevement) {
        return (
            <div className="min-h-screen pt-16 flex items-center justify-center">
                <p className="text-nexsaas-vanta-black dark:text-gray-300">Enlèvement non trouvé</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-16 bg-gradient-to-br from-nexsaas-pure-white to-nexsaas-light-gray dark:from-nexsaas-vanta-black dark:to-gray-900">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <Link to="/dashboard/enlevements">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Retour aux enlèvements
                        </Button>
                    </Link>
                    <h1 className="text-2xl sm:text-3xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mt-4">
                        Détails de l'enlèvement {enlevement.id}
                    </h1>
                </motion.div>
                <Card>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-gray-300">Date</label>
                            <p className="text-nexsaas-deep-blue dark:text-nexsaas-pure-white mt-1">
                                {new Date(enlevement.date).toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-gray-300">
                                Enleveur
                            </label>
                            <p className="text-nexsaas-deep-blue dark:text-nexsaas-pure-white mt-1">{enlevement.enleveurNom}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-gray-300">Statut</label>
                            <p className="text-nexsaas-deep-blue dark:text-nexsaas-pure-white mt-1">{enlevement.statut}</p>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-gray-300">Produits</label>
                            <ul className="mt-1">
                                {enlevement.produits.map((p, i) => (
                                    <li key={i} className="text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                        {p.nom || `Produit ID: ${p.produitStockId}`} (ID: {p.produitStockId}) - Qté: {p.quantite}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    {enlevement.statut !== EnlevementStatus.ANNULE && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleCancel}
                            loading={loading}
                            disabled={loading}
                            className="mt-6 text-red-600 hover:text-red-800"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Annuler l'enlèvement
                        </Button>
                    )}
                </Card>
            </div>
        </div>
    );
};

export { EnlevementsPage, EnlevementDetailsPage };