import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  MessageCircle, Search, ArrowLeft, Bot, User, Settings, BarChart3,
  CheckCircle, Clock, AlertCircle, Send, Phone, Mail, Zap, X,
  ArrowUpRight, MessageSquare, Star, Globe,
  RefreshCw, Brain, Database, Shield, Info
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { notificationApi, NotificationResponse } from '../../api/notificationApi';

interface Message {
  id: string;
  sender: 'bot' | 'user' | 'agent';
  text: string;
  time: string;
}

const kbTopics = [
  { topic: 'Suivi commandes', count: 145, icon: '📦' },
  { topic: 'Retours & remboursements', count: 89, icon: '↩️' },
  { topic: 'Produits Forever', count: 234, icon: '🌿' },
  { topic: 'Paiements Mobile Money', count: 67, icon: '💳' },
  { topic: 'Livraison & délais', count: 112, icon: '🚚' },
  { topic: 'Programme fidélité', count: 78, icon: '⭐' },
];

const notifTypeToStatus = (type: string) => {
  if (type === 'error') return 'escalated';
  if (type === 'warning') return 'pending';
  if (type === 'success') return 'resolved';
  return 'active';
};

const notifTypeIcon = (type: string) => {
  if (type === 'error') return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
  if (type === 'warning') return <AlertCircle className="w-3.5 h-3.5 text-yellow-500" />;
  if (type === 'success') return <CheckCircle className="w-3.5 h-3.5 text-green-500" />;
  return <Info className="w-3.5 h-3.5 text-blue-500" />;
};

const SupportPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeNotif, setActiveNotif] = useState<NotificationResponse | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'bot', text: 'Bonjour ! Je suis l\'assistant IA FOREVER Distribution. Comment puis-je vous aider aujourd\'hui ? 😊', time: '14:30' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'conversations' | 'analytics' | 'knowledge'>('conversations');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationApi.getNotifications({ limit: 20 });
      setNotifications(res.data || []);
      setUnreadCount(res.unreadCount ?? 0);
      if (res.data && res.data.length > 0 && !activeNotif) {
        setActiveNotif(res.data[0]);
        setMessages([
          { id: '1', sender: 'bot', text: 'Bonjour ! Je suis l\'assistant IA FOREVER Distribution. Comment puis-je vous aider aujourd\'hui ? 😊', time: '14:30' },
          { id: '2', sender: 'bot', text: `📋 Notification récente : ${res.data[0].title}\n\n${res.data[0].message}`, time: new Date(res.data[0].createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) },
        ]);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleSelectNotif = async (notif: NotificationResponse) => {
    setActiveNotif(notif);
    setMessages([
      { id: '1', sender: 'bot', text: 'Bonjour ! Je suis l\'assistant IA FOREVER Distribution. Comment puis-je vous aider aujourd\'hui ? 😊', time: '14:30' },
      { id: notif.id, sender: 'bot', text: `📋 ${notif.title}\n\n${notif.message}`, time: new Date(notif.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) },
    ]);
    if (!notif.isRead) {
      try {
        await notificationApi.markAsRead(notif.id);
        setNotifications((prev) => prev.map((n) => n.id === notif.id ? { ...n, isRead: true } : n));
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // ignore
      }
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const msg: Message = {
      id: Date.now().toString(),
      sender: 'agent',
      text: newMessage,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([...messages, msg]);
    setNewMessage('');
    setTimeout(() => {
      const botReply: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'Message reçu. Je traite votre demande...',
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botReply]);
    }, 1000);
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
      resolved: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
      escalated: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    };
    const labels: Record<string, string> = {
      active: 'En cours', resolved: 'Résolu', pending: 'En attente', escalated: 'Urgent'
    };
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status] || map.pending}`}>{labels[status] || status}</span>;
  };

  const filtered = notifications.filter((n) =>
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-nexsaas-pure-white to-nexsaas-light-gray dark:from-nexsaas-vanta-black dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <Link to="/dashboard" className="mr-4">
                <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Retour</Button>
              </Link>
              <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl mr-4 shadow-lg">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-nexsaas-deep-blue dark:text-white">Agent IA Support Client</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Assistance automatisée • Notifications système</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-full text-xs font-medium border border-green-200 dark:border-green-800">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Agent IA en ligne
              </div>
              <Button variant="outline" size="sm" onClick={fetchNotifications} disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Notifications', value: loading ? '...' : String(notifications.length), sub: 'Système & alertes', icon: MessageSquare, color: 'from-pink-500 to-rose-500' },
            { label: 'Non lues', value: loading ? '...' : String(unreadCount), sub: 'En attente de lecture', icon: Zap, color: 'from-orange-400 to-red-500' },
            { label: 'Résolution IA', value: '89%', sub: 'Automatique', icon: Clock, color: 'from-blue-500 to-blue-600' },
            { label: 'Satisfaction', value: '4.8/5', sub: '⭐⭐⭐⭐⭐', icon: Star, color: 'from-yellow-400 to-orange-500' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
              <Card>
                <div className={`h-1 w-full bg-gradient-to-r ${stat.color} -mt-6 -mx-6 mb-4`} style={{ marginTop: '-1.5rem', marginLeft: '-1.5rem', width: 'calc(100% + 3rem)' }} />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                    <h3 className="text-xl font-bold text-nexsaas-deep-blue dark:text-white">{stat.value}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
                  </div>
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-nexsaas-light-gray dark:bg-gray-800 p-1 rounded-xl w-fit mb-6">
          {[
            { id: 'conversations', label: 'Notifications', icon: MessageCircle },
            { id: 'analytics', label: 'Métriques', icon: BarChart3 },
            { id: 'knowledge', label: 'Base de connaissances', icon: Brain },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-nexsaas-deep-blue dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-nexsaas-deep-blue dark:hover:text-white'
              }`}>
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'conversations' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Notifications list */}
            <Card className="lg:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-nexsaas-deep-blue dark:text-white">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="text-xs bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400 px-2 py-0.5 rounded-full font-medium">
                    {unreadCount} nouvelles
                  </span>
                )}
              </div>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-white focus:ring-2 focus:ring-pink-400 focus:outline-none" />
              </div>
              {loading && <div className="text-center py-8 text-gray-400 text-sm">Chargement...</div>}
              {!loading && filtered.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">Aucune notification</div>
              )}
              <div className="space-y-2 overflow-y-auto max-h-[480px]">
                {filtered.map((notif) => {
                  const status = notifTypeToStatus(notif.type);
                  return (
                    <button key={notif.id} onClick={() => handleSelectNotif(notif)}
                      className={`w-full text-left p-3 rounded-xl transition-all border ${
                        activeNotif?.id === notif.id
                          ? 'bg-pink-50 dark:bg-pink-900/10 border-pink-200 dark:border-pink-800'
                          : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                          notif.type === 'error' ? 'bg-red-100' : notif.type === 'warning' ? 'bg-yellow-100' : notif.type === 'success' ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          {notifTypeIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className={`text-sm font-semibold truncate ${notif.isRead ? 'text-gray-500 dark:text-gray-400' : 'text-nexsaas-deep-blue dark:text-white'}`}>{notif.title}</p>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {!notif.isRead && <span className="w-2 h-2 bg-pink-500 rounded-full" />}
                              <span className="text-xs text-gray-400">{new Date(notif.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 truncate">{notif.message}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {notif.module && <span className="text-xs text-gray-400">{notif.module}</span>}
                            {statusBadge(status)}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Chat window */}
            <Card className="lg:col-span-2 flex flex-col" style={{ minHeight: '520px' }}>
              <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-nexsaas-deep-blue dark:text-white">
                      {activeNotif ? activeNotif.title : 'Agent IA FOREVER'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      {activeNotif && <span>{activeNotif.module ?? 'Système'}</span>}
                      {activeNotif && statusBadge(notifTypeToStatus(activeNotif.type))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm"><Phone className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={fetchNotifications}><RefreshCw className="w-4 h-4" /></Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-72">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.sender === 'bot' ? 'bg-gradient-to-br from-pink-400 to-rose-500'
                        : msg.sender === 'agent' ? 'bg-gradient-to-br from-nexsaas-deep-blue to-blue-500'
                        : 'bg-gray-200 dark:bg-gray-600'
                    }`}>
                      {msg.sender === 'bot' ? <Bot className="w-4 h-4 text-white" /> :
                        <User className="w-4 h-4 text-white" />}
                    </div>
                    <div className={`max-w-xs lg:max-w-sm ${msg.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                        msg.sender === 'user'
                          ? 'bg-nexsaas-deep-blue text-white rounded-tr-sm'
                          : msg.sender === 'agent'
                          ? 'bg-blue-500 text-white rounded-tl-sm'
                          : 'bg-gray-100 dark:bg-gray-700 text-nexsaas-deep-blue dark:text-white rounded-tl-sm'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-xs text-gray-400 mt-1 px-1">{msg.time}</span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Écrire un message..."
                  className="flex-1 px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-white focus:ring-2 focus:ring-pink-400 focus:outline-none" />
                <Button onClick={sendMessage} className="px-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'analytics' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h2 className="text-lg font-bold text-nexsaas-deep-blue dark:text-white mb-4">Types de Notifications</h2>
                <div className="space-y-4">
                  {[
                    { type: 'info',    label: 'Informations', icon: '📋', count: notifications.filter(n => n.type === 'info').length,    color: '#223B7B' },
                    { type: 'success', label: 'Succès',       icon: '✅', count: notifications.filter(n => n.type === 'success').length, color: '#34C759' },
                    { type: 'warning', label: 'Avertissements',icon: '⚠️',count: notifications.filter(n => n.type === 'warning').length, color: '#FF9500' },
                    { type: 'error',   label: 'Erreurs',      icon: '🚨', count: notifications.filter(n => n.type === 'error').length,   color: '#FF2D55' },
                    { type: 'system',  label: 'Système',      icon: '⚙️', count: notifications.filter(n => n.type === 'system').length,  color: '#5856D6' },
                  ].map((c) => {
                    const max = Math.max(notifications.length, 1);
                    return (
                      <div key={c.type}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center gap-2"><span>{c.icon}</span><span className="font-medium text-nexsaas-deep-blue dark:text-white">{c.label}</span></span>
                          <span className="text-gray-500">{c.count} notif.</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="h-2 rounded-full" style={{ width: `${(c.count / max) * 100}%`, backgroundColor: c.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card>
                <h2 className="text-lg font-bold text-nexsaas-deep-blue dark:text-white mb-4">Performance IA</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Taux résolution automatique', value: 89, color: '#34C759' },
                    { label: 'Satisfaction clients', value: 96, color: '#223B7B' },
                    { label: 'Escalades humaines évitées', value: 78, color: '#FF9500' },
                    { label: 'Réponses < 30 secondes', value: 94, color: '#5856D6' },
                  ].map((m) => (
                    <div key={m.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-nexsaas-deep-blue dark:text-white font-medium">{m.label}</span>
                        <span className="font-bold" style={{ color: m.color }}>{m.value}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div className="h-2.5 rounded-full transition-all" style={{ width: `${m.value}%`, backgroundColor: m.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === 'knowledge' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-nexsaas-deep-blue dark:text-white">Base de Connaissances</h2>
                    <Button size="sm"><Brain className="w-4 h-4 mr-1" />Ajouter</Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {kbTopics.map((topic, i) => (
                      <motion.div key={topic.topic} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-pink-300 dark:hover:border-pink-700 hover:bg-pink-50/50 dark:hover:bg-pink-900/10 transition-colors cursor-pointer group">
                        <div className="text-2xl mb-2">{topic.icon}</div>
                        <p className="text-sm font-medium text-nexsaas-deep-blue dark:text-white leading-tight group-hover:text-pink-600 transition-colors">{topic.topic}</p>
                        <p className="text-xs text-gray-400 mt-1">{topic.count} articles</p>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </div>

              <Card>
                <h2 className="text-lg font-bold text-nexsaas-deep-blue dark:text-white mb-4">Capacités IA</h2>
                <div className="space-y-3">
                  {[
                    { label: 'Détection d\'intention', desc: 'Comprend les demandes', icon: Brain, active: true },
                    { label: 'Suivi commandes', desc: 'Via API ERP', icon: Database, active: true },
                    { label: 'Info produits', desc: 'Catalogue Forever', icon: Shield, active: true },
                    { label: 'Escalade intelligente', desc: 'Vers agent humain', icon: ArrowUpRight, active: true },
                    { label: 'Multi-langue', desc: 'FR, EN, Wolof', icon: Globe, active: false },
                  ].map((cap) => (
                    <div key={cap.label} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className={`p-1.5 rounded-lg ${cap.active ? 'bg-pink-100 dark:bg-pink-900/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                        <cap.icon className={`w-4 h-4 ${cap.active ? 'text-pink-500' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-nexsaas-deep-blue dark:text-white">{cap.label}</p>
                        <p className="text-xs text-gray-400">{cap.desc}</p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${cap.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SupportPage;
