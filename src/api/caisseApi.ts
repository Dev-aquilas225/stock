import axiosClient from './axiosClient';

export interface SessionCaisse {
  id: string;
  caissierUserId: string;
  statut: 'OUVERTE' | 'FERMEE';
  fondOuverture: number;
  fondFermeture: number;
  totalEncaissements: number;
  totalDecaissements: number;
  ecart: number;
  noteOuverture?: string;
  noteFermeture?: string;
  ouvertureLe: string;
  fermetureLe?: string;
}

export interface OuvrirCaisseDto {
  fondOuverture: number;
  noteOuverture?: string;
}

export interface FermerCaisseDto {
  fondFermeture: number;
  noteFermeture?: string;
}

class CaisseApi {
  async ouvrir(dto: OuvrirCaisseDto): Promise<SessionCaisse> {
    const r = await axiosClient.post('/caisse/ouverture', dto);
    return r.data;
  }
  async fermer(id: string, dto: FermerCaisseDto): Promise<SessionCaisse> {
    const r = await axiosClient.post(`/caisse/fermeture/${id}`, dto);
    return r.data;
  }
  async getActive(): Promise<SessionCaisse | null> {
    try { const r = await axiosClient.get('/caisse/active'); return r.data; }
    catch { return null; }
  }
  async getAll(): Promise<SessionCaisse[]> {
    const r = await axiosClient.get('/caisse');
    return r.data;
  }
  async getStats(): Promise<any> {
    const r = await axiosClient.get('/caisse/stats');
    return r.data;
  }
}

export const caisseApi = new CaisseApi();
