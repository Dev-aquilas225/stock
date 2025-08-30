import axiosClient from "./axiosClient";



// 🎯 Type des données retour fournisseur
export interface RetourFournisseur {
    id: number;
    produitCommande: {
        id: number;
        commande: {
            id: number;
            reference: string;
            fournisseur: {
                id: number;
                nom: string;
                adresse: string;
                telephone: string;
                email: string;
                categorie: string;
                delaiLivraison: string;
                isDeleted: boolean;
                creeLe: string;
            };
            statut: string;
            note: string;
            dateLivraisonEstimee: string;
            montantTotal: string;
            montantTotalConverti: string;
            deviseConvertion: string;
            creeLe: string;
            majLe: string;
        };
        produit: {
            id: number;
            nom: string;
            prix: string;
            conditionnement: string;
            delaiApprovisionnement: string;
            devise: string;
            creeLe: string;
            image: string | null;
            sku: string;
            majLe: string;
        };
        prixBase: string;
        prixNegocie: string;
        quantite: number;
        montantTotal: string;
        devise: string;
        montantTotalConverti: string;
        deviseConvertion: string;
        sku: string;
        lot: string;
        conditionnement: string;
    };
    quantiteRetournee: number;
    dateRetour: string;
    motifRetour: string;
    statutRetour: string;
}


// ✅ Fonction : Récupérer la liste des retours depuis /commandes/retours
export const getRetoursFournisseur = async (): Promise<RetourFournisseur[]> => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token manquant");

    try {
        const response = await axiosClient.get("/commandes/retours", {
            headers: { Authorization: `Bearer ${token}` },
        });

        // ⚠️ Pas de "data.data", mais un tableau direct
        return response.data as RetourFournisseur[];
    } catch (err: any) {
        console.error("Erreur API Retours:", err.response?.data || err.message);
        throw new Error(
            err.response?.data?.message ||
                "Erreur lors de la récupération des retours fournisseurs"
        );
    }
};
