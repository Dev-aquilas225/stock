import axiosClient from "./axiosClient";

export interface Contact {
    id: string;
    nom: string;
    fonction: string;
    email: string;
    telephone: string;
    fournisseurId: string;
}

export interface ContactDto {
    nom: string;
    fonction: string;
    email: string;
    telephone: string;
}

export const fetchContacts = async (fournisseurId: string): Promise<Contact[]> => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("No authentication token found");
    }
    try {
        const response = await axiosClient.get(`/fournisseurs/${fournisseurId}/contacts`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data.data || [];
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Erreur lors de la récupération des contacts");
    }
};

export const addContact = async (fournisseurId: string, data: ContactDto): Promise<Contact> => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("No authentication token found");
    }
    try {
        const response = await axiosClient.post(`/fournisseurs/${fournisseurId}/contacts`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Erreur lors de l'ajout du contact");
    }
};

export const updateContact = async (contactId: string, fournisseurId: string, data: Partial<ContactDto>): Promise<Contact> => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("No authentication token found");
    }
    try {
        const response = await axiosClient.put(`/fournisseurs/${fournisseurId}/contacts/${contactId}`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Erreur lors de la mise à jour du contact");
    }
};

export const deleteContact = async (contactId: string, fournisseurId: string): Promise<void> => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("No authentication token found");
    }
    try {
        await axiosClient.delete(`/fournisseurs/${fournisseurId}/contacts/${contactId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Erreur lors de la suppression du contact");
    }
};