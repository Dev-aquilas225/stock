import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
    Building2,
    Plus,
    Search,
    MoreVertical,
    Edit,
    Trash2,
    ArrowLeft,
    Phone,
    Mail,
    MapPin,
    Clock,
    DollarSign,
    X,
    Save,
    History,
    Award,
    Package,
    ChevronDown,
    ChevronUp,
    CheckCircle,
    FileText,
} from "lucide-react";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import Input from "../../components/UI/Input";
import { useToast } from "../../contexts/ToastContext";
import { useActivity } from "../../contexts/ActivityContext";
import {
    addFournisseur,
    getFournisseurs,
    getAllFournisseurs,
    getFournisseurById,
    evaluateFournisseur,
    addProduitToFournisseur,
    updateFournisseur,
    updateProduit,
    CreateFournisseurDto,
    Fournisseur,
    Evaluation,
    Produit,
    CreateProduitDto,
    UpdateProduitDto,
} from "../../api/fournisseurApi";
import { debounce } from "lodash";
import { Devise } from "../../types";

// Interface aligned with API's Fournisseur
interface Supplier extends Fournisseur {}

interface Product extends Produit {
    priceHistory?: PriceHistory[];
}

interface PriceHistory {
    id: string;
    price: number;
    date: string;
    negotiatedBy: string;
    notes: string;
}

interface ProductForm {
    nom: string;
    prix: string;
    devise: Devise;
    conditionnement: string;
    delaiApprovisionnement: string;
}

interface DocumentField {
    name: string;
    file: File | null;
}

interface SupplierForm {
    nom: string;
    email: string;
    telephone: string;
    adresse: string;
    categorie: "1" | "2";
    delaiLivraison: string;
    documents: DocumentField[];
}

