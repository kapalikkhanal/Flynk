import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useAuth = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        checkAuthStatus();
    }, []);

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.replace('/(tabs)');
        }
    }, [isLoading, isAuthenticated, router]);

    const checkAuthStatus = async () => {
        try {
            const session = await AsyncStorage.getItem('supabaseToken');
            setIsAuthenticated(!!session);
        } catch (error) {
            console.error('Error checking authentication status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return { isLoading, isAuthenticated };
};

export default useAuth;