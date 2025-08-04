import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
    ShoppingCart,
    Plus,
    Search,
    QrCode,
    Package,
    AlertTriangle,
    ArrowLeft,
    Edit,
    Trash2,
    Download,
    Upload,
    Eye,
    Hash,
    Calendar,
    User,
    MapPin,
    CheckCircle,
    Clock,
    AlertCircle,
    Printer,
    MoreVertical,
} from "lucide-react";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import Input from "../../components/UI/Input";
import QRCodePrint from "../../components/QRCode/QRCodePrint";
import { useToast } from "../../contexts/ToastContext";
import { useActivity } from "../../contexts/ActivityContext";
import {
    getProduitsStock,
    ProduitStockGroup,
    StatutProduitStock,
} from "../../api/produitApi";

interface ProductUnit {
    id: string;
    qrCode: string;
    serialNumber: string;
    lot: string;
    status: StatutProduitStock;
    location: string;
    receivedDate: string;
    soldDate?: string;
    soldTo?: string;
    notes?: string;
}

interface Product {
    id: string;
    name: string;
    category: string;
    basePrice: number;
    minStock: number;
    description: string;
    supplier: string;
    units: ProductUnit[];
    totalReceived: number;
    totalSold: number;
    totalAvailable: number;
    totalDamaged: number;
}

const StockPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [showUnitsModal, setShowUnitsModal] = useState(false);
    const [showUnitForm, setShowUnitForm] = useState(false);
    const [showQRGenerator, setShowQRGenerator] = useState(false);
    const [showQRPrint, setShowQRPrint] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(
        null,
    );
    const [selectedUnit, setSelectedUnit] = useState<ProductUnit | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const { showToast } = useToast();
    const { logActivity } = useActivity();

    const URL_API = "http://localhost:8000";

    const [formData, setFormData] = useState({
        name: "",
        category: "",
        basePrice: "",
        minStock: "",
        description: "",
        supplier: "",
    });

    const [unitForm, setUnitForm] = useState({
        serialNumber: "",
        lot: "",
        location: "",
        notes: "",
        quantity: "1",
    });

    const mapStatus = (statut: StatutProduitStock): StatutProduitStock => {
        return statut;
    };

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const produitStockGroups = await getProduitsStock();
                console.log("API Response:", produitStockGroups);
                if (!Array.isArray(produitStockGroups)) {
                    throw new Error("La réponse de l'API n'est pas un tableau");
                }
                const mappedProducts = produitStockGroups.map(
                    mapProduitStockGroupToProduct,
                );
                setProducts(mappedProducts);
                showToast({
                    type: "success",
                    title: "Données chargées",
                    message:
                        "Les produits en stock ont été chargés avec succès",
                });
            } catch (error: any) {
                console.error("Erreur lors du chargement des produits:", error);
                showToast({
                    type: "error",
                    title: "Erreur",
                    message:
                        error.message ||
                        "Erreur lors du chargement des produits",
                });
                setProducts([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [showToast]);

    const mapProduitStockGroupToProduct = (
        group: ProduitStockGroup,
    ): Product => {
        const units: ProductUnit[] = group.stocks.map((stock) => ({
            id: stock.id.toString(),
            qrCode: stock.qrCode,
            serialNumber: stock.sku,
            lot: stock.lot || "N/A",
            status: mapStatus(stock.statut),
            location: stock.emplacement
                ? stock.emplacement.toString()
                : "Non spécifié",
            receivedDate: stock.dateEntreeStock,
            notes: stock.lienFicheProduit || undefined,
            soldDate:
                stock.statut === StatutProduitStock.VENDU
                    ? new Date().toISOString().split("T")[0]
                    : undefined,
            soldTo: undefined,
        }));

        return {
            id: group.produitFournisseur.id.toString(),
            name: group.produitFournisseur.nom,
            category: group.produitFournisseur.categorie,
            basePrice: parseFloat(group.produitFournisseur.prix) || 0,
            minStock: 5,
            description: "",
            supplier: group.produitFournisseur.fournisseur.nom,
            units,
            totalReceived: units.length,
            totalSold: units.filter(
                (u) => u.status === StatutProduitStock.VENDU,
            ).length,
            totalAvailable: units.filter(
                (u) => u.status === StatutProduitStock.DISPONIBLE,
            ).length,
            totalDamaged: units.filter(
                (u) => u.status === StatutProduitStock.ENDOMMAGE,
            ).length,
        };
    };

    const resetForms = () => {
        setFormData({
            name: "",
            category: "",
            basePrice: "",
            minStock: "",
            description: "",
            supplier: "",
        });
        setUnitForm({
            serialNumber: "",
            lot: "",
            location: "",
            notes: "",
            quantity: "1",
        });
    };

    const getStatusColor = (status: StatutProduitStock) => {
        switch (status) {
            case StatutProduitStock.DISPONIBLE:
                return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
            case StatutProduitStock.VENDU:
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
            case StatutProduitStock.RESERVE:
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
            case StatutProduitStock.ENDOMMAGE:
                return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
            case StatutProduitStock.RETOURNE:
                return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
            case StatutProduitStock.PERIME:
                return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
            case StatutProduitStock.ENLEVE:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
        }
    };

    const getStatusIcon = (status: StatutProduitStock) => {
        switch (status) {
            case StatutProduitStock.DISPONIBLE:
                return <CheckCircle className="w-4 h-4" />;
            case StatutProduitStock.VENDU:
                return <ShoppingCart className="w-4 h-4" />;
            case StatutProduitStock.RESERVE:
                return <Clock className="w-4 h-4" />;
            case StatutProduitStock.ENDOMMAGE:
                return <AlertCircle className="w-4 h-4" />;
            case StatutProduitStock.RETOURNE:
                return <Package className="w-4 h-4" />;
            case StatutProduitStock.PERIME:
                return <AlertTriangle className="w-4 h-4" />;
            case StatutProduitStock.ENLEVE:
                return <Trash2 className="w-4 h-4" />;
            default:
                return <Package className="w-4 h-4" />;
        }
    };

    const getStatusDisplayName = (status: StatutProduitStock) => {
        switch (status) {
            case StatutProduitStock.DISPONIBLE:
                return "Disponible";
            case StatutProduitStock.VENDU:
                return "Vendu";
            case StatutProduitStock.RESERVE:
                return "Réservé";
            case StatutProduitStock.ENDOMMAGE:
                return "Endommagé";
            case StatutProduitStock.RETOURNE:
                return "Retourné";
            case StatutProduitStock.PERIME:
                return "Périmé";
            case StatutProduitStock.ENLEVE:
                return "Enlevé";
            default:
                return status;
        }
    };

    const getStockStatus = (product: Product) => {
        if (product.totalAvailable === 0)
            return {
                status: "out_of_stock",
                text: "Rupture",
                color: "text-red-500",
            };
        if (product.totalAvailable <= product.minStock)
            return {
                status: "low_stock",
                text: "Stock faible",
                color: "text-yellow-500",
            };
        return {
            status: "in_stock",
            text: "En stock",
            color: "text-green-500",
        };
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.category || !formData.basePrice) {
            showToast({
                type: "error",
                title: "Erreur",
                message: "Veuillez remplir tous les champs obligatoires",
            });
            return;
        }

        if (editingProduct) {
            setProducts((prev) =>
                prev.map((product) =>
                    product.id === editingProduct.id
                        ? {
                              ...product,
                              ...formData,
                              basePrice: parseFloat(formData.basePrice) || 0,
                              minStock: parseInt(formData.minStock) || 0,
                          }
                        : product,
                ),
            );

            logActivity({
                type: "update",
                module: "Stocks",
                description: `Produit modifié: ${formData.name}`,
                metadata: { productId: editingProduct.id },
            });

            showToast({
                type: "success",
                title: "Produit modifié",
                message: "Le produit a été mis à jour avec succès",
            });
        } else {
            const newProduct: Product = {
                id: `PRD-${String(products.length + 1).padStart(3, "0")}`,
                ...formData,
                basePrice: parseFloat(formData.basePrice) || 0,
                minStock: parseInt(formData.minStock) || 0,
                units: [],
                totalReceived: 0,
                totalSold: 0,
                totalAvailable: 0,
                totalDamaged: 0,
            };

            setProducts((prev) => [newProduct, ...prev]);

            logActivity({
                type: "create",
                module: "Stocks",
                description: `Nouveau produit ajouté: ${formData.name}`,
                metadata: { productId: newProduct.id },
            });

            showToast({
                type: "success",
                title: "Produit ajouté",
                message: "Le nouveau produit a été créé avec succès",
            });
        }

        setShowForm(false);
        setEditingProduct(null);
        resetForms();
    };

    const handleAddProduct = () => {
        setEditingProduct(null);
        resetForms();
        setShowForm(true);
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            category: product.category,
            basePrice: product.basePrice.toString(),
            minStock: product.minStock.toString(),
            description: product.description,
            supplier: product.supplier,
        });
        setShowForm(true);
    };

    const handleDeleteProduct = (productId: string) => {
        if (
            confirm(
                "Êtes-vous sûr de vouloir supprimer ce produit et toutes ses unités ?",
            )
        ) {
            setProducts((prev) => prev.filter((p) => p.id !== productId));

            logActivity({
                type: "delete",
                module: "Stocks",
                description: `Produit supprimé: ${productId}`,
                metadata: { productId },
            });

            showToast({
                type: "success",
                title: "Produit supprimé",
                message: "Le produit et toutes ses unités ont été supprimés",
            });
        }
    };

    const handleViewUnits = (product: Product) => {
        setSelectedProduct(product);
        setShowUnitsModal(true);
    };

    const handleAddUnits = (product: Product) => {
        setSelectedProduct(product);
        setSelectedUnit(null);
        resetForms();
        setShowUnitForm(true);
    };

    const handleEditUnit = (product: Product, unit: ProductUnit) => {
        setSelectedProduct(product);
        setSelectedUnit(unit);
        setUnitForm({
            serialNumber: unit.serialNumber,
            lot: unit.lot,
            location: unit.location,
            notes: unit.notes || "",
            quantity: "1",
        });
        setShowUnitForm(true);
    };

    const handleSaveUnit = () => {
        if (!selectedProduct || !unitForm.serialNumber || !unitForm.lot) {
            showToast({
                type: "error",
                title: "Erreur",
                message: "Veuillez remplir tous les champs obligatoires",
            });
            return;
        }

        if (selectedUnit) {
            setProducts((prev) =>
                prev.map((product) =>
                    product.id === selectedProduct.id
                        ? {
                              ...product,
                              units: product.units.map((unit) =>
                                  unit.id === selectedUnit.id
                                      ? {
                                            ...unit,
                                            serialNumber: unitForm.serialNumber,
                                            lot: unitForm.lot,
                                            location: unitForm.location,
                                            notes: unitForm.notes,
                                        }
                                      : unit,
                              ),
                          }
                        : product,
                ),
            );

            showToast({
                type: "success",
                title: "Unité modifiée",
                message: "L'unité a été mise à jour avec succès",
            });
        } else {
            const quantity = parseInt(unitForm.quantity) || 1;
            const newUnits: ProductUnit[] = [];

            for (let i = 0; i < quantity; i++) {
                const unitNumber = selectedProduct.units.length + i + 1;
                const newUnit: ProductUnit = {
                    id: `UNIT-${Date.now()}-${i}`,
                    qrCode: `QR-${selectedProduct.id}-UNIT-${String(
                        unitNumber,
                    ).padStart(3, "0")}`,
                    serialNumber:
                        quantity === 1
                            ? unitForm.serialNumber
                            : `${unitForm.serialNumber}-${String(
                                  i + 1,
                              ).padStart(3, "0")}`,
                    lot: unitForm.lot,
                    status: StatutProduitStock.DISPONIBLE,
                    location: unitForm.location,
                    receivedDate: new Date().toISOString().split("T")[0],
                    notes: unitForm.notes,
                };
                newUnits.push(newUnit);
            }

            setProducts((prev) =>
                prev.map((product) =>
                    product.id === selectedProduct.id
                        ? {
                              ...product,
                              units: [...product.units, ...newUnits],
                              totalReceived: product.totalReceived + quantity,
                              totalAvailable: product.totalAvailable + quantity,
                          }
                        : product,
                ),
            );

            logActivity({
                type: "create",
                module: "Stocks",
                description: `${quantity} unité(s) ajoutée(s) au produit ${selectedProduct.name}`,
                metadata: {
                    productId: selectedProduct.id,
                    quantity,
                    units: newUnits.map((u) => ({
                        id: u.id,
                        qrCode: u.qrCode,
                        serialNumber: u.serialNumber,
                        lot: u.lot,
                    })),
                },
            });

            showToast({
                type: "success",
                title: "Unités ajoutées",
                message: `${quantity} unité(s) ajoutée(s) avec succès`,
            });
        }

        setShowUnitForm(false);
        resetForms();
    };

    const handleDeleteUnit = (productId: string, unitId: string) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer cette unité ?")) {
            setProducts((prev) =>
                prev.map((product) =>
                    product.id === productId
                        ? {
                              ...product,
                              units: product.units.filter(
                                  (unit) => unit.id !== unitId,
                              ),
                              totalReceived: product.totalReceived - 1,
                              totalAvailable: product.totalAvailable - 1,
                          }
                        : product,
                ),
            );

            showToast({
                type: "success",
                title: "Unité supprimée",
                message: "L'unité a été supprimée avec succès",
            });
        }
    };

    const handleChangeUnitStatus = (
        productId: string,
        unitId: string,
        newStatus: StatutProduitStock,
    ) => {
        setProducts((prev) =>
            prev.map((product) =>
                product.id === productId
                    ? {
                          ...product,
                          units: product.units.map((unit) =>
                              unit.id === unitId
                                  ? {
                                        ...unit,
                                        status: newStatus,
                                        soldDate:
                                            newStatus ===
                                            StatutProduitStock.VENDU
                                                ? new Date()
                                                      .toISOString()
                                                      .split("T")[0]
                                                : unit.soldDate,
                                    }
                                  : unit,
                          ),
                          totalAvailable: product.units.filter(
                              (u) =>
                                  u.id !== unitId ||
                                  newStatus === StatutProduitStock.DISPONIBLE,
                          ).length,
                          totalSold: product.units.filter((u) =>
                              u.id !== unitId
                                  ? u.status === StatutProduitStock.VENDU
                                  : newStatus === StatutProduitStock.VENDU,
                          ).length,
                          totalDamaged: product.units.filter((u) =>
                              u.id !== unitId
                                  ? u.status === StatutProduitStock.ENDOMMAGE
                                  : newStatus === StatutProduitStock.ENDOMMAGE,
                          ).length,
                      }
                    : product,
            ),
        );

        logActivity({
            type: "update",
            module: "Stocks",
            description: `Statut d'unité modifié: ${newStatus}`,
            metadata: { productId, unitId, newStatus },
        });

        showToast({
            type: "success",
            title: "Statut modifié",
            message: `Le statut de l'unité a été changé en "${getStatusDisplayName(
                newStatus,
            )}"`,
        });
    };

    const handleGenerateQR = (product: Product) => {
        setSelectedProduct(product);
        setShowQRGenerator(true);
    };

    const handlePrintQRCodes = (product?: Product) => {
        if (product) {
            setSelectedProduct(product);
        }
        setShowQRPrint(true);
    };

    const getAllQRCodes = () => {
        const allCodes: Array<{
            id: string;
            qrCode: string;
            serialNumber: string;
            lot: string;
            productName: string;
            status: string;
        }> = [];

        products.forEach((product) => {
            product.units.forEach((unit) => {
                allCodes.push({
                    id: unit.id,
                    qrCode: `${URL_API}${unit.qrCode}`,
                    serialNumber: unit.serialNumber,
                    lot: unit.lot,
                    productName: product.name,
                    status: unit.status,
                });
            });
        });

        return allCodes;
    };

    const getProductQRCodes = (product: Product) => {
        return product.units.map((unit) => ({
            id: unit.id,
            qrCode: `${URL_API}${unit.qrCode}`,
            serialNumber: unit.serialNumber,
            lot: unit.lot,
            productName: product.name,
            status: unit.status,
        }));
    };

    const filteredProducts = products.filter(
        (product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.supplier.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const handleProductAction = (product: Product, action: string) => {
        switch (action) {
            case "view":
                handleViewUnits(product);
                break;
            case "add":
                handleAddUnits(product);
                break;
            case "qr":
                handleGenerateQR(product);
                break;
            case "print":
                handlePrintQRCodes(product);
                break;
            case "edit":
                handleEditProduct(product);
                break;
            case "delete":
                handleDeleteProduct(product.id);
                break;
            default:
                break;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen pt-12 bg-gradient-to-br from-nexsaas-pure-white to-nexsaas-light-gray dark:from-nexsaas-vanta-black dark:to-gray-900 flex items-center justify-center">
                <div className="text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                    Chargement des produits...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-12 bg-gradient-to-br from-nexsaas-pure-white to-nexsaas-light-gray dark:from-nexsaas-vanta-black dark:to-gray-900">
            <div className="container mx-auto px-4 py-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-4"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Link to="/dashboard">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-1" />
                                    Retour
                                </Button>
                            </Link>
                            <div className="p-2 bg-green-500 rounded-lg">
                                <ShoppingCart className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                    Gestion des Stocks & QR Code
                                </h1>
                                <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                    Inventaire et traçabilité unitaire
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1 mb-2"
                >
                    <Card className="text-center p-1.5">
                        <div className="p-0.5 bg-blue-500/10 rounded-md inline-block mb-1">
                            <Package className="w-3 h-3 text-blue-500" />
                        </div>
                        <h3 className="text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                            {products.length}
                        </h3>
                        <p className="text-[10px] text-nexsaas-vanta-black dark:text-gray-300">
                            Produits
                        </p>
                    </Card>

                    <Card className="text-center p-1.5">
                        <div className="p-0.5 bg-green-500/10 rounded-md inline-block mb-1">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                        </div>
                        <h3 className="text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                            {products.reduce(
                                (acc, p) => acc + p.totalAvailable,
                                0,
                            )}
                        </h3>
                        <p className="text-[10px] text-nexsaas-vanta-black dark:text-gray-300">
                            Disponibles
                        </p>
                    </Card>

                    <Card className="text-center p-1.5">
                        <div className="p-0.5 bg-purple-500/10 rounded-md inline-block mb-1">
                            <ShoppingCart className="w-3 h-3 text-purple-500" />
                        </div>
                        <h3 className="text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                            {products.reduce((acc, p) => acc + p.totalSold, 0)}
                        </h3>
                        <p className="text-[10px] text-nexsaas-vanta-black dark:text-gray-300">
                            Vendues
                        </p>
                    </Card>

                    <Card className="text-center p-1.5">
                        <div className="p-0.5 bg-yellow-500/10 rounded-md inline-block mb-1">
                            <AlertTriangle className="w-3 h-3 text-yellow-500" />
                        </div>
                        <h3 className="text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                            {
                                products.filter(
                                    (p) => p.totalAvailable <= p.minStock,
                                ).length
                            }
                        </h3>
                        <p className="text-[10px] text-nexsaas-vanta-black dark:text-gray-300">
                            Alertes
                        </p>
                    </Card>

                    <Card className="text-center p-1.5">
                        <div className="p-0.5 bg-indigo-500/10 rounded-md inline-block mb-1">
                            <QrCode className="w-3 h-3 text-indigo-500" />
                        </div>
                        <h3 className="text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                            {products.reduce(
                                (acc, p) => acc + p.units.length,
                                0,
                            )}
                        </h3>
                        <p className="text-[10px] text-nexsaas-vanta-black dark:text-gray-300">
                            QR Codes
                        </p>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mb-4"
                >
                    <Card className="p-3">
                        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                            <div className="relative flex-1 max-w-xs">
                                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher un produit..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full pl-8 pr-3 py-1.5 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white text-sm focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePrintQRCodes()}
                                >
                                    <Printer className="w-3 h-3 mr-1" />
                                    Imprimer QR
                                </Button>
                                <Button onClick={handleAddProduct} size="sm">
                                    <Plus className="w-3 h-3 mr-1" />
                                    Ajouter
                                </Button>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="space-y-3"
                >
                    {filteredProducts.map((product, index) => {
                        const stockStatus = getStockStatus(product);

                        return (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.1,
                                }}
                            >
                                <Card className="hover:shadow-md transition-shadow p-4">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center space-x-2">
                                                    <h3 className="text-base font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                                        {product.name}
                                                    </h3>
                                                    <span
                                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}
                                                    >
                                                        {stockStatus.text}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-base font-bold text-nexsaas-saas-green">
                                                        €{product.basePrice}
                                                    </p>
                                                    <p className="text-xs text-nexsaas-vanta-black dark:text-gray-300">
                                                        Prix de base
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400 text-xs">
                                                        Catégorie:
                                                    </span>
                                                    <p className="text-nexsaas-vanta-black dark:text-gray-300 text-sm font-medium">
                                                        {product.category}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400 text-xs">
                                                        Fournisseur:
                                                    </span>
                                                    <p className="text-nexsaas-vanta-black dark:text-gray-300 text-sm font-medium">
                                                        {product.supplier}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400 text-xs">
                                                        Stock min:
                                                    </span>
                                                    <p className="text-nexsaas-vanta-black dark:text-gray-300 text-sm font-medium">
                                                        {product.minStock}{" "}
                                                        unités
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400 text-xs">
                                                        Total unités:
                                                    </span>
                                                    <p className="text-nexsaas-vanta-black dark:text-gray-300 text-sm font-medium">
                                                        {product.units.length}{" "}
                                                        unités
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                                                <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                                    <p className="text-sm font-bold text-green-600">
                                                        {product.totalAvailable}
                                                    </p>
                                                    <p className="text-xs text-green-600">
                                                        Disponibles
                                                    </p>
                                                </div>
                                                <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                    <p className="text-sm font-bold text-blue-600">
                                                        {product.totalSold}
                                                    </p>
                                                    <p className="text-xs text-blue-600">
                                                        Vendues
                                                    </p>
                                                </div>
                                                <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                                    <p className="text-sm font-bold text-yellow-600">
                                                        {
                                                            product.units.filter(
                                                                (u) =>
                                                                    u.status ===
                                                                    StatutProduitStock.RESERVE,
                                                            ).length
                                                        }
                                                    </p>
                                                    <p className="text-xs text-yellow-600">
                                                        Réservées
                                                    </p>
                                                </div>
                                                <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                                    <p className="text-sm font-bold text-red-600">
                                                        {product.totalDamaged}
                                                    </p>
                                                    <p className="text-xs text-red-600">
                                                        Endommagées
                                                    </p>
                                                </div>
                                            </div>

                                            {product.description && (
                                                <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300 mb-3">
                                                    {product.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="mt-3 lg:mt-0 lg:ml-4">
                                            <select
                                                onChange={(e) =>
                                                    handleProductAction(
                                                        product,
                                                        e.target.value,
                                                    )
                                                }
                                                className="px-2 py-1 text-xs border border-nexsaas-light-gray dark:border-gray-600 rounded bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green"
                                            >
                                                <option value="">
                                                    Actions
                                                </option>
                                                <option value="view">
                                                    Voir unités (
                                                    {product.units.length})
                                                </option>
                                                <option value="add">
                                                    Ajouter unités
                                                </option>
                                                <option value="qr">
                                                    QR Codes
                                                </option>
                                                <option value="print">
                                                    Imprimer QR
                                                </option>
                                                <option value="edit">
                                                    Modifier produit
                                                </option>
                                                <option value="delete">
                                                    Supprimer produit
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                        onClick={() => setShowForm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-nexsaas-pure-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-4">
                                {editingProduct
                                    ? "Modifier le produit"
                                    : "Ajouter un produit"}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <Input
                                        label="Nom du produit"
                                        value={formData.name}
                                        onChange={(value) =>
                                            setFormData({
                                                ...formData,
                                                name: value,
                                            })
                                        }
                                        required
                                    />
                                    <Input
                                        label="Catégorie"
                                        value={formData.category}
                                        onChange={(value) =>
                                            setFormData({
                                                ...formData,
                                                category: value,
                                            })
                                        }
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <Input
                                        label="Prix de base (€)"
                                        type="number"
                                        step="0.01"
                                        value={formData.basePrice}
                                        onChange={(value) =>
                                            setFormData({
                                                ...formData,
                                                basePrice: value,
                                            })
                                        }
                                        required
                                    />
                                    <Input
                                        label="Stock minimum"
                                        type="number"
                                        value={formData.minStock}
                                        onChange={(value) =>
                                            setFormData({
                                                ...formData,
                                                minStock: value,
                                            })
                                        }
                                        required
                                    />
                                    <Input
                                        label="Fournisseur"
                                        value={formData.supplier}
                                        onChange={(value) =>
                                            setFormData({
                                                ...formData,
                                                supplier: value,
                                            })
                                        }
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                description: e.target.value,
                                            })
                                        }
                                        rows={3}
                                        className="w-full px-3 py-2 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white text-sm focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                                        placeholder="Description du produit..."
                                    />
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowForm(false)}
                                        size="sm"
                                    >
                                        Annuler
                                    </Button>
                                    <Button type="submit" size="sm">
                                        {editingProduct
                                            ? "Modifier"
                                            : "Ajouter"}{" "}
                                        le produit
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}

                {showUnitsModal && selectedProduct && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                        onClick={() => setShowUnitsModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-nexsaas-pure-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                    Unités - {selectedProduct.name}
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowUnitsModal(false)}
                                >
                                    ✕
                                </Button>
                            </div>

                            <div className="mb-4 flex gap-2">
                                <Button
                                    onClick={() =>
                                        handleAddUnits(selectedProduct)
                                    }
                                    size="sm"
                                >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Ajouter des unités
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        handlePrintQRCodes(selectedProduct)
                                    }
                                    size="sm"
                                >
                                    <Printer className="w-3 h-3 mr-1" />
                                    Imprimer QR codes
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {selectedProduct.units.map((unit, index) => (
                                    <motion.div
                                        key={unit.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            duration: 0.5,
                                            delay: index * 0.05,
                                        }}
                                        className="border border-nexsaas-light-gray dark:border-gray-700 rounded-lg p-3"
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span
                                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                            unit.status,
                                                        )}`}
                                                    >
                                                        {getStatusIcon(
                                                            unit.status,
                                                        )}
                                                        <span className="ml-1 capitalize">
                                                            {getStatusDisplayName(
                                                                unit.status,
                                                            )}
                                                        </span>
                                                    </span>
                                                    <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                                        {unit.id}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                                                    <div className="flex items-center">
                                                        <Hash className="w-4 h-4 text-gray-400 mr-1" />
                                                        <div>
                                                            <span className="text-gray-500 dark:text-gray-400 text-xs">
                                                                Série:
                                                            </span>
                                                            <p className="text-nexsaas-vanta-black dark:text-gray-300 text-sm font-medium">
                                                                {
                                                                    unit.serialNumber
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Hash className="w-4 h-4 text-gray-400 mr-1" />
                                                        <div>
                                                            <span className="text-gray-500 dark:text-gray-400 text-xs">
                                                                Lot:
                                                            </span>
                                                            <p className="text-nexsaas-vanta-black dark:text-gray-300 text-sm font-medium">
                                                                {unit.lot}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                                                        <div>
                                                            <span className="text-gray-500 dark:text-gray-400 text-xs">
                                                                Localisation:
                                                            </span>
                                                            <p className="text-nexsaas-vanta-black dark:text-gray-300 text-sm font-medium">
                                                                {unit.location}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                                                        <div>
                                                            <span className="text-gray-500 dark:text-gray-400 text-xs">
                                                                Reçu le:
                                                            </span>
                                                            <p className="text-nexsaas-vanta-black dark:text-gray-300 text-sm font-medium">
                                                                {
                                                                    unit.receivedDate
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {unit.soldDate && (
                                                        <div className="flex items-center">
                                                            <User className="w-4 h-4 text-gray-400 mr-1" />
                                                            <div>
                                                                <span className="text-gray-500 dark:text-gray-400 text-xs">
                                                                    Vendu le:
                                                                </span>
                                                                <p className="text-nexsaas-vanta-black dark:text-gray-300 text-sm font-medium">
                                                                    {
                                                                        unit.soldDate
                                                                    }
                                                                </p>
                                                                {unit.soldTo && (
                                                                    <p className="text-xs text-nexsaas-vanta-black dark:text-gray-300">
                                                                        à{" "}
                                                                        {
                                                                            unit.soldTo
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {unit.notes && (
                                                    <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300 mt-2 italic">
                                                        {unit.notes}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex flex-col space-y-2 mt-3 lg:mt-0 lg:ml-4">
                                                <select
                                                    value={unit.status}
                                                    onChange={(e) =>
                                                        handleChangeUnitStatus(
                                                            selectedProduct.id,
                                                            unit.id,
                                                            e.target
                                                                .value as StatutProduitStock,
                                                        )
                                                    }
                                                    className="px-2 py-1 text-xs border border-nexsaas-light-gray dark:border-gray-600 rounded bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white"
                                                >
                                                    {Object.values(
                                                        StatutProduitStock,
                                                    ).map((status) => (
                                                        <option
                                                            key={status}
                                                            value={status}
                                                        >
                                                            {getStatusDisplayName(
                                                                status,
                                                            )}
                                                        </option>
                                                    ))}
                                                </select>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleEditUnit(
                                                            selectedProduct,
                                                            unit,
                                                        )
                                                    }
                                                >
                                                    <Edit className="w-3 h-3 mr-1" />
                                                    Modifier
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDeleteUnit(
                                                            selectedProduct.id,
                                                            unit.id,
                                                        )
                                                    }
                                                    className="text-red-500 hover:text-red-600"
                                                >
                                                    <Trash2 className="w-3 h-3 mr-1" />
                                                    Supprimer
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {showUnitForm && selectedProduct && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                        onClick={() => setShowUnitForm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-nexsaas-pure-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-4">
                                {selectedUnit
                                    ? "Modifier l'unité"
                                    : "Ajouter des unités"}
                            </h2>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <Input
                                        label="Numéro de série"
                                        value={unitForm.serialNumber}
                                        onChange={(value) =>
                                            setUnitForm({
                                                ...unitForm,
                                                serialNumber: value,
                                            })
                                        }
                                        required
                                    />
                                    <Input
                                        label="Numéro de lot"
                                        value={unitForm.lot}
                                        onChange={(value) =>
                                            setUnitForm({
                                                ...unitForm,
                                                lot: value,
                                            })
                                        }
                                        required
                                    />
                                    {!selectedUnit && (
                                        <Input
                                            label="Quantité"
                                            type="number"
                                            min="1"
                                            value={unitForm.quantity}
                                            onChange={(value) =>
                                                setUnitForm({
                                                    ...unitForm,
                                                    quantity: value,
                                                })
                                            }
                                            required
                                        />
                                    )}
                                </div>

                                <Input
                                    label="Localisation"
                                    value={unitForm.location}
                                    onChange={(value) =>
                                        setUnitForm({
                                            ...unitForm,
                                            location: value,
                                        })
                                    }
                                    placeholder="ex: Entrepôt A - Étagère 1"
                                    required
                                />

                                <div>
                                    <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-1">
                                        Notes
                                    </label>
                                    <textarea
                                        value={unitForm.notes}
                                        onChange={(e) =>
                                            setUnitForm({
                                                ...unitForm,
                                                notes: e.target.value,
                                            })
                                        }
                                        rows={3}
                                        className="w-full px-3 py-2 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white text-sm focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                                        placeholder="Notes sur l'unité..."
                                    />
                                </div>

                                {!selectedUnit && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                            <strong>
                                                QR Codes générés
                                                automatiquement:
                                            </strong>
                                            <br />
                                            Format: QR-{selectedProduct.id}
                                            -UNIT-XXX
                                            <br />
                                            {parseInt(unitForm.quantity) > 1 &&
                                                "Les numéros de série seront suffixés automatiquement"}
                                        </p>
                                    </div>
                                )}

                                <div className="flex justify-end space-x-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowUnitForm(false)}
                                        size="sm"
                                    >
                                        Annuler
                                    </Button>
                                    <Button onClick={handleSaveUnit} size="sm">
                                        {selectedUnit ? "Modifier" : "Ajouter"}{" "}
                                        {selectedUnit
                                            ? "l'unité"
                                            : "les unités"}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {showQRGenerator && selectedProduct && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                        onClick={() => setShowQRGenerator(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-nexsaas-pure-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                    QR Codes - {selectedProduct.name}
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowQRGenerator(false)}
                                >
                                    ✕
                                </Button>
                            </div>

                            <div className="mb-4 flex justify-between items-center">
                                <p className="text-nexsaas-vanta-black dark:text-gray-300 text-sm">
                                    {selectedProduct.units.length} QR codes
                                    générés pour ce produit
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            handlePrintQRCodes(selectedProduct)
                                        }
                                        size="sm"
                                    >
                                        <Printer className="w-3 h-3 mr-1" />
                                        Imprimer tous
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {selectedProduct.units.map((unit) => (
                                    <div
                                        key={unit.id}
                                        className="border border-nexsaas-light-gray dark:border-gray-700 rounded-lg p-3 text-center"
                                    >
                                        {unit.qrCode ? (
                                            <img
                                                src={`${URL_API}${unit.qrCode}`}
                                                alt={`QR Code for ${unit.serialNumber}`}
                                                className="w-28 h-28 mx-auto mb-3 rounded-lg object-contain"
                                                onError={(e) => {
                                                    e.currentTarget.style.display =
                                                        "none";
                                                    e.currentTarget.nextElementSibling!.style.display =
                                                        "flex";
                                                }}
                                            />
                                        ) : null}
                                        <div
                                            className="w-28 h-28 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-3 flex items-center justify-center"
                                            style={{
                                                display: unit.qrCode
                                                    ? "none"
                                                    : "flex",
                                            }}
                                        >
                                            <QrCode className="w-14 h-14 text-gray-400" />
                                        </div>
                                        <p className="text-xs font-mono text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-1">
                                            {unit.serialNumber}
                                        </p>
                                        <p className="text-xs font-mono text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-1">
                                            Lot: {unit.lot}
                                        </p>
                                        <span
                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                unit.status,
                                            )}`}
                                        >
                                            {getStatusDisplayName(unit.status)}
                                        </span>
                                        <div className="mt-2 flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                            >
                                                <Printer className="w-3 h-3 mr-1" />
                                                Imprimer
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                <QRCodePrint
                    qrCodes={
                        selectedProduct
                            ? getProductQRCodes(selectedProduct)
                            : getAllQRCodes()
                    }
                    onClose={() => setShowQRPrint(false)}
                    isOpen={showQRPrint}
                />
            </div>
        </div>
    );
};

export default StockPage;
