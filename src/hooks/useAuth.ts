import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../contexts/ToastContext";
import { useActivity } from "../contexts/ActivityContext";
import { loginClient, LoginClientDto, registerClient, RegisterClientDto, AuthResponse } from "../api/authApi";
import { getProfile, User } from "../api/profileApi";

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
    const [displayUser, setDisplayUser] = useState<Partial<User> | null>(null);
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { logActivity } = useActivity();

    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const savedUser = localStorage.getItem("nexsaas_user");
        const savedDisplayUser = localStorage.getItem("nexsaas_display_user");
        const savedToken = localStorage.getItem("token");
        if (savedUser && savedToken) {
            try {
<<<<<<< HEAD
                setUser(JSON.parse(savedUser));
                setToken(savedToken);
=======
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
                setDisplayUser({
                    nom: parsedUser.nom,
                    prenom: parsedUser.prenom,
                    profilePicture: parsedUser.profilePicture,
                });
>>>>>>> 3569d2a4643364fdda5b23cd0cd873b40931c7c0
            } catch (err) {
                console.error("Failed to parse saved user:", err);
                localStorage.removeItem("nexsaas_user");
                localStorage.removeItem("nexsaas_display_user");
                localStorage.removeItem("token");
            }
        } else if (savedDisplayUser) {
            try {
                setDisplayUser(JSON.parse(savedDisplayUser));
            } catch (err) {
                console.error("Failed to parse saved display user:", err);
                localStorage.removeItem("nexsaas_display_user");
            }
        }
        setLoading(false);
    }, []);

<<<<<<< HEAD
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

