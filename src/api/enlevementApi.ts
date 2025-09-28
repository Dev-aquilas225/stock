// enlevementApi.ts
import axiosClient from "./axiosClient";
import { Enleveur } from "./enleveurapi";
import { StatutProduitStock } from "./produitApi";

// -----------------------------
// 📌 Types & Interfaces
// -----------------------------

export interface ProduitEnleve {
    id: number;
    produit: {
        id: number;
        qrCode: string;
        sku: string;
        statut: StatutProduitStock;
    };
    quantite: number;
    statut: string;
}

export interface Enlevement {
    id: number;
    enleveur: Enleveur;
    actif: boolean;
    createdAt: string;
    produitsEnleves: ProduitEnleve[];
}

export interface CreateEnlevementDto {
    enleveurId: number;
    produits: { produitId: number; quantite: number }[];
}

// -----------------------------
// 🚀 API Enlèvements
// -----------------------------

// ✅ Ajouter un enlèvement
export const addEnlevement = async (data: CreateEnlevementDto): Promise<Enlevement> => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token manquant");

    if (!data.produits || data.produits.length === 0) {
        throw new Error("Au moins un produit est requis");
    }

    try {
        const response = await axiosClient.post("/enlevements", data, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        const enlevement = response.data;
        return {
            id: enlevement.id,
            enleveur: {
                id: enlevement.enleveur.id,
                nom: enlevement.enleveur.nom,
                prenom: enlevement.enleveur.prenom,
                email: enlevement.enleveur.email,
                actif: enlevement.enleveur.actif,
                documents: enlevement.enleveur.documents || [],
            },
            actif: enlevement.actif,
            createdAt: enlevement.createdAt,
            produitsEnleves: (enlevement.produitsEnleves || []).map((pe: any) => ({
                id: pe.id,
                produit: {
                    id: pe.produit.id,
                    qrCode: pe.produit.qrCode,
                    sku: pe.produit.sku,
                    statut: pe.produit.statut,
                },
                quantite: pe.quantite,
                statut: pe.statut,
            })),
        };
    } catch (err: any) {
        console.error("Erreur API addEnlevement:", err.response?.data || err);
        throw new Error(err.response?.data?.message || "Erreur lors de la création de l’enlèvement");
    }
};

// ✅ Récupérer tous les enlèvements
export const getEnlevements = async (): Promise<Enlevement[]> => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token manquant");

    try {
        const response = await axiosClient.get("/enlevements", {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!Array.isArray(response.data)) {
            throw new Error("Réponse invalide: liste d'enlèvements attendue");
        }

        return response.data.map((e: any) => ({
            id: e.id,
            enleveur: {
                id: e.enleveur.id,
                nom: e.enleveur.nom,
                prenom: e.enleveur.prenom,
                email: e.enleveur.email,
                actif: e.enleveur.actif,
                documents: e.enleveur.documents || [],
            },
            actif: e.actif,
            createdAt: e.createdAt,
            produitsEnleves: (e.produitsEnleves || []).map((pe: any) => ({
                id: pe.id,
                produit: {
                    id: pe.produit.id,
                    qrCode: pe.produit.qrCode,
                    sku: pe.produit.sku,
                    statut: pe.produit.statut,
                },
                quantite: pe.quantite,
                statut: pe.statut,
            })),
        }));
    } catch (err: any) {
        console.error("Erreur API getEnlevements:", err.response?.data || err);
        throw new Error(err.response?.data?.message || "Erreur lors de la récupération des enlèvements");
    }
};

// ✅ Récupérer un enlèvement par ID
export const getEnlevementById = async (id: number): Promise<Enlevement> => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token manquant");

    try {
        const response = await axiosClient.get(`/enlevements/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const e = response.data;
        return {
            id: e.id,
            enleveur: {
                id: e.enleveur.id,
                nom: e.enleveur.nom,
                prenom: e.enleveur.prenom,
                email: e.enleveur.email,
                actif: e.enleveur.actif,
                documents: e.enleveur.documents || [],
            },
            actif: e.actif,
            createdAt: e.createdAt,
            produitsEnleves: (e.produitsEnleves || []).map((pe: any) => ({
                id: pe.id,
                produit: {
                    id: pe.produit.id,
                    qrCode: pe.produit.qrCode,
                    sku: pe.produit.sku,
                    statut: pe.produit.statut,
                },
                quantite: pe.quantite,
                statut: pe.statut,
            })),
        };
    } catch (err: any) {
        console.error("Erreur API getEnlevementById:", err.response?.data || err);
        throw new Error(err.response?.data?.message || `Erreur lors de la récupération de l’enlèvement ${id}`);
    }
};

// ✅ Récupérer les enlèvements par enleveur
export const getEnlevementsByEnleveur = async (enleveurId: number): Promise<Enlevement[]> => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token manquant");

    try {
        const response = await axiosClient.get(`/enlevements/enleveur/${enleveurId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!Array.isArray(response.data)) {
            throw new Error("Réponse invalide: liste d'enlèvements attendue");
        }

        return response.data.map((e: any) => ({
            id: e.id,
            enleveur: {
                id: e.enleveur.id,
                nom: e.enleveur.nom,
                prenom: e.enleveur.prenom,
                email: e.enleveur.email,
                actif: e.enleveur.actif,
                documents: e.enleveur.documents || [],
            },
            actif: e.actif,
            createdAt: e.createdAt,
            produitsEnleves: (e.produitsEnleves || []).map((pe: any) => ({
                id: pe.id,
                produit: {
                    id: pe.produit.id,
                    qrCode: pe.produit.qrCode,
                    sku: pe.produit.sku,
                    statut: pe.produit.statut,
                },
                quantite: pe.quantite,
                statut: pe.statut,
            })),
        }));
    } catch (err: any) {
        console.error("Erreur API getEnlevementsByEnleveur:", err.response?.data || err);
        throw new Error(err.response?.data?.message || `Erreur lors de la récupération des enlèvements pour l’enleveur ${enleveurId}`);
    }
};

// ✅ Supprimer un enlèvement
export const deleteEnlevement = async (id: number): Promise<{ success: boolean; message: string }> => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token manquant");

    try {
        const response = await axiosClient.delete(`/enlevements/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (err: any) {
        console.error("Erreur API deleteEnlevement:", err.response?.data || err);
        throw new Error(err.response?.data?.message || `Erreur lors de la suppression de l’enlèvement ${id}`);
    }
};