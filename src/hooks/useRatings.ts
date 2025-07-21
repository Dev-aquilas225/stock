import { useState, useEffect } from "react";
import { useToast } from "../contexts/ToastContext";
import { useActivity } from "../contexts/ActivityContext";
import { RatingDto, Rating, fetchRating, addOrUpdateRating } from "../api/ratingsApi";

// Use 'export type' for re-exporting interfaces with isolatedModules
export type { Rating, RatingDto };

export const useRatings = (fournisseurId: string) => {
    const [ratings, setRatings] = useState<Rating[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();
    const { logActivity } = useActivity();

    // Validate RatingDto
    const validateRating = (data: RatingDto): string | null => {
        if (!data.qualiteProduit || !data.respectDelais || !data.fiabilite) {
            return "Tous les critères de notation (qualité, délais, fiabilité) sont requis";
        }
        if (
            data.qualiteProduit < 1 || data.qualiteProduit > 5 ||
            data.respectDelais < 1 || data.respectDelais > 5 ||
            data.fiabilite < 1 || data.fiabilite > 5
        ) {
            return "Les notes doivent être comprises entre 1 et 5";
        }
        return null;
    };

    const loadRating = async () => {
        if (!fournisseurId) {
            console.log("No fournisseurId provided, skipping rating fetch");
            setRatings(null);
            setError(null);
            return;
        }

        setLoading(true);
        try {
            console.log(`useRatings: Fetching rating for fournisseurId: ${fournisseurId}`);
            const fetchedRating: Rating | null = await fetchRating(fournisseurId);
            setRatings(fetchedRating ? [fetchedRating] : null);
            setError(null);
            console.log(`useRatings: Successfully fetched rating for fournisseurId: ${fournisseurId}`, fetchedRating);
        } catch (error: any) {
            const errorMessage =
                error.response?.status === 401
                    ? "Non autorisé : Veuillez vous reconnecter"
                    : error.response?.status === 404
                        ? "Évaluation ou fournisseur non trouvé"
                        : error.response?.data?.message || "Erreur lors du chargement de l'évaluation";
            console.error(`useRatings: Error fetching rating for fournisseurId ${fournisseurId}:`, {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
            });
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
        // Validate input
        const validationError = validateRating(data);
        if (validationError) {
            console.error("useRatings: Validation failed:", validationError);
            setError(validationError);
            showToast({
                type: "error",
                title: "Erreur de validation",
                message: validationError,
                duration: 5000,
            });
            throw new Error(validationError);
        }

        setLoading(true);
        try {
            console.log(`useRatings: Saving rating for fournisseurId: ${fournisseurId}`, data);
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
            console.log(`useRatings: Successfully saved rating for fournisseurId: ${fournisseurId}`, updatedRating);
            return updatedRating;
        } catch (error: any) {
            const errorMessage =
                error.response?.status === 400
                    ? error.response?.data?.message || "Données d'évaluation invalides"
                    : error.response?.status === 401
                        ? "Non autorisé : Veuillez vous reconnecter"
                        : error.response?.status === 404
                            ? "Fournisseur non trouvé"
                            : error.response?.status === 409
                                ? "Une évaluation existe déjà pour ce fournisseur"
                                : error.response?.data?.message || "Erreur lors de l'enregistrement de l'évaluation";
            console.error("useRatings: Error saving rating:", {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
            });
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

    // Return the latest rating for compatibility with SuppliersPage.tsx
    const latestRating = ratings && ratings.length > 0 ? ratings[ratings.length - 1] : null;

    return { ratings: latestRating, addOrUpdate, loading, error };
};
