import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../contexts/ToastContext";
import { useActivity } from "../contexts/ActivityContext";
import { fetchCommandes, Commande } from "../api/commandeApi";

export const useCommandes = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [commandes, setCommandes] = useState<Commande[]>([]);
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { logActivity } = useActivity();

    useEffect(() => {
        const loadCommandes = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchCommandes();
                setCommandes(data);
                console.log(data)
            } catch (err: any) {
                const errorMessage =
                    err.response?.data?.message ||
                    "Erreur lors de la récupération des commandes";
                setError(errorMessage);
                showToast({
                    type: "error",
                    title: "Erreur",
                    message: errorMessage,
                    duration: 5000,
                });
                if (err.response?.status === 401) {
                    navigate("/login-client");
                }
            } finally {
                setLoading(false);
            }
        };
        loadCommandes();
    }, [showToast, navigate, logActivity]);

    return { commandes,  loading, error };
};
export type { Commande };

