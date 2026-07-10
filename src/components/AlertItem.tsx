import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { AlertItemType } from '../data/mockData';
import { theme } from '../theme';

export interface AlertItemProps {
  readonly alert: AlertItemType;
  readonly className?: string;
}

export const AlertItem: React.FC<AlertItemProps> = ({ alert }) => {
  let containerStyle = styles.infoContainer;
  let titleStyle = styles.infoTitle;
  let iconColor = theme.colors.onSurfaceVariant;
  let actionBtnStyle = styles.infoActionBtn;

  if (alert.type === 'error') {
    containerStyle = styles.errorContainer;
    titleStyle = styles.errorTitle;
    iconColor = theme.colors.error;
    actionBtnStyle = styles.errorActionBtn;
  } else if (alert.type === 'warning') {
    containerStyle = styles.warningContainer;
    titleStyle = styles.warningTitle;
    iconColor = theme.colors.secondary;
    actionBtnStyle = styles.warningActionBtn;
  }

  // Map web material icon name to Expo MaterialIcons
  let nativeIconName: keyof typeof MaterialIcons.glyphMap = 'info';
  if (alert.icon === 'report') nativeIconName = 'report-problem';
  if (alert.icon === 'electrical_services') nativeIconName = 'electrical-services';
  if (alert.icon === 'water_drop') nativeIconName = 'water-drop';

  return (
    <View style={[styles.card, containerStyle]}>
      <MaterialIcons name={nativeIconName} size={22} color={iconColor} style={styles.icon} />
      <View style={styles.content}>
        <Text style={[styles.title, titleStyle]}>{alert.title}</Text>
        <Text style={styles.description}>{alert.description}</Text>
        {alert.actionText && (
          <Pressable 
            style={styles.actionPressable}
            accessibilityRole="button"
            accessibilityLabel={alert.actionText}
          >
            <Text style={[styles.actionBtnText, actionBtnStyle]}>{alert.actionText}</Text>
            <MaterialIcons name="arrow-forward" size={14} color={iconColor} />
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: theme.borderRadius.lg,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  icon: {
    marginTop: 2,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    ...theme.typography.bodyLg,
    fontWeight: 'bold',
  },
  description: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurfaceVariant,
  },
  actionPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  actionBtnText: {
    ...theme.typography.labelMd,
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: theme.colors.surfaceContainerLow,
    borderLeftColor: theme.colors.outline,
  },
  infoTitle: {
    color: theme.colors.onSurface,
  },
  infoActionBtn: {
    color: theme.colors.primary,
  },
  errorContainer: {
    backgroundColor: '#fef2f2', // Light red
    borderLeftColor: theme.colors.error,
  },
  errorTitle: {
    color: '#991b1b',
  },
  errorActionBtn: {
    color: '#991b1b',
  },
  warningContainer: {
    backgroundColor: '#fff7ed', // Light orange
    borderLeftColor: theme.colors.secondary,
  },
  warningTitle: {
    color: '#9a3412',
  },
  warningActionBtn: {
    color: '#9a3412',
  },
});

export default AlertItem;
