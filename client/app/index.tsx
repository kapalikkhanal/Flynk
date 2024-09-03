import { StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import the icon component
import { useRouter, Redirect } from 'expo-router';
import useAuth from '@/hooks/useAuth';

const Index = () => {
    const router = useRouter();
    const { isLoading, isAuthenticated } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (isAuthenticated) {
        return <Redirect href="/(tabs)" />;
    }

    return (
        <View style={styles.container}>
            <Image source={require('../assets/images/logo.png')} style={styles.logo} />
            <Text style={styles.headline}>THE HEADLINES</Text>
            <Text style={styles.slogan}>Getting News update is as easy as swiping.</Text>
            <TouchableOpacity style={styles.button} onPress={() => router.push('/signup')}>
                <Text style={styles.buttonText}>Start Swiping</Text>
                <Icon name="arrow-right" size={20} color="#ffffff" style={styles.icon} />
            </TouchableOpacity>
        </View>
    );
};

export default Index;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#031e1f', // Dark background color
        padding: 20,
    },
    logo: {
        width: 250,
        height: 250,
        resizeMode: 'contain',
        marginBottom: 20,
    },
    headline: {
        fontSize: 32,
        color: '#ffffff', // White text color
        fontWeight: 'bold',
        marginBottom: 20,
    },
    slogan: {
        fontSize: 16,
        color: '#ffffff', // White text color
        fontWeight: '300',
        marginBottom: 40,
    },
    button: {
        flexDirection: 'row', // Align icon and text horizontally
        backgroundColor: '#223E3F', // Dark green-blue color
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        alignItems: 'center', // Center icon and text vertically
    },
    buttonText: {
        color: '#ffffff', // White text color
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10, // Space between icon and text
    },
    icon: {
        marginLeft: 15, // Space between icon and text
    },
});
