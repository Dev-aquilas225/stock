import axiosClient from "./axiosClient";
import { Devise } from "../types";

export interface Fournisseur {
    id: number;
    nom: string;
    adresse: string;
    telephone: string;
    email: string;
    categorie: string;
    delaiLivraison: string;
    isDeleted: boolean;
    creeLe: string;
}

export interface ProduitFournisseur {
    id: number;
    nom: string;
    prix: string;
    conditionnement: string;
    devise: Devise;
    fournisseur: Fournisseur;
}

export enum StatutProduitStock {
    DISPONIBLE = "DISPONIBLE",
    RETOURNE = "RETOURNE",
    RESERVE = "RESERVE",
    PERIME = "PERIME",
    VENDU = "VENDU",
    ENDOMMAGE = "ENDOMMAGE",
    ENLEVE = "ENLEVE",
}

export interface ProduitStock {
    id: number;
    qrCode: string;
    sku: string;
    lot: string;
    datePeremption: string;
    statut: StatutProduitStock;
    estActif: boolean;
    dateEntreeStock: string;
    lienFicheProduit: string;
    prix: string;
    emplacement: any | null; // tu peux le typer plus tard si tu ajoutes l'entité Emplacement
}

export interface ProduitStockGroup {
    produitFournisseur: ProduitFournisseur;
    stocks: ProduitStock[];
}

// 📥 Récupérer tous les produits groupés avec leurs stocks
export const getProduitsStock = async (): Promise<ProduitStockGroup[]> => {
    const token = localStorage.getItem("token");

    try {
        const response = await axiosClient.get("/produits-stock", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data;
    } catch (err: any) {
        const errorMessage =
            err.response?.data?.message ||
            "Erreur lors de la récupération des produits en stock";
        throw new Error(errorMessage);
    }
};
