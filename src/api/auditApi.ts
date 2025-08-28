// src/api/auditApi.ts
import axiosClient from './axiosClient';

export interface AuditFilters {
  startDate?: string;
  endDate?: string;
  actionType?: string;
  userId?: number;
  clientId?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AuditAction {
  id: number;
  user: {
    id: number;
    prenom: string;
    nom: string;
    email: string;
  };
  clientOrigine?: {
    id: number;
    entreprise: string;
  };
  typeAction: string;
  description: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  module?: string;
  isSystemAction: boolean;
  dateAction: string;
}

export interface AuditStats {
  totalActions: number;
  todayActions: number;
  topActions: { type: string; count: number }[];
  userStats: { userId: number; username: string; actionCount: number }[];
}

export interface AuditResponse {
  data: AuditAction[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ActionType {
  key: string;
  label: string;
}

class AuditApi {
  // Récupérer les audits du client connecté
  async getClientAudits(filters?: AuditFilters): Promise<AuditAction[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      const response = await axiosClient.get(`/audit/client?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Erreur getClientAudits:', error);
      throw new Error(`Erreur lors de la récupération des audits: ${error.response?.data?.message || error.message}`);
    }
  }

  // Récupérer tous les audits (admin uniquement)
  async getAllAudits(filters?: AuditFilters): Promise<AuditResponse> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await axiosClient.get(`/audit/all?${params.toString()}`);
    return response.data;
  }

  // Récupérer les statistiques d'audit
  async getAuditStats(clientId?: number): Promise<AuditStats> {
    const params = new URLSearchParams();
    if (clientId) {
      params.append('clientId', clientId.toString());
    }

    const response = await axiosClient.get(`/audit/stats?${params.toString()}`);
    return response.data;
  }

  // Récupérer la liste des types d'actions disponibles
  async getActionTypes(): Promise<ActionType[]> {
    const response = await axiosClient.get('/audit/actions');
    return response.data.actions;
  }

  // Logger une action personnalisée
  async logCustomAction(actionData: {
    action: string;
    description: string;
    targetUserId?: number;
    metadata?: any;
  }): Promise<AuditAction> {
    const response = await axiosClient.post('/audit/log', actionData);
    return response.data;
  }

  // Exporter les audits
  async exportAudits(filters?: AuditFilters): Promise<{
    data: any[];
    filename: string;
  }> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await axiosClient.get(`/audit/export?${params.toString()}`);
    return response.data;
  }

  // Méthodes utilitaires pour logger des actions spécifiques

  // Logger une connexion
  async logLogin(): Promise<void> {
    try {
      await this.logCustomAction({
        action: 'CONNEXION',
        description: 'Connexion à l\'application',
        metadata: {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        }
      });
    } catch (error) {
      console.warn('Erreur lors du logging de la connexion:', error);
    }
  }

  // Logger une déconnexion
  async logLogout(): Promise<void> {
    try {
      await this.logCustomAction({
        action: 'DECONNEXION',
        description: 'Déconnexion de l\'application',
        metadata: {
          timestamp: new Date().toISOString(),
        }
      });
    } catch (error) {
      console.warn('Erreur lors du logging de la déconnexion:', error);
    }
  }

  // Logger une vente
  async logSale(saleData: {
    amount: number;
    products: any[];
    customerId?: number;
  }): Promise<void> {
    try {
      await this.logCustomAction({
        action: 'VENTE',
        description: `Vente effectuée - Montant: ${saleData.amount}€`,
        metadata: {
          ...saleData,
          timestamp: new Date().toISOString(),
        }
      });
    } catch (error) {
      console.warn('Erreur lors du logging de la vente:', error);
    }
  }

  // Logger une modification de stock
  async logStockChange(stockData: {
    productId: number;
    productName: string;
    quantity: number;
    type: 'IN' | 'OUT' | 'ADJUSTMENT';
    reason?: string;
  }): Promise<void> {
    try {
      const actionMap = {
        'IN': 'ENTREE_STOCK',
        'OUT': 'SORTIE_STOCK',
        'ADJUSTMENT': 'AJUSTEMENT_STOCK',
      };

      const descriptionMap = {
        'IN': 'Entrée en stock',
        'OUT': 'Sortie de stock',
        'ADJUSTMENT': 'Ajustement de stock',
      };

      await this.logCustomAction({
        action: actionMap[stockData.type],
        description: `${descriptionMap[stockData.type]}: ${stockData.productName} (Quantité: ${stockData.quantity})`,
        metadata: {
          ...stockData,
          timestamp: new Date().toISOString(),
        }
      });
    } catch (error) {
      console.warn('Erreur lors du logging du changement de stock:', error);
    }
  }

  // Logger un scan de produit
  async logProductScan(productData: {
    productId: number;
    productName: string;
    barcode: string;
  }): Promise<void> {
    try {
      await this.logCustomAction({
        action: 'SCAN_PRODUIT',
        description: `Scan du produit: ${productData.productName}`,
        metadata: {
          ...productData,
          timestamp: new Date().toISOString(),
        }
      });
    } catch (error) {
      console.warn('Erreur lors du logging du scan:', error);
    }
  }

  // Logger une création de produit
  async logProductCreation(productData: {
    productId: number;
    productName: string;
    category?: string;
  }): Promise<void> {
    try {
      await this.logCustomAction({
        action: 'CREATION_PRODUIT',
        description: `Création du produit: ${productData.productName}`,
        metadata: {
          ...productData,
          timestamp: new Date().toISOString(),
        }
      });
    } catch (error) {
      console.warn('Erreur lors du logging de création de produit:', error);
    }
  }

  // Logger un paiement
  async logPayment(paymentData: {
    amount: number;
    method: string;
    orderId?: number;
    customerId?: number;
  }): Promise<void> {
    try {
      await this.logCustomAction({
        action: 'PAIEMENT',
        description: `Paiement effectué - Montant: ${paymentData.amount}€ (${paymentData.method})`,
        metadata: {
          ...paymentData,
          timestamp: new Date().toISOString(),
        }
      });
    } catch (error) {
      console.warn('Erreur lors du logging du paiement:', error);
    }
  }

  // Logger une ouverture/fermeture de caisse
  async logCashRegister(action: 'OPEN' | 'CLOSE', data: {
    amount?: number;
    note?: string;
  }): Promise<void> {
    try {
      const actionMap = {
        'OPEN': 'OUVERTURE_CAISSE',
        'CLOSE': 'FERMETURE_CAISSE',
      };

      const descriptionMap = {
        'OPEN': 'Ouverture de caisse',
        'CLOSE': 'Fermeture de caisse',
      };

      await this.logCustomAction({
        action: actionMap[action],
        description: `${descriptionMap[action]}${data.amount ? ` - Montant: ${data.amount}€` : ''}`,
        metadata: {
          ...data,
          timestamp: new Date().toISOString(),
        }
      });
    } catch (error) {
      console.warn('Erreur lors du logging de la caisse:', error);
    }
  }

  // Logger un accès à un module
  async logModuleAccess(moduleName: string): Promise<void> {
    try {
      await this.logCustomAction({
        action: 'CONSULTATION_PRODUIT',
        description: `Accès au module: ${moduleName}`,
        metadata: {
          module: moduleName,
          timestamp: new Date().toISOString(),
        }
      });
    } catch (error) {
      console.warn('Erreur lors du logging d\'accès au module:', error);
    }
  }

  // Logger une génération de rapport
  async logReportGeneration(reportData: {
    reportType: string;
    dateRange?: {
      startDate: string;
      endDate: string;
    };
    filters?: any;
  }): Promise<void> {
    try {
      await this.logCustomAction({
        action: 'GENERATION_RAPPORT',
        description: `Génération du rapport: ${reportData.reportType}`,
        metadata: {
          ...reportData,
          timestamp: new Date().toISOString(),
        }
      });
    } catch (error) {
      console.warn('Erreur lors du logging de génération de rapport:', error);
    }
  }

  // Logger un export de données
  async logDataExport(exportData: {
    exportType: string;
    format: string;
    recordCount?: number;
  }): Promise<void> {
    try {
      await this.logCustomAction({
        action: 'EXPORT_DONNEES',
        description: `Export de données: ${exportData.exportType} (${exportData.format})`,
        metadata: {
          ...exportData,
          timestamp: new Date().toISOString(),
        }
      });
    } catch (error) {
      console.warn('Erreur lors du logging d\'export:', error);
    }
  }
}

export const auditApi = new AuditApi();
export default auditApi;
