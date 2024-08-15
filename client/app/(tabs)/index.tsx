import React, { useEffect, useState, useCallback } from 'react';
import { Image, Button, StyleSheet, View, Text, ActivityIndicator, Dimensions, SafeAreaView } from 'react-native';
import axios from 'axios';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedGestureHandler,
  runOnJS,
  useAnimatedReaction
} from 'react-native-reanimated';
import AntDesign from '@expo/vector-icons/AntDesign';
import WebView from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface NewsItem {
  title: string;
  imageUrl: string;
  url: string;
  content: string;
  date: string;
}

const { height, width } = Dimensions.get('window');

export default function Home() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWebView, setShowWebView] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const isLeftSwipe = useSharedValue(false);
  const isRightSwipe = useSharedValue(false);

  const navigation = useNavigation();

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

  const handleLeftSwipe = useCallback(() => {
    const currentNewsItem = news[currentIndex];
    if (currentNewsItem && currentNewsItem.url) {
      setCurrentUrl(currentNewsItem.url);
      setShowWebView(true);
    }
  }, [news, currentIndex]);

  const handleRightSwipe = useCallback(() => {
    if (showWebView) {
      setShowWebView(false);
    }
    else{
      navigation.navigate('home');
    }
  }, [showWebView, navigation]);

  useAnimatedReaction(
    () => isLeftSwipe.value,
    (swipeLeft) => {
      if (swipeLeft) {
        runOnJS(handleLeftSwipe)();
        isLeftSwipe.value = false;
      }
    }
  );

  useAnimatedReaction(
    () => isRightSwipe.value,
    (swipeRight) => {
      if (swipeRight) {
        runOnJS(handleRightSwipe)();
        isRightSwipe.value = false;
      }
    }
  );

  const handleSwipe = useAnimatedGestureHandler({
    onActive: (event) => {
      translateY.value = event.translationY;
      translateX.value = event.translationX;
    },
    onEnd: (event) => {
      translateY.value = 0;
      translateX.value = 0;
      if (event.translationX < -50) {
        isLeftSwipe.value = true;
        translateY.value = 0;
        translateX.value = 0;
      } else if (event.translationX > 50) {
        isRightSwipe.value = true;
        translateY.value = 0;
        translateX.value = 0;
      } else if (event.translationY > 50 && currentIndex > 0) {
        translateY.value = withSpring(height, { damping: 20 }, () => {
          runOnJS(setCurrentIndex)(currentIndex - 1);
          translateY.value = 0;
          translateX.value = 0;
        });
      } else if (event.translationY < -50 && currentIndex < news.length - 1) {
        translateY.value = withSpring(-height, { damping: 20 }, () => {
          runOnJS(setCurrentIndex)(currentIndex + 1);
          translateY.value = 0;
          translateX.value = 0;
        });
      } else {
        translateY.value = withSpring(0);
        translateX.value = withSpring(0);
      }
    }
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { translateX: translateX.value }],
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

  const renderLoader = () => (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {showWebView ? (
        <PanGestureHandler
          onGestureEvent={handleSwipe}
          activeOffsetX={[-30, 30]}
          activeOffsetY={[-30, 30]}
        >
          <Animated.View style={{ flex: 1 }}>
            <WebView
              source={{ uri: currentUrl }}
              style={{ flex: 1 }}
            />
          </Animated.View>
        </PanGestureHandler>
      ) : (
        <PanGestureHandler
          onGestureEvent={handleSwipe}
          activeOffsetX={[-30, 30]}
          activeOffsetY={[-30, 30]}
        >
          <Animated.View style={[styles.container, animatedStyle]}>
            {news.slice(currentIndex, currentIndex + 3).map((item, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.card,
                  {
                    transform: [
                      { translateY: translateY.value + index * height },
                    ],
                  },
                ]}
              >
                <View style={styles.cardContent}>
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.image}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.content}>{item.content}</Text>
                    <Text style={styles.date}>{item.date}</Text>
                  </View>
                  <View style={styles.iconContainer}>
                    <AntDesign className='pb-6' name="like2" size={36} color="gray" />
                    <AntDesign className='pt-6' name="sharealt" size={36} color="gray" />
                  </View>
                </View>
              </Animated.View>
            ))}
          </Animated.View>
        </PanGestureHandler>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  cardContent: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  imageContainer: {
    height: '48%',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  textContainer: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  content: {
    fontSize: 18,
    color: 'white',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    color: 'white',
  },
  iconContainer: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});