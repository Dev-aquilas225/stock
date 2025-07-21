import { useState, useEffect } from "react";
import { useToast } from "../contexts/ToastContext";
import { useActivity } from "../contexts/ActivityContext";
import axiosClient from "../api/axiosClient";

export interface PriceHistory {
    id: string;
    price: number;
    date: string;
    negotiatedBy: string;
    notes: string;
}

export interface PriceHistoryDto {
    price: number;
    date: string;
    negotiatedBy: string;
    notes: string;
}

export const usePriceHistory = (fournisseurId: string, productId: string) => {
    const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();
    const { logActivity } = useActivity();

    useEffect(() => {
        const fetchPriceHistory = async () => {
            if (!fournisseurId || !productId) {
                console.log("No fournisseurId or productId provided, skipping price history fetch");
                setPriceHistory([]);
                setError(null);
                return;
            }

            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("No authentication token found");
                // Attempt to fetch price history; adjust endpoint if needed
                const response = await axiosClient.get(`/fournisseurs/${fournisseurId}/produits/${productId}/price-history`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log(`Fetched price history for fournisseur ${fournisseurId}, product ${productId}:`, response.data);
                const fetchedPriceHistory: PriceHistory[] = response.data.data?.map((entry: any) => ({
                    id: entry.id,
                    price: parseFloat(entry.price) || 0,
                    date: entry.date || new Date().toISOString(),
                    negotiatedBy: entry.negotiatedBy || "unknown",
                    notes: entry.notes || "",
                })) || [];
                setPriceHistory(fetchedPriceHistory);
                setError(null);
            } catch (error: any) {
                const status = error.response?.status;
                let errorMessage = "Erreur lors de la récupération de l'historique des prix";
                if (status === 404) {
                    errorMessage = `Historique des prix non trouvé pour le produit ${productId} du fournisseur ${fournisseurId}`;
                    setPriceHistory([]); // Set empty array for 404
                } else {
                    errorMessage = error.response?.data?.message || errorMessage;
                }
                console.error(`Error fetching price history for product ${productId} of fournisseur ${fournisseurId}:`, error);
                setError(errorMessage);
                showToast({
                    type: "error",
                    title: "Erreur",
                    message: errorMessage,
                    duration: 5000,
                });
            } finally {
                setLoading(false);
            }
        };
        fetchPriceHistory();
    }, [fournisseurId, productId, showToast]);

    const add = async (data: PriceHistoryDto): Promise<PriceHistory> => {
        if (!fournisseurId || !productId) {
            const errorMessage = "fournisseurId or productId is missing";
            setError(errorMessage);
            showToast({
                type: "error",
                title: "Erreur",
                message: errorMessage,
                duration: 5000,
            });
            throw new Error(errorMessage);
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No authentication token found");
            const response = await axiosClient.post(`/fournisseurs/${fournisseurId}/produits/${productId}/price-history`, {
                price: data.price,
                date: data.date || new Date().toISOString(),
                negotiatedBy: data.negotiatedBy || "unknown",
                notes: data.notes || "",
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(`Added price history for product ${productId}:`, response.data);
            const newPriceHistory: PriceHistory = {
                id: response.data.data.id,
                price: parseFloat(response.data.data.price) || 0,
                date: response.data.data.date || new Date().toISOString(),
                negotiatedBy: response.data.data.negotiatedBy || "unknown",
                notes: response.data.data.notes || "",
            };
            // Refetch to ensure UI consistency
            const fetchResponse = await axiosClient.get(`/fournisseurs/${fournisseurId}/produits/${productId}/price-history`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPriceHistory(fetchResponse.data.data?.map((entry: any) => ({
                id: entry.id,
                price: parseFloat(entry.price) || 0,
                date: entry.date || new Date().toISOString(),
                negotiatedBy: entry.negotiatedBy || "unknown",
                notes: entry.notes || "",
            })) || []);
            showToast({
                type: "success",
                title: "Historique des prix mis à jour",
                message: `Nouveau prix ajouté: €${data.price}`,
                duration: 3000,
            });
            logActivity({
                type: "create",
                module: "Historique des prix",
                description: `Nouveau prix ajouté pour le produit ${productId}: €${data.price}`,
                userId: localStorage.getItem("nexsaas_user")
                    ? JSON.parse(localStorage.getItem("nexsaas_user")!)?.id || "unknown"
                    : "unknown",
                metadata: { fournisseurId, productId, price: data.price },
            });
            return newPriceHistory;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Erreur lors de l'ajout de l'historique des prix";
            console.error(`Error adding price history for product ${productId} of fournisseur ${fournisseurId}:`, error);
            setError(errorMessage);
            showToast({
                type: "error",
                title: "Erreur",
                message: errorMessage,
                duration: 5000,
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const update = async (priceHistoryId: string, data: Partial<PriceHistoryDto>): Promise<PriceHistory> => {
        if (!fournisseurId || !productId) {
            const errorMessage = "fournisseurId or productId is missing";
            setError(errorMessage);
            showToast({
                type: "error",
                title: "Erreur",
                message: errorMessage,
                duration: 5000,
            });
            throw new Error(errorMessage);
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No authentication token found");
            const response = await axiosClient.put(`/fournisseurs/${fournisseurId}/produits/${productId}/price-history/${priceHistoryId}`, {
                price: data.price,
                date: data.date,
                negotiatedBy: data.negotiatedBy,
                notes: data.notes,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(`Updated price history ${priceHistoryId} for product ${productId}:`, response.data);
            const updatedPriceHistory: PriceHistory = {
                id: response.data.data.id,
                price: parseFloat(response.data.data.price) || 0,
                date: response.data.data.date || new Date().toISOString(),
                negotiatedBy: response.data.data.negotiatedBy || "unknown",
                notes: response.data.data.notes || "",
            };
            // Refetch to ensure UI consistency
            const fetchResponse = await axiosClient.get(`/fournisseurs/${fournisseurId}/produits/${productId}/price-history`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPriceHistory(fetchResponse.data.data?.map((entry: any) => ({
                id: entry.id,
                price: parseFloat(entry.price) || 0,
                date: entry.date || new Date().toISOString(),
                negotiatedBy: entry.negotiatedBy || "unknown",
                notes: entry.notes || "",
            })) || []);
            showToast({
                type: "success",
                title: "Historique des prix mis à jour",
                message: `Prix modifié: €${data.price || updatedPriceHistory.price}`,
                duration: 3000,
            });
            logActivity({
                type: "update",
                module: "Historique des prix",
                description: `Prix modifié pour le produit ${productId}: €${data.price || updatedPriceHistory.price}`,
                userId: localStorage.getItem("nexsaas_user")
                    ? JSON.parse(localStorage.getItem("nexsaas_user")!)?.id || "unknown"
                    : "unknown",
                metadata: { fournisseurId, productId, price: data.price || updatedPriceHistory.price },
            });
            return updatedPriceHistory;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Erreur lors de la mise à jour de l'historique des prix";
            console.error(`Error updating price history ${priceHistoryId} for product ${productId} of fournisseur ${fournisseurId}:`, error);
            setError(errorMessage);
            showToast({
                type: "error",
                title: "Erreur",
                message: errorMessage,
                duration: 5000,
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const remove = async (priceHistoryId: string): Promise<void> => {
        if (!fournisseurId || !productId) {
            const errorMessage = "fournisseurId or productId is missing";
            setError(errorMessage);
            showToast({
                type: "error",
                title: "Erreur",
                message: errorMessage,
                duration: 5000,
            });
            throw new Error(errorMessage);
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No authentication token found");
            await axiosClient.delete(`/fournisseurs/${fournisseurId}/produits/${productId}/price-history/${priceHistoryId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(`Deleted price history ${priceHistoryId} for product ${productId}`);
            // Refetch to ensure UI consistency
            const fetchResponse = await axiosClient.get(`/fournisseurs/${fournisseurId}/produits/${productId}/price-history`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPriceHistory(fetchResponse.data.data?.map((entry: any) => ({
                id: entry.id,
                price: parseFloat(entry.price) || 0,
                date: entry.date || new Date().toISOString(),
                negotiatedBy: entry.negotiatedBy || "unknown",
                notes: entry.notes || "",
            })) || []);
            showToast({
                type: "success",
                title: "Historique des prix mis à jour",
                message: "Entrée de prix supprimée",
                duration: 3000,
            });
            logActivity({
                type: "delete",
                module: "Historique des prix",
                description: `Entrée de prix supprimée pour le produit ${productId}`,
                userId: localStorage.getItem("nexsaas_user")
                    ? JSON.parse(localStorage.getItem("nexsaas_user")!)?.id || "unknown"
                    : "unknown",
                metadata: { fournisseurId, productId },
            });
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Erreur lors de la suppression de l'historique des prix";
            console.error(`Error deleting price history ${priceHistoryId} for product ${productId} of fournisseur ${fournisseurId}:`, error);
            setError(errorMessage);
            showToast({
                type: "error",
                title: "Erreur",
                message: errorMessage,
                duration: 5000,
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return { priceHistory, add, update, remove, loading, error };
};

export interface ProductDto {
    nomProduit: string;
    prixNegocie: number;
    conditionnement: string;
    delaiApprovisionnement: string;
}

export interface Product {
    id: string;
    nomProduit: string;
    prixNegocie: number;
    conditionnement: string;
    delaiApprovisionnement: string;
    fournisseurId: string;
    createdAt: string;
    priceHistory: PriceHistory[];
}

export const useProducts = (fournisseurId: string) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();
    const { logActivity } = useActivity();

    const fetchProducts = async () => {
        if (!fournisseurId) {
            console.log("No fournisseurId provided, skipping product fetch");
            setProducts([]);
            setError(null);
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No authentication token found");
            const response = await axiosClient.get(`/fournisseurs/${fournisseurId}/produits`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(`Fetched products for fournisseur ${fournisseurId}:`, response.data);
            const fetchedProducts: Product[] = response.data.data.map((product: any) => ({
                id: product.id,
                nomProduit: product.nomProduit || "",
                prixNegocie: parseFloat(product.prixNegocie) || 0,
                conditionnement: product.conditionnement || "",
                delaiApprovisionnement: product.delaiApprovisionnement || "",
                fournisseurId: product.fournisseurId || fournisseurId,
                createdAt: product.createdAt || new Date().toISOString(),
                priceHistory: product.priceHistory ? product.priceHistory.map((ph: any) => ({
                    id: ph.id,
                    price: parseFloat(ph.price) || 0,
                    date: ph.date || new Date().toISOString(),
                    negotiatedBy: ph.negotiatedBy || "unknown",
                    notes: ph.notes || "",
                })) : [],
            }));
            setProducts(fetchedProducts);
            setError(null);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Erreur lors du chargement des produits";
            console.error(`Error fetching products for fournisseurId ${fournisseurId}:`, error);
            setError(errorMessage);
            showToast({
                type: "error",
                title: "Erreur",
                message: errorMessage,
                duration: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [fournisseurId]);

    const add = async (data: ProductDto): Promise<Product> => {
        if (!fournisseurId) {
            const errorMessage = "fournisseurId is missing";
            setError(errorMessage);
            showToast({
                type: "error",
                title: "Erreur",
                message: errorMessage,
                duration: 5000,
            });
            throw new Error(errorMessage);
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No authentication token found");
            const response = await axiosClient.post(`/fournisseurs/${fournisseurId}/produits`, {
                nomProduit: data.nomProduit,
                prixNegocie: data.prixNegocie,
                conditionnement: data.conditionnement,
                delaiApprovisionnement: data.delaiApprovisionnement,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(`Added product for fournisseur ${fournisseurId}:`, response.data);
            const newProduct: Product = {
                id: response.data.id,
                nomProduit: response.data.nomProduit || "",
                prixNegocie: parseFloat(response.data.prixNegocie) || 0,
                conditionnement: response.data.conditionnement || "",
                delaiApprovisionnement: response.data.delaiApprovisionnement || "",
                fournisseurId: response.data.fournisseurId || fournisseurId,
                createdAt: response.data.createdAt || new Date().toISOString(),
                priceHistory: response.data.priceHistory ? response.data.priceHistory.map((ph: any) => ({
                    id: ph.id,
                    price: parseFloat(ph.price) || 0,
                    date: ph.date || new Date().toISOString(),
                    negotiatedBy: ph.negotiatedBy || "unknown",
                    notes: ph.notes || "",
                })) : [],
            };

            // Add initial price history entry
            const { add: addPriceHistory } = usePriceHistory(fournisseurId, newProduct.id);
            const priceHistoryData: PriceHistoryDto = {
                price: newProduct.prixNegocie,
                date: new Date().toISOString(),
                negotiatedBy: localStorage.getItem("nexsaas_user")
                    ? JSON.parse(localStorage.getItem("nexsaas_user")!)?.name || "unknown"
                    : "unknown",
                notes: `Prix initial pour ${newProduct.nomProduit}`,
            };
            await addPriceHistory(priceHistoryData);

            // Refetch products to include updated priceHistory
            await fetchProducts();
            showToast({
                type: "success",
                title: "Produit ajouté",
                message: `Produit ${newProduct.nomProduit} ajouté avec succès pour le fournisseur ${fournisseurId}`,
                duration: 3000,
            });
            logActivity({
                type: "create",
                module: "Produits",
                description: `Nouveau produit ajouté: ${newProduct.nomProduit} pour le fournisseur ${fournisseurId}`,
                userId: localStorage.getItem("nexsaas_user")
                    ? JSON.parse(localStorage.getItem("nexsaas_user")!)?.id || "unknown"
                    : "unknown",
                metadata: { fournisseurId, productId: newProduct.id, prixNegocie: newProduct.prixNegocie },
            });
            return newProduct;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Erreur lors de l'ajout du produit";
            console.error(`Error adding product for fournisseur ${fournisseurId}:`, error);
            setError(errorMessage);
            showToast({
                type: "error",
                title: "Erreur",
                message: errorMessage,
                duration: 5000,
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const update = async (productId: string, data: Partial<ProductDto>): Promise<Product> => {
        if (!fournisseurId) {
            const errorMessage = "fournisseurId is missing";
            setError(errorMessage);
            showToast({
                type: "error",
                title: "Erreur",
                message: errorMessage,
                duration: 5000,
            });
            throw new Error(errorMessage);
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No authentication token found");
            const response = await axiosClient.put(`/fournisseurs/${fournisseurId}/produits/${productId}`, {
                nomProduit: data.nomProduit,
                prixNegocie: data.prixNegocie,
                conditionnement: data.conditionnement,
                delaiApprovisionnement: data.delaiApprovisionnement,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(`Updated product ${productId} for fournisseur ${fournisseurId}:`, response.data);
            const updatedProduct: Product = {
                id: response.data.id,
                nomProduit: response.data.nomProduit || "",
                prixNegocie: parseFloat(response.data.prixNegocie) || 0,
                conditionnement: response.data.conditionnement || "",
                delaiApprovisionnement: response.data.delaiApprovisionnement || "",
                fournisseurId: response.data.fournisseurId || fournisseurId,
                createdAt: response.data.createdAt || new Date().toISOString(),
                priceHistory: response.data.priceHistory ? response.data.priceHistory.map((ph: any) => ({
                    id: ph.id,
                    price: parseFloat(ph.price) || 0,
                    date: ph.date || new Date().toISOString(),
                    negotiatedBy: ph.negotiatedBy || "unknown",
                    notes: ph.notes || "",
                })) : [],
            };

            // Add price history entry if prixNegocie changed
            const currentProduct = products.find((p) => p.id === productId);
            if (currentProduct && data.prixNegocie && currentProduct.prixNegocie !== data.prixNegocie) {
                const { add: addPriceHistory } = usePriceHistory(fournisseurId, productId);
                const priceHistoryData: PriceHistoryDto = {
                    price: data.prixNegocie,
                    date: new Date().toISOString(),
                    negotiatedBy: localStorage.getItem("nexsaas_user")
                        ? JSON.parse(localStorage.getItem("nexsaas_user")!)?.name || "unknown"
                        : "unknown",
                    notes: `Mise à jour du prix pour ${updatedProduct.nomProduit}`,
                };
                await addPriceHistory(priceHistoryData);
            }

            // Refetch products to include updated priceHistory
            await fetchProducts();
            showToast({
                type: "success",
                title: "Produit mis à jour",
                message: `Produit ${updatedProduct.nomProduit} mis à jour avec succès pour le fournisseur ${fournisseurId}`,
                duration: 3000,
            });
            logActivity({
                type: "update",
                module: "Produits",
                description: `Produit mis à jour: ${updatedProduct.nomProduit} pour le fournisseur ${fournisseurId}`,
                userId: localStorage.getItem("nexsaas_user")
                    ? JSON.parse(localStorage.getItem("nexsaas_user")!)?.id || "unknown"
                    : "unknown",
                metadata: { fournisseurId, productId, prixNegocie: updatedProduct.prixNegocie },
            });
            return updatedProduct;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Erreur lors de la mise à jour du produit";
            console.error(`Error updating product ${productId} for fournisseur ${fournisseurId}:`, error);
            setError(errorMessage);
            showToast({
                type: "error",
                title: "Erreur",
                message: errorMessage,
                duration: 5000,
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const remove = async (productId: string): Promise<void> => {
        if (!fournisseurId) {
            const errorMessage = "fournisseurId is missing";
            setError(errorMessage);
            showToast({
                type: "error",
                title: "Erreur",
                message: errorMessage,
                duration: 5000,
            });
            throw new Error(errorMessage);
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No authentication token found");
            await axiosClient.delete(`/fournisseurs/${fournisseurId}/produits/${productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(`Deleted product ${productId} for fournisseur ${fournisseurId}`);
            // Refetch products to ensure UI reflects the latest data
            await fetchProducts();
            showToast({
                type: "success",
                title: "Produit supprimé",
                message: `Produit ${productId} supprimé avec succès pour le fournisseur ${fournisseurId}`,
                duration: 3000,
            });
            logActivity({
                type: "delete",
                module: "Produits",
                description: `Produit supprimé: ${productId} pour le fournisseur ${fournisseurId}`,
                userId: localStorage.getItem("nexsaas_user")
                    ? JSON.parse(localStorage.getItem("nexsaas_user")!)?.id || "unknown"
                    : "unknown",
                metadata: { fournisseurId, productId },
            });
            setError(null);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Erreur lors de la suppression du produit";
            console.error(`Error deleting product ${productId} for fournisseur ${fournisseurId}:`, error);
            setError(errorMessage);
            showToast({
                type: "error",
                title: "Erreur",
                message: errorMessage,
                duration: 5000,
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return { products, add, update, remove, loading, error, fetchProducts };
};