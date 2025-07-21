import axiosClient from "./axiosClient";

<<<<<<< HEAD
// Interface for Produit
export interface Produit {
    id: number;
    nomProduit: string;
    prixNegocie: string;
    conditionnement: string;
    delaiApprovisionnement: string;
    creeLe: string;
    image: string | null;
    sku: string;
    datePeremption: string | null;
    majLe: string;
}

// Interface for FournisseurDto (used for POST requests)
export interface FournisseurDto {
    nom: string;
    adresse: string;
    email: string;
    telephone: string;
    categorie: "1" | "2";
    delaiLivraison: string;
    remise: string;
    minimumCommande: number | null;
}

// Interface for Fournisseur (matches API response)
||||||| c0eb2be
export interface FournisseurDto {
    nom: string;
    adresse: string;
    email: string;
    telephone: string;
    categorie: "1" | "2";
    delaiLivraison: string;
    remise: string;
    minimumCommande: number;
}

=======
>>>>>>> 688b5ce10d9a8c12626fce19113584cc6933af17
export interface Fournisseur {
    id: number;
    nom: string;
    adresse: string;
    email: string;
    telephone: string;
    categorie: "1" | "2";
    delaiLivraison: string;
    remise: string;
    minimumCommande: number | null;
    produits: Produit[];
    contacts: unknown[];
    evaluation: unknown | null;
    interactions: unknown[];
    isDeleted: boolean;
    creeLe: string;
}

// Fetch all fournisseurs
export const fetchFournisseurs = async (): Promise<Fournisseur[]> => {
    const token = localStorage.getItem("token");
<<<<<<< HEAD
    if (!token) {
        throw new Error("No token found");
    }
    const response = await axiosClient.get("/fournisseurs", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.data;
||||||| c0eb2be
    const response = await axiosClient.get("fournisseurs", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.data;
=======
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
>>>>>>> 688b5ce10d9a8c12626fce19113584cc6933af17
};

<<<<<<< HEAD
// Add a new fournisseur
export const addFournisseur = async (
    data: FournisseurDto,
): Promise<Fournisseur> => {
||||||| c0eb2be
export const addFournisseur = async (
    data: FournisseurDto,
): Promise<Fournisseur> => {
=======
export const addFournisseur = async (data: Omit<Fournisseur, "id" | "minimumCommande" | "createdAt">): Promise<Fournisseur> => {
>>>>>>> 688b5ce10d9a8c12626fce19113584cc6933af17
    const token = localStorage.getItem("token");
<<<<<<< HEAD
    if (!token) {
        throw new Error("No token found");
    }
    const response = await axiosClient.post("/fournisseurs", data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.data; // Adjust based on actual API response structure
||||||| c0eb2be
    const response = await axiosClient.post("fournisseurs", data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
=======
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
>>>>>>> 688b5ce10d9a8c12626fce19113584cc6933af17
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