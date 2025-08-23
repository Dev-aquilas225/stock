import axios from "axios";

const API_URL = "http://localhost:8000"; // adapte si nécessaire

// ✅ Création d'une instance axios réutilisable
const axiosClient = axios.create({
    baseURL: API_URL,
    headers: { "Content-Type": "application/json" },
});

// 🎯 Type des données retour fournisseur
export interface RetourFournisseur {
    id: number;
    commande: {
        id: number;
        reference: string;
    };
    motif: string;
    quantite: number;
    createdAt: string;
}

// ✅ Fonction : Récupérer la liste des retours
export const getRetoursFournisseurs = async (): Promise<RetourFournisseur[]> => {
    try {
        const token = localStorage.getItem("token");

        const response = await axiosClient.get("/retours-fournisseurs", {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        return response.data.data;
    } catch (err: any) {
        console.error("Erreur API Retours Fournisseurs:", err.response?.data || err.message);
        throw new Error("Impossible de charger les données de retours");
    }
};

// ✅ Fonction : Créer un retour fournisseur
export const createRetourFournisseur = async (data: {
    commandeId: number;
    motif: string;
    quantite: number;
}): Promise<RetourFournisseur> => {
    try {
        const token = localStorage.getItem("token");

        const response = await axiosClient.post("/retours-fournisseurs", data, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        return response.data.data;
    } catch (err: any) {
        console.error("Erreur API Création Retour:", err.response?.data || err.message);
        throw new Error("Impossible de créer le retour fournisseur");
    }
};

// ✅ Fonction : Supprimer un retour fournisseur
export const deleteRetourFournisseur = async (id: number): Promise<void> => {
    try {
        const token = localStorage.getItem("token");

        await axiosClient.delete(`/retours-fournisseurs/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    } catch (err: any) {
        console.error("Erreur API Suppression Retour:", err.response?.data || err.message);
        throw new Error("Impossible de supprimer le retour fournisseur");
    }
};

// Approuver un retour fournisseur
export const approveRetourFournisseur = async (id: string): Promise<RetourFournisseur> => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token manquant");

    try {
        const response = await axiosClient.patch(`/retours/${id}/approve`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.data;
    } catch (err: any) {
        const status = err.response?.status;
        let message =
            err.response?.data?.message ||
            "Erreur lors de l'approbation du retour fournisseur";

        if (status === 404) message = `Retour avec ID ${id} non trouvé`;
        else if (status === 403)
            message = "Accès non autorisé pour approuver le retour";

        throw new Error(message);
    }
};

// Récupérer tous les retours fournisseurs (optional, if needed)
export const getRetoursFournisseur = async (): Promise<RetourFournisseur[]> => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token manquant");

    try {
        const response = await axiosClient.get("/retours", {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.data;
    } catch (err: any) {
        throw new Error(
            err.response?.data?.message ||
                "Erreur lors de la récupération des retours fournisseurs",
        );
    }
};