import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

export interface TopAppBarProps {
  readonly className?: string; // Kept for compatibility if needed, though styles are in StyleSheet
}

export const TopAppBar: React.FC<TopAppBarProps> = () => {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.brand}>
          <MaterialIcons name="home-work" size={26} color={theme.colors.primary} />
          <Text style={styles.title}>Home247</Text>
        </View>
        <View style={styles.actions}>
          <Pressable style={styles.iconButton} accessibilityLabel="Notifications" accessibilityRole="button">
            <MaterialIcons name="notifications-none" size={24} color={theme.colors.onSurfaceVariant} />
            <View style={styles.badge} />
          </Pressable>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AD</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.marginMobile,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    ...theme.typography.headlineMd,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.secondary,
    borderWidth: 1,
    borderColor: theme.colors.surface,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...theme.typography.labelMd,
    fontWeight: 'bold',
    color: theme.colors.onPrimaryFixed,
  },
});

export default TopAppBar;
