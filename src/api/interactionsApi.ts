import axiosClient from "./axiosClient";

export interface InteractionDto {
    type: string;
    note: string;
}

export interface Interaction {
    id: string;
    type: string;
    note: string;
    createdAt: string;
}

export const fetchInteractions = async (fournisseurId: string): Promise<Interaction[]> => {
    const token = localStorage.getItem("token");
    const response = await axiosClient.get(`fournisseurs/${fournisseurId}/interactions`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.data;
};

export const addInteraction = async (fournisseurId: string, data: InteractionDto): Promise<Interaction> => {
    const token = localStorage.getItem("token");
    const response = await axiosClient.post(`fournisseurs/${fournisseurId}/interactions`, data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const updateInteraction = async (interactionId: string, fournisseurId: string, data: Partial<InteractionDto>): Promise<Interaction> => {
    const token = localStorage.getItem("token");
    const response = await axiosClient.put(`fournisseurs/${fournisseurId}/interactions/${interactionId}`, data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const deleteInteraction = async (interactionId: string, fournisseurId: string): Promise<void> => {
    const token = localStorage.getItem("token");
    await axiosClient.delete(`fournisseurs/${fournisseurId}/interactions/${interactionId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};