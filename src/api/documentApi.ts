import axiosClient from "./axiosClient";

export interface DocumentUploadResponse {
    success: boolean;
    message: string;
    data?: any;
}

export interface DocumentFiles {
    cniFront?: File;
    cniBack?: File;
    rccm?: File;
    dfe?: File;
}

export interface ExpiryDates {
    cniExpiry?: string;
    rccmExpiry?: string;
    dfeExpiry?: string;
}

// Nouvelle interface pour associer IDs et fichiers
export interface DocumentUpdate {
    id: string;
    type: "CNI" | "RCCM" | "DFE";
    file?: File; // Fichier optionnel pour RCCM
    fileBack?: File; // Pour CNI verso
}

export interface UploadDocumentsResponseData {
    id: number;
    type: "CNI" | "RCCM" | "DFE";
    statut: "en_attente" | string;
    fichierRectoUrl: string;
    fichierVersoUrl: string;
    commentaire: string | null;
    creeLe: string;
    majLe: string;
}

export enum StatutDocument {
    EN_ATTENTE = "en_attente",
    VALIDE = "valide",
    REFUSE = "refusé",
    NONFOURNI = "non_fourni",
}

// 📥 Téléverser tous les documents requis
export const uploadAllDocuments = async (
    files: DocumentFiles,
    expiryDates: ExpiryDates = {},
): Promise<
    DocumentUploadResponse & { data?: UploadDocumentsResponseData[] }
> => {
    const token = localStorage.getItem("token");

    try {
        if (!token) {
            throw new Error("Token d'authentification manquant");
        }

        // Validation : seuls cniFront, cniBack et dfe sont requis
        if (!files.cniFront || !files.cniBack || !files.dfe) {
            throw new Error("Les documents CNI recto/verso et DFE sont requis");
        }

        const formData = new FormData();
        if (files.cniFront) formData.append("cniFront", files.cniFront);
        if (files.cniBack) formData.append("cniBack", files.cniBack);
        if (files.rccm) formData.append("rccm", files.rccm); // Ajouter seulement si présent
        if (files.dfe) formData.append("dfe", files.dfe);

        if (expiryDates.cniExpiry)
            formData.append("cniExpiry", expiryDates.cniExpiry);
        if (expiryDates.rccmExpiry)
            formData.append("rccmExpiry", expiryDates.rccmExpiry);
        if (expiryDates.dfeExpiry)
            formData.append("dfeExpiry", expiryDates.dfeExpiry);

        const response = await axiosClient.post("/documents-user", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
            timeout: 30000, // 30 secondes timeout
        });

        return {
            success: true,
            message: response.data.message || "Documents uploadés avec succès",
            data: response.data.data || [], // Retourne un tableau vide si data est undefined
        };
    } catch (err: any) {
        const errorMessage =
            err.response?.data?.message ||
            err.message ||
            "Erreur lors de l'upload des documents";
        throw new Error(errorMessage);
    }
};

// 📥 Mettre à jour les documents rejetés
export const updateRejectedDocuments = async (
    documents: DocumentUpdate[],
    expiryDates: ExpiryDates = {},
): Promise<
    DocumentUploadResponse & { data?: UploadDocumentsResponseData[] }
> => {
    const token = localStorage.getItem("token");

    try {
        if (!token) {
            throw new Error("Token d'authentification manquant");
        }

        // Vérifier si au moins un document est fourni
        if (!documents.length) {
            throw new Error(
                "Au moins un document doit être fourni pour la mise à jour",
            );
        }

        // Récupérer les documents existants pour vérifier les statuts
        const { data: existingDocs } = await getUserDocuments();
        const validStatuses = [StatutDocument.REFUSE, StatutDocument.NONFOURNI];

        // Valider que chaque document fourni a un ID valide et un statut modifiable
        const invalidDocs: string[] = [];
        documents.forEach((doc) => {
            const existingDoc = existingDocs.find(
                (d: UploadDocumentsResponseData) => d.id.toString() === doc.id,
            );
            if (!existingDoc) {
                invalidDocs.push(`Document avec ID ${doc.id} non trouvé`);
            } else if (!validStatuses.includes(existingDoc.statut)) {
                invalidDocs.push(
                    `Document avec ID ${doc.id} n'est pas modifiable (statut: ${existingDoc.statut})`,
                );
            } else if (doc.type === "CNI" && (!doc.file || !doc.fileBack)) {
                invalidDocs.push(
                    `CNI avec ID ${doc.id} nécessite recto et verso`,
                );
            } else if (doc.type === "DFE" && !doc.file) {
                invalidDocs.push(`DFE avec ID ${doc.id} nécessite un fichier`);
            }
        });

        if (invalidDocs.length > 0) {
            throw new Error(`Erreurs de validation: ${invalidDocs.join(", ")}`);
        }

        const formData = new FormData();
        documents.forEach((doc, index) => {
            if (doc.file) {
                formData.append(`documents[${index}][id]`, doc.id);
                formData.append(`documents[${index}][type]`, doc.type);
                formData.append(`documents[${index}][file]`, doc.file);
                if (doc.fileBack) {
                    formData.append(
                        `documents[${index}][fileBack]`,
                        doc.fileBack,
                    );
                }
            }
        });

        // Ajouter les dates d'expiration si fournies
        if (expiryDates.cniExpiry)
            formData.append("cniExpiry", expiryDates.cniExpiry);
        if (expiryDates.rccmExpiry)
            formData.append("rccmExpiry", expiryDates.rccmExpiry);
        if (expiryDates.dfeExpiry)
            formData.append("dfeExpiry", expiryDates.dfeExpiry);

        const response = await axiosClient.put("/documents-user", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });

        return {
            success: true,
            message:
                response.data.message || "Documents mis à jour avec succès",
            data: response.data.data || [],
        };
    } catch (err: any) {
        const errorMessage =
            err.response?.data?.message ||
            err.message ||
            "Erreur lors de la mise à jour des documents";
        throw new Error(errorMessage);
    }
};

