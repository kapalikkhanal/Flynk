import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}
    >

      <Tabs.Screen
        name="home"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'News',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'newspaper' : 'newspaper-outline'} color={color} />
          ),
        }}
      />
      {/* <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, focused }) => (
            // <TabBarIcon name={focused ? 'settings' : 'settings-outline'} color={color} />
            // <FontAwesome5 name={focused ? 'user-alt' : 'user'} size={20} style={[{ marginBottom: -3 }]} color={color} />
            <MaterialCommunityIcons name={focused ? 'bookmark-box-multiple' : 'bookmark-box-multiple-outline'} size={25} style={[{ marginBottom: -3 }]} color={color} />
          ),
        }}
      /> */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            // <TabBarIcon name={focused ? 'settings' : 'settings-outline'} color={color} />
            <FontAwesome5 name={focused ? 'user-alt' : 'user'} size={20} style={[{ marginBottom: -3 }]} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
