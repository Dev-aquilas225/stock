import axiosClient from "./axiosClient";

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
    const response = await axiosClient.get("fournisseurs", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.data;
};

export const addFournisseur = async (
    data: FournisseurDto,
): Promise<Fournisseur> => {
    const token = localStorage.getItem("token");
    const response = await axiosClient.post("fournisseurs", data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};