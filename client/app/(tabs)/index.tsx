import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Animated, Text, StyleSheet, Dimensions, ActivityIndicator, StatusBar, Modal, TouchableOpacity } from 'react-native';
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
import ProtectedRoute from '../components/ProtectedRoute';

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

  const scrollY = useRef(new Animated.Value(0)).current;
  const modalTranslateY = useSharedValue(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const fetchData = useCallback(async (page: any) => {
    try {
      setLoading(true);
      const response = await fetch(`https://flynk.onrender.com/api/news?page=${page}&limit=${PAGE_SIZE}`);
      const data = await response.json();
      if (data.length < PAGE_SIZE) {
        setHasMore(false); // No more data if less than PAGE_SIZE is returned
      }
      setNewsData((prevData) => [...prevData, ...data]); // Append new data to existing data
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(page);
  }, [page, fetchData]);

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

  if (loading) {
    return (
      // <View style={styles.loaderContainer}>
      //   <ActivityIndicator size="large" color="#007bff" />
      // </View>
      <View style={styles.cardContainer}>
        <View style={styles.imageContainer}>
          <Animated.View style={[styles.skeletonContainer, { opacity: pulseAnim }]}>
            <View style={styles.skeletonInner} />
          </Animated.View>
        </View>
        <View className='h-1 bg-white w-full' />
        <View style={styles.contentContainer}>
          {/* TIme  */}
          <Animated.View className="h-4 mt-3 w-36 bg-gray-200 rounded-full dark:bg-gray-400 mb-6">

          </Animated.View>

          {/* Heading */}
          <Animated.View className="h-8 w-full bg-gray-200 rounded-full dark:bg-gray-400 mb-3">

          </Animated.View>
          <Animated.View className="h-8 w-48 bg-gray-200 rounded-full dark:bg-gray-400 mb-6">

          </Animated.View>

          {/* Content  */}
          <Animated.View className="h-4 w-full bg-gray-200 rounded-full dark:bg-gray-400 mb-3">

          </Animated.View>
          <Animated.View className="h-4 w-full bg-gray-200 rounded-full dark:bg-gray-400 mb-3">

          </Animated.View>
          <Animated.View className="h-4 w-full bg-gray-200 rounded-full dark:bg-gray-400 mb-3">

          </Animated.View>
          <Animated.View className="h-4 w-full bg-gray-200 rounded-full dark:bg-gray-400 mb-3">

          </Animated.View>
          <Animated.View className="h-4 w-full bg-gray-200 rounded-full dark:bg-gray-400 mb-3">

          </Animated.View>

          {/* Sources Text */}
          <Animated.View className="h-4 w-36 bg-gray-200 rounded-full dark:bg-gray-400 mb-6">

          </Animated.View>

          <View className='flex flex-row space-x-4'>
            {/* Sources Text */}
            <Animated.View className="h-16 w-16 bg-gray-200 rounded-full dark:bg-gray-400">

            </Animated.View>
            <Animated.View className="h-16 w-16 bg-gray-200 rounded-full dark:bg-gray-400">

            </Animated.View>

            <Animated.View className="h-16 w-16 bg-gray-200 rounded-full dark:bg-gray-400">

            </Animated.View>
            <Animated.View className="h-16 w-16 bg-gray-200 rounded-full dark:bg-gray-400">

            </Animated.View>
            <Animated.View className="h-16 w-16 bg-gray-200 rounded-full dark:bg-gray-400">

            </Animated.View>

          </View>
        </View>
      </View>
    );
  }

  return (
    <ProtectedRoute>
      <View style={{ backgroundColor: '#031e1f' }}>
        <StatusBar barStyle="light-content" backgroundColor="#252525" />
        <Animated.FlatList
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
                <TouchableOpacity style={styles.closeButtonContainer} onPress={() => setShowWebView(false)}>
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
    </ProtectedRoute>
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

