import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import Logo from '../components/Logo';
import { getQueueStatus } from '../api/queue';
import { getQueueData, clearQueueData } from '../storage/storage';
import { getColors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';

const QueueStatusScreen = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [queueId, setQueueId] = useState(null);
  const [queueNumber, setQueueNumber] = useState(null);

  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    const data = await getQueueData();
    setQueueId(data.queueId);
    setQueueNumber(data.queueNumber);
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['queueStatus', queueId],
    queryFn: () => getQueueStatus(queueId),
    enabled: !!queueId,
    refetchInterval: 5000,
    onSuccess: (statusData) => {
      console.log('Queue status data:', statusData);
    },
    onError: (err) => {
      if (err?.response?.status === 404) {
        clearQueueData();
        setQueueId(null);
        setQueueNumber(null);
      }
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting': return '#F59E0B';
      case 'called': return '#3B82F6';
      case 'served': return '#22C55E';
      case 'skipped': return '#EF4444';
      default: return '#64748B';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'waiting': return t('status.waiting');
      case 'called': return t('status.called');
      case 'served': return t('status.served');
      case 'skipped': return t('status.skipped');
      default: return status;
    }
  };

  const getStatusIonicons = (status) => {
    switch (status) {
      case 'waiting': return 'time-outline';
      case 'called': return 'call-outline';
      case 'served': return 'checkmark-circle-outline';
      case 'skipped': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  // No active queue
  if (!queueId) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Logo size="small" showText={false} />
        <View style={styles.emptyContainer}>
          <Ionicons name="scan-outline" size={80} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {t('status.noQueue')}
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t('status.noQueueMessage')}
          </Text>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => {
              Alert.alert('Info', 'Please go to Scan tab to join a queue');
            }}
          >
            <Ionicons name="qr-code-outline" size={20} color="#FFFFFF" />
            <Text style={styles.scanButtonText}>{t('status.scanButton')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Loading state
  if (isLoading && !data) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Logo size="small" showText={false} />
        <View style={styles.loadingContainer}>
          <Ionicons name="reload-outline" size={40} color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {t('common.loading')}
          </Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Logo size="small" showText={false} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={80} color="#EF4444" />
          <Text style={[styles.errorText, { color: '#EF4444' }]}>
            {t('common.error')}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Display queue status
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
      }
    >
      <Logo size="small" showText={false} />

      {/* Queue Number Card */}
      <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.dark }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="timer-outline" size={24} color={colors.primary} />
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
            {t('status.queueNumber')}
          </Text>
        </View>
        <Text style={[styles.queueNumber, { color: colors.primary }]}>
          #{data?.queue_number || queueNumber || '-'}
        </Text>
      </View>

      {/* Batch Number and Status Row */}
      <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.dark }]}>
        <View style={styles.row}>
          <View style={styles.halfColumn}>
            <View style={styles.cardHeader}>
              <Ionicons name="layers-outline" size={20} color={colors.primary} />
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
                {t('status.batchNumber')}
              </Text>
            </View>
            <Text style={[styles.cardValue, { color: colors.text }]}>
              {data?.batch_number || '-'}
            </Text>
          </View>
          <View style={styles.halfColumn}>
            <View style={styles.cardHeader}>
              <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
                {t('status.status')}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(data?.status) + '20' }]}>
              <Ionicons name={getStatusIonicons(data?.status)} size={16} color={getStatusColor(data?.status)} />
              <Text style={[styles.statusText, { color: getStatusColor(data?.status) }]}>
                {getStatusText(data?.status)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* People Ahead Card */}
      <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.dark }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="people-outline" size={24} color={colors.warning} />
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
            {t('status.peopleAhead')}
          </Text>
        </View>
        <Text style={[styles.largeValue, { color: '#F59E0B' }]}>
          {data?.people_ahead !== undefined ? data.people_ahead : '-'}
        </Text>
        {data?.people_ahead > 0 && (
          <Text style={[styles.hintText, { color: colors.textSecondary }]}>
            {data?.people_ahead === 1 
              ? "You're next in line!" 
              : `${data.people_ahead} people before you`}
          </Text>
        )}
      </View>

      {/* Estimated Time Card */}
      <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.dark }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="time-outline" size={24} color={colors.secondary} />
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
            {t('status.estimatedTime')}
          </Text>
        </View>
        <Text style={[styles.largeValue, { color: colors.secondary }]}>
          {data?.estimated_time !== undefined ? data.estimated_time : '-'} <Text style={styles.smallText}>{t('status.minutes')}</Text>
        </Text>
        <Text style={[styles.hintText, { color: colors.textSecondary }]}>
          Estimated waiting time based on current queue
        </Text>
      </View>

      {/* Served Message */}
      {data?.status === 'served' && (
        <View style={[styles.servedContainer, { backgroundColor: '#22C55E10' }]}>
          <Ionicons name="checkmark-circle" size={40} color="#22C55E" />
          <Text style={[styles.servedTitle, { color: '#22C55E' }]}>Service Completed!</Text>
          <Text style={[styles.servedText, { color: colors.textSecondary }]}>
            Thank you for using QueueXpress. Please rate your experience in the Feedback tab.
          </Text>
        </View>
      )}

      {/* Skipped Message */}
      {data?.status === 'skipped' && (
        <View style={[styles.skippedContainer, { backgroundColor: '#EF444410' }]}>
          <Ionicons name="close-circle" size={40} color="#EF4444" />
          <Text style={[styles.skippedTitle, { color: '#EF4444' }]}>Queue Skipped</Text>
          <Text style={[styles.skippedText, { color: colors.textSecondary }]}>
            Your turn was skipped. You can join a new queue if needed.
          </Text>
          <TouchableOpacity
            style={[styles.joinAgainButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              Alert.alert('Info', 'Please go to Scan tab to join a new queue');
            }}
          >
            <Ionicons name="qr-code-outline" size={18} color="#FFFFFF" />
            <Text style={styles.joinAgainButtonText}>Join New Queue</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 14,
  },
  queueNumber: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  cardValue: {
    fontSize: 28,
    fontWeight: '600',
  },
  largeValue: {
    fontSize: 42,
    fontWeight: 'bold',
  },
  smallText: {
    fontSize: 18,
    fontWeight: 'normal',
  },
  row: {
    flexDirection: 'row',
  },
  halfColumn: {
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  hintText: {
    fontSize: 12,
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 40,
  },
  scanButton: {
    flexDirection: 'row',
    backgroundColor: '#0099CC',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 24,
    gap: 8,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  errorText: {
    fontSize: 16,
    marginTop: 12,
  },
  retryButton: {
    backgroundColor: '#0099CC',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  servedContainer: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    marginTop: 16,
  },
  servedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
  },
  servedText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  skippedContainer: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    marginTop: 16,
  },
  skippedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
  },
  skippedText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  joinAgainButton: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
    gap: 8,
    alignItems: 'center',
  },
  joinAgainButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default QueueStatusScreen;