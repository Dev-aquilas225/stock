import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth"
import Card from "../components/UI/Card";
import Input from "../components/UI/Input";
import Button from "../components/UI/Button";

const LoginPage: React.FC = () => {
    const [formData, setFormData] = useState({
        email: "",
        motDePasse: "",
        role: "client"
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { login, loading, error } = useAuth();

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email) newErrors.email = "Email requis";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Email invalide";
        }
        if (!formData.motDePasse) newErrors.motDePasse = "Mot de passe requis";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        await login(formData);
    };

    const updateFormData = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

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
                        Connexion Client
                    </h1>
                    <p className="text-nexsaas-vanta-black dark:text-gray-300">
                        Accédez à votre espace NexSaaS
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
                                <span className="text-red-700 dark:text-red-400 text-sm">
                                    {error}
                                </span>
                            </motion.div>
                        )}

                        <Input
                            label="Email"
                            type="email"
                            placeholder="votre@email.com"
                            value={formData.email}
                            onChange={(value) => updateFormData("email", value)}
                            icon={Mail}
                            error={errors.email}
                            required
                        />

                        <Input
                            label="Mot de passe"
                            type="password"
                            placeholder="••••••••"
                            value={formData.motDePasse}
                            onChange={(value) =>
                                updateFormData("motDePasse", value)
                            }
                            icon={Lock}
                            error={errors.motDePasse}
                            required
                        />

                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="mr-2 rounded border-nexsaas-light-gray focus:ring-nexsaas-saas-green"
                                />
                                <span className="text-sm text-nexsaas-vanta-black dark:text-gray-300">
                                    Se souvenir de moi
                                </span>
                            </label>
                            <Link
                                to="/mot-de-passe-oublie"
                                className="text-sm text-nexsaas-saas-green hover:text-green-600 font-medium"
                            >
                                Mot de passe oublié ?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            loading={loading}
                            className="w-full"
                            size="lg"
                        >
                            Se connecter
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-nexsaas-vanta-black dark:text-gray-300">
                            Pas encore de compte ?{" "}
                            <Link
                                to="/inscription"
                                className="text-nexsaas-saas-green hover:text-green-600 font-medium"
                            >
                                S'inscrire
                            </Link>
                        </p>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};

export default LoginPage;
