// hooks/useDocuments.ts
import { useState, useEffect, useCallback } from 'react';
import { documentService } from '../api/documentApi';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import icon from 'lucide-react'; // Assurez-vous d'avoir installé lucide-react pour les icônes


type DocumentStatus = 'missing' | 'uploading' | 'uploaded' | 'validated' | 'rejected' | 'not_required' | 'pending';

interface DocumentItem {
  id: string;
  name: string;
  description: string;
  status: DocumentStatus;
  icon: React.ComponentType<any>;
  isRequired: boolean;
  file?: File;
  previewUrl?: string;
  uploadedAt?: Date;
  isRejected?: boolean; // Ajout pour gérer les documents rejetés
}

interface UploadProgress {
  documentId: string;
  progress: number;
  isUploading: boolean;
  error?: string;
}

/**
 * Mapping des statuts API vers les statuts locaux
 */
function mapApiStatusToLocal(apiStatus: string): DocumentStatus {
  const statusMapping: Record<string, DocumentStatus> = {
    'EN_ATTENTE': 'pending',
    'VALIDE': 'validated', 
    'REFUSE': 'rejected',
    // 'EXPIRE': 'rejected',
    'UPLOADED': 'uploaded'
  };
  return statusMapping[apiStatus] || 'missing';
}

/**
 * Génère les documents par défaut selon le type d'utilisateur
 */
function getDefaultDocuments(userType?: string): DocumentItem[] {
  
  const { FileText, Shield } = icon;
  
  return [
    {
      id: 'cniFront',
      name: 'CNI Recto',
      description: 'Recto de la carte nationale d\'identité',
      status: 'missing',
      icon: FileText,
      isRequired: true,
      isRejected: false, // Ajout pour gérer les documents rejetés
    },
    {
      id: 'cniBack', 
      name: 'CNI Verso',
      description: 'Verso de la carte nationale d\'identité',
      status: 'missing',
      icon: FileText,
      isRequired: true,
      isRejected: false,
    },
    {
      id: 'rccm',
      name: 'Registre de commerce (RCCM)',
      description: 'Document d\'enregistrement de votre entreprise',
      status: 'missing',
      icon: Shield,
      isRequired: true, // Toujours requis selon le backend
      isRejected: false,
    },
    {
      id: 'dfe',
      name: 'DFE', 
      description: 'Document fiscal d\'entreprise',
      status: 'missing',
      icon: FileText,
      isRequired: true,
      isRejected: false,
    },
  ];
}

