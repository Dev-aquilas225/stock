import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../hooks/useProfile"; // Import User from useProfile
import { useToast } from "./ToastContext";
import { useActivity } from "./ActivityContext";
import { RegisterClientDto, LoginClientDto, registerClient, loginClient } from "../api/authApi";

interface AuthContextType {
    user: User | null;
    displayUser: Partial<User> | null; // For non-sensitive data post-logout
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (userData: Omit<User, "id" | "createdAt">) => Promise<void>;
    logout: () => void;
    loading: boolean;
    setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [displayUser, setDisplayUser] = useState<Partial<User> | null>(null); // Persist non-sensitive data
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();
    const { logActivity } = useActivity();

    useEffect(() => {
        const savedUser = localStorage.getItem("nexsaas_user");
        const savedDisplayUser = localStorage.getItem("nexsaas_display_user");
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            // Initialize displayUser from user if available
            setDisplayUser({
                nom: parsedUser.nom,
                prenom: parsedUser.prenom,
                profilePicture: parsedUser.profilePicture,
            });
        } else if (savedDisplayUser) {
            setDisplayUser(JSON.parse(savedDisplayUser));
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string): Promise<void> => {
        setLoading(true);
        try {
            const loginData: LoginClientDto = {
                email,
                motDePasse: password,
                role: "client",
            };

            const response = await loginClient(loginData);
            console.log("loginClient response:", response); // Debug API response

            const newUser: User = {
                id: response.id || Date.now().toString(),
                nom: response.nom || response.firstName || "Utilisateur",
                prenom: response.prenom || response.lastName || "",
                email: response.email || email,
                type: response.type || "client",
                role: response.role || "client",
                actif: response.actif ?? true,
                createdAt: new Date(response.createdAt || Date.now()),
                companyName: response.companyName || "",
                profilePicture: response.profilePicture || "",
                phone: response.phone || "",
                address: response.address || "",
                description: response.description || "",
                nif: response.nif || "",
            };

            setUser(newUser);
            setDisplayUser({
                nom: newUser.nom,
                prenom: newUser.prenom,
                profilePicture: newUser.profilePicture,
            });
            localStorage.setItem("nexsaas_user", JSON.stringify(newUser));
            localStorage.setItem("nexsaas_display_user", JSON.stringify({
                nom: newUser.nom,
                prenom: newUser.prenom,
                profilePicture: newUser.profilePicture,
            }));
            localStorage.setItem("token", response.token);

            logActivity({
                type: "login",
                module: "Auth",
                description: `Connexion réussie pour ${newUser.nom} ${newUser.prenom}`,
                userId: newUser.id,
                metadata: { email },
            });

            showToast({
                type: "success",
                title: "Connexion réussie",
                message: `Bienvenue ${newUser.nom} !`,
            });
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || "Email ou mot de passe incorrect";
            showToast({
                type: "error",
                title: "Erreur de connexion",
                message: errorMessage,
            });
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData: Omit<User, "id" | "createdAt">): Promise<void> => {
        setLoading(true);
        try {
            const registerData: RegisterClientDto = {
                nom: userData.nom,
                prenom: userData.prenom,
                email: userData.email,
                password: userData.password || "",
                description: userData.description || "",
                type: userData.type || "client",
                companyName: userData.companyName || "",
                nif: userData.nif || "",
            };

            const response = await registerClient(registerData);
            console.log("registerClient response:", response); // Debug API response

            const newUser: User = {
                id: response.id || Date.now().toString(),
                nom: response.nom || response.firstName || userData.nom,
                prenom: response.prenom || response.lastName || userData.prenom,
                email: response.email || userData.email,
                type: response.type || userData.type || "client",
                role: response.role || "client",
                actif: response.actif ?? true,
                createdAt: new Date(response.createdAt || Date.now()),
                companyName: response.companyName || userData.companyName || "",
                profilePicture: response.profilePicture || "",
                phone: response.phone || "",
                address: response.address || "",
                description: response.description || "",
                nif: response.nif || "",
            };

            setUser(newUser);
            setDisplayUser({
                nom: newUser.nom,
                prenom: newUser.prenom,
                profilePicture: newUser.profilePicture,
            });
            localStorage.setItem("nexsaas_user", JSON.stringify(newUser));
            localStorage.setItem("nexsaas_display_user", JSON.stringify({
                nom: newUser.nom,
                prenom: newUser.prenom,
                profilePicture: newUser.profilePicture,
            }));
            if (response.token) {
                localStorage.setItem("token", response.token);
            }

            logActivity({
                type: "create",
                module: "Auth",
                description: `Nouveau compte créé pour ${newUser.nom} ${newUser.prenom}`,
                userId: newUser.id,
                metadata: {
                    email: newUser.email,
                    type: newUser.type,
                    companyName: newUser.companyName,
                },
            });

            showToast({
                type: "success",
                title: "Inscription réussie",
                message: `Bienvenue ${newUser.nom} ! Votre compte a été créé avec succès.`,
            });
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Une erreur est survenue lors de la création de votre compte";
            showToast({
                type: "error",
                title: "Erreur d'inscription",
                message: errorMessage,
            });
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
            });

            showToast({
                type: "info",
                title: "Déconnexion",
                message: "À bientôt !",
            });

            // Preserve non-sensitive data for display
            setDisplayUser({
                nom: user.nom,
                prenom: user.prenom,
                profilePicture: user.profilePicture,
            });
            localStorage.setItem("nexsaas_display_user", JSON.stringify({
                nom: user.nom,
                prenom: user.prenom,
                profilePicture: user.profilePicture,
            }));
        }

        // Clear authentication data
        setUser(null);
        localStorage.removeItem("nexsaas_user");
        localStorage.removeItem("token");
    };

    const value: AuthContextType = {
        user,
        displayUser,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        loading,
        setUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};