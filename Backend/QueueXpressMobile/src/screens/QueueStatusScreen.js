import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Vibration,
  Dimensions,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Logo from '../components/Logo';
import { getQueueStatus } from '../api/queue';
import { getQueueData, clearQueueData } from '../storage/storage';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const QueueStatusScreen = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [queueId, setQueueId] = useState(null);
  const [queueNumber, setQueueNumber] = useState(null);
  const [previousStatus, setPreviousStatus] = useState(null);

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
    refetchInterval: 3000,
    onSuccess: (statusData) => {
      console.log('Queue status data:', statusData);
      
      if (previousStatus && previousStatus !== statusData.status) {
        if (statusData.status === 'called') {
          Vibration.vibrate([500, 200, 500]);
        } else if (statusData.status === 'served') {
          Vibration.vibrate([300, 100, 300, 100, 500]);
        } else if (statusData.status === 'skipped') {
          Vibration.vibrate([200, 100, 200]);
        }
      }
      setPreviousStatus(statusData.status);
    },
    onError: (err) => {
      if (err?.response?.status === 404) {
        Alert.alert(
          t('status.queueNotFound'),
          t('status.queueEndedMessage'),
          [
            {
              text: t('status.joinNewQueue'),
              onPress: () => navigation.navigate('MainTabs', { screen: 'Scan' }),
            },
            { text: t('alerts.ok') },
          ]
        );
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

  const getStatusIcon = (status) => {
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
          <View style={styles.emptyIconContainer}>
            <Ionicons name="scan-outline" size={80} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {t('status.noQueue')}
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t('status.noQueueMessage')}
          </Text>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => {
              navigation.navigate('MainTabs', { screen: 'Scan' });
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

  const statusColor = getStatusColor(data?.status);
  const statusText = getStatusText(data?.status);
  const statusIcon = getStatusIcon(data?.status);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
      }
    >
      <Logo size="small" showText={false} />

      {/* Main Card - Large Receipt Style */}
      <View style={[styles.mainCard, { 
        backgroundColor: colors.surface,
        shadowColor: colors.dark,
        borderColor: statusColor + '40',
      }]}>
        
        {/* Queue Info - Top */}
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          {t('status.queueInfo')}
        </Text>

        {/* Status - Below with spacing */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Ionicons name={statusIcon} size={18} color={statusColor} />
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>
              {statusText}
            </Text>
          </View>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Queue Number - Extra Large */}
        <Text style={[styles.queueNumber, { color: colors.primary }]}>
          {data?.queue_number || queueNumber || '-'}
        </Text>

        {/* People Ahead */}
        <View style={styles.peopleContainer}>
          <Ionicons name="people-outline" size={22} color={colors.warning} />
          <Text style={[styles.peopleText, { color: colors.textSecondary }]}>
            {data?.people_ahead !== undefined ? data.people_ahead : '-'} {t('status.peopleAhead')}
          </Text>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Bottom Row */}
        <View style={styles.bottomRow}>
          <View style={styles.bottomItem}>
            <Ionicons name="time-outline" size={22} color={colors.primary} />
            <Text style={[styles.bottomLabel, { color: colors.textSecondary }]}>
              {t('status.estimatedTime')}
            </Text>
            <Text style={[styles.bottomValue, { color: colors.primary }]}>
              {data?.estimated_time !== undefined ? data.estimated_time : '-'} {t('status.minutes')}
            </Text>
          </View>
          
          <View style={[styles.bottomDivider, { backgroundColor: colors.border }]} />
          
          <View style={styles.bottomItem}>
            <Ionicons name="layers-outline" size={22} color={colors.primary} />
            <Text style={[styles.bottomLabel, { color: colors.textSecondary }]}>
              {t('status.batchNumber')}
            </Text>
            <Text style={[styles.bottomValue, { color: colors.primary }]}>
              {data?.batch_number || '-'}
            </Text>
          </View>
        </View>

        {/* Decorative Bottom Line */}
        <View style={[styles.decorativeLine, { borderColor: statusColor + '30' }]} />
      </View>

      {/* Served Action */}
      {data?.status === 'served' && (
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: '#22C55E15', borderColor: '#22C55E' }]}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Feedback' })}
        >
          <Ionicons name="star-outline" size={22} color="#22C55E" />
          <Text style={[styles.actionCardText, { color: '#22C55E' }]}>
            {t('status.rateExperience')}
          </Text>
          <Ionicons name="chevron-forward-outline" size={18} color="#22C55E" />
        </TouchableOpacity>
      )}

      {/* Skipped Action */}
      {data?.status === 'skipped' && (
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: '#EF444415', borderColor: '#EF4444' }]}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Scan' })}
        >
          <Ionicons name="qr-code-outline" size={22} color="#EF4444" />
          <Text style={[styles.actionCardText, { color: '#EF4444' }]}>
            {t('status.joinNewQueue')}
          </Text>
          <Ionicons name="chevron-forward-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
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
    paddingTop: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },

  // Main Card
  mainCard: {
    width: width - 40,
    borderRadius: 24,
    padding: 32,
    paddingTop: 28,
    paddingBottom: 28,
    marginBottom: 16,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    minHeight: 500,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 16,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
  },
  statusBadgeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  spacer: {
    height: 30,
  },
  queueNumber: {
    fontSize: 80,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 3,
  },
  peopleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 28,
  },
  peopleText: {
    fontSize: 17,
    fontWeight: '500',
  },
  divider: {
    height: 1.5,
    marginBottom: 24,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  bottomItem: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  bottomLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  bottomValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  bottomDivider: {
    width: 1,
    height: 55,
  },
  decorativeLine: {
    marginTop: 24,
    height: 3,
    borderWidth: 0,
    borderRadius: 4,
    borderStyle: 'dashed',
    borderWidth: 1,
  },

  // Action Card
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    gap: 10,
    width: width - 40,
  },
  actionCardText: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#0099CC10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 40,
    marginBottom: 24,
  },
  scanButton: {
    flexDirection: 'row',
    backgroundColor: '#0099CC',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Loading & Error
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  errorText: {
    fontSize: 16,
    marginTop: 12,
  },
  retryButton: {
    backgroundColor: '#0099CC',
    paddingHorizontal: 24,
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