import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, SafeAreaView, Dimensions, Share, Text, Modal, StyleSheet, StatusBar } from 'react-native';
import axios from 'axios';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedGestureHandler,
  runOnJS,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { useNavigation, useIsFocused } from '@react-navigation/native';


import NewsCard from '../components/card';
import LoadingScreen from '../components/loadingScreen';
import ErrorScreen from '../components/errorScreen';
import WebViewScreen from '../components/webView';

const { height, width } = Dimensions.get('window');
const PRELOAD_COUNT = 3;

export interface NewsItem {
  imageUrl: string;
  title: string;
  content: string;
  date: string;
  sourceImageUrl?: string[];
  urls: string[];
  id: string;
}

export default function Home() {
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWebView, setShowWebView] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const imageCache = useRef<{ [key: string]: string }>({});

  const navigation = useNavigation();

  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const isLeftSwipe = useSharedValue(false);
  const isRightSwipe = useSharedValue(false);
  const isGestureActive = useSharedValue(false);
  const animatedIndex = useSharedValue(0);

  const modalTranslateY = useSharedValue(0);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await axios.get('https://flynk.onrender.com/api/news');
      setAllNews(response.data);
    } catch (error) {
      setError('Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  const handleLeftSwipe = useCallback(() => {
    const currentNewsItem = allNews[currentIndex];
    if (currentNewsItem && currentNewsItem.urls[0]) {
      setCurrentUrl(currentNewsItem.urls[0]);
      setShowWebView(true);
    }
  }, [allNews, currentIndex]);

  const handleRightSwipe = useCallback(() => {
    navigation.navigate('home');
  }, [navigation]);

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

  const handleSwipe = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: () => {
      isGestureActive.value = true;
      translateX.value = 0;
      translateY.value = 0;
    },
    onActive: (event) => {
      const isHorizontal = Math.abs(event.translationX) > Math.abs(event.translationY);
      translateX.value = 0;
      translateY.value = 0;
      if (isHorizontal) {
        translateX.value = event.translationX;
        translateY.value = 0;
        opacity.value = 1 - Math.abs(event.translationX) / width;
        isLeftSwipe.value = event.translationX < 0;
        isRightSwipe.value = event.translationX > 0;
      } else {
        translateY.value = event.translationY;
        translateX.value = 0;
        opacity.value = 1 - Math.abs(event.translationY) / height;
        isLeftSwipe.value = false;
        isRightSwipe.value = false;
      }
    },
    onEnd: (event) => {
      isGestureActive.value = false;
      if (isLeftSwipe.value) {
        translateX.value = withSpring(-width * 0.5, { damping: 20 }, () => {
          runOnJS(handleLeftSwipe)();
          translateX.value = 0;
          translateX.value = 0;
          opacity.value = 1;
        });
      } else if (isRightSwipe.value) {
        translateX.value = withSpring(width * 0.5, { damping: 20 }, () => {
          runOnJS(handleRightSwipe)();
          translateX.value = 0;
          translateX.value = 0;
          opacity.value = 1;
        });
      } else if (event.translationY > 50 && currentIndex > 0) {
        translateY.value = withSpring(height, { damping: 20 }, () => {
          runOnJS(setCurrentIndex)(currentIndex - 1);
          animatedIndex.value = currentIndex - 1;
          translateY.value = 0;
          translateX.value = 0;
          opacity.value = 1;
        });
      } else if (event.translationY < -50 && currentIndex < allNews.length - 1) {
        translateY.value = withSpring(-height, { damping: 20 }, () => {
          runOnJS(setCurrentIndex)(currentIndex + 1);
          animatedIndex.value = currentIndex + 1;
          translateY.value = 0;
          translateX.value = 0;
          opacity.value = 1;
        });
      } else {
        translateY.value = withSpring(0);
        translateX.value = withSpring(0);
        opacity.value = withSpring(1);
      }
    },
  });

  const handleModalSwipe = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onActive: (event) => {
      if (event.translationY > 0) {
        modalTranslateY.value = event.translationY;
      }
    },
    onEnd: (event) => {
      if (event.translationY > 100) {
        runOnJS(setShowWebView)(false);
      } else {
        modalTranslateY.value = withSpring(0, { damping: 20 });
      }
    },
  });

  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: modalTranslateY.value }],
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const handleImagePress = (url: string) => {
    setCurrentUrl(url);
    setShowWebView(true);
  };

  const shareNews = async (newsItem: NewsItem) => {
    try {
      await Share.share({
        message: `${newsItem.title}\n${newsItem.content}\nRead more at: ${newsItem.url}`,
      });
    } catch (error) {
      console.error('Error sharing news:', error);
    }
  };

  if (loading) return <LoadingScreen />;

  if (error) return <ErrorScreen errorMessage={error} />;

  if (allNews.length === 0) return <Text>No news available</Text>;

  const startIndex = Math.max(0, currentIndex - PRELOAD_COUNT);
  const endIndex = Math.min(allNews.length - 1, currentIndex + PRELOAD_COUNT);
  const visibleNews = allNews.slice(startIndex, endIndex + 1);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <StatusBar barStyle="light-content" backgroundColor="#252525" />
      <PanGestureHandler onGestureEvent={handleSwipe}>
        <Animated.View style={{ flex: 1 }}>
          {visibleNews.map((newsItem, index) => (
            <Animated.View
              key={newsItem.id}
              style={[
                {
                  position: 'absolute',
                  top: (index - (currentIndex - startIndex)) * height,
                  left: 0,
                  right: 0,
                  height,
                  justifyContent: 'center',
                  alignItems: 'center',
                },
                animatedIndex.value === currentIndex ? animatedStyle : { opacity: 0 },
              ]}
            >
              <NewsCard
                item={{
                  ...newsItem,
                  imageUrl: imageCache.current[newsItem.imageUrl] || newsItem.imageUrl,
                }}
                onShare={shareNews}
                onImagePress={handleImagePress}
                onSpeak={function (texts: string[]): void {
                  throw new Error('Function not implemented.');
                }} />
            </Animated.View>
          ))}
        </Animated.View>
      </PanGestureHandler>

      <Modal
        visible={showWebView}
        onRequestClose={() => setShowWebView(false)}
        animationType="slide"
        transparent={true}
      >
        <PanGestureHandler onGestureEvent={handleModalSwipe}>
          <Animated.View style={[styles.modalContainer, animatedModalStyle]}>

            <View style={styles.indicatorContainer}>
              <View style={styles.indicator} />
              <Text style={styles.indicatorText}>Swipe down to close</Text>
            </View>

            <PanGestureHandler onGestureEvent={handleModalSwipe}>
              <Animated.View style={{ flex: 1 }}>
                <WebViewScreen url={currentUrl} onClose={() => setShowWebView(false)} />
              </Animated.View>
            </PanGestureHandler>
          </Animated.View>
        </PanGestureHandler>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    height: height * 0.8,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  indicatorContainer: {
    width: '100%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
  },
  indicator: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#B0B0B0',
  },
  indicatorText: {
    color: '#B0B0B0',
    paddingTop: 10,
  },
});
