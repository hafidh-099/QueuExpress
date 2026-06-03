import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Vibration,
  Dimensions,
  Animated,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { getColors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

const ScanQRScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flashlight, setFlashlight] = useState(false);
  const [colors, setColors] = useState(getColors('light'));
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadTheme();
    startScanAnimation();
  }, []);

  const loadTheme = async () => {
    setColors(getColors('light'));
  };

  const startScanAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleBarCodeScanned = ({ data }) => {
    if (scanned) return;
    
    setScanned(true);
    Vibration.vibrate(200);
    
    if (data && (data.includes('/join') || data.includes('join'))) {
      navigation.navigate('Join', { qrData: data });
    } else {
      Alert.alert(
        'Invalid QR Code',
        'This QR code is not valid for QueueXpress. Please scan a valid QueueXpress QR code.',
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
    }
  };

  const scanLineTranslate = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 220],
  });

  if (!permission) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.messageContainer}>
          <Text style={[styles.messageText, { color: colors.text }]}>
            Requesting camera permission...
          </Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.messageContainer}>
          <Icon name="camera-outline" size={60} color={colors.textSecondary} />
          <Text style={[styles.messageTitle, { color: colors.text }]}>
            {t('scan.permissionTitle')}
          </Text>
          <Text style={[styles.messageText, { color: colors.textSecondary }]}>
            {t('scan.permissionMessage')}
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>{t('scan.allow')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* CameraView - NO CHILDREN ALLOWED */}
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        enableTorch={flashlight}
      />
      
      {/* Overlay - Absolutely positioned on top, NOT inside CameraView */}
      <View style={styles.overlay}>
        {/* Semi-transparent background */}
        <View style={styles.overlayBackground} />
        
        {/* Scanner Frame */}
        <View style={styles.scannerFrame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
          <Animated.View 
            style={[
              styles.scannerLine,
              { transform: [{ translateY: scanLineTranslate }] }
            ]} 
          />
        </View>
      </View>

      {/* Flashlight Button */}
      <TouchableOpacity
        style={[styles.flashlightButton, { backgroundColor: colors.surface }]}
        onPress={() => setFlashlight(!flashlight)}
      >
        <Icon 
          name={flashlight ? 'flashlight' : 'flashlight-outline'} 
          size={24} 
          color={colors.primary} 
        />
      </TouchableOpacity>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          Position QR code within the frame
        </Text>
      </View>

      {/* Rescan Button */}
      {scanned && (
        <TouchableOpacity
          style={[styles.rescanButton, { backgroundColor: colors.primary }]}
          onPress={() => setScanned(false)}
        >
          <Text style={styles.rescanButtonText}>Scan Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scannerFrame: {
    width: 280,
    height: 280,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#0099CC',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  scannerLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#0099CC',
    borderRadius: 1.5,
    shadowColor: '#0099CC',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  messageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  messageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  messageText: {
    fontSize: 14,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#0099CC',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 24,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  flashlightButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionsText: {
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  rescanButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#0099CC',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  rescanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ScanQRScreen;