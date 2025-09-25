import { StatutProduitStock } from "../types";
import axiosClient from "./axiosClient";
import { ProduitFournisseur } from "./produitApi";

export interface ProduitStock {
    code: string;
    id: number;
    qrCode: string;
    sku: string;
    lot: string;
    datePeremption: string;
    statut: StatutProduitStock;
    estActif: boolean;
    dateEntreeStock: string;
    lienFicheProduit: string | null;
    prix: string;
    produitFournisseur: ProduitFournisseur;
    emplacement: any | null;
}

// 📥 Récupérer les informations d'un produit par son code
export const scanProduitByCode = async (
    code: string,
): Promise<ProduitStock> => {
    const token = localStorage.getItem("token");

    try {
        const response = await axiosClient.post(
            "/produits-stock/scan",
            { code },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        return response.data;
    } catch (err: any) {
        const errorMessage =
            err.response?.data?.message ||
            "Erreur lors de la récupération des informations du produit";
        throw new Error(errorMessage);
    }
};
