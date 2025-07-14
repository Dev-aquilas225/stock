import axiosClient from "./axiosClient";

export interface ContactDto {
    name: string;
    role: string;
    email: string;
    phone: string;
    isPrimary: boolean;
    supplierId: string;
}

export interface Contact {
    id: string;
    name: string;
    role: string;
    email: string;
    phone: string;
    isPrimary: boolean;
    supplierId: string;
    createdAt: string;
}

export const fetchContacts = async (supplierId: string): Promise<Contact[]> => {
    const token = localStorage.getItem("token");
    const response = await axiosClient.get(`suppliers/${supplierId}/contacts`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.data;
};

export const addContact = async (data: ContactDto): Promise<Contact> => {
    const token = localStorage.getItem("token");
    const response = await axiosClient.post(`suppliers/${data.supplierId}/contacts`, data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const updateContact = async (contactId: string, data: Partial<ContactDto>): Promise<Contact> => {
    const token = localStorage.getItem("token");
    const response = await axiosClient.put(`contacts/${contactId}`, data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const deleteContact = async (contactId: string): Promise<void> => {
    const token = localStorage.getItem("token");
    await axiosClient.delete(`contacts/${contactId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};