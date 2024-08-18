import React, { useEffect, useState, useCallback } from 'react';
import { Image, Share, Button, StyleSheet, Alert, View, Text, ActivityIndicator, Dimensions, SafeAreaView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { PanGestureHandler, ScrollView } from 'react-native-gesture-handler';
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
import { Audio } from 'expo-av';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface NewsItem {
  title: string;
  imageUrl: string;
  url: string;
  content: string;
  date: string;
  sourceImageUrl: string;
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
        const response = await axios.get('https://flynk.onrender.com/api/news');
        setNews(response.data);
        // console.log(response.data)
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

  // const handleRightSwipe = useCallback(() => {
  //   if (showWebView) {
  //     setShowWebView(false);
  //   }
  //   else {
  //     navigation.navigate('home');
  //   }
  // }, [showWebView, navigation]);

  useAnimatedReaction(
    () => isLeftSwipe.value,
    (swipeLeft) => {
      if (swipeLeft) {
        runOnJS(handleLeftSwipe)();
        isLeftSwipe.value = false;
      }
    }
  );

  // useAnimatedReaction(
  //   () => isRightSwipe.value,
  //   (swipeRight) => {
  //     if (swipeRight) {
  //       runOnJS(handleRightSwipe)();
  //       isRightSwipe.value = false;
  //     }
  //   }
  // );

  const handleSwipe = useAnimatedGestureHandler({
    onActive: (event) => {
      translateY.value = event.translationY;
      // translateX.value = event.translationX;
    },
    onEnd: (event) => {
      translateY.value = 0;
      // translateX.value = 0;
      // if (event.translationX < -50) {
      //   isLeftSwipe.value = true;
      //   translateY.value = 0;
      //   translateX.value = 0;
      // } else if (event.translationX > 50) {
      //   isRightSwipe.value = true;
      //   translateY.value = 0;
      //   translateX.value = 0;
      // } 
      if (event.translationY > 50 && currentIndex > 0) {
        translateY.value = withSpring(height, { damping: 20 }, () => {
          runOnJS(setCurrentIndex)(currentIndex - 1);
          translateY.value = 0;
          // translateX.value = 0;
        });
      } else if (event.translationY < -50 && currentIndex < news.length - 1) {
        translateY.value = withSpring(-height, { damping: 20 }, () => {
          runOnJS(setCurrentIndex)(currentIndex + 1);
          translateY.value = 0;
          // translateX.value = 0;
        });
      } else {
        translateY.value = withSpring(0);
        // translateX.value = withSpring(0);
      }
    }
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { translateX: translateX.value }],
  }));

  const shareNews = async (newsItem: NewsItem) => {
    try {
      await Share.share({
        message: `${newsItem.title}\n${newsItem.content}\nRead more at: ${newsItem.url}`,
      });
    } catch (error) {
      console.error('Error sharing news:', error);
    }
  };

  const handleImagePress = (url: string) => {
    setCurrentUrl(url);
    setShowWebView(true);
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

  const fetchAudio = async (text) => {
    const apiKey = '773e319b7a7946abbedb93634e2270db'; // Replace with your Voice RSS API key
    const url = `https://api.voicerss.org/?key=${apiKey}&hl=hi-in&src=${encodeURIComponent(text)}`;

    try {
      const response = await fetch(url, { method: 'GET' });

      if (!response.ok) {
        // Log detailed error information
        const errorText = await response.text();
        throw new Error(`Failed to fetch audio: ${errorText}`);
      }

      const audioBlob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      return new Promise((resolve, reject) => {
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.onerror = reject;
      });
    } catch (error) {
      console.error('Error fetching audio:', error);
      throw error;
    }
  };

  const speakText = async (texts) => {
    try {
      for (const text of texts) {
        const base64Audio = await fetchAudio(text);
        const { sound } = await Audio.Sound.createAsync(
          { uri: base64Audio }
        );
        await sound.playAsync();
        await new Promise((resolve) => {
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.didJustFinish) {
              resolve();
            }
          });
        });
      }
    } catch (error) {
      console.error('Error with TTS:', error);
      Alert.alert('Error', `Failed to play audio.`);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {showWebView ? (
        <PanGestureHandler
          onGestureEvent={handleSwipe}
          activeOffsetX={[-30, 30]}
          activeOffsetY={[-30, 30]}
        >
          <Animated.View style={{ flex: 1 }}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowWebView(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
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
                    <View style={styles.bubbleContainer}>
                      {item.sourceImageUrl ? (
                        <TouchableOpacity onPress={() => handleImagePress(item.url)}>
                          <Image
                            source={{ uri: item.sourceImageUrl }}
                            style={styles.bubbleImage}
                          />
                        </TouchableOpacity>
                      ) : null}
                    </View>

                    <View>
                      <Button
                        title="Speak"
                        onPress={() => speakText([item.title, item.content])}
                      />
                    </View>
                  </View>

                  <View style={styles.iconContainer}>
                    <AntDesign
                      name="sharealt"
                      size={36}
                      color="gray"
                      onPress={() => shareNews(item)}
                    />
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
    bottom: 44,
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
  bubbleContainer: {
    marginTop: 10,
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'gray',
    justifyContent: 'center',
  },
  bubbleImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 36,
    right: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    zIndex: 1,
  },
  closeButtonText: {
    color: '#fff',
  },
});