=======
>>>>>>> 3569d2a4643364fdda5b23cd0cd873b40931c7c0
    const login = async (formData: LoginClientDto) => {
        setLoading(true);
        setError(null);
        try {
            const res = await loginClient(formData);
<<<<<<< HEAD
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
=======
            if (!res.token) {
                throw new Error("No token received from login");
            }
>>>>>>> 3569d2a4643364fdda5b23cd0cd873b40931c7c0
            localStorage.setItem("token", res.token);

            // Fetch full profile
            const profile = await getProfile();
            console.log("getProfile response:", profile);

            const userData: User = {
                id: profile.id || res.user?.id || res.id || `user-${Date.now()}`,
                nom: profile.nom || res.user?.nom || res.nom || res.user?.firstName || res.firstName || "Utilisateur",
                prenom: profile.prenom || res.user?.prenom || res.prenom || res.user?.lastName || res.lastName || "",
                email: profile.email || res.user?.email || res.email || formData.email,
                type: profile.type || res.user?.type || res.type || "particulier",
                role: profile.role || res.user?.role || res.role || "client",
                actif: profile.actif ?? res.user?.actif ?? res.actif ?? true,
                createdAt: new Date(profile.createdAt || res.user?.createdAt || res.createdAt || Date.now()),
                companyName: profile.companyName || res.user?.nomEntreprise || res.user?.companyName || res.nomEntreprise || res.companyName || "",
                profilePicture: profile.profilePicture || res.user?.profilePicture || res.profilePicture || "",
                phone: profile.phone || res.user?.phone || res.phone || "",
                address: profile.address || res.user?.address || res.address || "",
                description: profile.description || res.user?.description || res.description || "",
                nif: profile.nif || res.user?.nif || res.nif || "",
            };

            setUser(userData);
            setDisplayUser({
                nom: userData.nom,
                prenom: userData.prenom,
                profilePicture: userData.profilePicture,
            });
            localStorage.setItem("nexsaas_user", JSON.stringify(userData));
            localStorage.setItem("nexsaas_display_user", JSON.stringify({
                nom: userData.nom,
                prenom: userData.prenom,
                profilePicture: userData.profilePicture,
            }));

            // Use saved display user for greeting if available
            const savedDisplayUser = localStorage.getItem("nexsaas_display_user");
            const greetingName = savedDisplayUser
                ? `${JSON.parse(savedDisplayUser).nom || userData.nom} ${JSON.parse(savedDisplayUser).prenom || userData.prenom}`.trim()
                : `${userData.nom} ${userData.prenom}`.trim();

            showToast({
                type: "success",
                title: "Connexion réussie",
                message: `Bienvenue ${greetingName} !`,
                duration: 3000,
            });

            logActivity({
                type: "login",
                module: "Auth",
                description: `Connexion réussie pour ${userData.nom} ${userData.prenom}`,
                userId: userData.id,
                metadata: { email: formData.email },
            });

            // Navigation logic based on response flags
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
            const errorMessage = err.response?.data?.message || err.message || "Email ou mot de passe incorrect";
            const statusCode = err.response?.data?.statusCode;

            if (statusCode === 400 && errorMessage === "Demande déjà envoyée, un administrateur vous contactera") {
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

    const register = async (formData: RegisterClientDto) => {
        setLoading(true);
        setError(null);
        try {
            const res = await registerClient(formData);
            let userData: User;

            if (res.token) {
                localStorage.setItem("token", res.token);
                const profile = await getProfile();
                console.log("getProfile response:", profile);

                userData = {
                    id: profile.id || res.id || `new-user-${Date.now()}`,
                    nom: profile.nom || res.nom || res.firstName || formData.nom,
                    prenom: profile.prenom || res.prenom || res.lastName || formData.prenom,
                    email: profile.email || res.email || formData.email,
                    type: profile.type || res.type || formData.type,
                    role: profile.role || res.role || "client",
                    actif: profile.actif ?? res.actif ?? true,
                    createdAt: new Date(profile.createdAt || res.createdAt || Date.now()),
                    companyName: profile.companyName || res.nomEntreprise || res.companyName || formData.companyName || "",
                    profilePicture: profile.profilePicture || res.profilePicture || "",
                    phone: profile.phone || res.phone || "",
                    address: profile.address || res.address || "",
                    description: profile.description || res.description || formData.description || "",
                    nif: profile.nif || res.nif || formData.nif || "",
                };
            } else {
                userData = {
                    id: res.id || `new-user-${Date.now()}`,
                    nom: res.nom || res.firstName || formData.nom,
                    prenom: res.prenom || res.lastName || formData.prenom,
                    email: res.email || formData.email,
                    type: res.type || formData.type,
                    role: res.role || "client",
                    actif: res.actif ?? true,
                    createdAt: new Date(res.createdAt || Date.now()),
                    companyName: res.nomEntreprise || res.companyName || formData.companyName || "",
                    profilePicture: res.profilePicture || "",
                    phone: res.phone || "",
                    address: res.address || "",
                    description: res.description || formData.description || "",
                    nif: res.nif || formData.nif || "",
                };
            }

            setUser(userData);
            setDisplayUser({
                nom: userData.nom,
                prenom: userData.prenom,
                profilePicture: userData.profilePicture,
            });
            localStorage.setItem("nexsaas_user", JSON.stringify(userData));
            localStorage.setItem("nexsaas_display_user", JSON.stringify({
                nom: userData.nom,
                prenom: userData.prenom,
                profilePicture: userData.profilePicture,
            }));

            // Use saved display user for greeting if available
            const savedDisplayUser = localStorage.getItem("nexsaas_display_user");
            const greetingName = savedDisplayUser
                ? `${JSON.parse(savedDisplayUser).nom || userData.nom} ${JSON.parse(savedDisplayUser).prenom || userData.prenom}`.trim()
                : `${userData.nom} ${userData.prenom}`.trim();

            showToast({
                type: "success",
                title: "Inscription réussie",
                message: `Bienvenue ${greetingName} ! Votre compte a été créé avec succès.`,
                duration: 3000,
            });

            logActivity({
                type: "create",
                module: "Auth",
                description: `Nouveau compte créé pour ${userData.nom} ${userData.prenom}`,
                userId: userData.id,
                metadata: {
                    email: formData.email,
                    type: formData.type,
                    companyName: formData.companyName,
                },
            });

            // Navigation logic based on response flags
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
            const errorMessage = err.response?.data?.message || "Erreur inconnue";
            const statusCode = err.response?.data?.statusCode;

            if (statusCode === 400 && errorMessage === "Demande déjà envoyée, un administrateur vous contactera") {
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

    const logout = () => {
        if (user) {
            logActivity({
                type: "logout",
                module: "Auth",
                description: `Déconnexion de ${user.nom} ${user.prenom}`,
                userId: user.id,
                metadata: { email: user.email },
            });
            showToast({
                type: "info",
                title: "Déconnexion",
                message: "À bientôt !",
                duration: 3000,
            });

            // Preserve non-sensitive data
            setDisplayUser({
                nom: user.nom,
                prenom: user.prenom, // Fixed from userData.prenom
                profilePicture: user.profilePicture,
            });
            localStorage.setItem("nexsaas_display_user", JSON.stringify({
                nom: user.nom,
                prenom: user.prenom, // Fixed from userData.prenom
                profilePicture: user.profilePicture,
            }));
        }

        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("nexsaas_user");
        navigate("/login-client");
    };

<<<<<<< HEAD
    return { register, login, logout, loading, error, user, token };
};
=======
    return { register, login, logout, loading, error, user, displayUser };
};
>>>>>>> 3569d2a4643364fdda5b23cd0cd873b40931c7c0
