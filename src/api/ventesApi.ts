// src/api/ventesApi.ts
import axiosClient from './axiosClient';

// Types pour les ventes
export interface Vente {
  id: number;
  dateVente: string;
  total: number;
  totalPaye: number;
  commentaire?: string;
  nomClient?: string;
  prenomClient?: string;
  contactClient?: string;
  client?: {
    id: number;
    nom: string;
    prenom: string;
    contact: string;
  };
  moyenPaiement?: 'WAVE' | 'ORANGE_MONEY' | 'MTN_MONEY' | 'MOOV_MONEY' | 'AUTRE';
  autreMoyenPaiement?: string;
  vendeur: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
  };
  produits: Array<{
    id: number;
    nom: string;
    prix: number;
    quantite: number;
  }>;
}

export interface CreateVenteDto {
  total: number;
  totalPaye: number;
  commentaire?: string;
  nomClient?: string;
  prenomClient?: string;
  contactClient?: string;
  clientId?: number;
  moyenPaiement?: 'WAVE' | 'ORANGE_MONEY' | 'MTN_MONEY' | 'MOOV_MONEY' | 'AUTRE';
  autreMoyenPaiement?: string;
  produits: Array<{
    produitId: number;
    quantite: number;
    prix: number;
  }>;
}

export interface VentesStats {
  ventesAujourdhui: number;
  ventesCeMois: number;
  ventesTotal: number;
  nombreCommandes: number;
  tauxConversion: number;
  moyennePanier: number;
}

// API des ventes
export const ventesApi = {
  // Récupérer toutes les ventes
  getVentes: async (): Promise<Vente[]> => {
    const response = await axiosClient.get('/ventes');
    return response.data;
  },

  // Récupérer une vente par ID
  getVente: async (id: number): Promise<Vente> => {
    const response = await axiosClient.get(`/ventes/${id}`);
    return response.data;
  },

  // Créer une nouvelle vente
  createVente: async (vente: CreateVenteDto): Promise<Vente> => {
    const response = await axiosClient.post('/ventes', vente);
    return response.data;
  },

  // Récupérer les ventes entre deux dates
  getVentesBetween: async (start: number, end: number): Promise<Vente[]> => {
    const response = await axiosClient.get(`/ventes/between?start=${start}&end=${end}`);
    return response.data;
  },

  // Récupérer les statistiques des ventes (fictives pour l'instant)
  getVentesStats: async (): Promise<VentesStats> => {
    // En attendant l'implémentation côté backend, on calcule à partir des ventes
    const ventes = await ventesApi.getVentes();
    const aujourdhui = new Date();
    const debutMois = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), 1);
    
    const ventesAujourdhui = ventes.filter(v => 
      new Date(v.dateVente).toDateString() === aujourdhui.toDateString()
    ).reduce((sum, v) => sum + v.total, 0);
    
    const ventesCeMois = ventes.filter(v => 
      new Date(v.dateVente) >= debutMois
    ).reduce((sum, v) => sum + v.total, 0);
    
    const ventesTotal = ventes.reduce((sum, v) => sum + v.total, 0);
    const nombreCommandes = ventes.length;
    const moyennePanier = nombreCommandes > 0 ? ventesTotal / nombreCommandes : 0;
    
    return {
      ventesAujourdhui,
      ventesCeMois,
      ventesTotal,
      nombreCommandes,
      tauxConversion: 3.2, // Valeur fictive
      moyennePanier
    };
  },
};

export default ventesApi;
