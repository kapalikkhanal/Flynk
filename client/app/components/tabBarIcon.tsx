// TabBarIcon.tsx
import React from 'react';
import { Image, StyleSheet, View, Text } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

interface TabBarIconProps {
  name?: string;
  color?: string;
  size?: number;
  source?: any;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({ name, color, size = 24, source }) => {
  if (source) {
    return <Image source={source} style={[styles.icon, { tintColor: color }]} />;
  }

  if (name) {
    const IconComponent = name.includes('settings') 
      ? FontAwesome5 
      : Ionicons;
      
    return <IconComponent name={name} size={size} color={color} />;
  }

  return null;
};

const styles = StyleSheet.create({
  icon: {
    width: 23,
    height: 23,
  },
});

export default TabBarIcon;
