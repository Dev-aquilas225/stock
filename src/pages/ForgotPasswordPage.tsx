import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import Card from '../components/UI/Card';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';
import { useToast } from '../contexts/ToastContext';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Veuillez saisir votre adresse email');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSubmitted(true);
      showToast({
        type: 'success',
        title: 'Email envoyé',
        message: 'Un lien de réinitialisation a été envoyé à votre adresse email'
      });
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-nexsaas-pure-white to-nexsaas-light-gray dark:from-nexsaas-vanta-black dark:to-gray-900 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Card className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-4 bg-green-500/10 rounded-full inline-block mb-6"
            >
              <CheckCircle className="w-16 h-16 text-green-500" />
            </motion.div>
            
            <h1 className="text-2xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-4">
              Email envoyé !
            </h1>
            
            <p className="text-nexsaas-vanta-black dark:text-gray-300 mb-6">
              Nous avons envoyé un lien de réinitialisation à <strong>{email}</strong>. 
              Vérifiez votre boîte de réception et suivez les instructions.
            </p>
            
            <div className="space-y-4">
              <Link to="/login-client">
                <Button className="w-full">
                  Retour à la connexion
                </Button>
              </Link>
              
              <button
                onClick={() => setIsSubmitted(false)}
                className="w-full text-sm text-nexsaas-saas-green hover:text-green-600 font-medium"
              >
                Renvoyer l'email
              </button>
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
          <h1 className="text-3xl font-bold text-nexsaas-deep-blue dark:text-nexsaas-pure-white mb-2">
            Mot de passe oublié
          </h1>
          <p className="text-nexsaas-vanta-black dark:text-gray-300">
            Saisissez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700 dark:text-red-400 text-sm">{error}</span>
              </motion.div>
            )}

            <Input
              label="Adresse email"
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={setEmail}
              icon={Mail}
              required
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              Envoyer le lien de réinitialisation
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login-client"
              className="inline-flex items-center text-nexsaas-saas-green hover:text-green-600 font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à la connexion
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;