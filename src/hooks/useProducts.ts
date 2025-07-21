
import { useState, useEffect } from "react";
import { useToast } from "../contexts/ToastContext";
import { useActivity } from "../contexts/ActivityContext";
import { Product, ProductDto, fetchProducts, addProduct, updateProduct, deleteProduct } from "../api/productsApi";

// Export interfaces to resolve import errors in SuppliersPage.tsx
export type { Product, ProductDto };

export const useProducts = (fournisseurId: string) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();
    const { logActivity } = useActivity();

    const loadProducts = async () => {
        if (!fournisseurId) {
            console.log("No fournisseurId provided, skipping product fetch");
            setProducts([]);
            setError(null);
            return;
        }

        setLoading(true);
        try {
            const fetchedProducts: Product[] = await fetchProducts(fournisseurId);
            setProducts(fetchedProducts);
            setError(null);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Erreur lors du chargement des produits";
            console.error(`Error fetching products for fournisseurId ${fournisseurId}:`, error);
            setError(errorMessage);
            showToast({
                type: "error",
                title: "Erreur",
                message: errorMessage,
                duration: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, [fournisseurId]);

    const add = async (data: ProductDto): Promise<Product> => {
        setLoading(true);
        try {
            const newProduct: Product = await addProduct(fournisseurId, data);
            await loadProducts();
            showToast({
                type: "success",
                title: "Produit ajouté",
                message: `Le produit ${data.nomProduit} a été ajouté avec succès.`,
                duration: 3000,
            });
            const user = localStorage.getItem("nexsaas_user");
            const userId = user ? JSON.parse(user).id ?? "unknown" : "unknown";
            logActivity({
                type: "create",
                module: "Produits",
                description: `Nouveau produit ajouté: ${data.nomProduit}`,
                userId,
                metadata: {
                    fournisseurId,
                    productId: newProduct.id,
                },
            });
            setError(null);
            return newProduct;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Erreur lors de l'ajout du produit";
            console.error("Error adding product:", error);
            setError(errorMessage);
            showToast({
                type: "error",
                title: "Erreur d'ajout",
                message: errorMessage,
                duration: 5000,
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const update = async (productId: string, data: ProductDto): Promise<Product> => {
        setLoading(true);
        try {
            const updatedProduct: Product = await updateProduct(productId, data);
            await loadProducts();
            showToast({
                type: "success",
                title: "Produit mis à jour",
                message: `Le produit ${data.nomProduit} a été mis à jour avec succès.`,
                duration: 3000,
            });
            const user = localStorage.getItem("nexsaas_user");
            const userId = user ? JSON.parse(user).id ?? "unknown" : "unknown";
            logActivity({
                type: "update",
                module: "Produits",
                description: `Produit mis à jour: ${data.nomProduit}`,
                userId,
                metadata: {
                    fournisseurId,
                    productId,
                },
            });
            setError(null);
            return updatedProduct;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Erreur lors de la mise à jour du produit";
            console.error(`Error updating product ${productId}:`, error);
            setError(errorMessage);
            showToast({
                type: "error",
                title: "Erreur de mise à jour",
                message: errorMessage,
                duration: 5000,
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const remove = async (productId: string): Promise<void> => {
        setLoading(true);
        try {
            await deleteProduct(productId);
            await loadProducts();
            showToast({
                type: "success",
                title: "Produit supprimé",
                message: "Le produit a été supprimé avec succès.",
                duration: 3000,
            });
            const user = localStorage.getItem("nexsaas_user");
            const userId = user ? JSON.parse(user).id ?? "unknown" : "unknown";
            logActivity({
                type: "delete",
                module: "Produits",
                description: `Produit supprimé: ${productId}`,
                userId,
                metadata: {
                    fournisseurId,
                    productId,
                },
            });
            setError(null);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Erreur lors de la suppression du produit";
            console.error(`Error deleting product ${productId}:`, error);
            setError(errorMessage);
            showToast({
                type: "error",
                title: "Erreur de suppression",
                message: errorMessage,
                duration: 5000,
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return { products, add, update, remove, loading, error };
};
