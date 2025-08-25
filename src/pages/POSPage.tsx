// src/pages/POSPage.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Scan, 
  Trash2, 
  ArrowLeft,
  User,
  CreditCard,
  Receipt,
  RotateCcw,
  Keyboard,
  Package,
  AlertTriangle,
  X
} from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import QRScanner from '../components/QRScanner/QRScanner';
import { useToast } from '../contexts/ToastContext';
import { useActivity } from '../contexts/ActivityContext';

// Types pour le POS
interface ProduitPOS {
  id: string;
  nom: string;
  prix: number;
  sku: string;
  lot: string;
  qrCode: string;
  fournisseur: string;
  statut: string;
}

interface ProduitPanier extends ProduitPOS {
  dateAjout: Date;
}

interface InfosClient {
  nom?: string;
  prenom?: string;
  contact?: string;
}

type MoyenPaiement = 'WAVE' | 'ORANGE_MONEY' | 'MTN_MONEY' | 'MOOV_MONEY' | 'AUTRE';

// Mock data pour les tests (à retirer en production)
const MOCK_PRODUCTS = {
  'PRD-001': {
    id: '1',
    nom: 'MacBook Pro 14"',
    prix: 2499,
    sku: 'MBP14-001',
    lot: 'LOT-2024-01',
    qrCode: 'PRD-001',
    fournisseur: 'Apple Inc.',
    statut: 'DISPONIBLE'
  },
  'PRD-002': {
    id: '2',
    nom: 'iPhone 15 Pro',
    prix: 1199,
    sku: 'IP15P-001',
    lot: 'LOT-2024-02',
    qrCode: 'PRD-002',
    fournisseur: 'Apple Inc.',
    statut: 'DISPONIBLE'
  },
  'PRD-003': {
    id: '3',
    nom: 'Samsung Galaxy S24',
    prix: 899,
    sku: 'SGS24-001',
    lot: 'LOT-2024-03',
    qrCode: 'PRD-003',
    fournisseur: 'Samsung Electronics',
    statut: 'DISPONIBLE'
  }
};

