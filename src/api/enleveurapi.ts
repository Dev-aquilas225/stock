// enleveurApi.ts
import axiosClient from "./axiosClient";

// -----------------------------
// 📌 Types & Enums
// -----------------------------

export enum TypePiece {
    CNI = "CNI",
    PASSEPORT = "PASSEPORT",
    PERMIS_DE_CONDUIRE = "PERMIS_DE_CONDUIRE",
}

export interface DocumentEnleveur {
    type: TypePiece;
    numero: string;
    fichierUrl: string;
}

export interface CreateEnleveurDto {
    clientId: string;
    nom: string;
    prenom: string;
    email: string;
    documentType: TypePiece;
    documentNumber: string;
    document: File;
}

export interface Enleveur {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    actif: boolean;
    documents: DocumentEnleveur[];
}

// -----------------------------
// 🔄 Fonctions de mapping
// -----------------------------

const mapTypePieceToBackend = (typePiece: TypePiece): string => {
    if (!Object.values(TypePiece).includes(typePiece)) {
        throw new Error("Type de pièce invalide");
    }
    return typePiece.toUpperCase();
};

const mapTypePieceFromBackend = (typePiece: string): TypePiece => {
    if (!typePiece) return TypePiece.CNI;
    const normalized = typePiece.toUpperCase();
    if (Object.values(TypePiece).includes(normalized as TypePiece)) {
        return normalized as TypePiece;
    }
    return TypePiece.CNI;
};

// -----------------------------
// 🚀 API Enleveurs
// -----------------------------

// ✅ Ajouter un enleveur
export const addEnleveur = async (data: CreateEnleveurDto): Promise<Enleveur> => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token manquant");

    if (!data.document) throw new Error("Un document est requis");

    const formData = new FormData();
    formData.append("clientId", data.clientId);
    formData.append("nom", data.nom.trim());
    formData.append("prenom", data.prenom.trim());
    formData.append("email", data.email.trim());
    formData.append("documentType", mapTypePieceToBackend(data.documentType));
    formData.append("documentNumber", data.documentNumber.trim());
    formData.append("document", data.document);

    try {
        const response = await axiosClient.post("/enleveur", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });

        const enleveur = response.data.data;
        return {
            id: enleveur.id,
            nom: enleveur.nom || data.nom,
            prenom: enleveur.prenom || data.prenom,
            email: enleveur.email,
            actif: enleveur.actif,
            documents: [
                {
                    type: mapTypePieceFromBackend(data.documentType),
                    numero: data.documentNumber,
                    fichierUrl: enleveur.fichierUrl || "",
                },
            ],
        };
    } catch (err: any) {
        console.error("Erreur API addEnleveur:", err.response?.data || err);
        throw new Error(err.response?.data?.message || "Erreur lors de la création de l’enleveur");
    }
};

// ✅ Récupérer tous les enleveurs
export const getEnleveurs = async (): Promise<Enleveur[]> => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token manquant");

    try {
        const response = await axiosClient.get("/enleveur", {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!Array.isArray(response.data)) {
            throw new Error("Réponse invalide: liste d'enleveurs attendue");
        }

        return response.data.map((e: any) => ({
            id: e.id,
            nom: e.nom,
            prenom: e.prenom,
            email: e.email,
            actif: e.actif,
            documents: (e.documents || []).map((doc: any) => ({
                type: mapTypePieceFromBackend(doc.type),
                numero: doc.numero,
                fichierUrl: doc.fichierUrl,
            })),
        }));
    } catch (err: any) {
        console.error("Erreur API getEnleveurs:", err.response?.data || err);
        throw new Error(err.response?.data?.message || "Erreur lors de la récupération des enleveurs");
    }
};

// ✅ Récupérer un enleveur par ID
export const getEnleveurById = async (id: string): Promise<Enleveur> => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token manquant");

    try {
        const response = await axiosClient.get(`/enleveur/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const e = response.data;
        return {
            id: e.id,
            nom: e.nom,
            prenom: e.prenom,
            email: e.email,
            actif: e.actif,
            documents: (e.documents || []).map((doc: any) => ({
                type: mapTypePieceFromBackend(doc.type),
                numero: doc.numero,
                fichierUrl: doc.fichierUrl,
            })),
        };
    } catch (err: any) {
        console.error("Erreur API getEnleveurById:", err.response?.data || err);
        throw new Error(err.response?.data?.message || `Erreur lors de la récupération de l’enleveur ${id}`);
    }
};

// ✅ Supprimer un enleveur
export const deleteEnleveur = async (id: string): Promise<{ success: boolean; message: string }> => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token manquant");

    try {
        const response = await axiosClient.delete(`/enleveur/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (err: any) {
        console.error("Erreur API deleteEnleveur:", err.response?.data || err);
        throw new Error(err.response?.data?.message || `Erreur lors de la suppression de l’enleveur ${id}`);
    }
};
