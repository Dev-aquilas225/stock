import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
    Package,
    Plus,
    Search,
    Eye,
    Edit,
    Trash2,
    CheckCircle,
    Clock,
    AlertCircle,
    ArrowLeft,
    Calendar,
    Building,
    Truck,
    RotateCcw,
    Check,
    X,
} from "lucide-react";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import Input from "../../components/UI/Input";
import { useToast } from "../../contexts/ToastContext";
import { useActivity } from "../../contexts/ActivityContext";
import { useAuth } from "../../contexts/AuthContext";
import { useCommandes, Commande } from "../../hooks/useCommandes";
import { useFournisseurs, Fournisseur } from "../../hooks/useFournisseur";
import {
    addCommande,
    updateCommandeStatus,
    modifierProduitReception,
    UpdateProduitReceptionDto,
} from "../../api/commandeApi";
import { Produit } from "../../api/fournisseurApi";

// Interfaces
export enum StatutCommande {
    BROUILLON = "brouillon",
    VALIDEE = "validée",
    ENVOYEE = "envoyée",
    REÇUE = "reçue",
    EN_ATTENTE = "en_attente",

    CLOTUREE = "clôturée",
}

interface OrderItem {
    id: string;
    name: string;
    quantityOrdered: number;
    quantityReceived: number;
    unitPrice: number;
    status: "pending" | "partial" | "received";
}

