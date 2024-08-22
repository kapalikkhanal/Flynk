import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';

interface WebViewScreenProps {
    url: string;
    onClose: () => void;
}

const WebViewScreen: React.FC<WebViewScreenProps> = ({ url, onClose }) => {
    return (
        <View style={{ flex: 1 }}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            <WebView source={{ uri: url }} style={{ flex: 1 }} />
        </View>
    );
};

const styles = StyleSheet.create({
    closeButton: {
        position: 'absolute',
        bottom: 0,
        backgroundColor: 'rgba(255,0,0,0.8)',
        padding: 16,
        zIndex: 1,
        width:'100%'
    },
    closeButtonText: {
        color: '#fff',
        textAlign:'center',
        fontSize:18,
        fontWeight:'600'
    },
});

export default WebViewScreen;
