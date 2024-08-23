import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Button, Alert, Platform, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

import ProtectedRoute from '../components/ProtectedRoute';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ExternalLink } from '@/components/ExternalLink';

export default function Profile() {
  const navigation = useNavigation();
  const [email, setEmail] = useState<string | null>(null);

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

    fetchEmail();
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

  return (
    <ProtectedRoute>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <ThemedView style={styles.container}>
          <View style={styles.profileContainer}>
            <Ionicons name="person-circle-outline" size={100} color="#ffffff" style={styles.icon} />
            <ThemedText type="title" style={styles.title}>Profile</ThemedText>
            {email ? (
              <ThemedText style={styles.email}>Email: {email}</ThemedText>
            ) : (
              <ThemedText>Loading...</ThemedText>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity className='w-full py-3 bg-red-600 rounded-2xl' onPress={handleLogout}>
              <Text className='text-lg text-white font-semibold text-center'>Logout</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <ThemedText type="title" style={styles.sectionTitle}>Settings</ThemedText>
            <ExternalLink href="https://example.com/settings">
              <ThemedText type="link"><MaterialIcons name="settings" size={18} color="#007BFF" /> Manage your settings</ThemedText>
            </ExternalLink>
          </View>

          <View style={styles.section}>
            <ThemedText type="title" style={styles.sectionTitle}>Help</ThemedText>
            <ExternalLink href="https://example.com/help">
              <ThemedText type="link"><MaterialIcons name="help-outline" size={18} color="#007BFF" /> Get Help</ThemedText>
            </ExternalLink>
          </View>
        </ThemedView>
      </SafeAreaView>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'black',
  },
  profileContainer: {
    marginBottom: 24,
    marginTop: 24,
    backgroundColor: '#111',
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
    backgroundColor: '#222',
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
});
