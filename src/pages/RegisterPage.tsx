import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { User, Mail, Lock, Building, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import Card from "../components/UI/Card";
import Input from "../components/UI/Input";
import Button from "../components/UI/Button";

type TypeUser = "particulier" | "entreprise"; // Matches backend TypeUser enum

const RegisterPage: React.FC = () => {
    const [formData, setFormData] = useState({
        prenom: "",
        nom: "",
        email: "",
        password: "",
        confirmPassword: "",
        type: "particulier" as TypeUser,
        description: "",
        companyName: "",
        nif: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { register, loading, user } = useAuth(); // Removed 'error' since AuthContext doesn't provide it

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.prenom) newErrors.prenom = "Prénom requis";
        if (!formData.nom) newErrors.nom = "Nom requis";
        if (!formData.email) newErrors.email = "Email requis";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Email invalide";
        }
        if (!formData.password) newErrors.password = "Mot de passe requis";
        if (formData.password.length < 6)
            newErrors.password = "Mot de passe trop court (min 6 caractères)";
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword =
                "Les mots de passe ne correspondent pas";
        }
        if (!formData.description)
            newErrors.description = "Description requise";
        if (formData.type === "entreprise" && !formData.companyName) {
            newErrors.companyName = "Nom de l'entreprise requis";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            await register({
                nom: formData.nom,
                prenom: formData.prenom,
                email: formData.email,
                password: formData.password, // Added to match RegisterClientDto
                description: formData.description,
                type: formData.type,
                companyName: formData.companyName || undefined, // Convert empty string to undefined
                nif: formData.nif || undefined, // Convert empty string to undefined
            });
        } catch (err) {
            // Error is handled by AuthProvider via toast notifications
        }
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
                        Inscription
                    </h1>
                    <p className="text-nexsaas-vanta-black dark:text-gray-300">
                        Créez votre compte NexSaaS
                    </p>
                </div>

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Type Selection */}
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                Type de compte *
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        updateFormData("type", "particulier")
                                    }
                                    className={`p-3 rounded-lg border-2 transition-all ${
                                        formData.type === "particulier"
                                            ? "border-nexsaas-saas-green bg-green-50 dark:bg-green-900/20"
                                            : "border-nexsaas-light-gray dark:border-gray-600 hover:border-nexsaas-saas-green"
                                    }`}
                                >
                                    <User className="w-6 h-6 mx-auto mb-2 text-nexsaas-deep-blue dark:text-nexsaas-pure-white" />
                                    <span className="text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                        Particulier
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        updateFormData("type", "entreprise")
                                    }
                                    className={`p-3 rounded-lg border-2 transition-all ${
                                        formData.type === "entreprise"
                                            ? "border-nexsaas-saas-green bg-green-50 dark:bg-green-900/20"
                                            : "border-nexsaas-light-gray dark:border-gray-600 hover:border-nexsaas-saas-green"
                                    }`}
                                >
                                    <Building className="w-6 h-6 mx-auto mb-2 text-nexsaas-deep-blue dark:text-nexsaas-pure-white" />
                                    <span className="text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                        Entreprise
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Prénom"
                                value={formData.prenom}
                                onChange={(value) =>
                                    updateFormData("prenom", value)
                                }
                                error={errors.prenom}
                                required
                            />
                            <Input
                                label="Nom"
                                value={formData.nom}
                                onChange={(value) =>
                                    updateFormData("nom", value)
                                }
                                error={errors.nom}
                                required
                            />
                        </div>

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

                        {formData.type === "entreprise" && (
                            <>
                                <Input
                                    label="Nom de l'entreprise"
                                    value={formData.companyName}
                                    onChange={(value) =>
                                        updateFormData("companyName", value)
                                    }
                                    icon={Building}
                                    error={errors.companyName}
                                    required
                                />
                                <Input
                                    label="RCCM (optionnel)"
                                    value={formData.nif}
                                    onChange={(value) =>
                                        updateFormData("nif", value)
                                    }
                                    placeholder="Numéro registre de commerce"
                                />
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-nexsaas-deep-blue dark:text-nexsaas-pure-white">
                                Description *
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) =>
                                    updateFormData(
                                        "description",
                                        e.target.value,
                                    )
                                }
                                className="mt-1 block w-full rounded-md border-nexsaas-light-gray dark:border-gray-600 bg-white dark:bg-gray-800 text-nexsaas-vanta-black dark:text-nexsaas-pure-white p-2 focus:border-nexsaas-saas-green focus:ring focus:ring-nexsaas-saas-green focus:ring-opacity-50"
                                rows={4}
                                placeholder="Décrivez-vous ou votre entreprise"
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        <Input
                            label="Mot de passe"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(value) =>
                                updateFormData("password", value)
                            }
                            icon={Lock}
                            error={errors.password}
                            required
                        />

                        <Input
                            label="Confirmer le mot de passe"
                            type="password"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={(value) =>
                                updateFormData("confirmPassword", value)
                            }
                            icon={Lock}
                            error={errors.confirmPassword}
                            required
                        />

                        <Button
                            type="submit"
                            loading={loading}
                            className="w-full"
                            size="lg"
                        >
                            S'inscrire
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-nexsaas-vanta-black dark:text-gray-300">
                            Déjà un compte ?{" "}
                            <Link
                                to="/login-client"
                                className="text-nexsaas-saas-green hover:text-green-600 font-medium"
                            >
                                Se connecter
                            </Link>
                        </p>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};

export default RegisterPage;
