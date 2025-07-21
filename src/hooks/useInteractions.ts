import { useState, useEffect } from "react";
import { useToast } from "../contexts/ToastContext";
import { useActivity } from "../contexts/ActivityContext";
import { InteractionDto, Interaction, fetchInteractions, addInteraction, updateInteraction, deleteInteraction } from "../api/interactionsApi";
export type { Interaction, InteractionDto };
export const useInteractions = (fournisseurId: string) => {
    const [interactions, setInteractions] = useState<Interaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();
    const { logActivity } = useActivity();

    const loadInteractions = async () => {
        if (!fournisseurId) {
            console.log("No fournisseurId provided, skipping interaction fetch");
            setInteractions([]);
            setError(null);
            return;
        }

        setLoading(true);
        try {
            const fetchedInteractions: Interaction[] = await fetchInteractions(fournisseurId);
            setInteractions(fetchedInteractions);
            setError(null);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Erreur lors du chargement des interactions";
            console.error(`Error fetching interactions for fournisseurId ${fournisseurId}:`, error);
            setError(errorMessage);
            showToast({
                type: "error",
                title: "Erreur",
                message: errorMessage,
                duration: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInteractions();
    }, [fournisseurId]);

    const add = async (data: InteractionDto): Promise<Interaction> => {
        setLoading(true);
        try {
            const newInteraction: Interaction = await addInteraction(fournisseurId, data);
            await loadInteractions();
            showToast({
                type: "success",
                title: "Interaction ajoutée",
                message: `L'interaction ${data.type} a été ajoutée avec succès.`,
                duration: 3000,
            });
            logActivity({
                type: "create",
                module: "Interactions",
                description: `Nouvelle interaction ajoutée: ${data.type}`,
                userId: localStorage.getItem("nexsaas_user")
                    ? JSON.parse(localStorage.getItem("nexsaas_user")!).id
                    : "unknown",
                metadata: {
                    fournisseurId,
                    type: data.type,
                },
            });
            setError(null);
            return newInteraction;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Erreur lors de l'ajout de l'interaction";
            console.error("Error adding interaction:", error);
            setError(errorMessage);
            showToast({
                type: "error",
                title: "Erreur d'ajout",
                message: errorMessage,
                duration: 5000,
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const update = async (interactionId: string, data: Partial<InteractionDto>): Promise<Interaction> => {
        setLoading(true);
        try {
            const updatedInteraction: Interaction = await updateInteraction(interactionId, fournisseurId, data);
            await loadInteractions();
            showToast({
                type: "success",
                title: "Interaction modifiée",
                message: `L'interaction ${data.type || updatedInteraction.type} a été mise à jour avec succès.`,
                duration: 3000,
            });
            logActivity({
                type: "update",
                module: "Interactions",
                description: `Interaction modifiée: ${data.type || updatedInteraction.type}`,
                userId: localStorage.getItem("nexsaas_user")
                    ? JSON.parse(localStorage.getItem("nexsaas_user")!).id
                    : "unknown",
                metadata: {
                    fournisseurId,
                    interactionId,
                },
            });
            setError(null);
            return updatedInteraction;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Erreur lors de la mise à jour de l'interaction";
            console.error(`Error updating interaction ${interactionId}:`, error);
            setError(errorMessage);
            showToast({
                type: "error",
                title: "Erreur de mise à jour",
                message: errorMessage,
                duration: 5000,
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const remove = async (interactionId: string): Promise<void> => {
        setLoading(true);
        try {
            await deleteInteraction(interactionId, fournisseurId);
            await loadInteractions();
            showToast({
                type: "success",
                title: "Interaction supprimée",
                message: "L'interaction a été supprimée avec succès.",
                duration: 3000,
            });
            logActivity({
                type: "delete",
                module: "Interactions",
                description: `Interaction supprimée: ${interactionId}`,
                userId: localStorage.getItem("nexsaas_user")
                    ? JSON.parse(localStorage.getItem("nexsaas_user")!).id
                    : "unknown",
                metadata: {
                    fournisseurId,
                    interactionId,
                },
            });
            setError(null);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Erreur lors de la suppression de l'interaction";
            console.error(`Error deleting interaction ${interactionId}:`, error);
            setError(errorMessage);
            showToast({
                type: "error",
                title: "Erreur de suppression",
                message: errorMessage,
                duration: 5000,
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return { interactions, add, update, remove, loading, error };
};