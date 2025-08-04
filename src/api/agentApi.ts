import axiosClient from "./axiosClient";

export enum UserRole {
  GESTIONNAIRE = "GESTIONNAIRE",
  VENDEUR = "VENDEUR",
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
  switch (role) {
    case UserRole.GESTIONNAIRE:
      return "gestionnaire"; // Try lowercase first
    case UserRole.VENDEUR:
      return "vendeur";
    default:
      throw new Error(`Rôle invalide: ${role}`);
  }
  // Alternative mappings to try if error persists:
  // case UserRole.GESTIONNAIRE: return "manager";
  // case UserRole.VENDEUR: return "seller";
  // case UserRole.GESTIONNAIRE: return "GESTIONNAIRE"; // Uppercase
  // case UserRole.VENDEUR: return "VENDEUR"; // Uppercase
};

// ➕ Créer un agent
export const addAgent = async (agentData: CreateAgentDto): Promise<Agent> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token manquant");

  try {
    const payload = {
      ...agentData,
      role: mapRoleToBackend(agentData.role),
    };
    console.debug("Envoi de l'agentData:", JSON.stringify(payload, null, 2)); // Log payload
    const response = await axiosClient.post("/auth/register/agent", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.debug("Réponse:", JSON.stringify(response.data, null, 2)); // Log response
    return response.data.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Erreur lors de la création de l’agent";
    console.error("Erreur dans addAgent:", {
      message,
      response: JSON.stringify(error.response?.data, null, 2),
      payload: JSON.stringify(agentData, null, 2),
    });
    throw new Error(message);
  }
};

// 📋 Récupérer tous les agents
export const getAgents = async (): Promise<Agent[]> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token manquant");

  try {
    const response = await axiosClient.get("/user/agents", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Erreur lors du chargement des agents";
    throw new Error(message);
  }
};

// 🔁 Activer / Désactiver un agent
export const toggleAgentActif = async (id: string): Promise<Agent> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token manquant");

  try {
    const response = await axiosClient.patch(`/user/agent/${id}/actif`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Erreur lors du changement de statut";
    throw new Error(message);
  }
};