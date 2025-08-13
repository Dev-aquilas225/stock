// / hooks/useDocuments.ts - Hook personnalisé pour la gestion des documents
import { useState, useEffect, useCallback } from 'react';
import { documentService } from '../api/documentService';
import { Document, DocumentStatus, UploadProgress } from '../types/document.type';
import { useToast } from '../components/Toast/ToastProvider';

/**
 * Retourne le nom lisible d'un type de document.
 */
function getDocumentName(type: string): string {
  switch (type.toLowerCase()) {
    case 'cin': return 'Carte d\'Identité Nationale';
    case 'passport': return 'Passeport';
    case 'justificatif_domicile': return 'Justificatif de domicile';
    // Ajoutez d'autres types selon vos besoins
    default: return type;
  }
}

function getDocumentDescription(type: string): string {
  const descriptions: Record<string, string> = {
    'CNI': 'Recto et verso de votre carte d\'identité',
    'RCCM': 'Document d\'enregistrement de votre entreprise',
    'DFE': 'Document fiscal d\'existence'
  };
  return descriptions[type] || '';
}

function mapApiStatusToLocal(apiStatus: string): DocumentStatus {
  const statusMapping: Record<string, DocumentStatus> = {
    'EN_ATTENTE': 'pending',
    'VALIDE': 'validated',
    'REFUSE': 'rejected',
    'EXPIRE': 'expired'
  };
  return statusMapping[apiStatus] || 'missing';
}

/**
 * Retourne l'icône associée à un type de document.
 */
function getDocumentIcon(type: string): string {
  switch (type.toLowerCase()) {
    case 'cin': return 'id-card';
    case 'passport': return 'passport';
    case 'justificatif_domicile': return 'home';
    // Ajoutez d'autres types et icônes selon vos besoins
    default: return 'file';
  }
}

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Map<string, UploadProgress>>(new Map());
  const [activeUploads, setActiveUploads] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  // Charger les documents existants
  const loadDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await documentService.getUserDocuments();
      
      if (response.success && response.data) {
        // Transformer les données de l'API en format local
        const transformedDocuments: Document[] = response.data.map((doc: any) => ({
          id: doc.type.toLowerCase(),
          name: getDocumentName(doc.type),
          description: getDocumentDescription(doc.type),
          status: mapApiStatusToLocal(doc.statut),
          icon: getDocumentIcon(doc.type),
          isRequired: true,
          uploadedAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
          previewUrl: doc.fichierRectoUrl || doc.fichierVersoUrl
        }));
        
        setDocuments(transformedDocuments);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
      showToast({
        type: 'error',
        title: 'Erreur de chargement',
        message: 'Impossible de charger vos documents existants.'
      });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Upload d'un document
  const uploadDocument = useCallback(async (documentId: string, file: File) => {
    // Validation du fichier
    const validation = documentService.validateFile(file, 10, ['.jpg', '.jpeg', '.png', '.pdf']);
    if (!validation.isValid) {
      showToast({
        type: 'error',
        title: 'Fichier invalide',
        message: validation.error || 'Le fichier n\'est pas valide'
      });
      return false;
    }

    setActiveUploads(prev => new Set(prev).add(documentId));
    
    // Mise à jour du statut à "uploading"
    setDocuments(prev => prev.map(doc =>
      doc.id === documentId 
        ? { ...doc, status: 'uploading' as DocumentStatus, file }
        : doc
    ));

    try {
      // Upload avec suivi de progression
      const response = await documentService.uploadDocument(
        file,
        documentId,
        (progress) => {
          setUploadProgress(prev => new Map(prev).set(documentId, {
            documentId,
            progress,
            isUploading: true
          }));
        }
      );

      // Génération de l'URL de prévisualisation
      const previewUrl = documentService.generatePreviewUrl(file);

      // Mise à jour avec succès
      setDocuments(prev => prev.map(doc =>
        doc.id === documentId 
          ? { 
              ...doc, 
              status: 'uploaded' as DocumentStatus,
              uploadedAt: new Date(),
              previewUrl: previewUrl || undefined
            }
          : doc
      ));

      showToast({
        type: 'success',
        title: 'Upload réussi',
        message: response.message || 'Document téléchargé avec succès'
      });

      return true;

    } catch (error) {
      console.error('Erreur upload:', error);
      
      // Retour à l'état précédent
      setDocuments(prev => prev.map(doc =>
        doc.id === documentId 
          ? { ...doc, status: 'missing' as DocumentStatus }
          : doc
      ));

      setUploadProgress(prev => {
        const newMap = new Map(prev);
        newMap.set(documentId, {
          documentId,
          progress: 0,
          isUploading: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
        return newMap;
      });

      showToast({
        type: 'error',
        title: 'Erreur d\'upload',
        message: error instanceof Error ? error.message : 'Une erreur est survenue'
      });

      return false;

    } finally {
      setActiveUploads(prev => {
        const newSet = new Set(prev);
        newSet.delete(documentId);
        return newSet;
      });

      // Nettoyage du progress après un délai
      setTimeout(() => {
        setUploadProgress(prev => {
          const newMap = new Map(prev);
          newMap.delete(documentId);
          return newMap;
        });
      }, 3000);
    }
  }, [showToast]);

  // Initialisation
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Calculer les statistiques
  const stats = {
    total: documents.filter(doc => doc.isRequired).length,
    uploaded: documents.filter(doc => doc.status === 'uploaded' || doc.status === 'validated').length,
    missing: documents.filter(doc => doc.status === 'missing' || doc.status === 'rejected').length,
    pending: documents.filter(doc => doc.status === 'pending').length
  };

  return {
    documents,
    uploadProgress,
    activeUploads,
    isLoading,
    stats,
    uploadDocument,
    loadDocuments,
    hasActiveUploads: activeUploads.size > 0,
    allRequiredUploaded: stats.total > 0 && stats.uploaded === stats.total
  };
};
