import axiosClient from './axiosClient';

export interface Livraison {
  id: string;
  commandeId: string;
  clientNom: string;
  clientTel: string;
  adresseLivraison: string;
  statut: 'EN_ATTENTE' | 'EN_COURS' | 'LIVRE' | 'ECHOUE' | 'RETOUR_DEMANDE' | 'RETOURNE' | 'REMBOURSE';
  livreurNom?: string;
  dateEstimee?: string;
  dateLivraison?: string;
  signatureUrl?: string;
  photoUrl?: string;
  montantRemboursement: number;
  creeLe: string;
}

class LivraisonApi {
  async getAll(filters?: { statut?: string; search?: string }): Promise<{ data: Livraison[]; total: number }> {
    const params = new URLSearchParams();
    if (filters?.statut) params.append('statut', filters.statut);
    if (filters?.search) params.append('search', filters.search);
    const r = await axiosClient.get(`/livraisons?${params.toString()}`);
    return r.data;
  }
  async getStats(): Promise<any> {
    const r = await axiosClient.get('/livraisons/stats');
    return r.data;
  }
  async create(dto: any): Promise<Livraison> {
    const r = await axiosClient.post('/livraisons', dto);
    return r.data;
  }
  async marquerLivre(commandeId: string): Promise<any> {
    const r = await axiosClient.patch(`/commandes/${commandeId}/livrer`);
    return r.data;
  }
  async demanderRetour(dto: { commandeId: string; motifRetour: string; montantRemboursement?: number }): Promise<any> {
    const r = await axiosClient.post('/retours', dto);
    return r.data;
  }
}

export const livraisonApi = new LivraisonApi();
