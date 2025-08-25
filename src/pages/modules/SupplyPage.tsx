import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
    Package,
    Plus,
    Search,
    Eye,
    Edit,
    CheckCircle,
    Clock,
    AlertCircle,
    ArrowLeft,
    Calendar,
    Building,
    RotateCcw,
    X,
    Mail,
    Phone,
    DollarSign,
    Package as PackageIcon,
    FileText,
    ArrowUp,
    ArrowDown,
    Minus,
    Loader2,
} from "lucide-react";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import Input from "../../components/UI/Input";
import { useToast } from "../../contexts/ToastContext";
import { useActivity } from "../../contexts/ActivityContext";
import {
    getCommandes,
    Commande,
    ProduitCommande,
    StatutCommande,
    createCommande,
    CreateCommandePayload,
    updateCommandeStatut,
} from "../../api/commandeApi";
import {
    getFournisseurs,
    getFournisseurById,
    Fournisseur as FournisseurType,
    Produit as ProduitType,
} from "../../api/fournisseurApi";
import { Devise } from "../../types";

interface Order {
    commandeId: number;
    id: string;
    supplier: {
        id: number;
        nom: string;
        adresse: string;
        telephone: string;
        email: string;
        categorie: string;
        delaiLivraison: string;
        isDeleted: boolean;
    };
    items: {
        id: number;
        produit: {
            id: number;
            nom: string;
            prix: string;
            conditionnement: string;
            delaiApprovisionnement: string;
            devise: Devise;
            sku: string;
            image: string | null;
        };
        prixBase: string;
        prixNegocie: string;
        quantite: number;
        montantTotal: string;
        devise: Devise;
        montantTotalConverti: string;
        deviseConvertion: Devise;
        sku: string;
        lot: string;
        conditionnement: string;
        reception: {
            id: number;
            quantiteRecue: number | null;
            quantiteEndommage: number | null;
            dateReception: string | null;
            commentaireReception: string | null;
        } | null;
        quantiteRetournee: number;
        dateRetour: string | null;
        motifRetour: string | null;
        statutRetour: string | null;
    }[];
    montantTotalConverti: string;
    deviseConvertion: Devise;
    status: StatutCommande;
    orderDate: string;
    deliveryDate: string;
    receivedDate?: string;
    notes?: string;
}

interface ReturnRequest {
    id: string;
    orderId: string;
    items: { itemId: string; quantity: number; reason: string }[];
    status: "pending" | "approved" | "rejected" | "processed";
    requestDate: string;
    reason: string;
}

interface ProduitSelection {
    produitId: number;
    nom: string;
    prixNegocie: string;
    quantite: string;
    conditionnement: string;
    devise: Devise;
}

const mapStatutCommandeToOrderStatus = (
    statut: StatutCommande,
): StatutCommande => {
    return statut;
};

const mapCommandeToOrder = (commande: Commande): Order => {
    const items = commande.produits.map((produit: ProduitCommande) => ({
        id: produit.id,
        produit: {
            id: produit.produit.id,
            nom: produit.produit.nom,
            prix: produit.produit.prix,
            conditionnement: produit.produit.conditionnement,
            delaiApprovisionnement: produit.produit.delaiApprovisionnement,
            devise: produit.produit.devise,
            sku: produit.produit.sku,
            image: produit.produit.image,
        },
        prixBase: produit.prixBase,
        prixNegocie: produit.prixNegocie,
        quantite: produit.quantite,
        montantTotal: produit.montantTotal,
        devise: produit.devise,
        montantTotalConverti: produit.montantTotalConverti,
        deviseConvertion: produit.deviseConvertion,
        sku: produit.sku,
        lot: produit.lot,
        conditionnement: produit.conditionnement,
        reception: produit.reception,
        quantiteRetournee: produit.quantiteRetournee,
        dateRetour: produit.dateRetour,
        motifRetour: produit.motifRetour,
        statutRetour: produit.statutRetour,
    }));

    return {
        commandeId: commande.id,
        id: commande.reference,
        supplier: {
            id: commande.fournisseur.id,
            nom: commande.fournisseur.nom,
            adresse: commande.fournisseur.adresse,
            telephone: commande.fournisseur.telephone,
            email: commande.fournisseur.email,
            categorie: commande.fournisseur.categorie,
            delaiLivraison: commande.fournisseur.delaiLivraison,
            isDeleted: commande.fournisseur.isDeleted,
        },
        items,
        montantTotalConverti: commande.montantTotalConverti,
        deviseConvertion: commande.deviseConvertion,
        status: mapStatutCommandeToOrderStatus(commande.statut),
        orderDate: commande.creeLe.split("T")[0],
        deliveryDate: commande.dateLivraisonEstimee.split("T")[0],
        receivedDate: commande.produits.some((p) => p.reception?.dateReception)
            ? commande.produits
                  .find((p) => p.reception?.dateReception)
                  ?.reception?.dateReception?.split("T")[0]
            : undefined,
        notes: commande.note,
    };
};

