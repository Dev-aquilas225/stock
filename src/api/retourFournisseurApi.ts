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