const SuppliersPage: React.FC = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [showSupplierModal, setShowSupplierModal] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);
    const [showPriceHistoryModal, setShowPriceHistoryModal] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [showDocumentsModal, setShowDocumentsModal] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
        null,
    );
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(
        null,
    );
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(
        null,
    );
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [newRating, setNewRating] = useState(0);
    const [ratingComment, setRatingComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);
    const [expandedSuppliers, setExpandedSuppliers] = useState<Set<number>>(
        new Set(),
    );
    const [suggestions, setSuggestions] = useState<Supplier[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const { showToast } = useToast();
    const { logActivity } = useActivity();

    const [supplierForm, setSupplierForm] = useState<SupplierForm>({
        nom: "",
        email: "",
        telephone: "",
        adresse: "",
        categorie: "1",
        delaiLivraison: "",
        documents: [],
    });

    const [productForm, setProductForm] = useState<ProductForm>({
        nom: "",
        prix: "",
        devise: Devise.EUR,
        conditionnement: "",
        delaiApprovisionnement: "",
    });

    // Fetch all suppliers for suggestions with validation
    useEffect(() => {
        const fetchAllSuppliers = async () => {
            try {
                const data = await getAllFournisseurs();
                setAllSuppliers(data);
            } catch (err: any) {
                showToast({
                    type: "error",
                    title: "Erreur",
                    message:
                        err.message ||
                        "Erreur lors de la récupération des fournisseurs",
                });
            }
        };
        fetchAllSuppliers();
    }, [showToast]);

    // Fetch active suppliers for main list
    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                setLoading(true);
                const data = await getFournisseurs();
                setSuppliers(data);
            } catch (err: any) {
                setError(err.message);
                showToast({
                    type: "error",
                    title: "Erreur",
                    message: err.message,
                });
            } finally {
                setLoading(false);
            }
        };
        fetchSuppliers();
    }, [showToast]);

    // Debounced search for suggestions
    const searchSuppliers = useCallback(
        debounce((search: string) => {
            if (!search) {
                setSuggestions([]);
                setShowSuggestions(false);
                return;
            }
            const filtered = allSuppliers.filter(
                (supplier) =>
                    supplier.nom.toLowerCase().includes(search.toLowerCase()) ||
                    supplier.email
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                    supplier.telephone
                        .toLowerCase()
                        .includes(search.toLowerCase()),
            );
            setSuggestions(filtered);
            setShowSuggestions(true);
        }, 300),
        [allSuppliers],
    );

    // Handle input changes and trigger suggestions
    const handleInputChange = (field: keyof SupplierForm, value: string) => {
        setSupplierForm((prev) => ({ ...prev, [field]: value }));
        if (field === "nom" || field === "email" || field === "telephone") {
            searchSuppliers(value);
        }
    };

    // Handle document field changes
    const handleDocumentChange = (
        index: number,
        field: keyof DocumentField,
        value: string | File | null,
    ) => {
        setSupplierForm((prev) => {
            const newDocuments = [...prev.documents];
            newDocuments[index] = { ...newDocuments[index], [field]: value };
            if (field === "file" && value) {
                showToast({
                    type: "success",
                    title: "Document chargé",
                    message: `Document ${
                        newDocuments[index].name || `n°${index + 1}`
                    } chargé avec succès`,
                });
            }
            return { ...prev, documents: newDocuments };
        });
    };

    // Add new document field
    const addDocumentField = () => {
        setSupplierForm((prev) => ({
            ...prev,
            documents: [...prev.documents, { name: "", file: null }],
        }));
    };

    // Remove document field
    const removeDocumentField = (index: number) => {
        setSupplierForm((prev) => {
            const documentName = prev.documents[index].name || `n°${index + 1}`;
            const newDocuments = prev.documents.filter((_, i) => i !== index);
            showToast({
                type: "info",
                title: "Document retiré",
                message: `Document ${documentName} retiré`,
            });
            return { ...prev, documents: newDocuments };
        });
    };

    // Handle suggestion selection with validation
    const handleSelectSuggestion = (supplier: Supplier) => {
        if (!supplier || !supplier.categorie) {
            showToast({
                type: "error",
                title: "Erreur",
                message: "Fournisseur invalide sélectionné",
            });
            return;
        }
        setSupplierForm({
            nom: supplier.nom || "",
            email: supplier.email || "",
            telephone: supplier.telephone || "",
            adresse: supplier.adresse || "",
            categorie: supplier.categorie as "1" | "2",
            delaiLivraison: supplier.delaiLivraison || "",
            documents: [],
        });
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const resetForms = () => {
        setSupplierForm({
            nom: "",
            email: "",
            telephone: "",
            adresse: "",
            categorie: "1",
            delaiLivraison: "",
            documents: [],
        });
        setProductForm({
            nom: "",
            prix: "",
            devise: Devise.EUR,
            conditionnement: "",
            delaiApprovisionnement: "",
        });
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const handleAddSupplier = () => {
        setEditingSupplier(null);
        resetForms();
        setShowSupplierModal(true);
    };

    const handleEditSupplier = async (supplier: Supplier) => {
        try {
            const fournisseurDetail = await getFournisseurById(supplier.id);
            if (!fournisseurDetail || !fournisseurDetail.categorie) {
                throw new Error("Données du fournisseur invalides");
            }
            setEditingSupplier(fournisseurDetail);
            setSupplierForm({
                nom: supplier.nom || "",
                email: supplier.email || "",
                telephone: supplier.telephone || "",
                adresse: supplier.adresse || "",
                categorie: supplier.categorie as "1" | "2",
                delaiLivraison: supplier.delaiLivraison || "",
                documents: [],
            });
            setShowSupplierModal(true);
        } catch (err: any) {
            showToast({
                type: "error",
                title: "Erreur",
                message:
                    err.message ||
                    "Erreur lors de la récupération des détails du fournisseur",
            });
        }
        setShowActionsMenu(null);
    };

    const handleDeleteSupplier = async (supplierId: string) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer ce fournisseur ?")) {
            try {
                setSuppliers((prev) =>
                    prev.filter((s) => s.id !== parseInt(supplierId)),
                );
                logActivity({
                    type: "delete",
                    module: "Fournisseurs",
                    description: `Fournisseur supprimé: ${supplierId}`,
                    metadata: { supplierId },
                });
                showToast({
                    type: "success",
                    title: "Fournisseur supprimé",
                    message: "Le fournisseur a été supprimé avec succès",
                });
            } catch (err: any) {
                showToast({
                    type: "error",
                    title: "Erreur",
                    message: err.message,
                });
            }
        }
        setShowActionsMenu(null);
    };

    const handleSaveSupplier = async () => {
        if (!supplierForm.nom || !supplierForm.email) {
            showToast({
                type: "error",
                title: "Erreur",
                message: "Veuillez remplir tous les champs obligatoires",
            });
            return;
        }

        try {
            const fournisseurData: CreateFournisseurDto = {
                nom: supplierForm.nom,
                email: supplierForm.email,
                telephone: supplierForm.telephone,
                adresse: supplierForm.adresse,
                categorie: supplierForm.categorie,
                delaiLivraison: supplierForm.delaiLivraison,
                doc1Name: supplierForm.documents[0]?.name || "",
                doc2Name: supplierForm.documents[1]?.name || "",
                doc3Name: supplierForm.documents[2]?.name || "",
                doc4Name: supplierForm.documents[3]?.name || "",
                doc5Name: supplierForm.documents[4]?.name || "",
            };

            const files = {
                doc1: supplierForm.documents[0]?.file || null,
                doc2: supplierForm.documents[1]?.file || null,
                doc3: supplierForm.documents[2]?.file || null,
                doc4: supplierForm.documents[3]?.file || null,
                doc5: supplierForm.documents[4]?.file || null,
            };

            if (editingSupplier) {
                await updateFournisseur(editingSupplier.id, fournisseurData);
                showToast({
                    type: "success",
                    title: "Fournisseur modifié",
                    message:
                        "Les informations du fournisseur ont été mises à jour",
                });
            } else {
                const response = await addFournisseur(fournisseurData, files);
                console.log("addFournisseur response:", response); // For debugging
                if (!response.success) {
                    throw new Error(
                        response.message ||
                            "Erreur lors de la création du fournisseur",
                    );
                }
                logActivity({
                    type: "create",
                    module: "Fournisseurs",
                    description: `Nouveau fournisseur ajouté: ${supplierForm.nom}`,
                    metadata: { supplierId: supplierForm.nom }, // Use nom as fallback
                });
                showToast({
                    type: "success",
                    title: "Fournisseur ajouté",
                    message:
                        response.message ||
                        "Le nouveau fournisseur a été créé avec succès",
                });
            }

            // Fetch updated supplier list without mapping
            const data = await getFournisseurs();
            setSuppliers(data);
            setShowSupplierModal(false);
            resetForms();
        } catch (err: any) {
            console.error("Erreur dans handleSaveSupplier:", err);
            showToast({
                type: "error",
                title: "Erreur",
                message:
                    err.message || "Erreur lors de la création du fournisseur",
            });
        }
    };

    const handleAddProduct = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setEditingProduct(null);
        resetForms();
        setShowProductModal(true);
        setShowActionsMenu(null);
    };

    const handleEditProduct = (supplier: Supplier, product: Product) => {
        setSelectedSupplier(supplier);
        setEditingProduct(product);
        setProductForm({
            nom: product.nom,
            prix: product.prix,
            devise: product.devise,
            conditionnement: product.conditionnement,
            delaiApprovisionnement: product.delaiApprovisionnement,
        });
        setShowProductModal(true);
        setShowActionsMenu(null);
    };

    const handleSaveProduct = async () => {
        if (!selectedSupplier || !productForm.nom || !productForm.prix) {
            showToast({
                type: "error",
                title: "Erreur",
                message:
                    "Veuillez remplir tous les champs obligatoires (nom, prix)",
            });
            return;
        }

        try {
            const produitData: UpdateProduitDto = {
                nom: productForm.nom,
                prix: parseFloat(productForm.prix),
                devise: productForm.devise,
                conditionnement: productForm.conditionnement,
                delaiApprovisionnement: productForm.delaiApprovisionnement,
            };

            if (editingProduct) {
                await updateProduit(editingProduct.id, produitData);
                showToast({
                    type: "success",
                    title: "Produit modifié",
                    message: "Les informations du produit ont été mises à jour",
                });
            } else {
                await addProduitToFournisseur(
                    selectedSupplier.id,
                    produitData as CreateProduitDto,
                );
                showToast({
                    type: "success",
                    title: "Produit ajouté",
                    message: "Le nouveau produit a été ajouté au catalogue",
                });
            }

            const data = await getFournisseurs();
            setSuppliers(data);
            setShowProductModal(false);
            resetForms();
        } catch (err: any) {
            showToast({
                type: "error",
                title: "Erreur",
                message: err.message || "Erreur lors de la gestion du produit",
            });
        }
    };

    const handleShowPriceHistory = (product: Product) => {
        setSelectedProduct(product);
        setShowPriceHistoryModal(true);
        setShowActionsMenu(null);
    };

    const handleRateSupplier = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setNewRating(supplier.evaluation?.note || 0);
        setRatingComment(supplier.evaluation?.commentaire || "");
        setShowRatingModal(true);
        setShowActionsMenu(null);
    };

    const handleViewDocuments = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setShowDocumentsModal(true);
        setShowActionsMenu(null);
    };

    const handleSaveRating = async () => {
        if (!selectedSupplier) return;

        try {
            const evaluationData = {
                note: newRating,
                commentaire: ratingComment,
            };
            const updatedEvaluation = await evaluateFournisseur(
                selectedSupplier.id,
                evaluationData,
            );
            setSuppliers((prev) =>
                prev.map((supplier) =>
                    supplier.id === selectedSupplier.id
                        ? { ...supplier, evaluation: updatedEvaluation }
                        : supplier,
                ),
            );
            logActivity({
                type: "update",
                module: "Fournisseurs",
                description: `Note attribuée au fournisseur ${selectedSupplier.nom}: ${newRating}/5`,
                metadata: {
                    supplierId: selectedSupplier.id,
                    rating: newRating,
                    comment: ratingComment,
                },
            });
            showToast({
                type: "success",
                title: "Note enregistrée",
                message: `Note de ${newRating}/5 attribuée au fournisseur`,
            });
            setShowRatingModal(false);
            setNewRating(0);
            setRatingComment("");
        } catch (err: any) {
            showToast({
                type: "error",
                title: "Erreur",
                message: err.message,
            });
        }
    };

    const toggleSupplierProducts = (supplierId: number) => {
        setExpandedSuppliers((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(supplierId)) {
                newSet.delete(supplierId);
            } else {
                newSet.add(supplierId);
            }
            return newSet;
        });
    };

    const getCategoryLabel = (categorie: string) =>
        categorie === "1" ? "principal" : "secondaire";

    const getCategoryColor = (categorie: string) => {
        return categorie === "1"
            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
            : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
    };

    const getStatusColor = (status: string) => {
        return status === "active"
            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    };

    const renderStars = (
        rating: number,
        interactive = false,
        onRate?: (rating: number) => void,
    ) => {
        return (
            <div className="flex items-center space-x-1 flex-shrink-0">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => interactive && onRate && onRate(star)}
                        disabled={!interactive}
                        className={`${
                            interactive
                                ? "cursor-pointer hover:scale-110"
                                : "cursor-default"
                        } transition-transform`}
                    >
                        <svg
                            className={`w-4 h-4 ${
                                star <= rating
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                            }`}
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                    </button>
                ))}
                <span className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                    ({rating.toFixed(1)})
                </span>
            </div>
        );
    };

    const filteredSuppliers = suppliers.filter((supplier) => {
        const matchesSearch =
            supplier.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
            categoryFilter === "all" ||
            getCategoryLabel(supplier.categorie) === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                    Chargement...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-16 bg-gradient-to-br from-nexsaas-pure-white to-nexsaas-light-gray dark:from-nexsaas-vanta-black dark:to-gray-900">
            <div className="container mx-auto px-4 py-8">
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
                        <div className="p-3 bg-indigo-500 rounded-lg mr-4">
                            <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                Gestion des Fournisseurs
                            </h1>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex overflow-x-auto gap-2 mb-4 pb-2 sm:grid sm:grid-cols-4 sm:overflow-x-visible"
                >
                    <Card className="text-center p-2 min-w-[120px] sm:min-w-0">
                        <div className="p-1 bg-indigo-500/10 rounded-lg inline-block mb-1">
                            <Building2 className="w-4 h-4 text-indigo-500" />
                        </div>
                        <h3 className="text-lg font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                            {suppliers.length}
                        </h3>
                        <p className="text-[10px] text-nexsaas-vanta-black dark:text-gray-300 sm:text-xs">
                            Fournisseurs
                        </p>
                    </Card>

                    <Card className="text-center p-2 min-w-[120px] sm:min-w-0">
                        <div className="p-1 bg-green-500/10 rounded-lg inline-block mb-1">
                            <svg
                                className="w-4 h-4 text-green-500"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                            {(
                                suppliers.reduce(
                                    (acc, s) => acc + (s.evaluation?.note || 0),
                                    0,
                                ) / (suppliers.length || 1)
                            ).toFixed(1)}
                        </h3>
                        <p className="text-[10px] text-nexsaas-vanta-black dark:text-gray-300 sm:text-xs">
                            Note
                        </p>
                    </Card>

                    <Card className="text-center p-2 min-w-[120px] sm:min-w-0">
                        <div className="p-1 bg-blue-500/10 rounded-lg inline-block mb-1">
                            <Package className="w-4 h-4 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                            {suppliers.reduce(
                                (acc, s) => acc + s.produits.length,
                                0,
                            )}
                        </h3>
                        <p className="text-[10px] text-nexsaas-vanta-black dark:text-gray-300 sm:text-xs">
                            Produits
                        </p>
                    </Card>

                    <Card className="text-center p-2 min-w-[120px] sm:min-w-0">
                        <div className="p-1 bg-purple-500/10 rounded-lg inline-block mb-1">
                            <DollarSign className="w-4 h-4 text-purple-500" />
                        </div>
                        <h3 className="text-lg font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                            €0
                        </h3>
                        <p className="text-[10px] text-nexsaas-vanta-black dark:text-gray-300 sm:text-xs">
                            Volume
                        </p>
                    </Card>
                </motion.div>

                {/* Actions Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mb-4"
                >
                    <Card>
                        <div className="flex flex-col gap-3 p-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    aria-label="Rechercher un fournisseur"
                                    className="w-full pl-9 pr-3 py-1.5 text-sm border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                                />
                            </div>

                            <select
                                value={categoryFilter}
                                onChange={(e) =>
                                    setCategoryFilter(e.target.value)
                                }
                                aria-label="Filtrer par catégorie"
                                className="px-3 py-1.5 text-sm border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                            >
                                <option value="all">Toutes</option>
                                <option value="principal">Principal</option>
                                <option value="secondaire">Secondaire</option>
                            </select>

                            <Button
                                onClick={handleAddSupplier}
                                className="text-sm py-1.5"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Nouveau
                            </Button>
                        </div>
                    </Card>
                </motion.div>

                {/* Suppliers List */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="space-y-6"
                >
                    {filteredSuppliers.map((supplier, index) => (
                        <motion.div
                            key={supplier.id}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                        >
                            <Card className="hover:shadow-md transition-shadow">
                                <div className="flex flex-col lg:flex-row lg:items-start justify-between relative">
                                    <div className="flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                                            <div className="flex items-center space-x-3 flex-wrap">
                                                <h3 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                                    {supplier.nom}
                                                </h3>
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
                                                        supplier.categorie,
                                                    )}`}
                                                >
                                                    {getCategoryLabel(
                                                        supplier.categorie,
                                                    )}
                                                </span>
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                        supplier.isDeleted
                                                            ? "inactive"
                                                            : "active",
                                                    )}`}
                                                >
                                                    {supplier.isDeleted
                                                        ? "inactif"
                                                        : "actif"}
                                                </span>
                                            </div>
                                            <div className="mt-2 sm:mt-0">
                                                {renderStars(
                                                    supplier.evaluation?.note ||
                                                        0,
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                            <div className="flex items-center">
                                                <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                                <span className="text-sm text-nexsaas-vanta-black dark:text-gray-300 truncate">
                                                    {supplier.email}
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                                <span className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                                    {supplier.telephone}
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                                                <span className="text-sm text-nexsaas-vanta-black dark:text-gray-300 truncate">
                                                    {supplier.adresse}
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <Clock className="w-4 h-4 text-gray-400 mr-2" />
                                                <span className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                                    Délai:{" "}
                                                    {supplier.delaiLivraison}
                                                </span>
                                            </div>
                                        </div>

                                        {supplier.produits.length > 0 && (
                                            <div className="mb-4">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                                        Produits (
                                                        {
                                                            supplier.produits
                                                                .length
                                                        }
                                                        )
                                                    </h4>
                                                    {supplier.produits.length >
                                                        4 && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                toggleSupplierProducts(
                                                                    supplier.id,
                                                                )
                                                            }
                                                            className="text-sm text-blue-500 hover:text-blue-600"
                                                        >
                                                            {expandedSuppliers.has(
                                                                supplier.id,
                                                            ) ? (
                                                                <>
                                                                    <ChevronUp className="w-4 h-4 mr-1 inline" />
                                                                    Réduire
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <ChevronDown className="w-4 h-4 mr-1 inline" />
                                                                    Voir tous
                                                                </>
                                                            )}
                                                        </Button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
                                                    {(expandedSuppliers.has(
                                                        supplier.id,
                                                    )
                                                        ? supplier.produits
                                                        : supplier.produits.slice(
                                                              0,
                                                              4,
                                                          )
                                                    ).map(
                                                        (product: Product) => (
                                                            <div
                                                                key={product.id}
                                                                className="bg-nexsaas-light-gray dark:bg-gray-700 rounded-lg p-3"
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <h5 className="font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white text-sm">
                                                                            {
                                                                                product.nom
                                                                            }
                                                                        </h5>
                                                                        <p className="text-xs text-nexsaas-vanta-black dark:text-gray-300">
                                                                            SKU:{" "}
                                                                            {
                                                                                product.sku
                                                                            }{" "}
                                                                            •{" "}
                                                                            {
                                                                                product.devise
                                                                            }
                                                                        </p>
                                                                        <p className="text-xs text-nexsaas-vanta-black dark:text-gray-300">
                                                                            Conditionnement:{" "}
                                                                            {product.conditionnement ||
                                                                                "N/A"}
                                                                        </p>
                                                                        <p className="text-xs text-nexsaas-vanta-black dark:text-gray-300">
                                                                            Délai:{" "}
                                                                            {product.delaiApprovisionnement ||
                                                                                "N/A"}
                                                                        </p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="font-bold text-nexsaas-saas-green">
                                                                            {
                                                                                product.prix
                                                                            }{" "}
                                                                            {
                                                                                product.devise
                                                                            }
                                                                        </p>
                                                                        <div className="flex space-x-1">
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleShowPriceHistory(
                                                                                        product,
                                                                                    )
                                                                                }
                                                                                className="text-xs text-blue-500 hover:text-blue-600"
                                                                            >
                                                                                <History className="w-3 h-3" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleEditProduct(
                                                                                        supplier,
                                                                                        product,
                                                                                    )
                                                                                }
                                                                                className="text-xs text-gray-500 hover:text-gray-600"
                                                                            >
                                                                                <Edit className="w-3 h-3" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="absolute top-4 right-4 sm:static sm:mt-4 lg:mt-0 lg:ml-6">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                setShowActionsMenu(
                                                    showActionsMenu ===
                                                        supplier.id.toString()
                                                        ? null
                                                        : supplier.id.toString(),
                                                )
                                            }
                                        >
                                            <MoreVertical className="w-5 h-5" />
                                        </Button>
                                        {showActionsMenu ===
                                            supplier.id.toString() && (
                                            <div className="absolute right-0 lg:left-0 mt-2 w-48 bg-nexsaas-pure-white dark:bg-gray-800 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg shadow-lg z-10">
                                                <button
                                                    onClick={() =>
                                                        handleRateSupplier(
                                                            supplier,
                                                        )
                                                    }
                                                    className="w-full flex items-center px-4 py-2 text-sm text-nexsaas-vanta-black dark:text-gray-300 hover:bg-nexsaas-light-gray dark:hover:bg-gray-700"
                                                >
                                                    <Award className="w-4 h-4 mr-2" />
                                                    Noter
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleAddProduct(
                                                            supplier,
                                                        )
                                                    }
                                                    className="w-full flex items-center px-4 py-2 text-sm text-nexsaas-vanta-black dark:text-gray-300 hover:bg-nexsaas-light-gray dark:hover:bg-gray-700"
                                                >
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Ajouter produit
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleEditSupplier(
                                                            supplier,
                                                        )
                                                    }
                                                    className="w-full flex items-center px-4 py-2 text-sm text-nexsaas-vanta-black dark:text-gray-300 hover:bg-nexsaas-light-gray dark:hover:bg-gray-700"
                                                >
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Modifier
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleViewDocuments(
                                                            supplier,
                                                        )
                                                    }
                                                    className="w-full flex items-center px-4 py-2 text-sm text-nexsaas-vanta-black dark:text-gray-300 hover:bg-nexsaas-light-gray dark:hover:bg-gray-700"
                                                >
                                                    <FileText className="w-4 h-4 mr-2" />
                                                    Voir documents
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteSupplier(
                                                            supplier.id.toString(),
                                                        )
                                                    }
                                                    className="w-full flex items-center px-4 py-2 text-sm text-red-500 hover:bg-nexsaas-light-gray dark:hover:bg-gray-700"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Supprimer
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Supplier Modal */}
                {showSupplierModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                        onClick={() => setShowSupplierModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-nexsaas-pure-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                    {editingSupplier
                                        ? "Modifier le fournisseur"
                                        : "Nouveau fournisseur"}
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowSupplierModal(false)}
                                >
                                    <X className="w-6 h-6" />
                                </Button>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <Input
                                            label="Nom du fournisseur"
                                            value={supplierForm.nom}
                                            onChange={(value) =>
                                                handleInputChange("nom", value)
                                            }
                                            required
                                        />
                                        {showSuggestions &&
                                            suggestions.length > 0 && (
                                                <div className="absolute z-10 w-full bg-nexsaas-pure-white dark:bg-gray-800 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                                                    {suggestions.map(
                                                        (suggestion) => (
                                                            <button
                                                                key={
                                                                    suggestion.id
                                                                }
                                                                onClick={() =>
                                                                    handleSelectSuggestion(
                                                                        suggestion,
                                                                    )
                                                                }
                                                                className="w-full text-left px-4 py-2 text-sm text-nexsaas-vanta-black dark:text-gray-300 hover:bg-nexsaas-light-gray dark:hover:bg-gray-700"
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <span>
                                                                        {
                                                                            suggestion.nom
                                                                        }{" "}
                                                                        {suggestion.isDeleted &&
                                                                            "(Supprimé)"}
                                                                    </span>
                                                                    <span className="text-xs text-gray-500">
                                                                        {
                                                                            suggestion.email
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    {
                                                                        suggestion.telephone
                                                                    }
                                                                </div>
                                                            </button>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                    </div>
                                    <div className="relative">
                                        <Input
                                            label="Email"
                                            type="email"
                                            value={supplierForm.email}
                                            onChange={(value) =>
                                                handleInputChange(
                                                    "email",
                                                    value,
                                                )
                                            }
                                            required
                                        />
                                        {showSuggestions &&
                                            suggestions.length > 0 && (
                                                <div className="absolute z-10 w-full bg-nexsaas-pure-white dark:bg-gray-800 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                                                    {suggestions.map(
                                                        (suggestion) => (
                                                            <button
                                                                key={
                                                                    suggestion.id
                                                                }
                                                                onClick={() =>
                                                                    handleSelectSuggestion(
                                                                        suggestion,
                                                                    )
                                                                }
                                                                className="w-full text-left px-4 py-2 text-sm text-nexsaas-vanta-black dark:text-gray-300 hover:bg-nexsaas-light-gray dark:hover:bg-gray-700"
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <span>
                                                                        {
                                                                            suggestion.nom
                                                                        }{" "}
                                                                        {suggestion.isDeleted &&
                                                                            "(Supprimé)"}
                                                                    </span>
                                                                    <span className="text-xs text-gray-500">
                                                                        {
                                                                            suggestion.email
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    {
                                                                        suggestion.telephone
                                                                    }
                                                                </div>
                                                            </button>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <Input
                                            label="Téléphone"
                                            value={supplierForm.telephone}
                                            onChange={(value) =>
                                                handleInputChange(
                                                    "telephone",
                                                    value,
                                                )
                                            }
                                        />
                                        {showSuggestions &&
                                            suggestions.length > 0 && (
                                                <div className="absolute z-10 w-full bg-nexsaas-pure-white dark:bg-gray-800 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                                                    {suggestions.map(
                                                        (suggestion) => (
                                                            <button
                                                                key={
                                                                    suggestion.id
                                                                }
                                                                onClick={() =>
                                                                    handleSelectSuggestion(
                                                                        suggestion,
                                                                    )
                                                                }
                                                                className="w-full text-left px-4 py-2 text-sm text-nexsaas-vanta-black dark:text-gray-300 hover:bg-nexsaas-light-gray dark:hover:bg-gray-700"
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <span>
                                                                        {
                                                                            suggestion.nom
                                                                        }{" "}
                                                                        {suggestion.isDeleted &&
                                                                            "(Supprimé)"}
                                                                    </span>
                                                                    <span className="text-xs text-gray-500">
                                                                        {
                                                                            suggestion.email
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    {
                                                                        suggestion.telephone
                                                                    }
                                                                </div>
                                                            </button>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                            Catégorie
                                        </label>
                                        <select
                                            value={supplierForm.categorie}
                                            onChange={(e) =>
                                                setSupplierForm((prev) => ({
                                                    ...prev,
                                                    categorie: e.target
                                                        .value as "1" | "2",
                                                }))
                                            }
                                            className="w-full px-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                                        >
                                            <option value="1">Principal</option>
                                            <option value="2">
                                                Secondaire
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <Input
                                    label="Adresse"
                                    value={supplierForm.adresse}
                                    onChange={(value) =>
                                        setSupplierForm((prev) => ({
                                            ...prev,
                                            adresse: value,
                                        }))
                                    }
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        label="Délai de livraison"
                                        value={supplierForm.delaiLivraison}
                                        onChange={(value) =>
                                            setSupplierForm((prev) => ({
                                                ...prev,
                                                delaiLivraison: value,
                                            }))
                                        }
                                        placeholder="ex: 5-7 jours"
                                    />
                                </div>

                                {/* Document Inputs */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                            Documents (facultatifs)
                                        </h3>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={addDocumentField}
                                            disabled={
                                                supplierForm.documents.length >=
                                                5
                                            }
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Ajouter un document
                                        </Button>
                                    </div>
                                    {supplierForm.documents.map(
                                        (doc, index) => (
                                            <div
                                                key={index}
                                                className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center"
                                            >
                                                <Input
                                                    label={`Nom du document ${
                                                        index + 1
                                                    }`}
                                                    value={doc.name}
                                                    onChange={(value) =>
                                                        handleDocumentChange(
                                                            index,
                                                            "name",
                                                            value,
                                                        )
                                                    }
                                                    placeholder={`ex: Contrat ${
                                                        index + 1
                                                    }`}
                                                />
                                                <div className="flex items-center space-x-2">
                                                    <div className="flex-1">
                                                        <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                                            Fichier {index + 1}
                                                        </label>
                                                        <div className="relative">
                                                            <input
                                                                type="file"
                                                                accept=".pdf,.doc,.docx,.jpg,.png"
                                                                onChange={(e) =>
                                                                    handleDocumentChange(
                                                                        index,
                                                                        "file",
                                                                        e.target
                                                                            .files?.[0] ||
                                                                            null,
                                                                    )
                                                                }
                                                                className="w-full px-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                                                            />
                                                            {doc.file && (
                                                                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            removeDocumentField(
                                                                index,
                                                            )
                                                        }
                                                        className="text-red-500 hover:text-red-600"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>

                                <div className="flex justify-end space-x-4">
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setShowSupplierModal(false)
                                        }
                                    >
                                        Annuler
                                    </Button>
                                    <Button onClick={handleSaveSupplier}>
                                        <Save className="w-4 h-4 mr-2" />
                                        {editingSupplier ? "Modifier" : "Créer"}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Product Modal */}
                {showProductModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                        onClick={() => setShowProductModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-nexsaas-pure-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                    {editingProduct
                                        ? "Modifier le produit"
                                        : "Nouveau produit"}
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowProductModal(false)}
                                >
                                    <X className="w-6 h-6" />
                                </Button>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        label="Nom du produit"
                                        value={productForm.nom}
                                        onChange={(value) =>
                                            setProductForm((prev) => ({
                                                ...prev,
                                                nom: value,
                                            }))
                                        }
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        label="Prix"
                                        type="number"
                                        step="0.01"
                                        value={productForm.prix}
                                        onChange={(value) =>
                                            setProductForm((prev) => ({
                                                ...prev,
                                                prix: value,
                                            }))
                                        }
                                        required
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                            Devise
                                        </label>
                                        <select
                                            value={productForm.devise}
                                            onChange={(e) =>
                                                setProductForm((prev) => ({
                                                    ...prev,
                                                    devise: e.target
                                                        .value as Devise,
                                                }))
                                            }
                                            className="w-full px-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                                        >
                                            {Object.values(Devise).map(
                                                (dev) => (
                                                    <option
                                                        key={dev}
                                                        value={dev}
                                                    >
                                                        {dev}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        label="Délai d'approvisionnement"
                                        value={
                                            productForm.delaiApprovisionnement
                                        }
                                        onChange={(value) =>
                                            setProductForm((prev) => ({
                                                ...prev,
                                                delaiApprovisionnement: value,
                                            }))
                                        }
                                        placeholder="ex: 3-5 jours"
                                    />
                                    <Input
                                        label="Conditionnement"
                                        value={productForm.conditionnement}
                                        onChange={(value) =>
                                            setProductForm((prev) => ({
                                                ...prev,
                                                conditionnement: value,
                                            }))
                                        }
                                        placeholder="ex: Carton de 10"
                                    />
                                </div>

                                <div className="flex justify-end space-x-4">
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setShowProductModal(false)
                                        }
                                    >
                                        Annuler
                                    </Button>
                                    <Button onClick={handleSaveProduct}>
                                        <Save className="w-4 h-4 mr-2" />
                                        {editingProduct
                                            ? "Modifier"
                                            : "Ajouter"}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Price History Modal */}
                {showPriceHistoryModal && selectedProduct && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                        onClick={() => setShowPriceHistoryModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-nexsaas-pure-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                    Historique des prix - {selectedProduct.nom}
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        setShowPriceHistoryModal(false)
                                    }
                                >
                                    <X className="w-6 h-6" />
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {selectedProduct.priceHistory &&
                                selectedProduct.priceHistory.length > 0 ? (
                                    selectedProduct.priceHistory.map(
                                        (history, index) => (
                                            <div
                                                key={history.id}
                                                className="border border-nexsaas-light-gray dark:border-gray-600 rounded-lg p-4"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center space-x-3">
                                                        <span className="text-lg font-bold text-nexsaas-saas-green">
                                                            {history.price}{" "}
                                                            {
                                                                selectedProduct.devise
                                                            }
                                                        </span>
                                                        {index === 0 && (
                                                            <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-full">
                                                                Prix actuel
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                                        {history.date}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                                    <p>
                                                        <strong>
                                                            Négocié par:
                                                        </strong>{" "}
                                                        {history.negotiatedBy}
                                                    </p>
                                                    <p>
                                                        <strong>Notes:</strong>{" "}
                                                        {history.notes}
                                                    </p>
                                                </div>
                                            </div>
                                        ),
                                    )
                                ) : (
                                    <p className="text-center text-gray-500">
                                        Aucun historique de prix disponible.
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Rating Modal */}
                {showRatingModal && selectedSupplier && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                        onClick={() => setShowRatingModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-nexsaas-pure-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                    Noter le fournisseur
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowRatingModal(false)}
                                >
                                    <X className="w-6 h-6" />
                                </Button>
                            </div>

                            <div className="space-y-6">
                                <div className="text-center">
                                    <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                        {selectedSupplier.nom}
                                    </h3>
                                    <p className="text-nexsaas-vanta-black dark:text-gray-300 mb-4">
                                        Évaluez la performance de ce fournisseur
                                    </p>

                                    <div className="flex justify-center mb-4">
                                        {renderStars(
                                            newRating,
                                            true,
                                            setNewRating,
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                        Commentaire (optionnel)
                                    </label>
                                    <textarea
                                        value={ratingComment}
                                        onChange={(e) =>
                                            setRatingComment(e.target.value)
                                        }
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                                        placeholder="Votre évaluation..."
                                    />
                                </div>

                                <div className="flex justify-end space-x-4">
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setShowRatingModal(false)
                                        }
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        onClick={handleSaveRating}
                                        disabled={newRating === 0}
                                    >
                                        <Award className="w-4 h-4 mr-2" />
                                        Enregistrer
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Documents Modal */}
                {showDocumentsModal && selectedSupplier && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                        onClick={() => setShowDocumentsModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-nexsaas-pure-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                    Documents de {selectedSupplier.nom}
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowDocumentsModal(false)}
                                >
                                    <X className="w-6 h-6" />
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {selectedSupplier.documents.length > 0 ? (
                                    selectedSupplier.documents.map((doc) => (
                                        <a
                                            key={doc.id}
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block p-4 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <FileText className="w-5 h-5" />
                                                <span>{doc.nom}</span>
                                            </div>
                                        </a>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500">
                                        Aucun document disponible.
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default SuppliersPage;
