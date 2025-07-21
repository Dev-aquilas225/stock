import { useState, useEffect, useCallback } from "react";
import { fetchContacts, addContact, updateContact, deleteContact, Contact } from "../api/contactsApi";
export type { Contact}
export const useContacts = (fournisseurId: string) => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch contacts when fournisseurId changes
    useEffect(() => {
        if (!fournisseurId) {
            setContacts([]);
            setError(null);
            return;
        }

        const loadContacts = async () => {
            setLoading(true);
            setError(null);
            try {
                console.log(`useContacts: Fetching contacts for fournisseurId: ${fournisseurId}`);
                const fetchedContacts = await fetchContacts(fournisseurId);
                setContacts(fetchedContacts);
                console.log(`useContacts: Successfully fetched ${fetchedContacts.length} contacts`);
            } catch (err: any) {
                const errorMessage = err.message || "Erreur lors du chargement des contacts";
                setError(errorMessage);
                console.error("useContacts: Error fetching contacts:", {
                    message: err.message,
                    status: err.response?.status,
                    data: err.response?.data,
                });
            } finally {
                setLoading(false);
            }
        };

        loadContacts();
    }, [fournisseurId]);

    // Add a new contact
    const add = useCallback(
        async (data: Omit<Contact, "id" | "fournisseurId" | "createdAt">) => {
            if (!fournisseurId) {
                const errorMessage = "Aucun fournisseur sélectionné";
                setError(errorMessage);
                console.error("useContacts: Add contact failed:", errorMessage);
                throw new Error(errorMessage);
            }

            try {
                console.log("useContacts: Adding contact with data:", { fournisseurId, data });
                const newContact = await addContact(fournisseurId, data);
                setContacts((prev) => [...prev, newContact]);
                setError(null);
                console.log("useContacts: Contact added successfully:", newContact);
                return newContact;
            } catch (err: any) {
                const errorMessage =
                    err.message || "Erreur lors de l'ajout du contact";
                setError(errorMessage);
                console.error("useContacts: Error adding contact:", {
                    message: err.message,
                    status: err.response?.status,
                    data: err.response?.data,
                });
                throw new Error(errorMessage);
            }
        },
        [fournisseurId],
    );

    // Update an existing contact
    const update = useCallback(
        async (contactId: string, data: Omit<Contact, "id" | "fournisseurId" | "createdAt">) => {
            if (!fournisseurId) {
                const errorMessage = "Aucun fournisseur sélectionné";
                setError(errorMessage);
                console.error("useContacts: Update contact failed:", errorMessage);
                throw new Error(errorMessage);
            }

            try {
                console.log("useContacts: Updating contact with data:", { contactId, fournisseurId, data });
                const updatedContact = await updateContact(contactId, fournisseurId, data);
                setContacts((prev) =>
                    prev.map((contact) =>
                        contact.id === contactId ? updatedContact : contact,
                    ),
                );
                setError(null);
                console.log("useContacts: Contact updated successfully:", updatedContact);
                return updatedContact;
            } catch (err: any) {
                const errorMessage =
                    err.message || "Erreur lors de la mise à jour du contact";
                setError(errorMessage);
                console.error("useContacts: Error updating contact:", {
                    message: err.message,
                    status: err.response?.status,
                    data: err.response?.data,
                });
                throw new Error(errorMessage);
            }
        },
        [fournisseurId],
    );

    // Remove a contact
    const remove = useCallback(
        async (contactId: string) => {
            if (!fournisseurId) {
                const errorMessage = "Aucun fournisseur sélectionné";
                setError(errorMessage);
                console.error("useContacts: Delete contact failed:", errorMessage);
                throw new Error(errorMessage);
            }

            try {
                console.log("useContacts: Deleting contact:", { contactId, fournisseurId });
                await deleteContact(contactId, fournisseurId);
                setContacts((prev) => prev.filter((contact) => contact.id !== contactId));
                setError(null);
                console.log(`useContacts: Contact ${contactId} deleted successfully`);
            } catch (err: any) {
                const errorMessage =
                    err.message || "Erreur lors de la suppression du contact";
                setError(errorMessage);
                console.error("useContacts: Error deleting contact:", {
                    message: err.message,
                    status: err.response?.status,
                    data: err.response?.data,
                });
                throw new Error(errorMessage);
            }
        },
        [fournisseurId],
    );

    return {
        contacts,
        add,
        update,
        remove,
        loading,
        error,
    };
};