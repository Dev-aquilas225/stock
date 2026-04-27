import axiosClient from './axiosClient';

export type TypeEmplacement = 'ZONE' | 'RAYON' | 'ETAGERE' | 'BOX';

export interface Emplacement {
  id: string;
  nom: string;
  code: string;
  type: TypeEmplacement;
  capaciteMax: number;
  capaciteActuelle: number;
  parentId?: string;
  actif: boolean;
  creeLe: string;
}

export interface CreateEmplacementDto {
  nom: string;
  code: string;
  type: TypeEmplacement;
  capaciteMax: number;
  parentId?: string;
}

class EmplacementApi {
  async getAll(): Promise<Emplacement[]> {
    const r = await axiosClient.get('/emplacements');
    return r.data;
  }

  async create(dto: CreateEmplacementDto): Promise<Emplacement> {
    const r = await axiosClient.post('/emplacements', dto);
    return r.data;
  }

  async update(id: string, dto: Partial<CreateEmplacementDto>): Promise<Emplacement> {
    const r = await axiosClient.patch(`/emplacements/${id}`, dto);
    return r.data;
  }

  async delete(id: string): Promise<void> {
    await axiosClient.delete(`/emplacements/${id}`);
  }

  async affecter(produitStockId: number, emplacementId: string, quantite: number): Promise<any> {
    const r = await axiosClient.post('/emplacements/affecter', { produitStockId, emplacementId, quantite });
    return r.data;
  }
}

export const emplacementApi = new EmplacementApi();
