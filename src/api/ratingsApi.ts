import axiosClient from "./axiosClient";

export interface RatingDto {
    rating: number;
    comment: string;
    supplierId: string;
}

export interface Rating {
    id: string;
    rating: number;
    comment: string;
    supplierId: string;
    createdAt: string;
}

export const fetchRating = async (supplierId: string): Promise<Rating | null> => {
    const token = localStorage.getItem("token");
    const response = await axiosClient.get(`suppliers/${supplierId}/rating`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.data || null;
};

export const addOrUpdateRating = async (data: RatingDto): Promise<Rating> => {
    const token = localStorage.getItem("token");
    const response = await axiosClient.post(`suppliers/${data.supplierId}/rating`, data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};