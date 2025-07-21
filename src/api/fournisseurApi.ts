import axiosClient from "./axiosClient";

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
    if (!token) {
        throw new Error("No token found");
    }
    const response = await axiosClient.get("/fournisseurs", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.data;
};

// Add a new fournisseur
export const addFournisseur = async (
    data: FournisseurDto,
): Promise<Fournisseur> => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("No token found");
    }
    const response = await axiosClient.post("/fournisseurs", data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.data; // Adjust based on actual API response structure
};
