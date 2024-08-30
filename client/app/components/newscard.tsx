import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, Animated, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import Entypo from '@expo/vector-icons/Entypo';

const { height, width } = Dimensions.get('window');
const fallbackImage = require('../../assets/images/fallback.png');

type NewsCardProps = {
    item: {
        title: string;
        date: string;
        content: string;
        imageUrl: string | null;
        sourceImageUrl: string[];
        urls: string[];
        titleAudio: string;
        contentAudio: string;
    };
    onPress: (url: string) => void;
    isVisible: boolean;
    stopAudio: boolean;
};

const NewsCard: React.FC<NewsCardProps> = React.memo(({ item, onPress, isVisible, stopAudio }) => {
    const [imageUri, setImageUri] = useState<string | null>(item.imageUrl);
    const [animation] = useState(new Animated.Value(1));
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const soundObject = useRef(new Audio.Sound());

    const isMounted = useRef(true);
    const audioOperationInProgress = useRef(false);
    const [autoScroll, setAutoScroll] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

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
        return () => {
            isMounted.current = false;
            handleCleanup();
        };
    }, []);

    useEffect(() => {
        if (isVisible && !stopAudio) {
            handlePlayAudio(item.titleAudio, item.contentAudio);
        } else {
            handleStopAudio();
        }
    }, [isVisible, stopAudio]);

    const handleCleanup = async () => {
        if (soundObject.current) {
            try {
                await soundObject.current.unloadAsync();
            } catch (error) {
                console.error('Error unloading audio:', error);
            }
            soundObject.current = null;
        }
    };

    const handlePlayAudio = async (titleAudioBase64: string, contentAudioBase64: string) => {
        if (audioOperationInProgress.current) return;
        audioOperationInProgress.current = true;

        try {
            await handleStopAudio();

            if (!isMounted.current) return;

            setIsLoading(true);

            if (!titleAudioBase64) {
                throw new Error('Invalid audio data.');
            }

            soundObject.current = new Audio.Sound();
            await soundObject.current.loadAsync({ uri: `data:audio/mp3;base64,${titleAudioBase64}` });

            if (!isMounted.current) return;

            setIsLoading(false);
            setIsPlaying(true);
            await soundObject.current.playAsync();

            soundObject.current.setOnPlaybackStatusUpdate(async (status) => {
                if (status.didJustFinish) {
                    setIsPlaying(false);

                    // Check if content audio data is valid
                    if (contentAudioBase64) {
                        setIsLoading(true);

                        try {
                            // Load and play the content audio
                            await soundObject.current.unloadAsync(); // Unload title audio first
                            await soundObject.current.loadAsync({ uri: `data:audio/mp3;base64,${contentAudioBase64}` });

                            if (!isMounted.current) return;

                            setIsPlaying(true);
                            setIsLoading(false);
                            await soundObject.current.playAsync();

                            // Handle playback completion of content audio
                            soundObject.current.setOnPlaybackStatusUpdate((status) => {
                                if (status.didJustFinish) {
                                    setIsPlaying(false);
                                }
                            });
                        } catch (error) {
                            console.error('Error playing content audio:', error);
                            setIsLoading(false);
                            setIsPlaying(false);
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error playing audio:', error);
            if (isMounted.current) {
                setIsLoading(false);
                setIsPlaying(false);
            }
        } finally {
            audioOperationInProgress.current = false;
        }
    };

    const handleStopAudio = async () => {
        if (audioOperationInProgress.current) return;
        audioOperationInProgress.current = true;

        try {
            if (soundObject.current) {
                const status = await soundObject.current.getStatusAsync();
                if (status.isLoaded) {
                    if (status.isPlaying) {
                        await soundObject.current.stopAsync();
                    }
                    await soundObject.current.unloadAsync();
                }
                soundObject.current = null;
            }
        } catch (error) {
            console.error('Error handling audio:', error);
        } finally {
            if (isMounted.current) {
                setIsPlaying(false);
                setIsLoading(false);
            }
            audioOperationInProgress.current = false;
        }
    };

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
                    <Image
                        source={fallbackImage}
                        style={styles.image}
                        resizeMode='cover'
                        onError={handleImageError}
                    />
                )}
            </View>
            <View className='h-1 bg-white w-full' />
            <ScrollView style={styles.contentContainer}>
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

                    {isLoading && (
                        <ActivityIndicator size="small" color="#fff" style={styles.audioIndicator} />
                    )}
                    {isPlaying && (
                        <Entypo name="sound" size={24} color="white" style={styles.audioIndicator} />
                    )}
                </View>
            </ScrollView>
        </View>
    );
});

const styles = StyleSheet.create({
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
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        overflow: 'hidden',
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
        color: '#fff',
    },
    date: {
        fontSize: 16,
        color: '#959595',
        marginBottom: 6,
        marginLeft: 2,
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
    button: {
        borderColor: 'white',
        borderWidth: 1,
        padding: 10,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    audioIndicator: {
        marginLeft: 10,
    },
});

export default NewsCard;
