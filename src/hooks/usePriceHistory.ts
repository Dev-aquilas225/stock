import { useState, useEffect } from "react";
import { useProducts, usePriceHistory, ProductDto, PriceHistoryDto } from "./useProducts";
import { Button } from "./ui/button"; // Adjust based on your UI library

interface Supplier {
    id: string;
    name: string;
}

const SuppliersPage = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]); // Fetch from API
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [productForm, setProductForm] = useState<ProductDto>({
        nomProduit: "",
        prixNegocie: 0,
        conditionnement: "",
        delaiApprovisionnement: "",
    });
    const [priceHistoryForm, setPriceHistoryForm] = useState<PriceHistoryDto>({
        price: 0,
        date: "",
        negotiatedBy: "",
        notes: "",
    });
    const [showPriceHistoryModal, setShowPriceHistoryModal] = useState(false);

    const { products, add: addProduct, update: updateProduct, remove: removeProduct, fetchProducts, loading, error } = useProducts(selectedSupplier?.id || "");
    const { priceHistory, add: addPriceHistory, update: updatePriceHistory, remove: removePriceHistory, loading: priceLoading, error: priceError } = usePriceHistory(selectedSupplier?.id || "", selectedProduct?.id || "");

    // Fetch suppliers on mount
    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("No authentication token found");
                const response = await axiosClient.get("/fournisseurs", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setSuppliers(response.data.data.map((s: any) => ({ id: s.id, name: s.name || `Fournisseur ${s.id}` })));
            } catch (error: any) {
                console.error("Error fetching suppliers:", error);
            }
        };
        fetchSuppliers();
    }, []);

    // Reset products and selected product when supplier changes
    useEffect(() => {
        setSelectedProduct(null);
        setShowPriceHistoryModal(false);
        setPriceHistoryForm({ price: 0, date: "", negotiatedBy: "", notes: "" });
        if (selectedSupplier?.id) {
            fetchProducts();
        }
    }, [selectedSupplier, fetchProducts]);

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSupplier) return;
        try {
            await addProduct({
                nomProduit: productForm.nomProduit,
                prixNegocie: parseFloat(productForm.prixNegocie.toString()) || 0,
                conditionnement: productForm.conditionnement,
                delaiApprovisionnement: productForm.delaiApprovisionnement,
            });
            setProductForm({ nomProduit: "", prixNegocie: 0, conditionnement: "", delaiApprovisionnement: "" });
        } catch (err) {
            // Error handled by useProducts
        }
    };

    const handleSavePriceHistory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSupplier || !selectedProduct) return;
        try {
            const priceHistoryData: PriceHistoryDto = {
                price: parseFloat(priceHistoryForm.price.toString()) || 0,
                date: priceHistoryForm.date || new Date().toISOString(),
                negotiatedBy: priceHistoryForm.negotiatedBy || "unknown",
                notes: priceHistoryForm.notes,
            };
            await addPriceHistory(priceHistoryData);
            // Update product's prixNegocie if changed
            if (priceHistoryData.price !== selectedProduct.prixNegocie) {
                await updateProduct(selectedProduct.id, {
                    nomProduit: selectedProduct.nomProduit,
                    prixNegocie: priceHistoryData.price,
                    conditionnement: selectedProduct.conditionnement,
                    delaiApprovisionnement: selectedProduct.delaiApprovisionnement,
                });
            }
            setShowPriceHistoryModal(false);
            setPriceHistoryForm({ price: 0, date: "", negotiatedBy: "", notes: "" });
        } catch (err) {
            // Error handled by usePriceHistory
        }
    };

    return (
        <div className="p-4">
            {/* Supplier selection */}
            <select
                value={selectedSupplier?.id || ""}
                onChange={(e) => {
                    const supplier = suppliers.find((s) => s.id === e.target.value) || null;
                    setSelectedSupplier(supplier);
                }}
                className="border rounded p-2 mb-4"
            >
                <option value="">Sélectionner un fournisseur</option>
                {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                    </option>
                ))}
            </select>

            {/* Product creation form */}
            {selectedSupplier && (
                <form onSubmit={handleAddProduct} className="mb-4">
                    <input
                        type="text"
                        value={productForm.nomProduit}
                        onChange={(e) => setProductForm({ ...productForm, nomProduit: e.target.value })}
                        placeholder="Nom du produit"
                        className="border rounded p-2 mr-2"
                    />
                    <input
                        type="number"
                        value={productForm.prixNegocie}
                        onChange={(e) => setProductForm({ ...productForm, prixNegocie: parseFloat(e.target.value) || 0 })}
                        placeholder="Prix négocié"
                        className="border rounded p-2 mr-2"
                    />
                    <input
                        type="text"
                        value={productForm.conditionnement}
                        onChange={(e) => setProductForm({ ...productForm, conditionnement: e.target.value })}
                        placeholder="Conditionnement"
                        className="border rounded p-2 mr-2"
                    />
                    <input
                        type="text"
                        value={productForm.delaiApprovisionnement}
                        onChange={(e) => setProductForm({ ...productForm, delaiApprovisionnement: e.target.value })}
                        placeholder="Délai d'approvisionnement"
                        className="border rounded p-2 mr-2"
                    />
                    <Button type="submit" disabled={loading || !selectedSupplier}>Ajouter Produit</Button>
                </form>
            )}

            {/* Product list */}
            {loading && <p>Chargement...</p>}
            {error && <p className="text-red-500">Erreur: {error}</p>}
            {selectedSupplier && (
                <ul className="space-y-2">
                    {products.map((product) => (
                        <li key={product.id} className="border rounded p-2 flex justify-between items-center">
                            <div>
                                <p>{product.nomProduit} - €{product.prixNegocie.toFixed(2)}</p>
                                <p>Conditionnement: {product.conditionnement}</p>
                                <p>Délai: {product.delaiApprovisionnement}</p>
                            </div>
                            <div className="space-x-2">
                                <Button onClick={() => { setSelectedProduct(product); setShowPriceHistoryModal(true); }} disabled={loading}>
                                    Gérer l'historique des prix
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={async () => {
                                        if (confirm("Supprimer ce produit ?")) {
                                            await removeProduct(product.id);
                                        }
                                    }}
                                    disabled={loading}
                                >
                                    Supprimer
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* Price history modal */}
            {showPriceHistoryModal && selectedProduct && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg w-1/2">
                        <h3 className="text-lg font-bold">Historique des prix pour {selectedProduct.nomProduit}</h3>
                        {priceLoading && <p>Chargement...</p>}
                        {priceError && <p className="text-red-500">Erreur: {priceError}</p>}
                        {priceHistory.map((entry) => (
                            <div key={entry.id} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mb-2">
                                <p>Prix: €{entry.price.toFixed(2)} • Date: {new Date(entry.date).toLocaleDateString()}</p>
                                <p>Négocié par: {entry.negotiatedBy} • Notes: {entry.notes || "Aucune note"}</p>
                                <div className="flex space-x-2 mt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setPriceHistoryForm({
                                                price: entry.price,
                                                date: entry.date.split("T")[0],
                                                negotiatedBy: entry.negotiatedBy,
                                                notes: entry.notes,
                                            });
                                        }}
                                    >
                                        Modifier
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={async () => {
                                            if (confirm("Supprimer cette entrée ?")) {
                                                await removePriceHistory(entry.id);
                                            }
                                        }}
                                    >
                                        Supprimer
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <form onSubmit={handleSavePriceHistory} className="mt-4">
                            <input
                                type="number"
                                value={priceHistoryForm.price}
                                onChange={(e) => setPriceHistoryForm({ ...priceHistoryForm, price: parseFloat(e.target.value) || 0 })}
                                placeholder="Prix"
                                className="border rounded p-2 mr-2"
                            />
                            <input
                                type="date"
                                value={priceHistoryForm.date}
                                onChange={(e) => setPriceHistoryForm({ ...priceHistoryForm, date: e.target.value })}
                                className="border rounded p-2 mr-2"
                            />
                            <input
                                type="text"
                                value={priceHistoryForm.negotiatedBy}
                                onChange={(e) => setPriceHistoryForm({ ...priceHistoryForm, negotiatedBy: e.target.value })}
                                placeholder="Négocié par"
                                className="border rounded p-2 mr-2"
                            />
                            <textarea
                                value={priceHistoryForm.notes}
                                onChange={(e) => setPriceHistoryForm({ ...priceHistoryForm, notes: e.target.value })}
                                placeholder="Notes"
                                className="border rounded p-2 w-full"
                            />
                            <Button type="submit" disabled={priceLoading}>Ajouter/Modifier</Button>
                            <Button
                                variant="outline"
                                onClick={() => setShowPriceHistoryModal(false)}
                                className="ml-2"
                            >
                                Fermer
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuppliersPage;