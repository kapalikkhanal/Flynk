import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, KeyboardAvoidingView, ScrollView, Platform, SafeAreaView, StatusBar } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './components/supabase'
import { Redirect, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import useAuth from '@/hooks/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isLoading, isAuthenticated } = useAuth();

  const navigation = useNavigation();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isAuthenticated) {
    navigation.navigate('/(tabs)');
    return null;
  }

  const handleLogin = async () => {
    try {
      setLoading(true);
      const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (!session) { Alert.alert('Login Error', (error as Error).message); }

      if (error) {
        Alert.alert('Login Error', error.message);
        throw error;
      }
      const { user, access_token } = session as { user: { email: string }, access_token: string };
      const userEmail = user.email;
      console.log("Token", userEmail, access_token)
      await AsyncStorage.setItem('supabaseToken', access_token);
      await AsyncStorage.setItem('userEmail', userEmail);
      setLoading(false);
      navigation.navigate('(tabs)');
    } catch (error) {
      Alert.alert('Login Failed', (error as Error).message);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#031e1f' }}>
      <StatusBar barStyle="light-content" backgroundColor="#252525" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ padding: 16 }}>
            <View style={styles.container}>
              <Image source={require('../assets/images/logo.png')} style={styles.logo} />
              <Text className='text-xl font-bold text-center text-white'>THE HEADLINES</Text>
            </View>
            <TextInput
              className='border border-gray-300 rounded-lg p-3 mb-4 h-16 text-white'
              placeholder="Email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="gray"
            />
            <View className='relative'>
              <TextInput
                className='border border-gray-300 rounded-lg p-3 h-16 text-white'
                placeholder="Password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="gray"
              />
              <TouchableOpacity
                className='absolute right-0.5 mt-0.5 p-5'
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text className='text-white'>
                  {showPassword ?
                    <Ionicons name="eye-sharp" size={24} color="white" />
                    :
                    <Ionicons name="eye-off-sharp" size={24} color="white" />
                  }
                </Text>
              </TouchableOpacity>
            </View>
            <View className='flex justify-center items-center w-full '>
              <View className='border-gray-600 w-full mt-10 rounded-xl bg-white'>
                <TouchableOpacity
                  onPress={handleLogin}
                >
                  {loading ? (
                    <View className='py-5 text-xl'>
                      <ActivityIndicator size="small" color="#000" />
                    </View>
                  ) : (
                    <Text className="py-4 font-bold text-xl text-center">Login</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              className='mt-8'
              onPress={() => navigation.navigate('signup')}
            >
              <Text className='text-white/80 text-center text-lg'>Don&apos;t have an account? <Text className='font-bold text-lg text-yellow-600'>Sign Up</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#031e1f',
    marginBottom: 30
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 10,
  }
});

export default Login;
