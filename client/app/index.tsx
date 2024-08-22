import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, KeyboardAvoidingView, ScrollView, Platform, SafeAreaView, StatusBar } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './components/supabase'
import { Redirect, useRouter } from 'expo-router';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      }
    }
  }, [isLoading, isAuthenticated]);

  const checkAuthStatus = async () => {
    try {
      const session = await AsyncStorage.getItem('supabaseToken');
      setIsAuthenticated(!!session);
    } catch (error) {
      console.error('Error checking authentication status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }


  const handleLogin = async () => {
    try {
      setLoading(true);
      const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (!session) { Alert.alert('Login Error', error.message); }
      console.log("Token", session.access_token)
      if (error) throw error;
      await AsyncStorage.setItem('supabaseToken', session.access_token);
      setLoading(false);
      navigation.navigate('(tabs)');
    } catch (error) {
      // Alert.alert('Login Error', error.message);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <StatusBar barStyle="light-content" backgroundColor="#252525" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
        >
          <View className='flex-1 justify-center p-6 bg-black'>
            <Text className='text-3xl font-bold text-center mb-6  text-white'>Sign In</Text>
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
                className='absolute right-3 top-6'
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text className='text-white'>{showPassword ? 'Hide' : 'Show'}</Text>
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
              className='mt-4'
              onPress={() => navigation.navigate('signup')}
            >
              <Text className='text-white/80 text-center text-base'>Don&apos;t have an account? <Text className='font-bold text-base text-yellow-600'>Sign Up</Text></Text>
            </TouchableOpacity>

            <TouchableOpacity
              className='mt-4'
              onPress={() => navigation.navigate('(tabs)')}
            >
              <Text className='text-white/80 text-center text-base'><Text className='font-bold text-base text-yellow-600'>Sign In as Guest</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // You can add any additional styles here if needed
});

export default Login;
