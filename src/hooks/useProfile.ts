import { useState, useCallback } from "react";
import { updateProfile, uploadSelfie, updatePassword, UpdateProfileDto, UpdatePasswordDto } from "../api/profileApi";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";

// Extend UpdateProfileDto for ProfilePage
export interface ExtendedUpdateProfileDto extends UpdateProfileDto {
    description?: string;
    companyName?: string;
    nif?: string;
    phone?: string;
    address?: string;
}

// Define User interface with required fields
export interface User {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    type: string;
    role: string;
    actif: boolean;
    createdAt: Date;
    profilePicture?: string;
    phone?: string;
    address?: string;
    description?: string;
    nif?: string;
    companyName?: string;
}

export const useProfile = () => {
    const { user: authUser, setUser: setAuthUser } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    // Initialize user state from AuthContext
    const [user, setUser] = useState<User | null>(authUser);

    // Sync local user state with AuthContext user
    const syncUser = useCallback((updatedUser: User | null) => {
        console.log("Syncing user:", updatedUser);
        setUser(updatedUser);
        setAuthUser(updatedUser);
        if (updatedUser) {
            localStorage.setItem("nexsaas_user", JSON.stringify(updatedUser));
        } else {
            localStorage.removeItem("nexsaas_user");
        }
    }, [setAuthUser]);

    // Update profile
    const handleUpdateProfile = useCallback(async (formData: ExtendedUpdateProfileDto) => {
        setLoading(true);
        try {
            // Only send fields defined in UpdateProfileDto to the API
            const apiData: UpdateProfileDto = {
                nom: formData.nom,
                prenom: formData.prenom,
            };
            const res = await updateProfile(apiData);
            const updatedUser = {
                ...user,
                nom: res.data?.nom || formData.nom || user?.nom || "",
                prenom: res.data?.prenom || formData.prenom || user?.prenom || "",
                role: res.data?.role || user?.role || "",
                actif: res.data?.actif ?? user?.actif ?? true,
                description: formData.description || user?.description || "",
                companyName: formData.companyName || user?.companyName || "",
                nif: formData.nif || user?.nif || "",
                phone: formData.phone || user?.phone || "",
                address: formData.address || user?.address || "",
                profilePicture: user?.profilePicture || "", // Preserve profilePicture
            } as User;
            syncUser(updatedUser);
            showToast({
                type: "success",
                title: "Profil mis à jour",
                message: res.message || "Vos informations ont été mises à jour.",
                duration: 3000,
            });
            return res;
        } catch (err: any) {
            const errorMessage = err.message || "Erreur lors de la mise à jour du profil";
            showToast({
                type: "error",
                title: "Erreur",
                message: errorMessage,
                duration: 4000,
            });
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [user, syncUser, showToast]);

    // Upload selfie
    const handleUploadSelfie = useCallback(async (file: File) => {
        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png"];
        if (!allowedTypes.includes(file.type)) {
            const errorMessage = "Seuls les fichiers JPEG et PNG sont autorisés";
            showToast({
                type: "error",
                title: "Erreur de fichier",
                message: errorMessage,
                duration: 4000,
            });
            throw new Error(errorMessage);
        }

        setLoading(true);
        try {
            const res = await uploadSelfie(file);
            console.log("Upload selfie response:", res);
            if (!res.profilePicture) {
                console.warn("No profilePicture in response:", res);
                throw new Error("No profile picture URL returned");
            }
            const updatedUser = {
                ...user,
                profilePicture: res.profilePicture,
            } as User;
            syncUser(updatedUser);
            showToast({
                type: "success",
                title: "Photo mise à jour",
                message: res.message || "Votre photo a été enregistrée avec succès.",
                duration: 3000,
            });
            return res;
        } catch (err: any) {
            console.error("Handle upload selfie error:", err);
            const errorMessage = err.message || "Échec de l'envoi de la photo";
            showToast({
                type: "error",
                title: "Erreur d'envoi",
                message: errorMessage,
                duration: 4000,
            });
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [user, syncUser, showToast]);

    // Update password
    const handleUpdatePassword = useCallback(async (formData: UpdatePasswordDto) => {
        setLoading(true);
        try {
            const res = await updatePassword(formData);
            showToast({
                type: "success",
                title: "Mot de passe modifié",
                message: "Votre mot de passe a été mis à jour avec succès.",
                duration: 3000,
            });
            return res;
        } catch (err: any) {
            const errorMessage = err.message || "Erreur lors de la modification du mot de passe";
            showToast({
                type: "error",
                title: "Erreur",
                message: errorMessage,
                duration: 4000,
            });
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    return {
        user,
        setUser: syncUser,
        loading,
        handleUpdateProfile,
        handleUploadSelfie,
        handleUpdatePassword,
    };
};