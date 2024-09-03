import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Animated, Text, StyleSheet, Dimensions, ScrollView, RefreshControl, ActivityIndicator, StatusBar, Modal, TouchableOpacity } from 'react-native';
import NewsCard from '../components/newscard';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animateds, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  useAnimatedGestureHandler,
} from 'react-native-reanimated';
import WebView from 'react-native-webview';
import eventEmitter from '../components/eventEmitter'
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const { height, width } = Dimensions.get('window');
const PAGE_SIZE = 10;

const News: React.FC = () => {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWebView, setShowWebView] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [webViewLoading, setWebViewLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const modalTranslateY = useSharedValue(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const flatListRef = useRef(null);

  const [settings, setSettings] = useState({
    mute: false,
    autoScroll: false,
    headings: false,
    vibration: true
  });

  const hapticPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
  };

  const fetchData = useCallback(async (page: any) => {
    try {
      setLoading(true);
      const response = await fetch(`https://flynk.onrender.com/api/news?page=${page}&limit=${PAGE_SIZE}`);
      const data = await response.json();
      // console.log(data);
      const news = data.news || [];
      if (news.length < PAGE_SIZE || data.currentPage >= data.totalPages) {
        setHasMore(false);
      }
      setNewsData((prevData) => [...prevData, ...news]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(page);
  }, [page, fetchData]);

  useEffect(() => {

    const fetchSettings = async () => {
      try {
        const storedSettings = await AsyncStorage.getItem('settings');
        if (storedSettings) {
          setSettings(JSON.parse(storedSettings));
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();

    const settingsListener = (changedSetting) => {
      setSettings(prevSettings => ({ ...prevSettings, ...changedSetting }));
    };

    eventEmitter.on('settingsChanged', settingsListener);

    return () => {
      eventEmitter.off('settingsChanged', settingsListener);
    };
  }, []);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleOpenWebView = useCallback((url) => {
    setCurrentUrl(url);
    setShowWebView(true);
    setWebViewLoading(true);
  }, []);

  const handleCloseWebView = () => {
    if (settings.vibration) {
      hapticPress();
    }
    setShowWebView(false);
    setCurrentUrl('');
  };

  const closeModal = useCallback(() => {
    setShowWebView(false);
  }, []);

  useEffect(() => {
    if (!showWebView) {
      modalTranslateY.value = withTiming(0, { duration: 300 });
    }
  }, [showWebView, modalTranslateY]);

  const handleModalSwipe = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onActive: (event) => {
      modalTranslateY.value = event.translationY > 0 ? event.translationY : 0;
    },
    onEnd: (event) => {
      if (event.translationY > height * 0.25) {
        modalTranslateY.value = withTiming(height, { duration: 300 }, () => {
          runOnJS(closeModal)();
        });
      } else {
        modalTranslateY.value = withSpring(0, { damping: 20 });
      }
    },
  });

  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: modalTranslateY.value }],
  }));

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event) => {
        const newIndex = Math.round(event.nativeEvent.contentOffset.y / height);
        if (newIndex !== currentIndex) {
          setCurrentIndex(newIndex);
          if (settings.vibration) {
            hapticPress();
          }
        }
      }
    }
  );

  const renderItem = ({ item, index }) => {
    const inputRange = [
      (index - 1) * height,
      index * height,
      (index + 1) * height,
    ];

    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    const opacity = scrollY.interpolate({
      inputRange,
      outputRange: [0.5, 1, 0.5],
      extrapolate: 'clamp',
    });
    return (
      <Animated.View style={{ transform: [{ scale }], opacity }}>
        <NewsCard
          item={item}
          onPress={handleOpenWebView}
          isVisible={index === currentIndex}
          stopAudio={index !== currentIndex}
          onAudioComplete={handleAutoScroll}
        />
      </Animated.View>
    );
  };

  const getItemLayout = (data, index) => ({
    length: height,
    offset: height * index,
    index,
  });

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const onRefresh = async () => {
    if (settings.vibration) {
      hapticPress();
    }
    setRefreshing(true);
    await fetchData(1);
    setRefreshing(false);
  };

  const handleAutoScroll = useCallback(() => {
    if (currentIndex < newsData.length - 1 && settings.autoScroll) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  }, [currentIndex, newsData.length, settings.autoScroll]);

  if (loading && newsData.length === 0) {
    return (
      <View style={styles.cardContainer}>
        <View style={styles.imageContainer}>
          <Animated.View style={[styles.skeletonContainer, { opacity: pulseAnim }]}>
            <View style={styles.skeletonInner} />
          </Animated.View>
        </View>
        <View style={{ height: 1, backgroundColor: 'white', width: '100%' }} />
        <View style={styles.contentContainer}>
          {/* Time  */}
          <Animated.View style={{ height: 16, marginTop: 12, width: 144, backgroundColor: '#e0e0e0', borderRadius: 8, marginBottom: 24 }} />

          {/* Heading */}
          <Animated.View style={{ height: 32, width: '100%', backgroundColor: '#e0e0e0', borderRadius: 8, marginBottom: 12 }} />
          <Animated.View style={{ height: 32, width: 192, backgroundColor: '#e0e0e0', borderRadius: 8, marginBottom: 24 }} />

          {/* Content  */}
          <Animated.View style={{ height: 16, width: '100%', backgroundColor: '#e0e0e0', borderRadius: 8, marginBottom: 12 }} />
          <Animated.View style={{ height: 16, width: '100%', backgroundColor: '#e0e0e0', borderRadius: 8, marginBottom: 12 }} />
          <Animated.View style={{ height: 16, width: '100%', backgroundColor: '#e0e0e0', borderRadius: 8, marginBottom: 12 }} />
          <Animated.View style={{ height: 16, width: '100%', backgroundColor: '#e0e0e0', borderRadius: 8, marginBottom: 12 }} />
          <Animated.View style={{ height: 16, width: '100%', backgroundColor: '#e0e0e0', borderRadius: 8, marginBottom: 12 }} />

          {/* Sources Text */}
          <Animated.View style={{ height: 16, width: 144, backgroundColor: '#e0e0e0', borderRadius: 8, marginBottom: 24 }} />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Animated.View style={{ height: 64, width: 64, backgroundColor: '#e0e0e0', borderRadius: 32 }} />
            <Animated.View style={{ height: 64, width: 64, backgroundColor: '#e0e0e0', borderRadius: 32 }} />
            <Animated.View style={{ height: 64, width: 64, backgroundColor: '#e0e0e0', borderRadius: 32 }} />
            <Animated.View style={{ height: 64, width: 64, backgroundColor: '#e0e0e0', borderRadius: 32 }} />
            <Animated.View style={{ height: 64, width: 64, backgroundColor: '#e0e0e0', borderRadius: 32 }} />
          </View>
        </View>
      </View>
    );
  } else if (newsData.length === 0) {
    return (
      <View className='h-[100%] w-full flex flex-col justify-center items-center bg-[#031e1f]'>
        <Text className='text-lg font-bold text-white'>No news available</Text>
        <Text className='text-sm font-light text-white'>Check your internet connection and try again.</Text>
        <TouchableOpacity style={styles.closeButton} onPress={fetchData}>
          <Text className='text-lg text-white font-medium text-center pt-10'>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={{ backgroundColor: '#031e1f' }}
    >
      <StatusBar barStyle="light-content" backgroundColor="#252525" />
      <View className="absolute h-16 w-full top-0 z-50 flex justify-center items-center">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: '42%' }}
        >
          <View className="flex-row items-end space-x-4">
            <View className='absolute top-12 ml-1.5 h-1.5 w-1.5 rounded-full bg-red-600' />
            <Text className="text-white font-extrabold text-md">For You</Text>
            <Text className="text-white font-extrabold text-md">Market</Text>
            <Text className="text-white font-extrabold text-md">Technology</Text>
            <Text className="text-white font-extrabold text-md">Sports</Text>
            <Text className="text-white font-extrabold text-md">Movies</Text>
            <Text className="text-white font-extrabold text-md">International</Text>
          </View>
        </ScrollView>
      </View>
      <Animated.FlatList
        ref={flatListRef}
        data={newsData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        decelerationRate="fast"
        onScroll={handleScroll}
        getItemLayout={getItemLayout}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        removeClippedSubviews={true}
        initialNumToRender={10}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
            colors={['#fff']}
          />
        }
      />

      <Modal
        animationType="none"
        transparent={true}
        visible={showWebView}
        onRequestClose={() => setShowWebView(false)}
      >
        <PanGestureHandler onGestureEvent={handleModalSwipe}>
          <Animateds.View style={[styles.modalContainer, animatedModalStyle]}>
            <TouchableOpacity style={styles.closeButton} onPress={handleCloseWebView}>
              <View style={styles.closeLine}></View>
              <Text className='text-sm text-gray-400 pt-2'>Swipe down to close</Text>
            </TouchableOpacity>
            <View style={styles.webViewContainer}>
              {webViewLoading && (
                <View style={styles.webViewLoader}>
                  <ActivityIndicator size="large" color="#007bff" />
                </View>
              )}
              <TouchableOpacity style={styles.closeButtonContainer} onPress={() => { setShowWebView(false), hapticPress() }}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
              <WebView
                source={{ uri: currentUrl }}
                onLoadEnd={() => setWebViewLoading(false)}
                style={{ opacity: webViewLoading ? 0 : 1 }}
              />
            </View>
          </Animateds.View>
        </PanGestureHandler>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#858585',
    borderTopEndRadius: 30,
    borderTopStartRadius: 30,
    marginTop: 100, // to show a small part of the screen when modal is swiped down
  },
  closeButton: {
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeLine: {
    width: 40,
    height: 5,
    backgroundColor: '#aaa',
    borderRadius: 2.5,
  },
  webViewContainer: {
    flex: 1,
  },
  webViewLoader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  closeButtonContainer: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'rgba(255,0,0,0.8)',
    padding: 16,
    zIndex: 1,
    width: '100%'
  },
  closeButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600'
  },
  cardContainer: {
    position: 'relative',
    flex: 1,
    width: width,
    height: height,
    backgroundColor: '#031e1f',
    paddingBottom: 50,
  },
  imageContainer: {
    overflow: 'hidden',
    height: '45%',
  },
  contentContainer: {
    flex: 1,
    paddingTop: 10,
    paddingLeft: 15,
    paddingRight: 15,
  },
  skeletonContainer: {
    width: '100%',
    height: '100%', // Adjust height based on your needs
    borderRadius: 8,
    backgroundColor: '#e0e0e0', // Light gray for skeleton
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  skeletonInner: {
    flex: 1,
    backgroundColor: '#d1d1d1', // Slightly darker gray for the inner part
    borderRadius: 8,
  },
});

export default News;

