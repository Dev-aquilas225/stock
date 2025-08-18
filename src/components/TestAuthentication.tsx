// Test simple pour vérifier l'authentification et les appels API
import React, { useEffect } from 'react';
import { documentService } from '../api/documentApi';

const TestAuthentication: React.FC = () => {
  useEffect(() => {
    const testAuth = async () => {
      console.log('=== TEST AUTHENTIFICATION ===');
      
      // Vérifier le token dans localStorage
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('nexsaas_user');
      
      console.log('Token:', token ? 'Présent' : 'Absent');
      console.log('User:', user ? JSON.parse(user) : 'Absent');
      
      if (token) {
        console.log('Token value:', token);
        
        try {
          console.log('Test appel API getUserDocuments...');
          const response = await documentService.getUserDocuments();
          console.log('Réponse getUserDocuments:', response);
        } catch (error) {
          console.error('Erreur getUserDocuments:', error);
        }
        
        try {
          console.log('Test appel API getDocumentStats...');
          const stats = await documentService.getDocumentStats();
          console.log('Statistiques:', stats);
        } catch (error) {
          console.error('Erreur getDocumentStats:', error);
        }
      } else {
        console.log('Aucun token trouvé - utilisateur non connecté');
      }
    };
    
    testAuth();
  }, []);

  return (
    <div className="p-4">
      <h2>Test Authentification</h2>
      <p>Vérifiez la console pour voir les résultats des tests</p>
    </div>
  );
};

export default TestAuthentication;