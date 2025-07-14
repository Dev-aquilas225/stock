import axiosClient from "./axiosClient";

export interface PriceHistory {
    id: string;
    price: number;
    date: string;
    negotiatedBy: string;
    notes: string;
}

export interface ProductDto {
    name: string;
    category: string;
    currentPrice: number;
    deliveryTime: string;
    minimumQuantity: number;
    packaging: string;
    supplierId: string;
    priceHistory?: PriceHistory[];
}

export interface Product {
    id: string;
    name: string;
    category: string;
    currentPrice: number;
    deliveryTime: string;
    minimumQuantity: number;
    packaging: string;
    supplierId: string;
    createdAt: string;
    priceHistory: PriceHistory[];
}

export const fetchProducts = async (supplierId: string): Promise<Product[]> => {
    const token = localStorage.getItem("token");
    const response = await axiosClient.get(`suppliers/${supplierId}/products`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    // Ensure priceHistory is always an array, even if not provided by the backend
    return response.data.data.map((product: Product) => ({
        ...product,
        priceHistory: product.priceHistory || [],
    }));
};

export const addProduct = async (data: ProductDto): Promise<Product> => {
    const token = localStorage.getItem("token");
    const response = await axiosClient.post(`suppliers/${data.supplierId}/products`, data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return { ...response.data, priceHistory: response.data.priceHistory || [] };
};

export const updateProduct = async (productId: string, data: Partial<ProductDto>): Promise<Product> => {
    const token = localStorage.getItem("token");
    const response = await axiosClient.put(`products/${productId}`, data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return { ...response.data, priceHistory: response.data.priceHistory || [] };
};

export const deleteProduct = async (productId: string): Promise<void> => {
    const token = localStorage.getItem("token");
    await axiosClient.delete(`products/${productId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};