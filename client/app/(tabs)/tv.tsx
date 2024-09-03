import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    FlatList,
    TouchableOpacity,
    Text,
    StatusBar,
    Image,
    ActivityIndicator,
    Alert,
    ScrollView,
} from 'react-native';
import { Video } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';

// Define the types for channel and state
type Channel = {
    name: string;
    slug?: string;
    uri?: string;
    icon: string;
};

const categories = {
    news: [
        {
            name: 'Kantipur MAX',
            uri: 'https:\/\/webott.viatv.com.np\/v0t1\/KntCineplexTv.stream\/playlist.m3u8',
            icon: 'https://ott1.viatv.com.np//images/channel/logo/Kantipur.jpg',
        },
        {
            name: 'API HD',
            uri: 'https:\/\/webott.viatv.com.np\/v0t1\/AP1576.stream\/playlist.m3u8',
            icon: 'https://ott1.viatv.com.np//images/channel/logo/AP_1.jpg',
        },
        {
            name: 'Prime HD',
            uri: 'https:\/\/webott.viatv.com.np\/v0t1\/PrimeTV576.stream\/playlist.m3u8',
            icon: 'https://ott1.viatv.com.np//images/channel/logo/PRIME_TIMES_HD.png',
        },
        {
            name: 'Himalaya TV',
            uri: 'https:\/\/webott.viatv.com.np\/v0t1\/HimalayaTv576.stream\/playlist.m3u8',
            icon: 'https://ott1.viatv.com.np//images/channel/logo/Himalaya_TV.jpg',
        },
        {
            name: 'Avenues TV',
            uri: 'https:\/\/webott.viatv.com.np\/v0t1\/Avenews,.stream\/playlist.m3u8',
            icon: 'https://ott1.viatv.com.np//images/channel/logo/Avenues_TV.jpg',
        },
        {
            name: 'ABC News',
            uri: 'https:\/\/webott.viatv.com.np\/v0t1\/ABCNews576.stream\/playlist.m3u8',
            icon: 'https://ott1.viatv.com.np//images/channel/logo/ABC_News.jpg',
        },
        {
            name: 'NTV',
            uri: 'https:\/\/webott.viatv.com.np\/v0t1\/Ntv576.stream\/playlist.m3u8',
            icon: 'https://ott1.viatv.com.np//images/channel/logo/Nepal_TV_HD.jpg',
        },
        {
            name: 'NTV News',
            uri: 'https:\/\/webott.viatv.com.np\/v0t1\/NtvNews576.stream\/playlist.m3u8',
            icon: 'https://ott1.viatv.com.np//images/channel/logo/NTV_News_HD.jpg',
        },
        {
            name: 'NTV Plus',
            uri: 'https:\/\/webott.viatv.com.np\/v0t1\/NtvPlus576.stream\/playlist.m3u8',
            icon: 'https://ott1.viatv.com.np//images/channel/logo/NTV_Plus_HD.jpg',
        },
        {
            name: 'News 24',
            uri: 'https:\/\/webott.viatv.com.np\/v0t1\/News24.stream\/playlist.m3u8',
            icon: 'https://ott1.viatv.com.np//images/channel/logo/News_24.jpg',
        },
        {
            name: 'Sagarmatha',
            uri: 'https:\/\/webott.viatv.com.np\/v0t1\/Sagarmatha.stream\/playlist.m3u8',
            icon: 'https://ott1.viatv.com.np//images/channel/logo/Sagarmatha.jpg',
        },
        {
            name: 'Janata',
            uri: 'https:\/\/webott.viatv.com.np\/v0t1\/Jantatv.stream\/playlist.m3u8',
            icon: 'https://ott1.viatv.com.np//images/channel/logo/Janata_TV.jpg',
        },
        {
            name: 'Mountain TV',
            uri: 'https:\/\/webott.viatv.com.np\/v0t1\/Mountain576.stream\/playlist.m3u8',
            icon: 'https://ott1.viatv.com.np//images/channel/logo/Mountain_TV.jpg',
        },
        {
            name: 'Image',
            uri: 'https:\/\/webott.viatv.com.np\/v0t1\/Image576.stream\/playlist.m3u8',
            icon: 'https://ott1.viatv.com.np//images/channel/logo/Image_Channel.jpg',
        },
        {
            name: 'YOHO TV',
            uri: 'https:\/\/webott.viatv.com.np\/v0t1\/YohoTV.stream\/playlist.m3u8',
            icon: 'https://ott1.viatv.com.np//images/channel/logo/Yoho_TV_HD.jpg',
        },

    ],
    movies: [
        {
            name: 'Raato Ghar',
            uri: 'https:\/\/webmov.viatv.com.np\/ottvod\/vod\/nep\/ratoghar\/VoDrato.mp4\/playlist.m3u8?wmsAuthSign=c2VydmVyX3RpbWU9OS8zLzIwMjQgMzoyMzo1MiBQTSZoYXNoX3ZhbHVlPWxuNFI2dnI4dzUvSXZKemdvYm4wOUE9PSZ2YWxpZG1pbnV0ZXM9NSZpZD0yMDM0MDZ+MjYzMzM0fldlYn44ZDE1Y2JhZTliZjAzMTc3OGNlMWE4NmY1NWVkMDlmZkNocm9tZTQ5NzE3fjE3MjUzNzcwMzJ+MTAuMTkuOC4wfn5Nb3ZpZX4xMDd+MTY3OTYw',
            icon: 'https://ott1.viatv.com.np//images/movie/logo/1620973720.jpeg',
        },
        {
            name: 'The Break Up',
            uri: 'https:\/\/webmov.viatv.com.np\/ottvod\/vod\/nep\/breakup\/VoDbreakup.mp4\/playlist.m3u8?wmsAuthSign=c2VydmVyX3RpbWU9OS8zLzIwMjQgMzoyNjoyNiBQTSZoYXNoX3ZhbHVlPVgvV2UwWFRtcU5YcUFvU1YrK1dnb1E9PSZ2YWxpZG1pbnV0ZXM9NSZpZD0yMDM0MDZ+MjYzMzM0fldlYn44ZDE1Y2JhZTliZjAzMTc3OGNlMWE4NmY1NWVkMDlmZkNocm9tZTQ5NzE3fjE3MjUzNzcxODZ+MTAuMTkuOTcuMTI4fn5Nb3ZpZX4xMTB+MTY3OTYw',
            icon: 'https://ott1.viatv.com.np//images/movie/logo/1620974096.jpeg',
        },
        {
            name: 'Bir Bikram 2',
            uri: 'https:\/\/webmov.viatv.com.np\/ottvod\/vod\/nep\/BB2\/VoDBB2.mp4\/playlist.m3u8?wmsAuthSign=c2VydmVyX3RpbWU9OS8zLzIwMjQgMzoyODowNyBQTSZoYXNoX3ZhbHVlPVp5WUdWUUdzcG5zNTlGTTgwaUd5MGc9PSZ2YWxpZG1pbnV0ZXM9NSZpZD0yMDM0MDZ+MjYzMzM0fldlYn44ZDE1Y2JhZTliZjAzMTc3OGNlMWE4NmY1NWVkMDlmZkNocm9tZTQ5NzE3fjE3MjUzNzcyODd+MTAuMTkuMzYuMH5+TW92aWV+NzB+MTY3OTYw',
            icon: 'https://ott1.viatv.com.np//images/movie/logo/1620967287.jpeg',
        },
        {
            name: 'Captain',
            uri: 'https:\/\/webmov.viatv.com.np\/ottvod\/vod\/nep\/captain\/VoDcaptain.mp4\/playlist.m3u8?wmsAuthSign=c2VydmVyX3RpbWU9OS8zLzIwMjQgMzoyOTo1OCBQTSZoYXNoX3ZhbHVlPTVvTkFkelc2RHhRY0lVZ1FwMWVYdXc9PSZ2YWxpZG1pbnV0ZXM9NSZpZD0yMDM0MDZ+MjYzMzM0fldlYn44ZDE1Y2JhZTliZjAzMTc3OGNlMWE4NmY1NWVkMDlmZkNocm9tZTQ5NzE3fjE3MjUzNzczOTh+MTAuMTkuOC4wfn5Nb3ZpZX43MX4xNjc5NjA=',
            icon: 'https://ott1.viatv.com.np//images/movie/logo/1620967425.jpeg',
        },
        {
            name: 'Gopi',
            uri: 'https:\/\/webmov.viatv.com.np\/ottvod\/vod\/nep\/gopi\/VoDgopi.mp4\/playlist.m3u8?wmsAuthSign=c2VydmVyX3RpbWU9OS8zLzIwMjQgMzozMTozNSBQTSZoYXNoX3ZhbHVlPVlSS0dDQUJUK29jZW04bWQzR3lNN3c9PSZ2YWxpZG1pbnV0ZXM9NSZpZD0yMDM0MDZ+MjYzMzM0fldlYn44ZDE1Y2JhZTliZjAzMTc3OGNlMWE4NmY1NWVkMDlmZkNocm9tZTQ5NzE3fjE3MjUzNzc0OTV+MTAuMTkuOTcuMTI4fn5Nb3ZpZX44Nn4xNjc5NjA=',
            icon: 'https://ott1.viatv.com.np//images/movie/logo/1620970814.jpeg',
        },
        {
            name: 'Jatrai Jatra',
            uri: 'https:\/\/webmov.viatv.com.np\/ottvod\/vod\/nep\/jatrai\/VoDjatrai.mp4\/playlist.m3u8?wmsAuthSign=c2VydmVyX3RpbWU9OS8zLzIwMjQgMzozMzowMSBQTSZoYXNoX3ZhbHVlPWY4ejFtRzMvaWU1MzM0NVBnV0hCOGc9PSZ2YWxpZG1pbnV0ZXM9NSZpZD0yMDM0MDZ+MjYzMzM0fldlYn44ZDE1Y2JhZTliZjAzMTc3OGNlMWE4NmY1NWVkMDlmZkNocm9tZTQ5NzE3fjE3MjUzNzc1ODF+MTAuMTkuOC4wfn5Nb3ZpZX43N34xNjc5NjA=',
            icon: 'https://ott1.viatv.com.np//images/movie/logo/1620968262.jpeg',
        },
        {
            name: 'Selfie King',
            uri: 'https:\/\/webmov.viatv.com.np\/ottvod\/vod\/nep\/selfie\/VoDselfie.mp4\/playlist.m3u8?wmsAuthSign=c2VydmVyX3RpbWU9OS8zLzIwMjQgMzozNDozMCBQTSZoYXNoX3ZhbHVlPTlSTmJtaHdmbG5wNW9wU2U1OUQ0VXc9PSZ2YWxpZG1pbnV0ZXM9NSZpZD0yMDM0MDZ+MjYzMzM0fldlYn44ZDE1Y2JhZTliZjAzMTc3OGNlMWE4NmY1NWVkMDlmZkNocm9tZTQ5NzE3fjE3MjUzNzc2NzB+MTcyLjMxLjEyLjMxfn5Nb3ZpZX45N34xNjc5NjA=',
            icon: 'https://ott1.viatv.com.np//images/movie/logo/1620972900.jpeg',
        },
        {
            name: 'Shatru Gate',
            uri: 'https:\/\/webmov.viatv.com.np\/ottvod\/vod\/nep\/shatru\/VoDshatru.mp4\/playlist.m3u8?wmsAuthSign=c2VydmVyX3RpbWU9OS8zLzIwMjQgMzozNjo0NCBQTSZoYXNoX3ZhbHVlPXVyQ0NKcG13ckkwYXJYMnNobFBhRnc9PSZ2YWxpZG1pbnV0ZXM9NSZpZD0yMDM0MDZ+MjYzMzM0fldlYn44ZDE1Y2JhZTliZjAzMTc3OGNlMWE4NmY1NWVkMDlmZkNocm9tZTQ5NzE3fjE3MjUzNzc4MDR+MTAuMTkuMTA1LjY0fn5Nb3ZpZX4xMDJ+MTY3OTYw',
            icon: 'https://ott1.viatv.com.np//images/movie/logo/1620973511.jpeg',
        },
    ],
};

