import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
    RotateCcw,
    RefreshCw,
    ArrowLeft,
    Package,
    CheckCircle,
    Truck,
    AlertCircle,
    X,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import { livraisonApi, Livraison } from "../../api/livraisonApi";

type StatutFilter =
    | "all"
    | "EN_ATTENTE"
    | "EN_COURS"
    | "LIVRE"
    | "RETOUR_DEMANDE"
    | "RETOURNE";

interface RetourModalState {
    open: boolean;
    livraison: Livraison | null;
    motifRetour: string;
    montantRemboursement: string;
    submitting: boolean;
}

const STATUT_LABELS: Record<string, string> = {
    EN_ATTENTE: "En attente",
    EN_COURS: "En cours",
    LIVRE: "Livré",
    ECHOUE: "Échoué",
    RETOUR_DEMANDE: "Retour demandé",
    RETOURNE: "Retourné",
    REMBOURSE: "Remboursé",
};

const STATUT_COLORS: Record<string, string> = {
    EN_ATTENTE:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    EN_COURS:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    LIVRE: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    ECHOUE: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    RETOUR_DEMANDE:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
    RETOURNE:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
    REMBOURSE:
        "bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400",
};

const ReturnsPage: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();

    const [dateRange, setDateRange] = useState("30d");
    const [statusFilter, setStatusFilter] = useState<StatutFilter>("all");
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState<{
        totalLivraisons: number;
        livrees: number;
        enCours: number;
        retours: number;
    }>({ totalLivraisons: 0, livrees: 0, enCours: 0, retours: 0 });

    const [livraisons, setLivraisons] = useState<Livraison[]>([]);
    const [totalCount, setTotalCount] = useState(0);

    const [modal, setModal] = useState<RetourModalState>({
        open: false,
        livraison: null,
        motifRetour: "",
        montantRemboursement: "",
        submitting: false,
    });

    const fetchData = useCallback(async () => {
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
            const [statsRes, livraisonsRes] = await Promise.all([
                livraisonApi.getStats(),
                livraisonApi.getAll({
                    statut:
                        statusFilter !== "all" ? statusFilter : undefined,
                }),
            ]);

            setStats({
                totalLivraisons:
                    statsRes.totalLivraisons ?? statsRes.total ?? 0,
                livrees: statsRes.livrees ?? statsRes.LIVRE ?? 0,
                enCours: statsRes.enCours ?? statsRes.EN_COURS ?? 0,
                retours:
                    statsRes.retours ??
                    (statsRes.RETOUR_DEMANDE ?? 0) +
                        (statsRes.RETOURNE ?? 0) ?? 0,
            });

            setLivraisons(livraisonsRes.data);
            setTotalCount(livraisonsRes.total);
        } catch (error) {
            console.error("Erreur lors du chargement des données", error);
            showToast({
                type: "error",
                title: "Erreur",
                message: "Impossible de charger les données de retours",
                duration: 4000,
            });
        } finally {
            setLoading(false);
        }
    }, [user, statusFilter, showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const openRetourModal = (livraison: Livraison) => {
        setModal({
            open: true,
            livraison,
            motifRetour: "",
            montantRemboursement: "",
            submitting: false,
        });
    };

    const closeModal = () => {
        setModal((prev) => ({ ...prev, open: false, livraison: null }));
    };

    const handleDemanderRetour = async () => {
        if (!modal.livraison || !modal.motifRetour.trim()) {
            showToast({
                type: "error",
                title: "Champ requis",
                message: "Le motif du retour est obligatoire",
                duration: 3000,
            });
            return;
        }

        setModal((prev) => ({ ...prev, submitting: true }));
        try {
            await livraisonApi.demanderRetour({
                commandeId: modal.livraison.commandeId,
                motifRetour: modal.motifRetour.trim(),
                montantRemboursement: modal.montantRemboursement
                    ? parseFloat(modal.montantRemboursement)
                    : undefined,
            });

            showToast({
                type: "success",
                title: "Retour demandé",
                message: `La demande de retour pour la commande ${modal.livraison.commandeId} a été enregistrée`,
                duration: 4000,
            });

            closeModal();
            fetchData();
        } catch (error) {
            console.error("Erreur lors de la demande de retour", error);
            showToast({
                type: "error",
                title: "Erreur",
                message: "Impossible de soumettre la demande de retour",
                duration: 4000,
            });
        } finally {
            setModal((prev) => ({ ...prev, submitting: false }));
        }
    };

    const kpis = [
        {
            title: "Total livraisons",
            value: stats.totalLivraisons,
            icon: Package,
            color: "bg-blue-500",
        },
        {
            title: "Livrées",
            value: stats.livrees,
            icon: CheckCircle,
            color: "bg-green-500",
        },
        {
            title: "En cours",
            value: stats.enCours,
            icon: Truck,
            color: "bg-yellow-500",
        },
        {
            title: "Retours",
            value: stats.retours,
            icon: AlertCircle,
            color: "bg-red-500",
        },
    ];

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

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
                                Retours Livraisons
                            </h1>
                            <p className="text-nexsaas-vanta-black dark:text-gray-300">
                                Gestion des retours de commandes clients
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-8"
                >
                    <Card>
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                        Période
                                    </label>
                                    <select
                                        value={dateRange}
                                        onChange={(e) =>
                                            setDateRange(e.target.value)
                                        }
                                        className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    >
                                        <option value="7d">
                                            7 derniers jours
                                        </option>
                                        <option value="30d">
                                            30 derniers jours
                                        </option>
                                        <option value="90d">
                                            3 derniers mois
                                        </option>
                                        <option value="1y">
                                            12 derniers mois
                                        </option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                        Statut
                                    </label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) =>
                                            setStatusFilter(
                                                e.target.value as StatutFilter,
                                            )
                                        }
                                        className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    >
                                        <option value="all">Tous</option>
                                        <option value="EN_ATTENTE">
                                            En attente
                                        </option>
                                        <option value="EN_COURS">
                                            En cours
                                        </option>
                                        <option value="LIVRE">Livré</option>
                                        <option value="RETOUR_DEMANDE">
                                            Retour demandé
                                        </option>
                                        <option value="RETOURNE">
                                            Retourné
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={fetchData}
                                    disabled={loading}
                                >
                                    <RefreshCw
                                        className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                                    />
                                    Actualiser
                                </Button>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* KPI Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                >
                    {kpis.map((kpi, index) => (
                        <motion.div
                            key={kpi.title}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                        >
                            <Card className="text-center">
                                <div
                                    className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${kpi.color} mb-3`}
                                >
                                    <kpi.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-1">
                                    {loading ? "—" : kpi.value}
                                </h3>
                                <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                    {kpi.title}
                                </p>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Livraisons List */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                >
                    <Card>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                Livraisons
                                {!loading && (
                                    <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                                        ({totalCount} résultat
                                        {totalCount !== 1 ? "s" : ""})
                                    </span>
                                )}
                            </h2>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <RefreshCw className="w-6 h-6 animate-spin text-yellow-500 mr-3" />
                                <span className="text-nexsaas-vanta-black dark:text-gray-300">
                                    Chargement des livraisons...
                                </span>
                            </div>
                        ) : livraisons.length === 0 ? (
                            <div className="text-center py-12">
                                <RotateCcw className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                <p className="text-nexsaas-vanta-black dark:text-gray-400">
                                    Aucune livraison trouvée
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {livraisons.map((livraison) => (
                                    <motion.div
                                        key={livraison.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-yellow-400 dark:hover:border-yellow-500 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center flex-wrap gap-2 mb-2">
                                                    <h3 className="text-base font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white truncate">
                                                        {livraison.clientNom}
                                                    </h3>
                                                    <span
                                                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${STATUT_COLORS[livraison.statut] ?? "bg-gray-100 text-gray-700"}`}
                                                    >
                                                        {STATUT_LABELS[
                                                            livraison.statut
                                                        ] ?? livraison.statut}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-nexsaas-vanta-black dark:text-gray-400">
                                                    <span>
                                                        Commande :{" "}
                                                        <span className="font-medium text-nexsaas-deep-blue dark:text-gray-200">
                                                            {
                                                                livraison.commandeId
                                                            }
                                                        </span>
                                                    </span>
                                                    {livraison.livreurNom && (
                                                        <span>
                                                            Livreur :{" "}
                                                            <span className="font-medium text-nexsaas-deep-blue dark:text-gray-200">
                                                                {
                                                                    livraison.livreurNom
                                                                }
                                                            </span>
                                                        </span>
                                                    )}
                                                    <span>
                                                        Date livraison :{" "}
                                                        <span className="font-medium text-nexsaas-deep-blue dark:text-gray-200">
                                                            {formatDate(
                                                                livraison.dateLivraison,
                                                            )}
                                                        </span>
                                                    </span>
                                                    {livraison.montantRemboursement >
                                                        0 && (
                                                        <span>
                                                            Remboursement :{" "}
                                                            <span className="font-medium text-teal-600 dark:text-teal-400">
                                                                {livraison.montantRemboursement.toLocaleString(
                                                                    "fr-FR",
                                                                    {
                                                                        style: "currency",
                                                                        currency:
                                                                            "EUR",
                                                                    },
                                                                )}
                                                            </span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {livraison.statut !== "RETOUR_DEMANDE" &&
                                                    livraison.statut !== "RETOURNE" &&
                                                    livraison.statut !== "REMBOURSE" && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                openRetourModal(
                                                                    livraison,
                                                                )
                                                            }
                                                        >
                                                            <RotateCcw className="w-4 h-4 mr-1" />
                                                            Demander retour
                                                        </Button>
                                                    )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </Card>
                </motion.div>
            </div>

            {/* Retour Modal */}
            <AnimatePresence>
                {modal.open && modal.livraison && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) closeModal();
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                                        <RotateCcw className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                        Demander un retour
                                    </h3>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                <p>
                                    Client :{" "}
                                    <span className="font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                        {modal.livraison.clientNom}
                                    </span>
                                </p>
                                <p>
                                    Commande :{" "}
                                    <span className="font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                        {modal.livraison.commandeId}
                                    </span>
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                        Motif du retour{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={modal.motifRetour}
                                        onChange={(e) =>
                                            setModal((prev) => ({
                                                ...prev,
                                                motifRetour: e.target.value,
                                            }))
                                        }
                                        rows={3}
                                        placeholder="Décrivez le motif du retour..."
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                        Montant remboursement (€)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={modal.montantRemboursement}
                                        onChange={(e) =>
                                            setModal((prev) => ({
                                                ...prev,
                                                montantRemboursement:
                                                    e.target.value,
                                            }))
                                        }
                                        placeholder="0.00"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={closeModal}
                                    disabled={modal.submitting}
                                    className="flex-1"
                                >
                                    Annuler
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleDemanderRetour}
                                    disabled={
                                        modal.submitting ||
                                        !modal.motifRetour.trim()
                                    }
                                    className="flex-1"
                                >
                                    {modal.submitting ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                            Envoi...
                                        </>
                                    ) : (
                                        <>
                                            <RotateCcw className="w-4 h-4 mr-2" />
                                            Confirmer le retour
                                        </>
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ReturnsPage;
