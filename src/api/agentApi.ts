import axiosClient from "./axiosClient";

export enum UserRole {
    GESTIONNAIRE = "gestionnaire",
    VENDEUR = "vendeur",
}

export enum TypePiece {
    PASSEPORT = "Passeport",
    CNI = "CNI",
}

export interface CreateAgentDto {
    nom: string;
    prenom: string;
    email: string;
    contact: string;
    typePiece: TypePiece;
    numeroPiece: string;
    photoPiece?: File;
    role: UserRole;
}

export interface Agent {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    contact: string;
    typePiece: TypePiece;
    numeroPiece: string;
    photoPiece?: string; // URL returned by backend
    role: UserRole;
    actif: boolean;
    creeLe: string;
}

// Map UserRole to backend-expected format
const mapRoleToBackend = (role: UserRole): string => {
    return role === UserRole.GESTIONNAIRE ? "gestionnaire" : "vendeur";
};

// Map TypePiece to backend-expected format
const mapTypePieceToBackend = (typePiece: TypePiece): string => {
    return typePiece === TypePiece.PASSEPORT ? "Passeport" : "CNI";
};

// Map backend role to UserRole
const mapRoleFromBackend = (role: string): UserRole => {
    return role.toLowerCase() === "gestionnaire"
        ? UserRole.GESTIONNAIRE
        : UserRole.VENDEUR;
};

// Map backend typePiece to TypePiece
const mapTypePieceFromBackend = (typePiece: string): TypePiece => {
    return typePiece === "Passeport" ? TypePiece.PASSEPORT : TypePiece.CNI;
};

// ➕ Ajouter un agent
export const addAgent = async (agentData: CreateAgentDto): Promise<Agent> => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token manquant");

    const formData = new FormData();
    formData.append("nom", agentData.nom);
    formData.append("prenom", agentData.prenom);
    formData.append("email", agentData.email);
    formData.append("contact", agentData.contact);
    formData.append("typePiece", mapTypePieceToBackend(agentData.typePiece));
    formData.append("numeroPiece", agentData.numeroPiece);
    if (agentData.photoPiece) {
        formData.append("photoPiece", agentData.photoPiece);
    }
    formData.append("role", mapRoleToBackend(agentData.role));

    try {
        const response = await axiosClient.post("/auth/register/agent", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });
        return {
            ...response.data.data,
            role: mapRoleFromBackend(response.data.data.role),
            typePiece: mapTypePieceFromBackend(response.data.data.typePiece),
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
        return response.data.data.map((agent: any) => ({
            ...agent,
            role: mapRoleFromBackend(agent.role),
            typePiece: mapTypePieceFromBackend(agent.typePiece),
        }));
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
        const response = await axiosClient.patch(`/user/agent/${id}/actif`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return {
            ...response.data.data,
            role: mapRoleFromBackend(response.data.data.role),
            typePiece: mapTypePieceFromBackend(response.data.data.typePiece),
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