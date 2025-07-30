import axiosClient from "./axiosClient";

// 🎯 Rôles autorisés uniquement : vendeur ou gestionnaire
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
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  actif: boolean;
  creeLe: string;
}

// Helper function to map UserRole to backend-expected format
const mapRoleToBackend = (role: UserRole): string => {
  // Try different mappings to match backend expectations
  // Current assumption: lowercase values; adjust as needed
  switch (role) {
    case UserRole.GESTIONNAIRE:
      return "gestionnaire"; // Test with lowercase
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

// Validate CreateAgentDto
const validateAgentData = (agentData: CreateAgentDto): void => {
  if (!agentData.nom.trim()) {
    throw new Error("Nom requis");
  }
  if (!agentData.prenom.trim()) {
    throw new Error("Prénom requis");
  }
  if (!agentData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(agentData.email)) {
    throw new Error("Email invalide");
  }
  if (!Object.values(UserRole).includes(agentData.role)) {
    throw new Error("Rôle invalide: doit être GESTIONNAIRE ou VENDEUR");
  }
};

// ➕ Créer un agent
export const addAgent = async (agentData: CreateAgentDto): Promise<Agent> => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("Erreur dans addAgent: Token d'authentification manquant");
    throw new Error("Token d'authentification manquant");
  }

  // Validate input data
  validateAgentData(agentData);

  // Prepare payload
  const payload = {
    ...agentData,
    role: mapRoleToBackend(agentData.role),
  };

  try {
    console.debug("Envoi de la requête addAgent avec payload:", JSON.stringify(payload, null, 2)); // Log full payload

    const response = await axiosClient.post("/auth/register/agent", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.debug("Réponse de addAgent:", JSON.stringify(response.data, null, 2)); // Log full response
    return response.data.data;
  } catch (err: any) {
    const errorMessage =
      err.response?.data?.message ||
      err.message ||
      "Erreur lors de la création de l'agent";
    console.error("Erreur dans addAgent:", {
      message: errorMessage,
      status: err.response?.status,
      data: JSON.stringify(err.response?.data, null, 2), // Log full error response
      payload: JSON.stringify(payload, null, 2), // Log full payload
    });
    throw new Error(errorMessage);
  }
};

// 📋 Récupérer tous les agents
export const getAgents = async (): Promise<Agent[]> => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("Erreur dans getAgents: Token d'authentification manquant");
    throw new Error("Token d'authentification manquant");
  }

  try {
    console.debug("Envoi de la requête getAgents");
    const response = await axiosClient.get("/user/agents", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.debug("Réponse de getAgents:", JSON.stringify(response.data, null, 2));
    return response.data.data;
  } catch (err: any) {
    const errorMessage =
      err.response?.data?.message ||
      err.message ||
      "Erreur lors de la récupération des agents";
    console.error("Erreur dans getAgents:", {
      message: errorMessage,
      status: err.response?.status,
      data: JSON.stringify(err.response?.data, null, 2),
    });
    throw new Error(errorMessage);
  }
};

// 🗑️ Supprimer un agent
export const deleteAgent = async (id: number): Promise<void> => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("Erreur dans deleteAgent: Token d'authentification manquant");
    throw new Error("Token d'authentification manquant");
  }

  try {
    console.debug("Envoi de la requête deleteAgent pour ID:", id);
    await axiosClient.delete(`/user/agent/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.debug("Agent supprimé avec succès, ID:", id);
  } catch (err: any) {
    const errorMessage =
      err.response?.data?.message ||
      err.message ||
      "Erreur lors de la suppression";
    console.error("Erreur dans deleteAgent:", {
      message: errorMessage,
      status: err.response?.status,
      data: JSON.stringify(err.response?.data, null, 2),
      id,
    });
    throw new Error(errorMessage);
  }
};

// ✅ Activer / Désactiver un agent
export const toggleAgentActif = async (id: number): Promise<Agent> => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("Erreur dans toggleAgentActif: Token d'authentification manquant");
    throw new Error("Token d'authentification manquant");
  }

  try {
    console.debug("Envoi de la requête toggleAgentActif pour ID:", id);
    const response = await axiosClient.patch(`/user/agent/${id}/actif`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.debug("Réponse de toggleAgentActif:", JSON.stringify(response.data, null, 2));
    return response.data.data;
  } catch (err: any) {
    const errorMessage =
      err.response?.data?.message ||
      err.message ||
      "Erreur lors du changement de statut de l'agent";
    console.error("Erreur dans toggleAgentActif:", {
      message: errorMessage,
      status: err.response?.status,
      data: JSON.stringify(err.response?.data, null, 2),
      id,
    });
    throw new Error(errorMessage);
  }
};