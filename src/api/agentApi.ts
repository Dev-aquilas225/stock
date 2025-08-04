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
      return "gestionnaire";
    case UserRole.VENDEUR:
      return "vendeur";
    default:
      throw new Error(`Rôle invalide: ${role}`);
  }
};

// Map backend role to UserRole
const mapRoleFromBackend = (role: string): UserRole => {
  switch (role.toLowerCase()) {
    case "gestionnaire":
      return UserRole.GESTIONNAIRE;
    case "vendeur":
      return UserRole.VENDEUR;
    default:
      console.warn(`Rôle inconnu du backend: ${role}, retour à VENDEUR par défaut`);
      return UserRole.VENDEUR;
  }
};

// ➕ Créer un agent
export const addAgent = async (agentData: CreateAgentDto): Promise<Agent> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token manquant");

  const payload = {
    ...agentData,
    role: mapRoleToBackend(agentData.role),
  };

  try {
    console.debug("Envoi de l'agentData:", JSON.stringify(payload, null, 2));
    const response = await axiosClient.post("/auth/register/agent", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.debug("Réponse brute:", JSON.stringify(response.data, null, 2));

    const agent: Agent = {
      ...response.data.data,
      role: mapRoleFromBackend(response.data.data.role),
    };
    console.debug("Agent mappé:", JSON.stringify(agent, null, 2));
    return agent;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Erreur lors de la création de l’agent";
    console.error("Erreur dans addAgent:", {
      message,
      response: JSON.stringify(error.response?.data, null, 2),
      payload: JSON.stringify(payload, null, 2),
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
    console.debug("Réponse getAgents:", JSON.stringify(response.data, null, 2));

    const agents: Agent[] = response.data.data.map((agent: any) => ({
      ...agent,
      role: mapRoleFromBackend(agent.role),
    }));
    return agents;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Erreur lors du chargement des agents";
    console.error("Erreur dans getAgents:", {
      message,
      response: JSON.stringify(error.response?.data, null, 2),
    });
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
    console.debug("Réponse toggleAgentActif:", JSON.stringify(response.data, null, 2));

    const agent: Agent = {
      ...response.data.data,
      role: mapRoleFromBackend(response.data.data.role),
    };
    return agent;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Erreur lors du changement de statut";
    console.error("Erreur dans toggleAgentActif:", {
      message,
      response: JSON.stringify(error.response?.data, null, 2),
    });
    throw new Error(message);
  }
};