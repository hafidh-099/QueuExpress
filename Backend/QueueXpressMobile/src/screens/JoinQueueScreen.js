import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Logo from '../components/Logo';
import { joinQueue, getServices, getQueueStatus } from '../api/queue';
import { saveQueueData, getQueueData, clearQueueData } from '../storage/storage';
import { useTheme } from '../context/ThemeContext';

const JoinQueueScreen = ({ route }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { qrData } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedServiceName, setSelectedServiceName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errors, setErrors] = useState({});
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);

  useEffect(() => {
    fetchServices();
    checkExistingActiveQueue();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await getServices();
      setServices(response);
    } catch (error) {
      console.error('Error fetching services:', error);
      Alert.alert(t('alerts.error'), t('common.error'));
    }
  };

  const checkExistingActiveQueue = async () => {
    try {
      const { queueId } = await getQueueData();
      if (queueId) {
        const statusData = await getQueueStatus(queueId);
        if (statusData && (statusData.status === 'waiting' || statusData.status === 'called')) {
          Alert.alert(
            t('alerts.activeQueueFound'),
            t('alerts.activeQueueMessage'),
            [
              {
                text: t('alerts.ok'),
                onPress: () => navigation.replace('MainTabs', { screen: 'Status' }),
              },
            ]
          );
          return;
        } else {
          await clearQueueData();
        }
      }
    } catch (error) {
      console.log(t('alerts.noActiveQueue'), error);
    } finally {
      setCheckingExisting(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!selectedService) {
      newErrors.service = t('join.validation.serviceRequired');
    }
    
    if (!phoneNumber) {
      newErrors.phone = t('join.validation.phoneRequired');
    } else if (!/^\d{9}$/.test(phoneNumber)) {
      newErrors.phone = t('join.validation.phoneInvalid');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatPhoneNumber = (input) => {
    const cleaned = input.replace(/\D/g, '');
    return cleaned.slice(0, 9);
  };

  const handlePhoneChange = (text) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
    if (errors.phone) {
      setErrors({ ...errors, phone: null });
    }
  };

  const handleJoin = async () => {
    if (!validateForm()) return;
    if (checkingExisting) return;
    
    setLoading(true);
    
    try {
      const fullPhoneNumber = `255${phoneNumber}`;
      const result = await joinQueue(fullPhoneNumber, selectedService);
      
      await saveQueueData(result.queue_id, result.queue_number);
      
      let message = t('join.success');
      let title = t('alerts.success');
      
      // Check if this is an existing queue (duplicate prevention from backend)
      if (result.message && result.message.includes('already have an active queue')) {
        message = t('join.existingQueue');
        title = t('alerts.activeQueueFound');
      }
      
      Alert.alert(
        title,
        message,
        [
          {
            text: t('alerts.ok'),
            onPress: () => navigation.replace('MainTabs', { screen: 'Status' }),
          },
        ]
      );
    } catch (error) {
      console.error('Join error:', error);
      let errorMessage = t('join.error');
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      Alert.alert(t('alerts.error'), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const selectService = (service) => {
    setSelectedService(service.service_id);
    setSelectedServiceName(service.service_name);
    setDropdownVisible(false);
    if (errors.service) {
      setErrors({ ...errors, service: null });
    }
  };

  // Show loading while checking for existing queue
  if (checkingExisting) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t('join.checking')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Logo size="small" showText={false} />
      
      <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.dark }]}>
        <Text style={[styles.title, { color: colors.text }]}>{t('join.title')}</Text>
        
        {/* Service Dropdown */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {t('join.service')} <Text style={{ color: '#EF4444' }}>*</Text>
          </Text>
          
          <TouchableOpacity
            style={[styles.dropdown, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={() => setDropdownVisible(true)}
          >
            <Text style={[styles.dropdownText, { color: selectedService ? colors.text : colors.textSecondary }]}>
              {selectedServiceName || t('join.service')}
            </Text>
            <Ionicons name="chevron-down-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          {errors.service && (
            <Text style={[styles.errorText, { color: '#EF4444' }]}>{errors.service}</Text>
          )}
        </View>
        
        {/* Phone Number Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {t('join.phoneNumber')} <Text style={{ color: '#EF4444' }}>*</Text>
          </Text>
          <View style={[styles.phoneContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <View style={[styles.countryCode, { backgroundColor: colors.background }]}>
              <Text style={[styles.countryCodeText, { color: colors.text }]}>🇹🇿 +255</Text>
            </View>
            <TextInput
              style={[styles.phoneInput, { color: colors.text }]}
              placeholder={t('join.phonePlaceholder')}
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              maxLength={9}
            />
          </View>
          <Text style={[styles.hintText, { color: colors.textSecondary }]}>
            {t('join.phoneHint')}
          </Text>
          {errors.phone && (
            <Text style={[styles.errorText, { color: '#EF4444' }]}>{errors.phone}</Text>
          )}
        </View>
        
        {/* Join Button */}
        <TouchableOpacity
          style={[styles.joinButton, { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 }]}
          onPress={handleJoin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="enter-outline" size={20} color="#FFFFFF" />
              <Text style={styles.joinButtonText}>{t('join.joinButton')}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Service Dropdown Modal */}
      <Modal
        visible={dropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('join.service')}</Text>
              <TouchableOpacity onPress={() => setDropdownVisible(false)}>
                <Ionicons name="close-outline" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={services}
              keyExtractor={(item) => item.service_id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, { borderBottomColor: colors.border }]}
                  onPress={() => selectService(item)}
                >
                  <Text style={[styles.modalItemText, { color: colors.text }]}>
                    {item.service_name}
                  </Text>
                  {selectedService === item.service_id && (
                    <Ionicons name="checkmark-outline" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    marginTop: 10,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownText: {
    fontSize: 16,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  countryCode: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 16,
  },
  hintText: {
    fontSize: 11,
    marginTop: 6,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  joinButton: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '60%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalItemText: {
    fontSize: 16,
  },
});

export default JoinQueueScreen;