// src/hooks/useVentes.ts
import { useState, useEffect, useCallback } from 'react';
import { ventesApi, CreateVenteDto, Vente, VentesStats } from '../api/ventesApi';
import { useToast } from '../contexts/ToastContext';

interface UseVentesReturn {
  // États
  ventes: Vente[];
  ventesLoading: boolean;
  ventesError: string | null;
  stats: VentesStats | null;
  statsLoading: boolean;
  selectedVente: Vente | null;
  
  // Actions
  chargerVentes: () => Promise<void>;
  chargerVente: (id: number) => Promise<Vente | null>;
  creerVente: (venteData: CreateVenteDto) => Promise<boolean>;
  chargerStatistiques: () => Promise<void>;
  filtrerVentesParPeriode: (startDate?: Date, endDate?: Date) => Promise<Vente[]>;
  exporterCSV: (startDate?: Date, endDate?: Date) => Promise<void>;
  genererRecu: (venteId: number) => Promise<void>;
  rechercherVentes: (terme: string) => Vente[];
  
  // Utilitaires
  obtenirVentesAujourdhui: () => Vente[];
  obtenirVentesMoisCourant: () => Vente[];
  calculerTotalPeriode: (ventes: Vente[]) => number;
}

export const useVentes = (): UseVentesReturn => {
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [ventesLoading, setVentesLoading] = useState(false);
  const [ventesError, setVentesError] = useState<string | null>(null);
  const [stats, setStats] = useState<VentesStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [selectedVente, setSelectedVente] = useState<Vente | null>(null);
  
  const { showToast } = useToast();

  // Charger toutes les ventes
  const chargerVentes = useCallback(async () => {
    setVentesLoading(true);
    setVentesError(null);
    
    try {
      const ventesData = await ventesApi.obtenirVentes();
      setVentes(ventesData);
    } catch (error: any) {
      const errorMessage = error.message || 'Erreur lors du chargement des ventes';
      setVentesError(errorMessage);
      showToast({
        type: 'error',
        title: 'Erreur',
        message: errorMessage
      });
    } finally {
      setVentesLoading(false);
    }
  }, [showToast]);

  // Charger une vente spécifique
  const chargerVente = useCallback(async (id: number): Promise<Vente | null> => {
    try {
      const vente = await ventesApi.obtenirVente(id);
      setSelectedVente(vente);
      return vente;
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Erreur',
        message: error.message || 'Erreur lors du chargement de la vente'
      });
      return null;
    }
  }, [showToast]);

  // Créer une nouvelle vente
  const creerVente = useCallback(async (venteData: CreateVenteDto): Promise<boolean> => {
    try {
      const result = await ventesApi.creerVente(venteData);
      
      if (result.success) {
        showToast({
          type: 'success',
          title: 'Vente créée',
          message: result.message || 'La vente a été enregistrée avec succès'
        });
        
        // Recharger les ventes et statistiques
        await chargerVentes();
        await chargerStatistiques();
        
        return true;
      } else {
        throw new Error(result.message || 'Erreur lors de la création de la vente');
      }
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Erreur de vente',
        message: error.message || 'Impossible de créer la vente'
      });
      return false;
    }
  }, [showToast, chargerVentes]);

  // Charger les statistiques
  const chargerStatistiques = useCallback(async () => {
    setStatsLoading(true);
    
    try {
      const statsData = await ventesApi.obtenirStatistiques();
      setStats(statsData);
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Erreur',
        message: error.message || 'Erreur lors du chargement des statistiques'
      });
    } finally {
      setStatsLoading(false);
    }
  }, [showToast]);

  // Filtrer les ventes par période
  const filtrerVentesParPeriode = useCallback(async (startDate?: Date, endDate?: Date): Promise<Vente[]> => {
    try {
      const startTimestamp = startDate ? startDate.getTime() : undefined;
      const endTimestamp = endDate ? endDate.getTime() : undefined;
      
      const result = await ventesApi.obtenirVentesParPeriode(startTimestamp, endTimestamp);
      return result.data || [];
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Erreur',
        message: error.message || 'Erreur lors du filtrage des ventes'
      });
      return [];
    }
  }, [showToast]);

  // Exporter en CSV
  const exporterCSV = useCallback(async (startDate?: Date, endDate?: Date) => {
    try {
      const downloadUrl = await ventesApi.exporterVentesCSV(startDate, endDate);
      
      // Déclencher le téléchargement
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `ventes-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Nettoyer l'URL
      window.URL.revokeObjectURL(downloadUrl);
      
      showToast({
        type: 'success',
        title: 'Export réussi',
        message: 'Les ventes ont été exportées en CSV'
      });
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Erreur d\'export',
        message: error.message || 'Impossible d\'exporter les ventes'
      });
    }
  }, [showToast]);

  // Générer un reçu
  const genererRecu = useCallback(async (venteId: number) => {
    try {
      const downloadUrl = await ventesApi.genererRecu(venteId);
      
      // Ouvrir le PDF dans un nouvel onglet
      window.open(downloadUrl, '_blank');
      
      showToast({
        type: 'success',
        title: 'Reçu généré',
        message: 'Le reçu a été généré et ouvert dans un nouvel onglet'
      });
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Erreur de génération',
        message: error.message || 'Impossible de générer le reçu'
      });
    }
  }, [showToast]);

  // Rechercher dans les ventes
  const rechercherVentes = useCallback((terme: string): Vente[] => {
    if (!terme.trim()) return ventes;
    
    const termeLower = terme.toLowerCase();
    
    return ventes.filter(vente => 
      // Recherche par ID
      vente.id.toString().includes(termeLower) ||
      // Recherche par nom client
      vente.nomClient?.toLowerCase().includes(termeLower) ||
      vente.prenomClient?.toLowerCase().includes(termeLower) ||
      // Recherche par contact
      vente.contactClient?.toLowerCase().includes(termeLower) ||
      // Recherche par moyen de paiement
      vente.moyenPaiement.toLowerCase().includes(termeLower) ||
      // Recherche par produits
      vente.produits.some(produit => 
        produit.produitFournisseur.nom.toLowerCase().includes(termeLower) ||
        produit.sku.toLowerCase().includes(termeLower)
      ) ||
      // Recherche par vendeur
      vente.vendeur.nom.toLowerCase().includes(termeLower) ||
      vente.vendeur.prenom.toLowerCase().includes(termeLower)
    );
  }, [ventes]);

  // Obtenir les ventes d'aujourd'hui
  const obtenirVentesAujourdhui = useCallback((): Vente[] => {
    const aujourd_hui = new Date().toISOString().split('T')[0];
    
    return ventes.filter(vente => {
      const dateVente = new Date(vente.dateVente).toISOString().split('T')[0];
      return dateVente === aujourd_hui;
    });
  }, [ventes]);

  // Obtenir les ventes du mois courant
  const obtenirVentesMoisCourant = useCallback((): Vente[] => {
    const maintenant = new Date();
    const annee = maintenant.getFullYear();
    const mois = maintenant.getMonth();
    
    return ventes.filter(vente => {
      const dateVente = new Date(vente.dateVente);
      return dateVente.getFullYear() === annee && dateVente.getMonth() === mois;
    });
  }, [ventes]);

  // Calculer le total d'une période
  const calculerTotalPeriode = useCallback((ventesFiltrées: Vente[]): number => {
    return ventesFiltrées.reduce((total, vente) => total + vente.total, 0);
  }, []);

  // Charger les données au montage du composant
  useEffect(() => {
    chargerVentes();
    chargerStatistiques();
  }, [chargerVentes, chargerStatistiques]);

  // Recharger les statistiques quand les ventes changent
  useEffect(() => {
    if (ventes.length > 0) {
      chargerStatistiques();
    }
  }, [ventes.length, chargerStatistiques]);

  return {
    // États
    ventes,
    ventesLoading,
    ventesError,
    stats,
    statsLoading,
    selectedVente,
    
    // Actions
    chargerVentes,
    chargerVente,
    creerVente,
    chargerStatistiques,
    filtrerVentesParPeriode,
    exporterCSV,
    genererRecu,
    rechercherVentes,
    
    // Utilitaires
    obtenirVentesAujourdhui,
    obtenirVentesMoisCourant,
    calculerTotalPeriode
  };
};
export default useVentes;