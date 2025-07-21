import axiosClient from "./axiosClient";

export interface Fournisseur {
    id: string;
    nom: string;
    adresse: string;
    email: string;
    telephone: string;
    categorie: "1" | "2";
    delaiLivraison: string;
    remise: string;
    minimumCommande: number;
    createdAt: string;
}

export const fetchFournisseurs = async (): Promise<Fournisseur[]> => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    try {
        const response = await axiosClient.get("fournisseurs", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data.data;
    } catch (error: any) {
        const message = error.response?.status === 401
            ? "Non autorisé : Veuillez vous reconnecter"
            : `Failed to fetch fournisseurs: ${error.response?.data?.message || error.message}`;
        throw new Error(message);
    }
};

export const addFournisseur = async (data: Omit<Fournisseur, "id" | "minimumCommande" | "createdAt">): Promise<Fournisseur> => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    try {
        const payload = {
            nom: data.nom,
            adresse: data.adresse,
            email: data.email,
            telephone: data.telephone,
            categorie: data.categorie,
            delaiLivraison: data.delaiLivraison,
            remise: data.remise,
        };
        const response = await axiosClient.post("fournisseurs", payload, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error: any) {
        const message = error.response?.status === 401
            ? "Non autorisé : Veuillez vous reconnecter"
            : `Failed to add fournisseur: ${error.response?.data?.message || error.message}`;
        throw new Error(message);
    }
};

export const updateFournisseur = async (id: string, data: Omit<Fournisseur, "id" | "minimumCommande" | "createdAt">): Promise<Fournisseur> => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    try {
        const payload = {
            nom: data.nom,
            adresse: data.adresse,
            email: data.email,
            telephone: data.telephone,
            categorie: data.categorie,
            delaiLivraison: data.delaiLivraison,
            remise: data.remise,
        };
        const response = await axiosClient.put(`fournisseurs/${id}`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error: any) {
        const message = error.response?.status === 401
            ? "Non autorisé : Veuillez vous reconnecter"
            : `Failed to update fournisseur: ${error.response?.data?.message || error.message}`;
        throw new Error(message);
    }
};

export const deleteFournisseur = async (id: string): Promise<void> => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    try {
        await axiosClient.delete(`fournisseurs/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error: any) {
        const message = error.response?.status === 401
            ? "Non autorisé : Veuillez vous reconnecter"
            : `Failed to delete fournisseur: ${error.response?.data?.message || error.message}`;
        throw new Error(message);
    }
};