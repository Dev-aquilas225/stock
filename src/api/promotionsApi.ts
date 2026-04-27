import axiosClient from './axiosClient';

export interface Promotion {
  id: string;
  nom: string;
  code: string;
  type: 'POURCENTAGE' | 'MONTANT_FIXE' | 'LIVRAISON_GRATUITE';
  valeur: number;
  minAchat: number;
  maxUsages?: number;
  usagesActuels: number;
  dateDebut: string;
  dateFin: string;
  actif: boolean;
  statut: 'ACTIVE' | 'INACTIVE' | 'EXPIREE';
}

export interface Challenge {
  id: string;
  titre: string;
  description?: string;
  type: 'VENTES_MONTANT' | 'VENTES_NOMBRE' | 'RECRUTEMENT' | 'COMMISSIONS';
  statut: 'A_VENIR' | 'EN_COURS' | 'TERMINE' | 'ANNULE';
  objectif: number;
  recompense: number;
  dateDebut?: string;
  dateFin?: string;
  creeLe: string;
}

class PromotionsApi {
  async getAll(): Promise<{ data: Promotion[]; total: number }> {
    const r = await axiosClient.get('/promotions');
    return r.data;
  }
  async getStats(): Promise<any> {
    const r = await axiosClient.get('/promotions/stats');
    return r.data;
  }
  async create(dto: any): Promise<Promotion> {
    const r = await axiosClient.post('/promotions', dto);
    return r.data;
  }
  async toggle(id: string): Promise<Promotion> {
    const r = await axiosClient.patch(`/promotions/${id}/toggle`);
    return r.data;
  }
  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/promotions/${id}`);
  }
  async validerCode(code: string, montant: number): Promise<any> {
    const r = await axiosClient.post('/promotions/code/valider', { code, montantAchat: montant });
    return r.data;
  }
}

class ChallengeApi {
  async getAll(): Promise<Challenge[]> {
    const r = await axiosClient.get('/challenges');
    return r.data;
  }
  async create(dto: any): Promise<Challenge> {
    const r = await axiosClient.post('/challenges', dto);
    return r.data;
  }
  async update(id: string, dto: any): Promise<Challenge> {
    const r = await axiosClient.patch(`/challenges/${id}`, dto);
    return r.data;
  }
  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/challenges/${id}`);
  }
}

export const promotionsApi = new PromotionsApi();
export const challengeApi = new ChallengeApi();
