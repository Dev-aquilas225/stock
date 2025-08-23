import axiosClient from "./axiosClient";

export enum UserRole {
    GESTIONNAIRE = "gestionnaire",
    VENDEUR = "vendeur",
}

export enum TypePiece {
    CNI = "CNI",
    RCCM = "RCCM",
    Autres = "Autres",
}

export interface DocumentAgent {
    type: TypePiece;
    fichierUrl: string;
}

export interface CreateAgentDto {
    nom: string;
    prenom: string;
    email: string;
    documentType: TypePiece;
    documentNumber: string;
    document: File;
    role: UserRole;
}

export interface Agent {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    contact?: string;
    role: UserRole;
    actif: boolean;
    creeLe: string;
    documentAgent: DocumentAgent[];
    documentNumber: string; // Added
}

// -----------------------------
// 🔄 Fonctions de mapping
// -----------------------------

const mapRoleToBackend = (role: UserRole): string => {
    if (!Object.values(UserRole).includes(role)) {
        console.error(`Rôle invalide: ${role}`);
        throw new Error("Rôle invalide");
    }
    return role;
};

const mapTypePieceToBackend = (typePiece: TypePiece): string => {
    if (!Object.values(TypePiece).includes(typePiece)) {
        console.error(`Type de pièce invalide: ${typePiece}`);
        throw new Error("Type de pièce invalide");
    }
    return typePiece.toUpperCase();
};

const mapRoleFromBackend = (role: string): UserRole => {
    if (!role || typeof role !== "string") {
        console.warn(`Rôle invalide reçu du backend: ${role}. Utilisation de 'vendeur' par défaut.`);
        return UserRole.VENDEUR;
    }
    const normalizedRole = role.toLowerCase();
    if (normalizedRole === "gestionnaire") return UserRole.GESTIONNAIRE;
    if (normalizedRole === "vendeur") return UserRole.VENDEUR;
    console.warn(`Rôle inconnu reçu du backend: ${role}. Utilisation de 'vendeur' par défaut.`);
    return UserRole.VENDEUR;
};

const mapTypePieceFromBackend = (typePiece: string): TypePiece => {
    if (!typePiece || typeof typePiece !== "string") {
        console.warn(`Type de pièce invalide reçu du backend: ${typePiece}. Utilisation de 'CNI' par défaut.`);
        return TypePiece.CNI;
    }
    const normalizedTypePiece = typePiece.toUpperCase();
    if (Object.values(TypePiece).includes(normalizedTypePiece as TypePiece)) {
        return normalizedTypePiece as TypePiece;
    }
    console.warn(`Type de pièce inconnu reçu du backend: ${typePiece}. Utilisation de 'CNI' par défaut.`);
    return TypePiece.CNI;
};

// -----------------------------
// 🚀 API Agents
// -----------------------------

