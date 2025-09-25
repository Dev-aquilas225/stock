import { useEffect, useState } from "react";
import { getVentes, Vente } from "../api/venteApi";

interface VenteStats {
    ventesCeMois: number;
    nombreCommandes: number;
    tauxConversion: number;
}

export const useVentes = () => {
    const [ventes, setVentes] = useState<Vente[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<VenteStats | null>(null);

    useEffect(() => {
        const fetchVentes = async () => {
            try {
                setLoading(true);
                const data = await getVentes();
                setVentes(data);

                // Calculate stats (placeholder logic)
                const ventesCeMois = data.reduce(
                    (sum: number, vente: { total: string; }) => sum + parseFloat(vente.total),
                    0,
                );
                const nombreCommandes = data.length;
                const tauxConversion = 2.5; // Placeholder value; replace with actual logic

                setStats({
                    ventesCeMois,
                    nombreCommandes,
                    tauxConversion,
                });
            } catch (err) {
                setError("Erreur lors du chargement des ventes");
            } finally {
                setLoading(false);
            }
        };

        fetchVentes();
    }, []);

    return { ventes, loading, stats, error };
};
