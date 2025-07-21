import axiosClient from "./axiosClient";

export interface Contact {
    id: string;
    nom: string;
    fonction: string;
    email: string;
    telephone: string;
    isPrimary: boolean;
    fournisseurId: string;
    createdAt: string;
}

export const fetchContacts = async (fournisseurId: string): Promise<Contact[]> => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("No authentication token found");
    }
    try {
        console.log(`Fetching contacts for fournisseurId: ${fournisseurId}`);
        const response = await axiosClient.get(`fournisseurs/${fournisseurId}/contacts`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const contacts = response.data.data.map((contact: any) => ({
            id: contact.id,
            nom: contact.nom || "",
            fonction: contact.fonction || "",
            email: contact.email || "",
            telephone: contact.telephone || "",
            isPrimary: contact.isPrimary || false,
            fournisseurId: contact.fournisseurId || fournisseurId,
            createdAt: contact.createdAt || new Date().toISOString(),
        }));
        console.log(`Fetched ${contacts.length} contacts for fournisseurId: ${fournisseurId}`);
        return contacts;
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Erreur lors de la récupération des contacts";
        console.error("Error fetching contacts:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
        });
        throw new Error(errorMessage);
    }
};

export const addContact = async (fournisseurId: string, data: Omit<Contact, "id" | "fournisseurId" | "createdAt">): Promise<Contact> => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("No authentication token found");
    }

    // Validate input data
    if (!data.nom || !data.email) {
        throw new Error("Nom et email sont requis");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        throw new Error("Format d'email invalide");
    }

    try {
        const payload = {
            nom: data.nom.trim(),
            fonction: data.fonction ? data.fonction.trim() : "",
            email: data.email.trim(),
            telephone: data.telephone ? data.telephone.trim() : "",
            isPrimary: data.isPrimary || false,
        };
        console.log("Adding contact with payload:", { fournisseurId, payload });
        const response = await axiosClient.post(`fournisseurs/${fournisseurId}/contacts`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const newContact = {
            id: response.data.id,
            nom: response.data.nom || "",
            fonction: response.data.fonction || "",
            email: response.data.email || "",
            telephone: response.data.telephone || "",
            isPrimary: response.data.isPrimary || false,
            fournisseurId: response.data.fournisseurId || fournisseurId,
            createdAt: response.data.createdAt || new Date().toISOString(),
        };
        console.log("Contact added successfully:", newContact);
        return newContact;
    } catch (error: any) {
        const errorMessage =
            error.response?.status === 400
                ? error.response?.data?.message || "Données invalides fournies"
                : error.response?.status === 404
                    ? "Fournisseur non trouvé"
                    : error.response?.status === 401
                        ? "Non autorisé : Veuillez vous reconnecter"
                        : error.response?.data?.message || "Erreur lors de l'ajout du contact";
        console.error("Error adding contact:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
        });
        throw new Error(errorMessage);
    }
};

export const updateContact = async (contactId: string, fournisseurId: string, data: Omit<Contact, "id" | "fournisseurId" | "createdAt">): Promise<Contact> => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("No authentication token found");
    }

    // Validate input data
    if (!data.nom || !data.email) {
        throw new Error("Nom et email sont requis");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        throw new Error("Format d'email invalide");
    }

    try {
        const payload = {
            nom: data.nom.trim(),
            fonction: data.fonction ? data.fonction.trim() : "",
            email: data.email.trim(),
            telephone: data.telephone ? data.telephone.trim() : "",
            isPrimary: data.isPrimary || false,
        };
        console.log("Updating contact with payload:", { contactId, fournisseurId, payload });
        const response = await axiosClient.put(`fournisseurs/${fournisseurId}/contacts/${contactId}`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const updatedContact = {
            id: response.data.id,
            nom: response.data.nom || "",
            fonction: response.data.fonction || "",
            email: response.data.email || "",
            telephone: response.data.telephone || "",
            isPrimary: response.data.isPrimary || false,
            fournisseurId: response.data.fournisseurId || fournisseurId,
            createdAt: response.data.createdAt || new Date().toISOString(),
        };
        console.log("Contact updated successfully:", updatedContact);
        return updatedContact;
    } catch (error: any) {
        const errorMessage =
            error.response?.status === 400
                ? error.response?.data?.message || "Données invalides fournies"
                : error.response?.status === 404
                    ? "Contact ou fournisseur non trouvé"
                    : error.response?.status === 401
                        ? "Non autorisé : Veuillez vous reconnecter"
                        : error.response?.data?.message || "Erreur lors de la mise à jour du contact";
        console.error("Error updating contact:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
        });
        throw new Error(errorMessage);
    }
};

export const deleteContact = async (contactId: string, fournisseurId: string): Promise<void> => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("No authentication token found");
    }
    try {
        console.log(`Deleting contact: ${contactId} for fournisseurId: ${fournisseurId}`);
        await axiosClient.delete(`fournisseurs/${fournisseurId}/contacts/${contactId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log(`Contact ${contactId} deleted successfully`);
    } catch (error: any) {
        const errorMessage =
            error.response?.status === 404
                ? "Contact ou fournisseur non trouvé"
                : error.response?.status === 401
                    ? "Non autorisé : Veuillez vous reconnecter"
                    : error.response?.data?.message || "Erreur lors de la suppression du contact";
        console.error("Error deleting contact:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
        });
        throw new Error(errorMessage);
    }
};