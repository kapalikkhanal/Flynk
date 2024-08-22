import React, { useState } from 'react';
import { View, Modal, StyleSheet, Dimensions, Text } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedGestureHandler,
  runOnJS,
} from 'react-native-reanimated';

const { height } = Dimensions.get('window');

export default function CustomModal({ visible, onClose }) {
  const modalTranslateY = useSharedValue(0);

  const handleModalSwipe = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onActive: (event) => {
      if (event.translationY > 0) {
        modalTranslateY.value = event.translationY;
      }
    },
    onEnd: (event) => {
      if (event.translationY > 100) {
        runOnJS(onClose)();
      } else {
        modalTranslateY.value = withSpring(0, { damping: 20 });
      }
    },
  });

  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: modalTranslateY.value }],
  }));

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
      transparent={true}
    >
      <PanGestureHandler onGestureEvent={handleModalSwipe}>
        <Animated.View style={[styles.modalContainer, animatedModalStyle]}>
          <View style={styles.indicatorContainer}>
            <View style={styles.indicator} />
            <Text style={styles.indicatorText}>Swipe down to close</Text>
          </View>
          {/* Add your modal content here */}
          <View style={{ flex: 1, backgroundColor: 'white' }}>
            <Text>Modal Content</Text>
          </View>
        </Animated.View>
      </PanGestureHandler>
    </Modal>
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
