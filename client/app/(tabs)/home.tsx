import React, { useEffect, useState, useRef } from 'react';
import { Image, StyleSheet, View, Text, ActivityIndicator, Dimensions, Platform } from 'react-native';
import axios from 'axios';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, useAnimatedGestureHandler, runOnJS } from 'react-native-reanimated';
import AntDesign from '@expo/vector-icons/AntDesign';
import FastImage from 'react-native-fast-image';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface NewsItem {
    title: string;
    imageUrl: string;
    link: string;
    content: string;
}

const { height } = Dimensions.get('window');

export default function Home() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const translateY = useSharedValue(0);

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
            translateY.value = event.translationY;
        },
        onEnd: (event) => {
            if (event.translationY > 50 && currentIndex > 0) {
                translateY.value = withSpring(height, { damping: 20 }, () => {
                    runOnJS(setCurrentIndex)(currentIndex - 1);
                    translateY.value = 0;  // Reset translateY after index change
                });
            } else if (event.translationY < -50 && currentIndex < news.length - 1) {
                translateY.value = withSpring(-height, { damping: 20 }, () => {
                    runOnJS(setCurrentIndex)(currentIndex + 1);
                    translateY.value = 0;  // Reset translateY after index change
                });
            } else {
                translateY.value = withSpring(0);  // Reset translateY if swipe not significant
            }
        }
    });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }]
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
                    <ThemedText type='title'>{news[currentIndex].title}</ThemedText>
                    <ThemedText>{news[currentIndex].content}</ThemedText>
                    <AntDesign className='absolute right-0 bottom-0 p-10' name="sharealt" size={24} color="white" />
                </ThemedView>
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
    hiddenImage: {
        width: 0,
        height: 0,  // Hidden but preloaded
    },
    titleContainer: {
        padding: 20,
        backgroundColor: 'rgba(0,0,0,0.8)',
        position:'relative'
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
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    pageIndicator: {
        fontSize: 16,
        color: 'white',
    },
    titleContainerMain: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    stepContainer: {
        gap: 8,
        marginBottom: 8,
    },
    reactLogo: {
        height: 178,
        width: 290,
        bottom: 0,
        left: 0,
        position: 'absolute',
    },
});
