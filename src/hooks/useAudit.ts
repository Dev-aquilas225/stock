// src/hooks/useAudit.ts
import { useState, useCallback, useEffect } from 'react';
import { auditApi, AuditFilters, AuditAction, AuditStats } from '../api/auditApi';
import { useActivity } from '../contexts/ActivityContext';

export interface UseAuditReturn {
  // État
  audits: AuditAction[];
  loading: boolean;
  error: string | null;
  stats: AuditStats | null;
  
  // Actions
  fetchAudits: (filters?: AuditFilters) => Promise<void>;
  fetchStats: () => Promise<void>;
  refreshData: () => Promise<void>;
  exportAudits: (filters?: AuditFilters) => Promise<void>;
  
  // Logging helpers
  logSale: (saleData: any) => Promise<void>;
  logStockChange: (stockData: any) => Promise<void>;
  logProductScan: (productData: any) => Promise<void>;
  logLogin: () => Promise<void>;
  logLogout: () => Promise<void>;
  logPayment: (paymentData: any) => Promise<void>;
  logCashRegister: (action: 'OPEN' | 'CLOSE', data: any) => Promise<void>;
  logModuleAccess: (moduleName: string) => Promise<void>;
  
  // Utilitaires
  clearError: () => void;
}

export const useAudit = (autoFetch: boolean = true): UseAuditReturn => {
  const [audits, setAudits] = useState<AuditAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AuditStats | null>(null);
  
  const { logActivity } = useActivity();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchAudits = useCallback(async (filters?: AuditFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await auditApi.getClientAudits(filters);
      setAudits(data);
      
      // Log l'accès aux données d'audit
      logActivity({
        type: 'view',
        module: 'Audit',
        description: 'Consultation des logs d\'activité',
        metadata: { filters }
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du chargement des audits';
      setError(errorMessage);
      console.error('Erreur fetchAudits:', err);
    } finally {
      setLoading(false);
    }
  }, [logActivity]);

  const fetchStats = useCallback(async () => {
    try {
      const statsData = await auditApi.getAuditStats();
      setStats(statsData);
    } catch (err) {
      console.error('Erreur fetchStats:', err);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await Promise.all([fetchAudits(), fetchStats()]);
  }, [fetchAudits, fetchStats]);

  const exportAudits = useCallback(async (filters?: AuditFilters) => {
    try {
      setLoading(true);
      const exportData = await auditApi.exportAudits(filters);
      
      // Créer et télécharger le fichier CSV
      const csvContent = exportData.data.map((row: any) => 
        Object.values(row).join(',')
      ).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = exportData.filename;
      link.click();
      window.URL.revokeObjectURL(url);
      
      // Log l'export
      logActivity({
        type: 'data_export',
        module: 'Audit',
        description: 'Export des données d\'audit',
        metadata: { 
          filename: exportData.filename,
          recordCount: exportData.data.length,
          filters 
        }
      });
      
      // Log via API
      await auditApi.logDataExport({
        exportType: 'Audit',
        format: 'CSV',
        recordCount: exportData.data.length
      });
      
    } catch (err) {
      const errorMessage = 'Erreur lors de l\'export des audits';
      setError(errorMessage);
      console.error('Erreur exportAudits:', err);
    } finally {
      setLoading(false);
    }
  }, [logActivity]);

  // Helpers pour logger des actions spécifiques
  const logSale = useCallback(async (saleData: {
    amount: number;
    products: any[];
    customerId?: number;
  }) => {
    try {
      await auditApi.logSale(saleData);
      
      // Log local aussi
      logActivity({
        type: 'sale',
        module: 'POS',
        description: `Vente effectuée - Montant: ${saleData.amount}€`,
        metadata: saleData
      });
      
      // Rafraîchir les données
      await refreshData();
    } catch (err) {
      console.error('Erreur logSale:', err);
    }
  }, [logActivity, refreshData]);

  const logStockChange = useCallback(async (stockData: {
    productId: number;
    productName: string;
    quantity: number;
    type: 'IN' | 'OUT' | 'ADJUSTMENT';
    reason?: string;
  }) => {
    try {
      await auditApi.logStockChange(stockData);
      
      const typeMap = {
        'IN': 'stock_in',
        'OUT': 'stock_out',
        'ADJUSTMENT': 'stock_adjustment',
      } as const;
      
      logActivity({
        type: typeMap[stockData.type],
        module: 'Stock',
        description: `${stockData.type === 'IN' ? 'Entrée' : stockData.type === 'OUT' ? 'Sortie' : 'Ajustement'} de stock: ${stockData.productName}`,
        metadata: stockData
      });
      
      await refreshData();
    } catch (err) {
      console.error('Erreur logStockChange:', err);
    }
  }, [logActivity, refreshData]);

  const logProductScan = useCallback(async (productData: {
    productId: number;
    productName: string;
    barcode: string;
  }) => {
    try {
      await auditApi.logProductScan(productData);
      
      logActivity({
        type: 'scan',
        module: 'POS',
        description: `Scan du produit: ${productData.productName}`,
        metadata: productData
      });
      
      await refreshData();
    } catch (err) {
      console.error('Erreur logProductScan:', err);
    }
  }, [logActivity, refreshData]);

  const logLogin = useCallback(async () => {
    try {
      await auditApi.logLogin();
      
      logActivity({
        type: 'login',
        module: 'Auth',
        description: 'Connexion à l\'application'
      });
    } catch (err) {
      console.error('Erreur logLogin:', err);
    }
  }, [logActivity]);

  const logLogout = useCallback(async () => {
    try {
      await auditApi.logLogout();
      
      logActivity({
        type: 'logout',
        module: 'Auth',
        description: 'Déconnexion de l\'application'
      });
    } catch (err) {
      console.error('Erreur logLogout:', err);
    }
  }, [logActivity]);

  const logPayment = useCallback(async (paymentData: {
    amount: number;
    method: string;
    orderId?: number;
    customerId?: number;
  }) => {
    try {
      await auditApi.logPayment(paymentData);
      
      logActivity({
        type: 'payment',
        module: 'POS',
        description: `Paiement effectué - Montant: ${paymentData.amount}€ (${paymentData.method})`,
        metadata: paymentData
      });
      
      await refreshData();
    } catch (err) {
      console.error('Erreur logPayment:', err);
    }
  }, [logActivity, refreshData]);

  const logCashRegister = useCallback(async (action: 'OPEN' | 'CLOSE', data: {
    amount?: number;
    note?: string;
  }) => {
    try {
      await auditApi.logCashRegister(action, data);
      
      logActivity({
        type: action === 'OPEN' ? 'pos_open' : 'pos_close',
        module: 'POS',
        description: `${action === 'OPEN' ? 'Ouverture' : 'Fermeture'} de caisse`,
        metadata: data
      });
      
      await refreshData();
    } catch (err) {
      console.error('Erreur logCashRegister:', err);
    }
  }, [logActivity, refreshData]);

  const logModuleAccess = useCallback(async (moduleName: string) => {
    try {
      await auditApi.logModuleAccess(moduleName);
      
      logActivity({
        type: 'view',
        module: moduleName,
        description: `Accès au module: ${moduleName}`
      });
    } catch (err) {
      console.error('Erreur logModuleAccess:', err);
    }
  }, [logActivity]);

  // Auto-fetch au montage si demandé
  useEffect(() => {
    if (autoFetch) {
      refreshData();
    }
  }, [autoFetch, refreshData]);

  return {
    // État
    audits,
    loading,
    error,
    stats,
    
    // Actions
    fetchAudits,
    fetchStats,
    refreshData,
    exportAudits,
    
    // Logging helpers
    logSale,
    logStockChange,
    logProductScan,
    logLogin,
    logLogout,
    logPayment,
    logCashRegister,
    logModuleAccess,
    
    // Utilitaires
    clearError,
  };
};

export default useAudit;
