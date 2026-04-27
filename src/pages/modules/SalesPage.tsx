import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
    TrendingUp,
    Plus,
    Search,
    Filter,
    Eye,
    Edit,
    ArrowLeft,
    ShoppingBag,
    CreditCard,
    Calendar,
    User,
    Percent,
    Gift,
    Loader,
    AlertTriangle,
    Printer,
} from "lucide-react";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import Input from "../../components/UI/Input";
import { useVentes } from "../../hooks/useVentes";
import { useToast } from "../../contexts/ToastContext";
import { Vente, getVentes } from "../../api/venteApi";
import axiosClient from "../../api/axiosClient";
import { promotionsApi, Promotion } from "../../api/promotionsApi";

const SalesPage = () => {
    const [showPromoForm, setShowPromoForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSale, setSelectedSale] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [promoData, setPromoData] = useState({
        name: "",
        type: "percentage",
        value: "",
        startDate: "",
        endDate: "",
        minAmount: "",
        description: "",
    });

    const { ventes, loading, stats, error } = useVentes();
    const { showToast } = useToast();
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [promoLoading, setPromoLoading] = useState(false);

    useEffect(() => {
        const fetchPromos = async () => {
            try {
                const res = await promotionsApi.getAll();
                setPromotions(Array.isArray(res.data) ? res.data : (res as any) || []);
            } catch {
                // silently fail
            }
        };
        fetchPromos();
    }, []);

    // Format sales data from API
    const formattedSales = ventes.map((vente) => ({
        id: `VTE-${vente.id.toString().padStart(3, "0")}`,
        customer:
            vente.nomClient && vente.prenomClient
                ? `${vente.prenomClient} ${vente.nomClient}`
                : vente.contactClient || "Client non enregistré",
        amount: parseFloat(vente.total),
        paid: parseFloat(vente.totalPaye) || 0,
        status: vente.total === vente.totalPaye ? "completed" : "pending",
        date: new Date(vente.dateVente).toLocaleDateString("fr-FR"),
        paymentMethod:
            vente.moyenPaiement === "AUTRE"
                ? vente.autreMoyenPaiement || "Autre"
                : vente.moyenPaiement || "Non spécifié",
        items: vente.items || [], // Assuming items are available in vente object
    }));

    const filteredSales = formattedSales.filter(
        (sale) =>
            sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sale.customer.toLowerCase().includes(searchTerm.toLowerCase()),
    );


    const getStatusColor = (status) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
            case "pending":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
            case "shipped":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
            case "active":
                return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
        }
    };

    const handlePromoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPromoLoading(true);
        try {
            const typeMap: Record<string, string> = {
                percentage: 'POURCENTAGE',
                fixed: 'MONTANT_FIXE',
                shipping: 'LIVRAISON_GRATUITE',
            };
            const created = await promotionsApi.create({
                nom: promoData.name,
                type: typeMap[promoData.type] || 'POURCENTAGE',
                valeur: parseFloat(promoData.value) || 0,
                minAchat: parseFloat(promoData.minAmount) || 0,
                dateDebut: promoData.startDate,
                dateFin: promoData.endDate,
                description: promoData.description,
                code: promoData.name.toUpperCase().replace(/\s+/g, '_').slice(0, 20),
            });
            setPromotions((prev) => [created, ...prev]);
            showToast({ type: 'success', title: 'Promotion créée', message: `${promoData.name} créée avec succès`, duration: 3000 });
            setShowPromoForm(false);
            setPromoData({ name: '', type: 'percentage', value: '', startDate: '', endDate: '', minAmount: '', description: '' });
        } catch {
            showToast({ type: 'error', title: 'Erreur', message: 'Impossible de créer la promotion', duration: 4000 });
        } finally {
            setPromoLoading(false);
        }
    };

    const handleViewDetails = (sale) => {
        setSelectedSale(sale);
        setShowDetailsModal(true);
    };

    const handlePrintReceipt = (sale) => {
        const due = sale.amount - sale.paid;
        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
            <html>
                <head>
                    <title>Facture ${sale.id}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; color: black; }
                        .receipt { max-width: 600px; margin: 0 auto; }
                        .header { text-align: left; margin-bottom: 20px; }
                        .title { background-color: #0000ff; color: white; padding: 5px 10px; display: inline-block; font-size: 1.5em; }
                        .company { font-weight: bold; font-size: 1.5em; margin-top: 10px; }
                        .table { width: 100%; border-top: 2px solid #0000ff; border-bottom: 2px solid #0000ff; border-collapse: collapse; margin-bottom: 100px; }
                        .table th, .table td { border: none; padding: 8px; text-align: left; }
                        .table th { font-weight: bold; }
                        .invoice-info { font-size: 0.9em; margin-bottom: 20px; }
                        .invoice-info p { margin: 2px 0; }
                        .total-section { border-top: 2px solid #0000ff; text-align: right; padding-top: 10px; }
                        .total-section p { margin: 5px 0; font-weight: bold; }
                        .merci { font-style: italic; font-size: 1.2em; margin-top: 20px; }
                        @media print { .no-print { display: none; } }
                    </style>
                </head>
                <body>
                    <div class="receipt">
                        <div class="header">
                            <div class="title">FACTURE</div>
                            <div class="company">FOREVER SAAS</div>
                        </div>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>PRODUIT</th>
                                    <th>QTE</th>
                                    <th>PRIX</th>
                                    <th>TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sale.items
                                    .map(
                                        (item) => `
                                    <tr>
                                        <td>${item.name || "Article"}</td>
                                        <td>${item.quantity || 1}</td>
                                        <td>${(item.price || 0).toLocaleString(
                                            "fr-FR",
                                        )} FCFA</td>
                                        <td>${(
                                            (item.price || 0) *
                                            (item.quantity || 1)
                                        ).toLocaleString("fr-FR")} FCFA</td>
                                    </tr>
                                `,
                                    )
                                    .join("")}
                            </tbody>
                        </table>
                        <div class="invoice-info">
                            <p>FACTURE N° ${sale.id}</p>
                            <p>Faite le ${sale.date}</p>
                            <p><strong>Client:</strong> ${sale.customer}</p>
                            <p><strong>Moyen de paiement:</strong> ${
                                sale.paymentMethod
                            }</p>
                            <p>PAYABLE À L'ORDRE DE</p>
                            <p>Henri Chaumond,</p>
                            <p>13, avenue du parc,</p>
                            <p>75002 Paris</p>
                            <p>COORDONNÉES</p>
                            <p>01 23 45 67 89</p>
                            <p>bonjour@sitevraimentsuper.fr</p>
                            <p>www.sitevraimentsuper.fr</p>
                            <p>INFORMATIONS BANCAIRES</p>
                            <p>Henri Chaumond,</p>
                            <p>Banque Populis</p>
                            <p>N° de compte : 4929 3100 057 5422</p>
                        </div>
                        <div class="total-section">
                            <p>Montant Total : ${sale.amount.toLocaleString(
                                "fr-FR",
                            )} FCFA</p>
                            <p>Montant DÛ : ${due.toLocaleString(
                                "fr-FR",
                            )} FCFA</p>
                        </div>
                        <div class="merci">Merci</div>
                    </div>
                    <button class="no-print" onclick="window.print()">Imprimer</button>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    useEffect(() => {
        if (error) {
            showToast({
                type: "error",
                message: error,
                title: "Erreur",
            });
        }
    }, [error, showToast]);

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
                        <div className="p-3 bg-purple-500 rounded-lg mr-4">
                            <TrendingUp className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                Gestion des Ventes
                            </h1>
                            <p className="text-nexsaas-vanta-black dark:text-gray-300">
                                Tunnel e-commerce et promotions
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
                        <div className="p-3 bg-green-500/10 rounded-lg inline-block mb-3">
                            <TrendingUp className="w-6 h-6 text-green-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                            {stats
                                ? `FCFA ${stats.ventesCeMois.toLocaleString(
                                      "fr-FR",
                                  )}`
                                : "FCFA 0"}
                        </h3>
                        <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                            Ventes ce mois
                        </p>
                    </Card>
                    <Card className="text-center">
                        <div className="p-3 bg-blue-500/10 rounded-lg inline-block mb-3">
                            <ShoppingBag className="w-6 h-6 text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                            {stats?.nombreCommandes || "0"}
                        </h3>
                        <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                            Commandes
                        </p>
                    </Card>
                    <Card className="text-center">
                        <div className="p-3 bg-purple-500/10 rounded-lg inline-block mb-3">
                            <Percent className="w-6 h-6 text-purple-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                            {stats?.tauxConversion?.toFixed(1) || "0"}%
                        </h3>
                        <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                            Taux conversion
                        </p>
                    </Card>
                    <Card className="text-center">
                        <div className="p-3 bg-orange-500/10 rounded-lg inline-block mb-3">
                            <Gift className="w-6 h-6 text-orange-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                            {promotions.filter(p => p.statut === 'ACTIVE').length}
                        </h3>
                        <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                            Promotions actives
                        </p>
                    </Card>
                </motion.div>

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mb-6"
                >
                    <div className="border-b border-nexsaas-light-gray dark:border-gray-700">
                        <nav className="-mb-px flex space-x-8">
                            <button className="border-b-2 border-nexsaas-saas-green py-2 px-1 text-sm font-medium text-nexsaas-saas-green">
                                Ventes récentes
                            </button>
                            <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-nexsaas-vanta-black dark:text-gray-300 hover:text-nexsaas-deep-blue dark:hover:text-nexsaas-pure-white">
                                Promotions
                            </button>
                        </nav>
                    </div>
                </motion.div>

                {/* Sales List */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="mb-8"
                >
                    <Card>
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher une vente..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full pl-10 pr-4 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                                />
                            </div>
                            <Button variant="outline" size="sm">
                                <Filter className="w-4 h-4 mr-2" />
                                Filtrer
                            </Button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-32">
                                <Loader className="w-8 h-8 animate-spin text-nexsaas-deep-blue" />
                                <span className="ml-3 text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                    Chargement des ventes...
                                </span>
                            </div>
                        ) : error ? (
                            <div className="bg-red-100 text-red-800 p-4 rounded-lg">
                                <AlertTriangle className="w-5 h-5 inline mr-2" />
                                {error}
                            </div>
                        ) : filteredSales.length === 0 ? (
                            <div className="text-center py-8">
                                <ShoppingBag className="w-12 h-12 mx-auto text-gray-400" />
                                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                                    Aucune vente trouvée
                                </h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    {searchTerm
                                        ? "Aucun résultat pour votre recherche"
                                        : "Aucune vente récente"}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredSales.map((sale, index) => (
                                    <motion.div
                                        key={sale.id}
                                        initial={{ opacity: 0, x: -30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            duration: 0.6,
                                            delay: index * 0.1,
                                        }}
                                        className="border border-nexsaas-light-gray dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center mb-2">
                                                    <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mr-3">
                                                        {sale.id}
                                                    </h3>
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                            sale.status,
                                                        )}`}
                                                    >
                                                        {sale.status}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                                    <div className="flex items-center">
                                                        <User className="w-4 h-4 text-gray-400 mr-2" />
                                                        <span className="text-nexsaas-vanta-black dark:text-gray-300">
                                                            {sale.customer}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <CreditCard className="w-4 h-4 text-gray-400 mr-2" />
                                                        <span className="text-nexsaas-vanta-black dark:text-gray-300">
                                                            {sale.paymentMethod}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                                        <span className="text-nexsaas-vanta-black dark:text-gray-300">
                                                            {sale.date}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-3">
                                                    <span className="text-lg font-bold text-nexsaas-saas-green">
                                                        FCFA
                                                        {sale.amount.toLocaleString(
                                                            "fr-FR",
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2 mt-4 lg:mt-0">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleViewDetails(sale)
                                                    }
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handlePrintReceipt(sale)
                                                    }
                                                >
                                                    <Printer className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </Card>
                </motion.div>

                {/* Sale Details Modal */}
                {showDetailsModal && selectedSale && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                        onClick={() => setShowDetailsModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-nexsaas-pure-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-6">
                                Détails de la Vente {selectedSale.id}
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        Informations Client
                                    </h3>
                                    <p className="text-nexsaas-vanta-black dark:text-gray-300">
                                        <strong>Nom:</strong>{" "}
                                        {selectedSale.customer}
                                    </p>
                                    <p className="text-nexsaas-vanta-black dark:text-gray-300">
                                        <strong>Moyen de paiement:</strong>{" "}
                                        {selectedSale.paymentMethod}
                                    </p>
                                    <p className="text-nexsaas-vanta-black dark:text-gray-300">
                                        <strong>Date:</strong>{" "}
                                        {selectedSale.date}
                                    </p>
                                    <p className="text-nexsaas-vanta-black dark:text-gray-300">
                                        <strong>Statut:</strong>{" "}
                                        {selectedSale.status}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        Articles
                                    </h3>
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-nexsaas-light-gray dark:bg-gray-700">
                                                <th className="p-2 text-left">
                                                    Article
                                                </th>
                                                <th className="p-2 text-right">
                                                    Quantité
                                                </th>
                                                <th className="p-2 text-right">
                                                    Prix unitaire
                                                </th>
                                                <th className="p-2 text-right">
                                                    Total
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedSale.items.map(
                                                (item, index) => (
                                                    <tr
                                                        key={index}
                                                        className="border-b border-nexsaas-light-gray dark:border-gray-600"
                                                    >
                                                        <td className="p-2">
                                                            {item.name ||
                                                                "Article"}
                                                        </td>
                                                        <td className="p-2 text-right">
                                                            {item.quantity || 1}
                                                        </td>
                                                        <td className="p-2 text-right">
                                                            FCFA
                                                            {(
                                                                item.price || 0
                                                            ).toLocaleString(
                                                                "fr-FR",
                                                            )}
                                                        </td>
                                                        <td className="p-2 text-right">
                                                            FCFA
                                                            {(
                                                                (item.price ||
                                                                    0) *
                                                                (item.quantity ||
                                                                    1)
                                                            ).toLocaleString(
                                                                "fr-FR",
                                                            )}
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-nexsaas-saas-green">
                                        Total: FCFA
                                        {selectedSale.amount.toLocaleString(
                                            "fr-FR",
                                        )}
                                    </p>
                                </div>
                                <div className="flex justify-end space-x-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setShowDetailsModal(false)
                                        }
                                    >
                                        Fermer
                                    </Button>
                                    <Button
                                        onClick={() =>
                                            handlePrintReceipt(selectedSale)
                                        }
                                    >
                                        Imprimer Reçu
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Promotions Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                >
                    <Card>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                Promotions actives
                            </h2>
                            <Button onClick={() => setShowPromoForm(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Nouvelle promotion
                            </Button>
                        </div>

                        {promotions.length === 0 && !promoLoading && (
                            <div className="text-center py-8 text-gray-400">
                                Aucune promotion — cliquez sur «Nouvelle promotion» pour en créer une
                            </div>
                        )}
                        <div className="space-y-4">
                            {promotions.map((promo, index) => (
                                <motion.div
                                    key={promo.id}
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                        duration: 0.6,
                                        delay: index * 0.1,
                                    }}
                                    className="border border-nexsaas-light-gray dark:border-gray-700 rounded-lg p-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center mb-2">
                                                <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mr-3">
                                                    {promo.nom}
                                                </h3>
                                                <span className="text-xs font-mono text-gray-400 mr-2">{promo.code}</span>
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        promo.statut === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                                        promo.statut === 'EXPIREE' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                                                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                                                    }`}
                                                >
                                                    {promo.statut}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-4 text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                                <span>
                                                    {promo.type === 'POURCENTAGE' ? `${promo.valeur}% de réduction` :
                                                     promo.type === 'MONTANT_FIXE' ? `${promo.valeur.toLocaleString('fr-FR')} FCFA` :
                                                     'Livraison gratuite'}
                                                </span>
                                                <span>•</span>
                                                <span>
                                                    {new Date(promo.dateDebut).toLocaleDateString('fr-FR')} — {new Date(promo.dateFin).toLocaleDateString('fr-FR')}
                                                </span>
                                                <span>•</span>
                                                <span>
                                                    {promo.usagesActuels} utilisation{promo.usagesActuels !== 1 ? 's' : ''}
                                                    {promo.maxUsages ? ` / ${promo.maxUsages}` : ''}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={async () => {
                                                    try {
                                                        const updated = await promotionsApi.toggle(promo.id);
                                                        setPromotions((prev) => prev.map((p) => p.id === promo.id ? updated : p));
                                                    } catch { /* ignore */ }
                                                }}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </Card>
                </motion.div>

                {/* Promotion Form Modal */}
                {showPromoForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                        onClick={() => setShowPromoForm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-nexsaas-pure-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-6">
                                Créer une Promotion
                            </h2>

                            <form
                                onSubmit={handlePromoSubmit}
                                className="space-y-6"
                            >
                                <Input
                                    label="Nom de la promotion"
                                    value={promoData.name}
                                    onChange={(value) =>
                                        setPromoData({
                                            ...promoData,
                                            name: value,
                                        })
                                    }
                                    required
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                            Type de promotion *
                                        </label>
                                        <select
                                            value={promoData.type}
                                            onChange={(e) =>
                                                setPromoData({
                                                    ...promoData,
                                                    type: e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                                        >
                                            <option value="percentage">
                                                Pourcentage
                                            </option>
                                            <option value="fixed">
                                                Montant fixe
                                            </option>
                                            <option value="shipping">
                                                Livraison gratuite
                                            </option>
                                        </select>
                                    </div>

                                    {promoData.type !== "shipping" && (
                                        <Input
                                            label={
                                                promoData.type === "percentage"
                                                    ? "Pourcentage (%)"
                                                    : "Montant (FCFA )"
                                            }
                                            type="number"
                                            value={promoData.value}
                                            onChange={(value) =>
                                                setPromoData({
                                                    ...promoData,
                                                    value: value,
                                                })
                                            }
                                            required
                                        />
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Date de début"
                                        type="date"
                                        value={promoData.startDate}
                                        onChange={(value) =>
                                            setPromoData({
                                                ...promoData,
                                                startDate: value,
                                            })
                                        }
                                        required
                                    />
                                    <Input
                                        label="Date de fin"
                                        type="date"
                                        value={promoData.endDate}
                                        onChange={(value) =>
                                            setPromoData({
                                                ...promoData,
                                                endDate: value,
                                            })
                                        }
                                        required
                                    />
                                </div>

                                <Input
                                    label="Montant minimum (FCFA )"
                                    type="number"
                                    step="0.01"
                                    value={promoData.minAmount}
                                    onChange={(value) =>
                                        setPromoData({
                                            ...promoData,
                                            minAmount: value,
                                        })
                                    }
                                    placeholder="Optionnel"
                                />

                                <div>
                                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={promoData.description}
                                        onChange={(e) =>
                                            setPromoData({
                                                ...promoData,
                                                description: e.target.value,
                                            })
                                        }
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                                        placeholder="Description de la promotion..."
                                    />
                                </div>

                                <div className="flex justify-end space-x-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowPromoForm(false)}
                                    >
                                        Annuler
                                    </Button>
                                    <Button type="submit">
                                        Créer la promotion
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

export default SalesPage;
