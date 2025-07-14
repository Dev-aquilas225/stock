import { useState, useEffect } from "react";
import { Contact, ContactDto, fetchContacts, addContact, updateContact, deleteContact } from "../api/contactsApi";

export const useContacts = (supplierId: string) => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!supplierId) return;

        const loadContacts = async () => {
            setLoading(true);
            try {
                const fetchedContacts = await fetchContacts(supplierId);
                setContacts(fetchedContacts);
                setError(null);
            } catch (err) {
                setError("Erreur lors du chargement des contacts");
            } finally {
                setLoading(false);
            }
        };

        loadContacts();
    }, [supplierId]);

    const add = async (data: ContactDto) => {
        setLoading(true);
        try {
            const newContact = await addContact(data);
            setContacts((prev) => [...prev, newContact]);
            setError(null);
            return newContact;
        } catch (err) {
            setError("Erreur lors de l'ajout du contact");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const update = async (contactId: string, data: Partial<ContactDto>) => {
        setLoading(true);
        try {
            const updatedContact = await updateContact(contactId, data);
            setContacts((prev) =>
                prev.map((contact) =>
                    contact.id === contactId ? updatedContact : contact
                )
            );
            setError(null);
            return updatedContact;
        } catch (err) {
            setError("Erreur lors de la mise à jour du contact");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const remove = async (contactId: string) => {
        setLoading(true);
        try {
            await deleteContact(contactId);
            setContacts((prev) => prev.filter((contact) => contact.id !== contactId));
            setError(null);
        } catch (err) {
            setError("Erreur lors de la suppression du contact");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { contacts, add, update, remove, loading, error };
};