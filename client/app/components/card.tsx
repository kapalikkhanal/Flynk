import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, Dimensions, StyleSheet, TouchableOpacity, Modal, TextInput, Button, Animated } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animateds, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    useAnimatedGestureHandler,
    runOnJS,
    useAnimatedReaction,
} from 'react-native-reanimated';
import { useNavigation, useIsFocused } from '@react-navigation/native';

const { height, width } = Dimensions.get('window');

const fallbackImage = require('../../assets/images/flynk.png');

interface NewsCardProps {
    item: {
        imageUrl: string;
        title: string;
        content: string;
        date: string;
        sourceImageUrl?: string[];
        urls: string[];
    };
    onShare: (item: NewsCardProps['item']) => void;
    onImagePress: (url: string) => void;
    onSpeak: (texts: string[]) => void;
}

const NewsCard: React.FC<NewsCardProps> = React.memo(({ item, onImagePress, onSpeak, onShare }) => {
    const [imageUri, setImageUri] = useState(item.imageUrl);
    const [animation] = useState(new Animated.Value(1)); // Scale factor for zoom
    const [isCommentModalVisible, setCommentModalVisible] = useState(false);
    const [comment, setComment] = useState('');
    const [liked, setLiked] = useState(false);
    const [tts, setTts] = useState(false);
    const scaleValue = useRef(new Animated.Value(1)).current;

    const modalTranslateY = useSharedValue(0);

    const closeModal = () => {
        setCommentModalVisible(false);
    };

    const handleModalSwipe = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
        onActive: (event) => {
            if (event.translationY > 0) {
                modalTranslateY.value = event.translationY;
            }
        },
        onEnd: (event) => {
            if (event.translationY > 100) {
                runOnJS(closeModal)();
            } else {
                modalTranslateY.value = withSpring(0, { damping: 20 });
            }
        },
    });

    const animatedModalStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: modalTranslateY.value }],
    }));


    const handleImageError = () => {
        setImageUri(fallbackImage);
    };

    const startAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animation, {
                    toValue: 1.12, // Zoom in
                    duration: 6000,
                    useNativeDriver: true,
                }),
                Animated.timing(animation, {
                    toValue: 1, // Zoom out
                    duration: 6000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    useEffect(() => {
        startAnimation(); // Start animation when component mounts
    }, []);

    const animatedStyle = {
        transform: [{ scale: animation }]
    };

    const handleCommentIconPress = () => {
        setCommentModalVisible(true);
    };

    const handleCommentSubmit = () => {
        // Handle comment submission logic
        console.log('Comment submitted:', comment);
        setCommentModalVisible(false); // Close the modal after submitting
        setComment(''); // Clear the comment field
    };

    const handleLikePress = () => {
        setLiked(!liked);

        Animated.sequence([
            Animated.spring(scaleValue, {
                toValue: 1.5,
                friction: 3,
                useNativeDriver: true,
            }),
            Animated.spring(scaleValue, {
                toValue: 1,
                friction: 3,
                useNativeDriver: true,
            })
        ]).start();
    };

    const handleTtsPress = () => {
        setTts(!tts);

        Animated.sequence([
            Animated.spring(scaleValue, {
                toValue: 1.5,
                friction: 3,
                useNativeDriver: true,
            }),
            Animated.spring(scaleValue, {
                toValue: 1,
                friction: 3,
                useNativeDriver: true,
            })
        ]).start();
    };

    return (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <View style={styles.imageContainer}>
                    <Animated.Image
                        source={{ uri: imageUri }}
                        style={[styles.image, animatedStyle]}
                        resizeMode="cover"
                        onError={handleImageError}
                    />
                </View>
                <View className='h-1 bg-white w-full' />
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.content}>{item.content}</Text>
                    <Text style={styles.date}>{item.date}</Text>
                    <View style={styles.bubbleContainer}>
                        {item.sourceImageUrl && item.sourceImageUrl.length > 0 && item.sourceImageUrl.map((url, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => onImagePress(item.urls[index])}
                                style={styles.bubbleItem}
                            >
                                <Image source={{ uri: url }} style={styles.bubbleImage} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
                <View className='absolute bottom-36 h-16 w-full flex flex-row justify-evenly items-center pb-2'>

                    <TouchableOpacity className='p-3' onPress={handleTtsPress}>
                        <Animated.View style={animatedStyle}>
                            {tts ? (
                                <MaterialCommunityIcons name="text-to-speech" size={36} color="white" />
                            ) : (
                                <MaterialCommunityIcons name="text-to-speech-off" size={36} color="white" />
                            )}
                        </Animated.View>
                    </TouchableOpacity>

                    <AntDesign name="sharealt" size={36} color="white" onPress={() => onShare(item)} />

                    <TouchableOpacity className='p-3' onPress={handleCommentIconPress} >
                        <Animated.View style={animatedStyle}>
                            <FontAwesome5 name="comment-alt" size={30} color="white" />
                        </Animated.View>
                    </TouchableOpacity>
                    <TouchableOpacity className='p-3' onPress={handleLikePress}>
                        <Animated.View style={animatedStyle}>
                            {liked ? (
                                <AntDesign name="heart" size={30} color="red" />
                            ) : (
                                <AntDesign name="hearto" size={30} color="white" />
                            )}
                        </Animated.View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Comment Modal */}
            <Modal
                visible={isCommentModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setCommentModalVisible(false)}
            >
                <PanGestureHandler onGestureEvent={handleModalSwipe}>
                    <Animateds.View style={[styles.modalContainer, animatedModalStyle]}>

                        <View style={styles.indicatorContainer}>
                            <View style={styles.indicator} />
                            <Text style={styles.indicatorText}>Comments</Text>
                        </View>

                        <View style={styles.modalContent}>
                            <View className='flex flex-row justify-center items-center border border-white rounded-3xl  px-7 bg-gray-700'>
                                <TextInput
                                    className='w-full h-16'
                                    placeholder="Write your comment..."
                                    placeholderTextColor="gray"
                                    value={comment}
                                    onChangeText={setComment}
                                />
                                <MaterialCommunityIcons name="send" size={30} color="white" onPress={handleCommentSubmit} />
                            </View>
                        </View>

                    </Animateds.View>
                </PanGestureHandler>
            </Modal>
        </View >
    );
});

const styles = StyleSheet.create({
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
        height: '36%',
    },
    image: {
        ...StyleSheet.absoluteFillObject,
    },
    textContainer: {
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
    },
    content: {
        fontSize: 17,
        color: 'white',
        marginBottom: 8,
    },
    date: {
        fontSize: 16,
        color: 'white',
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
    modalContainer: {
        height: height * 0.8,
        backgroundColor: 'rgba(55, 65, 81, 0.95)',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
    modalContent: {
        width: '100%',
        padding: 20,
        backgroundColor: 'rgba(55, 65, 81, 0.95)',
        borderRadius: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
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
        color: '#252525',
        fontWeight: '600',
        paddingTop: 10,
    },
    commentInput: {
        height: 100,
        width: '100%',
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 4,
        padding: 10,
        marginBottom: 10,
        textAlignVertical: 'top',
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});

export default NewsCard;
