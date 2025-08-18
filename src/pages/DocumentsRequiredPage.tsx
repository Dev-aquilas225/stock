// src/pages/DocumentsRequiredPage.tsx - Version simplifiée et fonctionnelle
import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Upload,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Shield,
  Loader,
  X,
  Eye,
  
} from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { documentService } from '../api/documentApi';

type DocumentStatus = 'missing' | 'uploading' | 'uploaded' | 'validated' | 'rejected' | 'not_required';

interface DocumentItem {
  id: string;
  name: string;
  description: string;
  status: DocumentStatus;
  icon: React.ComponentType<any>;
  isRequired?: boolean;
  file?: File;
  previewUrl?: string;
  isRejected?: boolean;
}

interface UploadProgress {
  [key: string]: {
    progress: number;
    isUploading: boolean;
    error?: string;
  };
}

const DocumentsRequiredPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Documents par défaut
  const [documents, setDocuments] = useState<DocumentItem[]>([
    {
      id: 'cniFront',
      name: 'CNI Recto',
      description: 'Recto de la carte nationale d\'identité',
      status: 'missing',
      icon: FileText,
      isRequired: true,
    },
    {
      id: 'cniBack',
      name: 'CNI Verso',
      description: 'Verso de la carte nationale d\'identité',
      status: 'missing',
      icon: FileText,
      isRequired: true,
    },
    {
      id: 'rccm',
      name: 'Registre de commerce (RCCM)',
      description: 'Document d\'enregistrement de votre entreprise',
      status: 'not_required',
      icon: Shield,
      isRequired: true,
    },
    {
      id: 'dfe',
      name: 'DFE',
      description: 'Document fiscal d\'entreprise',
      status: 'missing',
      icon: FileText,
      isRequired: true,
    },
  ]);

  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // États locaux pour les dates d'expiration
  const [expiryDates, setExpiryDates] = useState({
    cniExpiry: '',
    rccmExpiry: '',
    dfeExpiry: ''
  });


  // Stockage temporaire des fichiers
  const [tempFiles, setTempFiles] = useState<{ [key: string]: File }>({});

  // Références pour les inputs fichiers
  const fileInputs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Upload de fichier (stockage temporaire)
  const handleUpload = (id: string) => {
    const input = fileInputs.current[id];
    if (!input) return;
    
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.removeAttribute('capture');
    input.click();
  };

  // const handleTakePhoto = (id: string) => {
  //   const input = fileInputs.current[id];
  //   if (!input) return;
    
  //   input.accept = 'image/*';
  //   input.setAttribute('capture', 'environment');
  //   input.click();
  // };

  const handleFileChange = async (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation basique
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      showToast({
        type: 'error',
        title: 'Fichier trop volumineux',
        message: 'Le fichier ne doit pas dépasser 10 MB'
      });
      return;
    }

    // Simulation d'upload avec progression
    setUploadProgress(prev => ({
      ...prev,
      [id]: { progress: 0, isUploading: true }
    }));

    // Mise à jour du document
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { 
        ...doc, 
        status: 'uploading',
        file
      } : doc
    ));

    // Simulation de progression
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(prev => ({
        ...prev,
        [id]: { progress, isUploading: true }
      }));

      if (progress >= 100) {
        clearInterval(interval);
        
        // Stockage du fichier temporairement
        setTempFiles(prev => ({
          ...prev,
          [id]: file
        }));

        // Génération URL de prévisualisation
        const previewUrl = URL.createObjectURL(file);

        // Mise à jour du document
        setDocuments(prev => prev.map(doc => 
          doc.id === id ? { 
            ...doc, 
            status: 'uploaded',
            previewUrl
          } : doc
        ));

        showToast({
          type: 'success',
          title: 'Fichier prêt',
          message: 'Fichier ajouté avec succès. Cliquez sur "Valider" pour envoyer tous les documents.'
        });

        // Nettoyage du progress
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[id];
            return newProgress;
          });
        }, 2000);
      }
    }, 100);

    // Reset input
    event.target.value = '';
  };

  // Supprimer un fichier
  const removeDocument = (id: string) => {
    // Supprimer du stockage temporaire
    setTempFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[id];
      return newFiles;
    });

    // Remettre le document à l'état "missing"
    setDocuments(prev => prev.map(doc =>
      doc.id === id 
        ? { 
            ...doc, 
            status: 'missing',
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
  };

  // Soumission finale de tous les documents
  const handleSubmit = async () => {
    const requiredFiles = ['cniFront', 'cniBack', 'dfe'];
    const missingFiles = requiredFiles.filter(id => !tempFiles[id]);

    if (missingFiles.length > 0) {
      showToast({
        type: 'error',
        title: 'Documents manquants',
        message: `Documents requis manquants: ${missingFiles.join(', ')}`
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const files = {
        cniFront: tempFiles.cniFront,
        cniBack: tempFiles.cniBack,
        rccm: tempFiles.rccm,
        dfe: tempFiles.dfe,
      };

      const response = await documentService.uploadAllDocuments(files, expiryDates);

      if (response.success) {
        showToast({
          type: 'success',
          title: 'Documents envoyés',
          message: response.message || 'Vos documents ont été envoyés pour validation'
        });
        
        navigate('/compte-en-attente');
      } else {
        throw new Error(response.message);
      }

    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      showToast({
        type: 'error',
        title: 'Erreur d\'envoi',
        message: error instanceof Error ? error.message : 'Erreur lors de l\'envoi des documents'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Utilitaires UI
  const getStatusColor = (status: DocumentStatus, hasFile: boolean) => {
    if (hasFile) {
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    }
    
    switch (status) {
      case 'uploaded': 
      case 'validated': 
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'missing': 
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'uploading': 
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'rejected': 
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: 
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: DocumentStatus, id: string, hasFile: boolean) => {
    const progress = uploadProgress[id];
    
    if (progress?.isUploading) {
      return <Loader className="w-4 h-4 animate-spin" />;
    }

    if (hasFile) {
      return <CheckCircle className="w-4 h-4" />;
    }

    switch (status) {
      case 'uploaded':
      case 'validated':
        return <CheckCircle className="w-4 h-4" />;
      case 'missing':
      case 'rejected':
        return <AlertTriangle className="w-4 h-4" />;
      case 'uploading':
        return <Upload className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: DocumentStatus, id: string, hasFile: boolean) => {
    const progress = uploadProgress[id];
    
    if (progress?.isUploading) {
      return `Upload... ${progress.progress}%`;
    }

    if (hasFile) {
      return 'Prêt à envoyer';
    }

    switch (status) {
      case 'uploaded': return 'Téléchargé';
      case 'validated': return 'Validé';
      case 'missing': return 'Manquant';
      case 'uploading': return 'Envoi...';
      case 'rejected': return 'Rejeté';
      default: return 'Inconnu';
    }
  };

  // filtrages des documents requis avant envoie
  const requiredDocs = documents.filter(doc => doc.isRequired && doc.id !== 'rccm');
  const uploadedCount = documents.filter(doc => 
    doc.isRequired && doc.id !== 'rccm' && tempFiles[doc.id] // Exclure RCCM
  ).length;
  const hasRequiredFiles = uploadedCount === requiredDocs.length;

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-nexsaas-pure-white to-nexsaas-light-gray dark:from-nexsaas-vanta-black dark:to-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex justify-center items-center h-64">
            <Loader className="w-8 h-8 animate-spin text-nexsaas-deep-blue" />
            <span className="ml-3 text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              Chargement...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-nexsaas-pure-white to-nexsaas-light-gray dark:from-nexsaas-vanta-black dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="p-4 bg-red-500/10 rounded-full inline-block mb-6">
            <AlertTriangle className="w-16 h-16 text-red-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-4">
            Documents Requis
          </h1>
          <p className="text-lg text-nexsaas-vanta-black dark:text-gray-300 max-w-2xl mx-auto">
            Pour accéder à toutes les fonctionnalités, veuillez télécharger tous les documents requis.
            Ils seront envoyés ensemble pour validation.
          </p>
        </div>

        {/* Progression */}
        <div className="mb-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400">
                  Progression
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  {uploadedCount} / {requiredDocs.length} documents prêts
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round((uploadedCount / requiredDocs.length) * 100)}%
                </div>
              </div>
            </div>
            <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${(uploadedCount / requiredDocs.length) * 100}%` }}
              />
            </div>
            {hasRequiredFiles && (
              <div className="mt-2 text-sm text-green-700 dark:text-green-400">
                ✓ Tous les documents sont prêts pour l'envoi
              </div>
            )}
          </div>
        </div>

        {/* Documents List */}
        <div className="space-y-6 mb-8">
          {documents
            .filter(doc => doc.isRequired || doc.id === 'rccm')
            .map((document) => {
            const progress = uploadProgress[document.id];
            const hasFile = !!tempFiles[document.id];
            const DocumentIcon = document.icon;
            const isEditable = document.isRejected || document.status === 'missing';
            
            return (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-nexsaas-deep-blue/10 rounded-lg">
                      <DocumentIcon className="w-6 h-6 text-nexsaas-deep-blue" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                        {document.name}
                      </h3>
                      <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                        {document.description}
                      </p>
                      <div className="flex items-center mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(document.status, hasFile)}`}>
                          {getStatusIcon(document.status, document.id, hasFile)}
                          <span className="ml-1">{getStatusText(document.status, document.id, hasFile)}</span>
                        </span>
                      </div>
                      {/* Barre de progression */}
                      {progress?.isUploading && (
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${progress.progress}%` }}
                          />
                        </div>
                      )}
                      {/* Nom du fichier sélectionné */}
                      {hasFile && tempFiles[document.id] && (
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          📎 {tempFiles[document.id].name} ({(tempFiles[document.id].size / (1024 * 1024)).toFixed(2)} MB)
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Input caché */}
                  <input
                    type="file"
                    style={{ display: 'none' }}
                    ref={el => (fileInputs.current[document.id] = el)}
                    onChange={e => handleFileChange(document.id, e)}
                  />
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2">
          {hasFile ? (
            <>
              {document.previewUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(document.previewUrl, '_blank')}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeDocument(document.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              {isEditable && (
                <Button 
                  size="sm" 
                  onClick={() => handleUpload(document.id)}
                  disabled={!isEditable}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {document.isRejected ? 'Re-télécharger' : 'Télécharger'}
                </Button>
              )}
              {!isEditable && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  En attente de validation
                </span>
              )}
            </>
          )}
        </div>
      </div>
      </Card>
    );
  })}
        </div>

        

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/dashboard">
            <Button variant="outline" size="lg">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour au tableau de bord
            </Button>
          </Link>
          <Button 
            size="lg" 
            disabled={!hasRequiredFiles || isSubmitting} 
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <Loader className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5 mr-2" />
            )}
            {isSubmitting ? 'Envoi en cours...' : `Valider les documents (${uploadedCount}/${requiredDocs.length})`}
          </Button>
        </div>

        {/* Message d'aide */}
        {!hasRequiredFiles && (
          <div className="mt-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600 inline mr-2" />
              <span className="text-yellow-800 dark:text-yellow-400">
                Veuillez sélectionner tous les documents requis avant de valider
              </span>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 text-center">
          <Card className="bg-nexsaas-light-gray dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
              Besoin d'aide ?
            </h3>
            <p className="text-nexsaas-vanta-black dark:text-gray-300 mb-4">
              Notre équipe support est là pour vous accompagner dans le processus de validation.
            </p>
            <Button variant="outline">
              Contacter le support
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DocumentsRequiredPage;