// src/examples/AuditUsageExample.tsx
import React from 'react';
import { useAudit } from '../hooks/useAudit';
import { ActivityWidget } from '../components/Audit';
import Button from '../components/UI/Button';

/**
 * Exemple d'utilisation du système d'audit
 * Ce composant montre comment intégrer le logging d'audit dans votre application
 */
export const AuditUsageExample: React.FC = () => {
  const {
    logSale,
    logStockChange,
    logProductScan,
    logPayment,
    logCashRegister,
    logModuleAccess,
    stats,
    loading
  } = useAudit();

  // Exemple de logging d'une vente
  const handleSaleExample = async () => {
    await logSale({
      amount: 125.50,
      products: [
        { id: 1, name: 'Produit A', price: 75.00, quantity: 1 },
        { id: 2, name: 'Produit B', price: 50.50, quantity: 1 }
      ],
      customerId: 123
    });
  };

  // Exemple de logging d'un changement de stock
  const handleStockChangeExample = async () => {
    await logStockChange({
      productId: 1,
      productName: 'Produit A',
      quantity: 10,
      type: 'IN',
      reason: 'Réapprovisionnement'
    });
  };

  // Exemple de logging d'un scan
  const handleScanExample = async () => {
    await logProductScan({
      productId: 1,
      productName: 'Produit A',
      barcode: '1234567890123'
    });
  };

  // Exemple de logging d'un paiement
  const handlePaymentExample = async () => {
    await logPayment({
      amount: 125.50,
      method: 'Carte bancaire',
      orderId: 1001,
      customerId: 123
    });
  };

  // Exemple de logging d'ouverture de caisse
  const handleCashOpenExample = async () => {
    await logCashRegister('OPEN', {
      amount: 200.00,
      note: 'Ouverture avec fond de caisse'
    });
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Exemples d'utilisation du système d'audit</h2>
        <p className="text-gray-600 mb-6">
          Cette page démontre comment utiliser les différentes fonctions de logging d'audit dans votre application.
        </p>
      </div>

      {/* Widget d'activité */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Widget d'activité</h3>
        <div className="max-w-md">
          <ActivityWidget />
        </div>
      </div>

      {/* Boutons d'exemple */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Actions d'exemple</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Button onClick={handleSaleExample} disabled={loading}>
            Logger une vente
          </Button>
          
          <Button onClick={handleStockChangeExample} disabled={loading}>
            Logger un changement de stock
          </Button>
          
          <Button onClick={handleScanExample} disabled={loading}>
            Logger un scan
          </Button>
          
          <Button onClick={handlePaymentExample} disabled={loading}>
            Logger un paiement
          </Button>
          
          <Button onClick={handleCashOpenExample} disabled={loading}>
            Logger ouverture caisse
          </Button>
          
          <Button onClick={() => logModuleAccess('Dashboard')} disabled={loading}>
            Logger accès module
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      {stats && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Statistiques</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Total des activités:</p>
                <p className="text-2xl text-blue-600">{stats.totalActivities}</p>
              </div>
              <div>
                <p className="font-semibold">Activités d'aujourd'hui:</p>
                <p className="text-2xl text-green-600">{stats.todayActivities}</p>
              </div>
            </div>
            
            {stats.topActivities.length > 0 && (
              <div className="mt-4">
                <p className="font-semibold mb-2">Top des actions:</p>
                <ul className="space-y-1">
                  {stats.topActivities.slice(0, 5).map((action, index) => (
                    <li key={action.type} className="flex justify-between">
                      <span>{action.type}</span>
                      <span className="font-mono">{action.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Code d'exemple */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Exemple de code</h3>
        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`// Dans un composant de vente
import { useAudit } from '../hooks/useAudit';

const SalesComponent = () => {
  const { logSale } = useAudit();
  
  const handleSale = async (saleData) => {
    // Effectuer la vente
    const result = await saleApi.createSale(saleData);
    
    // Logger l'action
    await logSale({
      amount: result.total,
      products: result.items,
      customerId: result.customerId
    });
  };
  
  return (
    <button onClick={() => handleSale(data)}>
      Effectuer la vente
    </button>
  );
};

// Dans App.tsx pour logger les accès aux pages
import { AuditLogger } from './components/Audit';

function App() {
  return (
    <AuditLogger>
      <Router>
        <Routes>
          {/* Vos routes */}
        </Routes>
      </Router>
    </AuditLogger>
  );
}`}
        </pre>
      </div>
    </div>
  );
};

export default AuditUsageExample;
