import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Modal,
  FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import Logo from '../components/Logo';
import { useTheme } from '../context/ThemeContext';
import { saveLanguage, getLanguage } from '../storage/storage';
import i18n from '../translations/i18n';

const SettingsScreen = () => {
  const { t } = useTranslation();
  const { theme, colors, changeTheme } = useTheme();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [languageDropdownVisible, setLanguageDropdownVisible] = useState(false);
  const [themeDropdownVisible, setThemeDropdownVisible] = useState(false);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    const lang = await getLanguage();
    setCurrentLanguage(lang || 'en');
    i18n.changeLanguage(lang || 'en');
  };

  const changeLanguage = async (lang) => {
    setCurrentLanguage(lang);
    await saveLanguage(lang);
    i18n.changeLanguage(lang);
    setLanguageDropdownVisible(false);
  };

  const openEmail = () => {
    Linking.openURL('mailto:hafidh@queuexpress.com');
  };

  const openPhone = () => {
    Linking.openURL('tel:+255623101586');
  };

  const languageOptions = [
    { value: 'en', label: t('settings.english') },
    { value: 'sw', label: t('settings.swahili') },
  ];

  const themeOptions = [
    { value: 'light', label: t('settings.light') },
    { value: 'dark', label: t('settings.dark') },
  ];

  const getLanguageLabel = () => {
    const found = languageOptions.find(opt => opt.value === currentLanguage);
    return found ? found.label : t('settings.english');
  };

  const getThemeLabel = () => {
    const found = themeOptions.find(opt => opt.value === theme);
    return found ? found.label : t('settings.light');
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Logo size="small" showText={false} />

      {/* Help Center - Centered Card */}
      <View style={[styles.helpSection, { backgroundColor: colors.surface, shadowColor: colors.dark }]}>
        <Text style={[styles.helpTitle, { color: colors.text }]}>{t('settings.helpCenter')}</Text>
        
        <TouchableOpacity style={styles.helpButton} onPress={openEmail}>
          <Ionicons name="mail-outline" size={24} color={colors.primary} />
          <Text style={[styles.helpButtonText, { color: colors.text }]}>{t('settings.supportEmail')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.helpButton} onPress={openPhone}>
          <Ionicons name="call-outline" size={24} color={colors.primary} />
          <Text style={[styles.helpButtonText, { color: colors.text }]}>{t('settings.supportPhone')}</Text>
        </TouchableOpacity>
      </View>

      {/* Settings Heading */}
      <Text style={[styles.heading, { color: colors.text }]}>{t('settings.title')}</Text>

      {/* Language & Theme - Combined Card */}
      <View style={[styles.settingsSection, { backgroundColor: colors.surface, shadowColor: colors.dark }]}>
        {/* Language Dropdown */}
        <TouchableOpacity
          style={styles.dropdownItem}
          onPress={() => setLanguageDropdownVisible(true)}
        >
          <View style={styles.optionLeft}>
            <Ionicons name="language-outline" size={24} color={colors.primary} />
            <Text style={[styles.optionText, { color: colors.text }]}>{t('settings.language')}</Text>
          </View>
          <View style={styles.dropdownRight}>
            <Text style={[styles.dropdownValue, { color: colors.textSecondary }]}>{getLanguageLabel()}</Text>
            <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>

        {/* Spacer between items */}
        <View style={styles.spacer} />

        {/* Theme Dropdown */}
        <TouchableOpacity
          style={styles.dropdownItem}
          onPress={() => setThemeDropdownVisible(true)}
        >
          <View style={styles.optionLeft}>
            <Ionicons name="color-palette-outline" size={24} color={colors.primary} />
            <Text style={[styles.optionText, { color: colors.text }]}>{t('settings.theme')}</Text>
          </View>
          <View style={styles.dropdownRight}>
            <Text style={[styles.dropdownValue, { color: colors.textSecondary }]}>{getThemeLabel()}</Text>
            <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>
      </View>

      {/* About Section - Simple Text */}
      <View style={styles.aboutContainer}>
        <Text style={[styles.aboutTitle, { color: colors.text }]}>QueueXpress</Text>
        <Text style={[styles.aboutVersion, { color: colors.textSecondary }]}>{t('settings.version')}</Text>
        <Text style={[styles.aboutCopyright, { color: colors.textSecondary }]}>
          {t('settings.copyright')}
        </Text>
      </View>

      {/* Language Dropdown Modal */}
      <Modal
        visible={languageDropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLanguageDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setLanguageDropdownVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('settings.language')}</Text>
              <TouchableOpacity onPress={() => setLanguageDropdownVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={languageOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, { borderBottomColor: colors.border }]}
                  onPress={() => changeLanguage(item.value)}
                >
                  <Text style={[styles.modalItemText, { color: colors.text }]}>
                    {item.label}
                  </Text>
                  {currentLanguage === item.value && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Theme Dropdown Modal */}
      <Modal
        visible={themeDropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setThemeDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setThemeDropdownVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('settings.theme')}</Text>
              <TouchableOpacity onPress={() => setThemeDropdownVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={themeOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, { borderBottomColor: colors.border }]}
                  onPress={() => changeTheme(item.value)}
                >
                  <Text style={[styles.modalItemText, { color: colors.text }]}>
                    {item.label}
                  </Text>
                  {theme === item.value && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
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
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  settingsSection: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  spacer: {
    height: 16,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  optionText: {
    fontSize: 16,
  },
  dropdownRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownValue: {
    fontSize: 14,
  },
  helpSection: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
  },
  helpButtonText: {
    fontSize: 15,
  },
  aboutContainer: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 30,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  aboutVersion: {
    fontSize: 13,
    marginBottom: 4,
  },
  aboutCopyright: {
    fontSize: 11,
    textAlign: 'center',
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

export default SettingsScreen;