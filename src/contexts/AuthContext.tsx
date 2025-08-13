import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";
import { useToast } from "./ToastContext";
import { useActivity } from "./ActivityContext";
import {
    RegisterClientDto,
    LoginClientDto,
    registerClient,
    loginClient,
} from "../api/authApi"; // Import the API functions and types

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (userData: Omit<User, "id" | "createdAt">) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();
    const { logActivity } = useActivity();

    useEffect(() => {
        // Check for existing user session
        const savedUser = localStorage.getItem("nexsaas_user");
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string): Promise<void> => {
        setLoading(true);
        try {
            const loginData: LoginClientDto = {
                email,
                motDePasse: password,
                role: "client", // Adjust role as needed based on your backend requirements
            };

            const response = await loginClient(loginData);

            const newUser: User = {
                id: response.id || Date.now().toString(), // Adjust based on your API response
                nom: response.nom,
                prenom: response.prenom,
                email: response.email,
                type: response.type,
                companyName: response.companyName,
                createdAt: new Date(response.createdAt || Date.now()),
            };

            setUser(newUser);
            localStorage.setItem("nexsaas_user", JSON.stringify(newUser));
            localStorage.setItem("token", response.token); // Store token if included in response

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
            showToast({
                type: "error",
                title: "Erreur de connexion",
                message:
                    error.response?.data?.message ||
                    "Email ou mot de passe incorrect",
            });
            throw new Error("Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    const register = async (
        userData: Omit<RegisterClientDto, "id" | "createdAt">,
    ): Promise<void> => {
        setLoading(true);
        try {
            const registerData: RegisterClientDto = {
                nom: userData.nom,
                prenom: userData.prenom,
                email: userData.email,
                password: userData.password || "", // Ensure password is included
                description: userData.description || "", // Add default if needed
                type: userData.type,
                companyName: userData.companyName,
                nif: userData.nif,
            };

            const response = await registerClient(registerData);

            const newUser: User = {
                ...userData,
                id: response.id || Date.now().toString(),
                createdAt: new Date(response.createdAt || Date.now()),
            };

            setUser(newUser);
            localStorage.setItem("nexsaas_user", JSON.stringify(newUser));
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
            showToast({
                type: "error",
                title: "Erreur d'inscription",
                message:
                    error.response?.data?.message ||
                    "Une erreur est survenue lors de la création de votre compte",
            });
            throw new Error("Registration failed");
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
        }

        setUser(null);
        localStorage.removeItem("nexsaas_user");
        localStorage.removeItem("token");
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
