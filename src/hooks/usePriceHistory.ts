import { useState, useEffect } from "react";
import { useToast } from "../contexts/ToastContext";
import { useActivity } from "../contexts/ActivityContext";
import axios from "axios";

interface PriceHistory {
    id: string;
    price: number;
    date: string;
    negotiatedBy: string;
    notes: string;
}

interface PriceHistoryDto {
    price: number;
    date: string;
    negotiatedBy: string;
    notes: string;
}

export const usePriceHistory = (supplierId: string, productId: string) => {
    const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();
    const { logActivity } = useActivity();

    useEffect(() => {
        const fetchPriceHistory = async () => {
            if (!supplierId || !productId) return;
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`/api/suppliers/${supplierId}/products/${productId}/price-history`);
                setPriceHistory(response.data.data);
            } catch (err: any) {
                const errorMessage = err.response?.data?.message || "Erreur lors de la récupération de l'historique des prix";
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
    }, [supplierId, productId, showToast]);

    const add = async (priceHistoryEntry: PriceHistoryDto) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`/api/suppliers/${supplierId}/products/${productId}/price-history`, priceHistoryEntry);
            const newPriceHistory: PriceHistory = {
                ...response.data.data,
                id: response.data.data.id || `PH-${Date.now()}`,
            };
            setPriceHistory([...priceHistory, newPriceHistory]);
            showToast({
                type: "success",
                title: "Historique des prix mis à jour",
                message: `Nouveau prix ajouté: €${priceHistoryEntry.price}`,
                duration: 3000,
            });
            logActivity({
                type: "create",
                module: "Historique des prix",
                description: `Nouveau prix ajouté pour le produit ${productId}: €${priceHistoryEntry.price}`,
                userId: localStorage.getItem("nexsaas_user")
                    ? JSON.parse(localStorage.getItem("nexsaas_user")!).id
                    : "unknown",
                metadata: { supplierId, productId, price: priceHistoryEntry.price },
            });
            return newPriceHistory;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Erreur lors de l'ajout de l'historique des prix";
            setError(errorMessage);
            showToast({
                type: "error",
                title: "Erreur",
                message: errorMessage,
                duration: 5000,
            });
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return { priceHistory, loading, error, add };
};