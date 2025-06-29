import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  MessageCircle, 
  Plus, 
  Search, 
  ArrowLeft,
  Bot,
  User,
  Settings,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Phone,
  Mail
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';

const SupportPage: React.FC = () => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const conversations = [
    {
      id: 'CONV-001',
      customer: 'Marie Dubois',
      channel: 'WhatsApp',
      status: 'active',
      lastMessage: 'Bonjour, j\'ai un problème avec ma commande',
      lastActivity: '2024-01-15 14:30',
      isBot: false,
    },
    {
      id: 'CONV-002',
      customer: 'Jean Martin',
      channel: 'Messenger',
      status: 'resolved',
      lastMessage: 'Merci pour votre aide !',
      lastActivity: '2024-01-15 13:45',
      isBot: true,
    },
    {
      id: 'CONV-003',
      customer: 'Sophie Laurent',
      channel: 'Site Web',
      status: 'pending',
      lastMessage: 'Comment puis-je suivre ma commande ?',
      lastActivity: '2024-01-15 12:20',
      isBot: true,
    },
  ];

  const botResponses = [
    {
      id: 'BOT-001',
      trigger: 'commande',
      response: 'Pour suivre votre commande, utilisez le numéro de suivi que vous avez reçu par email.',
      category: 'Commandes',
      usage: 45,
    },
    {
      id: 'BOT-002',
      trigger: 'livraison',
      response: 'Nos délais de livraison sont de 2-5 jours ouvrés selon votre localisation.',
      category: 'Livraison',
      usage: 32,
    },
    {
      id: 'BOT-003',
      trigger: 'retour',
      response: 'Vous pouvez retourner un article dans les 30 jours suivant la réception.',
      category: 'Retours',
      usage: 28,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'resolved': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <MessageCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'WhatsApp': return <Phone className="w-4 h-4 text-green-500" />;
      case 'Messenger': return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'Site Web': return <Mail className="w-4 h-4 text-purple-500" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-nexsaas-pure-white to-nexsaas-light-gray dark:from-nexsaas-vanta-black dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center mb-4">
            <Link to="/dashboard" className="mr-4">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
            </Link>
            <div className="p-3 bg-pink-500 rounded-lg mr-4">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                Support IA Client
              </h1>
              <p className="text-nexsaas-vanta-black dark:text-gray-300">
                Agent intelligent multi-canal
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="text-center">
            <div className="p-3 bg-green-500/10 rounded-lg inline-block mb-3">
              <Bot className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              89%
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              Satisfaction client
            </p>
          </Card>
          
          <Card className="text-center">
            <div className="p-3 bg-blue-500/10 rounded-lg inline-block mb-3">
              <MessageCircle className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              156
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              Conversations ce mois
            </p>
          </Card>
          
          <Card className="text-center">
            <div className="p-3 bg-purple-500/10 rounded-lg inline-block mb-3">
              <BarChart3 className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              2.5min
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              Temps de réponse moyen
            </p>
          </Card>
          
          <Card className="text-center">
            <div className="p-3 bg-orange-500/10 rounded-lg inline-block mb-3">
              <CheckCircle className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
              78%
            </h3>
            <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
              Résolution automatique
            </p>
          </Card>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Conversations */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card>
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                  Conversations Actives
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                    />
                  </div>
                  <Button onClick={() => setShowConfigModal(true)} variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Config
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {conversations.map((conversation, index) => (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="border border-nexsaas-light-gray dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="flex items-center mr-3">
                          {conversation.isBot ? (
                            <Bot className="w-5 h-5 text-blue-500 mr-2" />
                          ) : (
                            <User className="w-5 h-5 text-green-500 mr-2" />
                          )}
                          <h3 className="font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                            {conversation.customer}
                          </h3>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(conversation.status)}`}>
                          {getStatusIcon(conversation.status)}
                          <span className="ml-1">{conversation.status}</span>
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-nexsaas-vanta-black dark:text-gray-300">
                        {getChannelIcon(conversation.channel)}
                        <span className="ml-1">{conversation.channel}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300 mb-2">
                      {conversation.lastMessage}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{conversation.lastActivity}</span>
                      <span>{conversation.isBot ? 'Bot' : 'Humain'}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Bot Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card>
              <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-6">
                Réponses Automatiques
              </h2>

              <div className="space-y-4 mb-6">
                {botResponses.map((response, index) => (
                  <motion.div
                    key={response.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="border border-nexsaas-light-gray dark:border-gray-700 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                        {response.trigger}
                      </span>
                      <span className="text-xs text-nexsaas-saas-green">
                        {response.usage} utilisations
                      </span>
                    </div>
                    <p className="text-xs text-nexsaas-vanta-black dark:text-gray-300 mb-1">
                      {response.response}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {response.category}
                    </span>
                  </motion.div>
                ))}
              </div>

              <Button className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une réponse
              </Button>
            </Card>

            {/* Quick Response */}
            <Card className="mt-6">
              <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-4">
                Réponse Rapide
              </h3>
              <div className="space-y-4">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={3}
                  placeholder="Tapez votre message..."
                  className="w-full px-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none resize-none"
                />
                <Button className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Configuration Modal */}
        {showConfigModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowConfigModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-nexsaas-pure-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-6">
                Configuration du Support IA
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-4">
                    Intégrations
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg">
                      <div className="flex items-center">
                        <Phone className="w-5 h-5 text-green-500 mr-3" />
                        <div>
                          <h4 className="font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                            WhatsApp Business
                          </h4>
                          <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                            Connecté
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Configurer
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg">
                      <div className="flex items-center">
                        <MessageCircle className="w-5 h-5 text-blue-500 mr-3" />
                        <div>
                          <h4 className="font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                            Facebook Messenger
                          </h4>
                          <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                            Non connecté
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Connecter
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-4">
                    Paramètres IA
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                        Seuil de confiance (%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        defaultValue="80"
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-nexsaas-vanta-black dark:text-gray-300 mt-1">
                        <span>0%</span>
                        <span>80%</span>
                        <span>100%</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="mr-2 rounded border-nexsaas-light-gray focus:ring-nexsaas-saas-green"
                        />
                        <span className="text-sm text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                          Escalade automatique vers un humain
                        </span>
                      </label>
                    </div>
                    
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="mr-2 rounded border-nexsaas-light-gray focus:ring-nexsaas-saas-green"
                        />
                        <span className="text-sm text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                          Apprentissage automatique
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 mt-8">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowConfigModal(false)}
                >
                  Annuler
                </Button>
                <Button>
                  Sauvegarder
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SupportPage;