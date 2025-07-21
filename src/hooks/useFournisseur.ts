import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../contexts/ToastContext";
import { useActivity } from "../contexts/ActivityContext";
import {
    fetchFournisseurs,
    addFournisseur,
    updateFournisseur,
    deleteFournisseur,
    Fournisseur,
} from "../api/fournisseurApi";

export const useFournisseurs = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { logActivity } = useActivity();

    useEffect(() => {
        const loadFournisseurs = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchFournisseurs();
                setFournisseurs(data);
            } catch (err: any) {
                const errorMessage = err.message.includes("Unauthorized")
                    ? "Non autorisé : Veuillez vous reconnecter"
                    : err.response?.data?.message || "Erreur lors de la récupération des fournisseurs";
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
        loadFournisseurs();
    }, [showToast]);

    const add = async (formData: Omit<Fournisseur, "id" | "minimumCommande" | "createdAt">) => {
        setLoading(true);
        setError(null);
        try {
            const res = await addFournisseur(formData);
            setFournisseurs([...fournisseurs, res]);
            showToast({
                type: "success",
                title: "Fournisseur ajouté",
                message: `Le fournisseur ${formData.nom} a été ajouté avec succès.`,
                duration: 3000,
            });
            logActivity({
                type: "create",
                module: "Fournisseurs",
                description: `Nouveau fournisseur ajouté: ${formData.nom}`,
                userId: localStorage.getItem("nexsaas_user")
                    ? JSON.parse(localStorage.getItem("nexsaas_user")!).id
                    : "unknown",
                metadata: {
                    email: formData.email,
                    categorie: formData.categorie === "1" ? "Principale" : "Secondaire",
                },
            });
            navigate("/fournisseurs");
            return res;
        } catch (err: any) {
            const errorMessage = err.message.includes("Unauthorized")
                ? "Non autorisé : Veuillez vous reconnecter"
                : err.response?.data?.message || "Erreur lors de l'enregistrement du fournisseur";
            showToast({
                type: "error",
                title: "Erreur d'ajout",
                message: errorMessage,
                duration: 5000,
            });
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const update = async (id: string, formData: Omit<Fournisseur, "id" | "minimumCommande" | "createdAt">) => {
        setLoading(true);
        setError(null);
        try {
            const res = await updateFournisseur(id, formData);
            setFournisseurs(fournisseurs.map((f) => (f.id === id ? res : f)));
            showToast({
                type: "success",
                title: "Fournisseur modifié",
                message: `Le fournisseur ${formData.nom} a été modifié avec succès.`,
                duration: 3000,
            });
            logActivity({
                type: "update",
                module: "Fournisseurs",
                description: `Fournisseur modifié: ${formData.nom}`,
                userId: localStorage.getItem("nexsaas_user")
                    ? JSON.parse(localStorage.getItem("nexsaas_user")!).id
                    : "unknown",
                metadata: {
                    fournisseurId: id,
                    email: formData.email,
                    categorie: formData.categorie === "1" ? "Principale" : "Secondaire",
                },
            });
            return res;
        } catch (err: any) {
            const errorMessage = err.message.includes("Unauthorized")
                ? "Non autorisé : Veuillez vous reconnecter"
                : err.response?.data?.message || "Erreur lors de la modification du fournisseur";
            showToast({
                type: "error",
                title: "Erreur de modification",
                message: errorMessage,
                duration: 5000,
            });
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const remove = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            await deleteFournisseur(id);
            setFournisseurs(fournisseurs.filter((f) => f.id !== id));
            showToast({
                type: "success",
                title: "Fournisseur supprimé",
                message: "Le fournisseur a été supprimé avec succès.",
                duration: 3000,
            });
            logActivity({
                type: "delete",
                module: "Fournisseurs",
                description: `Fournisseur supprimé: ${id}`,
                userId: localStorage.getItem("nexsaas_user")
                    ? JSON.parse(localStorage.getItem("nexsaas_user")!).id
                    : "unknown",
                metadata: { fournisseurId: id },
            });
        } catch (err: any) {
            const errorMessage = err.message.includes("Unauthorized")
                ? "Non autorisé : Veuillez vous reconnecter"
                : err.response?.data?.message || "Erreur lors de la suppression du fournisseur";
            showToast({
                type: "error",
                title: "Erreur de suppression",
                message: errorMessage,
                duration: 5000,
            });
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return { add, update, remove, fetchFournisseurs, fournisseurs, loading, error };
};
export type { Fournisseur };