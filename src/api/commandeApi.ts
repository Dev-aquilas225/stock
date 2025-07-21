import axiosClient from "./axiosClient";

export interface User {
    id: string;
    email: string;
    nom: string;
    phone: string | null;
    prenom: string;
    motDePasse: string;
    role: string;
    type: "particulier" | "entreprise";
    selfie: string | null;
    num_rccm: string;
    nomEntreprise: string;
    actif: boolean;
    description: string;
    verified: boolean;
    docsValides: boolean;
    creeLe: string;
}

export interface Client {
    id: string;
    user: User;
    abonnementActif: boolean;
    type: "particulier" | "entreprise";
}

export interface Fournisseur {
    id: number;
    nom: string;
    adresse: string;
    telephone: string;
    email: string;
    categorie: "1" | "2";
    delaiLivraison: string;
    remise: string;
    minimumCommande: number | null;
    client: Client;
    isDeleted: boolean;
    creeLe: string;
}

export interface ProduitItem {
    id: number;
    nomProduit: string;
    prixNegocie: string;
    conditionnement: string;
    delaiApprovisionnement: string;
    creeLe: string;
    image: string;
    sku: string;
    datePeremption: string | null;
    majLe: string;
}

export interface CommandeProduit {
    id: number;
    produit: ProduitItem;
    prixNegocie: string;
    quantite: number;
    sku: string;
    lot: string;
    datePeremption: string | null;
    conditionnement: string;
}

export interface ReceptionProduit {
    id: number;
    nomProduit: string;
    quantiteReçue: string;
    commentaire: string | null;
    photo: string | null;
    ecart: boolean;
    conditionnement: string;
    creeLe: string;
}

export interface Reception {
    id: number;
    utilisateur: User;
    receptionComplete: boolean;
    signatureLivreur: string | null;
    valide: boolean;
    produits: ReceptionProduit[];
    creeLe: string;
}

export interface RetourProduit {
    id: number;
    receptionProduit: ReceptionProduit;
    quantite: number;
    raisonRetour: string;
    creeLe: string;
}

export interface Retour {
    id: number;
    commande: {
        id: number;
        reference: string;
        statut: string;
        note: string;
        dateLivraisonEstimee: string;
        creeLe: string;
        majLe: string;
    };
    produits: RetourProduit[];
    motif: string;
    statut: string;
    documentTransportUrl: string | null;
    creePar: User;
    creeLe: string;
}

export interface Commande {
    id: number;
    reference: string;
    fournisseur: Fournisseur;
    statut: string;
    note: string;
    dateLivraisonEstimee: string;
    produits: CommandeProduit[];
    reception: Reception | null;
    retour: Retour | null;
    creeLe: string;
    majLe: string;
}

export interface UpdateProduitReceptionDto {
    quantiteReçue?: number;
    conditionnement?: string;
    remarques?: string;
}

export const fetchCommandes = async (): Promise<Commande[]> => {
    const token = localStorage.getItem("token");
    const response = await axiosClient.get("/commandes", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.data;
};

export interface CommandeCreateInput {
    fournisseurId: number;
    dateLivraisonEstimee: string;
    note: string;
    statut: string;
    produits: {
        produitId: number;
        prixUnitaire: number;
        quantite: number;
        conditionnement: string;
    }[];
}

export const addCommande = async (
    commandeData: CommandeCreateInput,
): Promise<Commande> => {
    const token = localStorage.getItem("token");
    try {
        const response = await axiosClient.post("/commandes", commandeData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data.data;
    } catch (err: any) {
        const errorMessage =
            err.response?.data?.message ||
            "Erreur lors de la création de la commande";
        throw new Error(errorMessage);
    }
};

export const updateCommandeStatus = async (
    commandeId: number,
    statut: string,
): Promise<Commande> => {
    const token = localStorage.getItem("token");
    try {
        const response = await axiosClient.patch(
            `/commandes/${commandeId}/statut`,
            { statut },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
        return response.data.data;
    } catch (err: any) {
        const errorMessage =
            err.response?.data?.message ||
            "Erreur lors de la mise à jour du statut de la commande";
        throw new Error(errorMessage);
    }
};

export const modifierProduitReception = async (
    produitId: number,
    dto: UpdateProduitReceptionDto,
): Promise<ReceptionProduit> => {
    const token = localStorage.getItem("token");
    try {
        const response = await axiosClient.patch(
            `receptions/produits/${produitId}`,
            dto,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
        return response.data.data;
    } catch (err: any) {
        const errorMessage =
            err.response?.data?.message ||
            "Erreur lors de la modification de la réception du produit";
        throw new Error(errorMessage);
    }
};

export interface CreateRetourDto {
    commandeId: number;
    motif: string;
    produits: {
        receptionProduitId: number;
        quantite: number;
        raisonRetour: string;
    }[];
}

export const createRetour = async (
    retourData: CreateRetourDto,
): Promise<Retour> => {
    const token = localStorage.getItem("token");
    try {
        const response = await axiosClient.post(
            "/retours-fournisseurs",
            retourData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
        return response.data.data;
    } catch (err: any) {
        const errorMessage =
            err.response?.data?.message ||
            "Erreur lors de la création de la demande de retour";
        throw new Error(errorMessage);
    }
};