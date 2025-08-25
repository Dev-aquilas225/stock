import axiosClient from "./axiosClient";
import { Devise } from "../types";

export interface Commande {
    id: number;
    reference: string;
    fournisseur: Fournisseur;
    statut: StatutCommande;
    note: string;
    dateLivraisonEstimee: string;
    produits: ProduitCommande[];
    montantTotal: string;
    montantTotalConverti: string;
    deviseConvertion: Devise;
    isReceived: boolean;
    retourInit: boolean;
    retourEnd: boolean;
    creeLe: string;
    majLe: string;
}

export enum StatutCommande {
    BROUILLON = "BROUILLON",
    VALIDEE = "VALIDEE",        
    REÇUE = "REÇUE",
    ANNULEE = "ANNULEE",
    CLOTUREE = "CLOTUREE",
}

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

export interface ProduitCommande {
    id: number;
    produit: Produit;
    prixBase: string;
    prixNegocie: string;
    quantite: number;
    montantTotal: string;
    devise: Devise;
    montantTotalConverti: string;
    deviseConvertion: Devise;
    sku: string;
    lot: string;
    conditionnement: string;
    reception: Reception | null;

    quantiteRetournee: number;
    dateRetour: string | null;
    motifRetour: string | null;
    statutRetour: string | null;
}

export interface Reception {
    id: number;
    quantiteRecue: number;
    quantiteEndommage: number;
    dateReception: string | null;
    commentaireReception: string | null;
}

export interface Retour {
    id: number;
    quantiteRetournee: number;
    dateRetour: string | null;
    motifRetour: string | null;
    statutRetour: string | null;
}

export interface Produit {
    id: number;
    nom: string;
    prix: string;
    conditionnement: string;
    delaiApprovisionnement: string;
    devise: Devise;
    creeLe: string;
    majLe: string;
    sku: string;
    image: string | null;
}

// 📥 Récupérer toutes les commandes
export const getCommandes = async (): Promise<Commande[]> => {
    const token = localStorage.getItem("token");

    try {
        const response = await axiosClient.get("/commandes", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data.data;
    } catch (err: any) {
        const errorMessage =
            err.response?.data?.message ||
            "Erreur lors de la récupération des commandes";
        throw new Error(errorMessage);
    }
};

export interface ProduitCommandeInput {
    produitId: number;
    prixNegocie: number;
    devise: Devise;
    quantite: number;
    conditionnement: string;
}

export interface CreateCommandePayload {
    fournisseurId: number;
    dateLivraisonEstimee: string;
    note: string;
    produits: ProduitCommandeInput[];
}

export const createCommande = async (
    data: CreateCommandePayload,
): Promise<any> => {
    const token = localStorage.getItem("token");

    try {
        const response = await axiosClient.post("/commandes", data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data; // ou .data.data selon ton backend
    } catch (err: any) {
        const errorMessage =
            err.response?.data?.message ||
            "Erreur lors de la création de la commande";
        throw new Error(errorMessage);
    }
};

export interface UpdateCommandeStatutPayload {
    statut: StatutCommande;
    receptions?: {
        produitCommandeId: number;
        quantiteRecue: number;
        quantiteEndommage: number;
        dateReception: string;
        commentaireReception?: string;
    }[];
}

export const updateCommandeStatut = async (
    commandeId: number,
    data: UpdateCommandeStatutPayload,
): Promise<Commande> => {
    const token = localStorage.getItem("token");

    try {
        const response = await axiosClient.patch(
            `/commandes/${commandeId}/statut`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        return response.data.data; // Ajuste selon la structure de réponse de ton backend
    } catch (err: any) {
        const errorMessage =
            err.response?.data?.message ||
            "Erreur lors de la mise à jour du statut de la commande";
        throw new Error(errorMessage);
    }
};