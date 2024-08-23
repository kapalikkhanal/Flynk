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

const News: React.FC = () => {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showWebView, setShowWebView] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [webViewLoading, setWebViewLoading] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const modalTranslateY = useSharedValue(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://flynk.onrender.com/api/news');
        const data = await response.json();
        setNewsData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenWebView = useCallback((url) => {
    setCurrentUrl(url);
    setShowWebView(true);
    setWebViewLoading(true);
  }, []);

  const handleCloseWebView = () => {
    setShowWebView(false);
    setCurrentUrl('');
  };

  const openFirstSourceUrl = useCallback(() => {
    if (newsData.length > 0) {
      const firstUrl = newsData[0].source;
      handleOpenWebView(firstUrl);
    }
  }, [newsData, handleOpenWebView]);

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

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

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
        <NewsCard item={item} onPress={handleOpenWebView} />
      </Animated.View>
    );
  };

  const getItemLayout = (data, index) => ({
    length: height,
    offset: height * index,
    index,
  });


  return (
    <ProtectedRoute>
      <View style={{ backgroundColor: 'black' }}>
        <StatusBar barStyle="light-content" backgroundColor="#252525" />
        <Animated.FlatList
          data={newsData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={height}
          decelerationRate="fast"
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          getItemLayout={getItemLayout}
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
});

export default News;

