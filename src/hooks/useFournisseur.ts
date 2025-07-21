import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../contexts/ToastContext";
import { useActivity } from "../contexts/ActivityContext";
import {
    fetchFournisseurs,
    addFournisseur,
    Fournisseur,
    FournisseurDto,
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
                console.log(data)
            } catch (err: any) {
                const errorMessage =
                    err.response?.data?.message ||
                    "Erreur lors de la récupération des fournisseurs";
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

    const add = async (formData: FournisseurDto) => {
        setLoading(true);
        setError(null);
        try {
            const res = await addFournisseur(formData);
            const newFournisseur: Fournisseur = {
                id: res.id || `fournisseur-${Date.now()}`,
                nom: formData.nom,
                adresse: formData.adresse,
                email: formData.email,
                telephone: formData.telephone,
                categorie: formData.categorie,
                delaiLivraison: formData.delaiLivraison,
                remise: formData.remise,
                minimumCommande: formData.minimumCommande,
                createdAt: res.createdAt || new Date().toISOString(),
            };
            setFournisseurs([...fournisseurs, newFournisseur]);
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
                    categorie:
                        formData.categorie === "1"
                            ? "Principale"
                            : "Secondaire",
                },
            });
            navigate("/fournisseurs");
            return res;
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message ||
                "Erreur lors de l'ajout du fournisseur";
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

    return { add, fetchFournisseurs, fournisseurs, loading, error };
};
export type { Fournisseur };

