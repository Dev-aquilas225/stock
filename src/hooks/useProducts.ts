import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

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

export const useProducts = (fournisseurId: string) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = async () => {
        if (!fournisseurId) {
            console.log("No fournisseurId provided, skipping product fetch");
            setProducts([]);
            setError(null);
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axiosClient.get(`fournisseurs/${fournisseurId}/produits`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const fetchedProducts: Product[] = response.data.data.map((product: any) => ({
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
            setProducts(fetchedProducts);
            setError(null);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Erreur lors du chargement des produits";
            console.error(`Error fetching products for fournisseurId ${fournisseurId}:`, error);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [fournisseurId]);

    const add = async (fournisseurId: string, data: ProductDto): Promise<Product> => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axiosClient.post(`fournisseurs/${fournisseurId}/produits`, {
                nomProduit: data.nomProduit,
                prixNegocie: data.prixNegocie,
                conditionnement: data.conditionnement,
                delaiApprovisionnement: data.delaiApprovisionnement,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const newProduct: Product = {
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
            // Refetch products to ensure UI reflects the latest data
            await fetchProducts();
            setError(null);
            return newProduct;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Erreur lors de l'ajout du produit";
            console.error("Error adding product:", error);
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const update = async (productId: string, fournisseurId: string, data: Partial<ProductDto>): Promise<Product> => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axiosClient.put(`fournisseurs/${fournisseurId}/produits/${productId}`, {
                nomProduit: data.nomProduit,
                prixNegocie: data.prixNegocie,
                conditionnement: data.conditionnement,
                delaiApprovisionnement: data.delaiApprovisionnement,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const updatedProduct: Product = {
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
            // Refetch products to ensure UI reflects the latest data
            await fetchProducts();
            setError(null);
            return updatedProduct;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Erreur lors de la mise à jour du produit";
            console.error(`Error updating product ${productId}:`, error);
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const remove = async (productId: string, fournisseurId: string): Promise<void> => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            await axiosClient.delete(`fournisseurs/${fournisseurId}/produits/${productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // Refetch products to ensure UI reflects the latest data
            await fetchProducts();
            setError(null);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Erreur lors de la suppression du produit";
            console.error(`Error deleting product ${productId}:`, error);
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return { products, add, update, remove, loading, error };
};