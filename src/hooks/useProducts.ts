import { useState, useEffect } from "react";
import { Product, ProductDto, fetchProducts, addProduct, updateProduct, deleteProduct } from "../api/productsApi";

export const useProducts = (supplierId: string) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!supplierId) return;

        const loadProducts = async () => {
            setLoading(true);
            try {
                const fetchedProducts = await fetchProducts(supplierId);
                setProducts(fetchedProducts);
                setError(null);
            } catch (err) {
                setError("Erreur lors du chargement des produits");
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, [supplierId]);

    const add = async (data: ProductDto) => {
        setLoading(true);
        try {
            const newProduct = await addProduct(data);
            setProducts((prev) => [...prev, newProduct]);
            setError(null);
            return newProduct;
        } catch (err) {
            setError("Erreur lors de l'ajout du produit");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const update = async (productId: string, data: Partial<ProductDto>) => {
        setLoading(true);
        try {
            const updatedProduct = await updateProduct(productId, data);
            setProducts((prev) =>
                prev.map((product) =>
                    product.id === productId ? updatedProduct : product
                )
            );
            setError(null);
            return updatedProduct;
        } catch (err) {
            setError("Erreur lors de la mise à jour du produit");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const remove = async (productId: string) => {
        setLoading(true);
        try {
            await deleteProduct(productId);
            setProducts((prev) => prev.filter((product) => product.id !== productId));
            setError(null);
        } catch (err) {
            setError("Erreur lors de la suppression du produit");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { products, add, update, remove, loading, error };
};