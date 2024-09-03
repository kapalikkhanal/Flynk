import { Tabs } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Ionicons } from '@expo/vector-icons';
import TabBarIcon from '../components/tabBarIcon';
import { View, Text, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { TapGestureHandler } from 'react-native-gesture-handler';
import eventEmitter from '../components/eventEmitter'
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [settings, setSettings] = useState({
    mute: false,
    autoScroll: false,
    headings: false,
    vibration: true
  });

  useEffect(() => {

    const fetchSettings = async () => {
      try {
        const storedSettings = await AsyncStorage.getItem('settings');
        if (storedSettings) {
          setSettings(JSON.parse(storedSettings));
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();

    const settingsListener = (changedSetting: { mute: boolean; autoScroll: boolean; headings: boolean; vibration: boolean; }) => {
      setSettings(prevSettings => ({ ...prevSettings, ...changedSetting }));
    };

    eventEmitter.on('settingsChanged', settingsListener);

    return () => {
      eventEmitter.off('settingsChanged', settingsListener);
    };
  }, []);

  const hapticPress = () => {
    if (settings.vibration) {
      enableHapticPress();
    }
  };

  const enableHapticPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: '#134053',
          height: 50,
          borderTopWidth: 0,
          marginHorizontal: 5,
          borderRadius: 24,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 20,
          elevation: 5,
          paddingBottom: 5,
          paddingTop: 5,
          marginBottom: 12,
        },
        tabBarInactiveTintColor: isDarkMode ? '#fff' : '#959595',
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
        },
      }}
    >

      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ color, focused }) => (
            <TapGestureHandler onActivated={hapticPress}>
              <View style={{ flexDirection: 'row', alignItems: 'center', height: 34, backgroundColor: `${focused ? '#fff' : 'transparent'}`, padding: 2.5, paddingLeft: 10, paddingRight: 10, marginLeft: 20, borderRadius: 20 }}>
                <Ionicons
                  name={focused ? 'home-sharp' : 'home-outline'}
                  size={25}
                  color={focused ? "#070318" : color}
                />
                {focused && (
                  <Text style={{ fontSize: 12, marginLeft: 4, fontWeight: 'bold' }}>
                    Home
                  </Text>
                )}
              </View>
            </TapGestureHandler>
          ),
        }}
      />

      <Tabs.Screen
        name="tv"
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ color, focused }) => (
            <TapGestureHandler onActivated={hapticPress}>
              <View style={{ flexDirection: 'row', alignItems: 'center', height: 34, backgroundColor: `${focused ? '#fff' : 'transparent'}`, padding: 2.5, paddingLeft: 10, paddingRight: 10, marginLeft: 8, borderRadius: 20 }}>
                <Ionicons
                  name={focused ? 'tv' : 'tv-outline'}
                  size={24}
                  color={focused ? "#070318" : color}
                />
                {focused && (
                  <Text style={{ fontSize: 12, marginLeft: 5, fontWeight: 'bold' }}>
                    Live TV
                  </Text>
                )}
              </View>
            </TapGestureHandler>
          ),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ color, focused }) => (
            <TapGestureHandler onActivated={hapticPress}>
              <View style={{ flexDirection: 'row', alignItems: 'center', height: 34, backgroundColor: `${focused ? '#fff' : 'transparent'}`, padding: 2.5, paddingLeft: 10, paddingRight: 10, marginLeft: 8, borderRadius: 20 }}>
                <Ionicons
                  name={focused ? 'newspaper' : 'newspaper-outline'}
                  size={24}
                  color={focused ? "#070318" : color}
                />
                {focused && (
                  <Text style={{ fontSize: 12, marginLeft: 5, fontWeight: 'bold' }}>
                    News
                  </Text>
                )}
              </View>
            </TapGestureHandler>
          ),
        }}
      />

      <Tabs.Screen
        name="saved"
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ color, focused }) => (
            <TapGestureHandler onActivated={hapticPress}>
              <View style={{ flexDirection: 'row', alignItems: 'center', height: 34, backgroundColor: `${focused ? '#fff' : 'transparent'}`, padding: 2.5, paddingLeft: 10, paddingRight: 15, marginRight: 10, borderRadius: 20 }}>
                <TabBarIcon
                  source={
                    focused
                      ? require('../../assets/icons/save-fill.png')
                      : require('../../assets/icons/save.png')
                  }
                  color={focused ? "#070318" : color}
                />
                {focused && (
                  <Text style={{ fontSize: 12, marginLeft: 4, fontWeight: 'bold' }}>
                    Saved
                  </Text>
                )}
              </View>
            </TapGestureHandler>
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Profile',
          tabBarLabel: () => null,
          tabBarIcon: ({ color, focused }) => (
            <TapGestureHandler onActivated={hapticPress}>
              <View style={{ flexDirection: 'row', alignItems: 'center', height: 34, backgroundColor: `${focused ? '#fff' : 'transparent'}`, padding: 2.5, paddingLeft: 6, paddingRight: 6, marginRight: 20, borderRadius: 20 }}>
                <FontAwesome5
                  name={focused ? 'user-alt' : 'user'}
                  size={20}
                  color={focused ? "#070318" : color}
                />
                {focused && (
                  <Text style={{ fontSize: 12, marginLeft: 4, fontWeight: 'bold' }}>
                    Profile
                  </Text>
                )}
              </View>
            </TapGestureHandler>
          ),
        }}
      />
    </Tabs>
  );
}
