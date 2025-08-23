// src/api/ventesApi.ts - API pour gérer les ventes POS
import axiosClient from './axiosClient';

export interface CreateVenteDto {
  modePaiement: 'WAVE' | 'ORANGE_MONEY' | 'MTN_MONEY' | 'MOOV_MONEY' | 'AUTRE';
  produits: Array<{
    produitStockId: number;
  }>;
  nomClient?: string;
  prenomClient?: string;
  contactClient?: string;
  autreMoyenPaiement?: string;
}

export interface Vente {
  id: number;
  dateVente: string;
  total: number;
  totalPaye: number;
  commentaire?: string;
  nomClient?: string;
  prenomClient?: string;
  contactClient?: string;
  moyenPaiement: string;
  autreMoyenPaiement?: string;
  vendeur: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
  };
  produits: Array<{
    id: number;
    sku: string;
    lot: string;
    prix: number;
    prixVente: number;
    qrCode: string;
    produitFournisseur: {
      nom: string;
      fournisseur: {
        nom: string;
      };
    };
  }>;
}

export interface VentesStats {
  totalVentes: number;
  totalMontant: number;
  ventesAujourdhui: number;
  montantAujourdhui: number;
  ventesMoisCourant: number;
  montantMoisCourant: number;
  topProduits: Array<{
    nom: string;
    quantite: number;
    montant: number;
  }>;
}

class VentesApi {
  // Créer une nouvelle vente
  async creerVente(venteData: CreateVenteDto): Promise<{ success: boolean; message: string; data?: Vente }> {
    try {
      const response = await axiosClient.post('/ventes', venteData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création de la vente');
    }
  }

  // Récupérer toutes les ventes
  async obtenirVentes(): Promise<Vente[]> {
    try {
      const response = await axiosClient.get('/ventes');
      return response.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des ventes');
    }
  }

  // Récupérer une vente par ID
  async obtenirVente(id: number): Promise<Vente> {
    try {
      const response = await axiosClient.get(`/ventes/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de la vente');
    }
  }

  // Récupérer les ventes entre deux dates
  async obtenirVentesParPeriode(startDate?: number, endDate?: number): Promise<{ success: boolean; message: string; data: Vente[] }> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start', startDate.toString());
      if (endDate) params.append('end', endDate.toString());
      
      const response = await axiosClient.get(`/ventes/filter?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des ventes par période');
    }
  }

  // Récupérer les ventes du jour
  async obtenirVentesAujourdhui(): Promise<Vente[]> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).getTime();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).getTime();
      
