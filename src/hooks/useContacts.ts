import { useState, useEffect } from "react";
import { Contact as ApiContact, ContactDto, fetchContacts, addContact, updateContact, deleteContact } from "../api/contactsApi";

// Define the Contact interface used by the component
export interface Contact {
    id: string;
    nom: string;
    fonction: string;
    email: string;
    telephone: string;
    isPrimary: boolean;
}

export const useContacts = (supplierId: string) => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!supplierId) {
            console.log("No supplierId provided, skipping contact fetch");
            setContacts([]);
            setError(null);
            return;
        }

        const loadContacts = async () => {
            setLoading(true);
            try {
                console.log(`Loading contacts for supplierId: ${supplierId}`);
                const fetchedContacts: ApiContact[] = await fetchContacts(supplierId);
                // Map API Contact to component Contact
                const mappedContacts: Contact[] = fetchedContacts.map((contact) => ({
                    id: contact.id,
                    nom: contact.name,
                    fonction: contact.role,
                    email: contact.email,
                    telephone: contact.phone,
                    isPrimary: contact.isPrimary,
                }));
                setContacts(mappedContacts);
                setError(null);
            } catch (err: any) {
                const errorMessage = err.message || "Erreur lors du chargement des contacts";
                console.error(`Error loading contacts for supplierId ${supplierId}:`, err);
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        loadContacts();
    }, [supplierId]);

    const add = async (data: ContactDto) => {
        setLoading(true);
        try {
            console.log("Adding contact:", data);
            const newContact: ApiContact = await addContact(data);
            // Map the new contact to the component's Contact interface
            const mappedContact: Contact = {
                id: newContact.id,
                nom: newContact.name,
                fonction: newContact.role,
                email: newContact.email,
                telephone: newContact.phone,
                isPrimary: newContact.isPrimary,
            };
            setContacts((prev) => [...prev, mappedContact]);
            setError(null);
            return mappedContact;
        } catch (err: any) {
            const errorMessage = err.message || "Erreur lors de l'ajout du contact";
            console.error("Error adding contact:", err);
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const update = async (contactId: string, data: Partial<ContactDto>) => {
        setLoading(true);
        try {
            console.log(`Updating contact ${contactId}:`, data);
            const updatedContact: ApiContact = await updateContact(contactId, data);
            // Map the updated contact to the component's Contact interface
            const mappedContact: Contact = {
                id: updatedContact.id,
                nom: updatedContact.name,
                fonction: updatedContact.role,
                email: updatedContact.email,
                telephone: updatedContact.phone,
                isPrimary: updatedContact.isPrimary,
            };
            setContacts((prev) =>
                prev.map((contact) =>
                    contact.id === contactId ? mappedContact : contact
                )
            );
            setError(null);
            return mappedContact;
        } catch (err: any) {
            const errorMessage = err.message || "Erreur lors de la mise à jour du contact";
            console.error(`Error updating contact ${contactId}:`, err);
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const remove = async (contactId: string) => {
        setLoading(true);
        try {
            console.log(`Deleting contact ${contactId}`);
            await deleteContact(contactId);
            setContacts((prev) => prev.filter((contact) => contact.id !== contactId));
            setError(null);
        } catch (err: any) {
            const errorMessage = err.message || "Erreur lors de la suppression du contact";
            console.error(`Error deleting contact ${contactId}:`, err);
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { contacts, add, update, remove, loading, error };
};