// src/api/agentApi.ts
import axiosClient from "./axiosClient";

export enum UserRole {
    GESTIONNAIRE = "gestionnaire",
    VENDEUR = "vendeur",
}

export interface CreateAgentDto {
    nom: string;
    prenom: string;
    email: string;
    role: UserRole;
}

export interface Agent {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    role: UserRole;
    actif: boolean;
    creeLe: string;
}

// Map UserRole to backend-expected format
const mapRoleToBackend = (role: UserRole): string => {
    return role === UserRole.GESTIONNAIRE ? "gestionnaire" : "vendeur";
};

// Map backend role to UserRole
const mapRoleFromBackend = (role: string): UserRole => {
    return role.toLowerCase() === "gestionnaire"
        ? UserRole.GESTIONNAIRE
        : UserRole.VENDEUR;
};

// ➕ Ajouter un agent
export const addAgent = async (agentData: CreateAgentDto): Promise<Agent> => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token manquant");

    const payload = {
        ...agentData,
        role: mapRoleToBackend(agentData.role),
    };

    try {
        const response = await axiosClient.post(
            "/auth/register/agent",
            payload,
            {
                headers: { Authorization: `Bearer ${token}` },
            },
        );
        return {
            ...response.data.data,
            role: mapRoleFromBackend(response.data.data.role),
        };
    } catch (err: any) {
        throw new Error(
            err.response?.data?.message ||
                "Erreur lors de la création de l’agent",
        );
    }
};

// 📋 Récupérer tous les agents
export const getAgents = async (): Promise<Agent[]> => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token manquant");

    try {
        const response = await axiosClient.get("/user/agents", {
            headers: { Authorization: `Bearer ${token}` },
        });
        console.log("la liste:", response);
        return response.data.data
    } catch (err: any) {
        throw new Error(
            err.response?.data?.message ||
                "Erreur lors de la récupération des agents",
        );
    }
};

// 🔁 Activer / Désactiver un agent
export const toggleAgentActif = async (id: string): Promise<Agent> => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token manquant");

    try {
        const response = await axiosClient.patch(
            `/user/agent/${id}/actif`,
            {},
            {
                headers: { Authorization: `Bearer ${token}` },
            },
        );
        return {
            ...response.data.data,
            role: mapRoleFromBackend(response.data.data.role),
        };
    } catch (err: any) {
        const status = err.response?.status;
        let message =
            err.response?.data?.message ||
            "Erreur lors du changement de statut";

        if (status === 404) message = `Agent avec ID ${id} non trouvé`;
        else if (status === 403)
            message = "Accès non autorisé pour modifier le statut de l'agent";

        throw new Error(message);
    }
};
