import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Dimensions, Alert, Platform, SafeAreaView, StatusBar, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import eventEmitter from '../components/eventEmitter';
import useAuth from '@/hooks/useAuth';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ExternalLink } from '@/components/ExternalLink';

const { height, width } = Dimensions.get('window');

export default function Profile() {
  const navigation = useNavigation();
  const [email, setEmail] = useState<string | null>(null);

  const [mute, setMute] = useState<boolean>(false);
  const [autoScroll, setAutoScroll] = useState<boolean>(false);
  const [headings, setHeadings] = useState<boolean>(false);
  const [vibration, setVibration] = useState<boolean>(true);
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Fetch email from AsyncStorage
    const fetchEmail = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem('userEmail');
        setEmail(storedEmail);
      } catch (error) {
        console.error('Error fetching email:', error);
      }
    };

    // Fetch settings from AsyncStorage
    const fetchSettings = async () => {
      try {
        const settings = await AsyncStorage.getItem('settings');
        if (settings) {
          const { mute, autoScroll, headings, vibration } = JSON.parse(settings);
          setMute(mute);
          setAutoScroll(autoScroll);
          setHeadings(headings);
          setVibration(vibration)
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchEmail();
    fetchSettings();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('supabaseToken');
      await AsyncStorage.removeItem('userEmail');
      navigation.navigate('login');
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  const handleLogin = async () => {
    try {
      navigation.navigate('login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleToggle = async (setting: string, value: boolean) => {
    try {
      let newSettings = { mute, autoScroll, headings, vibration };

      if (setting === 'mute') {
        newSettings.mute = value;
        if (value) {
          newSettings.autoScroll = false;
          setAutoScroll(false);
        }
        setMute(value);
      } else if (setting === 'autoScroll') {
        if (!mute) {
          newSettings.autoScroll = value;
          setAutoScroll(value);
        }
      } else if (setting === 'headings') {
        newSettings.headings = value;
        setHeadings(value);
      } else if (setting === 'vibration') {
        newSettings.vibration = value;
        setVibration(value);
      }

      await AsyncStorage.setItem('settings', JSON.stringify(newSettings));
      eventEmitter.emit('settingsChanged', { [setting]: value });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return (
    <ScrollView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <ThemedView style={styles.container}>
          <View style={styles.profileContainer}>
            <Ionicons name="person-circle-outline" size={100} color="#ffffff" style={styles.icon} />
            <ThemedText type="title" style={styles.title}>Profile</ThemedText>
            {email && (
              <ThemedText style={styles.email}>Email: {email}</ThemedText>
            )}
          </View>

          <View className='flex justify-center items-center flex-col space-y-4'>
            {!isAuthenticated ?
              <TouchableOpacity className='w-60 py-3 bg-blue-600 rounded-2xl' onPress={handleLogout}>
                <Text className='text-lg text-white font-semibold text-center'>Sign In</Text>
              </TouchableOpacity>
              :
              <TouchableOpacity className='w-60 py-3 bg-red-600 rounded-2xl' onPress={handleLogout}>
                <Text className='text-lg text-white font-semibold text-center'>Logout</Text>
              </TouchableOpacity>
            }
          </View>

          <View style={styles.section}>
            <ThemedText type="title" style={styles.sectionTitle}>Settings</ThemedText>

            <View style={styles.settingRow}>
              <Text style={styles.settingText}>Mute</Text>
              <Switch
                value={mute}
                onValueChange={(value) => handleToggle('mute', value)}
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingText}>Auto Scroll</Text>
              <Switch
                value={autoScroll}
                onValueChange={(value) => handleToggle('autoScroll', value)}
                disabled={mute}
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingText}>Vibration</Text>
              <Switch
                value={vibration}
                onValueChange={(value) => handleToggle('vibration', value)}
                disabled={mute}
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingText}>Read Title Only</Text>
              <Switch
                value={headings}
                onValueChange={(value) => handleToggle('headings', value)}
              />
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText type="title" style={styles.sectionTitle}>Help</ThemedText>
            <ExternalLink href="https://example.com/help">
              <ThemedText type="link"><MaterialIcons name="help-outline" size={18} color="#007BFF" /> Get Help</ThemedText>
            </ExternalLink>
          </View>

        </ThemedView>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    minHeight: '100%'
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#031e1f',
    paddingBottom: 80
  },
  profileContainer: {
    marginBottom: 24,
    marginTop: 36,
    backgroundColor: '#223E3F',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 16,
  },
  buttonContainer: {
    marginVertical: 16,
  },
  section: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#223E3F',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingText: {
    fontSize: 16,
    color: '#ffffff',
  },
});
