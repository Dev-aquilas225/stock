import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Card from '../components/UI/Card';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';
import { useToast } from '../contexts/ToastContext';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = searchParams.get('token');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = 'Mot de passe requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmation requise';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (!token) {
      setErrors({ general: 'Token de réinitialisation invalide ou expiré' });
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showToast({
        type: 'success',
        title: 'Mot de passe réinitialisé',
        message: 'Votre mot de passe a été mis à jour avec succès'
      });
      
      navigate('/login-client');
    } catch (err) {
      setErrors({ general: 'Une erreur est survenue. Veuillez réessayer.' });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-nexsaas-pure-white to-nexsaas-light-gray dark:from-nexsaas-vanta-black dark:to-gray-900 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Card className="text-center">
            <div className="p-4 bg-red-500/10 rounded-full inline-block mb-6">
              <AlertCircle className="w-16 h-16 text-red-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-4">
              Lien invalide
            </h1>
            
            <p className="text-nexsaas-vanta-black dark:text-gray-300 mb-6">
              Ce lien de réinitialisation est invalide ou a expiré. 
              Veuillez demander un nouveau lien.
            </p>
            
            <div className="space-y-4">
              <Link to="/mot-de-passe-oublie">
                <Button className="w-full">
                  Demander un nouveau lien
                </Button>
              </Link>
              
              <Link to="/login-client">
                <Button variant="outline" className="w-full">
                  Retour à la connexion
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-nexsaas-pure-white to-nexsaas-light-gray dark:from-nexsaas-vanta-black dark:to-gray-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="p-4 bg-nexsaas-saas-green/10 rounded-full inline-block mb-4">
            <Lock className="w-12 h-12 text-nexsaas-saas-green" />
          </div>
          <h1 className="text-3xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
            Nouveau mot de passe
          </h1>
          <p className="text-nexsaas-vanta-black dark:text-gray-300">
            Choisissez un nouveau mot de passe sécurisé
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700 dark:text-red-400 text-sm">{errors.general}</span>
              </motion.div>
            )}

            <div className="relative">
              <Input
                label="Nouveau mot de passe"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(value) => updateFormData('password', value)}
                icon={Lock}
                error={errors.password}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-nexsaas-deep-blue dark:hover:text-nexsaas-pure-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirmer le mot de passe"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(value) => updateFormData('confirmPassword', value)}
                icon={Lock}
                error={errors.confirmPassword}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-nexsaas-deep-blue dark:hover:text-nexsaas-pure-white"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Password Requirements */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">
                Exigences du mot de passe :
              </h4>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <li className={`flex items-center ${formData.password.length >= 6 ? 'text-green-600' : ''}`}>
                  <CheckCircle className={`w-3 h-3 mr-2 ${formData.password.length >= 6 ? 'text-green-500' : 'text-gray-400'}`} />
                  Au moins 6 caractères
                </li>
                <li className={`flex items-center ${/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}`}>
                  <CheckCircle className={`w-3 h-3 mr-2 ${/[A-Z]/.test(formData.password) ? 'text-green-500' : 'text-gray-400'}`} />
                  Une lettre majuscule (recommandé)
                </li>
                <li className={`flex items-center ${/[0-9]/.test(formData.password) ? 'text-green-600' : ''}`}>
                  <CheckCircle className={`w-3 h-3 mr-2 ${/[0-9]/.test(formData.password) ? 'text-green-500' : 'text-gray-400'}`} />
                  Un chiffre (recommandé)
                </li>
              </ul>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              Réinitialiser le mot de passe
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login-client"
              className="text-nexsaas-saas-green hover:text-green-600 font-medium"
            >
              Retour à la connexion
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;