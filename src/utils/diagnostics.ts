// src/utils/diagnostics.ts
import axiosClient from '../api/axiosClient';

export class ApiDiagnostics {
  static async testConnection(): Promise<{
    status: 'success' | 'error';
    message: string;
    details?: any;
  }> {
    try {
      // Test simple de l'endpoint racine de l'API
      const response = await axiosClient.get('/');
      return {
        status: 'success',
        message: 'Connexion API réussie',
        details: {
          baseURL: axiosClient.defaults.baseURL,
          status: response.status
        }
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: 'Erreur de connexion à l\'API',
        details: {
          baseURL: axiosClient.defaults.baseURL,
          error: error.message,
          code: error.code,
          response: error.response?.data
        }
      };
    }
  }

  static async testAuditEndpoints(): Promise<{
    endpoints: { [key: string]: { status: 'success' | 'error'; message: string } };
  }> {
    const endpoints = {
      '/audit/client': null,
      '/audit/stats': null,
      '/audit/actions': null
    };

    for (const endpoint of Object.keys(endpoints)) {
      try {
        const response = await axiosClient.get(endpoint);
        endpoints[endpoint] = {
          status: 'success',
          message: `Endpoint accessible (${response.status})`
        };
      } catch (error: any) {
        endpoints[endpoint] = {
          status: 'error',
          message: `Erreur: ${error.response?.status || error.message}`
        };
      }
    }

    return { endpoints };
  }

  static logSystemInfo() {
    console.group('🔍 Diagnostic Système');
    console.log('Base URL API:', axiosClient.defaults.baseURL);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('User Agent:', navigator.userAgent);
    console.log('Token présent:', !!localStorage.getItem('token'));
    console.log('User data:', localStorage.getItem('nexsaas_user'));
    console.groupEnd();
  }

  static async runFullDiagnostic() {
    console.group('🚀 Diagnostic Complet');
    
    this.logSystemInfo();
    
    console.log('\n📡 Test de connexion API...');
    const connectionTest = await this.testConnection();
    console.log(connectionTest);
    
    if (connectionTest.status === 'success') {
      console.log('\n🎯 Test des endpoints Audit...');
      const endpointTests = await this.testAuditEndpoints();
      console.log(endpointTests);
    }
    
    console.groupEnd();
  }
}
