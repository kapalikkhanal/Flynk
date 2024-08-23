import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animateds from 'react-native-reanimated';

const { height, width } = Dimensions.get('window');

const fallbackImage = require('../../assets/images/flynk.png');

const NewsCard = React.memo(({ item, onPress, onSwipe }) => {
    const [imageUri, setImageUri] = useState(item.imageUrl);
    const [animation] = useState(new Animated.Value(1));

    const handleImageError = () => {
        setImageUri(null);
    };

    const startAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animation, {
                    toValue: 1.12,
                    duration: 6000,
                    useNativeDriver: true,
                }),
                Animated.timing(animation, {
                    toValue: 1,
                    duration: 6000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    const animatedStyle = {
        transform: [{ scale: animation }],
    };

    useEffect(() => {
        startAnimation();
    }, []);

    return (
        <View style={styles.cardContainer}>
            <View style={styles.imageContainer}>
                {imageUri ? (
                    <Animated.Image
                        source={{ uri: imageUri }}
                        style={[styles.image, animatedStyle]}
                        resizeMode="cover"
                        onError={handleImageError}
                    />
                ) : (
                    <Animated.Image
                        source={fallbackImage}
                        style={[styles.image, animatedStyle]}
                        resizeMode='cover'
                        onError={handleImageError}
                    />
                )}
            </View>
            <View className='h-1 bg-white w-full' />
            <View style={styles.contentContainer}>
                <Text style={styles.date}>{item.date}</Text>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.content}>{item.content}</Text>
                <Text style={styles.sourcetext}>समाचार स्रोतहरू:</Text>
                <View style={styles.bubbleContainer}>
                    {item.sourceImageUrl && item.sourceImageUrl.length > 0 && item.sourceImageUrl.map((url, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => onPress(item.urls[index])}
                            style={styles.bubbleItem}
                        >
                            <Image source={{ uri: url }} style={styles.bubbleImage} />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    cardContainer: {
        flex: 1,
        width: width,
        height: height,
        backgroundColor: '#000',
        paddingBottom: 50,
    },
    cardContent: {
        flex: 1,
        overflow: 'hidden',
    },
    imageContainer: {
        overflow: 'hidden',
        height: '45%',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        overflow: 'hidden'
    },
    contentContainer: {
        flex: 1,
        paddingTop: 10,
        paddingLeft: 15,
        paddingRight: 15,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#fff',
    },
    content: {
        fontSize: 17,
        color: '#fff',
        marginBottom: 10,
    },
    sourcetext: {
        fontSize: 17,
        color: '#959595',
    },
    date: {
        fontSize: 15,
        color: '#858585',
        marginBottom: 4,
    },
    bubbleContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        alignItems: 'center',
        overflow: 'hidden',
    },
    bubbleItem: {
        marginTop: 20,
        marginRight: 16,
    },
    bubbleImage: {
        width: 50,
        height: 50,
        borderRadius: 50,
    },
});

export default NewsCard;
