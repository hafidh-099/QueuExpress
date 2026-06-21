import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import QueueStatusScreen from '../screens/QueueStatusScreen';
import ScanQRScreen from '../screens/ScanQRScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Status') {
            iconName = focused ? 'timer' : 'timer-outline';
          } else if (route.name === 'Scan') {
            iconName = focused ? 'qr-code' : 'qr-code-outline';
          } else if (route.name === 'Feedback') {
            iconName = focused ? 'star' : 'star-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          
          return <Ionicons name={iconName} size={28} color={color} />;
        },
        tabBarActiveTintColor: '#0099CC',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 4,
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Status" 
        component={QueueStatusScreen}
        options={{
          tabBarLabel: t('tabs.status'),
        }}
      />
      <Tab.Screen 
        name="Scan" 
        component={ScanQRScreen}
        options={{
          tabBarLabel: t('tabs.scan'),
        }}
      />
      <Tab.Screen 
        name="Feedback" 
        component={FeedbackScreen}
        options={{
          tabBarLabel: t('tabs.feedback'),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarLabel: t('tabs.settings'),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabs;