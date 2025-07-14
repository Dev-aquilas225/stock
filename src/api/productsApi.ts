import axiosClient from "./axiosClient";

export interface PriceHistory {
    id: string;
    price: number;
    date: string;
    negotiatedBy: string;
    notes: string;
}

export interface ProductDto {
    nomProduit: string; // Changed from name
    prixNegocie: number; // Changed from currentPrice
    conditionnement: string; // Changed from packaging
    delaiApprovisionnement: string; // Changed from deliveryTime
    supplierId: string;
    priceHistory?: PriceHistory[];
}

export interface Product {
    id: string;
    nomProduit: string; // Changed from name
    prixNegocie: number; // Changed from currentPrice
    conditionnement: string; // Changed from packaging
    delaiApprovisionnement: string; // Changed from deliveryTime
    supplierId: string;
    createdAt: string;
    priceHistory: PriceHistory[];
}

export const fetchProducts = async (supplierId: string): Promise<Product[]> => {
    const token = localStorage.getItem("token");
    try {
        const response = await axiosClient.get(`suppliers/${supplierId}/products`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        // Map backend fields to frontend Product interface
        return response.data.data.map((product: any) => ({
            id: product.id,
            nomProduit: product.nomProduit,
            prixNegocie: parseFloat(product.prixNegocie) || 0,
            conditionnement: product.conditionnement,
            delaiApprovisionnement: product.delaiApprovisionnement,
            supplierId: product.supplierId,
            createdAt: product.createdAt || new Date().toISOString(),
            priceHistory: product.priceHistory ? product.priceHistory.map((ph: any) => ({
                id: ph.id,
                price: parseFloat(ph.price) || 0,
                date: ph.date,
                negotiatedBy: ph.negotiatedBy,
                notes: ph.notes,
            })) : [],
        }));
    } catch (error: any) {
        console.error("Error fetching products:", error);
        throw new Error(error.response?.data?.message || "Erreur lors du chargement des produits");
    }
};

export const addProduct = async (data: ProductDto): Promise<Product> => {
    const token = localStorage.getItem("token");
    try {
        const response = await axiosClient.post(`suppliers/${data.supplierId}/products`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const newProduct = response.data;
        return {
            id: newProduct.id,
            nomProduit: newProduct.nomProduit,
            prixNegocie: parseFloat(newProduct.prixNegocie) || 0,
            conditionnement: newProduct.conditionnement,
            delaiApprovisionnement: newProduct.delaiApprovisionnement,
            supplierId: newProduct.supplierId,
            createdAt: newProduct.createdAt || new Date().toISOString(),
            priceHistory: newProduct.priceHistory ? newProduct.priceHistory.map((ph: any) => ({
                id: ph.id,
                price: parseFloat(ph.price) || 0,
                date: ph.date,
                negotiatedBy: ph.negotiatedBy,
                notes: ph.notes,
            })) : [],
        };
    } catch (error: any) {
        console.error("Error adding product:", error);
        throw new Error(error.response?.data?.message || "Erreur lors de l'ajout du produit");
    }
};

export const updateProduct = async (productId: string, data: Partial<ProductDto>): Promise<Product> => {
    const token = localStorage.getItem("token");
    try {
        const response = await axiosClient.put(`products/${productId}`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const updatedProduct = response.data;
        return {
            id: updatedProduct.id,
            nomProduit: updatedProduct.nomProduit,
            prixNegocie: parseFloat(updatedProduct.prixNegocie) || 0,
            conditionnement: updatedProduct.conditionnement,
            delaiApprovisionnement: updatedProduct.delaiApprovisionnement,
            supplierId: updatedProduct.supplierId,
            createdAt: updatedProduct.createdAt || new Date().toISOString(),
            priceHistory: updatedProduct.priceHistory ? updatedProduct.priceHistory.map((ph: any) => ({
                id: ph.id,
                price: parseFloat(ph.price) || 0,
                date: ph.date,
                negotiatedBy: ph.negotiatedBy,
                notes: ph.notes,
            })) : [],
        };
    } catch (error: any) {
        console.error("Error updating product:", error);
        throw new Error(error.response?.data?.message || "Erreur lors de la mise à jour du produit");
    }
};

export const deleteProduct = async (productId: string): Promise<void> => {
    const token = localStorage.getItem("token");
    try {
        await axiosClient.delete(`products/${productId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error: any) {
        console.error("Error deleting product:", error);
        throw new Error(error.response?.data?.message || "Erreur lors de la suppression du produit");
    }
};