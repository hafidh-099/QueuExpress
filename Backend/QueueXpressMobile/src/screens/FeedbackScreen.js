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
import { Ionicons } from '@expo/vector-icons';
import Logo from '../components/Logo';
import { submitFeedback } from '../api/queue';
import { getQueueData } from '../storage/storage';
import { useTheme } from '../context/ThemeContext';

const FeedbackScreen = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasQueue, setHasQueue] = useState(false);
  const [queueId, setQueueId] = useState(null);

  useEffect(() => {
    checkQueueStatus();
  }, []);

  const checkQueueStatus = async () => {
    const data = await getQueueData();
    if (data.queueId) {
      setHasQueue(true);
      setQueueId(data.queueId);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert(t('alerts.error'), t('feedback.validation.ratingRequired'));
      return;
    }

    if (!hasQueue || !queueId) {
      Alert.alert(
        t('feedback.cannotSubmit'),
        t('feedback.mustBeServed'),
        [
          { 
            text: t('feedback.joinQueue'), 
            onPress: () => {
              // Navigate to Scan tab
            }
          },
          { text: t('alerts.ok') }
        ]
      );
      return;
    }

    setLoading(true);

    try {
      await submitFeedback(queueId, rating, message);
      Alert.alert(t('alerts.success'), t('feedback.success'));
      setRating(0);
      setMessage('');
    } catch (error) {
      console.error('Feedback error:', error);
      
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        if (status === 400 && errorData?.error === 'Feedback can only be given for served queues') {
          Alert.alert(
            t('feedback.cannotSubmit'),
            t('feedback.mustBeServed'),
            [
              { 
                text: t('feedback.joinQueue'), 
                onPress: () => {
                  // Navigate to Scan tab
                }
              },
              { text: t('alerts.ok') }
            ]
          );
        } else {
          Alert.alert(t('alerts.error'), errorData?.error || t('feedback.error'));
        }
      } else {
        Alert.alert(t('alerts.error'), t('feedback.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => setRating(i)} style={styles.starButton}>
          <Ionicons
            name={i <= rating ? 'star' : 'star-outline'}
            size={40}
            color={i <= rating ? '#F59E0B' : '#CBD5E1'}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Logo size="small" showText={false} />

      <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.dark }]}>
        <View style={styles.header}>
          <Ionicons name="star-outline" size={28} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>{t('feedback.title')}</Text>
        </View>

        {/* Rating Section */}
        <View style={styles.ratingContainer}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {t('feedback.rating')} <Text style={{ color: '#EF4444' }}>*</Text>
          </Text>
          <View style={styles.starsContainer}>{renderStars()}</View>
        </View>

        {/* Message Section */}
        <View style={styles.messageContainer}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            <Ionicons name="chatbubble-outline" size={16} color={colors.textSecondary} /> {t('feedback.message')}
          </Text>
          <TextInput
            style={[
              styles.messageInput,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder={t('feedback.messagePlaceholder')}
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            value={message}
            onChangeText={setMessage}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="send-outline" size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>{t('feedback.submitButton')}</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Info Note */}
        <View style={[styles.infoContainer, { backgroundColor: colors.primary + '10' }]}>
          <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {t('feedback.infoNote')}
          </Text>
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  starButton: {
    paddingHorizontal: 4,
  },
  messageContainer: {
    marginBottom: 24,
  },
  messageInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
  },
  submitButton: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    flex: 1,
  },
});

export default FeedbackScreen;