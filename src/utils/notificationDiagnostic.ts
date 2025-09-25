// Fichier de diagnostic pour tester les notifications
// À placer dans : src/utils/notificationDiagnostic.ts

import { notificationApi } from '../api/notificationApi';
import axiosClient from '../api/axiosClient';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export class NotificationDiagnostic {
  private results: DiagnosticResult[] = [];

  async runDiagnostics(): Promise<DiagnosticResult[]> {
    this.results = [];
    
    console.log('🔍 Démarrage du diagnostic des notifications...');

    // Test 1: Vérifier la configuration de base
    await this.testBaseConfiguration();
    
    // Test 2: Vérifier l'authentification
    await this.testAuthentication();
    
    // Test 3: Tester la connectivité de l'API
    await this.testApiConnectivity();
    
    // Test 4: Tester les endpoints de notification
    await this.testNotificationEndpoints();
    
    // Test 5: Tester la récupération des notifications
    await this.testNotificationFetching();
    
    // Test 6: Tester la création d'une notification
    await this.testNotificationCreation();

    console.log('✅ Diagnostic terminé:', this.results);
    return this.results;
  }

  private async testBaseConfiguration(): Promise<void> {
    try {
      const baseURL = axiosClient.defaults.baseURL;
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('nexsaas_user');

      this.addResult({
        test: 'Configuration de base',
        status: 'success',
        message: `Base URL: ${baseURL}, Token: ${token ? 'Présent' : 'Absent'}, User: ${user ? 'Présent' : 'Absent'}`,
        details: { baseURL, hasToken: !!token, hasUser: !!user }
      });
    } catch (error) {
      this.addResult({
        test: 'Configuration de base',
        status: 'error',
        message: 'Erreur lors de la vérification de la configuration',
        details: error
      });
    }
  }

  private async testAuthentication(): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        this.addResult({
          test: 'Authentification',
          status: 'error',
          message: 'Token d\'authentification manquant',
        });
        return;
      }

      // Tester si le token est valide en faisant un appel simple
      const response = await axiosClient.get('/auth/profile');
      this.addResult({
        test: 'Authentification',
        status: 'success',
        message: 'Token valide et utilisateur authentifié',
        details: { userId: response.data?.id, email: response.data?.email }
      });
    } catch (error: any) {
      this.addResult({
        test: 'Authentification',
        status: 'error',
        message: `Erreur d'authentification: ${error.response?.status} - ${error.message}`,
        details: error.response?.data
      });
    }
  }

  private async testApiConnectivity(): Promise<void> {
    try {
      // Test simple de connectivité
      const response = await axiosClient.get('/health');
      this.addResult({
        test: 'Connectivité API',
        status: 'success',
        message: 'API accessible',
        details: response.data
      });
    } catch (error: any) {
      // Si /health n'existe pas, essayer une autre route
      try {
        await axiosClient.get('/');
        this.addResult({
          test: 'Connectivité API',
          status: 'warning',
          message: 'API accessible mais endpoint /health manquant',
        });
      } catch (secondError: any) {
        this.addResult({
          test: 'Connectivité API',
          status: 'error',
          message: `Impossible de contacter l'API: ${secondError.message}`,
          details: { 
            status: secondError.response?.status,
            baseURL: axiosClient.defaults.baseURL,
            error: secondError.response?.data
          }
        });
      }
    }
  }

  private async testNotificationEndpoints(): Promise<void> {
    const endpoints = [
      { path: '/notifications', method: 'GET', name: 'Liste des notifications' },
      { path: '/notifications/unread-count', method: 'GET', name: 'Compteur non lues' },
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axiosClient[endpoint.method.toLowerCase() as 'get']  (endpoint.path);
        this.addResult({
          test: `Endpoint ${endpoint.name}`,
          status: 'success',
          message: `${endpoint.method} ${endpoint.path} accessible`,
          details: { 
            status: response.status, 
            dataType: typeof response.data,
            sampleData: endpoint.path === '/notifications' ? {
              total: response.data?.total,
              unreadCount: response.data?.unreadCount,
              dataLength: response.data?.data?.length
            } : response.data
          }
        });
      } catch (error: any) {
        this.addResult({
          test: `Endpoint ${endpoint.name}`,
          status: 'error',
          message: `${endpoint.method} ${endpoint.path} - ${error.response?.status}: ${error.message}`,
          details: error.response?.data
        });
      }
    }
  }

  private async testNotificationFetching(): Promise<void> {
    try {
      const result = await notificationApi.getNotifications({ limit: 5 });
      
      this.addResult({
        test: 'Récupération notifications',
        status: 'success',
        message: `${result.data.length} notifications récupérées sur ${result.total} total`,
        details: {
          total: result.total,
          unreadCount: result.unreadCount,
          notifications: result.data.map(n => ({
            id: n.id,
            type: n.type,
            title: n.title,
            isRead: n.isRead,
            createdAt: n.createdAt
          }))
        }
      });

      // Test du compteur séparément
      const unreadCount = await notificationApi.getUnreadCount();
      this.addResult({
        test: 'Compteur non lues',
        status: unreadCount === result.unreadCount ? 'success' : 'warning',
        message: `Compteur: ${unreadCount} (${unreadCount === result.unreadCount ? 'cohérent' : 'incohérent avec la liste'})`,
        details: { unreadCount, expectedCount: result.unreadCount }
      });

    } catch (error: any) {
      this.addResult({
        test: 'Récupération notifications',
        status: 'error',
        message: `Erreur lors de la récupération: ${error.message}`,
        details: error.response?.data
      });
    }
  }

  private async testNotificationCreation(): Promise<void> {
    try {
      const testNotification = {
        type: 'info' as const,
        title: 'Test de diagnostic',
        message: 'Notification créée lors du diagnostic système',
        module: 'Système',
      };

      const created = await notificationApi.createNotification(testNotification);
      
      this.addResult({
        test: 'Création notification',
        status: 'success',
        message: 'Notification de test créée avec succès',
        details: { 
          id: created.id, 
          title: created.title,
          createdAt: created.createdAt
        }
      });

      // Nettoyer la notification de test
      try {
        await notificationApi.deleteNotification(created.id);
        this.addResult({
          test: 'Nettoyage test',
          status: 'success',
          message: 'Notification de test supprimée',
        });
      } catch (deleteError) {
        this.addResult({
          test: 'Nettoyage test',
          status: 'warning',
          message: 'Impossible de supprimer la notification de test',
        });
      }

    } catch (error: any) {
      this.addResult({
        test: 'Création notification',
        status: 'error',
        message: `Erreur lors de la création: ${error.message}`,
        details: error.response?.data
      });
    }
  }

  private addResult(result: DiagnosticResult): void {
    this.results.push(result);
    const emoji = result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`${emoji} ${result.test}: ${result.message}`);
    if (result.details) {
      console.log('   Details:', result.details);
    }
  }

  // Méthode pour afficher un rapport formaté
  getReport(): string {
    let report = '\n📊 RAPPORT DE DIAGNOSTIC DES NOTIFICATIONS\n';
    report += '='  .repeat(50) + '\n\n';

    const successes = this.results.filter(r => r.status === 'success');
    const warnings = this.results.filter(r => r.status === 'warning');
    const errors = this.results.filter(r => r.status === 'error');

    report += `✅ Succès: ${successes.length}\n`;
    report += `⚠️  Avertissements: ${warnings.length}\n`;
    report += `❌ Erreurs: ${errors.length}\n\n`;

    if (errors.length > 0) {
      report += '🔥 ERREURS CRITIQUES:\n';
      errors.forEach(error => {
        report += `  • ${error.test}: ${error.message}\n`;
      });
      report += '\n';
    }

    if (warnings.length > 0) {
      report += '⚠️  AVERTISSEMENTS:\n';
      warnings.forEach(warning => {
        report += `  • ${warning.test}: ${warning.message}\n`;
      });
      report += '\n';
    }

    report += '💡 RECOMMANDATIONS:\n';
    
    if (errors.length > 0) {
      report += '  1. Vérifiez que votre backend est démarré sur le port 8000\n';
      report += '  2. Vérifiez la configuration du proxy Vite\n';
      report += '  3. Assurez-vous que les endpoints de notification existent\n';
    }
    
    if (warnings.length > 0 || errors.length > 0) {
      report += '  4. Vérifiez les logs du backend pour plus de détails\n';
    }
    
    if (successes.length === this.results.length) {
      report += '  🎉 Tout semble fonctionner correctement!\n';
    }

    return report;
  }
}

// Fonction utilitaire pour exécuter le diagnostic depuis la console
export const runNotificationDiagnostic = async (): Promise<void> => {
  const diagnostic = new NotificationDiagnostic();
  const results = await diagnostic.runDiagnostics();
  console.log(diagnostic.getReport());
  return results;
};