// 📥 Récupérer les documents de l'utilisateur
export const getUserDocuments = async (): Promise<any> => {
    const token = localStorage.getItem("token");

    try {
        if (!token) {
            throw new Error("Token d'authentification manquant");
        }

        const response = await axiosClient.get("/documents-user", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return {
            success: true,
            data: response.data.data,
        };
    } catch (err: any) {
        const errorMessage =
            err.response?.data?.message ||
            err.message ||
            "Erreur lors de la récupération des documents";
        throw new Error(errorMessage);
    }
};

// 📥 Récupérer les documents rejetés
export const getRejectedDocuments = async (): Promise<any> => {
    const token = localStorage.getItem("token");

    try {
        if (!token) {
            throw new Error("Token d'authentification manquant");
        }

        const response = await axiosClient.get("/documents-user/rejected", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return {
            success: true,
            data: response.data,
        };
    } catch (err: any) {
        const errorMessage =
            err.response?.data?.message ||
            err.message ||
            "Erreur lors de la récupération des documents rejetés";
        throw new Error(errorMessage);
    }
};

// 📥 Valider un fichier avant upload
export const validateFile = (
    file: File,
    maxSize: number = 10,
    acceptedTypes: string[] = [],
): Promise<{ isValid: boolean; error?: string }> => {
    if (file.size > maxSize * 1024 * 1024) {
        return Promise.resolve({
            isValid: false,
            error: `Le fichier est trop volumineux. Taille maximum : ${maxSize} MB`,
        });
    }

    if (acceptedTypes.length > 0) {
        const fileType = file.type.toLowerCase();
        const fileName = file.name.toLowerCase();

        const isValidType = acceptedTypes.some((type) => {
            if (type.startsWith(".")) {
                return fileName.endsWith(type);
            }
            return fileType.includes(type);
        });

        if (!isValidType) {
            return Promise.resolve({
                isValid: false,
                error: `Type de fichier non supporté. Types acceptés : ${acceptedTypes.join(
                    ", ",
                )}`,
            });
        }
    }

    if (file.name.length > 255) {
        return Promise.resolve({
            isValid: false,
            error: "Le nom du fichier est trop long (255 caractères maximum)",
        });
    }

    // Validation des dimensions pour les images
    if (file.type.startsWith("image/")) {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                URL.revokeObjectURL(img.src);
                if (img.width < 300 || img.height < 200) {
                    resolve({
                        isValid: false,
                        error: "L'image doit avoir une résolution minimale de 300x200 pixels",
                    });
                } else {
                    resolve({ isValid: true });
                }
            };
            img.onerror = () => {
                URL.revokeObjectURL(img.src);
                resolve({
                    isValid: false,
                    error: "Impossible de charger l'image pour validation",
                });
            };
        });
    }

    return Promise.resolve({ isValid: true });
};

// 📥 Vérifier si tous les documents requis sont présents
export const validateAllRequiredDocuments = (
    files: DocumentFiles,
): { isValid: boolean; missingDocuments: string[] } => {
    const missing: string[] = [];

    if (!files.cniFront) missing.push("CNI Recto");
    if (!files.cniBack) missing.push("CNI Verso");
    if (!files.dfe) missing.push("DFE");

    return {
        isValid: missing.length === 0,
        missingDocuments: missing,
    };
};

// 📥 Valider les documents rejetés
export const validateRejectedDocuments = (
    files: Record<string, File>,
    rejectedDocIds: string[],
): {
    isValid: boolean;
    missingDocuments: string[];
    extraDocuments: string[];
} => {
    const missing: string[] = [];
    const extra: string[] = [];

    const docNames: Record<string, string> = {
        cniFront: "CNI Recto",
        cniBack: "CNI Verso",
        rccm: "RCCM",
        dfe: "DFE",
    };

    rejectedDocIds.forEach((docId) => {
        if (!files[docId]) {
            missing.push(docNames[docId] || docId);
        }
    });

    Object.keys(files).forEach((fileId) => {
        if (!rejectedDocIds.includes(fileId)) {
            extra.push(docNames[fileId] || fileId);
        }
    });

    return {
        isValid: missing.length === 0 && extra.length === 0,
        missingDocuments: missing,
        extraDocuments: extra,
    };
};

// 📥 Générer une URL de prévisualisation pour un fichier
export const generatePreviewUrl = (file: File): string | null => {
    const fileType = file.type.toLowerCase();

    if (fileType.startsWith("image/") || fileType === "application/pdf") {
        return URL.createObjectURL(file);
    }

    return null;
};

// 📥 Nettoyer les URLs de prévisualisation
export const revokePreviewUrl = (url: string): void => {
    if (url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
    }
};

// 📥 Mettre à jour le token d'authentification
export const setAuthToken = (token: string): void => {
    localStorage.setItem("token", token);
};

// 📥 Supprimer le token d'authentification
export const clearAuthToken = (): void => {
    localStorage.removeItem("token");
};
