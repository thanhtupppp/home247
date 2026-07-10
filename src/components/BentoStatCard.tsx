import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

export interface BentoStatCardProps {
  readonly label: string;
  readonly value: string;
  readonly change?: string;
  readonly icon: string;
  readonly isWarning?: boolean;
  readonly progress?: number;
  readonly progressText?: string;
  readonly className?: string;
}

export const BentoStatCard: React.FC<BentoStatCardProps> = ({
  label,
  value,
  change,
  icon,
  isWarning = false,
  progress,
  progressText
}) => {
  // Map web material icons to Expo MaterialIcons
  let nativeIconName: keyof typeof MaterialIcons.glyphMap = 'payment';
  if (icon === 'bed') nativeIconName = 'king-bed';
  if (icon === 'message') nativeIconName = 'chat-bubble-outline';
  if (icon === 'priority_high') nativeIconName = 'priority-high';
  if (icon === 'trending_up') nativeIconName = 'trending-up';

  const cardIconColor = isWarning ? theme.colors.secondary : theme.colors.primary;

  return (
    <View style={[styles.card, isWarning ? styles.warningCard : styles.infoCard]}>
      <View style={styles.cardHeader}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.iconContainer, isWarning ? styles.warningIconContainer : styles.infoIconContainer]}>
          <MaterialIcons name={nativeIconName} size={20} color={cardIconColor} />
        </View>
      </View>

      {progress !== undefined ? (
        <View style={styles.progressContainer}>
          <View style={styles.valueRow}>
            <Text style={styles.value}>{value}</Text>
            <Text style={styles.totalValue}>/ 20</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progress}%` }]} />
          </View>
          {progressText && <Text style={styles.progressText}>{progressText}</Text>}
        </View>
      ) : (
        <View style={styles.statContainer}>
          <Text style={[styles.value, isWarning && styles.warningValue]}>{value}</Text>
          {change && (
            <View style={styles.changeRow}>
              <MaterialIcons 
                name={isWarning ? 'priority-high' : 'trending-up'} 
                size={14} 
                color={cardIconColor} 
              />
              <Text style={[styles.changeText, isWarning ? styles.warningChange : styles.primaryChange]}>
                {change}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    padding: 16,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  warningCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.secondary,
  },
  infoCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurfaceVariant,
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIconContainer: {
    backgroundColor: '#004ac610',
  },
  warningIconContainer: {
    backgroundColor: '#9d430010',
  },
  progressContainer: {
    marginTop: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  value: {
    ...theme.typography.displayLg,
    fontSize: 36,
    lineHeight: 42,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  warningValue: {
    color: theme.colors.secondary,
  },
  totalValue: {
    ...theme.typography.headlineMd,
    color: theme.colors.onSurfaceVariant,
    marginLeft: 4,
  },
  track: {
    height: 8,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surfaceContainer,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
  },
  progressText: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurfaceVariant,
    marginTop: 6,
  },
  statContainer: {
    marginTop: 4,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  changeText: {
    ...theme.typography.labelMd,
    fontWeight: '600',
  },
  primaryChange: {
    color: theme.colors.primary,
  },
  warningChange: {
    color: theme.colors.secondary,
  },
});

export default BentoStatCard;
