// src/api/retourFournisseurApi.ts
import axiosClient from "./axiosClient";

// -----------------------------
// 📌 Enums
// -----------------------------
export enum StatutRetour {
    EN_ATTENTE = "en_attente",
    APPROUVE = "approuve",
    REFUSE = "refuse",
}

export interface ReceptionProduit {
    id: number;
    nomProduit?: string;
    quantiteReçue?: string;
    commentaire?: string | null;
    photo?: string | null;
    ecart?: boolean;
    conditionnement?: string;
    creeLe?: string;
}

export interface ProduitRetour {
    id?: number;
    receptionProduit: { id: number };
    quantite: number;
    raisonRetour: string;
    creeLe?: string;
}

export interface Commande {
    id: number;
    reference: string;
    statut?: string;
    note?: string;
    dateLivraisonEstimee?: string;
    creeLe?: string;
}

export interface RetourFournisseur {
    id: number;
    commande: Commande;
    produits: ProduitRetour[];
    motif: string;
    statut: StatutRetour;
    documentTransportUrl?: string | null;
    creePar: {
        id: string;
        role: string;
        email?: string;
        nom?: string;
        prenom?: string;
    };
    creeLe: string;
    commentaire?: string;
}

// -----------------------------
// 📌 DTO
// -----------------------------
export interface CreateRetourDto {
    commandeId: number;
    motif: string;
    produits: {
        receptionProduitId: number;
        quantite: number;
        raisonRetour: string;
    }[];
}

export interface UpdateStatutDto {
    statut: StatutRetour;
    commentaire?: string;
}

// -----------------------------
// 🚀 Fonctions API
// -----------------------------

// ➕ Créer un retour fournisseur
export const createRetour = async (data: CreateRetourDto): Promise<RetourFournisseur> => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token manquant");

    const response = await axiosClient.post("/retours-fournisseurs", data, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.data.success) {
        throw new Error(response.data.message || "Erreur lors de la création du retour");
    }

    return response.data.data.retour;
};

// 📋 Récupérer tous les retours (avec filtres facultatifs)
export const getRetours = async (params?: {
    statut?: StatutRetour;
    commandeId?: string;
    fromDate?: string;
    toDate?: string;
}): Promise<RetourFournisseur[]> => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token manquant");

    const response = await axiosClient.get("/retours-fournisseurs", {
        params,
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.data.success) {
        throw new Error(response.data.message || "Erreur lors de la récupération des retours");
    }

    return response.data.data;
};

// 🔎 Récupérer un retour par ID
export const getRetourById = async (id: number): Promise<RetourFournisseur> => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token manquant");

    const response = await axiosClient.get(`/retours-fournisseurs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.data.success) {
        throw new Error(response.data.message || "Erreur lors de la récupération du retour");
    }

    return response.data.data;
};

// ✏️ Modifier le statut d’un retour
export const updateRetourStatut = async (
    id: number,
    data: UpdateStatutDto
): Promise<RetourFournisseur> => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token manquant");

    const response = await axiosClient.patch(`/retours-fournisseurs/${id}/statut`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.data.success) {
        throw new Error(response.data.message || "Erreur lors de la mise à jour du statut du retour");
    }

    return response.data.data;
};
