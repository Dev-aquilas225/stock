import axiosClient from "./axiosClient";

// Interface for updating profile
export interface UpdateProfileDto {
    nom?: string;
    prenom?: string;
}

// Interface for updating password
export interface UpdatePasswordDto {
    currentPassword: string;
    newPassword: string;
}

// Update profile
export const updateProfile = async (data: UpdateProfileDto) => {
    // Retrieve token from localStorage
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("No token found in localStorage for updateProfile");
        throw new Error("No authentication token found");
    }

    try {
        const response = await axiosClient.patch("/auth/me", data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log("Profile modifié:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Update profile error:", error.response?.data || error.message);
        if (error.response?.status === 401) {
            throw new Error("Non autorisé : Veuillez vous reconnecter");
        }
        throw new Error(error.response?.data?.message || "Échec de la mise à jour du profil");
    }
};

// Upload selfie
export const uploadSelfie = async (file: File) => {
    const formData = new FormData();
    formData.append("selfie", file); // Use "selfie" as field name

    // Retrieve token from localStorage
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("No token found in localStorage for uploadSelfie");
        throw new Error("No authentication token found");
    }

    try {
        const response = await axiosClient.put("/user/selfie", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
            },
        });
        console.log("Selfie uploadé:", response.data);
        console.log("Raw path from response:", response.data.path);
        const profilePicture = response.data.path
            ? `http://localhost:8000${response.data.path.replace(/\\/g, '/').replace(/^\/+/, '/')}`
            : null;
        console.log("Profile picture URL:", profilePicture);
        return {
            ...response.data,
            profilePicture,
        };
    } catch (error: any) {
        console.error("Upload selfie error:", error.response?.data || error.message);
        if (error.response?.status === 401) {
            throw new Error("Non autorisé : Veuillez vous reconnecter");
        }
        throw new Error(error.response?.data?.message || "Échec de l'envoi de la photo");
    }
};

// Update password
export const updatePassword = async (data: UpdatePasswordDto) => {
    // Retrieve token from localStorage
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("No token found in localStorage for updatePassword");
        throw new Error("No authentication token found");
    }

    try {
        const response = await axiosClient.patch("/auth/password", data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log("Mot de passe modifié:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Update password error:", error.response?.data || error.message);
        if (error.response?.status === 401) {
            throw new Error("Non autorisé : Veuillez vous reconnecter");
        }
        throw new Error(error.response?.data?.message || "Échec de la modification du mot de passe");
    }
};