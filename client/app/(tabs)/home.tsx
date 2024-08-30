import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  FlatList,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import axios from 'axios';
import WebView from 'react-native-webview';
import ProtectedRoute from '../components/ProtectedRoute';

const { width } = Dimensions.get('window');

const fallbackImage = require('../../assets/images/flynk_icon.png');

const signImages = {
  मेष: require('../../assets/images/rashifal/mesh.png'),
  बृष: require('../../assets/images/rashifal/brish.png'),
  मिथुन: require('../../assets/images/rashifal/mithun.png'),
  कर्कट: require('../../assets/images/rashifal/karkat.png'),
  सिंह: require('../../assets/images/rashifal/singha.png'),
  कन्या: require('../../assets/images/rashifal/kanya.png'),
  तुला: require('../../assets/images/rashifal/tula.png'),
  बृश्चिक: require('../../assets/images/rashifal/brischik.png'),
  धनु: require('../../assets/images/rashifal/dhanu.png'),
  मकर: require('../../assets/images/rashifal/makar.png'),
  कुम्भ: require('../../assets/images/rashifal/kumbha.png'),
  मीन: require('../../assets/images/rashifal/min.png'),
};

const sourcesImages = {
  Hamropatro: require('../../assets/images/sources/hamropatro.png'),
  Kantipur: require('../../assets/images/sources/kantipur.png'),
  Onlinekhabar: require('../../assets/images/sources/onlinekhabar.png'),
  Ratopati: require('../../assets/images/sources/ratopati.jpg'),
  Barakhari: require('../../assets/images/sources/barakhari.jpg'),
  Setopati: require('../../assets/images/sources/setopati.jpg'),
  Himalkhabar: require('../../assets/images/sources/himalkhabar.png'),
};

interface NewsItem {
  title: string;
  imageUrl: string;
  urls: string[];
  date: string;
  nepaliDate: string;
  tithi: string;
  panchanga: string;
}

interface RashifalItem {
  sign: string;
  description: string;
}

const getFormattedDate = () => {
  const today = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return today.toLocaleDateString(undefined, options);
};

