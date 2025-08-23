import axiosClient from "./axiosClient";

export interface RegisterClientDto {
    nom: string;
    prenom: string;
    email: string;
    password: string;
    description: string;
    type: string | "particulier" | "entreprise";
    companyName?: string;
    nif?: string;
}

export interface LoginClientDto {
    email: string;
    motDePasse: string;
    role: string;
}

export interface AuthResponse {
    token: string;
    user?: {
        id?: string;
        nom?: string;
        prenom?: string;
        firstName?: string; // For backend compatibility
        lastName?: string;  // For backend compatibility
        email?: string;
        type?: string;
        role?: string;
        nomEntreprise?: string;
        companyName?: string;
        createdAt?: string;
        actif?: boolean;
        verified?: boolean;
        docsValides?: boolean;
        profilePicture?: string;
        phone?: string;
        address?: string;
        description?: string;
        nif?: string;
    };
    id?: string;
    nom?: string;
    prenom?: string;
    firstName?: string; // For backend compatibility
    lastName?: string;  // For backend compatibility
    email?: string;
    type?: string;
    role?: string;
    nomEntreprise?: string;
    companyName?: string;
    createdAt?: string;
    actif?: boolean;
    verified?: boolean;
    docsValides?: boolean;
    profilePicture?: string;
    phone?: string;
    address?: string;
    description?: string;
    nif?: string;
}

export const registerClient = async (data: RegisterClientDto): Promise<AuthResponse> => {
    try {
        const response = await axiosClient.post("auth/request/client", data);
        console.log("registerClient response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("registerClient error:", error.response?.data || error.message);
        throw error;
    }
};

export const loginClient = async (data: LoginClientDto): Promise<AuthResponse> => {
    try {
        const response = await axiosClient.post("auth/login/client", data);
        console.log("loginClient response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("loginClient error:", error.response?.data || error.message);
        throw error;
    }
};