const SupplyPage: React.FC = () => {
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showReceiveModal, setShowReceiveModal] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const { showToast } = useToast();
    const { logActivity } = useActivity();

    const [orders, setOrders] = useState<Order[]>([]);
    const [fournisseurs, setFournisseurs] = useState<FournisseurType[]>([]);
    const [produitsDisponibles, setProduitsDisponibles] = useState<
        ProduitType[]
    >([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingFournisseurs, setIsLoadingFournisseurs] = useState(false);
    const [isLoadingProduits, setIsLoadingProduits] = useState(false);
    const [loadingOrders, setLoadingOrders] = useState<Set<string>>(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingReceive, setIsLoadingReceive] = useState(false);
    const [isLoadingReturn, setIsLoadingReturn] = useState(false);

    const [formData, setFormData] = useState({
        fournisseurId: "",
        dateLivraisonEstimee: "",
        notes: "",
        produits: [] as ProduitSelection[],
    });

    const [receiveData, setReceiveData] = useState<{
        [key: string]: { received: number; defective: number };
    }>({});
    const [returnData, setReturnData] = useState({
        reason: "",
        items: [] as { itemId: string; quantity: number; reason: string }[],
    });

    const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);

    // Available currencies
    const availableCurrencies: Devise[] = Object.values(Devise);

    const getLocalToday = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const refreshOrders = async () => {
        setIsLoading(true);
        try {
            const commandes = await getCommandes();
            const mappedOrders = commandes.map(mapCommandeToOrder);
            setOrders(mappedOrders);
        } catch (error: any) {
            showToast({
                type: "error",
                title: "Erreur",
                message:
                    error.message || "Erreur lors du chargement des commandes.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setIsLoadingFournisseurs(true);
                const fournisseursData = await getFournisseurs();
                setFournisseurs(fournisseursData.filter((f) => !f.isDeleted));
                showToast({
                    type: "success",
                    title: "Données chargées",
                    message:
                        "Les commandes et fournisseurs ont été récupérés avec succès.",
                });
            } catch (error: any) {
                showToast({
                    type: "error",
                    title: "Erreur",
                    message:
                        error.message ||
                        "Erreur lors du chargement des données.",
                });
            } finally {
                setIsLoadingFournisseurs(false);
            }
        };

        fetchInitialData();
        refreshOrders();
    }, [showToast]);

    useEffect(() => {
        const fetchProduits = async () => {
            if (formData.fournisseurId) {
                try {
                    setIsLoadingProduits(true);
                    const fournisseur = await getFournisseurById(
                        parseInt(formData.fournisseurId),
                    );
                    console.log("Produits récupérés :", fournisseur.produits);
                    // Ensure produits is an array
                    const produitsArray = Array.isArray(fournisseur.produits)
                        ? fournisseur.produits
                        : [fournisseur.produits].filter(
                              (p) => p !== null && p !== undefined,
                          );
                    setProduitsDisponibles(produitsArray);
                } catch (error: any) {
                    showToast({
                        type: "error",
                        title: "Erreur",
                        message:
                            error.message ||
                            "Erreur lors du chargement des produits.",
                    });
                    setProduitsDisponibles([]);
                } finally {
                    setIsLoadingProduits(false);
                }
            } else {
                setProduitsDisponibles([]);
            }
        };

        fetchProduits();
    }, [formData.fournisseurId, showToast]);

    const addProduitToForm = () => {
        if (
            formData.fournisseurId &&
            formData.produits.length < produitsDisponibles.length
        ) {
            setFormData((prev) => ({
                ...prev,
                produits: [
                    ...prev.produits,
                    {
                        produitId: 0,
                        nom: "",
                        prixNegocie: "",
                        quantite: "",
                        conditionnement: "",
                        devise: "EUR" as Devise,
                    },
                ],
            }));
        } else {
            showToast({
                type: "error",
                title: "Limite atteinte",
                message:
                    "Vous ne pouvez pas ajouter plus de produits que ceux disponibles pour ce fournisseur.",
            });
        }
    };

    const removeProduitFromForm = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            produits: prev.produits.filter((_, i) => i !== index),
        }));
    };

    const updateProduitInForm = (
        index: number,
        field: keyof ProduitSelection,
        value: string | number,
    ) => {
        setFormData((prev) => {
            const newProduits = [...prev.produits];
            if (field === "produitId") {
                const produit = produitsDisponibles.find(
                    (p) => p.id === parseInt(value as string),
                );
                if (produit) {
                    // Check if product is already selected
                    if (
                        newProduits.some(
                            (p, i) =>
                                i !== index &&
                                p.produitId === parseInt(value as string),
                        )
                    ) {
                        showToast({
                            type: "error",
                            title: "Erreur",
                            message: "Ce produit est déjà sélectionné.",
                        });
                        return prev;
                    }
                    newProduits[index] = {
                        ...newProduits[index],
                        produitId: parseInt(value as string),
                        nom: produit.nom || `Produit ${produit.id}`, // Fallback
                        prixNegocie: produit.prix || "0",
                        conditionnement: produit.conditionnement || "",
                        devise: produit.devise || "EUR",
                    };
                } else {
                    showToast({
                        type: "error",
                        title: "Erreur",
                        message: "Produit non trouvé.",
                    });
                    newProduits[index] = {
                        ...newProduits[index],
                        produitId: 0,
                        nom: "",
                        prixNegocie: "",
                        conditionnement: "",
                        devise: "EUR" as Devise,
                    };
                }
            } else {
                newProduits[index] = {
                    ...newProduits[index],
                    [field]: value,
                };
            }
            return { ...prev, produits: newProduits };
        });
    };

    const calculateMontantTotalConverti = () => {
        return formData.produits
            .reduce((sum, produit) => {
                const quantite = parseFloat(produit.quantite) || 0;
                const prixNegocie = parseFloat(produit.prixNegocie) || 0;
                return sum + quantite * prixNegocie;
            }, 0)
            .toFixed(2);
    };

    const getStatusColor = (status: StatutCommande) => {
        switch (status) {
            case StatutCommande.BROUILLON:
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
            case StatutCommande.VALIDEE:
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
            case StatutCommande.REÇUE:
                return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
            case StatutCommande.CLOTUREE:
                return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
            case StatutCommande.ANNULEE:
                return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
        }
    };

    const getStatusIcon = (status: StatutCommande) => {
        switch (status) {
            case StatutCommande.BROUILLON:
                return <Clock className="w-4 h-4" />;
            case StatutCommande.VALIDEE:
                return <CheckCircle className="w-4 h-4" />;
            case StatutCommande.REÇUE:
                return <Package className="w-4 h-4" />;
            case StatutCommande.CLOTUREE:
                return <CheckCircle className="w-4 h-4" />;
            case StatutCommande.ANNULEE:
                return <RotateCcw className="w-4 h-4" />;
            default:
                return <AlertCircle className="w-4 h-4" />;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.fournisseurId) {
            showToast({
                type: "error",
                title: "Erreur",
                message: "Veuillez sélectionner un fournisseur.",
            });
            return;
        }
        if (formData.produits.length === 0) {
            showToast({
                type: "error",
                title: "Erreur",
                message: "Veuillez ajouter au moins un produit.",
            });
            return;
        }
        if (
            formData.produits.some(
                (p) =>
                    !p.produitId ||
                    isNaN(parseFloat(p.quantite)) ||
                    parseFloat(p.quantite) <= 0 ||
                    isNaN(parseFloat(p.prixNegocie)) ||
                    parseFloat(p.prixNegocie) <= 0 ||
                    !p.devise ||
                    !p.conditionnement,
            )
        ) {
            showToast({
                type: "error",
                title: "Erreur",
                message:
                    "Veuillez vérifier que tous les produits ont un ID, une quantité positive, un prix négocié valide, une devise et un conditionnement.",
            });
            return;
        }
        // Validate delivery date
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to midnight for comparison
        const selectedDate = new Date(formData.dateLivraisonEstimee);
        if (isNaN(selectedDate.getTime()) || selectedDate < today) {
            showToast({
                type: "error",
                title: "Erreur",
                message:
                    "La date de livraison doit être valide et ne peut pas être antérieure à aujourd'hui.",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const payload: CreateCommandePayload = {
                fournisseurId: parseInt(formData.fournisseurId),
                dateLivraisonEstimee: formData.dateLivraisonEstimee,
                note: formData.notes,
                produits: formData.produits.map((p) => ({
                    produitId: p.produitId,
                    prixNegocie: parseFloat(p.prixNegocie),
                    devise: p.devise,
                    quantite: parseInt(p.quantite),
                    conditionnement: p.conditionnement,
                })),
            };

            let response;
            let reference;
            if (isEditing && selectedOrder) {
                console.log("Payload sent to updateCommande:", payload);
                response = await updateCommande(
                    selectedOrder.commandeId,
                    payload,
                );
                console.log("Response from updateCommande:", response);
                reference = response.data?.data?.reference || selectedOrder.id;
                showToast({
                    type: "success",
                    title: "Commande mise à jour",
                    message: `La commande ${reference} a été mise à jour avec succès`,
                });
                logActivity({
                    type: "update",
                    module: "Approvisionnements",
                    description: `Commande mise à jour: ${reference}`,
                    metadata: {
                        orderId: reference,
                        supplier:
                            response.data?.data?.fournisseur?.nom ||
                            "Fournisseur inconnu",
                    },
                });
            } else {
                console.log("Payload sent to createCommande:", payload);
                response = await createCommande(payload);
                console.log("Response from createCommande:", response);
                reference = response.data?.data?.reference || "CMD-UNKNOWN";
                showToast({
                    type: "success",
                    title: "Commande créée",
                    message: `La commande ${reference} a été créée avec succès`,
                });
                logActivity({
                    type: "create",
                    module: "Approvisionnements",
                    description: `Nouvelle commande créée: ${reference}`,
                    metadata: {
                        orderId: reference,
                        supplier:
                            response.data?.data?.fournisseur?.nom ||
                            "Fournisseur inconnu",
                    },
                });
            }

            await refreshOrders();

            setShowForm(false);
            setIsEditing(false);
            setSelectedOrder(null);
            setFormData({
                fournisseurId: "",
                dateLivraisonEstimee: "",
                notes: "",
                produits: [],
            });
        } catch (error: any) {
            console.error("Error in handleSubmit:", error);
            showToast({
                type: "error",
                title: "Erreur",
                message:
                    error.message ||
                    "Erreur lors de la " +
                        (isEditing ? "mise à jour" : "création") +
                        " de la commande.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleShowEdit = (order: Order) => {
        setSelectedOrder(order);
        setFormData({
            fournisseurId: order.supplier.id.toString(),
            dateLivraisonEstimee: order.deliveryDate,
            notes: order.notes || "",
            produits: order.items.map((item) => ({
                produitId: item.produit.id,
                nom: item.produit.nom,
                prixNegocie: item.prixNegocie,
                quantite: item.quantite.toString(),
                conditionnement: item.conditionnement,
                devise: item.devise,
            })),
        });
        setIsEditing(true);
        setShowForm(true);
    };

    const handleReceiveOrder = (order: Order) => {
        setSelectedOrder(order);
        const initialReceiveData: {
            [key: string]: { received: number; defective: number };
        } = {};
        order.items.forEach((item, index) => {
            initialReceiveData[index.toString()] = {
                received: item.reception?.quantiteRecue || 0,
                defective: item.reception?.quantiteEndommage || 0,
            };
        });
        setReceiveData(initialReceiveData);
        setShowReceiveModal(true);
    };

    const confirmReceive = async () => {
        if (!selectedOrder) return;

        setIsLoadingReceive(true);

        try {
            const receptions = selectedOrder.items.map((item, index) => {
                const receiveInfo = receiveData[index.toString()] || {
                    received: 0,
                    defective: 0,
                };
                return {
                    produitCommandeId: item.id,
                    quantiteRecue: receiveInfo.received,
                    quantiteEndommage: receiveInfo.defective,
                    dateReception: new Date().toISOString(),
                    commentaireReception:
                        receiveInfo.defective > 0
                            ? "Réception avec produits défectueux"
                            : "Réception complète",
                };
            });

            await updateCommandeStatut(selectedOrder.commandeId, {
                statut: StatutCommande.REÇUE,
                receptions,
            });

            await refreshOrders();

            logActivity({
                type: "update",
                module: "Approvisionnements",
                description: `Réception mise à jour pour la commande ${selectedOrder.id}`,
                metadata: { orderId: selectedOrder.id, receiveData },
            });

            showToast({
                type: "success",
                title: "Réception mise à jour",
                message: `La réception de la commande ${selectedOrder.id} a été mise à jour`,
            });
        } catch (error: any) {
            showToast({
                type: "error",
                title: "Erreur",
                message:
                    error.message ||
                    "Erreur lors de la mise à jour de la réception.",
            });
        } finally {
            setIsLoadingReceive(false);
            setShowReceiveModal(false);
            setReceiveData({});
        }
    };

    const handleReturnRequest = (order: Order) => {
        setSelectedOrder(order);
        setReturnData({
            reason: "",
            items: order.items
                .filter((item) => item.reception?.quantiteEndommage || 0 > 0)
                .map((item, index) => ({
                    itemId: index.toString(),
                    quantity: item.reception?.quantiteEndommage || 0,
                    reason: "Produit défectueux",
                })),
        });
        setShowReturnModal(true);
    };

    const submitReturnRequest = () => {
        setIsLoadingReturn(true);
        if (!selectedOrder || returnData.items.length === 0) {
            setIsLoadingReturn(false);
            return;
        }

        const newReturn: ReturnRequest = {
            id: `RET-${String(returnRequests.length + 1).padStart(3, "0")}`,
            orderId: selectedOrder.id,
            items: returnData.items,
            status: "pending",
            requestDate: new Date().toISOString().split("T")[0],
            reason: returnData.reason,
        };

        setReturnRequests((prev) => [newReturn, ...prev]);

        logActivity({
            type: "create",
            module: "Approvisionnements",
            description: `Demande de retour créée: ${newReturn.id}`,
            metadata: { returnId: newReturn.id, orderId: selectedOrder.id },
        });

        showToast({
            type: "info",
            title: "Demande de retour envoyée",
            message: `La demande de retour ${newReturn.id} a été envoyée au fournisseur`,
        });

        setIsLoadingReturn(false);
        setShowReturnModal(false);
        setSelectedOrder(null);
        setReturnData({ reason: "", items: [] });
    };

    const updateOrderStatus = async (
        orderId: string,
        newStatus: StatutCommande,
    ) => {
        const order = orders.find((o) => o.id === orderId);
        if (!order) return;

        setLoadingOrders((prev) => new Set([...prev, orderId]));

        try {
            await updateCommandeStatut(order.commandeId, { statut: newStatus });

            await refreshOrders();

            logActivity({
                type: "update",
                module: "Approvisionnements",
                description: `Statut de la commande ${orderId} mis à jour: ${newStatus}`,
                metadata: { orderId, newStatus },
            });

            showToast({
                type: "success",
                title: "Statut mis à jour",
                message: `Le statut de la commande ${orderId} a été mis à jour`,
            });
        } catch (error: any) {
            showToast({
                type: "error",
                title: "Erreur",
                message:
                    error.message || "Erreur lors de la mise à jour du statut.",
            });
        } finally {
            setLoadingOrders((prev) => {
                const newSet = new Set(prev);
                newSet.delete(orderId);
                return newSet;
            });
        }
    };

    const closeOrder = (orderId: string) => {
        updateOrderStatus(orderId, StatutCommande.CLOTUREE);
    };

    const handleShowDetails = (order: Order) => {
        setSelectedOrder(order);
        setShowDetailModal(true);
    };

    const filteredOrders = orders.filter((order) => {
        const matchesSearch =
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.supplier.nom.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
            statusFilter === "all" || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getPriceComparison = (
        prixBase: string,
        prixNegocie: string,
        devise: Devise,
    ) => {
        const base = parseFloat(prixBase);
        const negocie = parseFloat(prixNegocie);
        const difference = base - negocie;
        const percentage =
            base !== 0 ? ((difference / base) * 100).toFixed(2) : 0;
        let icon = <Minus className="w-4 h-4 text-gray-400" />;
        let color = "text-gray-500";

        if (difference > 0) {
            icon = <ArrowDown className="w-4 h-4 text-green-500" />;
            color = "text-green-500";
        } else if (difference < 0) {
            icon = <ArrowUp className="w-4 h-4 text-red-500" />;
            color = "text-red-500";
        }

        return (
            <div className="flex items-center">
                {icon}
                <span className={`ml-2 ${color}`}>
                    Différence: {difference.toFixed(2)} {devise} ({percentage}%)
                </span>
            </div>
        );
    };

    return (
        <div className="min-h-screen pt-16 bg-gradient-to-br from-nexsaas-pure-white to-nexsaas-light-gray dark:from-nexsaas-vanta-black dark:to-gray-900 overflow-x-hidden">
            <div className="container mx-auto px-4 py-8 max-w-full">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-4"
                >
                    <div className="flex flex-wrap items-center gap-3">
                        <Link to="/dashboard">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="w-3 h-3 mr-1" />
                                Retour
                            </Button>
                        </Link>
                        <div className="p-2 bg-blue-500 rounded-lg">
                            <Package className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white truncate">
                                Gestion des Approvisionnements
                            </h1>
                            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300 truncate">
                                Créez, suivez et gérez vos commandes
                                fournisseurs
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Indicateur de chargement */}
                {isLoading ? (
                    <div className="text-center">
                        <p className="text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                            Chargement des commandes...
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="flex overflow-x-auto gap-2 mb-4 pb-2 sm:grid sm:grid-cols-3 md:grid-cols-5 sm:gap-4"
                        >
                            <Card className="text-center p-2 min-w-[100px] sm:p-3">
                                <div className="p-1 bg-yellow-500/10 rounded-lg inline-block mb-1">
                                    <Clock className="w-4 h-4 text-yellow-500" />
                                </div>
                                <h3 className="text-lg font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                    {
                                        orders.filter(
                                            (o) =>
                                                o.status ===
                                                StatutCommande.BROUILLON,
                                        ).length
                                    }
                                </h3>
                                <p className="text-xs text-nexsaas-vanta-black dark:text-gray-300">
                                    Brouillon
                                </p>
                            </Card>

                            <Card className="text-center p-2 min-w-[100px] sm:p-3">
                                <div className="p-1 bg-blue-500/10 rounded-lg inline-block mb-1">
                                    <CheckCircle className="w-4 h-4 text-blue-500" />
                                </div>
                                <h3 className="text-lg font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                    {
                                        orders.filter(
                                            (o) =>
                                                o.status ===
                                                StatutCommande.VALIDEE,
                                        ).length
                                    }
                                </h3>
                                <p className="text-xs text-nexsaas-vanta-black dark:text-gray-300">
                                    Validées
                                </p>
                            </Card>

                            <Card className="text-center p-2 min-w-[100px] sm:p-3">
                                <div className="p-1 bg-orange-500/10 rounded-lg inline-block mb-1">
                                    <Package className="w-4 h-4 text-orange-500" />
                                </div>
                                <h3 className="text-lg font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                    {
                                        orders.filter(
                                            (o) =>
                                                o.status ===
                                                StatutCommande.REÇUE,
                                        ).length
                                    }
                                </h3>
                                <p className="text-xs text-nexsaas-vanta-black dark:text-gray-300">
                                    Reçues
                                </p>
                            </Card>

                            <Card className="text-center p-2 min-w-[100px] sm:p-3">
                                <div className="p-1 bg-green-500/10 rounded-lg inline-block mb-1">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                </div>
                                <h3 className="text-lg font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                    {
                                        orders.filter(
                                            (o) =>
                                                o.status ===
                                                StatutCommande.CLOTUREE,
                                        ).length
                                    }
                                </h3>
                                <p className="text-xs text-nexsaas-vanta-black dark:text-gray-300">
                                    Clôturées
                                </p>
                            </Card>

                            <Card className="text-center p-2 min-w-[100px] sm:p-3">
                                <div className="p-1 bg-red-500/10 rounded-lg inline-block mb-1">
                                    <RotateCcw className="w-4 h-4 text-red-500" />
                                </div>
                                <h3 className="text-lg font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                    {
                                        orders.filter(
                                            (o) =>
                                                o.status ===
                                                StatutCommande.ANNULEE,
                                        ).length
                                    }
                                </h3>
                                <p className="text-xs text-nexsaas-vanta-black dark:text-gray-300">
                                    Annulées
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
                                    <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
                                        <div className="relative flex-1 max-w-md w-full">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Rechercher une commande..."
                                                value={searchTerm}
                                                onChange={(e) =>
                                                    setSearchTerm(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full pl-10 pr-4 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                                            />
                                        </div>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) =>
                                                setStatusFilter(e.target.value)
                                            }
                                            className="px-4 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none w-full sm:w-auto"
                                        >
                                            <option value="all">
                                                Tous les statuts
                                            </option>
                                            <option
                                                value={StatutCommande.BROUILLON}
                                            >
                                                Brouillon
                                            </option>
                                            <option
                                                value={StatutCommande.VALIDEE}
                                            >
                                                Validée
                                            </option>
                                            <option
                                                value={StatutCommande.REÇUE}
                                            >
                                                Reçue
                                            </option>
                                            <option
                                                value={StatutCommande.CLOTUREE}
                                            >
                                                Clôturée
                                            </option>
                                            <option
                                                value={StatutCommande.ANNULEE}
                                            >
                                                Annulée
                                            </option>
                                        </select>
                                    </div>
                                    <Button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setShowForm(true);
                                        }}
                                        className="w-full md:w-auto"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Nouvelle commande
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>

                        {/* Orders List */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                            className="space-y-4"
                        >
                            {filteredOrders.map((order, index) => (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                        duration: 0.6,
                                        delay: index * 0.1,
                                    }}
                                >
                                    <Card className="hover:shadow-md transition-shadow p-3 sm:p-4">
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center mb-2">
                                                    <h3 className="text-base sm:text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mr-3">
                                                        {order.id}
                                                    </h3>
                                                    <span
                                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                            order.status,
                                                        )}`}
                                                    >
                                                        {getStatusIcon(
                                                            order.status,
                                                        )}
                                                        <span className="ml-1 capitalize">
                                                            {order.status.toLowerCase()}
                                                        </span>
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm mb-4">
                                                    <div className="flex items-center">
                                                        <Building className="w-4 h-4 text-gray-400 mr-2" />
                                                        <span className="text-nexsaas-vanta-black dark:text-gray-300">
                                                            {order.supplier.nom}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                                        <span className="text-nexsaas-vanta-black dark:text-gray-300">
                                                            Livraison:{" "}
                                                            {order.deliveryDate}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className="text-nexsaas-vanta-black dark:text-gray-300">
                                                            {order.items.length}{" "}
                                                            Produit(s)
                                                            {order.items
                                                                .length > 1
                                                                ? "s"
                                                                : ""}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className="text-base sm:text-lg font-bold text-nexsaas-saas-green">
                                                            {
                                                                order.montantTotalConverti
                                                            }{" "}
                                                            {
                                                                order.deviseConvertion
                                                            }
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Items Details */}
                                                <div className="space-y-2">
                                                    {order.items.map(
                                                        (item, itemIndex) => (
                                                            <div
                                                                key={itemIndex}
                                                                className="bg-nexsaas-light-gray dark:bg-gray-700 rounded-lg p-2 sm:p-3"
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <h4 className="font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white text-sm sm:text-base">
                                                                            {
                                                                                item
                                                                                    .produit
                                                                                    .nom
                                                                            }
                                                                        </h4>
                                                                        <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                                                            <span>
                                                                                Commandé:{" "}
                                                                                {
                                                                                    item.quantite
                                                                                }
                                                                            </span>
                                                                            <span>
                                                                                Reçu:{" "}
                                                                                {item
                                                                                    .reception
                                                                                    ?.quantiteRecue ||
                                                                                    0}
                                                                            </span>
                                                                            {item
                                                                                .reception
                                                                                ?.quantiteEndommage &&
                                                                                item
                                                                                    .reception
                                                                                    ?.quantiteEndommage >
                                                                                    0 && (
                                                                                    <span className="text-red-500">
                                                                                        Défectueux:{" "}
                                                                                        {
                                                                                            item
                                                                                                .reception
                                                                                                ?.quantiteEndommage
                                                                                        }
                                                                                    </span>
                                                                                )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <span className="font-bold text-nexsaas-saas-green text-sm sm:text-base">
                                                                            {
                                                                                item.prixNegocie
                                                                            }{" "}
                                                                            {
                                                                                item.devise
                                                                            }
                                                                        </span>
                                                                        <div className="text-xs text-nexsaas-vanta-black dark:text-gray-300">
                                                                            par
                                                                            unité
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col space-y-2 mt-4 lg:mt-0 lg:ml-4 ml-0">
                                                {order.status ===
                                                    StatutCommande.BROUILLON && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            updateOrderStatus(
                                                                order.id,
                                                                StatutCommande.VALIDEE,
                                                            )
                                                        }
                                                        disabled={loadingOrders.has(
                                                            order.id,
                                                        )}
                                                    >
                                                        {loadingOrders.has(
                                                            order.id,
                                                        ) ? (
                                                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                                        ) : (
                                                            <CheckCircle className="w-4 h-4 mr-1" />
                                                        )}
                                                        Valider
                                                    </Button>
                                                )}

                                                {order.status ===
                                                    StatutCommande.VALIDEE && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleReceiveOrder(
                                                                order,
                                                            )
                                                        }
                                                        disabled={loadingOrders.has(
                                                            order.id,
                                                        )}
                                                    >
                                                        {loadingOrders.has(
                                                            order.id,
                                                        ) ? (
                                                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                                        ) : (
                                                            <Package className="w-4 h-4 mr-1" />
                                                        )}
                                                        Confirmer réception
                                                    </Button>
                                                )}

                                                {order.status ===
                                                    StatutCommande.REÇUE && (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleReceiveOrder(
                                                                    order,
                                                                )
                                                            }
                                                            disabled={loadingOrders.has(
                                                                order.id,
                                                            )}
                                                        >
                                                            {loadingOrders.has(
                                                                order.id,
                                                            ) ? (
                                                                <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                                            ) : (
                                                                <Edit className="w-4 h-4 mr-1" />
                                                            )}
                                                            Modifier réception
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                closeOrder(
                                                                    order.id,
                                                                )
                                                            }
                                                            disabled={loadingOrders.has(
                                                                order.id,
                                                            )}
                                                        >
                                                            {loadingOrders.has(
                                                                order.id,
                                                            ) ? (
                                                                <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                                            ) : (
                                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                            )}
                                                            Clôturer
                                                        </Button>
                                                        {order.items.some(
                                                            (item) =>
                                                                item.reception
                                                                    ?.quantiteEndommage >
                                                                0,
                                                        ) && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleReturnRequest(
                                                                        order,
                                                                    )
                                                                }
                                                                className="text-red-500 hover:text-red-600"
                                                                disabled={loadingOrders.has(
                                                                    order.id,
                                                                )}
                                                            >
                                                                {loadingOrders.has(
                                                                    order.id,
                                                                ) ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                                                ) : (
                                                                    <RotateCcw className="w-4 h-4 mr-1" />
                                                                )}
                                                                Demander retour
                                                            </Button>
                                                        )}
                                                    </>
                                                )}

                                                {(order.status ===
                                                    StatutCommande.BROUILLON ||
                                                    order.status ===
                                                        StatutCommande.VALIDEE) && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            updateOrderStatus(
                                                                order.id,
                                                                StatutCommande.ANNULEE,
                                                            )
                                                        }
                                                        className="text-red-500 hover:text-red-600"
                                                        disabled={loadingOrders.has(
                                                            order.id,
                                                        )}
                                                    >
                                                        {loadingOrders.has(
                                                            order.id,
                                                        ) ? (
                                                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                                        ) : (
                                                            <X className="w-4 h-4 mr-1" />
                                                        )}
                                                        Annuler
                                                    </Button>
                                                )}

                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleShowDetails(
                                                                order,
                                                            )
                                                        }
                                                        disabled={loadingOrders.has(
                                                            order.id,
                                                        )}
                                                    >
                                                        {loadingOrders.has(
                                                            order.id,
                                                        ) ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Eye className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleShowEdit(
                                                                order,
                                                            )
                                                        }
                                                        disabled={loadingOrders.has(
                                                            order.id,
                                                        )}
                                                    >
                                                        {loadingOrders.has(
                                                            order.id,
                                                        ) ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Edit className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    </>
                )}

                {/* Form Modal */}
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 sm:p-6 z-50 overflow-y-auto"
                        onClick={() => {
                            setShowForm(false);
                            setIsEditing(false);
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-nexsaas-pure-white dark:bg-gray-800 rounded-xl p-3 sm:p-6 w-full max-w-[95vw] sm:max-w-lg md:max-w-2xl lg:max-w-3xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-lg sm:text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-3 sm:mb-6">
                                {isEditing
                                    ? "Modifier Commande Fournisseur"
                                    : "Nouvelle Commande Fournisseur"}
                            </h2>

                            <form
                                onSubmit={handleSubmit}
                                className="space-y-3 sm:space-y-6"
                            >
                                <div className="grid grid-cols-1 gap-3 sm:gap-6">
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                            Fournisseur
                                        </label>
                                        <div className="relative">
                                            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <select
                                                value={formData.fournisseurId}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        fournisseurId:
                                                            e.target.value,
                                                        produits: [],
                                                    })
                                                }
                                                className="w-full pl-10 pr-4 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none text-xs sm:text-base"
                                                required
                                                disabled={isLoadingFournisseurs}
                                            >
                                                <option value="">
                                                    Sélectionner un fournisseur
                                                </option>
                                                {fournisseurs.map(
                                                    (fournisseur) => (
                                                        <option
                                                            key={fournisseur.id}
                                                            value={
                                                                fournisseur.id
                                                            }
                                                        >
                                                            {fournisseur.nom}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                    <Input
                                        label="Date de livraison"
                                        type="date"
                                        value={formData.dateLivraisonEstimee}
                                        onChange={(value) =>
                                            setFormData({
                                                ...formData,
                                                dateLivraisonEstimee: value,
                                            })
                                        }
                                        icon={Calendar}
                                        required
                                        min={
                                            new Date()
                                                .toISOString()
                                                .split("T")[0]
                                        }
                                        className="text-xs sm:text-base"
                                    />
                                </div>

                                <div>
                                    <h3 className="text-sm sm:text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2 sm:mb-4">
                                        Produits
                                    </h3>
                                    {formData.produits.map((produit, index) => (
                                        <div
                                            key={index}
                                            className="border border-nexsaas-light-gray dark:border-gray-600 rounded-lg p-3 mb-3"
                                        >
                                            <div className="flex justify-between items-center mb-2 sm:mb-4">
                                                <h4 className="font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white text-xs sm:text-base">
                                                    Produit {index + 1}
                                                </h4>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        removeProduitFromForm(
                                                            index,
                                                        )
                                                    }
                                                    className="text-red-500 hover:text-red-600"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                    <div className="sm:col-span-2">
                                                        <label className="block text-xs sm:text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                                            Produit
                                                        </label>
                                                        <div className="relative">
                                                            <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                            <select
                                                                value={
                                                                    produit.produitId ||
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    updateProduitInForm(
                                                                        index,
                                                                        "produitId",
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="w-full pl-10 pr-4 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none text-xs sm:text-base"
                                                                required
                                                                disabled={
                                                                    isLoadingProduits ||
                                                                    !formData.fournisseurId
                                                                }
                                                            >
                                                                <option value="">
                                                                    Sélectionner
                                                                    un produit
                                                                </option>
                                                                {produitsDisponibles.length ===
                                                                    0 &&
                                                                formData.fournisseurId &&
                                                                !isLoadingProduits ? (
                                                                    <option
                                                                        value=""
                                                                        disabled
                                                                    >
                                                                        Aucun
                                                                        produit
                                                                        disponible
                                                                    </option>
                                                                ) : (
                                                                    produitsDisponibles
                                                                        .filter(
                                                                            (
                                                                                p,
                                                                            ) =>
                                                                                !formData.produits.some(
                                                                                    (
                                                                                        prod,
                                                                                        i,
                                                                                    ) =>
                                                                                        i !==
                                                                                            index &&
                                                                                        prod.produitId &&
                                                                                        prod.produitId ===
                                                                                            p.id,
                                                                                ),
                                                                        )
                                                                        .map(
                                                                            (
                                                                                p,
                                                                            ) => (
                                                                                <option
                                                                                    key={
                                                                                        p.id
                                                                                    }
                                                                                    value={
                                                                                        p.id
                                                                                    }
                                                                                >
                                                                                    {p.nom ||
                                                                                        `Produit ${p.id}`}
                                                                                </option>
                                                                            ),
                                                                        )
                                                                )}
                                                            </select>
                                                            {produit.nom && (
                                                                <p className="mt-2 text-xs sm:text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                                                    Produit
                                                                    sélectionné:{" "}
                                                                    {
                                                                        produit.nom
                                                                    }
                                                                </p>
                                                            )}
                                                            {produitsDisponibles.length ===
                                                                0 &&
                                                                formData.fournisseurId &&
                                                                !isLoadingProduits && (
                                                                    <p className="mt-2 text-xs sm:text-sm text-red-500">
                                                                        Aucun
                                                                        produit
                                                                        disponible
                                                                        pour ce
                                                                        fournisseur.
                                                                    </p>
                                                                )}
                                                        </div>
                                                    </div>
                                                    <Input
                                                        label="Quantité"
                                                        type="number"
                                                        value={produit.quantite}
                                                        onChange={(value) =>
                                                            updateProduitInForm(
                                                                index,
                                                                "quantite",
                                                                value,
                                                            )
                                                        }
                                                        icon={Package}
                                                        required
                                                        min="1"
                                                        className="text-xs sm:text-base"
                                                    />
                                                    <div>
                                                        <label className="block text-xs sm:text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                                            Devise
                                                        </label>
                                                        <div className="relative">
                                                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                            <select
                                                                value={
                                                                    produit.devise
                                                                }
                                                                onChange={(e) =>
                                                                    updateProduitInForm(
                                                                        index,
                                                                        "devise",
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="w-full pl-10 pr-4 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none text-xs sm:text-base"
                                                                required
                                                            >
                                                                {availableCurrencies.map(
                                                                    (
                                                                        currency,
                                                                    ) => (
                                                                        <option
                                                                            key={
                                                                                currency
                                                                            }
                                                                            value={
                                                                                currency
                                                                            }
                                                                        >
                                                                            {
                                                                                currency
                                                                            }
                                                                        </option>
                                                                    ),
                                                                )}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <Input
                                                        label={`Prix négocié (${produit.devise})`}
                                                        type="number"
                                                        step="0.01"
                                                        value={
                                                            produit.prixNegocie
                                                        }
                                                        onChange={(value) =>
                                                            updateProduitInForm(
                                                                index,
                                                                "prixNegocie",
                                                                value,
                                                            )
                                                        }
                                                        icon={DollarSign}
                                                        required
                                                        min="0.01"
                                                        className="text-xs sm:text-base"
                                                    />
                                                    <Input
                                                        label="Conditionnement"
                                                        value={
                                                            produit.conditionnement
                                                        }
                                                        onChange={(value) =>
                                                            updateProduitInForm(
                                                                index,
                                                                "conditionnement",
                                                                value,
                                                            )
                                                        }
                                                        icon={Package}
                                                        required
                                                        className="text-xs sm:text-base"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addProduitToForm}
                                        disabled={
                                            !formData.fournisseurId ||
                                            isLoadingProduits ||
                                            formData.produits.length >=
                                                produitsDisponibles.length
                                        }
                                        className="w-full sm:w-auto"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Ajouter un produit
                                    </Button>
                                </div>

                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                        Notes (optionnel)
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                notes: e.target.value,
                                            })
                                        }
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none text-xs sm:text-base"
                                        placeholder="Informations complémentaires..."
                                    />
                                </div>

                                <div className="flex items-center">
                                    <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-1">
                                            Montant total estimé
                                        </label>
                                        <p className="text-sm sm:text-lg font-bold text-nexsaas-saas-green">
                                            {calculateMontantTotalConverti()}{" "}
                                            {formData.produits[0]?.devise ||
                                                "EUR"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setShowForm(false);
                                            setIsEditing(false);
                                        }}
                                        disabled={isSubmitting}
                                        className="w-full sm:w-auto"
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full sm:w-auto"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        ) : null}
                                        {isEditing
                                            ? "Mettre à jour la commande"
                                            : "Créer la commande"}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}

                {/* Receive Modal */}
                {showReceiveModal && selectedOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                        onClick={() => setShowReceiveModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-nexsaas-pure-white dark:bg-gray-800 rounded-xl p-3 sm:p-6 w-full max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-lg sm:text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-3 sm:mb-6">
                                {selectedOrder.status === StatutCommande.REÇUE
                                    ? `Modifier la Réception - ${selectedOrder.id}`
                                    : `Confirmer la Réception - ${selectedOrder.id}`}
                            </h2>

                            <div className="space-y-3 sm:space-y-6">
                                {selectedOrder.items.map((item, index) => (
                                    <div
                                        key={index}
                                        className="border border-nexsaas-light-gray dark:border-gray-600 rounded-lg p-3"
                                    >
                                        <h3 className="font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-3 sm:mb-4 text-sm sm:text-base">
                                            {item.produit.nom}
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-xs sm:text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                                    Quantité commandée
                                                </label>
                                                <input
                                                    type="number"
                                                    value={item.quantite}
                                                    disabled
                                                    className="w-full px-4 py-2 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-nexsaas-deep-blue dark:text-nexsaas-pure-white text-xs sm:text-base"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs sm:text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                                    Quantité reçue
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={
                                                        item.quantite -
                                                        (item.reception
                                                            ?.quantiteRecue ||
                                                            0)
                                                    }
                                                    value={
                                                        receiveData[
                                                            index.toString()
                                                        ]?.received || 0
                                                    }
                                                    onChange={(e) =>
                                                        setReceiveData(
                                                            (prev) => ({
                                                                ...prev,
                                                                [index.toString()]:
                                                                    {
                                                                        ...prev[
                                                                            index.toString()
                                                                        ],
                                                                        received:
                                                                            parseInt(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            ) ||
                                                                            0,
                                                                    },
                                                            }),
                                                        )
                                                    }
                                                    className="w-full px-4 py-2 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none text-xs sm:text-base"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs sm:text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                                    Quantité défectueuse
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={
                                                        receiveData[
                                                            index.toString()
                                                        ]?.received || 0
                                                    }
                                                    value={
                                                        receiveData[
                                                            index.toString()
                                                        ]?.defective || 0
                                                    }
                                                    onChange={(e) =>
                                                        setReceiveData(
                                                            (prev) => ({
                                                                ...prev,
                                                                [index.toString()]:
                                                                    {
                                                                        ...prev[
                                                                            index.toString()
                                                                        ],
                                                                        defective:
                                                                            parseInt(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            ) ||
                                                                            0,
                                                                    },
                                                            }),
                                                        )
                                                    }
                                                    className="w-full px-4 py-2 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none text-xs sm:text-base"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="flex justify-end space-x-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setShowReceiveModal(false)
                                        }
                                        disabled={isLoadingReceive}
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        onClick={confirmReceive}
                                        disabled={isLoadingReceive}
                                    >
                                        {isLoadingReceive ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        ) : (
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                        )}
                                        {selectedOrder.status ===
                                        StatutCommande.REÇUE
                                            ? "Mettre à jour la réception"
                                            : "Confirmer la réception"}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Return Modal */}
                {showReturnModal && selectedOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                        onClick={() => setShowReturnModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-nexsaas-pure-white dark:bg-gray-800 rounded-xl p-3 sm:p-6 w-full max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-lg sm:text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-3 sm:mb-6">
                                Demande de Retour - {selectedOrder.id}
                            </h2>

                            <div className="space-y-3 sm:space-y-6">
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                        Motif du retour
                                    </label>
                                    <textarea
                                        value={returnData.reason}
                                        onChange={(e) =>
                                            setReturnData((prev) => ({
                                                ...prev,
                                                reason: e.target.value,
                                            }))
                                        }
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none text-xs sm:text-base"
                                        placeholder="Décrivez le motif du retour..."
                                    />
                                </div>

                                <div>
                                    <h3 className="text-sm sm:text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-3 sm:mb-4">
                                        Articles à retourner
                                    </h3>

                                    {returnData.items.map(
                                        (returnItem, index) => {
                                            const item =
                                                selectedOrder.items[
                                                    parseInt(returnItem.itemId)
                                                ];
                                            if (!item) return null;

                                            return (
                                                <div
                                                    key={index}
                                                    className="border border-nexsaas-light-gray dark:border-gray-600 rounded-lg p-3"
                                                >
                                                    <div className="flex justify-between items-center mb-2 sm:mb-3">
                                                        <h4 className="font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white text-xs sm:text-base">
                                                            {item.produit.nom}
                                                        </h4>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                setReturnData(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        items: prev.items.filter(
                                                                            (
                                                                                _,
                                                                                i,
                                                                            ) =>
                                                                                i !==
                                                                                index,
                                                                        ),
                                                                    }),
                                                                )
                                                            }
                                                            className="text-red-500 hover:text-red-600"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs sm:text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                                                Quantité à
                                                                retourner
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max={
                                                                    item
                                                                        .reception
                                                                        ?.quantiteEndommage
                                                                }
                                                                value={
                                                                    returnItem.quantity
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    const newItems =
                                                                        [
                                                                            ...returnData.items,
                                                                        ];
                                                                    newItems[
                                                                        index
                                                                    ].quantity =
                                                                        parseInt(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ) || 1;
                                                                    setReturnData(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            items: newItems,
                                                                        }),
                                                                    );
                                                                }}
                                                                className="w-full px-4 py-2 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none text-xs sm:text-base"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs sm:text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                                                Motif spécifique
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={
                                                                    returnItem.reason
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    const newItems =
                                                                        [
                                                                            ...returnData.items,
                                                                        ];
                                                                    newItems[
                                                                        index
                                                                    ].reason =
                                                                        e.target.value;
                                                                    setReturnData(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            items: newItems,
                                                                        }),
                                                                    );
                                                                }}
                                                                className="w-full px-4 py-2 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none text-xs sm:text-base"
                                                                placeholder="Ex: Écran cassé, défaut de fabrication..."
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        },
                                    )}
                                </div>

                                <div className="flex justify-end space-x-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setShowReturnModal(false)
                                        }
                                        disabled={isLoadingReturn}
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        onClick={submitReturnRequest}
                                        disabled={
                                            isLoadingReturn ||
                                            returnData.items.length === 0 ||
                                            !returnData.reason
                                        }
                                    >
                                        {isLoadingReturn ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        ) : (
                                            <RotateCcw className="w-4 h-4 mr-2" />
                                        )}
                                        Envoyer la demande
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Detail Modal */}
                {showDetailModal && selectedOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                        onClick={() => setShowDetailModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-nexsaas-pure-white dark:bg-gray-800 rounded-xl p-3 sm:p-6 w-full max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-lg sm:text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-3 sm:mb-6">
                                Détails de la Commande - {selectedOrder.id}
                            </h2>

                            <div className="space-y-4 sm:space-y-8">
                                {/* Informations générales */}
                                <div>
                                    <h3 className="text-sm sm:text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-3 sm:mb-4">
                                        Informations Générales
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="flex items-center">
                                            <PackageIcon className="w-5 h-5 text-gray-400 mr-2" />
                                            <div>
                                                <label className="block text-xs sm:text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-1">
                                                    Identifiant
                                                </label>
                                                <p className="text-nexsaas-vanta-black dark:text-gray-300 text-xs sm:text-base">
                                                    {selectedOrder.id}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <CheckCircle className="w-5 h-5 text-gray-400 mr-2" />
                                            <div>
                                                <label className="block text-xs sm:text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-1">
                                                    Statut
                                                </label>
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                        selectedOrder.status,
                                                    )}`}
                                                >
                                                    {getStatusIcon(
                                                        selectedOrder.status,
                                                    )}
                                                    <span className="ml-1 capitalize">
                                                        {selectedOrder.status.toLowerCase()}
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                                            <div>
                                                <label className="block text-xs sm:text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-1">
                                                    Date de commande
                                                </label>
                                                <p className="text-nexsaas-vanta-black dark:text-gray-300 text-xs sm:text-base">
                                                    {selectedOrder.orderDate}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                                            <div>
                                                <label className="block text-xs sm:text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-1">
                                                    Date de livraison estimée
                                                </label>
                                                <p className="text-nexsaas-vanta-black dark:text-gray-300 text-xs sm:text-base">
                                                    {selectedOrder.deliveryDate}
                                                </p>
                                            </div>
                                        </div>
                                        {selectedOrder.receivedDate && (
                                            <div className="flex items-center">
                                                <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                                                <div>
                                                    <label className="block text-xs sm:text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-1">
                                                        Date de réception
                                                    </label>
                                                    <p className="text-nexsaas-vanta-black dark:text-gray-300 text-xs sm:text-base">
                                                        {
                                                            selectedOrder.receivedDate
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center">
                                            <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
                                            <div>
                                                <label className="block text-xs sm:text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-1">
                                                    Montant total
                                                </label>
                                                <p className="text-sm sm:text-lg font-bold text-nexsaas-saas-green">
                                                    {
                                                        selectedOrder.montantTotalConverti
                                                    }{" "}
                                                    {
                                                        selectedOrder.deviseConvertion
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Fournisseur */}
                                <div>
                                    <h3 className="text-sm sm:text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-3 sm:mb-4">
                                        Fournisseur
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="flex items-center">
                                            <Building className="w-5 h-5 text-gray-400 mr-2" />
                                            <div>
                                                <label className="block text-xs sm:text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-1">
                                                    Nom
                                                </label>
                                                <p className="text-nexsaas-vanta-black dark:text-gray-300 text-xs sm:text-base">
                                                    {selectedOrder.supplier.nom}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <Mail className="w-5 h-5 text-gray-400 mr-2" />
                                            <div>
                                                <label className="block text-xs sm:text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-1">
                                                    Email
                                                </label>
                                                <p className="text-nexsaas-vanta-black dark:text-gray-300 text-xs sm:text-base">
                                                    {
                                                        selectedOrder.supplier
                                                            .email
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <Phone className="w-5 h-5 text-gray-400 mr-2" />
                                            <div>
                                                <label className="block text-xs sm:text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-1">
                                                    Téléphone
                                                </label>
                                                <p className="text-nexsaas-vanta-black dark:text-gray-300 text-xs sm:text-base">
                                                    {
                                                        selectedOrder.supplier
                                                            .telephone
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <AlertCircle className="w-5 h-5 text-gray-400 mr-2" />
                                            <div>
                                                <label className="block text-xs sm:text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-1">
                                                    Supprimé
                                                </label>
                                                <p className="text-nexsaas-vanta-black dark:text-gray-300 text-xs sm:text-base">
                                                    {selectedOrder.supplier
                                                        .isDeleted
                                                        ? "Oui"
                                                        : "Non"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Articles */}
                                <div>
                                    <h3 className="text-sm sm:text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-3 sm:mb-4">
                                        Articles
                                    </h3>
                                    {selectedOrder.items.map((item, index) => (
                                        <div
                                            key={index}
                                            className="border border-nexsaas-light-gray dark:border-gray-600 rounded-lg p-3 mb-3"
                                        >
                                            <h4 className="font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-3 sm:mb-4 text-sm sm:text-base">
                                                {item.produit.nom}
                                            </h4>

                                            {/* Lot et Quantités */}
                                            <div className="mb-3">
                                                <h5 className="text-xs sm:text-sm font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                                    Lot et Quantités
                                                </h5>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs sm:text-sm">
                                                    <div className="flex items-center">
                                                        <PackageIcon className="w-5 h-5 text-gray-400 mr-2" />
                                                        <div>
                                                            <label className="block text-nexsaas-vanta-black dark:text-gray-300">
                                                                Lot:{" "}
                                                                {item.lot ||
                                                                    "N/A"}
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <PackageIcon className="w-5 h-5 text-gray-400 mr-2" />
                                                        <div>
                                                            <label className="block text-nexsaas-vanta-black dark:text-gray-300">
                                                                Quantité
                                                                commandée:{" "}
                                                                {item.quantite}
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <PackageIcon className="w-5 h-5 text-gray-400 mr-2" />
                                                        <div>
                                                            <label className="block text-nexsaas-vanta-black dark:text-gray-300">
                                                                Quantité reçue:{" "}
                                                                {item.reception
                                                                    ?.quantiteRecue ||
                                                                    0}
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <AlertCircle className="w-5 h-5 text-gray-400 mr-2" />
                                                        <div>
                                                            <label className="block text-nexsaas-vanta-black dark:text-gray-300">
                                                                Quantité
                                                                défectueuse:{" "}
                                                                {item.reception
                                                                    ?.quantiteEndommage ||
                                                                    0}
                                                            </label>
                                                        </div>
                                                    </div>
                                                    {item.quantiteRetournee >
                                                        0 && (
                                                        <div className="flex items-center">
                                                            <PackageIcon className="w-5 h-5 text-gray-400 mr-2" />
                                                            <div>
                                                                <label className="block text-nexsaas-vanta-black dark:text-gray-300">
                                                                    Quantité
                                                                    retournée:{" "}
                                                                    {
                                                                        item.quantiteRetournee
                                                                    }
                                                                </label>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Prix */}
                                            <div className="mb-3">
                                                <h5 className="text-xs sm:text-sm font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                                    Prix
                                                </h5>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs sm:text-sm">
                                                    <div className="flex items-center">
                                                        <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
                                                        <div>
                                                            <label className="block text-nexsaas-vanta-black dark:text-gray-300">
                                                                Prix de base:{" "}
                                                                {item.prixBase}{" "}
                                                                {item.devise}
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
                                                        <div>
                                                            <label className="block text-nexsaas-vanta-black dark:text-gray-300">
                                                                Prix négocié:{" "}
                                                                {
                                                                    item.prixNegocie
                                                                }{" "}
                                                                {item.devise}
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <div>
                                                            {getPriceComparison(
                                                                item.prixBase,
                                                                item.prixNegocie,
                                                                item.devise,
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
                                                        <div>
                                                            <label className="block text-nexsaas-vanta-black dark:text-gray-300">
                                                                Montant total:{" "}
                                                                {
                                                                    item.montantTotal
                                                                }{" "}
                                                                {item.devise}
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
                                                        <div>
                                                            <label className="block text-nexsaas-vanta-black dark:text-gray-300">
                                                                Montant
                                                                converti:{" "}
                                                                {
                                                                    item.montantTotalConverti
                                                                }{" "}
                                                                {
                                                                    item.deviseConvertion
                                                                }
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Autres informations */}
                                            <div>
                                                <h5 className="text-xs sm:text-sm font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                                    Autres informations
                                                </h5>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs sm:text-sm">
                                                    <div className="flex items-center">
                                                        <FileText className="w-5 h-5 text-gray-400 mr-2" />
                                                        <div>
                                                            <label className="block text-nexsaas-vanta-black dark:text-gray-300">
                                                                SKU: {item.sku}
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <FileText className="w-5 h-5 text-gray-400 mr-2" />
                                                        <div>
                                                            <label className="block text-nexsaas-vanta-black dark:text-gray-300">
                                                                Conditionnement:{" "}
                                                                {item.conditionnement ||
                                                                    "N/A"}
                                                            </label>
                                                        </div>
                                                    </div>
                                                    {item.reception
                                                        ?.dateReception && (
                                                        <div className="flex items-center">
                                                            <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                                                            <div>
                                                                <label className="block text-nexsaas-vanta-black dark:text-gray-300">
                                                                    Date de
                                                                    réception:{" "}
                                                                    {
                                                                        item.reception?.dateReception.split(
                                                                            "T",
                                                                        )[0]
                                                                    }
                                                                </label>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {item.reception
                                                        ?.commentaireReception && (
                                                        <div className="flex items-center">
                                                            <FileText className="w-5 h-5 text-gray-400 mr-2" />
                                                            <div>
                                                                <label className="block text-nexsaas-vanta-black dark:text-gray-300">
                                                                    Commentaire
                                                                    réception:{" "}
                                                                    {
                                                                        item
                                                                            .reception
                                                                            ?.commentaireReception
                                                                    }
                                                                </label>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {item.dateRetour && (
                                                        <div className="flex items-center">
                                                            <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                                                            <div>
                                                                <label className="block text-nexsaas-vanta-black dark:text-gray-300">
                                                                    Date de
                                                                    retour:{" "}
                                                                    {
                                                                        item.dateRetour.split(
                                                                            "T",
                                                                        )[0]
                                                                    }
                                                                </label>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {item.motifRetour && (
                                                        <div className="flex items-center">
                                                            <FileText className="w-5 h-5 text-gray-400 mr-2" />
                                                            <div>
                                                                <label className="block text-nexsaas-vanta-black dark:text-gray-300">
                                                                    Motif de
                                                                    retour:{" "}
                                                                    {
                                                                        item.motifRetour
                                                                    }
                                                                </label>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {item.statutRetour && (
                                                        <div className="flex items-center">
                                                            <FileText className="w-5 h-5 text-gray-400 mr-2" />
                                                            <div>
                                                                <label className="block text-nexsaas-vanta-black dark:text-gray-300">
                                                                    Statut de
                                                                    retour:{" "}
                                                                    {
                                                                        item.statutRetour
                                                                    }
                                                                </label>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Notes */}
                                {selectedOrder.notes && (
                                    <div>
                                        <h3 className="text-sm sm:text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-3 sm:mb-4">
                                            Notes
                                        </h3>
                                        <p className="text-nexsaas-vanta-black dark:text-gray-300 bg-nexsaas-light-gray dark:bg-gray-700 rounded-lg p-3 text-xs sm:text-base">
                                            {selectedOrder.notes}
                                        </p>
                                    </div>
                                )}

                                {/* Demandes de retour */}
                                {returnRequests.filter(
                                    (ret) => ret.orderId === selectedOrder.id,
                                ).length > 0 && (
                                    <div>
                                        <h3 className="text-sm sm:text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-3 sm:mb-4">
                                            Demandes de retour
                                        </h3>
                                        {returnRequests
                                            .filter(
                                                (ret) =>
                                                    ret.orderId ===
                                                    selectedOrder.id,
                                            )
                                            .map((ret) => (
                                                <div
                                                    key={ret.id}
                                                    className="border border-nexsaas-light-gray dark:border-gray-600 rounded-lg p-3 mb-3"
                                                >
                                                    <div className="flex justify-between items-center mb-2 sm:mb-3">
                                                        <h4 className="font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white text-sm sm:text-base">
                                                            Retour {ret.id}
                                                        </h4>
                                                        <span
                                                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                                ret.status ===
                                                                "pending"
                                                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                                                                    : ret.status ===
                                                                      "approved"
                                                                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                                                    : ret.status ===
                                                                      "rejected"
                                                                    ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                                                    : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                                            }`}
                                                        >
                                                            {ret.status ===
                                                            "pending" ? (
                                                                <Clock className="w-4 h-4 mr-1" />
                                                            ) : ret.status ===
                                                              "approved" ? (
                                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                            ) : ret.status ===
                                                              "rejected" ? (
                                                                <X className="w-4 h-4 mr-1" />
                                                            ) : (
                                                                <Package className="w-4 h-4 mr-1" />
                                                            )}
                                                            <span className="capitalize">
                                                                {ret.status}
                                                            </span>
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
                                                        <div className="flex items-center">
                                                            <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                                                            <div>
                                                                <label className="block text-nexsaas-vanta-black dark:text-gray-300">
                                                                    Date de la
                                                                    demande:{" "}
                                                                    {
                                                                        ret.requestDate
                                                                    }
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <FileText className="w-5 h-5 text-gray-400 mr-2" />
                                                            <div>
                                                                <label className="block text-nexsaas-vanta-black dark:text-gray-300">
                                                                    Motif:{" "}
                                                                    {ret.reason}
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3">
                                                        <h5 className="text-xs sm:text-sm font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                                            Articles retournés
                                                        </h5>
                                                        {ret.items.map(
                                                            (
                                                                returnItem,
                                                                index,
                                                            ) => {
                                                                const item =
                                                                    selectedOrder
                                                                        .items[
                                                                        parseInt(
                                                                            returnItem.itemId,
                                                                        )
                                                                    ];
                                                                if (!item)
                                                                    return null;
                                                                return (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="text-xs sm:text-sm text-nexsaas-vanta-black dark:text-gray-300"
                                                                    >
                                                                        <p>
                                                                            {
                                                                                item
                                                                                    .produit
                                                                                    .nom
                                                                            }{" "}
                                                                            -
                                                                            Quantité:{" "}
                                                                            {
                                                                                returnItem.quantity
                                                                            }
                                                                            ,
                                                                            Motif:{" "}
                                                                            {
                                                                                returnItem.reason
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                );
                                                            },
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}

                                <div className="flex justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setShowDetailModal(false)
                                        }
                                    >
                                        Fermer
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

export default SupplyPage;
