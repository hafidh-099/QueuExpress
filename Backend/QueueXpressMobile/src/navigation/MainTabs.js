import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import QueueStatusScreen from '../screens/QueueStatusScreen';
import ScanQRScreen from '../screens/ScanQRScreen';

// Temporary placeholders for other screens
const FeedbackScreen = () => (
  <View style={styles.placeholder}>
    <Text>Feedback Screen - Coming Soon</Text>
  </View>
);

const SettingsScreen = () => (
  <View style={styles.placeholder}>
    <Text>Settings Screen - Coming Soon</Text>
  </View>
);

const Tab = createBottomTabNavigator();

const MainTabs = () => {
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
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0099CC',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: styles.tabBar,
        headerShown: false, // Hide header completely, we'll add logo in each screen
      })}
    >
      <Tab.Screen name="Status" component={QueueStatusScreen} />
      <Tab.Screen name="Scan" component={ScanQRScreen} />
      <Tab.Screen name="Feedback" component={FeedbackScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E2E8F0',
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
});

export default MainTabs;