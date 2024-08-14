import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import axios from 'axios';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface NewsItem {
    title: string;
    imageUrl: string;
    link: string;
}

export default function Home() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await axios.get('http://192.168.101.6:3001/api/news');
                setNews(response.data);
            } catch (error) {
                console.error('Error fetching news:', error);
                setError('Failed to fetch news');
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    const goToNextNews = () => {
        if (currentIndex < news.length - 1) {
            setCurrentIndex(prevIndex => prevIndex + 1);
        }
    };

    const goToPreviousNews = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prevIndex => prevIndex - 1);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <ThemedText type="default">{error}</ThemedText>
            </View>
        );
    }

    if (news.length === 0) {
        return (
            <View style={styles.centered}>
                <ThemedText>No news available</ThemedText>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Image
                source={{ uri: news[currentIndex].imageUrl }}
                style={styles.image}
                resizeMode="cover"
            />
            <ThemedView style={styles.titleContainer}>
                <ThemedText style={styles.title}>{news[currentIndex].title}</ThemedText>
                <ThemedText type="link">
                    <Text href={news[currentIndex].link} target="_blank" rel="noopener noreferrer">Read more</Text>
                </ThemedText>
            </ThemedView>
            <View style={styles.navigationContainer}>
                <TouchableOpacity onPress={goToPreviousNews} disabled={currentIndex === 0}>
                    <ThemedText style={[styles.navButton, currentIndex === 0 && styles.disabledButton]}>Previous</ThemedText>
                </TouchableOpacity>
                <ThemedText style={styles.pageIndicator}>{`${currentIndex + 1} / ${news.length}`}</ThemedText>
                <TouchableOpacity onPress={goToNextNews} disabled={currentIndex === news.length - 1}>
                    <ThemedText style={[styles.navButton, currentIndex === news.length - 1 && styles.disabledButton]}>Next</ThemedText>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    image: {
        ...StyleSheet.absoluteFillObject,
    },
    titleContainer: {
        padding: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    title: {
        fontSize: 24,
        marginBottom: 10,
        color: 'white',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    navigationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    navButton: {
        fontSize: 18,
        color: 'white',
        padding: 10,
    },
    disabledButton: {
        opacity: 0.5,
    },
    pageIndicator: {
        fontSize: 16,
        color: 'white',
    },
});