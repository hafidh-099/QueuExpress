import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getLanguage } from '../storage/storage';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => {
    console.log("🔔 Notification handler triggered");
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    };
  },
});

// Send LOCAL notification with channelId
export const sendLocalNotification = async (title, body, data = {}) => {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        data: data,
        sound: "default",
        priority: Notifications.AndroidNotificationPriority.MAX,
        channelId: "default",
      },
      trigger: null,
    });

    console.log("✅ Local notification scheduled:", notificationId);
    return true;
  } catch (error) {
    console.error("❌ Notification error:", error);
    return false;
  }
};

// ============================================================
// 🔔 GET MESSAGES KWA LUGHA YA MFUMO
// ============================================================
export const getNotificationMessages = (status, queueNumber, language = 'en') => {
  const messages = {
    en: {
      called: {
        title: '🎯 Your Turn is Here!',
        body: `Queue #${queueNumber} has been called. Please proceed to the service counter.`
      },
      served: {
        title: '✅ Service Completed!',
        body: 'Thank you for using QueueXpress. Please share your feedback.'
      },
      skipped: {
        title: '⚠️ Queue Skipped',
        body: 'Your turn was skipped. You can join a new queue if needed.'
      }
    },
    sw: {
      called: {
        title: '🎯 Zamu Yako Imefika!',
        body: `Foleni #${queueNumber} imeitwa. Tafadhali nenda kwa mtoa huduma.`
      },
      served: {
        title: '✅ Huduma Imekamilika!',
        body: 'Asante kwa kutumia QueueXpress. Tafadhali toa maoni yako.'
      },
      skipped: {
        title: '⚠️ Foleni Imerekwa',
        body: 'Zamu yako ilirukwa. Unaweza kujiunga na foleni mpya ikiwa inahitajika.'
      }
    }
  };

  const lang = messages[language] || messages.en;
  return lang[status] || lang.called;
};

// ============================================================
// 🔔 NOTIFY STATUS CHANGE - HAPA NDIO INATUMIKA
// ============================================================
export const notifyStatusChange = async (status, queueNumber, language = 'en') => {
  const msg = getNotificationMessages(status, queueNumber, language);
  return await sendLocalNotification(msg.title, msg.body, { status, queue_number: queueNumber });
};

// People ahead notifications - pia zina lugha
export const getPeopleAheadMessages = (peopleAhead, queueNumber, language = 'en') => {
  const messages = {
    en: {
      5: {
        title: '📢 Almost There!',
        body: `Only ${peopleAhead} customers remain before your turn. Please move closer to the service area.`
      },
      1: {
        title: '🔔 You are Next!',
        body: 'Please proceed to the service counter. You are next in line!'
      }
    },
    sw: {
      5: {
        title: '📢 Uko Karibu!',
        body: `Wateja ${peopleAhead} tu wamebakia kabla ya zamu yako. Tafadhali karibia eneo la huduma.`
      },
      1: {
        title: '🔔 Wewe Ndio Unaofuata!',
        body: 'Tafadhali enda kwenye kaunta ya huduma. Wewe ndiye unaofuata!'
      }
    }
  };

  const lang = messages[language] || messages.en;
  return lang[peopleAhead] || lang[5];
};

export const notifyPeopleAhead = async (peopleAhead, queueNumber, language = 'en') => {
  const msg = getPeopleAheadMessages(peopleAhead, queueNumber, language);
  return await sendLocalNotification(msg.title, msg.body, { people_ahead: peopleAhead, queue_number: queueNumber });
};

// Request notification permissions
export const requestNotificationPermissions = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('❌ Notification permissions denied');
      return false;
    }
    
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'QueueXpress',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0099CC',
      });
      console.log('✅ Android notification channel created');
    }
    
    console.log('✅ Notification permissions granted');
    return true;
  } catch (error) {
    console.error('❌ Permission error:', error);
    return false;
  }
};