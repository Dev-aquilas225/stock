import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

export interface ProductDto {
    supplierId: string;
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
    priceHistory: PriceHistory[];
}

export interface PriceHistory {
    id: string;
    price: number;
    date: string;
    negotiatedBy: string;
    notes: string;
}

export const useProducts = (supplierId: string) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!supplierId) {
            console.log("No supplierId provided, skipping product fetch");
            setProducts([]);
            setError(null);
            return;
        }

        const loadProducts = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                const response = await axiosClient.get(`/suppliers/${supplierId}/products`, {
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
                    priceHistory: product.priceHistory || [],
                }));
                setProducts(fetchedProducts);
                setError(null);
            } catch (err: any) {
                const errorMessage = err.response?.data?.message || "Erreur lors du chargement des produits";
                console.error(`Error loading products for supplierId ${supplierId}:`, err);
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, [supplierId]);

    const add = async (data: ProductDto) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axiosClient.post(`/suppliers/${data.supplierId}/produits`, data, {
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
                priceHistory: response.data.priceHistory || [],
            };
            setProducts((prev) => [...prev, newProduct]);
            setError(null);
            return newProduct;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Erreur lors de l'ajout du produit";
            console.error("Error adding product:", err);
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const update = async (productId: string, data: ProductDto) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axiosClient.put(`/products/${productId}`, data, {
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
                priceHistory: response.data.priceHistory || [],
            };
            setProducts((prev) =>
                prev.map((product) => (product.id === productId ? updatedProduct : product))
            );
            setError(null);
            return updatedProduct;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Erreur lors de la mise à jour du produit";
            console.error(`Error updating product ${productId}:`, err);
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const remove = async (productId: string) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            await axiosClient.delete(`/products/${productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setProducts((prev) => prev.filter((product) => product.id !== productId));
            setError(null);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Erreur lors de la suppression du produit";
            console.error(`Error deleting product ${productId}:`, err);
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { products, add, update, remove, loading, error };
};