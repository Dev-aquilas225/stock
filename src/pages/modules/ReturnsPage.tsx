import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
    RotateCcw,
    Eye,
    CheckCircle,
    XCircle,
    RefreshCw,
    ArrowLeft,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import {
    getRetours,
    updateRetourStatut,
    RetourFournisseur,
    StatutRetour,
} from "../../api/retourFournisseurApi";
import axiosClient from "../../api/axiosClient";

// -----------------------------
// Interfaces locales
// -----------------------------
interface ReturnKPI {
    title: string;
    value: string;
}

interface ReturnRequest {
    id: string;
    orderId: string;
    reference: string;
    quantity: number;
    reason: string;
    status: StatutRetour;
    createdAt: string;
}

const ReturnsPage: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [dateRange, setDateRange] = useState("30d");
    const [statusFilter, setStatusFilter] = useState<"all" | StatutRetour>("all");
    const [kpis, setKpis] = useState<ReturnKPI[]>([]);
    const [returns, setReturns] = useState<ReturnRequest[]>([]);
    const [loading, setLoading] = useState(true);

    // -----------------------------
    // Charger les retours + KPIs
    // -----------------------------
    const fetchReturnsData = async () => {
        if (!user) {
            showToast({
                type: "error",
                title: "Erreur",
                message: "Vous devez être connecté pour voir les retours",
                duration: 4000,
            });
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem("token");

            // KPIs
            const kpiRes = await axiosClient.get(
                `/retours-fournisseurs/kpis?dateRange=${dateRange}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setKpis(kpiRes.data || []);

            // Retours
            const retoursData: RetourFournisseur[] = await getRetours({
                statut: statusFilter !== "all" ? statusFilter : undefined,
            });

            const mappedReturns: ReturnRequest[] = retoursData.map((ret) => ({
                id: ret.id.toString(),
                orderId: ret.commande.id.toString(),
                reference: ret.commande.reference,
                quantity: ret.produits.reduce((sum, p) => sum + p.quantite, 0),
                reason: ret.motif,
                status: ret.statut,
                createdAt: new Date(ret.creeLe).toLocaleDateString(),
            }));

            setReturns(mappedReturns);
        } catch (error) {
            console.error("Erreur lors du chargement des retours", error);
            showToast({
                type: "error",
                title: "Erreur",
                message: "Impossible de charger les données de retours",
                duration: 4000,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReturnsData();
    }, [dateRange, statusFilter]);

    // -----------------------------
    // Actions
    // -----------------------------
    const handleApproveReturn = async (returnId: string) => {
        if (!user) return;
        try {
            await updateRetourStatut(Number(returnId), { statut: StatutRetour.APPROUVE });
            setReturns((prev) =>
                prev.map((r) => (r.id === returnId ? { ...r, status: StatutRetour.APPROUVE } : r))
            );
            showToast({
                type: "success",
                title: "Retour approuvé",
                message: "Le retour a été approuvé avec succès",
                duration: 4000,
            });
        } catch {
            showToast({
                type: "error",
                title: "Erreur",
                message: "Impossible d’approuver le retour",
                duration: 4000,
            });
        }
    };

    const handleRejectReturn = async (returnId: string) => {
        if (!user) return;
        try {
            await updateRetourStatut(Number(returnId), { statut: StatutRetour.REFUSE });
            setReturns((prev) =>
                prev.map((r) => (r.id === returnId ? { ...r, status: StatutRetour.REFUSE } : r))
            );
            showToast({
                type: "success",
                title: "Retour rejeté",
                message: "Le retour a été rejeté avec succès",
                duration: 4000,
            });
        } catch {
            showToast({
                type: "error",
                title: "Erreur",
                message: "Impossible de rejeter le retour",
                duration: 4000,
            });
        }
    };

    // -----------------------------
    // Helpers
    // -----------------------------
    const getStatusLabel = (status: StatutRetour) => {
        switch (status) {
            case StatutRetour.EN_ATTENTE:
                return "En attente";
            case StatutRetour.APPROUVE:
                return "Approuvé";
            case StatutRetour.REFUSE:
                return "Rejeté";
            default:
                return status;
        }
    };

    const getStatusColor = (status: StatutRetour) => {
        switch (status) {
            case StatutRetour.EN_ATTENTE:
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
            case StatutRetour.APPROUVE:
                return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
            case StatutRetour.REFUSE:
                return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
        }
    };

    // -----------------------------
    // Render
    // -----------------------------
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
                        <div className="p-3 bg-yellow-500 rounded-lg mr-4">
                            <RotateCcw className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                Retours Approvisionnements
                            </h1>
                            <p className="text-nexsaas-vanta-black dark:text-gray-300">
                                Gestion des retours de commandes fournisseurs
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Filtres */}
                <Card className="mb-8">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Période</label>
                                <select
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value)}
                                    className="px-4 py-2 border rounded-lg"
                                >
                                    <option value="7d">7 derniers jours</option>
                                    <option value="30d">30 derniers jours</option>
                                    <option value="90d">3 derniers mois</option>
                                    <option value="1y">12 derniers mois</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Statut</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as any)}
                                    className="px-4 py-2 border rounded-lg"
                                >
                                    <option value="all">Tous</option>
                                    <option value={StatutRetour.EN_ATTENTE}>En attente</option>
                                    <option value={StatutRetour.APPROUVE}>Approuvé</option>
                                    <option value={StatutRetour.REFUSE}>Rejeté</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={fetchReturnsData}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Actualiser
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* KPIs */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                >
                    {kpis.map((kpi, index) => (
                        <motion.div
                            key={kpi.title}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                        >
                            <Card className="text-center">
                                <h3 className="text-2xl font-bold mb-1">{kpi.value}</h3>
                                <p className="text-sm">{kpi.title}</p>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Liste des retours */}
                <Card>
                    <h2 className="text-xl font-bold mb-6">Demandes de Retour</h2>
                    {loading ? (
                        <div className="text-center py-8">Chargement des retours...</div>
                    ) : returns.length === 0 ? (
                        <div className="text-center py-8">Aucun retour trouvé</div>
                    ) : (
                        <div className="space-y-4">
                            {returns.map((ret) => (
                                <div key={ret.id} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center mb-2">
                                                <h3 className="text-lg font-semibold mr-3">
                                                    {ret.reference}
                                                </h3>
                                                <span
                                                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                        ret.status
                                                    )}`}
                                                >
                                                    {getStatusLabel(ret.status)}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-4 text-sm">
                                                <span>Commande: {ret.orderId}</span>
                                                <span>•</span>
                                                <span>Quantité: {ret.quantity}</span>
                                                <span>•</span>
                                                <span>Raison: {ret.reason}</span>
                                                <span>•</span>
                                                <span>Date: {ret.createdAt}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Link to={`/returns/${ret.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            {ret.status === StatutRetour.EN_ATTENTE && (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleApproveReturn(ret.id)}
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                        Approuver
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleRejectReturn(ret.id)}
                                                    >
                                                        <XCircle className="w-4 h-4 mr-2" />
                                                        Rejeter
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default ReturnsPage;
