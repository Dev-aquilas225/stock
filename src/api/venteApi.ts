import axiosClient from "./axiosClient";

export interface ProduitVenteDto {
    produitStockId: number;
}

export interface VenteDto {
    modePaiement: string;
    nomClient: string | undefined;
    prenomClient: string | undefined;
    contactClient: string | undefined;
    produits: ProduitVenteDto[];
    autreMoyenPaiement?: string;
}

export interface VenteResponse {
    success: boolean;
    message: string;
}

export interface Vente {
    produits: any;
    id: number;
    dateVente: string;
    total: string;
    totalPaye: string;
    commentaire?: string | null;
    nomClient?: string;
    prenomClient?: string;
    contactClient?: string;
    moyenPaiement: string;
    autreMoyenPaiement?: string | null;
    vendeur: {
        id: string;
        email: string;
        nom: string;
        prenom: string;
        role: string;
        type: string;
        actif: boolean;
        creeLe: string;
    };
}

export const createVente = async (data: VenteDto): Promise<VenteResponse> => {
    const token = localStorage.getItem("token");
    const response = await axiosClient.post("/ventes", data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return {
        success: response.data.success,
        message: response.data.message,
    };
};

export const getVentes = async (): Promise<Vente[]> => {
    const token = localStorage.getItem("token");
    const response = await axiosClient.get("/ventes", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};
