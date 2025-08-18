// src/hooks/useVentes.ts
import { useState, useEffect } from 'react';
import { ventesApi, Vente, VentesStats, CreateVenteDto } from '../api/ventesApi';
import { useToast } from '../contexts/ToastContext';

export const useVentes = () => {
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [stats, setStats] = useState<VentesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  // Récupérer toutes les ventes
  const fetchVentes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ventesApi.getVentes();
      setVentes(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la récupération des ventes';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les statistiques
  const fetchStats = async () => {
    try {
      const data = await ventesApi.getVentesStats();
      setStats(data);
    } catch (err: any) {
      console.error('Erreur lors de la récupération des stats:', err);
    }
  };

  // Créer une nouvelle vente
  const createVente = async (venteData: CreateVenteDto) => {
    try {
      const newVente = await ventesApi.createVente(venteData);
      setVentes(prev => [newVente, ...prev]);
      showToast('Vente créée avec succès', id);
      return newVente;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la création de la vente';
      showToast(errorMessage, 'error');
      throw err;
    }
  };

  // Récupérer les ventes entre deux dates
  const fetchVentesBetween = async (startDate: Date, endDate: Date) => {
    try {
      setLoading(true);
      const start = startDate.getTime();
      const end = endDate.getTime();
      const data = await ventesApi.getVentesBetween(start, end);
      setVentes(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la récupération des ventes';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Initialisation
  useEffect(() => {
    fetchVentes();
    fetchStats();
  }, []);

  return {
    ventes,
    stats,
    loading,
    error,
    fetchVentes,
    fetchStats,
    createVente,
    fetchVentesBetween,
    refetch: fetchVentes,
  };
};

export default useVentes;
