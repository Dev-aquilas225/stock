import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../hooks/useProfile";
import { useToast } from "./ToastContext";
import { useActivity } from "./ActivityContext";
import { RegisterClientDto, LoginClientDto, registerClient, loginClient, AuthResponse } from "../api/authApi";
import { getProfile } from "../api/profileApi";

interface AuthContextType {
    user: User | null;
    displayUser: Partial<User> | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (userData: Omit<User, "id" | "createdAt">) => Promise<void>;
    logout: () => void;
    loading: boolean;
    setUser: (user: User | null) => void;
    refreshProfile: () => Promise<void>;
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
    const [displayUser, setDisplayUser] = useState<Partial<User> | null>(null);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();
    const { logActivity } = useActivity();

    useEffect(() => {
        const savedUser = localStorage.getItem("nexsaas_user");
        const savedDisplayUser = localStorage.getItem("nexsaas_display_user");
        try {
            if (savedUser) {
                const parsedUser = JSON.parse(savedUser);
                console.log("Parsed nexsaas_user:", parsedUser);
                setUser(parsedUser);
                const newDisplayUser = {
                    nom: parsedUser.nom || "",
                    prenom: parsedUser.prenom || "",
                    profilePicture: parsedUser.profilePicture || "",
                };
                setDisplayUser(newDisplayUser);
                localStorage.setItem("nexsaas_display_user", JSON.stringify(newDisplayUser));
                console.log("Set displayUser from nexsaas_user:", newDisplayUser);
            } else if (savedDisplayUser) {
                const parsedDisplayUser = JSON.parse(savedDisplayUser);
                console.log("Parsed nexsaas_display_user:", parsedDisplayUser);
                setDisplayUser({
                    nom: parsedDisplayUser.nom || "",
                    prenom: parsedDisplayUser.prenom || "",
                    profilePicture: parsedDisplayUser.profilePicture || "",
                });
            } else {
                console.log("No saved user or displayUser found in localStorage");
            }
        } catch (err) {
            console.error("Failed to parse localStorage:", err);
            localStorage.removeItem("nexsaas_user");
            localStorage.removeItem("nexsaas_display_user");
            localStorage.removeItem("token");
            setDisplayUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshProfile = async () => {
        if (!localStorage.getItem("token")) {
            console.log("No token found, skipping profile refresh");
            return;
        }
        setLoading(true);
        try {
            const profile = await getProfile();
            console.log("refreshProfile getProfile response:", profile);
            const newUser: User = {
                id: profile.id || Date.now().toString(),
                nom: profile.nom || "Utilisateur",
                prenom: profile.prenom || "",
                email: profile.email || "",
                type: profile.type || "client",
                role: profile.role || "client",
                actif: profile.actif ?? true,
                createdAt: new Date(profile.createdAt || Date.now()),
                companyName: profile.companyName || "",
                profilePicture: profile.profilePicture || "",
                phone: profile.phone || "",
                address: profile.address || "",
                description: profile.description || "",
                nif: profile.nif || "",
            };
            setUser(newUser);
            const newDisplayUser = {
                nom: newUser.nom,
                prenom: newUser.prenom,
                profilePicture: newUser.profilePicture,
            };
            setDisplayUser(newDisplayUser);
            localStorage.setItem("nexsaas_user", JSON.stringify(newUser));
            localStorage.setItem("nexsaas_display_user", JSON.stringify(newDisplayUser));
            console.log("Refreshed user and displayUser:", { newUser, newDisplayUser });
        } catch (error) {
            console.error("Failed to refresh profile:", error);
            showToast({
                type: "error",
                title: "Erreur",
                message: "Impossible de rafraîchir le profil",
                duration: 4000,
            });
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string): Promise<void> => {
        setLoading(true);
        try {
            const loginData: LoginClientDto = {
                email,
                motDePasse: password,
                role: "client",
            };

            const loginResponse = await loginClient(loginData);
            console.log("loginClient response:", loginResponse);

            if (!loginResponse.token) {
                throw new Error("No token received from login");
            }
            localStorage.setItem("token", loginResponse.token);

            const profile = await getProfile();
            console.log("getProfile response:", profile);

            const newUser: User = {
                id: profile.id || loginResponse.user?.id || loginResponse.id || Date.now().toString(),
                nom: profile.nom || loginResponse.user?.nom || loginResponse.nom || loginResponse.user?.firstName || loginResponse.firstName || "Utilisateur",
                prenom: profile.prenom || loginResponse.user?.prenom || loginResponse.prenom || loginResponse.user?.lastName || loginResponse.lastName || "",
                email: profile.email || loginResponse.user?.email || loginResponse.email || email,
                type: profile.type || loginResponse.user?.type || loginResponse.type || "client",
                role: profile.role || loginResponse.user?.role || loginResponse.role || "client",
                actif: profile.actif ?? loginResponse.user?.actif ?? loginResponse.actif ?? true,
                createdAt: new Date(profile.createdAt || loginResponse.user?.createdAt || loginResponse.createdAt || Date.now()),
                companyName: profile.companyName || loginResponse.user?.nomEntreprise || loginResponse.user?.companyName || loginResponse.nomEntreprise || loginResponse.companyName || "",
                profilePicture: profile.profilePicture || loginResponse.user?.profilePicture || loginResponse.profilePicture || "",
                phone: profile.phone || loginResponse.user?.phone || loginResponse.phone || "",
                address: profile.address || loginResponse.user?.address || loginResponse.address || "",
                description: profile.description || loginResponse.user?.description || loginResponse.description || "",
                nif: profile.nif || loginResponse.user?.nif || loginResponse.nif || "",
            };

            setUser(newUser);
            const newDisplayUser = {
                nom: newUser.nom,
                prenom: newUser.prenom,
                profilePicture: newUser.profilePicture,
            };
            setDisplayUser(newDisplayUser);
            localStorage.setItem("nexsaas_user", JSON.stringify(newUser));
            localStorage.setItem("nexsaas_display_user", JSON.stringify(newDisplayUser));
            console.log("Login set user and displayUser:", { newUser, newDisplayUser });

            logActivity({
                type: "login",
                module: "Auth",
                description: `Connexion réussie pour ${newUser.nom} ${newUser.prenom}`,
                userId: newUser.id,
                metadata: { email },
            });

            const savedDisplayUser = localStorage.getItem("nexsaas_display_user");
            const greetingName = savedDisplayUser
                ? `${JSON.parse(savedDisplayUser).nom || newUser.nom} ${JSON.parse(savedDisplayUser).prenom || newUser.prenom}`.trim()
                : `${newUser.nom} ${newUser.prenom}`.trim();

            showToast({
                type: "success",
                title: "Connexion réussie",
                message: `Bienvenue ${greetingName} !`,
            });
        } catch (error: any) {
            console.error("Login error:", error);
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
            console.log("registerClient response:", response);

            if (response.token) {
                localStorage.setItem("token", response.token);
            }

            let newUser: User;
            if (response.token) {
                const profile = await getProfile();
                console.log("getProfile response after register:", profile);
                newUser = {
                    id: profile.id || response.id || Date.now().toString(),
                    nom: profile.nom || response.nom || response.firstName || userData.nom,
                    prenom: profile.prenom || response.prenom || response.lastName || userData.prenom,
                    email: profile.email || response.email || userData.email,
                    type: profile.type || response.type || userData.type || "client",
                    role: profile.role || response.role || "client",
                    actif: profile.actif ?? response.actif ?? true,
                    createdAt: new Date(profile.createdAt || response.createdAt || Date.now()),
                    companyName: profile.companyName || response.nomEntreprise || response.companyName || userData.companyName || "",
                    profilePicture: profile.profilePicture || response.profilePicture || "",
                    phone: profile.phone || response.phone || "",
                    address: profile.address || response.address || "",
                    description: profile.description || response.description || userData.description || "",
                    nif: profile.nif || response.nif || userData.nif || "",
                };
            } else {
                newUser = {
                    id: response.id || Date.now().toString(),
                    nom: response.nom || response.firstName || userData.nom,
                    prenom: response.prenom || response.lastName || userData.prenom,
                    email: response.email || userData.email,
                    type: response.type || userData.type || "client",
                    role: response.role || "client",
                    actif: response.actif ?? true,
                    createdAt: new Date(response.createdAt || Date.now()),
                    companyName: response.nomEntreprise || response.companyName || userData.companyName || "",
                    profilePicture: response.profilePicture || "",
                    phone: response.phone || "",
                    address: response.address || "",
                    description: response.description || userData.description || "",
                    nif: response.nif || userData.nif || "",
                };
            }

            setUser(newUser);
            const newDisplayUser = {
                nom: newUser.nom,
                prenom: newUser.prenom,
                profilePicture: newUser.profilePicture,
            };
            setDisplayUser(newDisplayUser);
            localStorage.setItem("nexsaas_user", JSON.stringify(newUser));
            localStorage.setItem("nexsaas_display_user", JSON.stringify(newDisplayUser));
            console.log("Register set user and displayUser:", { newUser, newDisplayUser });

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

            const savedDisplayUser = localStorage.getItem("nexsaas_display_user");
            const greetingName = savedDisplayUser
                ? `${JSON.parse(savedDisplayUser).nom || newUser.nom} ${JSON.parse(savedDisplayUser).prenom || newUser.prenom}`.trim()
                : `${newUser.nom} ${newUser.prenom}`.trim();

            showToast({
                type: "success",
                title: "Inscription réussie",
                message: `Bienvenue ${greetingName} ! Votre compte a été créé avec succès.`,
            });
        } catch (error: any) {
            console.error("Register error:", error);
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

            const newDisplayUser = {
                nom: user.nom || "",
                prenom: user.prenom || "",
                profilePicture: user.profilePicture || "",
            };
            setDisplayUser(newDisplayUser);
            localStorage.setItem("nexsaas_display_user", JSON.stringify(newDisplayUser));
            console.log("Logout set displayUser:", newDisplayUser);

            showToast({
                type: "info",
                title: "Déconnexion",
                message: "À bientôt !",
            });
        } else {
            console.log("Logout called with no user");
        }

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
        refreshProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};