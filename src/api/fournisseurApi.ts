// src/api/fournisseurApi.ts

import { Devise } from "../types";
import axiosClient from "./axiosClient";


export interface CreateFournisseurDto {
    nom: string;
    adresse: string;
    email: string;
    telephone: string;
    categorie: "1" | "2";
    delaiLivraison: string;
}

// Interface pour un fournisseur dans la liste
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
    produits: Produit[];
    contacts: any[];
    interactions: any[];
    evaluation: Evaluation;
}

export interface Evaluation {
    id: number;
    note: number;
    done: boolean;
    commentaire: string;
    creeLe: Date;
}

export interface Produit {
    id: number;
    nom: string;
    prix: string;
    devise: Devise;
    conditionnement: string;
    delaiApprovisionnement: string;
    sku: string;
    creeLe: string;
    majLe: string;
    priceHistory?: {
        id: string;
        price: number;
        date: any;
        negotiatedBy: string;
        notes: string;
    }[];
}

// Interface pour les détails d’un fournisseur (différence = évaluationId)
export interface FournisseurDetail extends Omit<Fournisseur, "evaluation"> {
    evaluationId: number;
}

// ➕ Ajouter un fournisseur
export const addFournisseur = async (fournisseurData: CreateFournisseurDto) => {
    const token = localStorage.getItem("token");
    try {
        const response = await axiosClient.post(
            "/fournisseurs",
            fournisseurData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
        return response.data.data;
    } catch (err: any) {
        const errorMessage =
            err.response?.data?.message ||
            "Erreur lors de l'ajout du fournisseur";
        throw new Error(errorMessage);
    }
};

export type UpdateFournisseurDto = Partial<CreateFournisseurDto>;

// ✏️ Modifier un fournisseur
export const updateFournisseur = async (
    id: number,
    fournisseurData: UpdateFournisseurDto,
) => {
    const token = localStorage.getItem("token");
    try {
        const response = await axiosClient.patch(
            `/fournisseurs/${id}`,
            fournisseurData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
        return response.data.data;
    } catch (err: any) {
        const errorMessage =
            err.response?.data?.message ||
            "Erreur lors de la modification du fournisseur";
        throw new Error(errorMessage);
    }
};

// 📥 Récupérer tous les fournisseurs
export const getFournisseurs = async (): Promise<Fournisseur[]> => {
    const token = localStorage.getItem("token");
    try {
        const response = await axiosClient.get("/fournisseurs", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data.data;
    } catch (err: any) {
        const errorMessage =
            err.response?.data?.message ||
            "Erreur lors de la récupération des fournisseurs";
        throw new Error(errorMessage);
    }
};

// 🔍 Récupérer un fournisseur via son ID
export const getFournisseurById = async (
    id: number,
): Promise<FournisseurDetail> => {
    const token = localStorage.getItem("token");
    try {
        const response = await axiosClient.get(`/fournisseurs/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data.data;
    } catch (err: any) {
        const errorMessage =
            err.response?.data?.message ||
            "Erreur lors de la récupération du fournisseur";
        throw new Error(errorMessage);
    }
};

// 📦 Récupérer tous les fournisseurs (même ceux supprimés)
export const getAllFournisseurs = async (): Promise<Fournisseur[]> => {
    const token = localStorage.getItem("token");
    try {
        const response = await axiosClient.get("/fournisseurs/all", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log(response.data.data);

        return response.data.data;
    } catch (err: any) {
        const errorMessage =
            err.response?.data?.message ||
            "Erreur lors de la récupération de tous les fournisseurs";
        throw new Error(errorMessage);
    }
};

export interface EvaluationDto {
    note: number;
    commentaire: string;
}

// ✏️ Noter un fournisseur
export const evaluateFournisseur = async (
    fournisseurId: number,
    evaluationData: EvaluationDto,
) => {
    const token = localStorage.getItem("token");
    try {
        const response = await axiosClient.put(
            `/fournisseurs/${fournisseurId}/evaluations`,
            evaluationData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
        return response.data.data;
    } catch (err: any) {
        const errorMessage =
            err.response?.data?.message ||
            "Erreur lors de l'évaluation du fournisseur";
        throw new Error(errorMessage);
    }
};

export interface CreateProduitDto {
    nom: string;
    prix: number;
    devise: Devise;
    conditionnement: string;
    delaiApprovisionnement: string;
}

// ➕ Ajouter un produit à un fournisseur
export const addProduitToFournisseur = async (
    fournisseurId: number,
    produitData: CreateProduitDto,
) => {
    const token = localStorage.getItem("token");
    try {
        const response = await axiosClient.post(
            `/fournisseurs/${fournisseurId}/produits`,
            produitData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
        return response.data.data;
    } catch (err: any) {
        const errorMessage =
            err.response?.data?.message ||
            "Erreur lors de l'ajout du produit au fournisseur";
        throw new Error(errorMessage);
    }
};


export type UpdateProduitDto = Partial<CreateProduitDto>;


// ✏️ Modifier un fournisseur
export const updateProduit = async (id: number, produitData: UpdateProduitDto) => {
    const token = localStorage.getItem("token");
    try {
        const response = await axiosClient.patch(
            `/fournisseurs/produits/${id}`,
            produitData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
        return response.data.data;
    } catch (err: any) {
        const errorMessage =
            err.response?.data?.message ||
            "Erreur lors de la modification du fournisseur";
        throw new Error(errorMessage);
    }
};