const TV = () => {
    const videoRef = useRef<Video>(null);
    const [channels, setChannels] = useState<Record<string, Channel>>({});
    const [currentChannel, setCurrentChannel] = useState<Channel | null>('null');
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchAllChannelLinks = async () => {
            setLoading(true);
            const fetchedChannels: Record<string, Channel> = {};

            for (const category of Object.values(categories).flat()) {
                if (category) {
                    fetchedChannels[category.name.toLowerCase().replace(' ', '-')] = category;
                }

                setChannels(fetchedChannels);

                // Set default channel as Kantipur TV
                const defaultChannel = Object.values(fetchedChannels).find(channel => channel.name === 'Kantipur TV');
                if (defaultChannel) {
                    setCurrentChannel(defaultChannel);
                }

                setLoading(false);
            };
        }

        fetchAllChannelLinks();
    }, []);

    const handleChannelChange = (channelKey: string) => {
        setCurrentChannel(channels[channelKey]);
        if (videoRef.current) {
            videoRef.current.playAsync();
        }
    };

    const renderChannelItem = ({ item }: { item: Channel }) => (
        <TouchableOpacity
            style={styles.channelCard}
            onPress={() => handleChannelChange(item.slug || item.name.toLowerCase().replace(' ', '-'))}
        >
            <Image source={{ uri: item.icon }} style={styles.channelIcon} />
            <Text style={styles.channelText}>{item.name}</Text>
        </TouchableOpacity>
    );

    const renderCategory = (title: string, categoryChannels: Channel[], numColumns: number) => (
        <View style={styles.categoryContainer}>
            <Text style={styles.categoryHeading}>{title}</Text>
            <FlatList
                data={categoryChannels}
                renderItem={renderChannelItem}
                keyExtractor={(item) => item.name.toLowerCase().replace(' ', '-')}
                numColumns={numColumns}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
                key={numColumns}
            />
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            <View style={styles.container}>
                {loading ? (
                    <ActivityIndicator size="large" color="#fff" />
                ) : currentChannel && currentChannel.uri ? (
                    <View className='flex justify-center items-center flex-col'>
                        <Text className='text-lg pb-2 text-white/50 font-extrabold tracking-widest'>{currentChannel.name}</Text>
                        <Video
                            ref={videoRef}
                            source={{ uri: currentChannel.uri }}
                            style={styles.video}
                            useNativeControls
                            resizeMode="contain"
                            onError={(error) => {
                                console.error('Video Error:', error);
                                Alert.alert('Error', 'Failed to load the video stream.');
                            }}
                            shouldPlay
                        />
                    </View>
                ) : (
                    <View className='flex justify-center items-center flex-col'>
                        <Text className='text-lg pt-4' />
                        <View style={styles.video} className='bg-black'>
                            <Text className='absolute inset-x-0 top-20 flex justify-center items-center text-white text-center text-lg pt-4'>Select a channel to start streaming</Text>
                        </View>
                    </View>
                )}

                <ScrollView showsVerticalScrollIndicator={false}>
                    {renderCategory('TV Channels', categories.news, 3)}
                    {/* {renderCategory('Movies', categories.movies)} */}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#031e1f',
    },
    container: {
        backgroundColor: '#031e1f',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom:200
    },
    video: {
        position: 'relative',
        borderRadius: 10,
        marginBottom: 30,
        width: Dimensions.get('window').width - 20,
        height: Dimensions.get('window').height * 0.25,
    },
    scrollContainer: {
        // paddingHorizontal: 10,
    },
    categoryContainer: {
        marginVertical: 20,
        paddingHorizontal: 10,
    },
    categoryHeading: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign:'center'
    },
    channelCard: {
        backgroundColor: '#1e1e1e',
        borderRadius: 8,
        padding: 10,
        margin: 5,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#333',
        height: 150, // Adjust height as needed
    },
    channelIcon: {
        width: 100,
        height: 100,
        borderRadius: 2,
        marginBottom: 10,
    },
    channelText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    placeholderText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
});

export default TV;
