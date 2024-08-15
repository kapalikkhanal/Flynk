import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View, Text, ActivityIndicator, Dimensions } from 'react-native';
import axios from 'axios';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, useAnimatedGestureHandler, runOnJS } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface NewsItem {
    title: string;
    imageUrl: string;
    link: string;
}

const { width } = Dimensions.get('window');

export default function Home() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const translateX = useSharedValue(0);

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

    const handleSwipe = useAnimatedGestureHandler({
        onActive: (event) => {
            translateX.value = event.translationX;
        },
        onEnd: (event) => {
            if (event.translationX > 50 && currentIndex > 0) {
                translateX.value = withSpring(width, { damping: 20 }, () => {
                    runOnJS(setCurrentIndex)(currentIndex - 1);
                    translateX.value = 0;  // Reset translateX after index change
                });
            } else if (event.translationX < -50 && currentIndex < news.length - 1) {
                translateX.value = withSpring(-width, { damping: 20 }, () => {
                    runOnJS(setCurrentIndex)(currentIndex + 1);
                    translateX.value = 0;  // Reset translateX after index change
                });
            } else {
                translateX.value = withSpring(0);  // Reset translateX if swipe not significant
            }
        }
    });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }]
    }));

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
        <PanGestureHandler onGestureEvent={handleSwipe}>
            <Animated.View style={[styles.container, animatedStyle]}>
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
                    <ThemedText style={styles.pageIndicator}>{`${currentIndex + 1} / ${news.length}`}</ThemedText>
                </View>
            </Animated.View>
        </PanGestureHandler>
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
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    pageIndicator: {
        fontSize: 16,
        color: 'white',
    },
});
