import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface ErrorScreenProps {
    errorMessage: string;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ errorMessage }) => {
    return (
        <View style={styles.centered}>
            <ThemedText>{errorMessage}</ThemedText>
        </View>
    );
};

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ErrorScreen;