const POSPage: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { logActivity } = useActivity();

    // États du POS
    const [panier, setPanier] = useState<ProduitPanier[]>([]);
    const [showScanner, setShowScanner] = useState(false);
    const [showSaisieManuelle, setShowSaisieManuelle] = useState(false);
    const [showModalPaiement, setShowModalPaiement] = useState(false);
    const [codeQRManuel, setCodeQRManuel] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [useMockData, setUseMockData] = useState(false);

    // États pour le paiement
    const [moyenPaiement, setMoyenPaiement] = useState<MoyenPaiement>("WAVE");
    const [infosClient, setInfosClient] = useState<InfosClient>({});
    const [autreMoyenPaiement, setAutreMoyenPaiement] = useState("");

    // API Endpoints
    const API_BASE = "http://localhost:8000";
    const getAuthToken = () => localStorage.getItem("token");

    // Fonction pour scanner/récupérer un produit
    const scannerProduit = async (qrCode: string) => {
        setIsLoading(true);

        try {
            // Essayer d'abord avec l'API réelle
            if (!useMockData) {
                try {
                    const token = getAuthToken();

                    let response = await fetch(
                        `${API_BASE}/produits-stock/scan`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                                id: qrCode,
                                commentaire: "Scan POS",
                            }),
                        },
                    );

                    // Si le premier essai échoue, essayer avec l'ID numérique
                    if (!response.ok && qrCode.startsWith("PRD-")) {
                        const numericId = qrCode.replace("PRD-", "");
                        response = await fetch(
                            `${API_BASE}/produits-stock/scan`,
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({
                                    id: numericId,
                                    commentaire: "Scan POS avec ID numérique",
                                }),
                            },
                        );
                    }

                    if (response.ok) {
                        const produitStock = await response.json();

                        // Vérifier que le produit est disponible
                        if (produitStock.statut !== "CLOTUREE") {
                            throw new Error(
                                `Ce produit n'est pas disponible (statut: ${produitStock.statut})`,
                            );
                        }

                        // Vérifier que le produit n'est pas déjà dans le panier
                        const dejaEnPanier = panier.find(
                            (item) => item.id === produitStock.id,
                        );
                        if (dejaEnPanier) {
                            throw new Error(
                                "Ce produit est déjà dans le panier",
                            );
                        }

                        // Transformer en format POS
                        const produitPOS: ProduitPOS = {
                            id: produitStock.id,
                            nom:
                                produitStock.produitFournisseur?.nom ||
                                "Produit sans nom",
                            prix: parseFloat(
                                produitStock.prixVente || produitStock.prix,
                            ),
                            sku: produitStock.sku,
                            lot: produitStock.lot || "N/A",
                            qrCode: produitStock.qrCode,
                            fournisseur:
                                produitStock.produitFournisseur?.fournisseur
                                    ?.nom || "N/A",
                            statut: produitStock.statut,
                        };

                        // Ajouter au panier
                        ajouterAuPanier(produitPOS);

                        logActivity({
                            type: "scan",
                            module: "POS",
                            description: `Produit scanné: ${produitPOS.nom}`,
                            metadata: {
                                productId: produitPOS.id,
                                qrCode: qrCode,
                                sku: produitPOS.sku,
                            },
                        });

                        showToast({
                            type: "success",
                            title: "Produit ajouté",
                            message: `${produitPOS.nom} ajouté au panier`,
                        });

                        return produitPOS;
                    }
                } catch (apiError) {
                    console.warn("Erreur API, passage en mode mock:", apiError);
                    setUseMockData(true);
                    showToast({
                        type: "warning",
                        title: "Mode démo activé",
                        message: "Utilisation des données de démonstration",
                    });
                }
            }

            // Fallback: utiliser les données mockées
            const mockProduct =
                MOCK_PRODUCTS[qrCode as keyof typeof MOCK_PRODUCTS];

            if (!mockProduct) {
                throw new Error(`Produit avec code "${qrCode}" introuvable`);
            }

            // Vérifier que le produit n'est pas déjà dans le panier
            const dejaEnPanier = panier.find(
                (item) => item.id === mockProduct.id,
            );
            if (dejaEnPanier) {
                throw new Error("Ce produit est déjà dans le panier");
            }

            // Ajouter au panier
            ajouterAuPanier(mockProduct);

            logActivity({
                type: "scan",
                module: "POS",
                description: `Produit scanné (démo): ${mockProduct.nom}`,
                metadata: {
                    productId: mockProduct.id,
                    qrCode: qrCode,
                    sku: mockProduct.sku,
                },
            });

            showToast({
                type: "success",
                title: "Produit ajouté (démo)",
                message: `${mockProduct.nom} ajouté au panier - Mode démo`,
            });

            return mockProduct;
        } catch (error: any) {
            console.error("Erreur scan produit:", error);
            showToast({
                type: "error",
                title: "Erreur de scan",
                message: error.message || "Impossible de scanner le produit",
            });
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    // Ajouter un produit au panier
    const ajouterAuPanier = (produit: ProduitPOS) => {
        const produitPanier: ProduitPanier = {
            ...produit,
            dateAjout: new Date(),
        };
        setPanier((prev) => [...prev, produitPanier]);
    };

    // In POSPage.tsx, replace the handleScan function
    const handleScan = async (qrCode: string) => {
        // Do not immediately close the scanner
        // setShowScanner(false); // Removed to keep scanner open for multiple scans
        const result = await scannerProduit(qrCode);
        if (result) {
            // Optionally show a button to close the scanner or keep it open
            showToast({
                type: "info",
                title: "Continuer à scanner ?",
                message:
                    'Produit ajouté. Cliquez sur "Fermer" pour arrêter le scan.',
            });
        }
    };

    // Update the Scanner Card in the render method to include a "Close Scanner" button
    
    // Gérer la saisie manuelle
    const handleSaisieManuelle = async () => {
        if (!codeQRManuel.trim()) {
            showToast({
                type: "error",
                title: "Code requis",
                message: "Veuillez saisir un code QR ou SKU",
            });
            return;
        }

        await scannerProduit(codeQRManuel.trim());
        setCodeQRManuel("");
        setShowSaisieManuelle(false);
    };

    // Supprimer un produit du panier
    const retirerDuPanier = (productId: string) => {
        setPanier((prev) => prev.filter((item) => item.id !== productId));
        showToast({
            type: "info",
            title: "Produit retiré",
            message: "Produit retiré du panier",
        });
    };

    // Vider le panier
    const viderPanier = () => {
        if (panier.length === 0) return;

        setPanier([]);
        setInfosClient({});
        showToast({
            type: "info",
            title: "Panier vidé",
            message: "Le panier a été vidé",
        });
    };

    // Calculer le total
    const calculerTotal = () => {
        return panier.reduce((total, item) => total + item.prix, 0);
    };

    // Finaliser la vente
    const finaliserVente = async () => {
        if (panier.length === 0) {
            showToast({
                type: "warning",
                title: "Panier vide",
                message: "Ajoutez des produits avant de finaliser la vente",
            });
            return;
        }

        setIsLoading(true);
        try {
            if (!useMockData) {
                const token = getAuthToken();

                // Préparer les données de vente
                const venteData = {
                    modePaiement: moyenPaiement,
                    produits: panier.map((item) => ({
                        produitStockId: parseInt(item.id),
                    })),
                    nomClient: infosClient.nom?.trim() || undefined,
                    prenomClient: infosClient.prenom?.trim() || undefined,
                    contactClient: infosClient.contact?.trim() || undefined,
                    ...(moyenPaiement === "AUTRE" &&
                        autreMoyenPaiement.trim() && {
                            autreMoyenPaiement: autreMoyenPaiement.trim(),
                        }),
                };

                const response = await fetch(`${API_BASE}/ventes`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(venteData),
                });

                console.log("Scan Response:", response);

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(
                        errorData.message || "Erreur lors de la vente",
                    );
                }

                const vente = await response.json();

                logActivity({
                    type: "sale",
                    module: "POS",
                    description: `Vente effectuée - Total: €${calculerTotal().toFixed(
                        2,
                    )}`,
                    metadata: {
                        venteId: vente.data?.id,
                        produits: panier.map((p) => ({
                            id: p.id,
                            nom: p.nom,
                            prix: p.prix,
                        })),
                        total: calculerTotal(),
                        moyenPaiement,
                        client: infosClient,
                    },
                });

                showToast({
                    type: "success",
                    title: "Vente effectuée",
                    message: `Total: €${calculerTotal().toFixed(
                        2,
                    )} - Vente enregistrée`,
                });
            } else {
                // Mode démo - simuler une vente réussie
                logActivity({
                    type: "sale",
                    module: "POS",
                    description: `Vente démo effectuée - Total: €${calculerTotal().toFixed(
                        2,
                    )}`,
                    metadata: {
                        venteId: Math.floor(Math.random() * 1000),
                        produits: panier.map((p) => ({
                            id: p.id,
                            nom: p.nom,
                            prix: p.prix,
                        })),
                        total: calculerTotal(),
                        moyenPaiement,
                        client: infosClient,
                    },
                });

                showToast({
                    type: "success",
                    title: "Vente démo effectuée",
                    message: `Total: €${calculerTotal().toFixed(
                        2,
                    )} - Mode démo`,
                });
            }

            // Réinitialiser
            setPanier([]);
            setInfosClient({});
            setMoyenPaiement("WAVE");
            setAutreMoyenPaiement("");
            setShowModalPaiement(false);
        } catch (error: any) {
            console.error("Erreur finalisation vente:", error);
            showToast({
                type: "error",
                title: "Erreur de vente",
                message: error.message || "Impossible de finaliser la vente",
            });
        } finally {
            setIsLoading(false);
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
                        <div className="p-3 bg-nexsaas-saas-green rounded-lg mr-4">
                            <ShoppingCart className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                Point de Vente (POS)
                            </h1>
                            <p className="text-nexsaas-vanta-black dark:text-gray-300">
                                Scanner les produits disponibles et finaliser
                                les ventes
                            </p>
                            {/* {useMockData && (
                <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-md">
                  <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                    ⚠️ Mode démo activé - Utilisation des données de démonstration
                  </p>
                </div>
              )} */}
                        </div>
                    </div>
                </motion.div>

                {/* Actions principales */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8"
                >
                    {/* Scanner QR */}
                    <Card className="p-6 hover:shadow-lg transition-all duration-300">
                        <div className="flex flex-col items-center text-center">
                            <div className="p-4 bg-nexsaas-saas-green rounded-full mb-4">
                                <Scan className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                Scanner QR
                            </h3>
                            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300 mb-4">
                                Utilisez la caméra pour scanner les codes QR des
                                produits
                            </p>
                            <div className="flex space-x-2 w-full">
                                <Button
                                    onClick={() => setShowScanner(true)}
                                    disabled={isLoading || showScanner}
                                    className="flex-1 bg-nexsaas-saas-green hover:bg-green-600"
                                >
                                    <Scan className="w-4 h-4 mr-2" />
                                    Scanner
                                </Button>
                                {showScanner && (
                                    <Button
                                        onClick={() => setShowScanner(false)}
                                        disabled={isLoading}
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Fermer
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Saisie manuelle */}
                    <Card className="p-6 hover:shadow-lg transition-all duration-300">
                        <div className="flex flex-col items-center text-center">
                            <div className="p-4 bg-blue-500 rounded-full mb-4">
                                <Keyboard className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                Saisie Manuelle
                            </h3>
                            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300 mb-4">
                                Entrez manuellement le code QR ou le SKU du
                                produit
                            </p>
                            <Button
                                onClick={() => setShowSaisieManuelle(true)}
                                disabled={isLoading}
                                variant="outline"
                                className="w-full"
                            >
                                <Keyboard className="w-4 h-4 mr-2" />
                                Saisir
                            </Button>
                        </div>
                    </Card>
                </motion.div>

                {/* Liste des produits dans le panier */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                    Panier ({panier.length})
                                </h2>
                                <p className="text-nexsaas-vanta-black dark:text-gray-300">
                                    Produits ajoutés pour la vente
                                </p>
                            </div>
                            <div className="flex items-center space-x-3">
                                {panier.length > 0 && (
                                    <>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-nexsaas-saas-green">
                                                €{calculerTotal().toFixed(2)}
                                            </p>
                                            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                                Total
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={viderPanier}
                                            className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            <RotateCcw className="w-4 h-4 mr-2" />
                                            Vider
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        {panier.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                    <ShoppingCart className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-nexsaas-vanta-black dark:text-gray-300 mb-2">
                                    Panier vide
                                </h3>
                                <p className="text-nexsaas-vanta-black dark:text-gray-400 mb-6">
                                    Scannez ou ajoutez des produits pour
                                    commencer une vente
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {panier.map((produit, index) => (
                                    <motion.div
                                        key={`${produit.id}-${index}`}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-all duration-200"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-nexsaas-saas-green rounded-lg">
                                                    <Package className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                                        {produit.nom}
                                                    </h4>
                                                    <div className="flex items-center space-x-4 text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                                        <span>
                                                            SKU: {produit.sku}
                                                        </span>
                                                        <span>
                                                            Lot: {produit.lot}
                                                        </span>
                                                        <span>
                                                            QR: {produit.qrCode}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-nexsaas-vanta-black dark:text-gray-400">
                                                        Ajouté le{" "}
                                                        {produit.dateAjout.toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-nexsaas-saas-green">
                                                    €{produit.prix.toFixed(2)}
                                                </p>
                                                <p className="text-xs text-nexsaas-vanta-black dark:text-gray-400">
                                                    {produit.fournisseur}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    retirerDuPanier(produit.id)
                                                }
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Actions du panier */}
                                <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                                    <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowScanner(true)}
                                            disabled={isLoading}
                                        >
                                            <Scan className="w-4 h-4 mr-2" />
                                            Ajouter
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={viderPanier}
                                            disabled={isLoading}
                                            className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            <RotateCcw className="w-4 h-4 mr-2" />
                                            Vider le panier
                                        </Button>
                                    </div>
                                    <Button
                                        onClick={() =>
                                            setShowModalPaiement(true)
                                        }
                                        disabled={isLoading}
                                        size="lg"
                                        className="bg-nexsaas-saas-green hover:bg-green-600 text-white px-8"
                                    >
                                        <Receipt className="w-5 h-5 mr-2" />
                                        Procéder au paiement (€
                                        {calculerTotal().toFixed(2)})
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                </motion.div>
            </div>

            {/* QR Scanner */}
            <QRScanner
                isOpen={showScanner}
                onScan={handleScan}
                onClose={() => setShowScanner(false)}
            />

            {/* Modal Saisie Manuelle */}
            {showSaisieManuelle && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-nexsaas-pure-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
                    >
                        <h3 className="text-lg font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-4">
                            Saisie Manuelle
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                    Code QR ou SKU
                                </label>
                                <input
                                    type="text"
                                    value={codeQRManuel}
                                    onChange={(e) =>
                                        setCodeQRManuel(e.target.value)
                                    }
                                    placeholder="Saisissez le code (ex: PRD-001, PRD-002, PRD-003)"
                                    className="w-full px-4 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                                    onKeyPress={(e) =>
                                        e.key === "Enter" &&
                                        handleSaisieManuelle()
                                    }
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowSaisieManuelle(false);
                                        setCodeQRManuel("");
                                    }}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    onClick={handleSaisieManuelle}
                                    disabled={!codeQRManuel.trim()}
                                >
                                    Valider
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Modal Paiement */}
            {showModalPaiement && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-nexsaas-pure-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
                    >
                        <h3 className="text-lg font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-4">
                            Finaliser la Vente
                        </h3>

                        {/* Résumé */}
                        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h4 className="font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                Résumé de la commande
                            </h4>
                            <div className="space-y-1 text-sm">
                                {panier.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex justify-between"
                                    >
                                        <span className="text-nexsaas-vanta-black dark:text-gray-300 truncate mr-2">
                                            {item.nom}
                                        </span>
                                        <span className="text-nexsaas-saas-green font-medium">
                                            €{item.prix.toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                                <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                                    <span className="text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                        Total:
                                    </span>
                                    <span className="text-nexsaas-saas-green">
                                        €{calculerTotal().toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Informations Client */}
                            <div>
                                <h4 className="font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-3">
                                    <User className="w-4 h-4 inline mr-2" />
                                    Informations Client (Optionnel)
                                </h4>
                                <div className="grid grid-cols-1 gap-3">
                                    <input
                                        type="text"
                                        placeholder="Nom"
                                        value={infosClient.nom || ""}
                                        onChange={(e) =>
                                            setInfosClient((prev) => ({
                                                ...prev,
                                                nom: e.target.value,
                                            }))
                                        }
                                        className="px-4 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Moyen de Paiement */}
                            <div>
                                <h4 className="font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-3">
                                    <CreditCard className="w-4 h-4 inline mr-2" />
                                    Moyen de Paiement *
                                </h4>
                                <div className="space-y-2">
                                    {[
                                        { value: "WAVE", label: "Wave" },
                                        {
                                            value: "ORANGE_MONEY",
                                            label: "Orange Money",
                                        },
                                        {
                                            value: "MTN_MONEY",
                                            label: "MTN Money",
                                        },
                                        {
                                            value: "MOOV_MONEY",
                                            label: "Moov Money",
                                        },
                                        { value: "AUTRE", label: "Autre" },
                                    ].map((moyen) => (
                                        <label
                                            key={moyen.value}
                                            className="flex items-center space-x-3 cursor-pointer"
                                        >
                                            <input
                                                type="radio"
                                                name="moyenPaiement"
                                                value={moyen.value}
                                                checked={
                                                    moyenPaiement ===
                                                    moyen.value
                                                }
                                                onChange={(e) =>
                                                    setMoyenPaiement(
                                                        e.target
                                                            .value as MoyenPaiement,
                                                    )
                                                }
                                                className="w-4 h-4 text-nexsaas-saas-green focus:ring-nexsaas-saas-green"
                                            />
                                            <span className="text-nexsaas-vanta-black dark:text-gray-300">
                                                {moyen.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>

                                {/* Champ pour "Autre" moyen de paiement */}
                                {moyenPaiement === "AUTRE" && (
                                    <div className="mt-3">
                                        <input
                                            type="text"
                                            placeholder="Précisez le moyen de paiement..."
                                            value={autreMoyenPaiement}
                                            onChange={(e) =>
                                                setAutreMoyenPaiement(
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full px-4 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                                            required
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                            <Button
                                variant="outline"
                                onClick={() => setShowModalPaiement(false)}
                                disabled={isLoading}
                            >
                                Annuler
                            </Button>
                            <Button
                                onClick={finaliserVente}
                                disabled={
                                    isLoading ||
                                    (moyenPaiement === "AUTRE" &&
                                        !autreMoyenPaiement.trim())
                                }
                                className="bg-nexsaas-saas-green hover:bg-green-600"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Traitement...
                                    </>
                                ) : (
                                    <>
                                        <Receipt className="w-4 h-4 mr-2" />
                                        Finaliser (€{calculerTotal().toFixed(2)}
                                        )
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Note */}
                        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <div className="flex items-start">
                                <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5" />
                                <div className="text-sm text-yellow-700 dark:text-yellow-300">
                                    <p className="font-medium">Important :</p>
                                    <p>
                                        Une fois validée, cette vente sera
                                        enregistrée et visible dans la page
                                        "Ventes". Les produits seront marqués
                                        comme vendus et ne pourront plus être
                                        scannés.
                                    </p>
                                    {useMockData && (
                                        <p className="mt-2 font-bold">
                                            ⚠️ Mode démo: Les données ne seront
                                            pas enregistrées en base.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default POSPage;