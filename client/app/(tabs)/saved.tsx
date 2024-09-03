import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity, StatusBar, Dimensions, ActivityIndicator, RefreshControl, SafeAreaView, Modal, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';

const fallbackImage = require('../../assets/images/fallback.png');

const { width } = Dimensions.get('window');

interface NewsItem {
    id: string;
    title: string;
    date: string;
    imageUrl: string;
    urls: string[];
}

const Saved = () => {
    const [savedNews, setSavedNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
    const [webviewVisible, setWebviewVisible] = useState(false);

    const fetchSavedNews = async () => {
        try {
            const savedNewsJson = await AsyncStorage.getItem('saved-news');
            if (savedNewsJson) {
                const savedNewsArray = JSON.parse(savedNewsJson);
                setSavedNews(savedNewsArray);
            }
        } catch (error) {
            console.error('Failed to load saved news', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchSavedNews();
        setRefreshing(false);
    }, []);

    useEffect(() => {
        fetchSavedNews();
    }, []);

    const renderNewsItem = ({ item }: { item: NewsItem }) => (
        <TouchableOpacity
            onPress={() => {
                setSelectedUrl(item.urls[0]);
                setWebviewVisible(true);
            }}
            style={styles.newsCard}
        >
            <View style={{ height: 220 }}>
                {item.imageUrl ? (
                    <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.newsImage}
                        resizeMode="cover"
                        onError={() => {
                            console.log('Image failed to load:', item.imageUrl);
                        }}
                    />
                ) : (
                    <Image
                        source={fallbackImage}
                        style={styles.newsImage}
                        resizeMode="cover"
                        onError={() => {
                            console.log('Image failed to load:', item.imageUrl);
                        }}
                    />
                )}
                <Text style={styles.newsTitle}>{item.title}</Text>
                {/* <Text style={styles.publishedDate}>{item.date}</Text> */}
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#031e1f' }}>
            <StatusBar barStyle="light-content" backgroundColor="#252525" />
            <View style={styles.container}>
                {savedNews.length === 0 ? (
                    <View style={styles.noDataContainer}>
                        <Text style={styles.noDataText}>No saved news available</Text>
                    </View>
                ) : (
                    <View>
                        <Text className='text-2xl font-bold text-white text-center pb-4'>Saved News</Text>
                        <FlatList
                            data={savedNews.slice().reverse()}
                            renderItem={renderNewsItem}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                />
                            }
                        />
                    </View>
                )}
            </View>
            <Modal
                visible={webviewVisible}
                transparent={true}
                animationType="slide"
            >
                <View style={styles.modalContainer}>
                    <WebView source={{ uri: selectedUrl || '' }} style={styles.webview} />
                    <Pressable
                        style={styles.closeButton}
                        onPress={() => setWebviewVisible(false)}
                    >
                        <Text style={styles.closeButtonText}>Close</Text>
                    </Pressable>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#031e1f',
        padding: 16,
        marginBottom: 80,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#031e1f',
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noDataText: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
    },
    listContent: {
        paddingBottom: 16,
    },
    newsCard: {
        width: width * 0.9,
        marginVertical: 8,
        backgroundColor: '#223E3F',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
        position: 'relative',
        alignSelf: 'center',
    },
    newsImage: {
        width: '100%',
        height: 150,
    },
    newsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        padding: 12,
        color: '#fff',
    },
    publishedDate: {
        position: 'absolute',
        fontSize: 15,
        fontWeight: 'light',
        color: '#FAF9F6',
        bottom: 4,
        right: 6,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    webview: {
        flex: 1,
    },
    closeButton: {
        padding: 16,
        backgroundColor: 'red',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 18,
        color: '#fff',
    },
});

export default Saved;
