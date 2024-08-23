// app/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuth = () => {
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkToken = async () => {
            try {
                const savedToken = await AsyncStorage.getItem('supabaseToken');
                setToken(savedToken);
            } catch (error) {
                console.error('Failed to retrieve token', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkToken();
    }, []);

    return { token, isLoading };
};
