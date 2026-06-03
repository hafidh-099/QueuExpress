import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

// Predefined valid icon names
const iconMap = {
  // Status screen
  queue: 'timer-outline',
  batch: 'layers-outline',
  status: 'information-circle-outline',
  people: 'people-outline',
  time: 'time-outline',
  checkmark: 'checkmark-circle-outline',
  close: 'close-circle-outline',
  call: 'call-outline',
  help: 'help-circle-outline',
  
  // Scan screen
  scan: 'scan-outline',
  camera: 'camera-outline',
  flashlight: 'flashlight-outline',
  
  // Feedback screen
  star: 'star',
  starOutline: 'star-outline',
  
  // Settings screen
  language: 'language-outline',
  palette: 'color-palette-outline',
  mail: 'mail-outline',
  phone: 'call-outline',
  chevronDown: 'chevron-down',
  close: 'close',
  checkmark: 'checkmark',
  
  // Common
  home: 'home-outline',
  settings: 'settings-outline',
  info: 'information-circle-outline',
  alert: 'alert-circle-outline',
  reload: 'reload-outline',
  exit: 'exit-outline',
};

const CustomIcon = ({ name, size = 24, color = '#1E293B', style }) => {
  const iconName = iconMap[name] || name;
  return <Icon name={iconName} size={size} color={color} style={style} />;
};

export default CustomIcon;