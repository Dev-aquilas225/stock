import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
    Building2,
    Plus,
    Search,
    Filter,
    Eye,
    Edit,
    Trash2,
    ArrowLeft,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Star,
    Package,
    TrendingUp,
    Clock,
    DollarSign,
    X,
    Save,
    AlertTriangle,
    History,
    ShoppingCart,
    Award,
    MessageCircle,
    User,
} from "lucide-react";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import Input from "../../components/UI/Input";
import { useToast } from "../../contexts/ToastContext";
import { useActivity } from "../../contexts/ActivityContext";
import { useFournisseurs } from "../../hooks/useFournisseur";
import { useProducts } from "../../hooks/useProducts";
import { useContacts } from "../../hooks/useContacts";
import { usePriceHistory } from "../../hooks/usePriceHistory";
import { useRatings } from "../../hooks/useRatings";

interface Supplier {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    category: "principal" | "secondaire";
    rating: number;
    paymentTerms: string;
    deliveryTime: string;
    minimumOrder: number;
    discount: number;
    status: "active" | "inactive";
    createdAt: string;
    lastOrder: string;
    totalOrders: number;
    totalAmount: number;
    products: Product[];
    contacts: Contact[];
    notes: string;
}

interface Product {
    id: string;
    nomProduit: string;
    prixNegocie: number;
    conditionnement: string;
    delaiApprovisionnement: string;
    fournisseurId: string;
    priceHistory: PriceHistory[];
}

interface PriceHistory {
    id: string;
    price: number;
    date: string;
    negotiatedBy: string;
    notes: string;
}

interface Contact {
    id: string;
    nom: string;
    fonction: string;
    email: string;
    telephone: string;
    isPrimary: boolean;
}

