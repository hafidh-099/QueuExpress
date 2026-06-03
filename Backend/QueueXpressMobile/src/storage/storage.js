import AsyncStorage from '@react-native-async-storage/async-storage';

// Queue keys
const QUEUE_ID_KEY = '@queuexpress:queue_id';
const QUEUE_NUMBER_KEY = '@queuexpress:queue_number';

// Settings keys
const LANGUAGE_KEY = '@queuexpress:language';
const THEME_KEY = '@queuexpress:theme';

// Notification flags
const NOTIF_10_KEY = '@queuexpress:notif_10';
const NOTIF_5_KEY = '@queuexpress:notif_5';
const NOTIF_1_KEY = '@queuexpress:notif_1';

export const saveQueueData = async (queueId, queueNumber) => {
  try {
    await AsyncStorage.setItem(QUEUE_ID_KEY, queueId.toString());
    await AsyncStorage.setItem(QUEUE_NUMBER_KEY, queueNumber.toString());
    // Reset notification flags when new queue starts
    await resetNotificationFlags();
  } catch (error) {
    console.error('Error saving queue data:', error);
  }
};

export const getQueueData = async () => {
  try {
    const queueId = await AsyncStorage.getItem(QUEUE_ID_KEY);
    const queueNumber = await AsyncStorage.getItem(QUEUE_NUMBER_KEY);
    return {
      queueId: queueId ? parseInt(queueId) : null,
      queueNumber: queueNumber ? parseInt(queueNumber) : null,
    };
  } catch (error) {
    console.error('Error getting queue data:', error);
    return { queueId: null, queueNumber: null };
  }
};

export const clearQueueData = async () => {
  try {
    await AsyncStorage.removeItem(QUEUE_ID_KEY);
    await AsyncStorage.removeItem(QUEUE_NUMBER_KEY);
    await resetNotificationFlags();
  } catch (error) {
    console.error('Error clearing queue data:', error);
  }
};

export const saveLanguage = async (language) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

export const getLanguage = async () => {
  try {
    return await AsyncStorage.getItem(LANGUAGE_KEY);
  } catch (error) {
    console.error('Error getting language:', error);
    return 'en';
  }
};

export const saveTheme = async (theme) => {
  try {
    await AsyncStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    console.error('Error saving theme:', error);
  }
};

export const getTheme = async () => {
  try {
    return await AsyncStorage.getItem(THEME_KEY);
  } catch (error) {
    console.error('Error getting theme:', error);
    return 'light';
  }
};

export const getNotificationFlag = async (peopleAhead) => {
  let key = null;
  if (peopleAhead === 10) key = NOTIF_10_KEY;
  else if (peopleAhead === 5) key = NOTIF_5_KEY;
  else if (peopleAhead === 1) key = NOTIF_1_KEY;
  else return false;
  
  try {
    const value = await AsyncStorage.getItem(key);
    return value === 'true';
  } catch (error) {
    return false;
  }
};

export const setNotificationFlag = async (peopleAhead) => {
  let key = null;
  if (peopleAhead === 10) key = NOTIF_10_KEY;
  else if (peopleAhead === 5) key = NOTIF_5_KEY;
  else if (peopleAhead === 1) key = NOTIF_1_KEY;
  else return;
  
  try {
    await AsyncStorage.setItem(key, 'true');
  } catch (error) {
    console.error('Error saving notification flag:', error);
  }
};

export const resetNotificationFlags = async () => {
  try {
    await AsyncStorage.removeItem(NOTIF_10_KEY);
    await AsyncStorage.removeItem(NOTIF_5_KEY);
    await AsyncStorage.removeItem(NOTIF_1_KEY);
  } catch (error) {
    console.error('Error resetting notification flags:', error);
  }
};