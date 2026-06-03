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
import Icon from 'react-native-vector-icons/Ionicons';
import Logo from '../components/Logo';
import { getQueueStatus } from '../api/queue';
import { getQueueData, clearQueueData } from '../storage/storage';
import { getColors } from '../theme/colors';

const QueueStatusScreen = () => {
  const { t } = useTranslation();
  const [colors, setColors] = useState(getColors('light'));
  const [refreshing, setRefreshing] = useState(false);
  const [queueId, setQueueId] = useState(null);
  const [queueNumber, setQueueNumber] = useState(null);

  // Load saved queue data and theme
  useEffect(() => {
    loadSavedData();
    loadTheme();
  }, []);

  const loadSavedData = async () => {
    const data = await getQueueData();
    setQueueId(data.queueId);
    setQueueNumber(data.queueNumber);
  };

  const loadTheme = async () => {
    // For now, use light theme
    setColors(getColors('light'));
  };

  // Fetch queue status
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['queueStatus', queueId],
    queryFn: () => getQueueStatus(queueId),
    enabled: !!queueId,
    refetchInterval: 5000, // Poll every 5 seconds
    onError: () => {
      // If queue not found, clear local data
      if (error?.response?.status === 404) {
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
      case 'waiting': return colors.status.waiting;
      case 'called': return colors.status.called;
      case 'served': return colors.status.served;
      case 'skipped': return colors.status.skipped;
      default: return colors.textSecondary;
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

  // If no active queue
  if (!queueId) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Logo size="medium" showText={true} />
        <View style={styles.emptyContainer}>
          <Icon name="scan-outline" size={80} color={colors.textSecondary} />
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
        <Logo size="medium" showText={true} />
        <View style={styles.loadingContainer}>
          <Icon name="reload" size={40} color={colors.primary} />
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
        <Logo size="medium" showText={true} />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={80} color={colors.danger} />
          <Text style={[styles.errorText, { color: colors.danger }]}>
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
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
      }
    >
      <Logo size="medium" showText={true} />

      {/* Queue Number Card */}
      <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.dark }]}>
        <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
          {t('status.queueNumber')}
        </Text>
        <Text style={[styles.queueNumber, { color: colors.primary }]}>
          #{data?.queue_number}
        </Text>
      </View>

      {/* Status Card */}
      <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.dark }]}>
        <View style={styles.row}>
          <View style={styles.halfColumn}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
              {t('status.batchNumber')}
            </Text>
            <Text style={[styles.cardValue, { color: colors.text }]}>
              {data?.batch_number || '-'}
            </Text>
          </View>
          <View style={styles.halfColumn}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
              {t('status.status')}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(data?.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(data?.status) }]}>
                {getStatusText(data?.status)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* People Ahead Card */}
      <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.dark }]}>
        <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
          {t('status.peopleAhead')}
        </Text>
        <Text style={[styles.largeValue, { color: colors.warning }]}>
          {data?.people_ahead || 0}
        </Text>
        {data?.people_ahead > 0 && (
          <Text style={[styles.hintText, { color: colors.textSecondary }]}>
            {data?.people_ahead === 1 
              ? "You're next in line!" 
              : `${data?.people_ahead} people before you`}
          </Text>
        )}
      </View>

      {/* Estimated Time Card */}
      <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.dark }]}>
        <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
          {t('status.estimatedTime')}
        </Text>
        <Text style={[styles.largeValue, { color: colors.secondary }]}>
          {data?.estimated_time || 0} <Text style={styles.smallText}>{t('status.minutes')}</Text>
        </Text>
        <Text style={[styles.hintText, { color: colors.textSecondary }]}>
          Estimated waiting time
        </Text>
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
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  queueNumber: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '600',
  },
  largeValue: {
    fontSize: 36,
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
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  hintText: {
    fontSize: 12,
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
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
    backgroundColor: '#0099CC',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 24,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
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
});

export default QueueStatusScreen;