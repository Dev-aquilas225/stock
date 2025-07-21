import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
    Building2,
    Plus,
    Search,
    Edit,
    Trash2,
    ArrowLeft,
    Phone,
    Mail,
    MapPin,
    Star,
    Package,
    Clock,
    DollarSign,
    X,
    Save,
    History,
    Award,
    MessageCircle,
} from "lucide-react";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import Input from "../../components/UI/Input";
import { useToast } from "../../contexts/ToastContext";
import { useActivity } from "../../contexts/ActivityContext";
import { useFournisseurs, Fournisseur } from "../../hooks/useFournisseur";
import { useProducts, Product, ProductDto } from "../../hooks/useProducts";
import { useContacts, Contact, ContactDto } from "../../hooks/useContacts";
import { usePriceHistory, PriceHistory } from "../../hooks/usePriceHistory";
import { useRatings, Rating, RatingDto } from "../../hooks/useRatings";
import { useInteractions, Interaction, InteractionDto } from "../../hooks/useInteractions";

// Supplier interface aligned with Fournisseur and additional fields
interface Supplier extends Omit<Fournisseur, "nom" | "adresse" | "telephone" | "delaiLivraison" | "remise" | "minimumCommande"> {
    name: string;
    address: string;
    phone: string;
    deliveryTime: string;
    discount: number;
    minimumOrder: number;
    products: Product[];
    contacts: Contact[];
    interactions: Interaction[];
}

