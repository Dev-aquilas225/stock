import axiosClient from "./axiosClient";

// Interfaces for Rating and RatingDto
export interface Rating {
    id: string;
    fournisseurId: string;
    qualiteProduit: number;
    respectDelais: number;
    fiabilite: number;
    commentaire: string;
    createdAt: string;
}

export interface RatingDto {
    qualiteProduit: number;
    respectDelais: number;
    fiabilite: number;
    commentaire: string;
}

// Fetch rating for a supplier
export const fetchRating = async (fournisseurId: string): Promise<Rating | null> => {
    try {
        console.log(`ratingsApi: Fetching rating for fournisseurId: ${fournisseurId}`);
        const response = await axiosClient.get(`/fournisseurs/${fournisseurId}/evaluations`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        console.log(`ratingsApi: Successfully fetched rating for fournisseurId: ${fournisseurId}`, response.data);
        return response.data || null;
    } catch (error: any) {
        console.error("ratingsApi: Error fetching rating:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
        });
        const errorMessage =
            error.response?.status === 401
                ? "Non autorisé : Veuillez vous reconnecter"
                : error.response?.status === 404
                    ? "Évaluation ou fournisseur non trouvé"
                    : error.response?.data?.message || "Erreur lors du chargement de l'évaluation";
        throw new Error(errorMessage);
    }
};

// Add or update a rating for a supplier
export const addOrUpdateRating = async (fournisseurId: string, data: RatingDto): Promise<Rating> => {
    try {
        console.log(`ratingsApi: Saving rating for fournisseurId: ${fournisseurId}`, data);
        const response = await axiosClient.post(`/fournisseurs/${fournisseurId}/evaluations`, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        console.log(`ratingsApi: Successfully saved rating for fournisseurId: ${fournisseurId}`, response.data);
        return response.data;
    } catch (error: any) {
        console.error("ratingsApi: Error saving rating:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
        });
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
        throw new Error(errorMessage);
    }
};