export const useDocuments = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>(() => 
    getDefaultDocuments(user?.type)
  );
  
  const [uploadProgress, setUploadProgress] = useState<Map<string, UploadProgress>>(new Map());
  const [activeUploads, setActiveUploads] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  // Stockage temporaire des fichiers avant envoi final
  const [tempFiles, setTempFiles] = useState<Map<string, File>>(new Map());

  // Charger les documents existants depuis l'API
  const loadDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await documentService.getUserDocuments();
      
      if (response && response.success && response.data) {
        // Transformer les données API en format local
        const defaultDocs = getDefaultDocuments(user?.type);
        
        // Mettre à jour le statut des documents existants
        const updatedDocuments = defaultDocs.map(doc => {
          const apiDoc = response.data.find((d: any) => {
            // Mapping des IDs
            const docTypeMap: Record<string, string> = {
              'cniFront': 'CNI',
              'cniBack': 'CNI',
              'rccm': 'RCCM', 
              'dfe': 'DFE'
            };
            return d.type === docTypeMap[doc.id];
          });

          if (apiDoc) {
            return {
              ...doc,
              status: mapApiStatusToLocal(apiDoc.statut),
              uploadedAt: apiDoc.createdAt ? new Date(apiDoc.createdAt) : undefined,
              previewUrl: apiDoc.fichierRectoUrl || apiDoc.fichierVersoUrl
            };
          }
          
          return doc;
        });
        
        setDocuments(updatedDocuments);
      } else {
        // Aucun document trouvé, garder les documents par défaut
        setDocuments(getDefaultDocuments(user?.type));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
      // En cas d'erreur, garder les documents par défaut
      setDocuments(getDefaultDocuments(user?.type));
    } finally {
      setIsLoading(false);
    }
  }, [user?.type]);


  const loadUserDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await documentService.getUserDocuments();
      
      if (response && response.success && response.data) {
        setDocuments(prev => prev.map(doc => {
          const apiDoc = response.data.find((d: any) => {
            const docTypeMap: Record<string, string> = {
              'cniFront': 'CNI',
              'cniBack': 'CNI', 
              'rccm': 'RCCM',
              'dfe': 'DFE'
            };
            return d.type === docTypeMap[doc.id];
          });

          if (apiDoc) {
            return {
              ...doc,
              status: apiDoc.statut === 'REFUSE' ? 'rejected' : 
                    apiDoc.statut === 'VALIDE' ? 'validated' : 'uploaded',
              isRejected: apiDoc.statut === 'REFUSE',
              previewUrl: apiDoc.fichierUrl
            };
          }
          return doc;
        }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger les documents existants'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les documents à l'initialisation
  useEffect(() => {
    loadUserDocuments();
  }, []);

  // Upload individuel (pour prévisualisation uniquement)
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
      // Simulation d'upload avec progression pour prévisualisation
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(prev => new Map(prev).set(documentId, {
          documentId,
          progress,
          isUploading: true
        }));

        if (progress >= 100) {
          clearInterval(interval);
          
          // Stocker le fichier temporairement
          setTempFiles(prev => new Map(prev).set(documentId, file));

          // Génération de l'URL de prévisualisation
          const previewUrl = documentService.generatePreviewUrl(file);

          // Mise à jour avec "prêt pour envoi"
          setDocuments(prev => prev.map(doc =>
            doc.id === documentId 
              ? { 
                  ...doc, 
                  status: 'uploaded' as DocumentStatus, // Status local pour l'UI
                  uploadedAt: new Date(),
                  previewUrl: previewUrl || undefined,
                  file
                }
              : doc
          ));

          showToast({
            type: 'success',
            title: 'Fichier prêt',
            message: 'Fichier ajouté avec succès. Cliquez sur "Valider" pour envoyer tous les documents.'
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
      }, 100);

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
    }
  }, [showToast]);

  // Envoi final de tous les documents
  const submitAllDocuments = useCallback(async (expiryDates: {
    cniExpiry?: string;
    rccmExpiry?: string;
    dfeExpiry?: string;
  } = {}): Promise<boolean> => {
    setIsSubmitting(true);

    try {
      // Préparation des fichiers depuis le stockage temporaire
      const files = {
        cniFront: tempFiles.get('cniFront'),
        cniBack: tempFiles.get('cniBack'),
        rccm: tempFiles.get('rccm'),
        dfe: tempFiles.get('dfe'),
      };

      // Validation que tous les documents requis sont présents
      const validation = documentService.validateAllRequiredDocuments(files);
      if (!validation.isValid) {
        showToast({
          type: 'error',
          title: 'Documents manquants',
          message: `Documents requis manquants: ${validation.missingDocuments.join(', ')}`
        });
        return false;
      }

      // Envoi vers le backend
      const response = await documentService.uploadAllDocuments(files, expiryDates);

      if (response.success) {
        // Mise à jour du statut des documents
        setDocuments(prev => prev.map(doc => 
          doc.isRequired ? { ...doc, status: 'pending' as DocumentStatus } : doc
        ));

        // Nettoyage des fichiers temporaires
        setTempFiles(new Map());

        showToast({
          type: 'success',
          title: 'Documents envoyés',
          message: response.message || 'Vos documents ont été envoyés pour validation'
        });

        return true;
      } else {
        throw new Error(response.message);
      }

    } catch (error) {
      console.error('Erreur lors de l\'envoi des documents:', error);
      showToast({
        type: 'error',
        title: 'Erreur d\'envoi',
        message: error instanceof Error ? error.message : 'Erreur lors de l\'envoi des documents'
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [tempFiles, showToast]);

  // Mise à jour des documents rejetés
  const updateRejectedDocuments = useCallback(async (
    rejectedFiles: {
      cniFront?: File;
      cniBack?: File;
      rccm?: File;
      dfe?: File;
    },
    expiryDates: {
      cniExpiry?: string;
      rccmExpiry?: string;
      dfeExpiry?: string;
    } = {}
  ): Promise<boolean> => {
    setIsSubmitting(true);

    try {
      const response = await documentService.updateAllDocuments(rejectedFiles, expiryDates);

      if (response.success) {
        // Recharger les documents après mise à jour
        await loadDocuments();

        showToast({
          type: 'success',
          title: 'Documents mis à jour',
          message: response.message || 'Vos documents ont été mis à jour avec succès'
        });

        return true;
      } else {
        throw new Error(response.message);
      }

    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      showToast({
        type: 'error',
        title: 'Erreur de mise à jour',
        message: error instanceof Error ? error.message : 'Erreur lors de la mise à jour des documents'
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [loadDocuments, showToast]);

  // Supprimer un fichier temporaire
  const removeDocument = useCallback((documentId: string) => {
    // Supprimer du stockage temporaire
    setTempFiles(prev => {
      const newMap = new Map(prev);
      newMap.delete(documentId);
      return newMap;
    });

    // Remettre le document à l'état "missing"
    setDocuments(prev => prev.map(doc =>
      doc.id === documentId 
        ? { 
            ...doc, 
            status: 'missing' as DocumentStatus,
            file: undefined,
            previewUrl: undefined
          }
        : doc
    ));

    showToast({
      type: 'info',
      title: 'Document supprimé',
      message: 'Le document a été retiré de la liste d\'envoi'
    });
  }, [showToast]);

  // Initialisation
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Calculer les statistiques
  const stats = {
    total: documents.filter(doc => doc.isRequired).length,
    uploaded: documents.filter(doc => 
      (doc.status === 'uploaded' || doc.status === 'validated') && doc.isRequired
    ).length,
    missing: documents.filter(doc => 
      (doc.status === 'missing' || doc.status === 'rejected') && doc.isRequired
    ).length,
    pending: documents.filter(doc => doc.status === 'pending' && doc.isRequired).length
  };

  const allRequiredUploaded = stats.total > 0 && stats.uploaded === stats.total;
  const hasRequiredFiles = tempFiles.has('cniFront') && tempFiles.has('cniBack') && 
                          tempFiles.has('rccm') && tempFiles.has('dfe');

  return {
    documents,
    uploadProgress,
    activeUploads,
    isLoading,
    isSubmitting,
    stats,
    tempFiles: Object.fromEntries(tempFiles),
    
    // Actions
    uploadDocument,
    submitAllDocuments,
    updateRejectedDocuments,
    removeDocument,
    loadDocuments,
    
    // État calculé
    hasActiveUploads: activeUploads.size > 0,
    allRequiredUploaded,
    hasRequiredFiles,
    canSubmit: hasRequiredFiles && !isSubmitting
  };
};