interface Order {
    id: string;
    supplier: string;
    items: OrderItem[];
    totalAmount: number;
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

interface FormProduit {
    produitId: string;
    prixUnitaire: string;
    quantite: string;
    conditionnement: string;
}

const SupplyPage: React.FC = () => {
    const {
        commandes,
        loading: commandesLoading,
        error: commandesError,
    } = useCommandes();
    const {
        fournisseurs,
        loading: fournisseursLoading,
        error: fournisseursError,
    } = useFournisseurs();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { logActivity } = useActivity();
    const [orders, setOrders] = useState<Order[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [showReceiveModal, setShowReceiveModal] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
    const [selectedFournisseur, setSelectedFournisseur] =
        useState<Fournisseur | null>(null);
    const [formData, setFormData] = useState({
        fournisseurId: "",
        dateLivraisonEstimee: "",
        note: "",
        produits: [
            {
                produitId: "",
                prixUnitaire: "",
                quantite: "",
                conditionnement: "",
            } as FormProduit,
        ],
    });

    const [receiveData, setReceiveData] = useState<{
        [key: string]: {
            received: number;
            conditionnement?: string;
            remarques?: string;
        };
    }>({});
    const [returnData, setReturnData] = useState({
        reason: "",
        items: [] as { itemId: string; quantity: number; reason: string }[],
    });

    // Map Commande to Order
    useEffect(() => {
        if (commandes.length > 0) {
            const mappedOrders: Order[] = commandes.map(
                (commande: Commande) => ({
                    id: commande.reference,
                    supplier: commande.fournisseur.nom,
                    items: commande.produits.map((produit) => ({
                        id: produit.sku,
                        name: produit.produit.nomProduit,
                        quantityOrdered: produit.quantite,
                        quantityReceived: commande.reception?.produits.find(
                            (rp) =>
                                rp.conditionnement === produit.conditionnement,
                        )?.quantiteReçue
                            ? parseInt(
                                  commande.reception?.produits.find(
                                      (rp) =>
                                          rp.conditionnement ===
                                          produit.conditionnement,
                                  )?.quantiteReçue || "0",
                              )
                            : 0,
                        unitPrice: parseFloat(produit.prixNegocie),
                        status: commande.reception?.produits.every(
                            (rp) =>
                                parseInt(rp.quantiteReçue) >= produit.quantite,
                        )
                            ? "received"
                            : commande.reception
                            ? "partial"
                            : "pending",
                    })),
                    totalAmount: commande.produits.reduce(
                        (sum, produit) =>
                            sum +
                            parseFloat(produit.prixNegocie) * produit.quantite,
                        0,
                    ),
                    status: commande.statut as StatutCommande,
                    orderDate: commande.creeLe.split("T")[0],
                    deliveryDate: commande.dateLivraisonEstimee.split("T")[0],
                    receivedDate: commande.reception?.creeLe.split("T")[0],
                    notes: commande.note,
                }),
            );
            setOrders(mappedOrders);

            // Map Retour to ReturnRequest
            const mappedReturns: ReturnRequest[] = commandes
                .filter((c) => c.retour)
                .map((commande) => ({
                    id: commande.retour!.id.toString(),
                    orderId: commande.reference,
                    items: commande.retour!.produits.map((rp) => ({
                        itemId:
                            commande.produits.find(
                                (p) =>
                                    p.conditionnement ===
                                    rp.receptionProduit.conditionnement,
                            )?.sku || "",
                        quantity: rp.quantite,
                        reason: rp.raisonRetour,
                    })),
                    status: mapRetourStatus(commande.retour!.statut),
                    requestDate: commande.retour!.creeLe.split("T")[0],
                    reason: commande.retour!.motif,
                }));
            setReturnRequests(mappedReturns);
        }
    }, [commandes]);

    // Update selectedFournisseur when fournisseurId changes
    useEffect(() => {
        if (formData.fournisseurId) {
            const fournisseur = fournisseurs.find(
                (f) => f.id === parseInt(formData.fournisseurId),
            );
            setSelectedFournisseur(fournisseur || null);
            // Reset produits to prevent invalid selections
            setFormData((prev) => ({
                ...prev,
                produits: [
                    {
                        produitId: "",
                        prixUnitaire: "",
                        quantite: "",
                        conditionnement: "",
                    },
                ],
            }));
        } else {
            setSelectedFournisseur(null);
        }
    }, [formData.fournisseurId, fournisseurs]);

    // Map retour.statut to ReturnRequest.status
    const mapRetourStatus = (statut: string): ReturnRequest["status"] => {
        switch (statut) {
            case "en_attente":
                return "pending";
            case "approuve":
                return "approved";
            case "rejete":
                return "rejected";
            case "traite":
                return "processed";
            default:
                return "pending";
        }
    };

    // Map StatutCommande to display label
    const getStatusLabel = (status: StatutCommande): string => {
        switch (status) {
            case StatutCommande.BROUILLON:
                return "Brouillon";
            case StatutCommande.VALIDEE:
                return "Validée";
            case StatutCommande.ENVOYEE:
                return "Envoyée";
            case StatutCommande.EN_ATTENTE:
                return "En attente";
            case StatutCommande.REÇUE:
                return "Reçue";
            case StatutCommande.CLOTUREE:
                return "Clôturée";
            default:
                return "Inconnu";
        }
    };

    const getReturnStatusLabel = (status: ReturnRequest["status"]): string => {
        switch (status) {
            case "pending":
                return "En attente";
            case "approved":
                return "Approuvé";
            case "rejected":
                return "Rejeté";
            case "processed":
                return "Traité";
            default:
                return "Inconnu";
        }
    };

    const getReturnStatusColor = (status: ReturnRequest["status"]) => {
        switch (status) {
            case "pending":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
            case "approved":
                return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
            case "rejected":
                return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
            case "processed":
                return "bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
        }
    };

    const getStatusColor = (status: StatutCommande) => {
        switch (status) {
            case StatutCommande.BROUILLON:
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
            case StatutCommande.VALIDEE:
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
            case StatutCommande.ENVOYEE:
                return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
            case StatutCommande.EN_ATTENTE:
                return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
            case StatutCommande.REÇUE:
                return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
            case StatutCommande.CLOTUREE:
                return "bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400";
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
            case StatutCommande.ENVOYEE:
                return <Truck className="w-4 h-4" />;
            case StatutCommande.EN_ATTENTE:
                return <Package className="w-4 h-4" />;
            case StatutCommande.REÇUE:
                return <CheckCircle className="w-4 h-4" />;
            case StatutCommande.CLOTUREE:
                return <Check className="w-4 h-4" />;
            default:
                return <AlertCircle className="w-4 h-4" />;
        }
    };

    // Get available products for a specific product dropdown, excluding already selected products
    const getAvailableProducts = (currentIndex: number): Produit[] => {
        if (!selectedFournisseur || !selectedFournisseur.produits) return [];
        const selectedProductIds = formData.produits
            .filter((_, i) => i !== currentIndex)
            .map((p) => p.produitId)
            .filter((id) => id !== "");
        return selectedFournisseur.produits.filter(
            (prod) => !selectedProductIds.includes(prod.id.toString()),
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.fournisseurId || !formData.dateLivraisonEstimee) {
            showToast({
                type: "error",
                title: "Erreur",
                message:
                    "Veuillez sélectionner un fournisseur et une date de livraison.",
                duration: 5000,
            });
            return;
        }

        if (!selectedFournisseur || selectedFournisseur.produits.length === 0) {
            showToast({
                type: "error",
                title: "Erreur",
                message: "Aucun produit disponible pour ce fournisseur.",
                duration: 5000,
            });
            return;
        }

        if (
            formData.produits.length === 0 ||
            formData.produits.some(
                (p) =>
                    !p.produitId ||
                    !p.prixUnitaire ||
                    !p.quantite ||
                    !p.conditionnement,
            ) ||
            formData.produits.some(
                (p) =>
                    !selectedFournisseur.produits.some(
                        (prod) => prod.id === parseInt(p.produitId),
                    ),
            )
        ) {
            showToast({
                type: "error",
                title: "Erreur",
                message:
                    "Veuillez remplir tous les champs des produits correctement.",
                duration: 5000,
            });
            return;
        }

        try {
            const commandeData = {
                fournisseurId: parseInt(formData.fournisseurId),
                dateLivraisonEstimee: formData.dateLivraisonEstimee,
                note: formData.note,
                statut: StatutCommande.BROUILLON,
                produits: formData.produits.map((p) => ({
                    produitId: parseInt(p.produitId),
                    prixUnitaire: parseFloat(p.prixUnitaire),
                    quantite: parseInt(p.quantite),
                    conditionnement: p.conditionnement,
                })),
            };

            const res = await addCommande(commandeData);
            const newOrder: Order = {
                id: res.reference,
                supplier: res.fournisseur.nom,
                items: res.produits.map((produit) => ({
                    id: produit.sku,
                    name: produit.produit.nomProduit,
                    quantityOrdered: produit.quantite,
                    quantityReceived: 0,
                    quantityDefective: 0,
                    unitPrice: parseFloat(produit.prixNegocie),
                    status: "pending" as const,
                })),
                totalAmount: res.produits.reduce(
                    (sum, produit) =>
                        sum +
                        parseFloat(produit.prixNegocie) * produit.quantite,
                    0,
                ),
                status: res.statut as StatutCommande,
                orderDate: res.creeLe.split("T")[0],
                deliveryDate: res.dateLivraisonEstimee.split("T")[0],
                notes: res.note,
            };

            setOrders((prev) => [newOrder, ...prev]);

            logActivity({
                type: "create",
                module: "Approvisionnements",
                description: `Nouvelle commande créée: ${newOrder.id}`,
                userId: user?.id || "unknown",
                metadata: { orderId: newOrder.id, supplier: newOrder.supplier },
            });

            showToast({
                type: "success",
                title: "Commande créée",
                message: `La commande ${newOrder.id} a été créée avec succès`,
                duration: 3000,
            });

            setShowForm(false);
            setFormData({
                fournisseurId: "",
                dateLivraisonEstimee: "",
                note: "",
                produits: [
                    {
                        produitId: "",
                        prixUnitaire: "",
                        quantite: "",
                        conditionnement: "",
                    },
                ],
            });
            setSelectedFournisseur(null);
        } catch (err: any) {
            const errorMessage =
                err.message || "Erreur lors de la création de la commande";
            showToast({
                type: "error",
                title: "Erreur",
                message: errorMessage,
                duration: 5000,
            });
        }
    };

    const addProduct = () => {
        setFormData((prev) => ({
            ...prev,
            produits: [
                ...prev.produits,
                {
                    produitId: "",
                    prixUnitaire: "",
                    quantite: "",
                    conditionnement: "",
                },
            ],
        }));
    };

    const removeProduct = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            produits: prev.produits.filter((_, i) => i !== index),
        }));
    };

    const updateProduct = (
        index: number,
        field: keyof FormProduit,
        value: string,
    ) => {
        setFormData((prev) => ({
            ...prev,
            produits: prev.produits.map((p, i) =>
                i === index ? { ...p, [field]: value } : p,
            ),
        }));
    };

    // Auto-populate prixUnitaire and conditionnement when produitId changes
    const handleProductChange = (index: number, produitId: string) => {
        const produit = selectedFournisseur?.produits.find(
            (p) => p.id === parseInt(produitId),
        );
        if (produit) {
            setFormData((prev) => ({
                ...prev,
                produits: prev.produits.map((p, i) =>
                    i === index
                        ? {
                              ...p,
                              produitId,
                              prixUnitaire: produit.prixNegocie || "",
                              conditionnement: produit.conditionnement || "",
                          }
                        : p,
                ),
            }));
        }
    };

    const confirmReceiveDirectly = async (order: Order) => {
        try {
            const commande = commandes.find((c) => c.reference === order.id);
            if (!commande) {
                throw new Error("Commande non trouvée");
            }

            // Mettre à jour le statut de la commande à "Reçue"
            const updatedCommande = await updateCommandeStatus(
                commande.id,
                StatutCommande.REÇUE,
            );

            // Mettre à jour localement les données
            const updatedOrders = orders.map((o) => {
                if (o.id === order.id) {
                    const updatedItems = o.items.map((item) => ({
                        ...item,
                        quantityReceived: item.quantityOrdered, // On suppose que tout est reçu
                        status: "received",
                    }));
                    return {
                        ...o,
                        items: updatedItems,
                        status: StatutCommande.REÇUE,
                        receivedDate: new Date().toISOString().split("T")[0],
                    };
                }
                return o;
            });

            setOrders(updatedOrders);

            logActivity({
                type: "update",
                module: "Approvisionnements",
                description: `Réception confirmée pour la commande ${order.id}`,
                userId: user?.id || "unknown",
                metadata: { orderId: order.id },
            });

            showToast({
                type: "success",
                title: "Réception confirmée",
                message: `La réception de la commande ${order.id} a été enregistrée`,
                duration: 3000,
            });
        } catch (err: any) {
            showToast({
                type: "error",
                title: "Erreur",
                message:
                    err.message || "Erreur lors de la réception de la commande",
                duration: 5000,
            });
        }
    };

    const handleReturnRequest = (order: Order) => {
        setSelectedOrder(order);
        setReturnData({
            reason: "",
            items: order.items.map((item) => ({
                itemId: item.id,
                quantity: 0,
                reason: "",
            })),
        });
        setShowReturnModal(true);
    };

    const submitReturnRequest = async () => {
        if (
            !selectedOrder ||
            returnData.items.every((item) => item.quantity === 0) ||
            !returnData.reason
        ) {
            showToast({
                type: "error",
                title: "Erreur",
                message:
                    "Veuillez sélectionner au moins un article à retourner et indiquer un motif",
                duration: 5000,
            });
            return;
        }

        try {
            const commande = commandes.find(
                (c) => c.reference === selectedOrder.id,
            );
            if (!commande || !commande.reception) {
                throw new Error("Commande ou réception non trouvée");
            }

            const retourData: CreateRetourDto = {
                commandeId: commande.id,
                motif: returnData.reason,
                produits: returnData.items
                    .filter((item) => item.quantity > 0)
                    .map((item) => {
                        const receptionProduit =
                            commande.reception!.produits.find((rp) => {
                                const commandeProduit = commande.produits.find(
                                    (p) => p.sku === item.itemId,
                                );
                                return (
                                    commandeProduit &&
                                    rp.conditionnement ===
                                        commandeProduit.conditionnement
                                );
                            });
                        if (!receptionProduit) {
                            throw new Error(
                                `Produit de réception non trouvé pour l'article ${item.itemId}`,
                            );
                        }
                        return {
                            receptionProduitId: receptionProduit.id,
                            quantite: item.quantity,
                            raisonRetour: item.reason || returnData.reason,
                        };
                    }),
            };

            const newRetour = await createRetour(retourData);

            const newReturn: ReturnRequest = {
                id: newRetour.id.toString(),
                orderId: selectedOrder.id,
                items: newRetour.produits.map((rp) => ({
                    itemId:
                        commande.produits.find(
                            (p) =>
                                p.conditionnement ===
                                rp.receptionProduit.conditionnement,
                        )?.sku || "",
                    quantity: rp.quantite,
                    reason: rp.raisonRetour,
                })),
                status: mapRetourStatus(newRetour.statut),
                requestDate: newRetour.creeLe.split("T")[0],
                reason: newRetour.motif,
            };

            setReturnRequests((prev) => [newReturn, ...prev]);

            logActivity({
                type: "create",
                module: "Approvisionnements",
                description: `Demande de retour créée: ${newReturn.id}`,
                userId: user?.id || "unknown",
                metadata: { returnId: newReturn.id, orderId: selectedOrder.id },
            });

            showToast({
                type: "info",
                title: "Demande de retour envoyée",
                message: `La demande de retour ${newReturn.id} a été envoyée au fournisseur`,
                duration: 3000,
            });

            setShowReturnModal(false);
            setSelectedOrder(null);
            setReturnData({ reason: "", items: [] });
        } catch (err: any) {
            showToast({
                type: "error",
                title: "Erreur",
                message:
                    err.message ||
                    "Erreur lors de la création de la demande de retour",
                duration: 5000,
            });
        }
    };

    const updateOrderStatus = async (
        orderId: string,
        newStatus: StatutCommande,
    ) => {
        try {
            const commande = commandes.find((c) => c.reference === orderId);
            if (!commande) {
                throw new Error("Commande non trouvée");
            }

            const updatedCommande = await updateCommandeStatus(
                commande.id,
                newStatus,
            );

            setOrders((prev) =>
                prev.map((order) =>
                    order.id === orderId
                        ? {
                              ...order,
                              status: updatedCommande.statut as StatutCommande,
                          }
                        : order,
                ),
            );

            logActivity({
                type: "update",
                module: "Approvisionnements",
                description: `Statut de la commande ${orderId} mis à jour: ${getStatusLabel(
                    newStatus,
                )}`,
                userId: user?.id || "unknown",
                metadata: { orderId, newStatus },
            });

            showToast({
                type: "success",
                title: "Statut mis à jour",
                message: `Le statut de la commande ${orderId} a été mis à jour en ${getStatusLabel(
                    newStatus,
                )}`,
                duration: 3000,
            });
        } catch (err: any) {
            showToast({
                type: "error",
                title: "Erreur",
                message:
                    err.message || "Erreur lors de la mise à jour du statut",
                duration: 5000,
            });
        }
    };

    const handleEditReception = (order: Order) => {
        setSelectedOrder(order);
        const initialReceiveData: {
            [key: string]: {
                received: number;
                conditionnement?: string;
                remarques?: string;
            };
        } = {};
        order.items.forEach((item) => {
            initialReceiveData[item.id] = {
                received: item.quantityReceived,
                conditionnement: "", // Récupérer depuis les données de réception si disponible
                remarques: "",
            };
        });
        setReceiveData(initialReceiveData);
        setShowReceiveModal(true);
    };

    const filteredOrders = orders.filter((order) => {
        const matchesSearch =
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.supplier.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
            statusFilter === "all" || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (!user) {
        navigate("/login-client");
        return null;
    }

    if (commandesLoading || fournisseursLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                    Chargement...
                </div>
            </div>
        );
    }

    if (commandesError || fournisseursError) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-red-500">
                    Erreur: {commandesError || fournisseursError}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-16 bg-gradient-to-br from-nexsaas-pure-white to-nexsaas-light-gray dark:from-nexsaas-vanta-black dark:to-gray-900">
            <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-6 sm:mb-8"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center mb-4">
                        <Link to="/dashboard" className="mb-4 sm:mb-0 sm:mr-4">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Retour
                            </Button>
                        </Link>
                        <div className="flex items-center">
                            <div className="p-2 sm:p-3 bg-blue-500 rounded-lg mr-3 sm:mr-4">
                                <Package className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                    Gestion des Approvisionnements
                                </h1>
                                <p className="text-xs sm:text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                    Créez, suivez et gérez vos commandes
                                    fournisseurs
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8"
                >
                    <Card className="text-center p-3 sm:p-4">
                        <div className="p-2 sm:p-3 bg-yellow-500/10 rounded-lg inline-block mb-2 sm:mb-3">
                            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                            {
                                orders.filter(
                                    (o) =>
                                        o.status === StatutCommande.BROUILLON,
                                ).length
                            }
                        </h3>
                        <p className="text-xs sm:text-sm text-nexsaas-vanta-black dark:text-gray-300">
                            Brouillon
                        </p>
                    </Card>

                    <Card className="text-center p-3 sm:p-4">
                        <div className="p-2 sm:p-3 bg-blue-500/10 rounded-lg inline-block mb-2 sm:mb-3">
                            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                            {
                                orders.filter(
                                    (o) => o.status === StatutCommande.VALIDEE,
                                ).length
                            }
                        </h3>
                        <p className="text-xs sm:text-sm text-nexsaas-vanta-black dark:text-gray-300">
                            Validée
                        </p>
                    </Card>

                    <Card className="text-center p-3 sm:p-4">
                        <div className="p-2 sm:p-3 bg-purple-500/10 rounded-lg inline-block mb-2 sm:mb-3">
                            <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                            {
                                orders.filter(
                                    (o) => o.status === StatutCommande.ENVOYEE,
                                ).length
                            }
                        </h3>
                        <p className="text-xs sm:text-sm text-nexsaas-vanta-black dark:text-gray-300">
                            Envoyée
                        </p>
                    </Card>

                    <Card className="text-center p-3 sm:p-4">
                        <div className="p-2 sm:p-3 bg-orange-500/10 rounded-lg inline-block mb-2 sm:mb-3">
                            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                            {
                                orders.filter(
                                    (o) =>
                                        o.status === StatutCommande.EN_ATTENTE,
                                ).length
                            }
                        </h3>
                        <p className="text-xs sm:text-sm text-nexsaas-vanta-black dark:text-gray-300">
                            En attente
                        </p>
                    </Card>

                    <Card className="text-center p-3 sm:p-4">
                        <div className="p-2 sm:p-3 bg-red-500/10 rounded-lg inline-block mb-2 sm:mb-3">
                            <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                            {
                                returnRequests.filter(
                                    (r) => r.status === "pending",
                                ).length
                            }
                        </h3>
                        <p className="text-xs sm:text-sm text-nexsaas-vanta-black dark:text-gray-300">
                            Retours en cours
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
                    <Card className="p-3 sm:p-4">
                        <div className="flex flex-col gap-3 sm:gap-4">
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                <div className="relative flex-1 max-w-full sm:max-w-md">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Rechercher une commande..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none text-sm sm:text-base"
                                    />
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) =>
                                        setStatusFilter(e.target.value)
                                    }
                                    className="w-full sm:w-48 px-4 py-2 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none text-sm sm:text-base"
                                >
                                    <option value="all">
                                        Tous les statuts
                                    </option>
                                    <option value={StatutCommande.BROUILLON}>
                                        Brouillon
                                    </option>
                                    <option value={StatutCommande.VALIDEE}>
                                        Validée
                                    </option>
                                    <option value={StatutCommande.ENVOYEE}>
                                        Envoyée
                                    </option>
                                    <option value={StatutCommande.EN_ATTENTE}>
                                        En attente
                                    </option>
                                    <option value={StatutCommande.REÇUE}>
                                        Reçue
                                    </option>
                                    <option value={StatutCommande.CLOTUREE}>
                                        Clôturée
                                    </option>
                                </select>
                            </div>
                            <Button
                                onClick={() => setShowForm(true)}
                                className="w-full sm:w-auto"
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
                    {filteredOrders.length === 0 && (
                        <Card className="text-center py-6 sm:py-8">
                            <p className="text-nexsaas-vanta-black dark:text-gray-300 text-sm sm:text-base">
                                Aucune commande trouvée.
                            </p>
                        </Card>
                    )}
                    {filteredOrders.map((order, index) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                        >
                            <Card className="p-3 sm:p-4 hover:shadow-md transition-shadow">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:mb-2">
                                            <h3 className="text-base sm:text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mr-0 sm:mr-3 mb-2 sm:mb-0">
                                                {order.id}
                                            </h3>
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(
                                                    order.status,
                                                )}`}
                                            >
                                                {getStatusIcon(order.status)}
                                                <span className="ml-1 capitalize">
                                                    {getStatusLabel(
                                                        order.status,
                                                    )}
                                                </span>
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm mb-4">
                                            <div className="flex items-center">
                                                <Building className="w-4 h-4 text-gray-400 mr-2" />
                                                <span className="text-nexsaas-vanta-black dark:text-gray-300">
                                                    {order.supplier}
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
                                                    {order.items.length} article
                                                    {order.items.length > 1
                                                        ? "s"
                                                        : ""}
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-base sm:text-lg font-bold text-nexsaas-saas-green">
                                                    €
                                                    {order.totalAmount.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2 sm:space-y-3">
                                            {order.items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="bg-nexsaas-light-gray dark:bg-gray-700 rounded-lg p-3"
                                                >
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                                        <div>
                                                            <h4 className="font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white text-sm sm:text-base">
                                                                {item.name}
                                                            </h4>
                                                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs text-nexsaas-vanta-black dark:text-gray-300">
                                                                <span>
                                                                    Commandé:{" "}
                                                                    {
                                                                        item.quantityOrdered
                                                                    }
                                                                </span>
                                                                <span>
                                                                    Reçu:{" "}
                                                                    {
                                                                        item.quantityReceived
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-left sm:text-right mt-2 sm:mt-0">
                                                            <span className="font-bold text-nexsaas-saas-green text-sm sm:text-base">
                                                                €
                                                                {item.unitPrice}
                                                            </span>
                                                            <div className="text-xs text-nexsaas-vanta-black dark:text-gray-300">
                                                                par unité
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-col space-y-2 mt-4 lg:mt-0 lg:ml-4 lg:w-48">
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
                                            >
                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                Valider
                                            </Button>
                                        )}

                                        {order.status ===
                                            StatutCommande.VALIDEE && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    updateOrderStatus(
                                                        order.id,
                                                        StatutCommande.ENVOYEE,
                                                    )
                                                }
                                            >
                                                <Truck className="w-4 h-4 mr-1" />
                                                Marquer envoyée
                                            </Button>
                                        )}

                                        {(order.status ===
                                            StatutCommande.ENVOYEE ||
                                            order.status ===
                                                StatutCommande.EN_ATTENTE) && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    confirmReceiveDirectly(
                                                        order,
                                                    )
                                                }
                                            >
                                                <Package className="w-4 h-4 mr-1" />
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
                                                        updateOrderStatus(
                                                            order.id,
                                                            StatutCommande.CLOTUREE,
                                                        )
                                                    }
                                                >
                                                    <Check className="w-4 h-4 mr-1" />
                                                    Clôturer
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleReturnRequest(
                                                            order,
                                                        )
                                                    }
                                                    className="text-red-500 hover:text-red-600"
                                                >
                                                    <RotateCcw className="w-4 h-4 mr-1" />
                                                    Demander retour
                                                </Button>
                                            </>
                                        )}

                                        <div className="flex space-x-2">
                                            <Button variant="ghost" size="sm">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="space-y-4 mt-8"
                >
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-4">
                        Demandes de Retour
                    </h2>
                    {returnRequests.length === 0 && (
                        <Card className="text-center py-6 sm:py-8">
                            <p className="text-nexsaas-vanta-black dark:text-gray-300 text-sm sm:text-base">
                                Aucune demande de retour trouvée.
                            </p>
                        </Card>
                    )}
                    {returnRequests.map((returnRequest, index) => (
                        <motion.div
                            key={returnRequest.id}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                        >
                            <Card className="p-3 sm:p-4 hover:shadow-md transition-shadow">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:mb-2">
                                            <h3 className="text-base sm:text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mr-0 sm:mr-3 mb-2 sm:mb-0">
                                                {returnRequest.id}
                                            </h3>
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-medium ${getReturnStatusColor(
                                                    returnRequest.status,
                                                )}`}
                                            >
                                                <RotateCcw className="w-4 h-4 mr-1" />
                                                <span className="capitalize">
                                                    {getReturnStatusLabel(
                                                        returnRequest.status,
                                                    )}
                                                </span>
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm mb-4">
                                            <div className="flex items-center">
                                                <Package className="w-4 h-4 text-gray-400 mr-2" />
                                                <span className="text-nexsaas-vanta-black dark:text-gray-300">
                                                    Commande:{" "}
                                                    {returnRequest.orderId}
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                                <span className="text-nexsaas-vanta-black dark:text-gray-300">
                                                    Date:{" "}
                                                    {returnRequest.requestDate}
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-nexsaas-vanta-black dark:text-gray-300">
                                                    Motif:{" "}
                                                    {returnRequest.reason}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2 sm:space-y-3">
                                            {returnRequest.items.map((item) => {
                                                const order = orders.find(
                                                    (o) =>
                                                        o.id ===
                                                        returnRequest.orderId,
                                                );
                                                const product =
                                                    order?.items.find(
                                                        (i) =>
                                                            i.id ===
                                                            item.itemId,
                                                    );
                                                return (
                                                    <div
                                                        key={item.itemId}
                                                        className="bg-nexsaas-light-gray dark:bg-gray-700 rounded-lg p-3"
                                                    >
                                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                                            <div>
                                                                <h4 className="font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white text-sm sm:text-base">
                                                                    {product?.name ||
                                                                        item.itemId}
                                                                </h4>
                                                                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs text-nexsaas-vanta-black dark:text-gray-300">
                                                                    <span>
                                                                        Quantité:{" "}
                                                                        {
                                                                            item.quantity
                                                                        }
                                                                    </span>
                                                                    <span>
                                                                        Motif:{" "}
                                                                        {
                                                                            item.reason
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex space-x-2 mt-4 lg:mt-0 lg:ml-4">
                                        <Button variant="ghost" size="sm">
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Form Modal */}
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50"
                        onClick={() => setShowForm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-nexsaas-pure-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6 w-full max-w-[95vw] sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-3 sm:mb-4 md:mb-6">
                                Nouvelle Commande Fournisseur
                            </h2>

                            <form
                                onSubmit={handleSubmit}
                                className="space-y-4 sm:space-y-6"
                            >
                                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-1 sm:mb-2">
                                            Fournisseur{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <select
                                            value={formData.fournisseurId}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    fournisseurId:
                                                        e.target.value,
                                                })
                                            }
                                            className="w-full px-3 sm:px-4 py-2 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none text-xs sm:text-sm"
                                            required
                                        >
                                            <option value="">
                                                Sélectionner un fournisseur
                                            </option>
                                            {fournisseurs.map((fournisseur) => (
                                                <option
                                                    key={fournisseur.id}
                                                    value={fournisseur.id}
                                                >
                                                    {fournisseur.nom}
                                                </option>
                                            ))}
                                        </select>
                                        {!formData.fournisseurId && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Veuillez sélectionner un
                                                fournisseur pour continuer.
                                            </p>
                                        )}
                                    </div>
                                    <Input
                                        label="Date de livraison estimée"
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
                                        disabled={!formData.fournisseurId}
                                        className="text-xs sm:text-sm"
                                    />
                                </div>

                                {selectedFournisseur &&
                                    selectedFournisseur.produits.length > 0 && (
                                        <div>
                                            <label className="block text-xs sm:text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-1 sm:mb-2">
                                                Produits{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </label>
                                            {formData.produits.map(
                                                (produit, index) => (
                                                    <div
                                                        key={index}
                                                        className="border border-nexsaas-light-gray dark:border-gray-600 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4"
                                                    >
                                                        <div className="flex justify-between items-center mb-2 sm:mb-3">
                                                            <h4 className="font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white text-xs sm:text-sm">
                                                                Produit{" "}
                                                                {index + 1}
                                                            </h4>
                                                            {formData.produits
                                                                .length > 1 && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        removeProduct(
                                                                            index,
                                                                        )
                                                                    }
                                                                    className="text-red-500 hover:text-red-600"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                        <div className="grid grid-cols-1 gap-3 sm:gap-4">
                                                            <div>
                                                                <label className="block text-xs sm:text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-1 sm:mb-2">
                                                                    Produit
                                                                </label>
                                                                <select
                                                                    value={
                                                                        produit.produitId
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        handleProductChange(
                                                                            index,
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="w-full px-3 sm:px-4 py-2 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none text-xs sm:text-sm"
                                                                    required
                                                                >
                                                                    <option value="">
                                                                        Sélectionner
                                                                        un
                                                                        produit
                                                                    </option>
                                                                    {getAvailableProducts(
                                                                        index,
                                                                    ).map(
                                                                        (
                                                                            prod,
                                                                        ) => (
                                                                            <option
                                                                                key={
                                                                                    prod.id
                                                                                }
                                                                                value={
                                                                                    prod.id
                                                                                }
                                                                            >
                                                                                {
                                                                                    prod.nomProduit
                                                                                }
                                                                            </option>
                                                                        ),
                                                                    )}
                                                                </select>
                                                            </div>
                                                            <Input
                                                                label="Prix unitaire (€)"
                                                                type="number"
                                                                step="0.01"
                                                                value={
                                                                    produit.prixUnitaire
                                                                }
                                                                onChange={(
                                                                    value,
                                                                ) =>
                                                                    updateProduct(
                                                                        index,
                                                                        "prixUnitaire",
                                                                        value,
                                                                    )
                                                                }
                                                                required
                                                                disabled={
                                                                    !produit.produitId
                                                                }
                                                                min="0"
                                                                className="text-xs sm:text-sm"
                                                            />
                                                            <Input
                                                                label="Quantité"
                                                                type="number"
                                                                value={
                                                                    produit.quantite
                                                                }
                                                                onChange={(
                                                                    value,
                                                                ) =>
                                                                    updateProduct(
                                                                        index,
                                                                        "quantite",
                                                                        value,
                                                                    )
                                                                }
                                                                required
                                                                disabled={
                                                                    !produit.produitId
                                                                }
                                                                min="1"
                                                                className="text-xs sm:text-sm"
                                                            />
                                                            <Input
                                                                label="Conditionnement"
                                                                value={
                                                                    produit.conditionnement
                                                                }
                                                                onChange={(
                                                                    value,
                                                                ) =>
                                                                    updateProduct(
                                                                        index,
                                                                        "conditionnement",
                                                                        value,
                                                                    )
                                                                }
                                                                placeholder="Ex: Carton de 10"
                                                                required
                                                                disabled={
                                                                    !produit.produitId
                                                                }
                                                                className="text-xs sm:text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={addProduct}
                                                disabled={
                                                    getAvailableProducts(
                                                        formData.produits
                                                            .length,
                                                    ).length === 0
                                                }
                                                className="w-full"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Ajouter un produit
                                            </Button>
                                        </div>
                                    )}

                                {selectedFournisseur &&
                                    selectedFournisseur.produits.length ===
                                        0 && (
                                        <p className="text-xs sm:text-sm text-red-500">
                                            Aucun produit disponible pour ce
                                            fournisseur.
                                        </p>
                                    )}

                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-1 sm:mb-2">
                                        Notes (optionnel)
                                    </label>
                                    <textarea
                                        value={formData.note}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                note: e.target.value,
                                            })
                                        }
                                        rows={3}
                                        className="w-full px-3 sm:px-4 py-2 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none text-xs sm:text-sm"
                                        placeholder="Informations complémentaires..."
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowForm(false)}
                                        className="w-full sm:w-auto"
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={
                                            !formData.fournisseurId ||
                                            !formData.dateLivraisonEstimee ||
                                            !selectedFournisseur ||
                                            selectedFournisseur.produits
                                                .length === 0 ||
                                            formData.produits.some(
                                                (p) =>
                                                    !p.produitId ||
                                                    !p.prixUnitaire ||
                                                    !p.quantite ||
                                                    !p.conditionnement,
                                            )
                                        }
                                        className="w-full sm:w-auto"
                                    >
                                        Créer la commande
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
                        className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50"
                        onClick={() => setShowReceiveModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-nexsaas-pure-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6 w-full max-w-[95vw] sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-3 sm:mb-4 md:mb-6">
                                {selectedOrder.status === StatutCommande.REÇUE
                                    ? `Modifier la Réception - ${selectedOrder.id}`
                                    : `Confirmer la Réception - ${selectedOrder.id}`}
                            </h2>

                            <div className="space-y-4 sm:space-y-6">
                                {selectedOrder.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="border border-nexsaas-light-gray dark:border-gray-600 rounded-lg p-3 sm:p-4"
                                    >
                                        <h3 className="font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-3 sm:mb-4 text-xs sm:text-sm">
                                            {item.name}
                                        </h3>

                                        <div className="grid grid-cols-1 gap-3 sm:gap-4">
                                            <div>
                                                <label className="block text-xs sm:text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-1 sm:mb-2">
                                                    Quantité commandée
                                                </label>
                                                <input
                                                    type="number"
                                                    value={item.quantityOrdered}
                                                    disabled
                                                    className="w-full px-3 sm:px-4 py-2 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-nexsaas-deep-blue dark:text-nexsaas-pure-white text-xs sm:text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs sm:text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-1 sm:mb-2">
                                                    Quantité reçue
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={item.quantityOrdered}
                                                    value={
                                                        receiveData[item.id]
                                                            ?.received || 0
                                                    }
                                                    onChange={(e) =>
                                                        setReceiveData(
                                                            (prev) => ({
                                                                ...prev,
                                                                [item.id]: {
                                                                    ...prev[
                                                                        item.id
                                                                    ],
                                                                    received:
                                                                        parseInt(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ) || 0,
                                                                },
                                                            }),
                                                        )
                                                    }
                                                    className="w-full px-3 sm:px-4 py-2 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none text-xs sm:text-sm"
                                                />
                                            </div>

                                            {selectedOrder.status ===
                                                StatutCommande.REÇUE && (
                                                <>
                                                    <div>
                                                        <label className="block text-xs sm:text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-1 sm:mb-2">
                                                            Conditionnement
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={
                                                                receiveData[
                                                                    item.id
                                                                ]
                                                                    ?.conditionnement ||
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                setReceiveData(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        [item.id]:
                                                                            {
                                                                                ...prev[
                                                                                    item
                                                                                        .id
                                                                                ],
                                                                                conditionnement:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            },
                                                                    }),
                                                                )
                                                            }
                                                            className="w-full px-3 sm:px-4 py-2 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none text-xs sm:text-sm"
                                                            placeholder="Ex: Carton de 10"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs sm:text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-1 sm:mb-2">
                                                            Remarques
                                                        </label>
                                                        <textarea
                                                            value={
                                                                receiveData[
                                                                    item.id
                                                                ]?.remarques ||
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                setReceiveData(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        [item.id]:
                                                                            {
                                                                                ...prev[
                                                                                    item
                                                                                        .id
                                                                                ],
                                                                                remarques:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            },
                                                                    }),
                                                                )
                                                            }
                                                            rows={3}
                                                            className="w-full px-3 sm:px-4 py-2 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none text-xs sm:text-sm"
                                                            placeholder="Informations complémentaires..."
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setShowReceiveModal(false)
                                        }
                                        className="w-full sm:w-auto"
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        onClick={confirmReceive}
                                        className="w-full sm:w-auto"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        {selectedOrder.status ===
                                        StatutCommande.REÇUE
                                            ? "Enregistrer les modifications"
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
                        className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50"
                        onClick={() => setShowReturnModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-nexsaas-pure-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 md:p-6 w-full max-w-[95vw] sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-3 sm:mb-4 md:mb-6">
                                Demande de Retour - {selectedOrder.id}
                            </h2>

                            <div className="space-y-4 sm:space-y-6">
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-1 sm:mb-2">
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
                                        className="w-full px-3 sm:px-4 py-2 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none text-xs sm:text-sm"
                                        placeholder="Décrivez le motif du retour..."
                                    />
                                </div>

                                <div>
                                    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-3 sm:mb-4">
                                        Articles à retourner
                                    </h3>

                                    {selectedOrder.items.map((item, index) => (
                                        <div
                                            key={item.id}
                                            className="border border-nexsaas-light-gray dark:border-gray-600 rounded-lg p-3 sm:p-4 mb-3"
                                        >
                                            <div className="flex items-center justify-between mb-2 sm:mb-3">
                                                <h4 className="font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white text-xs sm:text-sm">
                                                    {item.name}
                                                </h4>
                                            </div>

                                            <div className="grid grid-cols-1 gap-3 sm:gap-4">
                                                <div>
                                                    <label className="block text-xs sm:text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-1 sm:mb-2">
                                                        Quantité à retourner
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={
                                                            item.quantityReceived
                                                        }
                                                        value={
                                                            returnData.items[
                                                                index
                                                            ]?.quantity || 0
                                                        }
                                                        onChange={(e) => {
                                                            const newItems = [
                                                                ...returnData.items,
                                                            ];
                                                            newItems[index] = {
                                                                ...newItems[
                                                                    index
                                                                ],
                                                                quantity:
                                                                    parseInt(
                                                                        e.target
                                                                            .value,
                                                                    ) || 0,
                                                            };
                                                            setReturnData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    items: newItems,
                                                                }),
                                                            );
                                                        }}
                                                        className="w-full px-3 sm:px-4 py-2 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none text-xs sm:text-sm"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs sm:text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-1 sm:mb-2">
                                                        Motif spécifique
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={
                                                            returnData.items[
                                                                index
                                                            ]?.reason || ""
                                                        }
                                                        onChange={(e) => {
                                                            const newItems = [
                                                                ...returnData.items,
                                                            ];
                                                            newItems[index] = {
                                                                ...newItems[
                                                                    index
                                                                ],
                                                                reason: e.target
                                                                    .value,
                                                            };
                                                            setReturnData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    items: newItems,
                                                                }),
                                                            );
                                                        }}
                                                        className="w-full px-3 sm:px-4 py-2 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none text-xs sm:text-sm"
                                                        placeholder="Ex: Produit endommagé, erreur de livraison..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setShowReturnModal(false)
                                        }
                                        className="w-full sm:w-auto"
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        onClick={submitReturnRequest}
                                        disabled={
                                            returnData.items.every(
                                                (item) => item.quantity === 0,
                                            ) || !returnData.reason
                                        }
                                        className="w-full sm:w-auto"
                                    >
                                        <RotateCcw className="w-4 h-4 mr-2" />
                                        Envoyer la demande
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
