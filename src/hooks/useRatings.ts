import { useState, useEffect } from "react";
import { Rating, RatingDto, fetchRating, addOrUpdateRating } from "../api/ratingsApi";

export const useRatings = (supplierId: string) => {
    const [rating, setRating] = useState<Rating | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!supplierId) return;

        const loadRating = async () => {
            setLoading(true);
            try {
                const fetchedRating = await fetchRating(supplierId);
                setRating(fetchedRating);
                setError(null);
            } catch (err) {
                setError("Erreur lors du chargement de la note");
            } finally {
                setLoading(false);
            }
        };

        loadRating();
    }, [supplierId]);

    const addOrUpdate = async (data: RatingDto) => {
        setLoading(true);
        try {
            const updatedRating = await addOrUpdateRating(data);
            setRating(updatedRating);
            setError(null);
            return updatedRating;
        } catch (err) {
            setError("Erreur lors de l'enregistrement de la note");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { rating, addOrUpdate, loading, error };
};