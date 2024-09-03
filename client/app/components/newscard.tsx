import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, Animated, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import Entypo from '@expo/vector-icons/Entypo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import eventEmitter from '../components/eventEmitter'
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

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
    onAudioComplete: () => void;
};

const NewsCard: React.FC<NewsCardProps> = React.memo(({ item, onPress, isVisible, stopAudio, onAudioComplete }) => {
    const [imageUri, setImageUri] = useState<string | null>(item.imageUrl);
    const [animation] = useState(new Animated.Value(1));
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const soundObject = useRef(new Audio.Sound());

    const isMounted = useRef(true);
    const audioOperationInProgress = useRef(false);
    const [isSaved, setIsSaved] = useState(false)

    const hapticPress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    };

    const [settings, setSettings] = useState({
        mute: false,
        autoScroll: false,
        headings: false,
        vibration: true
    });

    useFocusEffect(
        useCallback(() => {
            return () => {
                handleStopAudio();
            };
        }, [])
    );

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
        checkIfSaved();
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
    }, [isVisible, stopAudio, settings]);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const settingsString = await AsyncStorage.getItem('settings');

                if (settingsString) {
                    setSettings(JSON.parse(settingsString));
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
            }
        };

        fetchSettings();

        const settingsListener = (changedSetting: { mute: boolean; autoScroll: boolean; headings: boolean; }) => {
            setSettings(prevSettings => ({ ...prevSettings, ...changedSetting }));
        };

        eventEmitter.on('settingsChanged', settingsListener);

        return () => {
            eventEmitter.off('settingsChanged', settingsListener);
        };
    }, []);

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
        if (audioOperationInProgress.current || settings.mute) return;
        audioOperationInProgress.current = true;

        try {
            console.log(settings);

            await handleStopAudio();

            if (!isMounted.current) return;

            setIsLoading(true);

            if (!titleAudioBase64) {
                throw new Error('Invalid audio data.');
            }

            // Create a new Audio.Sound instance
            soundObject.current = new Audio.Sound();

            // Load and play title audio
            await soundObject.current.loadAsync({ uri: `data:audio/mp3;base64,${titleAudioBase64}` });

            if (!isMounted.current) return;

            setIsLoading(false);
            setIsPlaying(true);
            await soundObject.current.playAsync();

            // Handle playback status update
            soundObject.current.setOnPlaybackStatusUpdate(async (status) => {
                if (status.didJustFinish) {
                    setIsPlaying(false);

                    if (contentAudioBase64) {
                        setIsLoading(true);

                        try {
                            // Unload title audio and load content audio
                            await soundObject.current.unloadAsync(); // Unload title audio
                            await soundObject.current.loadAsync({ uri: `data:audio/mp3;base64,${contentAudioBase64}` });

                            if (!isMounted.current) return;

                            setIsPlaying(true);
                            setIsLoading(false);
                            await soundObject.current.playAsync();

                            // Handle playback status update for content audio
                            soundObject.current.setOnPlaybackStatusUpdate((status) => {
                                if (status.didJustFinish) {
                                    setIsPlaying(false);
                                    onAudioComplete();
                                }
                            });
                        } catch (error) {
                            console.error('Error playing content audio:', error);
                            setIsLoading(false);
                            setIsPlaying(false);
                        }
                    } else {
                        onAudioComplete();
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
        if (settings.vibration) {
            hapticPress();
        }
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

    const toggleSaveNews = async () => {
        if (settings.vibration) {
            hapticPress();
        }
        try {
            const savedNewsString = await AsyncStorage.getItem('saved-news');
            const savedNewsArray = savedNewsString ? JSON.parse(savedNewsString) : [];
            const isAlreadySaved = savedNewsArray.some((news: any) => news.title === item.title);

            if (isAlreadySaved) {
                // Unsave the news
                const updatedNewsArray = savedNewsArray.filter((news: any) => news.title !== item.title);
                await AsyncStorage.setItem('saved-news', JSON.stringify(updatedNewsArray));
                setIsSaved(false);
            } else {
                // Save the news
                const updatedNewsArray = [...savedNewsArray, item];
                await AsyncStorage.setItem('saved-news', JSON.stringify(updatedNewsArray));
                setIsSaved(true);
            }
        } catch (error) {
            console.error('Error saving/removing news:', error);
        }
    };

    const checkIfSaved = async () => {
        try {
            const savedNewsString = await AsyncStorage.getItem('saved-news');
            const savedNewsArray = savedNewsString ? JSON.parse(savedNewsString) : [];
            const isAlreadySaved = savedNewsArray.some((news: any) => news.title === item.title);
            setIsSaved(isAlreadySaved);
        } catch (error) {
            console.error('Error checking saved news:', error);
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

            <View className=' relative h-1 bg-orange-600 w-full flex justify-center items-center'>
                <View className='absolute left-5 -top-9 h-16 w-16 rounded-full flex justify-center items-center overflow-hidden z-50'>
                    <View className="h-3/5 w-full bg-inherit absolute top-0" />
                    <View className="h-2/5 w-full bg-orange-600 absolute bottom-0" />
                    {item.sourceImageUrl && item.sourceImageUrl.length > 0 && (
                        <TouchableOpacity
                            onPress={() => { onPress(item.urls[0]), hapticPress() }}
                        >
                            <Image source={{ uri: item.sourceImageUrl[0] }} style={styles.bubbleImage} />
                        </TouchableOpacity>
                    )}
                </View>
                <Text className="w-full text-gray-300 text-[16px] absolute top-2 left-20 pl-2">{item.date}</Text>
            </View>

            <ScrollView style={styles.contentContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.content}>{item.content}</Text>
                {/* <Text style={styles.date}>{item.date}</Text> */}
                {/* <Text style={styles.sourcetext}>समाचार स्रोतहरू:</Text> */}
                <View className='w-full' style={styles.bubbleContainer}>
                    {/* {item.sourceImageUrl && item.sourceImageUrl.length > 0 && item.sourceImageUrl.map((url, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => onPress(item.urls[index])}
                            style={styles.bubbleItem}
                        >
                            <Image source={{ uri: url }} style={styles.bubbleImage} />
                        </TouchableOpacity>
                    ))} */}
                    <View className='flex justify-center items-center w-7 h-7'>
                        {isLoading && (
                            <ActivityIndicator size="small" color="#fff" style={styles.audioIndicator} />
                        )}
                        {isPlaying && (
                            <TouchableOpacity
                                onPress={handleStopAudio}
                                className='p-3'
                            >
                                <Entypo name="sound" size={24} color="white" style={styles.audioIndicator} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </ScrollView>
            <TouchableOpacity onPress={toggleSaveNews}>
                <View className='absolute bottom-24 right-5 p-3 flex justify-center items-center mt-2'>
                    <Image
                        source={
                            isSaved
                                ? require('../../assets/icons/save-fill.png')
                                : require('../../assets/icons/save.png')
                        }
                        className='h-7 w-7'
                    />
                </View>
            </TouchableOpacity>
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
        paddingTop: 40,
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
        marginBottom: 10
    },
    bubbleImage: {
        width: 56,
        height: 56,
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