import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    RotateCcw,
    DollarSign,
    Package,
    AlertTriangle,
    Eye,
    CheckCircle,
    XCircle,
    Filter,
    RefreshCw,
    ArrowLeft,
    Save,
    X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import Card from '../../components/UI/Card';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';

interface ReturnKPI {
    title: string;
    value: string;
    change: string;
    isPositive: boolean;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}

interface ReturnRequest {
    id: string;
    orderId: string;
    supplier: string;
    product: string;
    quantity: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

const ReturnsPage: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [dateRange, setDateRange] = useState('30d');
    const [statusFilter, setStatusFilter] = useState('all');
    const [kpis, setKpis] = useState<ReturnKPI[]>([]);
    const [returns, setReturns] = useState<ReturnRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewReturnModal, setShowNewReturnModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
    const [newReturnForm, setNewReturnForm] = useState({
        orderId: '',
        supplier: '',
        product: '',
        quantity: 1,
        reason: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const mockKpis: ReturnKPI[] = [
        {
            title: 'Total Retours',
            value: '45',
            change: '+5.2%',
            isPositive: true,
            icon: RotateCcw,
            color: 'bg-yellow-500',
        },
        {
            title: 'Coût des Retours',
            value: '€2,340',
            change: '-3.1%',
            isPositive: false,
            icon: DollarSign,
            color: 'bg-red-500',
        },
        {
            title: 'Commandes Concernées',
            value: '28',
            change: '+10.0%',
            isPositive: true,
            icon: Package,
            color: 'bg-blue-500',
        },
        {
            title: 'Taux de Retour',
            value: '2.8%',
            change: '+0.5%',
            isPositive: true,
            icon: AlertTriangle,
            color: 'bg-orange-500',
        }
    ];

    const mockReturns: ReturnRequest[] = [
        {
            id: 'RET-001',
            orderId: 'ORD-123',
            supplier: 'TechSupply',
            product: 'MacBook Pro 14"',
            quantity: 2,
            reason: 'Produit défectueux',
            status: 'pending',
            createdAt: '2025-08-15'
        },
        {
            id: 'RET-002',
            orderId: 'ORD-124',
            supplier: 'ElectroDist',
            product: 'iPhone 15 Pro',
            quantity: 1,
            reason: 'Erreur de commande',
            status: 'approved',
            createdAt: '2025-08-14'
        },
        {
            id: 'RET-003',
            orderId: 'ORD-125',
            supplier: 'GadgetWorld',
            product: 'AirPods Pro',
            quantity: 3,
            reason: 'Non conforme',
            status: 'rejected',
            createdAt: '2025-08-13'
        }
    ];

    const fetchReturnsData = () => {
        setLoading(true);
        console.log('ReturnsPage: Simulating fetching returns data', { dateRange, statusFilter });

        // Simulate KPI data based on dateRange
        const filteredKpis = mockKpis.map(kpi => {
            let value = kpi.value;
            if (dateRange === '7d') {
                value = (parseFloat(kpi.value.replace(/[^0-9.]/g, '')) * 0.25).toFixed(0);
                value = kpi.title.includes('€') ? `€${value}` : value;
            } else if (dateRange === '90d') {
                value = (parseFloat(kpi.value.replace(/[^0-9.]/g, '')) * 1.5).toFixed(0);
                value = kpi.title.includes('€') ? `€${value}` : value;
            } else if (dateRange === '1y') {
                value = (parseFloat(kpi.value.replace(/[^0-9.]/g, '')) * 3).toFixed(0);
                value = kpi.title.includes('€') ? `€${value}` : value;
            }
            return { ...kpi, value };
        });

        // Filter returns by status
        const filteredReturns = statusFilter === 'all'
            ? mockReturns
            : mockReturns.filter(ret => ret.status === statusFilter);

        // Simulate date range filtering (basic: assume all mock data fits within date range)
        setKpis(filteredKpis);
        setReturns(filteredReturns);
        console.log('ReturnsPage: Data simulated', { kpis: filteredKpis, returns: filteredReturns });

        setTimeout(() => setLoading(false), 500); // Simulate network delay
    };

    useEffect(() => {
        fetchReturnsData();
    }, [dateRange, statusFilter]);

    const handleApproveReturn = (returnId: string) => {
        console.log('ReturnsPage: Simulating approving return', { returnId });
        setReturns(prevReturns =>
            prevReturns.map(ret =>
                ret.id === returnId ? { ...ret, status: 'approved' } : ret
            )
        );
        showToast({
            type: 'success',
            title: 'Retour approuvé',
            message: 'Le retour a été approuvé avec succès',
            duration: 4000
        });
    };

    const handleRejectReturn = (returnId: string) => {
        console.log('ReturnsPage: Simulating rejecting return', { returnId });
        setReturns(prevReturns =>
            prevReturns.map(ret =>
                ret.id === returnId ? { ...ret, status: 'rejected' } : ret
            )
        );
        showToast({
            type: 'success',
            title: 'Retour rejeté',
            message: 'Le retour a été rejeté avec succès',
            duration: 4000
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
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
                                Retours Approvisionnements
                            </h1>
                            <p className="text-nexsaas-vanta-black dark:text-gray-300">
                                Gestion des retours de commandes fournisseurs
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Controls */}
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
                                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                        Période
                                    </label>
                                    <select
                                        value={dateRange}
                                        onChange={(e) => setDateRange(e.target.value)}
                                        className="px-4 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                                    >
                                        <option value="7d">7 derniers jours</option>
                                        <option value="30d">30 derniers jours</option>
                                        <option value="90d">3 derniers mois</option>
                                        <option value="1y">12 derniers mois</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                        Statut
                                    </label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="px-4 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                                    >
                                        <option value="all">Tous</option>
                                        <option value="pending">En attente</option>
                                        <option value="approved">Approuvé</option>
                                        <option value="rejected">Rejeté</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={fetchReturnsData}>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Actualiser
                                </Button>
                                <Link to="/returns/new">
                                    <Button size="sm">
                                        Nouveau retour
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* KPIs */}
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
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                        >
                            <Card className="text-center">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`p-2 ${kpi.color}/10 rounded-lg`}>
                                        <kpi.icon className={`w-6 h-6 text-${kpi.color.split('-')[1]}-500`} />
                                    </div>
                                    <div className={`flex items-center text-sm font-medium ${kpi.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                        <RotateCcw className={`w-4 h-4 mr-1 ${kpi.isPositive ? '' : 'rotate-180'}`} />
                                        {kpi.change}
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-1">
                                    {kpi.value}
                                </h3>
                                <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                    {kpi.title}
                                </p>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Returns List */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                >
                    <Card>
                        <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-6">
                            Demandes de Retour
                        </h2>
                        {loading ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500 dark:text-gray-400">Chargement des retours...</p>
                            </div>
                        ) : returns.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500 dark:text-gray-400">Aucun retour trouvé</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {returns.map((ret, index) => (
                                    <motion.div
                                        key={ret.id}
                                        initial={{ opacity: 0, x: -30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.6, delay: index * 0.1 }}
                                        className="border border-nexsaas-light-gray dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center mb-2">
                                                    <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mr-3">
                                                        {ret.product}
                                                    </h3>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ret.status)}`}>
                                                        {ret.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-4 text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                                    <span>Commande: {ret.orderId}</span>
                                                    <span>•</span>
                                                    <span>Fournisseur: {ret.supplier}</span>
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
                                                {ret.status === 'pending' && (
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
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default ReturnsPage;