export const addAgent = async (agentData: CreateAgentDto): Promise<Agent> => {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("Erreur: Token manquant pour addAgent");
        throw new Error("Token manquant");
    }

    // Validation stricte des données
    if (!agentData.nom || typeof agentData.nom !== "string" || agentData.nom.trim() === "") {
        console.error("Erreur de validation: nom requis et doit être une chaîne non vide", agentData.nom);
        throw new Error("Nom requis et doit être une chaîne non vide");
    }
    if (!agentData.prenom || typeof agentData.prenom !== "string" || agentData.prenom.trim() === "") {
        console.error("Erreur de validation: prénom requis et doit être une chaîne non vide", agentData.prenom);
        throw new Error("Prénom requis et doit être une chaîne non vide");
    }
    if (!agentData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(agentData.email.trim())) {
        console.error("Erreur de validation: email invalide", agentData.email);
        throw new Error("Email invalide");
    }
    if (!Object.values(TypePiece).includes(agentData.documentType)) {
        console.error("Erreur de validation: documentType invalide", agentData.documentType);
        throw new Error("DocumentType doit être CNI, RCCM ou Autres");
    }
    if (!agentData.documentNumber || agentData.documentNumber.trim() === "") {
        console.error("Erreur de validation: documentNumber requis", agentData.documentNumber);
        throw new Error("Numéro de document requis");
    }
    if (agentData.documentType === TypePiece.CNI && !/^CI\d{9}$/.test(agentData.documentNumber.trim())) {
        console.error("Erreur de validation: numéro CNI invalide", agentData.documentNumber);
        throw new Error("Le numéro CNI doit commencer par 'CI' suivi de 9 chiffres");
    }
    if (!Object.values(UserRole).includes(agentData.role)) {
        console.error("Erreur de validation: rôle invalide", agentData.role);
        throw new Error("Rôle invalide");
    }
    if (!agentData.document) {
        console.error("Erreur de validation: document requis");
        throw new Error("Un document est requis");
    }
    const validTypes = ["image/png", "image/jpeg"];
    if (!validTypes.includes(agentData.document.type)) {
        console.error("Erreur de validation: fichier document invalide", agentData.document.type);
        throw new Error("Fichier document invalide: PNG ou JPEG requis");
    }
    if (agentData.document.size > 5 * 1024 * 1024) {
        console.error("Erreur de validation: fichier document trop volumineux", agentData.document.size);
        throw new Error("Fichier document trop volumineux (max 5MB)");
    }

    const formData = new FormData();
    formData.append("nom", agentData.nom.trim());
    formData.append("prenom", agentData.prenom.trim());
    formData.append("email", agentData.email.trim());
    formData.append("documentType", mapTypePieceToBackend(agentData.documentType));
    formData.append("documentNumber", agentData.documentNumber.trim());
    formData.append("role", mapRoleToBackend(agentData.role));
    formData.append("document", agentData.document);

    // Log détaillé pour débogage
    const formDataEntries = Object.fromEntries(formData);
    console.log("FormData envoyé:", { ...formDataEntries, document: agentData.document ? "[File]" : null });

    try {
        const response = await axiosClient.post("/auth/register/agent", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });
        console.log("Réponse API addAgent:", response.data);
        return {
            ...response.data.data,
            role: mapRoleFromBackend(response.data.data.role),
            documentAgent: [
                {
                    type: mapTypePieceFromBackend(response.data.data.documentType),
                    fichierUrl: response.data.data.fichierUrl || "",
                },
            ],
            contact: response.data.data.contact || "",
            documentNumber: response.data.data.documentNumber || "", // Added
            creeLe: response.data.data.createdAt || new Date().toISOString(),
        };
    } catch (err: any) {
        console.error("Erreur API addAgent:", err.response?.data || err);
        const errors = err.response?.data?.errors || [];
        let message =
            errors.length > 0
                ? errors.map((e: any) => e.message).join(", ")
                : err.response?.data?.message || err.message || "Erreur lors de la création de l’agent";
        if (message.includes("documentType")) {
            message = "Le type de document doit être CNI, RCCM ou Autres.";
        }
        throw new Error(message);
    }
};

export const getAgents = async (): Promise<Agent[]> => {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("Erreur: Token manquant pour getAgents");
        throw new Error("Token manquant");
    }

    try {
        const response = await axiosClient.get("/user/agents", {
            headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Réponse API getAgents:", response.data);

        if (!response.data.data || !Array.isArray(response.data.data)) {
            console.error("Réponse API invalide: data.data n'est pas un tableau", response.data);
            throw new Error("Réponse API invalide");
        }

        return response.data.data.map((agent: any) => {
            if (!agent || typeof agent !== "object") {
                console.warn("Agent invalide dans la réponse:", agent);
                return null;
            }
            return {
                ...agent,
                role: mapRoleFromBackend(agent.role),
                documentAgent: [
                    {
                        type: mapTypePieceFromBackend(agent.documentType),
                        fichierUrl: agent.fichierUrl || "",
                    },
                ],
                contact: agent.contact || "",
                documentNumber: agent.documentNumber || "", // Added
                creeLe: agent.createdAt || new Date().toISOString(),
            };
        }).filter((agent): agent is Agent => agent !== null);
    } catch (err: any) {
        console.error("Erreur API getAgents:", err.response?.data || err);
        const status = err.response?.status;
        let message =
            err.response?.data?.message ||
            err.message ||
            "Erreur lors de la récupération des agents";
        if (status === 401) message = "Session non authentifiée. Veuillez vous reconnecter.";
        else if (status === 403) message = "Accès non autorisé pour récupérer les agents.";
        else if (status === 404) message = "Endpoint des agents non trouvé.";
        throw new Error(message);
    }
};

export const toggleAgentActif = async (id: string): Promise<Agent> => {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("Erreur: Token manquant pour toggleAgentActif");
        throw new Error("Token manquant");
    }

    try {
        const response = await axiosClient.patch(`/user/agent/${id}/actif`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Réponse API toggleAgentActif:", response.data);
        return {
            ...response.data.data,
            role: mapRoleFromBackend(response.data.data.role),
            documentAgent: [
                {
                    type: mapTypePieceFromBackend(response.data.data.documentType),
                    fichierUrl: response.data.data.fichierUrl || "",
                },
            ],
            contact: response.data.data.contact || "",
            documentNumber: response.data.data.documentNumber || "", // Added
            creeLe: response.data.data.createdAt || new Date().toISOString(),
        };
    } catch (err: any) {
        console.error("Erreur API toggleAgentActif:", err.response?.data || err);
        const status = err.response?.status;
        let message =
            err.response?.data?.message ||
            err.message ||
            "Erreur lors du changement de statut";
        if (status === 404) message = `Agent avec ID ${id} non trouvé`;
        else if (status === 403) message = "Accès non autorisé pour modifier le statut de l'agent";
        throw new Error(message);
    }
};