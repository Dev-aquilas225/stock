import axiosClient from "./axiosClient";
import { ProduitStock, StatutProduitStock, ProduitStockGroup } from "./produitApi";

// 🔹 Types et interfaces
export enum EnlevementStatus {
    EN_COURS = "EN_COURS",
    ANNULE = "ANNULE",
}

export interface EnlevementProduit {
    produitStockId: number;
    nom: string;
    quantite: number;
}

export interface Enlevement {
    id: number;
    enleveurId: string;
    enleveurNom: string;
    produits: EnlevementProduit[];
    statut: EnlevementStatus;
    date: string;
    userId: string;
}

export interface CreateEnlevementDto {
    enleveurId: string;
    produits: { produitStockId: number; quantite: number }[];
    userId: string;
}

export interface Enleveur {
    id: string; // Compatible avec MongoDB ObjectId
    nom: string;
    prenom: string;
    actif: boolean;
}

export const getEnleveurs = async (): Promise<Enleveur[]> => {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("getEnleveurs: Token manquant dans localStorage");
        throw new Error("Token manquant");
    }

    try {
        const response = await axiosClient.get("/enleveurs", {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data.data || response.data || [];
        if (!Array.isArray(data)) {
            console.error("getEnleveurs: Réponse inattendue, data n'est pas un tableau", { data });
            throw new Error("Format de réponse invalide pour les enleveurs");
        }
        return data.map((e: any) => ({
            id: e._id || e.id || "",
            nom: e.nom || "",
            prenom: e.prenom || "",
            actif: e.actif !== false,
        }));
    } catch (err: any) {
        console.error("Erreur API getEnleveurs:", {
            message: err.message,
            status: err.response?.status,
            data: err.response?.data,
            url: axiosClient.defaults.baseURL + "/enleveurs",
        });
        throw new Error(err.response?.data?.message || "Erreur lors de la récupération des enleveurs");
    }
};

// 🔹 API Enlèvements
export const addEnlevement = async (enlevementData: CreateEnlevementDto): Promise<Enlevement> => {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("addEnlevement: Token manquant dans localStorage");
        throw new Error("Token manquant");
    }

    // Validation stricte
    if (!enlevementData.enleveurId?.trim()) throw new Error("Enleveur requis");
    if (!enlevementData.userId?.trim()) throw new Error("Utilisateur requis");
    if (!enlevementData.produits || enlevementData.produits.length === 0) {
        throw new Error("Au moins un produit requis");
    }
    for (const item of enlevementData.produits) {
        if (!item.produitStockId) throw new Error("ID de produit stock requis");
        if (!item.quantite || item.quantite <= 0) throw new Error("Quantité invalide");
    }

    try {
        const response = await axiosClient.post("/enlevements", enlevementData, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        const data = response.data.data || response.data || {};
        return {
            id: Number(data.id || data._id || 0),
            enleveurId: data.enleveurId || "",
            enleveurNom: data.enleveurNom || "",
            produits: Array.isArray(data.produits) ? data.produits : [],
            statut: data.statut || EnlevementStatus.EN_COURS,
            date: data.date || new Date().toISOString(),
            userId: data.userId || "",
        };
    } catch (err: any) {
        console.error("Erreur API addEnlevement:", {
            message: err.message,
            status: err.response?.status,
            data: err.response?.data,
            url: axiosClient.defaults.baseURL + "/enlevements",
        });
        throw new Error(err.response?.data?.message || "Erreur lors de la création de l'enlèvement");
    }
};

export const getEnlevements = async (): Promise<Enlevement[]> => {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("getEnlevements: Token manquant dans localStorage");
        throw new Error("Token manquant");
    }

    try {
        const response = await axiosClient.get("/enlevements", {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data.data || response.data || [];
        if (!Array.isArray(data)) {
            console.error("getEnlevements: Réponse inattendue, data n'est pas un tableau", { data });
            throw new Error("Format de réponse invalide pour les enlèvements");
        }
        return data.map((e: any) => ({
            id: Number(e.id || e._id || 0),
            enleveurId: e.enleveurId || "",
            enleveurNom: e.enleveurNom || "",
            produits: Array.isArray(e.produits) ? e.produits : [],
            statut: e.statut || EnlevementStatus.EN_COURS,
            date: e.date || new Date().toISOString(),
            userId: e.userId || "",
        }));
    } catch (err: any) {
        console.error("Erreur API getEnlevements:", {
            message: err.message,
            status: err.response?.status,
            data: err.response?.data,
            url: axiosClient.defaults.baseURL + "/enlevements",
        });
        throw new Error(err.response?.data?.message || "Erreur lors de la récupération des enlèvements");
    }
};

export const getEnlevementById = async (id: number): Promise<Enlevement> => {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("getEnlevementById: Token manquant dans localStorage");
        throw new Error("Token manquant");
    }

    try {
        const response = await axiosClient.get(`/enlevements/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const e = response.data.data || response.data || {};
        return {
            id: Number(e.id || e._id || 0),
            enleveurId: e.enleveurId || "",
            enleveurNom: e.enleveurNom || "",
            produits: Array.isArray(e.produits) ? e.produits : [],
            statut: e.statut || EnlevementStatus.EN_COURS,
            date: e.date || new Date().toISOString(),
            userId: e.userId || "",
        };
    } catch (err: any) {
        console.error("Erreur API getEnlevementById:", {
            message: err.message,
            status: err.response?.status,
            data: err.response?.data,
            url: axiosClient.defaults.baseURL + `/enlevements/${id}`,
        });
        throw new Error(err.response?.data?.message || `Erreur lors de la récupération de l'enlèvement ${id}`);
    }
};

export const cancelEnlevement = async (id: number): Promise<Enlevement> => {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("cancelEnlevement: Token manquant dans localStorage");
        throw new Error("Token manquant");
    }

    try {
        const response = await axiosClient.patch(`/enlevements/${id}/cancel`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const e = response.data.data || response.data || {};
        return {
            id: Number(e.id || e._id || 0),
            enleveurId: e.enleveurId || "",
            enleveurNom: e.enleveurNom || "",
            produits: Array.isArray(e.produits) ? e.produits : [],
            statut: e.statut || EnlevementStatus.ANNULE,
            date: e.date || new Date().toISOString(),
            userId: e.userId || "",
        };
    } catch (err: any) {
        console.error("Erreur API cancelEnlevement:", {
            message: err.message,
            status: err.response?.status,
            data: err.response?.data,
            url: axiosClient.defaults.baseURL + `/enlevements/${id}/cancel`,
        });
        throw new Error(err.response?.data?.message || `Erreur lors de l'annulation de l'enlèvement ${id}`);
    }
};

export const getProduitsStock = async (): Promise<ProduitStock[]> => {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("getProduitsStock: Token manquant dans localStorage");
        throw new Error("Token manquant");
    }

    try {
        const response = await axiosClient.get("/produits-stock", {
            headers: { Authorization: `Bearer ${token}` },
        });
        const groups = response.data.data || response.data || [];
        if (!Array.isArray(groups)) {
            console.error("getProduitsStock: Réponse inattendue, data n'est pas un tableau", { groups });
            throw new Error("Format de réponse invalide pour les produits en stock");
        }
        return groups.flatMap((group: ProduitStockGroup) => {
            if (!group || !Array.isArray(group.stocks)) {
                console.warn("getProduitsStock: Groupe de produits invalide", { group });
                return [];
            }
            return group.stocks
                .filter((stock: ProduitStock) => stock.statut === StatutProduitStock.DISPONIBLE && stock.estActif)
                .map((stock: ProduitStock) => ({
                    ...stock,
                    nom: group.produitFournisseur?.nom || `Produit ID: ${stock.id || 'inconnu'}`,
                }));
        });
    } catch (err: any) {
        console.error("Erreur API getProduitsStock:", {
            message: err.message,
            status: err.response?.status,
            data: err.response?.data,
            url: axiosClient.defaults.baseURL + "/produits-stock",
        });
        throw new Error(err.response?.data?.message || "Erreur lors de la récupération des produits en stock");
    }
};