const Dashboard: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [rashifal, setRashifal] = useState<RashifalItem[]>([]);
  const [showWebView, setShowWebView] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [webViewLoading, setWebViewLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const logos = [
    { id: 1, imageUrl: sourcesImages.Hamropatro, link: 'https://www.hamropatro.com' },
    { id: 2, imageUrl: sourcesImages.Kantipur, link: 'https://ekantipur.com' },
    { id: 3, imageUrl: sourcesImages.Onlinekhabar, link: 'https://www.onlinekhabar.com' },
    { id: 5, imageUrl: sourcesImages.Ratopati, link: 'https://www.ratopati.com' },
    { id: 6, imageUrl: sourcesImages.Setopati, link: 'https://www.setopati.com' },
    { id: 7, imageUrl: sourcesImages.Himalkhabar, link: 'https://www.himalkhabar.com' },
    { id: 8, imageUrl: sourcesImages.Barakhari, link: 'https://baahrakhari.com' },
    { id: 9, imageUrl: sourcesImages.Barakhari, link: 'https://news1.com' },
  ];

  const renderNewsItem = ({ item, index }: { item: NewsItem; index: number }) => (
    <TouchableOpacity
      key={index}
      onPress={() => Linking.openURL(item.urls[index])}
      style={styles.newsCard}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.newsImage}
        resizeMode="cover"
        defaultSource={fallbackImage}
        onError={(e) => {
          // console.log('Image failed to load:', item.imageUrl, e.nativeEvent.error);
        }}
      />
      <Text style={styles.newsTitle}>{item.title}</Text>
      <Text style={styles.publishedDate}>{item.date}</Text>
    </TouchableOpacity>
  );

  const renderRashifalItem = ({ item }: { item: RashifalItem }) => (
    <View style={styles.rashifalCard}>
      <Image source={signImages[item.sign.toLowerCase()]} style={styles.signImage} />
      <View style={styles.rashifalContent}>
        <Text style={styles.signTitle}>{item.sign}</Text>
        <Text style={styles.rashifalText}>{item.description}</Text>
      </View>
    </View>
  );

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get('https://flynk.onrender.com/api/news');
        const topFiveNews = response.data.slice(0, 5);
        setNews(topFiveNews);
        // console.log(topFiveNews)
      } catch (error) {
        console.error('Error fetching news:', error);
        setError('Failed to fetch news');
      } finally {
        setLoading(false);
      }
    };

    const fetchRashifal = async () => {
      try {
        const response = await axios.get('https://flynk.onrender.com/api/rashifal');
        setRashifal(response.data);
      } catch (error) {
        console.error('Error fetching rashifal:', error);
        setError('Failed to fetch rashifal');
      }
    };

    fetchNews();
    fetchRashifal();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return (
      <View>
        <Text>{error}</Text>
      </View>
    );
  }

  if (!news.length) {
    return (
      <View>
        <Text>No news available.</Text>
      </View>
    );
  }

  const handleLogoClick = (url: string) => {
    setCurrentUrl(url);
    setShowWebView(true);
  };

  return (
    <ProtectedRoute>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#031e1f' }}>
        <StatusBar barStyle="light-content" backgroundColor="#252525" />
        {showWebView ? (
          <View style={styles.webViewContainer}>
            {webViewLoading && (
              <View style={styles.webViewLoader}>
                <ActivityIndicator size="large" color="#0000ff" />
              </View>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowWebView(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            <WebView
              source={{ uri: currentUrl }}
              onLoadEnd={() => setWebViewLoading(false)}
              style={{ opacity: webViewLoading ? 0 : 1 }}
            />
          </View>
        ) : (
          <FlatList
            data={[]}
            renderItem={null}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.container}>
                {/* Search Bar */}
                <TextInput
                  style={styles.searchBar}
                  placeholder="Search news..."
                  value={searchText}
                  onChangeText={(text) => setSearchText(text)}
                  placeholderTextColor="white"
                />

                {/* Display today's date */}
                <View style={styles.dateContainer}>
                  <Text style={styles.dateHeading}>{news[0].nepaliDate}</Text>
                  <View style={styles.tithiContainer}>
                    <Text style={styles.dateText}>{news[0].tithi}, </Text>
                    <Text style={styles.dateText}>{news[0].panchanga}</Text>
                  </View>
                </View>

                {/* Top News Section */}
                <View style={styles.trendingSection}>
                  <Text style={styles.sectionTitle}>Latest News</Text>
                  <FlatList
                    data={news}
                    renderItem={renderNewsItem}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.trendingNewsList}
                  />
                </View>

                {/* Horizontal Scroll Bar with Bubbles */}
                <FlatList
                  data={logos}
                  renderItem={({ item: logo }) => (
                    <TouchableOpacity
                      key={logo.id}
                      onPress={() => handleLogoClick(logo.link)}
                      style={styles.logoBubble}
                    >
                      <Image source={logo.imageUrl} style={styles.logoImage} />
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item.id.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.logoScrollView}
                />

                {/* Rashifal Section */}
                <View style={styles.rashifalSection}>
                  <Text style={styles.sectionTitle}>Today's Rashifal</Text>
                  <FlatList
                    data={rashifal}
                    renderItem={renderRashifalItem}
                    keyExtractor={(item) => item.sign}
                    showsVerticalScrollIndicator={false}
                  />
                </View>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </ProtectedRoute>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#031e1f',
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  searchBar: {
    height: 50,
    backgroundColor: '#223E3F',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  logoScrollView: {
    flexDirection: 'row',
    marginBottom: 16,
    marginTop: 20,
  },
  logoBubble: {
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  logoImage: {
    width: 50,
    height: 50,
    borderRadius: 40,
  },
  trendingSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  trendingNewsList: {
    paddingVertical: 8,
  },
  newsCard: {
    width: width * 0.8,
    marginRight: 16,
    // backgroundColor: '#2C3E45', 304854, 223E3F, 2B4F60
    // 3A4D48
    backgroundColor: '#223E3F',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    position: 'relative'
  },
  publishedDate: {
    position: 'absolute',
    fontSize: 15,
    fontWeight: 'light',
    color: '#FAF9F6',
    bottom: 4,
    right: 6,
  },
  newsImage: {
    width: '100%',
    height: 150,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 12,
    color: '#fff',
  },
  fallbackImageContainer: {
    height: '100%',
    width: '100%'
  },
  dateContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FAF9F6',
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FAF9F6',
  },
  tithiContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  rashifalSection: {
    marginTop: 16,
  },
  rashifalCard: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: '#223E3F',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  signImage: {
    width: 50,
    height: 50,
    marginRight: 16,
  },
  rashifalContent: {
    flex: 1,
  },
  signTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  rashifalText: {
    fontSize: 16,
    color: '#FAF9F6',
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
  closeButton: {
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
