import { useState, useEffect } from "react";
import {
    loginClient,
    LoginClientDto,
    registerClient,
    RegisterClientDto,
} from "../api/authApi";
import { useNavigate } from "react-router-dom";
import { useToast } from "../contexts/ToastContext";
import { useActivity } from "../contexts/ActivityContext";

interface User {
    id: string;
    prenom: string;
    nom: string;
    email: string;
    type: "particulier" | "entreprise";
    companyName?: string;
    createdAt: string;
}

interface Activity {
    type: string;
    module: string;
    description: string;
    userId: string;
    metadata?: { email: string; type?: string; companyName?: string };
}


export const useAuth = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { logActivity } = useActivity();

    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        // Restore session from localStorage
        const savedUser = localStorage.getItem("nexsaas_user");
        const savedToken = localStorage.getItem("token");
        if (savedUser && savedToken) {
            try {
                setUser(JSON.parse(savedUser));
                setToken(savedToken);
            } catch (err) {
                console.error("Failed to parse saved user:", err);
                localStorage.removeItem("nexsaas_user");
                localStorage.removeItem("token");
            }
        }
        setLoading(false);
    }, []);

    const register = async (formData: RegisterClientDto) => {
        setLoading(true);
        setError(null);
        try {
            const res = await registerClient(formData);
            const userData: User = {
                id: res.id || `new-user-${Date.now()}`, // Fallback ID
                prenom: formData.prenom,
                nom: formData.nom,
                email: formData.email,
                type: formData.type,
                companyName: formData.companyName,
                createdAt: res.createdAt || new Date().toISOString(),
            };
            setUser(userData);
            setToken(res.token);
            localStorage.setItem("nexsaas_user", JSON.stringify(userData));
            localStorage.setItem("token", res.token);
            showToast({
                type: "success",
                title: "Inscription réussie",
                message: `Bienvenue ${formData.prenom} ! Votre compte a été créé avec succès.`,
                duration: 3000,
            });
            logActivity({
                type: "create",
                module: "Auth",
                description: `Nouveau compte créé pour ${formData.prenom} ${formData.nom}`,
                userId: userData.id,
                metadata: {
                    email: formData.email,
                    type: formData.type,
                    companyName: formData.companyName,
                },
            });
            if (!res.docsValides) {
                navigate("/documents-requis");
            } else if (!res.verified) {
                navigate("/compte-en-attente");
            } else if (!res.actif) {
                showToast({
                    type: "warning",
                    title: "Compte suspendu",
                    message: "Votre compte a été suspendu",
                    duration: 5000,
                });
            } else {
                navigate("/dashboard");
            }
            return res;
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message || "Erreur inconnue";
            const statusCode = err.response?.data?.statusCode;

            if (
                statusCode === 400 &&
                errorMessage ===
                    "Demande déjà envoyée, un administrateur vous contactera"
            ) {
                showToast({
                    type: "warning",
                    title: "Inscription en attente",
                    message: errorMessage,
                    duration: 5000,
                });
                navigate("/compte-en-attente");
            } else {
                showToast({
                    type: "error",
                    title: "Erreur d'inscription",
                    message: errorMessage,
                    duration: 5000,
                });
            }
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const login = async (formData: LoginClientDto) => {
        setLoading(true);
        setError(null);
        try {
            const res = await loginClient(formData);
            const userData: User = {
                id: res.user?.id || `user-${Date.now()}`, // Fallback ID
                prenom: res.user?.prenom || "Utilisateur",
                nom: res.user?.nom || "",
                email: res.user?.email || formData.email,
                type: res.user?.type || "particulier",
                companyName: res.user?.nomEntreprise,
                createdAt: res.user?.createdAt || new Date().toISOString(),
            };
            setUser(userData);
            setToken(res.token);
            localStorage.setItem("nexsaas_user", JSON.stringify(userData));
            localStorage.setItem("token", res.token);
            showToast({
                type: "success",
                title: "Connexion réussie",
                message: `Bienvenue ${userData.prenom} !`,
                duration: 3000,
            });
            logActivity({
                type: "login",
                module: "Auth",
                description: `Connexion réussie pour ${userData.prenom} ${userData.nom}`,
                userId: userData.id,
                metadata: { email: formData.email },
            });
            if (!res.docsValides) {
                navigate("/documents-requis");
            } else if (!res.verified) {
                navigate("/compte-en-attente");
            } else if (!res.actif) {
                showToast({
                    type: "warning",
                    title: "Compte suspendu",
                    message: "Votre compte a été suspendu",
                    duration: 5000,
                });
            } else {
                navigate("/dashboard");
            }
            return res;
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message ||
                "Email ou mot de passe incorrect";
            const statusCode = err.response?.data?.statusCode;

            if (
                statusCode === 400 &&
                errorMessage ===
                    "Demande déjà envoyée, un administrateur vous contactera"
            ) {
                showToast({
                    type: "warning",
                    title: "Connexion en attente",
                    message: errorMessage,
                    duration: 5000,
                });
                navigate("/compte-en-attente");
            } else {
                showToast({
                    type: "error",
                    title: "Erreur de connexion",
                    message: errorMessage,
                    duration: 5000,
                });
            }
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        if (user) {
            logActivity({
                type: "logout",
                module: "Auth",
                description: `Déconnexion de ${user.prenom} ${user.nom}`,
                userId: user.id,
                metadata: { email: user.email },
            });
            showToast({
                type: "info",
                title: "Déconnexion",
                message: "À bientôt !",
                duration: 3000,
            });
        }
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("nexsaas_user");

        navigate("/login-client");
    };

    return { register, login, logout, loading, error, user, token };
};
