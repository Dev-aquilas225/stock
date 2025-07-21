import { useState, useEffect } from "react";
import { useToast } from "../contexts/ToastContext";
import { useActivity } from "../contexts/ActivityContext";
import { RatingDto, Rating, fetchRating, addOrUpdateRating } from "../api/ratingsApi";

// Use 'export type' for re-exporting interfaces with isolatedModules
export type { Rating, RatingDto };

export const useRatings = (fournisseurId: string) => {
    const [ratings, setRatings] = useState<Rating | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();
    const { logActivity } = useActivity();

    const loadRating = async () => {
        if (!fournisseurId) {
            console.log("No fournisseurId provided, skipping rating fetch");
            setRatings(null);
            setError(null);
            return;
        }

        setLoading(true);
        try {
            const fetchedRating: Rating | null = await fetchRating(fournisseurId);
            setRatings(fetchedRating);
            setError(null);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Erreur lors du chargement de l'évaluation";
            console.error(`Error fetching rating for fournisseurId ${fournisseurId}:`, error);
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
        loadRating();
    }, [fournisseurId]);

    const addOrUpdate = async (data: RatingDto): Promise<Rating> => {
        setLoading(true);
        try {
            const updatedRating: Rating = await addOrUpdateRating(fournisseurId, data);
            await loadRating(); // Refresh ratings after update
            showToast({
                type: "success",
                title: "Évaluation enregistrée",
                message: "L'évaluation a été enregistrée avec succès.",
                duration: 3000,
            });
            logActivity({
                type: "update",
                module: "Évaluations",
                description: `Évaluation mise à jour pour le fournisseur ${fournisseurId}`,
                userId: localStorage.getItem("nexsaas_user")
                    ? JSON.parse(localStorage.getItem("nexsaas_user")!).id ?? "unknown"
                    : "unknown",
                metadata: {
                    fournisseurId,
                    qualiteProduit: data.qualiteProduit,
                    respectDelais: data.respectDelais,
                    fiabilite: data.fiabilite,
                },
            });
            setError(null);
            return updatedRating;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Erreur lors de l'enregistrement de l'évaluation";
            console.error("Error saving rating:", error);
            setError(errorMessage);
            showToast({
                type: "error",
                title: "Erreur d'enregistrement",
                message: errorMessage,
                duration: 5000,
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return { ratings, addOrUpdate, loading, error };
};
