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
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Logo from '../components/Logo';
import { joinQueue, getServices } from '../api/queue';
import { saveQueueData } from '../storage/storage';
import { getColors } from '../theme/colors';

const JoinQueueScreen = ({ route }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { qrData } = route.params || {};
  const [colors, setColors] = useState(getColors('light'));
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadTheme();
    fetchServices();
  }, []);

  const loadTheme = async () => {
    setColors(getColors('light'));
  };

  const fetchServices = async () => {
    try {
      const response = await getServices();
      setServices(response);
    } catch (error) {
      console.error('Error fetching services:', error);
      Alert.alert('Error', 'Failed to load services. Please try again.');
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
    
    setLoading(true);
    
    try {
      const fullPhoneNumber = `255${phoneNumber}`;
      const result = await joinQueue(fullPhoneNumber, selectedService);
      
      await saveQueueData(result.queue_id, result.queue_number);
      
      Alert.alert(
        'Success',
        t('join.success'),
        [
          {
            text: 'OK',
            onPress: () => navigation.replace('MainTabs', { screen: 'Status' }),
          },
        ]
      );
    } catch (error) {
      console.error('Join error:', error);
      Alert.alert('Error', error.response?.data?.error || t('join.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Logo size="small" showText={false} />
      
      <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.dark }]}>
        <Text style={[styles.title, { color: colors.text }]}>{t('join.title')}</Text>
        
        {/* Service Selection */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {t('join.service')} <Text style={{ color: colors.danger }}>*</Text>
          </Text>
          <View style={styles.servicesContainer}>
            {services.map((service) => (
              <TouchableOpacity
                key={service.service_id}
                style={[
                  styles.serviceButton,
                  {
                    backgroundColor: selectedService === service.service_id 
                      ? colors.primary 
                      : colors.surface,
                    borderColor: colors.border,
                    borderWidth: 1,
                  },
                ]}
                onPress={() => {
                  setSelectedService(service.service_id);
                  if (errors.service) {
                    setErrors({ ...errors, service: null });
                  }
                }}
              >
                <Text
                  style={[
                    styles.serviceButtonText,
                    {
                      color: selectedService === service.service_id 
                        ? '#FFFFFF' 
                        : colors.text,
                    },
                  ]}
                >
                  {service.service_name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.service && (
            <Text style={[styles.errorText, { color: colors.danger }]}>{errors.service}</Text>
          )}
        </View>
        
        {/* Phone Number Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {t('join.phoneNumber')} <Text style={{ color: colors.danger }}>*</Text>
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
            <Text style={[styles.errorText, { color: colors.danger }]}>{errors.phone}</Text>
          )}
        </View>
        
        {/* Join Button */}
        <TouchableOpacity
          style={[styles.joinButton, { backgroundColor: colors.primary }]}
          onPress={handleJoin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.joinButtonText}>{t('join.joinButton')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
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
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  serviceButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 10,
    marginBottom: 10,
  },
  serviceButtonText: {
    fontSize: 14,
    fontWeight: '500',
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
    paddingVertical: 12,
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
    paddingVertical: 12,
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
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default JoinQueueScreen;