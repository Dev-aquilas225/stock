import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  User, 
  Lock, 
  ArrowLeft, 
  Save, 
  Eye, 
  EyeOff,
  Building,
  Phone,
  MapPin,
  Calendar,
  Shield,
  CheckCircle,
  AlertCircle,
  Camera,
  Edit
} from 'lucide-react';
import Card from '../components/UI/Card';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useActivity } from '../contexts/ActivityContext';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { logActivity } = useActivity();

  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'security'>('profile');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: user?.nom || '',
    lastName: user?.prenom || '',
    phone: '',
    address: '',
    companyName: user?.companyName || '',
    nif: '',
    bio: ''
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateProfileForm = () => {
    const newErrors: Record<string, string> = {};

    if (!profileForm.firstName) newErrors.firstName = 'Prénom requis';
    if (!profileForm.lastName) newErrors.lastName = 'Nom requis';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {};

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Mot de passe actuel requis';
    }
    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'Nouveau mot de passe requis';
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Confirmation requise';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProfileForm()) return;

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      logActivity({
        type: 'update',
        module: 'Profil',
        description: 'Informations du profil mises à jour',
        metadata: { 
          updatedFields: Object.keys(profileForm).filter(key => 
            profileForm[key as keyof typeof profileForm] !== ''
          )
        }
      });

      showToast({
        type: 'success',
        title: 'Profil mis à jour',
        message: 'Vos informations ont été sauvegardées avec succès'
      });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Une erreur est survenue lors de la mise à jour'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      logActivity({
        type: 'update',
        module: 'Sécurité',
        description: 'Mot de passe modifié',
        metadata: { timestamp: new Date().toISOString() }
      });

      showToast({
        type: 'success',
        title: 'Mot de passe modifié',
        message: 'Votre mot de passe a été mis à jour avec succès'
      });

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Une erreur est survenue lors de la modification'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfileForm = (field: string, value: string) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updatePasswordForm = (field: string, value: string) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const tabs = [
    { id: 'profile', label: 'Informations personnelles', icon: User },
    { id: 'password', label: 'Mot de passe', icon: Lock },
    { id: 'security', label: 'Sécurité', icon: Shield }
  ];

  return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-nexsaas-pure-white to-nexsaas-light-gray dark:from-nexsaas-vanta-black dark:to-gray-900">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
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
                      <div className="p-3 bg-nexsaas-deep-blue rounded-lg mr-4">
                          <User className="w-8 h-8 text-white" />
                      </div>
                      <div>
                          <h1 className="text-3xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                              Mon Profil
                          </h1>
                          <p className="text-nexsaas-vanta-black dark:text-gray-300">
                              Gérez vos informations personnelles et paramètres
                              de sécurité
                          </p>
                      </div>
                  </div>
              </motion.div>

              {/* Profile Header Card */}
              <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mb-8"
              >
                  <Card>
                      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                          <div className="relative">
                              <div className="w-24 h-24 bg-nexsaas-deep-blue rounded-full flex items-center justify-center">
                                  <span className="text-2xl font-bold text-white">
                                      {user?.nom?.[0]}
                                      {user?.prenom?.[0]}
                                  </span>
                              </div>
                              <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-nexsaas-saas-green rounded-full flex items-center justify-center text-white hover:bg-green-600 transition-colors">
                                  <Camera className="w-4 h-4" />
                              </button>
                          </div>

                          <div className="flex-1 text-center md:text-left">
                              <h2 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                  {user?.nom} {user?.prenom}
                              </h2>
                              <p className="text-nexsaas-vanta-black dark:text-gray-300 mb-2">
                                  {user?.email}
                              </p>
                              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-nexsaas-deep-blue/10 text-nexsaas-deep-blue dark:bg-nexsaas-saas-green/10 dark:text-nexsaas-saas-green">
                                      {user?.type === "entreprise"
                                          ? "Entreprise"
                                          : "Particulier"}
                                  </span>
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Compte vérifié
                                  </span>
                              </div>
                          </div>

                          <div className="text-center">
                              <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                  Membre depuis
                              </p>
                              <p className="font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                  {user?.createdAt
                                      ? new Date(
                                            user.createdAt,
                                        ).toLocaleDateString("fr-FR")
                                      : "N/A"}
                              </p>
                          </div>
                      </div>
                  </Card>
              </motion.div>

              {/* Tabs */}
              <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="mb-8"
              >
                  <div className="border-b border-nexsaas-light-gray dark:border-gray-700">
                      <nav className="-mb-px flex space-x-8">
                          {tabs.map((tab) => (
                              <button
                                  key={tab.id}
                                  onClick={() => setActiveTab(tab.id as any)}
                                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                      activeTab === tab.id
                                          ? "border-nexsaas-saas-green text-nexsaas-saas-green"
                                          : "border-transparent text-nexsaas-vanta-black dark:text-gray-300 hover:text-nexsaas-deep-blue dark:hover:text-nexsaas-pure-white hover:border-gray-300"
                                  }`}
                              >
                                  <tab.icon className="w-4 h-4 mr-2" />
                                  {tab.label}
                              </button>
                          ))}
                      </nav>
                  </div>
              </motion.div>

              {/* Tab Content */}
              <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
              >
                  {activeTab === "profile" && (
                      <Card>
                          <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-6">
                              Informations personnelles
                          </h2>

                          <form
                              onSubmit={handleProfileSubmit}
                              className="space-y-6"
                          >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <Input
                                      label="Prénom"
                                      value={profileForm.firstName}
                                      onChange={(value) =>
                                          updateProfileForm("firstName", value)
                                      }
                                      icon={User}
                                      error={errors.firstName}
                                      required
                                  />
                                  <Input
                                      label="Nom"
                                      value={profileForm.lastName}
                                      onChange={(value) =>
                                          updateProfileForm("lastName", value)
                                      }
                                      icon={User}
                                      error={errors.lastName}
                                      required
                                  />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <Input
                                      label="Téléphone"
                                      value={profileForm.phone}
                                      onChange={(value) =>
                                          updateProfileForm("phone", value)
                                      }
                                      icon={Phone}
                                      placeholder="+33 1 23 45 67 89"
                                  />
                                  <Input
                                      label="Adresse"
                                      value={profileForm.address}
                                      onChange={(value) =>
                                          updateProfileForm("address", value)
                                      }
                                      icon={MapPin}
                                      placeholder="123 Rue de la Paix, 75001 Paris"
                                  />
                              </div>

                              {user?.type === "entreprise" && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <Input
                                          label="Nom de l'entreprise"
                                          value={profileForm.companyName}
                                          onChange={(value) =>
                                              updateProfileForm(
                                                  "companyName",
                                                  value,
                                              )
                                          }
                                          icon={Building}
                                      />
                                      <Input
                                          label="NIF"
                                          value={profileForm.nif}
                                          onChange={(value) =>
                                              updateProfileForm("nif", value)
                                          }
                                          placeholder="Numéro d'identification fiscale"
                                      />
                                  </div>
                              )}

                              <div>
                                  <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
                                      Bio / Description
                                  </label>
                                  <textarea
                                      value={profileForm.bio}
                                      onChange={(e) =>
                                          updateProfileForm(
                                              "bio",
                                              e.target.value,
                                          )
                                      }
                                      rows={4}
                                      className="w-full px-4 py-3 rounded-lg border border-nexsaas-light-gray dark:border-gray-600 bg-nexsaas-pure-white dark:bg-gray-800 text-nexsaas-deep-blue dark:text-nexsaas-pure-white focus:ring-2 focus:ring-nexsaas-saas-green focus:outline-none"
                                      placeholder="Parlez-nous de vous ou de votre entreprise..."
                                  />
                              </div>

                              <div className="flex justify-end">
                                  <Button type="submit" loading={loading}>
                                      <Save className="w-4 h-4 mr-2" />
                                      Sauvegarder les modifications
                                  </Button>
                              </div>
                          </form>
                      </Card>
                  )}

                  {activeTab === "password" && (
                      <Card>
                          <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-6">
                              Modifier le mot de passe
                          </h2>

                          <form
                              onSubmit={handlePasswordSubmit}
                              className="space-y-6"
                          >
                              <div className="relative">
                                  <Input
                                      label="Mot de passe actuel"
                                      type={
                                          showCurrentPassword
                                              ? "text"
                                              : "password"
                                      }
                                      value={passwordForm.currentPassword}
                                      onChange={(value) =>
                                          updatePasswordForm(
                                              "currentPassword",
                                              value,
                                          )
                                      }
                                      icon={Lock}
                                      error={errors.currentPassword}
                                      required
                                  />
                                  <button
                                      type="button"
                                      onClick={() =>
                                          setShowCurrentPassword(
                                              !showCurrentPassword,
                                          )
                                      }
                                      className="absolute right-3 top-9 text-gray-400 hover:text-nexsaas-deep-blue dark:hover:text-nexsaas-pure-white"
                                  >
                                      {showCurrentPassword ? (
                                          <EyeOff className="w-5 h-5" />
                                      ) : (
                                          <Eye className="w-5 h-5" />
                                      )}
                                  </button>
                              </div>

                              <div className="relative">
                                  <Input
                                      label="Nouveau mot de passe"
                                      type={
                                          showNewPassword ? "text" : "password"
                                      }
                                      value={passwordForm.newPassword}
                                      onChange={(value) =>
                                          updatePasswordForm(
                                              "newPassword",
                                              value,
                                          )
                                      }
                                      icon={Lock}
                                      error={errors.newPassword}
                                      required
                                  />
                                  <button
                                      type="button"
                                      onClick={() =>
                                          setShowNewPassword(!showNewPassword)
                                      }
                                      className="absolute right-3 top-9 text-gray-400 hover:text-nexsaas-deep-blue dark:hover:text-nexsaas-pure-white"
                                  >
                                      {showNewPassword ? (
                                          <EyeOff className="w-5 h-5" />
                                      ) : (
                                          <Eye className="w-5 h-5" />
                                      )}
                                  </button>
                              </div>

                              <div className="relative">
                                  <Input
                                      label="Confirmer le nouveau mot de passe"
                                      type={
                                          showConfirmPassword
                                              ? "text"
                                              : "password"
                                      }
                                      value={passwordForm.confirmPassword}
                                      onChange={(value) =>
                                          updatePasswordForm(
                                              "confirmPassword",
                                              value,
                                          )
                                      }
                                      icon={Lock}
                                      error={errors.confirmPassword}
                                      required
                                  />
                                  <button
                                      type="button"
                                      onClick={() =>
                                          setShowConfirmPassword(
                                              !showConfirmPassword,
                                          )
                                      }
                                      className="absolute right-3 top-9 text-gray-400 hover:text-nexsaas-deep-blue dark:hover:text-nexsaas-pure-white"
                                  >
                                      {showConfirmPassword ? (
                                          <EyeOff className="w-5 h-5" />
                                      ) : (
                                          <Eye className="w-5 h-5" />
                                      )}
                                  </button>
                              </div>

                              {/* Password Requirements */}
                              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">
                                      Exigences du mot de passe :
                                  </h4>
                                  <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                                      <li
                                          className={`flex items-center ${
                                              passwordForm.newPassword.length >=
                                              6
                                                  ? "text-green-600"
                                                  : ""
                                          }`}
                                      >
                                          <CheckCircle
                                              className={`w-3 h-3 mr-2 ${
                                                  passwordForm.newPassword
                                                      .length >= 6
                                                      ? "text-green-500"
                                                      : "text-gray-400"
                                              }`}
                                          />
                                          Au moins 6 caractères
                                      </li>
                                      <li
                                          className={`flex items-center ${
                                              /[A-Z]/.test(
                                                  passwordForm.newPassword,
                                              )
                                                  ? "text-green-600"
                                                  : ""
                                          }`}
                                      >
                                          <CheckCircle
                                              className={`w-3 h-3 mr-2 ${
                                                  /[A-Z]/.test(
                                                      passwordForm.newPassword,
                                                  )
                                                      ? "text-green-500"
                                                      : "text-gray-400"
                                              }`}
                                          />
                                          Une lettre majuscule (recommandé)
                                      </li>
                                      <li
                                          className={`flex items-center ${
                                              /[0-9]/.test(
                                                  passwordForm.newPassword,
                                              )
                                                  ? "text-green-600"
                                                  : ""
                                          }`}
                                      >
                                          <CheckCircle
                                              className={`w-3 h-3 mr-2 ${
                                                  /[0-9]/.test(
                                                      passwordForm.newPassword,
                                                  )
                                                      ? "text-green-500"
                                                      : "text-gray-400"
                                              }`}
                                          />
                                          Un chiffre (recommandé)
                                      </li>
                                  </ul>
                              </div>

                              <div className="flex justify-end">
                                  <Button type="submit" loading={loading}>
                                      <Lock className="w-4 h-4 mr-2" />
                                      Modifier le mot de passe
                                  </Button>
                              </div>
                          </form>
                      </Card>
                  )}

                  {activeTab === "security" && (
                      <div className="space-y-6">
                          <Card>
                              <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-6">
                                  Paramètres de sécurité
                              </h2>

                              <div className="space-y-6">
                                  <div className="flex items-center justify-between p-4 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg">
                                      <div>
                                          <h3 className="font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                              Authentification à deux facteurs
                                          </h3>
                                          <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                              Ajoutez une couche de sécurité
                                              supplémentaire à votre compte
                                          </p>
                                      </div>
                                      <Button variant="outline">Activer</Button>
                                  </div>

                                  <div className="flex items-center justify-between p-4 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg">
                                      <div>
                                          <h3 className="font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                              Sessions actives
                                          </h3>
                                          <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                              Gérez les appareils connectés à
                                              votre compte
                                          </p>
                                      </div>
                                      <Button variant="outline">Gérer</Button>
                                  </div>

                                  <div className="flex items-center justify-between p-4 border border-nexsaas-light-gray dark:border-gray-600 rounded-lg">
                                      <div>
                                          <h3 className="font-semibold text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                              Notifications de sécurité
                                          </h3>
                                          <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                              Recevez des alertes pour les
                                              activités suspectes
                                          </p>
                                      </div>
                                      <Button variant="outline">
                                          Configurer
                                      </Button>
                                  </div>
                              </div>
                          </Card>

                          <Card>
                              <h2 className="text-xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-6">
                                  Activité récente
                              </h2>

                              <div className="space-y-4">
                                  <div className="flex items-center justify-between p-3 bg-nexsaas-light-gray dark:bg-gray-700 rounded-lg">
                                      <div className="flex items-center">
                                          <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                                          <div>
                                              <p className="font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                                  Connexion réussie
                                              </p>
                                              <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                                  Aujourd'hui à 14:30 • Paris,
                                                  France
                                              </p>
                                          </div>
                                      </div>
                                  </div>

                                  <div className="flex items-center justify-between p-3 bg-nexsaas-light-gray dark:bg-gray-700 rounded-lg">
                                      <div className="flex items-center">
                                          <Edit className="w-5 h-5 text-blue-500 mr-3" />
                                          <div>
                                              <p className="font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                                  Profil mis à jour
                                              </p>
                                              <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                                  Hier à 16:45
                                              </p>
                                          </div>
                                      </div>
                                  </div>

                                  <div className="flex items-center justify-between p-3 bg-nexsaas-light-gray dark:bg-gray-700 rounded-lg">
                                      <div className="flex items-center">
                                          <Lock className="w-5 h-5 text-orange-500 mr-3" />
                                          <div>
                                              <p className="font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                                  Mot de passe modifié
                                              </p>
                                              <p className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                                  Il y a 3 jours
                                              </p>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </Card>
                      </div>
                  )}
              </motion.div>
          </div>
      </div>
  );
};

export default ProfilePage;