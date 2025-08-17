// src/pages/DocumentsRequiredPage.tsx - Version simplifiée sans chargement automatique
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Upload,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Camera,
  Shield,
  Loader
} from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { documentService } from '../api/documentService';

type DocumentStatus = 'missing' | 'uploading' | 'uploaded' | 'validated' | 'rejected' | 'not_required';

interface DocumentItem {
  id: string;
  name: string;
  description: string;
  status: DocumentStatus;
  icon: React.ComponentType<any>;
  isRequired: boolean;
  file?: File;
  previewUrl?: string;
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
      status: user?.type === 'entreprise' ? 'missing' : 'not_required',
      icon: Shield,
      isRequired: user?.type === 'entreprise',
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

  // Références pour les inputs fichiers
  const fileInputs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Fonction pour tester la connexion API
  const testConnection = async () => {
    console.log('=== TEST CONNEXION API ===');
    
    const token = localStorage.getItem('token');
    console.log('Token présent:', !!token);
    
    if (token) {
      console.log('Token:', token.substring(0, 50) + '...');
      
      try {
        const response = await documentService.getUserDocuments();
        console.log('Réponse API:', response);
        showToast({
          type: 'success',
          title: 'Connexion réussie',
          message: 'L\'API répond correctement'
        });
      } catch (error) {
        console.error('Erreur API:', error);
        showToast({
          type: 'error',
          title: 'Erreur de connexion',
          message: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    } else {
      showToast({
        type: 'warning',
        title: 'Token manquant',
        message: 'Aucun token d\'authentification trouvé'
      });
    }
  };

  // Upload de fichier
  const handleUpload = (id: string) => {
    const input = fileInputs.current[id];
    if (!input) return;
    
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.removeAttribute('capture');
    input.click();
  };

  const handleTakePhoto = (id: string) => {
    const input = fileInputs.current[id];
    if (!input) return;
    
    input.accept = 'image/*';
    input.setAttribute('capture', 'environment');
    input.click();
  };

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

    // Démarrer l'upload
    setUploadProgress(prev => ({
      ...prev,
      [id]: { progress: 0, isUploading: true }
    }));

    // Mettre à jour le document
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { 
        ...doc, 
        status: 'uploading', 
        file,
        previewUrl: URL.createObjectURL(file)
      } : doc
    ));

    try {
      console.log(`Upload du fichier ${file.name} pour ${id}`);
      
      const response = await documentService.uploadDocument(
        file,
        id,
        (progress) => {
          setUploadProgress(prev => ({
            ...prev,
            [id]: { ...prev[id], progress }
          }));
        }
      );

      console.log('Réponse upload:', response);

      // Succès
      setDocuments(prev => prev.map(doc => 
        doc.id === id ? { ...doc, status: 'uploaded' } : doc
      ));

      showToast({
        type: 'success',
        title: 'Upload réussi',
        message: `${file.name} a été téléchargé avec succès`
      });

    } catch (error) {
      console.error('Erreur upload:', error);
      
      // Réinitialiser en cas d'erreur
      setDocuments(prev => prev.map(doc => 
        doc.id === id ? { 
          ...doc, 
          status: 'missing',
          file: undefined,
          previewUrl: undefined
        } : doc
      ));

      setUploadProgress(prev => ({
        ...prev,
        [id]: { 
          progress: 0, 
          isUploading: false, 
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        }
      }));

      showToast({
        type: 'error',
        title: 'Erreur d\'upload',
        message: error instanceof Error ? error.message : 'Une erreur est survenue'
      });
    }

    // Nettoyage
    setTimeout(() => {
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[id];
        return newProgress;
      });
    }, 3000);
  };

  // Soumission finale
  const handleSubmit = async () => {
    const requiredDocs = documents.filter(doc => doc.isRequired);
    const uploadedDocs = requiredDocs.filter(doc => doc.status === 'uploaded');
    
    if (uploadedDocs.length < requiredDocs.length) {
      showToast({
        type: 'warning',
        title: 'Documents manquants',
        message: 'Tous les documents requis doivent être téléchargés'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Ici vous pouvez appeler l'API pour soumettre tous les documents
      // await documentService.uploadMultipleDocuments(...)
      
      showToast({
        type: 'success',
        title: 'Documents soumis',
        message: 'Vos documents ont été envoyés pour validation'
      });
      
      navigate('/compte-en-attente');
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Erreur de soumission',
        message: error instanceof Error ? error.message : 'Erreur lors de la soumission'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Utilitaires UI
  const getStatusColor = (status: DocumentStatus) => {
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
      case 'not_required': 
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: DocumentStatus, id: string) => {
    const progress = uploadProgress[id];
    
    if (progress?.isUploading) {
      return <Loader className="w-4 h-4 animate-spin" />;
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

  const getStatusText = (status: DocumentStatus, id: string) => {
    const progress = uploadProgress[id];
    
    if (progress?.isUploading) {
      return `Upload... ${progress.progress}%`;
    }

    if (progress?.error) {
      return 'Erreur';
    }

    switch (status) {
      case 'uploaded': return 'Téléchargé';
      case 'validated': return 'Validé';
      case 'missing': return 'Manquant';
      case 'uploading': return 'Envoi...';
      case 'rejected': return 'Rejeté';
      case 'not_required': return 'Non requis';
      default: return 'Inconnu';
    }
  };

  // Statistiques
  const requiredDocs = documents.filter(doc => doc.isRequired);
  const uploadedCount = requiredDocs.filter(doc => doc.status === 'uploaded').length;
  const allRequiredUploaded = uploadedCount === requiredDocs.length;

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-nexsaas-pure-white to-nexsaas-light-gray dark:from-nexsaas-vanta-black dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="p-4 bg-red-500/10 rounded-full inline-block mb-6">
            <AlertTriangle className="w-16 h-16 text-red-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-4">
            Documents Requis
          </h1>
          <p className="text-lg text-nexsaas-vanta-black dark:text-gray-300 max-w-2xl mx-auto">
            Pour accéder à toutes les fonctionnalités de NexSaaS, veuillez télécharger les documents suivants
          </p>
        </motion.div>

        {/* Test API Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 text-center"
        >
          <Button variant="outline" onClick={testConnection}>
            Tester la connexion API
          </Button>
        </motion.div>

        {/* Progression */}
        {requiredDocs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400">
                    Progression
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    {uploadedCount} / {requiredDocs.length} documents téléchargés
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
            </div>
          </motion.div>
        )}

        {/* Documents List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-6 mb-8"
        >
          {documents.map((document, index) => {
            const progress = uploadProgress[document.id];
            
            return (
              <motion.div
                key={document.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-nexsaas-deep-blue/10 rounded-lg">
                        <document.icon className="w-6 h-6 text-nexsaas-deep-blue" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                          {document.name}
                        </h3>
                        <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                          {document.description}
                        </p>
                        <div className="flex items-center mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                            {getStatusIcon(document.status, document.id)}
                            <span className="ml-1">{getStatusText(document.status, document.id)}</span>
                          </span>
                          {progress?.error && (
                            <span className="ml-2 text-xs text-red-500">
                              {progress.error}
                            </span>
                          )}
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
                    {(document.status === 'missing' || document.status === 'rejected') && !progress?.isUploading && (
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleTakePhoto(document.id)}>
                          <Camera className="w-4 h-4 mr-2" />
                          Photo
                        </Button>
                        <Button size="sm" onClick={() => handleUpload(document.id)}>
                          <Upload className="w-4 h-4 mr-2" />
                          Fichier
                        </Button>
                      </div>
                    )}
                    
                    {document.previewUrl && (document.status === 'uploaded' || document.status === 'validated') && (
                      <a
                        href={document.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 text-blue-600 hover:text-blue-800 underline text-sm"
                      >
                        Aperçu
                      </a>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-8"
        >
          <Card>
            <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-4">
              Instructions de téléchargement
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                  Formats acceptés
                </h3>
                <ul className="text-sm text-nexsaas-vanta-black dark:text-gray-300 space-y-1">
                  <li>• PDF (recommandé)</li>
                  <li>• JPEG, JPG, PNG</li>
                  <li>• Taille max : 10 MB</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                  Conseils qualité
                </h3>
                <ul className="text-sm text-nexsaas-vanta-black dark:text-gray-300 space-y-1">
                  <li>• Document entièrement visible</li>
                  <li>• Bonne luminosité</li>
                  <li>• Texte lisible</li>
                  <li>• Pas de reflets</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/dashboard">
            <Button variant="outline" size="lg">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour au tableau de bord
            </Button>
          </Link>
          <Button 
            size="lg" 
            disabled={!allRequiredUploaded || isSubmitting} 
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <Loader className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5 mr-2" />
            )}
            {isSubmitting ? 'Validation en cours...' : 'Valider les documents'}
          </Button>
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-12 text-center"
        >
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
        </motion.div>
      </div>
    </div>
  );
};

export default DocumentsRequiredPage;