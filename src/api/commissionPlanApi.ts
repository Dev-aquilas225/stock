import axiosClient from './axiosClient';

export interface CommissionPlan {
  id: string;
  nom: string;
  description?: string;
  tauxN1: number;
  tauxN2: number;
  tauxN3: number;
  tauxN4: number;
  tauxN5: number;
  actif: boolean;
}

class CommissionPlanApi {
  async getAll(): Promise<CommissionPlan[]> {
    const r = await axiosClient.get('/commissions/plans');
    return r.data;
  }
  async create(dto: any): Promise<CommissionPlan> {
    const r = await axiosClient.post('/commissions/plans', dto);
    return r.data;
  }
  async simuler(id: string, montantVente: number): Promise<any> {
    const r = await axiosClient.post(`/commissions/plans/${id}/simulation`, { montantVente });
    return r.data;
  }
  async update(id: string, dto: any): Promise<CommissionPlan> {
    const r = await axiosClient.patch(`/commissions/plans/${id}`, dto);
    return r.data;
  }
  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/commissions/plans/${id}`);
  }
}

export const commissionPlanApi = new CommissionPlanApi();
