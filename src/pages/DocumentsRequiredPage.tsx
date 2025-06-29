import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Upload, 
  AlertTriangle, 
  CheckCircle,
  ArrowLeft,
  Camera,
  Shield
} from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { useAuth } from '../contexts/AuthContext';

const DocumentsRequiredPage: React.FC = () => {
  const { user } = useAuth();

  const requiredDocuments = [
    {
      id: 'identity',
      name: 'Pièce d\'identité',
      description: 'Carte d\'identité, passeport ou permis de conduire',
      status: 'missing',
      icon: FileText,
    },
    {
      id: 'proof_address',
      name: 'Justificatif de domicile',
      description: 'Facture d\'électricité, gaz ou téléphone (moins de 3 mois)',
      status: 'missing',
      icon: FileText,
    },
    {
      id: 'business_registration',
      name: 'Registre de commerce',
      description: 'Document d\'enregistrement de votre entreprise',
      status: user?.type === 'entreprise' ? 'missing' : 'not_required',
      icon: Shield,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploaded': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'missing': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'not_required': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploaded': return <CheckCircle className="w-4 h-4" />;
      case 'missing': return <AlertTriangle className="w-4 h-4" />;
      case 'pending': return <Upload className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'uploaded': return 'Téléchargé';
      case 'missing': return 'Manquant';
      case 'pending': return 'En attente';
      case 'not_required': return 'Non requis';
      default: return 'Inconnu';
    }
  };

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

        {/* Alert Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                  Accès limité
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Certaines fonctionnalités sont restreintes jusqu'à la validation de vos documents.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Documents List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-6 mb-8"
        >
          {requiredDocuments.map((document, index) => (
            <motion.div
              key={document.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
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
                          {getStatusIcon(document.status)}
                          <span className="ml-1">{getStatusText(document.status)}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {document.status === 'missing' && (
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Camera className="w-4 h-4 mr-2" />
                        Prendre photo
                      </Button>
                      <Button size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Télécharger
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Upload Instructions */}
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
          <Button size="lg" disabled>
            <CheckCircle className="w-5 h-5 mr-2" />
            Valider les documents
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