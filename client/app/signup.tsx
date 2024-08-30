import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, StyleSheet, StatusBar, Image, KeyboardAvoidingView, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { supabase } from './components/supabase'
import Ionicons from '@expo/vector-icons/Ionicons';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  const handleSignup = async () => {
    if (!email || !password || !name) {
      Alert.alert('Error', 'Please enter all required details.');
      return;
    }

    try {
      setLoading(true);
      console.log(email, password, name, phone);

      const { error } = await supabase.auth.signUp({
        email,
        password,
        phone,
        name,
      });

      if (error) {
        if (error.message.includes('rate limit')) {
          Alert.alert('Error', 'Too many requests. Please try again later.');
        } else {
          Alert.alert('Signup Error', error.message);
        }
        throw error;
      }

      setLoading(false);
      navigation.navigate('(tabs)');
    } catch (error) {
      console.error('Signup Error:', error);
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
              className='border border-gray-300 rounded-lg p-3 mb-4 h-16 text-white placeholder:text-white'
              placeholder="Name"
              keyboardType="default"
              value={name}
              onChangeText={setName}
              placeholderTextColor="gray"
            />

            <TextInput
              className='border border-gray-300 rounded-lg p-3 mb-4 h-16 text-white'
              placeholder="Email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="gray"
            />

            <TextInput
              className='border border-gray-300 rounded-lg p-3 mb-4 h-16 text-white'
              placeholder="Phone"
              keyboardType="numeric"
              value={phone}
              onChangeText={setPhone}
              placeholderTextColor="gray"
            />

            <View className='relative mb-4'>
              <TextInput
                className='border border-gray-300 rounded-lg p-3 h-16 text-gray-600'
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

            <View className='flex justify-center items-center w-full'>
              <TouchableOpacity
                className='border-gray-600 w-full mt-3 rounded-xl bg-white'
                onPress={handleSignup}
              >
                {loading ? (
                  <View className='py-5 text-xl'>
                    <ActivityIndicator size="small" color="#000" />
                  </View>
                ) : (
                  <Text className="py-4 font-bold text-xl text-center">Sign Up</Text>
                )}
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              className='mt-8'
              onPress={() => navigation.navigate('login')}
            >
              <Text className='text-white/80 text-center text-lg'>
                Already have an account? <Text className='font-bold text-lg text-yellow-600'>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Signup;

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
})
