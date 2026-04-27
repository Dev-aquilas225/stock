import axiosClient from './axiosClient';

class ReportingApi {
  async getDashboard(): Promise<any> {
    const r = await axiosClient.get('/reporting/dashboard');
    return r.data;
  }
  async getKpis(): Promise<any> {
    const r = await axiosClient.get('/reporting/kpis/critique');
    return r.data;
  }
  async getAnalyseVentes(periode?: string): Promise<any> {
    const params = periode ? `?periode=${periode}` : '';
    const r = await axiosClient.get(`/reporting/ventes/analyse${params}`);
    return r.data;
  }
  async getEtatFinancier(): Promise<any> {
    const r = await axiosClient.get('/reporting/financier/etat');
    return r.data;
  }
  async getPerformanceNiveaux(): Promise<any> {
    const r = await axiosClient.get('/reporting/performance/niveaux');
    return r.data;
  }
}

export const reportingApi = new ReportingApi();