const SuppliersPage: React.FC = () => {
    const { fournisseurs, add, loading: supplierLoading, error: supplierError } = useFournisseurs();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [showSupplierModal, setShowSupplierModal] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [showPriceHistoryModal, setShowPriceHistoryModal] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [newRating, setNewRating] = useState(0);
    const [ratingComment, setRatingComment] = useState("");
    const [productLoadError, setProductLoadError] = useState<string | null>(null);

    const { showToast } = useToast();
    const { logActivity } = useActivity();

    const { products, add: addProduct, update: updateProduct, remove: removeProduct, loading: productsLoading, error: productsError } = useProducts(selectedSupplier?.id || "");
    const { contacts, add: addContact, update: updateContact, remove: removeContact, loading: contactsLoading, error: contactsError } = useContacts(selectedSupplier?.id || "");
    const { priceHistory, loading: priceHistoryLoading, error: priceHistoryError } = usePriceHistory(selectedSupplier?.id || "", selectedProduct?.id || "");
    const { rating, addOrUpdate: addOrUpdateRating, loading: ratingsLoading, error: ratingsError } = useRatings(selectedSupplier?.id || "");

    const [supplierForm, setSupplierForm] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        category: "principal" as "principal" | "secondaire",
        paymentTerms: "",
        deliveryTime: "",
        minimumOrder: "",
        discount: "",
        notes: "",
    });

    const [productForm, setProductForm] = useState({
        nomProduit: "",
        prixNegocie: "",
        conditionnement: "",
        delaiApprovisionnement: "",
    });

    const [contactForm, setContactForm] = useState({
        nom: "",
        fonction: "",
        email: "",
        telephone: "",
        isPrimary: false,
    });

    // Log selected supplier for debugging
    useEffect(() => {
        console.log("Selected supplier changed:", selectedSupplier);
    }, [selectedSupplier]);

    // Sync suppliers with hook data
    useEffect(() => {
        if (fournisseurs.length > 0) {
            const mappedSuppliers: Supplier[] = fournisseurs.map((fournisseur) => ({
                id: fournisseur.id,
                name: fournisseur.nom,
                email: fournisseur.email,
                phone: fournisseur.telephone,
                address: fournisseur.adresse,
                category: fournisseur.categorie === "1" ? "principal" : "secondaire",
                rating: rating?.rating || 0,
                paymentTerms: "",
                deliveryTime: fournisseur.delaiLivraison,
                minimumOrder: fournisseur.minimumCommande,
                discount: parseFloat(fournisseur.remise) || 0,
                status: "active",
                createdAt: fournisseur.createdAt,
                lastOrder: "",
                totalOrders: 0,
                totalAmount: 0,
                products: selectedSupplier?.id === fournisseur.id ? products : [],
                contacts: selectedSupplier?.id === fournisseur.id ? contacts : [],
                notes: "",
            }));
            setSuppliers(mappedSuppliers);
        }
    }, [fournisseurs, products, contacts, rating, selectedSupplier]);

    // Handle errors from all hooks
    useEffect(() => {
        const error = supplierError || productsError || contactsError || priceHistoryError || ratingsError;
        if (error) {
            if (error === productsError) {
                setProductLoadError(error);
            }
            showToast({
                type: "error",
                title: "Erreur",
                message: error,
                duration: 5000,
            });
        } else {
            setProductLoadError(null);
        }
    }, [supplierError, productsError, contactsError, priceHistoryError, ratingsError, showToast]);

    const resetForms = () => {
        setSupplierForm({
            name: "",
            email: "",
            phone: "",
            address: "",
            category: "principal",
            paymentTerms: "",
            deliveryTime: "",
            minimumOrder: "",
            discount: "",
            notes: "",
        });
        setProductForm({
            nomProduit: "",
            prixNegocie: "",
            conditionnement: "",
            delaiApprovisionnement: "",
        });
        setContactForm({
            nom: "",
            fonction: "",
            email: "",
            telephone: "",
            isPrimary: false,
        });
    };

    const handleAddSupplier = () => {
        setEditingSupplier(null);
        resetForms();
        setShowSupplierModal(true);
    };

    const handleEditSupplier = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setSupplierForm({
            name: supplier.name,
            email: supplier.email,
            phone: supplier.phone,
            address: supplier.address,
            category: supplier.category,
            paymentTerms: supplier.paymentTerms,
            deliveryTime: supplier.deliveryTime,
            minimumOrder: supplier.minimumOrder.toString(),
            discount: supplier.discount.toString(),
            notes: supplier.notes,
        });
        setShowSupplierModal(true);
    };

    const handleDeleteSupplier = (supplierId: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce fournisseur ?")) {
            setSuppliers((prev) => prev.filter((s) => s.id !== supplierId));
            logActivity({
                type: "delete",
                module: "Fournisseurs",
                description: `Fournisseur supprimé: ${supplierId}`,
                metadata: { fournisseurId: supplierId },
            });
            showToast({
                type: "success",
                title: "Fournisseur supprimé",
                message: "Le fournisseur a été supprimé avec succès",
            });
        }
    };

    const handleSaveSupplier = async () => {
        if (!supplierForm.name || !supplierForm.email) {
            showToast({
                type: "error",
                title: "Erreur",
                message: "Veuillez remplir tous les champs obligatoires",
            });
            return;
        }

        if (editingSupplier) {
            setSuppliers((prev) =>
                prev.map((supplier) =>
                    supplier.id === editingSupplier.id
                        ? {
                            ...supplier,
                            ...supplierForm,
                            minimumOrder: parseFloat(supplierForm.minimumOrder) || 0,
                            discount: parseFloat(supplierForm.discount) || 0,
                        }
                        : supplier,
                ),
            );
            logActivity({
                type: "update",
                module: "Fournisseurs",
                description: `Fournisseur modifié: ${supplierForm.name}`,
                metadata: { fournisseurId: editingSupplier.id },
            });
            showToast({
                type: "success",
                title: "Fournisseur modifié",
                message: "Les informations du fournisseur ont été mises à jour",
            });
        } else {
            try {
                console.log("Adding supplier with data:", supplierForm);
                const fournisseurDto = {
                    nom: supplierForm.name,
                    email: supplierForm.email,
                    telephone: supplierForm.phone,
                    adresse: supplierForm.address,
                    categorie: supplierForm.category === "principal" ? "1" : "2",
                    delaiLivraison: supplierForm.deliveryTime,
                    minimumCommande: parseFloat(supplierForm.minimumOrder) || 0,
                    remise: supplierForm.discount.toString(),
                };
                const response = await add(fournisseurDto);
                console.log("Add supplier response:", response);
                showToast({
                    type: "success",
                    title: "Fournisseur ajouté",
                    message: "Le fournisseur a été ajouté avec succès",
                });
            } catch (err) {
                // Error handled by useFournisseurs
            }
        }
        setShowSupplierModal(false);
        resetForms();
    };

    const handleAddProduct = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setEditingProduct(null);
        resetForms();
        setShowProductModal(true);
    };

    const handleEditProduct = (supplier: Supplier, product: Product) => {
        setSelectedSupplier(supplier);
        setEditingProduct(product);
        setProductForm({
            nomProduit: product.nomProduit,
            prixNegocie: product.prixNegocie.toString(),
            conditionnement: product.conditionnement,
            delaiApprovisionnement: product.delaiApprovisionnement,
        });
        setShowProductModal(true);
    };

    const handleSaveProduct = async () => {
        if (!selectedSupplier) {
            showToast({
                type: "error",
                title: "Erreur",
                message: "Aucun fournisseur sélectionné",
            });
            return;
        }

        if (
            !productForm.nomProduit ||
            !productForm.prixNegocie ||
            isNaN(parseFloat(productForm.prixNegocie)) ||
            !productForm.conditionnement ||
            !productForm.delaiApprovisionnement
        ) {
            showToast({
                type: "error",
                title: "Erreur",
                message: "Veuillez remplir tous les champs obligatoires (Nom, Prix, Conditionnement, Délai)",
            });
            return;
        }

        const productData = {
            nomProduit: productForm.nomProduit,
            prixNegocie: parseFloat(productForm.prixNegocie),
            conditionnement: productForm.conditionnement,
            delaiApprovisionnement: productForm.delaiApprovisionnement,
        };

        try {
            console.log("Saving product with data:", productData);
            if (editingProduct) {
                const response = await updateProduct(editingProduct.id, selectedSupplier.id, productData);
                console.log("Update product response:", response);
                logActivity({
                    type: "update",
                    module: "Produits",
                    description: `Produit modifié: ${productForm.nomProduit}`,
                    metadata: { fournisseurId: selectedSupplier.id, productId: editingProduct.id },
                });
                showToast({
                    type: "success",
                    title: "Produit modifié",
                    message: "Le produit a été mis à jour avec succès",
                });
            } else {
                const response = await addProduct(selectedSupplier.id, productData);
                console.log("Add product response:", response);
                logActivity({
                    type: "create",
                    module: "Produits",
                    description: `Produit ajouté: ${productForm.nomProduit}`,
                    metadata: { fournisseurId: selectedSupplier.id },
                });
                showToast({
                    type: "success",
                    title: "Produit ajouté",
                    message: "Le nouveau produit a été ajouté au catalogue",
                });
            }
            setShowProductModal(false);
            resetForms();
        } catch (err) {
            console.error("Error saving product:", err);
        }
    };

    const handleAddContact = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setEditingContact(null);
        resetForms();
        setShowContactModal(true);
    };

    const handleEditContact = (supplier: Supplier, contact: Contact) => {
        setSelectedSupplier(supplier);
        setEditingContact(contact);
        setContactForm({
            nom: contact.nom,
            fonction: contact.fonction,
            email: contact.email,
            telephone: contact.telephone,
            isPrimary: contact.isPrimary,
        });
        setShowContactModal(true);
    };

    const handleSaveContact = async () => {
        if (!selectedSupplier || !contactForm.nom || !contactForm.email) {
            showToast({
                type: "error",
                title: "Erreur",
                message: "Veuillez remplir tous les champs obligatoires (Nom, Email)",
            });
            return;
        }

        const contactData = {
            fournisseurId: selectedSupplier.id,
            nom: contactForm.nom,
            fonction: contactForm.fonction,
            email: contactForm.email,
            telephone: contactForm.telephone,
            isPrimary: contactForm.isPrimary,
        };

        try {
            console.log("Saving contact with data:", contactData);
            if (editingContact) {
                const response = await updateContact(editingContact.id, contactData);
                console.log("Update contact response:", response);
                logActivity({
                    type: "update",
                    module: "Contacts",
                    description: `Contact modifié: ${contactForm.nom}`,
                    metadata: { fournisseurId: selectedSupplier.id, contactId: editingContact.id },
                });
                showToast({
                    type: "success",
                    title: "Contact modifié",
                    message: "Le contact a été mis à jour avec succès",
                });
            } else {
                const response = await addContact(contactData);
                console.log("Add contact response:", response);
                logActivity({
                    type: "create",
                    module: "Contacts",
                    description: `Contact ajouté: ${contactForm.nom}`,
                    metadata: { fournisseurId: selectedSupplier.id },
                });
                showToast({
                    type: "success",
                    title: "Contact ajouté",
                    message: "Le nouveau contact a été ajouté avec succès",
                });
            }
            setShowContactModal(false);
            resetForms();
        } catch (err) {
            console.error("Error saving contact:", err);
        }
    };

    const handleDeleteContact = async (contactId: string) => {
        if (!selectedSupplier) return;
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce contact ?")) {
            try {
                console.log(`Deleting contact ${contactId} for fournisseurId ${selectedSupplier.id}`);
                await removeContact(contactId);
                logActivity({
                    type: "delete",
                    module: "Contacts",
                    description: `Contact supprimé: ${contactId}`,
                    metadata: { fournisseurId: selectedSupplier.id, contactId },
                });
                showToast({
                    type: "success",
                    title: "Contact supprimé",
                    message: "Le contact a été supprimé avec succès",
                });
            } catch (err) {
                console.error("Error deleting contact:", err);
            }
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        if (!selectedSupplier) return;
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
            try {
                console.log(`Deleting product ${productId} for fournisseurId ${selectedSupplier.id}`);
                await removeProduct(productId, selectedSupplier.id);
                logActivity({
                    type: "delete",
                    module: "Produits",
                    description: `Produit supprimé: ${productId}`,
                    metadata: { fournisseurId: selectedSupplier.id, productId },
                });
                showToast({
                    type: "success",
                    title: "Produit supprimé",
                    message: "Le produit a été supprimé avec succès",
                });
            } catch (err) {
                console.error("Error deleting product:", err);
            }
        }
    };

    const handleShowPriceHistory = (product: Product) => {
        setSelectedProduct(product);
        setShowPriceHistoryModal(true);
    };

    const handleRateSupplier = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setNewRating(rating?.rating || supplier.rating || 0);
        setRatingComment(rating?.comment || "");
        setShowRatingModal(true);
    };

    const handleSaveRating = async () => {
        if (!selectedSupplier || newRating === 0) {
            showToast({
                type: "error",
                title: "Erreur",
                message: "Veuillez sélectionner une note",
            });
            return;
        }

        try {
            console.log("Saving rating with data:", { fournisseurId: selectedSupplier.id, rating: newRating, comment: ratingComment });
            await addOrUpdateRating({
                fournisseurId: selectedSupplier.id,
                rating: newRating,
                comment: ratingComment,
            });
            logActivity({
                type: "update",
                module: "Fournisseurs",
                description: `Note attribuée au fournisseur ${selectedSupplier.name}: ${newRating}/5`,
                metadata: {
                    fournisseurId: selectedSupplier.id,
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
        } catch (err) {
            console.error("Error saving rating:", err);
        }
    };

    const getCategoryColor = (category: string) => {
        return category === "principal"
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
            <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => interactive && onRate && onRate(star)}
                        disabled={!interactive}
                        className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
                    >
                        <Star
                            className={`w-4 h-4 ${star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                        />
                    </button>
                ))}
                <span className="text-sm text-nexsaas-vanta-black dark:text-gray-300 ml-2">
                    ({rating.toFixed(1)})
                </span>
            </div>
        );
    };

    const filteredSuppliers = suppliers.filter((supplier) => {
        const matchesSearch =
            supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
            categoryFilter === "all" || supplier.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

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
                            <p className="text-nexsaas-vanta-black dark:text-gray-300">
                                Gestion complète de vos partenaires fournisseurs
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
                >
                    <Card className="text-center">
                        <div className="p-3 bg-indigo-500/10 rounded-lg inline-block mb-3">
                            <Building2 className="w-6 h-6 text-indigo-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                            {suppliers.length}
                        </h3>
                        <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                            Fournisseurs actifs
                        </p>
                    </Card>
                    <Card className="text-center">
                        <div className="p-3 bg-green-500/10 rounded-lg inline-block mb-3">
                            <Star className="w-6 h-6 text-green-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                            {(suppliers.reduce((acc, s) => acc + s.rating, 0) / (suppliers.length || 1)).toFixed(1)}
                        </h3>
                        <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                            Note moyenne
                        </p>
                    </Card>
                    <Card className="text-center">
                        <div className="p-3 bg-blue-500/10 rounded-lg inline-block mb-3">
                            <Package className="w-6 h-6 text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                            {suppliers.reduce((acc, s) => acc + s.products.length, 0)}
                        </h3>
                        <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                            Produits catalogués
                        </p>
                    </Card>
                    <Card className="text-center">
                        <div className="p-3 bg-purple-500/10 rounded-lg inline-block mb-3">
                            <DollarSign className="w-6 h-6 text-purple-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                            €{suppliers.reduce((acc, s) => acc + s.totalAmount, 0).toLocaleString()}
                        </h3>
                        <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                            Volume d'achats
                        </p>
                    </Card>
                </motion.div>

                {/* Actions Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mb-6"
                >
                    <Card>
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="flex flex-col sm:flex-row gap-4 flex-1">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Rechercher un fournisseur..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                                    />
                                </div>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="px-4 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                                >
                                    <option value="all">Toutes catégories</option>
                                    <option value="principal">Principal</option>
                                    <option value="secondaire">Secondaire</option>
                                </select>
                            </div>
                            <Button onClick={handleAddSupplier} disabled={supplierLoading}>
                                <Plus className="w-4 h-4 mr-2" />
                                Nouveau fournisseur
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
                    {supplierLoading ? (
                        <p className="text-center text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                            Chargement des fournisseurs...
                        </p>
                    ) : filteredSuppliers.length === 0 ? (
                        <p className="text-center text-nexsaas-vanta-black dark:text-gray-300">
                            Aucun fournisseur trouvé.
                        </p>
                    ) : (
                        filteredSuppliers.map((supplier, index) => (
                            <motion.div
                                key={supplier.id}
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                            >
                                <Card className="hover:shadow-md transition-shadow">
                                    <div className="flex flex-col lg:flex-row lg:items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center space-x-3">
                                                    <h3 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                                        {supplier.name}
                                                    </h3>
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
                                                            supplier.category,
                                                        )}`}
                                                    >
                                                        {supplier.category}
                                                    </span>
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                            supplier.status,
                                                        )}`}
                                                    >
                                                        {supplier.status}
                                                    </span>
                                                </div>
                                                {renderStars(supplier.rating)}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                                <div className="flex items-center">
                                                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                                    <span className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                                        {supplier.email}
                                                    </span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                                    <span className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                                        {supplier.phone}
                                                    </span>
                                                </div>
                                                <div className="flex items-center">
                                                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                                                    <span className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                                        {supplier.address}
                                                    </span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Clock className="w-4 h-4 text-gray-400 mr-2" />
                                                    <span className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                                        Délai: {supplier.deliveryTime}
                                                    </span>
                                                </div>
                                                <div className="flex items-center">
                                                    <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                                                    <span className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                                        Min: €{supplier.minimumOrder}
                                                    </span>
                                                </div>
                                                <div className="flex items-center">
                                                    <TrendingUp className="w-4 h-4 text-gray-400 mr-2" />
                                                    <span className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                                        Remise: {supplier.discount}%
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Contacts */}
                                            {supplier.contacts.length > 0 && (
                                                <div className="mb-4">
                                                    <h4 className="font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                                        Contacts ({supplier.contacts.length})
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {supplier.contacts.slice(0, 4).map((contact) => (
                                                            <div
                                                                key={contact.id}
                                                                className="bg-nexsaas-light-gray dark:bg-gray-700 rounded-lg p-3"
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <h5 className="font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white text-sm">
                                                                            {contact.nom}
                                                                        </h5>
                                                                        <p className="text-xs text-nexsaas-vanta-black dark:text-gray-300">
                                                                            {contact.fonction} • {contact.email}
                                                                            {contact.isPrimary && (
                                                                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                                    Principal
                                                                                </span>
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                    <div className="flex space-x-1">
                                                                        <button
                                                                            onClick={() => handleEditContact(supplier, contact)}
                                                                            className="text-xs text-gray-500 hover:text-gray-600"
                                                                            disabled={contactsLoading}
                                                                        >
                                                                            <Edit className="w-3 h-3" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteContact(contact.id)}
                                                                            className="text-xs text-red-500 hover:text-red-600"
                                                                            disabled={contactsLoading}
                                                                        >
                                                                            <Trash2 className="w-3 h-3" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {supplier.contacts.length > 4 && (
                                                        <p className="text-xs text-nexsaas-vanta-black dark:text-gray-300 mt-2">
                                                            +{supplier.contacts.length - 4} autres contacts
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                            {/* Products */}
                                            {supplier.products.length > 0 ? (
                                                <div className="mb-4">
                                                    <h4 className="font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                                        Produits ({supplier.products.length})
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {supplier.products.slice(0, 4).map((product) => (
                                                            <div
                                                                key={product.id}
                                                                className="bg-nexsaas-light-gray dark:bg-gray-700 rounded-lg p-3"
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <h5 className="font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white text-sm">
                                                                            {product.nomProduit}
                                                                        </h5>
                                                                        <p className="text-xs text-nexsaas-vanta-black dark:text-gray-300">
                                                                            {product.conditionnement} • Délai: {product.delaiApprovisionnement}
                                                                        </p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="font-bold text-nexsaas-saas-green">
                                                                            €{product.prixNegocie}
                                                                        </p>
                                                                        <div className="flex space-x-1">
                                                                            <button
                                                                                onClick={() => handleShowPriceHistory(product)}
                                                                                className="text-xs text-blue-500 hover:text-blue-600"
                                                                                disabled={priceHistoryLoading}
                                                                            >
                                                                                <History className="w-3 h-3" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleEditProduct(supplier, product)}
                                                                                className="text-xs text-gray-500 hover:text-gray-600"
                                                                                disabled={productsLoading}
                                                                            >
                                                                                <Edit className="w-3 h-3" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDeleteProduct(product.id)}
                                                                                className="text-xs text-red-500 hover:text-red-600"
                                                                                disabled={productsLoading}
                                                                            >
                                                                                <Trash2 className="w-3 h-3" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {supplier.products.length > 4 && (
                                                        <p className="text-xs text-nexsaas-vanta-black dark:text-gray-300 mt-2">
                                                            +{supplier.products.length - 4} autres produits
                                                        </p>
                                                    )}
                                                </div>
                                            ) : selectedSupplier?.id === supplier.id && productLoadError ? (
                                                <p className="text-sm text-red-500 dark:text-red-400">
                                                    Erreur lors du chargement des produits: {productLoadError}
                                                </p>
                                            ) : null}
                                            {/* Stats */}
                                            <div className="grid grid-cols-3 gap-4 text-center">
                                                <div>
                                                    <p className="text-lg font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                                        {supplier.totalOrders}
                                                    </p>
                                                    <p className="text-xs text-nexsaas-vanta-black dark:text-gray-300">
                                                        Commandes
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-lg font-bold text-nexsaas-saas-green">
                                                        €{supplier.totalAmount.toLocaleString()}
                                                    </p>
                                                    <p className="text-xs text-nexsaas-vanta-black dark:text-gray-300">
                                                        Volume total
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-lg font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                                        {supplier.lastOrder || "Aucune"}
                                                    </p>
                                                    <p className="text-xs text-nexsaas-vanta-black dark:text-gray-300">
                                                        Dernière commande
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col space-y-2 mt-4 lg:mt-0 lg:ml-6">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleRateSupplier(supplier)}
                                                disabled={ratingsLoading}
                                            >
                                                <Award className="w-4 h-4 mr-1" />
                                                Noter
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleAddContact(supplier)}
                                            >
                                                <User className="w-4 h-4 mr-1" />
                                                Contact
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleAddProduct(supplier)}
                                            >
                                                <Plus className="w-4 h-4 mr-1" />
                                                Produit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEditSupplier(supplier)}
                                            >
                                                <Edit className="w-4 h-4 mr-1" />
                                                Modifier
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteSupplier(supplier.id)}
                                                className="text-red-500 hover:text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4 mr-1" />
                                                Supprimer
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))
                    )}
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
                                    {editingSupplier ? "Modifier le fournisseur" : "Nouveau fournisseur"}
                                </h2>
                                <Button variant="ghost" size="sm" onClick={() => setShowSupplierModal(false)}>
                                    <X className="w-6 h-6" />
                                </Button>
                            </div>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Nom du fournisseur"
                                        value={supplierForm.name}
                                        onChange={(value) => setSupplierForm((prev) => ({ ...prev, name: value }))}
                                        required
                                    />
                                    <Input
                                        label="Email"
                                        type="email"
                                        value={supplierForm.email}
                                        onChange={(value) => setSupplierForm((prev) => ({ ...prev, email: value }))}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Téléphone"
                                        value={supplierForm.phone}
                                        onChange={(value) => setSupplierForm((prev) => ({ ...prev, phone: value }))}
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                            Catégorie
                                        </label>
                                        <select
                                            value={supplierForm.category}
                                            onChange={(e) =>
                                                setSupplierForm((prev) => ({
                                                    ...prev,
                                                    category: e.target.value as "principal" | "secondaire",
                                                }))
                                            }
                                            className="w-full px-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                                        >
                                            <option value="principal">Principal</option>
                                            <option value="secondaire">Secondaire</option>
                                        </select>
                                    </div>
                                </div>
                                <Input
                                    label="Adresse"
                                    value={supplierForm.address}
                                    onChange={(value) => setSupplierForm((prev) => ({ ...prev, address: value }))}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Conditions de paiement"
                                        value={supplierForm.paymentTerms}
                                        onChange={(value) => setSupplierForm((prev) => ({ ...prev, paymentTerms: value }))}
                                        placeholder="ex: 30 jours"
                                    />
                                    <Input
                                        label="Délai de livraison"
                                        value={supplierForm.deliveryTime}
                                        onChange={(value) => setSupplierForm((prev) => ({ ...prev, deliveryTime: value }))}
                                        placeholder="ex: 5-7 jours"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Commande minimum (€)"
                                        type="number"
                                        value={supplierForm.minimumOrder}
                                        onChange={(value) => setSupplierForm((prev) => ({ ...prev, minimumOrder: value }))}
                                    />
                                    <Input
                                        label="Remise (%)"
                                        type="number"
                                        value={supplierForm.discount}
                                        onChange={(value) => setSupplierForm((prev) => ({ ...prev, discount: value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                        Notes
                                    </label>
                                    <textarea
                                        value={supplierForm.notes}
                                        onChange={(e) => setSupplierForm((prev) => ({ ...prev, notes: e.target.value }))}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                                        placeholder="Notes sur le fournisseur..."
                                    />
                                </div>
                                <div className="flex justify-end space-x-4">
                                    <Button variant="outline" onClick={() => setShowSupplierModal(false)}>
                                        Annuler
                                    </Button>
                                    <Button onClick={handleSaveSupplier} disabled={supplierLoading}>
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
                                    {editingProduct ? "Modifier le produit" : "Nouveau produit"}
                                </h2>
                                <Button variant="ghost" size="sm" onClick={() => setShowProductModal(false)}>
                                    <X className="w-6 h-6" />
                                </Button>
                            </div>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Nom du produit"
                                        value={productForm.nomProduit}
                                        onChange={(value) => setProductForm((prev) => ({ ...prev, nomProduit: value }))}
                                        required
                                    />
                                    <Input
                                        label="Prix négocié (€)"
                                        type="number"
                                        step="0.01"
                                        value={productForm.prixNegocie}
                                        onChange={(value) => setProductForm((prev) => ({ ...prev, prixNegocie: value }))}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Conditionnement"
                                        value={productForm.conditionnement}
                                        onChange={(value) => setProductForm((prev) => ({ ...prev, conditionnement: value }))}
                                        placeholder="ex: Carton de 12"
                                        required
                                    />
                                    <Input
                                        label="Délai d'approvisionnement"
                                        value={productForm.delaiApprovisionnement}
                                        onChange={(value) => setProductForm((prev) => ({ ...prev, delaiApprovisionnement: value }))}
                                        placeholder="ex: 3 jours"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end space-x-4">
                                    <Button variant="outline" onClick={() => setShowProductModal(false)}>
                                        Annuler
                                    </Button>
                                    <Button onClick={handleSaveProduct} disabled={productsLoading}>
                                        <Save className="w-4 h-4 mr-2" />
                                        {editingProduct ? "Modifier" : "Ajouter"}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Contact Modal */}
                {showContactModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                        onClick={() => setShowContactModal(false)}
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
                                    {editingContact ? "Modifier le contact" : "Nouveau contact"}
                                </h2>
                                <Button variant="ghost" size="sm" onClick={() => setShowContactModal(false)}>
                                    <X className="w-6 h-6" />
                                </Button>
                            </div>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Nom du contact"
                                        value={contactForm.nom}
                                        onChange={(value) => setContactForm((prev) => ({ ...prev, nom: value }))}
                                        required
                                    />
                                    <Input
                                        label="Fonction"
                                        value={contactForm.fonction}
                                        onChange={(value) => setContactForm((prev) => ({ ...prev, fonction: value }))}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Email"
                                        type="email"
                                        value={contactForm.email}
                                        onChange={(value) => setContactForm((prev) => ({ ...prev, email: value }))}
                                        required
                                    />
                                    <Input
                                        label="Téléphone"
                                        value={contactForm.telephone}
                                        onChange={(value) => setContactForm((prev) => ({ ...prev, telephone: value }))}
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={contactForm.isPrimary}
                                        onChange={(e) => setContactForm((prev) => ({ ...prev, isPrimary: e.target.checked }))}
                                        className="h-4 w-4 text-nexsaas-saas-green focus:ring-nexsaas-saas-green border-nexsaas-light-gray dark:border-gray-600 rounded"
                                    />
                                    <label className="text-sm text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                        Contact principal
                                    </label>
                                </div>
                                <div className="flex justify-end space-x-4">
                                    <Button variant="outline" onClick={() => setShowContactModal(false)}>
                                        Annuler
                                    </Button>
                                    <Button onClick={handleSaveContact} disabled={contactsLoading}>
                                        <Save className="w-4 h-4 mr-2" />
                                        {editingContact ? "Modifier" : "Ajouter"}
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
                                    Historique des prix - {selectedProduct.nomProduit}
                                </h2>
                                <Button variant="ghost" size="sm" onClick={() => setShowPriceHistoryModal(false)}>
                                    <X className="w-6 h-6" />
                                </Button>
                            </div>
                            <div className="space-y-4">
                                {priceHistoryLoading ? (
                                    <p className="text-center text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                        Chargement de l'historique...
                                    </p>
                                ) : priceHistory.length === 0 ? (
                                    <p className="text-center text-nexsaas-vanta-black dark:text-gray-300">
                                        Aucun historique de prix.
                                    </p>
                                ) : (
                                    priceHistory.map((history, index) => (
                                        <div
                                            key={history.id}
                                            className="border border-nexsaas-light-gray dark:border-gray-600 rounded-lg p-4"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-lg font-bold text-nexsaas-saas-green">
                                                        €{history.price}
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
                                                    <strong>Négocié par:</strong> {history.negotiatedBy}
                                                </p>
                                                <p>
                                                    <strong>Notes:</strong> {history.notes}
                                                </p>
                                            </div>
                                        </div>
                                    ))
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
                                <Button variant="ghost" size="sm" onClick={() => setShowRatingModal(false)}>
                                    <X className="w-6 h-6" />
                                </Button>
                            </div>
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                        {selectedSupplier.name}
                                    </h3>
                                    <p className="text-nexsaas-vanta-black dark:text-gray-300 mb-4">
                                        Évaluez la performance de ce fournisseur
                                    </p>
                                    <div className="flex justify-center mb-4">
                                        {renderStars(newRating, true, setNewRating)}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                        Commentaire (optionnel)
                                    </label>
                                    <textarea
                                        value={ratingComment}
                                        onChange={(e) => setRatingComment(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                                        placeholder="Votre évaluation..."
                                    />
                                </div>
                                <div className="flex justify-end space-x-4">
                                    <Button variant="outline" onClick={() => setShowRatingModal(false)}>
                                        Annuler
                                    </Button>
                                    <Button onClick={handleSaveRating} disabled={ratingsLoading || newRating === 0}>
                                        <Award className="w-4 h-4 mr-2" />
                                        Enregistrer la note
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default SuppliersPage;