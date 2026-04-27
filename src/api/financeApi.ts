import axiosClient from './axiosClient';

export interface Creance {
  id: string;
  type: 'CLIENT' | 'FOURNISSEUR';
  tiersNom: string;
  tiersId?: string;
  montant: number;
  montantPaye: number;
  montantRestant: number;
  statut: 'EN_COURS' | 'PARTIELLEMENT_PAYEE' | 'PAYEE' | 'EN_RETARD' | 'IRRECOUVRABE';
  dateEcheance?: string;
  creeLe: string;
}

export interface FinanceDashboard {
  totalCreancesClients: number;
  totalDettessFournisseurs: number;
  totalEnRetard: number;
  countCreancesClients: number;
  countDettessFournisseurs: number;
}

class FinanceApi {
  async createCreance(dto: any): Promise<Creance> {
    const r = await axiosClient.post('/finance/creances', dto);
    return r.data;
  }
  async getCreancesClients(): Promise<Creance[]> {
    const r = await axiosClient.get('/finance/creances/clients');
    return r.data;
  }
  async getDettes(): Promise<Creance[]> {
    const r = await axiosClient.get('/finance/creances/fournisseurs');
    return r.data;
  }
  async enregistrerPaiement(id: string, dto: { montantPaye: number; modePaiement?: string; note?: string }): Promise<Creance> {
    const r = await axiosClient.patch(`/finance/creances/${id}/paiement`, dto);
    return r.data;
  }
  async getDashboard(): Promise<FinanceDashboard> {
    const r = await axiosClient.get('/finance/dashboard');
    return r.data;
  }
  async getAlertes(): Promise<any[]> {
    const r = await axiosClient.get('/finance/alertes');
    return r.data;
  }
}

export const financeApi = new FinanceApi();
