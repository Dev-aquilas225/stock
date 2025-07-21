import axiosClient from "./axiosClient";

export interface Rating {
    fournisseurId: string;
    qualiteProduit: number;
    respectDelais: number;
    fiabilite: number;
    commentaire: string;
}

export interface RatingDto {
    qualiteProduit: number;
    respectDelais: number;
    fiabilite: number;
    commentaire: string;
}

export const fetchRating = async (fournisseurId: string): Promise<Rating | null> => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("No authentication token found");
    }
    try {
        const response = await axiosClient.get(`/fournisseurs/${fournisseurId}/rating`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data.data || null;
    } catch (error: any) {
        if (error.response?.status === 404) {
            return null; // No rating exists
        }
        throw new Error(error.response?.data?.message || "Erreur lors de la récupération de l'évaluation");
    }
};

export const addOrUpdateRating = async (fournisseurId: string, data: RatingDto): Promise<Rating> => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("No authentication token found");
    }
    try {
        const response = await axiosClient.post(`/fournisseurs/${fournisseurId}/rating`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Erreur lors de l'ajout ou de la mise à jour de l'évaluation");
    }
};