const SuppliersPage: React.FC = () => {
    const { fournisseurs, add, update, remove, loading, error: supplierError } = useFournisseurs();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<"all" | "1" | "2">("all");
    const [showSupplierModal, setShowSupplierModal] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);
    const [showInteractionModal, setShowInteractionModal] = useState(false);
    const [showPriceHistoryModal, setShowPriceHistoryModal] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editingInteraction, setEditingInteraction] = useState<Interaction | null>(null);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [newRating, setNewRating] = useState<RatingDto>({
        qualiteProduit: 0,
        respectDelais: 0,
        fiabilite: 0,
        commentaire: "",
    });
    const [productLoadError, setProductLoadError] = useState<string | null>(null);

    const { showToast } = useToast();
    const { logActivity } = useActivity();

    const { products, add: addProduct, update: updateProduct, remove: removeProduct, loading: productsLoading, error: productsError } = useProducts(selectedSupplier?.id || "");
    const { contacts, add: addContact, update: updateContact, remove: removeContact, loading: contactsLoading, error: contactsError } = useContacts(selectedSupplier?.id || "");
    const { priceHistory, loading: priceHistoryLoading, error: priceHistoryError } = usePriceHistory(selectedSupplier?.id || "", selectedProduct?.id || "");
    const { ratings, addOrUpdate: addOrUpdateRating, error: ratingsError } = useRatings(selectedSupplier?.id || "");
    const { interactions, add: addInteraction, update: updateInteraction, remove: removeInteraction, loading: interactionsLoading, error: interactionsError } = useInteractions(selectedSupplier?.id || "");

    const [supplierForm, setSupplierForm] = useState<Omit<Fournisseur, "id" | "minimumCommande" | "createdAt">>({
        nom: "",
        email: "",
        telephone: "",
        adresse: "",
        categorie: "1",
        delaiLivraison: "",
        remise: "",
    });

    const [productForm, setProductForm] = useState<ProductDto>({
        nomProduit: "",
        prixNegocie: 0,
        conditionnement: "",
        delaiApprovisionnement: "",
    });

    const [interactionForm, setInteractionForm] = useState<InteractionDto>({
        type: "",
        note: "",
    });

    const [contactForm, setContactForm] = useState<ContactDto>({
        nom: "",
        fonction: "",
        email: "",
        telephone: "",
        isPrimary: false,
    });

    useEffect(() => {
        if (fournisseurs.length > 0) {
            const mappedSuppliers: Supplier[] = fournisseurs.map((fournisseur) => ({
                id: fournisseur.id,
                name: fournisseur.nom,
                email: fournisseur.email,
                phone: fournisseur.telephone,
                address: fournisseur.adresse,
                category: fournisseur.categorie,
                deliveryTime: fournisseur.delaiLivraison,
                minimumOrder: fournisseur.minimumCommande,
                discount: parseFloat(fournisseur.remise) || 0,
                createdAt: fournisseur.createdAt,
                products: selectedSupplier?.id === fournisseur.id ? products : [],
                contacts: selectedSupplier?.id === fournisseur.id ? contacts : [],
                interactions: selectedSupplier?.id === fournisseur.id ? interactions : [],
            }));
            setSuppliers(mappedSuppliers);
        }
    }, [fournisseurs, products, contacts, interactions, selectedSupplier]);

    useEffect(() => {
        const error = supplierError || productsError || contactsError || priceHistoryError || ratingsError || interactionsError;
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
    }, [supplierError, productsError, contactsError, priceHistoryError, ratingsError, interactionsError, showToast]);

    const resetForms = () => {
        setSupplierForm({
            nom: "",
            email: "",
            telephone: "",
            adresse: "",
            categorie: "1",
            delaiLivraison: "",
            remise: "",
        });
        setProductForm({
            nomProduit: "",
            prixNegocie: 0,
            conditionnement: "",
            delaiApprovisionnement: "",
        });
        setInteractionForm({
            type: "",
            note: "",
        });
        setContactForm({
            nom: "",
            fonction: "",
            email: "",
            telephone: "",
            isPrimary: false,
        });
        setNewRating({
            qualiteProduit: 0,
            respectDelais: 0,
            fiabilite: 0,
            commentaire: "",
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
            nom: supplier.name,
            email: supplier.email,
            telephone: supplier.phone,
            adresse: supplier.address,
            categorie: supplier.category,
            delaiLivraison: supplier.deliveryTime,
            remise: supplier.discount.toString(),
        });
        setShowSupplierModal(true);
    };

    const handleDeleteSupplier = async (supplierId: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce fournisseur ?")) {
            try {
                await remove(supplierId);
                setSuppliers((prev) => prev.filter((s) => s.id !== supplierId));
                logActivity({
                    type: "delete",
                    module: "Fournisseurs",
                    description: `Fournisseur supprimé: ${supplierId}`,
                    userId: localStorage.getItem("nexsaas_user") ? JSON.parse(localStorage.getItem("nexsaas_user")!).id ?? "unknown" : "unknown",
                    metadata: { fournisseurId: supplierId },
                });
                showToast({
                    type: "success",
                    title: "Fournisseur supprimé",
                    message: "Le fournisseur a été supprimé avec succès",
                    duration: 3000,
                });
            } catch (err: any) {
                const errorMessage = err.message.includes("Unauthorized")
                    ? "Non autorisé : Veuillez vous reconnecter"
                    : err.response?.data?.message || "Erreur lors de la suppression du fournisseur";
                showToast({
                    type: "error",
                    title: "Erreur",
                    message: errorMessage,
                    duration: 5000,
                });
            }
        }
    };

    const handleSaveSupplier = async () => {
        if (!supplierForm.nom || !supplierForm.email) {
            showToast({
                type: "error",
                title: "Erreur",
                message: "Veuillez remplir tous les champs obligatoires",
                duration: 5000,
            });
            return;
        }

        try {
            const supplierData: Omit<Fournisseur, "id" | "minimumCommande" | "createdAt"> = {
                nom: supplierForm.nom,
                email: supplierForm.email,
                telephone: supplierForm.telephone,
                adresse: supplierForm.adresse,
                categorie: supplierForm.categorie,
                delaiLivraison: supplierForm.delaiLivraison,
                remise: supplierForm.remise,
            };

            if (editingSupplier) {
                const updatedSupplier = await update(editingSupplier.id, supplierData);
                setSuppliers((prev) =>
                    prev.map((supplier) =>
                        supplier.id === editingSupplier.id
                            ? {
                                ...supplier,
                                name: updatedSupplier.nom,
                                email: updatedSupplier.email,
                                phone: updatedSupplier.telephone,
                                address: updatedSupplier.adresse,
                                category: updatedSupplier.categorie,
                                deliveryTime: updatedSupplier.delaiLivraison,
                                minimumOrder: updatedSupplier.minimumCommande,
                                discount: parseFloat(updatedSupplier.remise) || 0,
                                createdAt: updatedSupplier.createdAt,
                            }
                            : supplier,
                    ),
                );
                logActivity({
                    type: "update",
                    module: "Fournisseurs",
                    description: `Fournisseur modifié: ${supplierForm.nom}`,
                    userId: localStorage.getItem("nexsaas_user") ? JSON.parse(localStorage.getItem("nexsaas_user")!).id ?? "unknown" : "unknown",
                    metadata: { fournisseurId: editingSupplier.id },
                });
                showToast({
                    type: "success",
                    title: "Fournisseur modifié",
                    message: "Les informations du fournisseur ont été mises à jour",
                    duration: 3000,
                });
            } else {
                const newSupplier = await add(supplierData);
                setSuppliers((prev) => [
                    ...prev,
                    {
                        id: newSupplier.id,
                        name: newSupplier.nom,
                        email: newSupplier.email,
                        phone: newSupplier.telephone,
                        address: newSupplier.adresse,
                        category: newSupplier.categorie,
                        deliveryTime: newSupplier.delaiLivraison,
                        minimumOrder: newSupplier.minimumCommande,
                        discount: parseFloat(newSupplier.remise) || 0,
                        createdAt: newSupplier.createdAt,
                        products: [],
                        contacts: [],
                        interactions: [],
                    },
                ]);
                logActivity({
                    type: "create",
                    module: "Fournisseurs",
                    description: `Fournisseur ajouté: ${supplierForm.nom}`,
                    userId: localStorage.getItem("nexsaas_user") ? JSON.parse(localStorage.getItem("nexsaas_user")!).id ?? "unknown" : "unknown",
                    metadata: { fournisseurId: newSupplier.id },
                });
                showToast({
                    type: "success",
                    title: "Fournisseur ajouté",
                    message: "Le fournisseur a été ajouté avec succès",
                    duration: 3000,
                });
            }
            setShowSupplierModal(false);
            resetForms();
        } catch (err: any) {
            const errorMessage = err.message.includes("Unauthorized")
                ? "Non autorisé : Veuillez vous reconnecter"
                : err.response?.data?.message || "Erreur lors de l'enregistrement du fournisseur";
            showToast({
                type: "error",
                title: "Erreur",
                message: errorMessage,
                duration: 5000,
            });
        }
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
            prixNegocie: product.prixNegocie,
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
                duration: 5000,
            });
            return;
        }

        if (
            !productForm.nomProduit ||
            productForm.prixNegocie === 0 ||
            !productForm.conditionnement ||
            !productForm.delaiApprovisionnement
        ) {
            showToast({
                type: "error",
                title: "Erreur",
                message: "Veuillez remplir tous les champs obligatoires (Nom, Prix, Conditionnement, Délai)",
                duration: 5000,
            });
            return;
        }

        const productData: ProductDto = {
            nomProduit: productForm.nomProduit,
            prixNegocie: productForm.prixNegocie,
            conditionnement: productForm.conditionnement,
            delaiApprovisionnement: productForm.delaiApprovisionnement,
        };

        try {
            if (editingProduct) {
                await updateProduct(editingProduct.id, productData);
                logActivity({
                    type: "update",
                    module: "Produits",
                    description: `Produit modifié: ${productForm.nomProduit}`,
                    userId: localStorage.getItem("nexsaas_user") ? JSON.parse(localStorage.getItem("nexsaas_user")!).id ?? "unknown" : "unknown",
                    metadata: { fournisseurId: selectedSupplier.id, productId: editingProduct.id },
                });
                showToast({
                    type: "success",
                    title: "Produit modifié",
                    message: "Le produit a été mis à jour avec succès",
                    duration: 3000,
                });
            } else {
                await addProduct(productData);
                logActivity({
                    type: "create",
                    module: "Produits",
                    description: `Produit ajouté: ${productForm.nomProduit}`,
                    userId: localStorage.getItem("nexsaas_user") ? JSON.parse(localStorage.getItem("nexsaas_user")!).id ?? "unknown" : "unknown",
                    metadata: { fournisseurId: selectedSupplier.id },
                });
                showToast({
                    type: "success",
                    title: "Produit ajouté",
                    message: "Le nouveau produit a été ajouté au catalogue",
                    duration: 3000,
                });
            }
            setShowProductModal(false);
            resetForms();
        } catch (err: any) {
            const errorMessage = err.message.includes("Unauthorized")
                ? "Non autorisé : Veuillez vous reconnecter"
                : err.response?.data?.message || "Erreur lors de l'enregistrement du produit";
            showToast({
                type: "error",
                title: "Erreur",
                message: errorMessage,
                duration: 5000,
            });
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        if (!selectedSupplier) return;
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
            try {
                await removeProduct(productId);
                logActivity({
                    type: "delete",
                    module: "Produits",
                    description: `Produit supprimé: ${productId}`,
                    userId: localStorage.getItem("nexsaas_user") ? JSON.parse(localStorage.getItem("nexsaas_user")!).id ?? "unknown" : "unknown",
                    metadata: { fournisseurId: selectedSupplier.id, productId },
                });
                showToast({
                    type: "success",
                    title: "Produit supprimé",
                    message: "Le produit a été supprimé avec succès",
                    duration: 3000,
                });
            } catch (err: any) {
                const errorMessage = err.message.includes("Unauthorized")
                    ? "Non autorisé : Veuillez vous reconnecter"
                    : err.response?.data?.message || "Erreur lors de la suppression du produit";
                showToast({
                    type: "error",
                    title: "Erreur",
                    message: errorMessage,
                    duration: 5000,
                });
            }
        }
    };

    const handleAddInteraction = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setEditingInteraction(null);
        resetForms();
        setShowInteractionModal(true);
    };

    const handleEditInteraction = (supplier: Supplier, interaction: Interaction) => {
        setSelectedSupplier(supplier);
        setEditingInteraction(interaction);
        setInteractionForm({
            type: interaction.type,
            note: interaction.note,
        });
        setShowInteractionModal(true);
    };

    const handleSaveInteraction = async () => {
        if (!selectedSupplier || !interactionForm.type || !interactionForm.note) {
            showToast({
                type: "error",
                title: "Erreur",
                message: "Veuillez remplir tous les champs obligatoires (Type, Note)",
                duration: 5000,
            });
            return;
        }

        const interactionData: InteractionDto = {
            type: interactionForm.type,
            note: interactionForm.note,
        };

        try {
            if (editingInteraction) {
                await updateInteraction(editingInteraction.id, interactionData);
                logActivity({
                    type: "update",
                    module: "Interactions",
                    description: `Interaction modifiée: ${interactionForm.type}`,
                    userId: localStorage.getItem("nexsaas_user") ? JSON.parse(localStorage.getItem("nexsaas_user")!).id ?? "unknown" : "unknown",
                    metadata: { fournisseurId: selectedSupplier.id, interactionId: editingInteraction.id },
                });
                showToast({
                    type: "success",
                    title: "Interaction modifiée",
                    message: "L'interaction a été mise à jour avec succès",
                    duration: 3000,
                });
            } else {
                await addInteraction(interactionData);
                logActivity({
                    type: "create",
                    module: "Interactions",
                    description: `Interaction ajoutée: ${interactionForm.type}`,
                    userId: localStorage.getItem("nexsaas_user") ? JSON.parse(localStorage.getItem("nexsaas_user")!).id ?? "unknown" : "unknown",
                    metadata: { fournisseurId: selectedSupplier.id },
                });
                showToast({
                    type: "success",
                    title: "Interaction ajoutée",
                    message: "La nouvelle interaction a été ajoutée avec succès",
                    duration: 3000,
                });
            }
            setShowInteractionModal(false);
            resetForms();
        } catch (err: any) {
            const errorMessage = err.message.includes("Unauthorized")
                ? "Non autorisé : Veuillez vous reconnecter"
                : err.response?.data?.message || "Erreur lors de l'enregistrement de l'interaction";
            showToast({
                type: "error",
                title: "Erreur",
                message: errorMessage,
                duration: 5000,
            });
        }
    };

    const handleDeleteInteraction = async (interactionId: string) => {
        if (!selectedSupplier) return;
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette interaction ?")) {
            try {
                await removeInteraction(interactionId);
                logActivity({
                    type: "delete",
                    module: "Interactions",
                    description: `Interaction supprimée: ${interactionId}`,
                    userId: localStorage.getItem("nexsaas_user") ? JSON.parse(localStorage.getItem("nexsaas_user")!).id ?? "unknown" : "unknown",
                    metadata: { fournisseurId: selectedSupplier.id, interactionId },
                });
                showToast({
                    type: "success",
                    title: "Interaction supprimée",
                    message: "L'interaction a été supprimée avec succès",
                    duration: 3000,
                });
            } catch (err: any) {
                const errorMessage = err.message.includes("Unauthorized")
                    ? "Non autorisé : Veuillez vous reconnecter"
                    : err.response?.data?.message || "Erreur lors de la suppression de l'interaction";
                showToast({
                    type: "error",
                    title: "Erreur",
                    message: errorMessage,
                    duration: 5000,
                });
            }
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
                duration: 5000,
            });
            return;
        }

        const contactData: ContactDto = {
            nom: contactForm.nom,
            fonction: contactForm.fonction,
            email: contactForm.email,
            telephone: contactForm.telephone,
            isPrimary: contactForm.isPrimary,
        };

        try {
            if (editingContact) {
                await updateContact(editingContact.id, contactData);
                logActivity({
                    type: "update",
                    module: "Contacts",
                    description: `Contact modifié: ${contactForm.nom}`,
                    userId: localStorage.getItem("nexsaas_user") ? JSON.parse(localStorage.getItem("nexsaas_user")!).id ?? "unknown" : "unknown",
                    metadata: { fournisseurId: selectedSupplier.id, contactId: editingContact.id },
                });
                showToast({
                    type: "success",
                    title: "Contact modifié",
                    message: "Le contact a été mis à jour avec succès",
                    duration: 3000,
                });
            } else {
                await addContact(contactData);
                logActivity({
                    type: "create",
                    module: "Contacts",
                    description: `Contact ajouté: ${contactForm.nom}`,
                    userId: localStorage.getItem("nexsaas_user") ? JSON.parse(localStorage.getItem("nexsaas_user")!).id ?? "unknown" : "unknown",
                    metadata: { fournisseurId: selectedSupplier.id },
                });
                showToast({
                    type: "success",
                    title: "Contact ajouté",
                    message: "Le nouveau contact a été ajouté avec succès",
                    duration: 3000,
                });
            }
            setShowContactModal(false);
            resetForms();
        } catch (err: any) {
            const errorMessage = err.message.includes("Unauthorized")
                ? "Non autorisé : Veuillez vous reconnecter"
                : err.response?.data?.message || "Erreur lors de l'enregistrement du contact";
            showToast({
                type: "error",
                title: "Erreur",
                message: errorMessage,
                duration: 5000,
            });
        }
    };

    const handleDeleteContact = async (contactId: string) => {
        if (!selectedSupplier) return;
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce contact ?")) {
            try {
                await removeContact(contactId);
                logActivity({
                    type: "delete",
                    module: "Contacts",
                    description: `Contact supprimé: ${contactId}`,
                    userId: localStorage.getItem("nexsaas_user") ? JSON.parse(localStorage.getItem("nexsaas_user")!).id ?? "unknown" : "unknown",
                    metadata: { fournisseurId: selectedSupplier.id, contactId },
                });
                showToast({
                    type: "success",
                    title: "Contact supprimé",
                    message: "Le contact a été supprimé avec succès",
                    duration: 3000,
                });
            } catch (err: any) {
                const errorMessage = err.message.includes("Unauthorized")
                    ? "Non autorisé : Veuillez vous reconnecter"
                    : err.response?.data?.message || "Erreur lors de la suppression du contact";
                showToast({
                    type: "error",
                    title: "Erreur",
                    message: errorMessage,
                    duration: 5000,
                });
            }
        }
    };

    const handleShowPriceHistory = (product: Product) => {
        setSelectedProduct(product);
        setShowPriceHistoryModal(true);
    };

    const handleRateSupplier = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setNewRating({
            qualiteProduit: ratings?.qualiteProduit || 0,
            respectDelais: ratings?.respectDelais || 0,
            fiabilite: ratings?.fiabilite || 0,
            commentaire: ratings?.commentaire || "",
        });
        setShowRatingModal(true);
    };

    const handleSaveRating = async () => {
        if (!selectedSupplier || newRating.qualiteProduit === 0 || newRating.respectDelais === 0 || newRating.fiabilite === 0) {
            showToast({
                type: "error",
                title: "Erreur",
                message: "Veuillez attribuer une note pour chaque critère",
                duration: 5000,
            });
            return;
        }

        try {
            await addOrUpdateRating(newRating);
            logActivity({
                type: "update",
                module: "Évaluations",
                description: `Évaluation attribuée au fournisseur ${selectedSupplier.name}`,
                userId: localStorage.getItem("nexsaas_user") ? JSON.parse(localStorage.getItem("nexsaas_user")!).id ?? "unknown" : "unknown",
                metadata: {
                    fournisseurId: selectedSupplier.id,
                    qualiteProduit: newRating.qualiteProduit,
                    respectDelais: newRating.respectDelais,
                    fiabilite: newRating.fiabilite,
                },
            });
            showToast({
                type: "success",
                title: "Évaluation enregistrée",
                message: "L'évaluation a été enregistrée avec succès",
                duration: 3000,
            });
            setShowRatingModal(false);
            resetForms();
        } catch (err: any) {
            const errorMessage = err.message.includes("Unauthorized")
                ? "Non autorisé : Veuillez vous reconnecter"
                : err.response?.data?.message || "Erreur lors de l'enregistrement de l'évaluation";
            showToast({
                type: "error",
                title: "Erreur",
                message: errorMessage,
                duration: 5000,
            });
        }
    };

    const getCategoryColor = (category: "1" | "2") => {
        return category === "1"
            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
            : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
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

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
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
                            {ratings ? ((ratings.qualiteProduit + ratings.respectDelais + ratings.fiabilite) / 3).toFixed(1) : "0.0"}
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
                </motion.div>

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
                                    onChange={(e) => setCategoryFilter(e.target.value as "all" | "1" | "2")}
                                    className="px-4 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                                >
                                    <option value="all">Toutes catégories</option>
                                    <option value="1">Principal</option>
                                    <option value="2">Secondaire</option>
                                </select>
                            </div>
                            <Button onClick={handleAddSupplier} variant="primary" size="md">
                                <Plus className="w-4 h-4 mr-2" />
                                Ajouter Fournisseur
                            </Button>
                        </div>
                    </Card>
                </motion.div>

                {loading && <p className="text-center text-nexsaas-vanta-black dark:text-gray-300">Chargement des fournisseurs...</p>}
                {!loading && filteredSuppliers.length === 0 && (
                    <p className="text-center text-nexsaas-vanta-black dark:text-gray-300">Aucun fournisseur trouvé</p>
                )}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                    {filteredSuppliers.map((supplier) => (
                        <Card key={supplier.id} className="relative">
                            <div className="absolute top-4 right-4 flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditSupplier(supplier)}
                                >
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteSupplier(supplier.id)}
                                >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center mb-4">
                                    <div className="p-3 bg-indigo-500/10 rounded-lg mr-4">
                                        <Building2 className="w-6 h-6 text-indigo-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                            {supplier.name}
                                        </h2>
                                        <span
                                            className={`text-xs font-medium px-2.5 py-0.5 rounded ${getCategoryColor(supplier.category)}`}
                                        >
                                            {supplier.category === "1" ? "Principal" : "Secondaire"}
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                            <Mail className="w-4 h-4 mr-2" />
                                            {supplier.email}
                                        </div>
                                        <div className="flex items-center text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                            <Phone className="w-4 h-4 mr-2" />
                                            {supplier.phone}
                                        </div>
                                        <div className="flex items-center text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            {supplier.address}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                            <Clock className="w-4 h-4 mr-2" />
                                            Délai: {supplier.deliveryTime}
                                        </div>
                                        <div className="flex items-center text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                            <Package className="w-4 h-4 mr-2" />
                                            Min. Commande: {supplier.minimumOrder}
                                        </div>
                                        <div className="flex items-center text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                            <DollarSign className="w-4 h-4 mr-2" />
                                            Remise: {supplier.discount}%
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                        <Award className="w-4 h-4 mr-2" />
                                        Qualité Produit: {renderStars(ratings?.qualiteProduit || 0)}
                                    </div>
                                    <div className="flex items-center text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                        <Award className="w-4 h-4 mr-2" />
                                        Respect Délais: {renderStars(ratings?.respectDelais || 0)}
                                    </div>
                                    <div className="flex items-center text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                        <Award className="w-4 h-4 mr-2" />
                                        Fiabilité: {renderStars(ratings?.fiabilite || 0)}
                                    </div>
                                    <div className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                        Commentaire: {ratings?.commentaire || "Aucun"}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRateSupplier(supplier)}
                                    >
                                        <Star className="w-4 h-4 mr-2" />
                                        Évaluer
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedSupplier(supplier)}
                                    >
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        Détails
                                    </Button>
                                </div>
                            </div>
                            {selectedSupplier?.id === supplier.id && (
                                <div className="p-6 border-t border-nexsaas-light-gray dark:border-gray-700">
                                    <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-4">
                                        Détails du Fournisseur
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="text-sm font-medium text-nexsaas-vanta-black dark:text-gray-300 mb-2">
                                                Produits
                                            </h4>
                                            {productsLoading && <p>Chargement des produits...</p>}
                                            {productsError && (
                                                <p className="text-red-500">{productsError}</p>
                                            )}
                                            {products.length > 0 ? (
                                                products.map((product) => (
                                                    <div
                                                        key={product.id}
                                                        className="flex justify-between items-center py-2 border-b border-nexsaas-light-gray dark:border-gray-700"
                                                    >
                                                        <div>
                                                            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                                                {product.nomProduit}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                €{product.prixNegocie} |{" "}
                                                                {product.conditionnement}
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleEditProduct(
                                                                        supplier,
                                                                        product,
                                                                    )
                                                                }
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleDeleteProduct(product.id)
                                                                }
                                                            >
                                                                <Trash2 className="w-4 h-4 text-red-500" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleShowPriceHistory(product)
                                                                }
                                                            >
                                                                <History className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Aucun produit
                                                </p>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-2"
                                                onClick={() => handleAddProduct(supplier)}
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Ajouter Produit
                                            </Button>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-nexsaas-vanta-black dark:text-gray-300 mb-2">
                                                Contacts
                                            </h4>
                                            {contactsLoading && <p>Chargement des contacts...</p>}
                                            {contactsError && (
                                                <p className="text-red-500">{contactsError}</p>
                                            )}
                                            {contacts.length > 0 ? (
                                                contacts.map((contact) => (
                                                    <div
                                                        key={contact.id}
                                                        className="flex justify-between items-center py-2 border-b border-nexsaas-light-gray dark:border-gray-700"
                                                    >
                                                        <div>
                                                            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                                                {contact.nom} ({contact.fonction})
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {contact.email} | {contact.telephone}
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleEditContact(supplier, contact)
                                                                }
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleDeleteContact(contact.id)
                                                                }
                                                            >
                                                                <Trash2 className="w-4 h-4 text-red-500" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Aucun contact
                                                </p>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-2"
                                                onClick={() => handleAddContact(supplier)}
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Ajouter Contact
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="mt-6">
                                        <h4 className="text-sm font-medium text-nexsaas-vanta-black dark:text-gray-300 mb-2">
                                            Interactions
                                        </h4>
                                        {interactionsLoading && (
                                            <p>Chargement des interactions...</p>
                                        )}
                                        {interactionsError && (
                                            <p className="text-red-500">{interactionsError}</p>
                                        )}
                                        {interactions.length > 0 ? (
                                            interactions.map((interaction) => (
                                                <div
                                                    key={interaction.id}
                                                    className="flex justify-between items-center py-2 border-b border-nexsaas-light-gray dark:border-gray-700"
                                                >
                                                    <div>
                                                        <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                                            {interaction.type}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {interaction.note} |{" "}
                                                            {new Date(interaction.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEditInteraction(supplier, interaction)}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteInteraction(interaction.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Aucune interaction
                                            </p>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-2"
                                            onClick={() => handleAddInteraction(supplier)}
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Ajouter Interaction
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))}
                </motion.div>

                {showSupplierModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <Card className="w-full max-w-md">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                    {editingSupplier
                                        ? "Modifier Fournisseur"
                                        : "Ajouter Fournisseur"}
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowSupplierModal(false)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="space-y-4">
                                <Input
                                    label="Nom"
                                    value={supplierForm.nom}
                                    onChange={(value) =>
                                        setSupplierForm({
                                            ...supplierForm,
                                            nom: value,
                                        })
                                    }
                                    required
                                />
                                <Input
                                    label="Email"
                                    type="email"
                                    value={supplierForm.email}
                                    onChange={(value) =>
                                        setSupplierForm({
                                            ...supplierForm,
                                            email: value,
                                        })
                                    }
                                    required
                                />
                                <Input
                                    label="Téléphone"
                                    value={supplierForm.telephone}
                                    onChange={(value) =>
                                        setSupplierForm({
                                            ...supplierForm,
                                            telephone: value,
                                        })
                                    }
                                />
                                <Input
                                    label="Adresse"
                                    value={supplierForm.adresse}
                                    onChange={(value) =>
                                        setSupplierForm({
                                            ...supplierForm,
                                            adresse: value,
                                        })
                                    }
                                />
                                <div>
                                    <label className="block text-sm font-medium text-nexsaas-vanta-black dark:text-gray-300 mb-1">
                                        Catégorie
                                    </label>
                                    <select
                                        value={supplierForm.categorie}
                                        onChange={(e) =>
                                            setSupplierForm({
                                                ...supplierForm,
                                                categorie: e.target.value as "1" | "2",
                                            })
                                        }
                                        className="w-full px-4 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                                    >
                                        <option value="1">Principal</option>
                                        <option value="2">Secondaire</option>
                                    </select>
                                </div>
                                <Input
                                    label="Délai de livraison"
                                    value={supplierForm.delaiLivraison}
                                    onChange={(value) =>
                                        setSupplierForm({
                                            ...supplierForm,
                                            delaiLivraison: value,
                                        })
                                    }
                                />
                                <Input
                                    label="Remise (%)"
                                    type="number"
                                    value={supplierForm.remise}
                                    onChange={(value) =>
                                        setSupplierForm({
                                            ...supplierForm,
                                            remise: value,
                                        })
                                    }
                                />
                            </div>
                            <div className="mt-6 flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowSupplierModal(false)}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleSaveSupplier}
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Enregistrer
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}

                {showProductModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <Card className="w-full max-w-md">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                    {editingProduct
                                        ? "Modifier Produit"
                                        : "Ajouter Produit"}
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowProductModal(false)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="space-y-4">
                                <Input
                                    label="Nom du produit"
                                    value={productForm.nomProduit}
                                    onChange={(value) =>
                                        setProductForm({
                                            ...productForm,
                                            nomProduit: value,
                                        })
                                    }
                                    required
                                />
                                <Input
                                    label="Prix négocié (€)"
                                    type="number"
                                    value={productForm.prixNegocie.toString()}
                                    onChange={(value) =>
                                        setProductForm({
                                            ...productForm,
                                            prixNegocie: parseFloat(value) || 0,
                                        })
                                    }
                                    required
                                />
                                <Input
                                    label="Conditionnement"
                                    value={productForm.conditionnement}
                                    onChange={(value) =>
                                        setProductForm({
                                            ...productForm,
                                            conditionnement: value,
                                        })
                                    }
                                    required
                                />
                                <Input
                                    label="Délai d'approvisionnement"
                                    value={productForm.delaiApprovisionnement}
                                    onChange={(value) =>
                                        setProductForm({
                                            ...productForm,
                                            delaiApprovisionnement: value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div className="mt-6 flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowProductModal(false)}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleSaveProduct}
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Enregistrer
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}

                {showInteractionModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <Card className="w-full max-w-md">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                    {editingInteraction
                                        ? "Modifier Interaction"
                                        : "Ajouter Interaction"}
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowInteractionModal(false)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="space-y-4">
                                <Input
                                    label="Type"
                                    value={interactionForm.type}
                                    onChange={(value) =>
                                        setInteractionForm({
                                            ...interactionForm,
                                            type: value,
                                        })
                                    }
                                    required
                                />
                                <Input
                                    label="Note"
                                    value={interactionForm.note}
                                    onChange={(value) =>
                                        setInteractionForm({
                                            ...interactionForm,
                                            note: value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div className="mt-6 flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowInteractionModal(false)}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleSaveInteraction}
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Enregistrer
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}

                {showContactModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <Card className="w-full max-w-md">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                    {editingContact ? "Modifier Contact" : "Ajouter Contact"}
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowContactModal(false)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="space-y-4">
                                <Input
                                    label="Nom"
                                    value={contactForm.nom}
                                    onChange={(value) =>
                                        setContactForm({
                                            ...contactForm,
                                            nom: value,
                                        })
                                    }
                                    required
                                />
                                <Input
                                    label="Fonction"
                                    value={contactForm.fonction}
                                    onChange={(value) =>
                                        setContactForm({
                                            ...contactForm,
                                            fonction: value,
                                        })
                                    }
                                />
                                <Input
                                    label="Email"
                                    type="email"
                                    value={contactForm.email}
                                    onChange={(value) =>
                                        setContactForm({
                                            ...contactForm,
                                            email: value,
                                        })
                                    }
                                    required
                                />
                                <Input
                                    label="Téléphone"
                                    value={contactForm.telephone}
                                    onChange={(value) =>
                                        setContactForm({
                                            ...contactForm,
                                            telephone: value,
                                        })
                                    }
                                />
                                <div>
                                    <label className="block text-sm font-medium text-nexsaas-vanta-black dark:text-gray-300 mb-1">
                                        Contact Principal
                                    </label>
                                    <input
                                        type="checkbox"
                                        checked={contactForm.isPrimary}
                                        onChange={(e) =>
                                            setContactForm({
                                                ...contactForm,
                                                isPrimary: e.target.checked,
                                            })
                                        }
                                        className="h-4 w-4 text-nexsaas-saas-green focus:ring-nexsaas-saas-green border-gray-300 rounded"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowContactModal(false)}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleSaveContact}
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Enregistrer
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}

                {showPriceHistoryModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <Card className="w-full max-w-md">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                    Historique des Prix
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowPriceHistoryModal(false)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            {priceHistoryLoading && <p>Chargement...</p>}
                            {priceHistoryError && (
                                <p className="text-red-500">{priceHistoryError}</p>
                            )}
                            {priceHistory.length > 0 ? (
                                priceHistory.map((history) => (
                                    <div
                                        key={history.id}
                                        className="py-2 border-b border-nexsaas-light-gray dark:border-gray-700"
                                    >
                                        <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                            Prix: €{history.price} | Date:{" "}
                                            {new Date(history.date).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Négocié par: {history.negotiatedBy} | Notes:{" "}
                                            {history.notes}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Aucun historique de prix
                                </p>
                            )}
                            <div className="mt-6 flex justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowPriceHistoryModal(false)}
                                >
                                    Fermer
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}

                {showRatingModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <Card className="w-full max-w-md">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                    Évaluer Fournisseur
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowRatingModal(false)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-nexsaas-vanta-black dark:text-gray-300 mb-1">
                                        Qualité Produit
                                    </label>
                                    {renderStars(newRating.qualiteProduit, true, (rating) =>
                                        setNewRating({
                                            ...newRating,
                                            qualiteProduit: rating,
                                        }),
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-nexsaas-vanta-black dark:text-gray-300 mb-1">
                                        Respect des Délais
                                    </label>
                                    {renderStars(newRating.respectDelais, true, (rating) =>
                                        setNewRating({
                                            ...newRating,
                                            respectDelais: rating,
                                        }),
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-nexsaas-vanta-black dark:text-gray-300 mb-1">
                                        Fiabilité
                                    </label>
                                    {renderStars(newRating.fiabilite, true, (rating) =>
                                        setNewRating({ ...newRating, fiabilite: rating }),
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-nexsaas-vanta-black dark:text-gray-300 mb-1">
                                        Commentaire
                                    </label>
                                    <textarea
                                        value={newRating.commentaire}
                                        onChange={(e) =>
                                            setNewRating({
                                                ...newRating,
                                                commentaire: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowRatingModal(false)}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleSaveRating}
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Enregistrer
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuppliersPage;