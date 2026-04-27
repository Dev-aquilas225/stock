import axiosClient from './axiosClient';

export type TypeMouvement = 'ENTREE' | 'SORTIE' | 'TRANSFERT' | 'AJUSTEMENT' | 'RETOUR';
export type MotifMouvement = 'RECEPTION' | 'VENTE' | 'PERTE' | 'VOL' | 'EXPIRATION' | 'CORRECTION' | 'RETOUR_CLIENT' | 'RETOUR_FOURNISSEUR';

export interface StockMouvement {
  id: string;
  produitStockId: number;
  produitNom: string;
  type: TypeMouvement;
  motif: MotifMouvement;
  quantite: number;
  quantiteAvant: number;
  quantiteApres: number;
  note?: string;
  userId: string;
  creeLe: string;
}

export interface StockMouvementStats {
  totalEntrees: number;
  totalSorties: number;
  totalTransferts: number;
  totalAjustements: number;
  mouvementsParMois: Array<{ mois: string; entrees: number; sorties: number }>;
}

export interface EnregistrerMouvementDto {
  produitStockId: number;
  type: TypeMouvement;
  motif: MotifMouvement;
  quantite: number;
  note?: string;
}

class StockMouvementApi {
  async enregistrer(dto: EnregistrerMouvementDto): Promise<StockMouvement> {
    const r = await axiosClient.post('/stock/mouvements', dto);
    return r.data;
  }

  async getAll(filters?: {
    type?: TypeMouvement;
    produitStockId?: number;
    dateDebut?: string;
    dateFin?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: StockMouvement[]; total: number }> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.produitStockId) params.append('produitStockId', filters.produitStockId.toString());
    if (filters?.dateDebut) params.append('dateDebut', filters.dateDebut);
    if (filters?.dateFin) params.append('dateFin', filters.dateFin);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    const r = await axiosClient.get(`/stock/mouvements?${params.toString()}`);
    return r.data;
  }

  async getStats(): Promise<StockMouvementStats> {
    const r = await axiosClient.get('/stock/mouvements/stats');
    return r.data;
  }
}

export const stockMouvementApi = new StockMouvementApi();