      const result = await this.obtenirVentesParPeriode(startOfDay, endOfDay);
      return result.data || [];
    } catch (error) {
      throw console.error('Erreur lors de la récupération des ventes du jour', error);
    }
  }

  // Récupérer les ventes du mois
  async obtenirVentesMoisCourant(): Promise<Vente[]> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
      
      const result = await this.obtenirVentesParPeriode(startOfMonth, endOfMonth);
      return result.data || [];
    } catch (error) {
      throw console.error('Erreur lors de la récupération des ventes du mois', error);
    }
  }

  // Calculer les statistiques de ventes
  async obtenirStatistiques(): Promise<VentesStats> {
    try {
      const [toutesVentes, ventesAujourdhui, ventesMois] = await Promise.all([
        this.obtenirVentes(),
        this.obtenirVentesAujourdhui(),
        this.obtenirVentesMoisCourant()
      ]);

      // Calculer les totaux
      const totalVentes = toutesVentes.length;
      const totalMontant = toutesVentes.reduce((sum, vente) => sum + vente.total, 0);
      
      const ventesAujourdhuiCount = ventesAujourdhui.length;
      const montantAujourdhui = ventesAujourdhui.reduce((sum, vente) => sum + vente.total, 0);
      
      const ventesMoisCourantCount = ventesMois.length;
      const montantMoisCourant = ventesMois.reduce((sum, vente) => sum + vente.total, 0);

      // Calculer les top produits
      const produitsVendus = new Map<string, { nom: string; quantite: number; montant: number }>();
      
      toutesVentes.forEach(vente => {
        vente.produits.forEach(produit => {
          const nom = produit.produitFournisseur.nom;
          const prix = produit.prixVente || produit.prix;
          
          if (produitsVendus.has(nom)) {
            const existant = produitsVendus.get(nom)!;
            existant.quantite += 1;
            existant.montant += prix;
          } else {
            produitsVendus.set(nom, {
              nom,
              quantite: 1,
              montant: prix
            });
          }
        });
      });

      const topProduits = Array.from(produitsVendus.values())
        .sort((a, b) => b.quantite - a.quantite)
        .slice(0, 5);

      return {
        totalVentes,
        totalMontant,
        ventesAujourdhui: ventesAujourdhuiCount,
        montantAujourdhui,
        ventesMoisCourant: ventesMoisCourantCount,
        montantMoisCourant,
        topProduits
      };
    } catch (error: any) {
      throw new Error('Erreur lors du calcul des statistiques');
    }
  }

  // Exporter les ventes en CSV
  async exporterVentesCSV(startDate?: Date, endDate?: Date): Promise<string> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start', startDate.getTime().toString());
      if (endDate) params.append('end', endDate.getTime().toString());
      
      const response = await axiosClient.get(`/ventes/export/csv?${params.toString()}`, {
        responseType: 'blob'
      });
      
      // Créer un URL de téléchargement
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      
      return url;
    } catch (error: any) {
      throw new Error('Erreur lors de l\'export des ventes');
    }
  }

  // Générer un reçu de vente
  async genererRecu(venteId: number): Promise<string> {
    try {
      const response = await axiosClient.get(`/ventes/${venteId}/recu`, {
        responseType: 'blob'
      });
      
      // Créer un URL de téléchargement pour le PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      return url;
    } catch (error: any) {
      throw new Error('Erreur lors de la génération du reçu');
    }
  }

  // Scanner un produit pour le POS
  async scannerProduit(qrCode: string, commentaire?: string): Promise<any> {
    try {
      const response = await axiosClient.post('/produits-stock/scan', {
        id: qrCode,
        commentaire: commentaire || 'Scan POS'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Produit non trouvé ou indisponible');
    }
  }

  // Vérifier la disponibilité d'un produit
  async verifierDisponibilite(produitId: string): Promise<boolean> {
    try {
      const produit = await this.scannerProduit(produitId, 'Vérification disponibilité');
      return produit && produit.statut === 'DISPONIBLE';
    } catch (error) {
      return false;
    }
  }

  // Rechercher des produits disponibles
  async rechercherProduitsDisponibles(terme?: string): Promise<any[]> {
    try {
      const response = await axiosClient.get('/produits-stock', {
        params: { 
          statut: 'DISPONIBLE',
          search: terme 
        }
      });
      
      // Filtrer pour ne retourner que les produits disponibles
      const produitsAvecStock = response.data || [];
      const produitsDisponibles: any[] = [];
      
      produitsAvecStock.forEach((group: any) => {
        const stocksDisponibles = group.stocks?.filter((stock: any) => 
          stock.estActif && stock.statut === 'DISPONIBLE'
        ) || [];
        
        if (stocksDisponibles.length > 0) {
          produitsDisponibles.push({
            ...group.produitFournisseur,
            stocks: stocksDisponibles
          });
        }
      });
      
      return produitsDisponibles;
    } catch (error: any) {
      throw new Error('Erreur lors de la recherche de produits');
    }
  }
}

// Instance singleton
export const ventesApi = new VentesApi();

// Fonctions utilitaires
export const formatMontant = (montant: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(montant);
};

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
};

export const formatDateOnly = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(dateObj);
};

export const getMoyenPaiementIcon = (moyen: string): string => {
  const icons: Record<string, string> = {
    'WAVE': '📱',
    'ORANGE_MONEY': '🧡',
    'MTN_MONEY': '💛',
    'MOOV_MONEY': '🔵',
    'AUTRE': '💳'
  };
  return icons[moyen] || '💳';
};

export const getMoyenPaiementLabel = (moyen: string, autre?: string): string => {
  const labels: Record<string, string> = {
    'WAVE': 'Wave',
    'ORANGE_MONEY': 'Orange Money',
    'MTN_MONEY': 'MTN Money',
    'MOOV_MONEY': 'Moov Money',
    'AUTRE': autre || 'Autre'
  };
  return labels[moyen] || moyen;
};