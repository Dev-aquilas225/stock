// src/components/Audit/AuditLogger.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAudit } from '../../hooks/useAudit';

interface AuditLoggerProps {
  children: React.ReactNode;
}

// Mapping des routes vers les modules
const routeModuleMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/pos': 'POS',
  '/stocks': 'Stock',
  '/ventes': 'Ventes',
  '/products': 'Produits',
  '/suppliers': 'Fournisseurs',
  '/agents': 'Agents',
  '/analytics': 'Analytiques',
  '/invoicing': 'Facturation',
  '/payments': 'Paiements',
  '/commissions': 'Commissions',
  '/returns': 'Retours',
  '/support': 'Support',
  '/profile': 'Profil',
  '/notifications': 'Notifications',
  '/activity': 'Activité',
};

/**
 * Composant pour logger automatiquement les accès aux pages
 */
export const AuditLogger: React.FC<AuditLoggerProps> = ({ children }) => {
  const location = useLocation();
  const { logModuleAccess } = useAudit(false);

  useEffect(() => {
    const currentPath = location.pathname;
    const moduleName = routeModuleMap[currentPath] || 'Unknown';
    
    // Ne pas logger l'accès à la page d'activité elle-même pour éviter les boucles
    if (currentPath !== '/activity') {
      logModuleAccess(moduleName);
    }
  }, [location.pathname, logModuleAccess]);

  return <>{children}</>;
};

export default AuditLogger;
