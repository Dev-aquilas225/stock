import axiosClient from "./axiosClient";

// Type pour une formule d’abonnement
export interface Formule {
    id: number;
    nom: string;
    prix: number;
    dureeEnJours: number;
    maxClients: number;
    niveauxParrainage: number;
    managersAutorises: number;
    gestionStock: boolean;
    rapportsVentes: boolean;
    facturationPDF: boolean;
    classementEquipe: boolean;
    notificationObjectifs: boolean;
    integrationERP: boolean;
    supportPrioritaire: boolean;
}

// Type pour la réponse API
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// GET /formules → liste des formules
export const getFormules = async (): Promise<ApiResponse<Formule[]>> => {
    const response = await axiosClient.get("/formules");
    console.log("getFormules", response.data);
    return response.data;
};

// GET /formules/:id → détails d’une formule
export const getFormuleById = async (id: number): Promise<ApiResponse<Formule[]>> => {
    const response = await axiosClient.get(`/formules/${id}`);
    console.log("getFormuleById", response.data);
    return response.data;
};