import axiosClient from "./axiosClient";

export interface PriceHistory {
    id: string;
    price: number;
    date: string;
    negotiatedBy: string;
    notes: string;
}

export interface ProductDto {
    nomProduit: string;
    prixNegocie: number;
    conditionnement: string;
    delaiApprovisionnement: string;
}

export interface Product {
    id: string;
    nomProduit: string;
    prixNegocie: number;
    conditionnement: string;
    delaiApprovisionnement: string;
    fournisseurId: string;
    createdAt: string;
    priceHistory: PriceHistory[];
}

export const fetchProducts = async (fournisseurId: string): Promise<Product[]> => {
    const token = localStorage.getItem("token");
    const response = await axiosClient.get(`fournisseurs/${fournisseurId}/produits`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.data.map((product: any) => ({
        id: product.id,
        nomProduit: product.nomProduit,
        prixNegocie: parseFloat(product.prixNegocie) || 0,
        conditionnement: product.conditionnement || "",
        delaiApprovisionnement: product.delaiApprovisionnement || "",
        fournisseurId: product.fournisseurId || fournisseurId,
        createdAt: product.createdAt || new Date().toISOString(),
        priceHistory: product.priceHistory ? product.priceHistory.map((ph: any) => ({
            id: ph.id,
            price: parseFloat(ph.price) || 0,
            date: ph.date,
            negotiatedBy: ph.negotiatedBy,
            notes: ph.notes,
        })) : [],
    }));
};

export const addProduct = async (fournisseurId: string, data: ProductDto): Promise<Product> => {
    const token = localStorage.getItem("token");
    const response = await axiosClient.post(`fournisseurs/${fournisseurId}/produits`, data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return {
        id: response.data.id,
        nomProduit: response.data.nomProduit,
        prixNegocie: parseFloat(response.data.prixNegocie) || 0,
        conditionnement: response.data.conditionnement || "",
        delaiApprovisionnement: response.data.delaiApprovisionnement || "",
        fournisseurId: response.data.fournisseurId || fournisseurId,
        createdAt: response.data.createdAt || new Date().toISOString(),
        priceHistory: response.data.priceHistory ? response.data.priceHistory.map((ph: any) => ({
            id: ph.id,
            price: parseFloat(ph.price) || 0,
            date: ph.date,
            negotiatedBy: ph.negotiatedBy,
            notes: ph.notes,
        })) : [],
    };
};

export const updateProduct = async (productId: string, data: ProductDto): Promise<Product> => {
    const token = localStorage.getItem("token");
    const response = await axiosClient.patch(`produits/${productId}`, data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return {
        id: response.data.id,
        nomProduit: response.data.nomProduit,
        prixNegocie: parseFloat(response.data.prixNegocie) || 0,
        conditionnement: response.data.conditionnement || "",
        delaiApprovisionnement: response.data.delaiApprovisionnement || "",
        fournisseurId: response.data.fournisseurId,
        createdAt: response.data.createdAt || new Date().toISOString(),
        priceHistory: response.data.priceHistory ? response.data.priceHistory.map((ph: any) => ({
            id: ph.id,
            price: parseFloat(ph.price) || 0,
            date: ph.date,
            negotiatedBy: ph.negotiatedBy,
            notes: ph.notes,
        })) : [],
    };
};

export const deleteProduct = async (productId: string): Promise<void> => {
    const token = localStorage.getItem("token");
    await axiosClient.delete(`produits/${productId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};