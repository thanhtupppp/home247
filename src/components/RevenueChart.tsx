import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import type { RevenueMonth } from '../data/mockData';
import { theme } from '../theme';

export interface RevenueChartProps {
  readonly history: readonly RevenueMonth[];
  readonly className?: string;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ history }) => {
  const [animatedHeights, setAnimatedHeights] = useState<readonly number[]>(() => history.map(() => 0));

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedHeights(history.map(item => item.height));
    }, 150);
    return () => clearTimeout(timer);
  }, [history]);

  return (
    <View style={styles.chartCard}>
      <View style={styles.header}>
        <Text style={styles.chartTitle}>Doanh thu 6 tháng gần nhất</Text>
        <View style={styles.legend}>
          <View style={styles.legendDot} />
          <Text style={styles.legendText}>Thực thu</Text>
        </View>
      </View>
      
      <View style={styles.chartArea}>
        {history.map((item, idx) => (
          <View key={item.month} style={styles.barColumn}>
            <View style={styles.barContainer}>
              <View 
                style={[
                  styles.bar,
                  idx === history.length - 1 ? styles.activeBar : styles.normalBar,
                  { height: animatedHeights[idx] * 0.8 } // Scaled down for mobile view
                ]}
              >
                <View style={styles.tooltip}>
                  <Text style={styles.tooltipText}>{item.amount}</Text>
                </View>
              </View>
            </View>
            <Text style={[styles.barLabel, idx === history.length - 1 && styles.activeBarLabel]}>
              {item.month}
            </Text>
          </View>
        ))}
        {/* Horizontal grid line */}
        <View style={styles.gridLine} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartCard: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    ...theme.typography.titleLg,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  legendText: {
    ...theme.typography.labelMd,
    color: theme.colors.onSurfaceVariant,
  },
  chartArea: {
    height: 180,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    position: 'relative',
    paddingTop: 24,
    paddingHorizontal: 8,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  barContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
  },
  bar: {
    width: 24,
    borderRadius: theme.borderRadius.lg,
    position: 'relative',
    alignItems: 'center',
  },
  normalBar: {
    backgroundColor: theme.colors.primaryContainer,
    opacity: 0.6,
  },
  activeBar: {
    backgroundColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: theme.colors.primaryFixedDim,
  },
  tooltip: {
    position: 'absolute',
    top: -24,
    backgroundColor: theme.colors.onSurface,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    zIndex: 10,
  },
  tooltipText: {
    fontSize: 9,
    color: theme.colors.surfaceContainerLowest,
    fontWeight: 'bold',
  },
  barLabel: {
    ...theme.typography.labelMd,
    color: theme.colors.onSurfaceVariant,
    marginTop: 8,
  },
  activeBarLabel: {
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  gridLine: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: theme.colors.outlineVariant,
    opacity: 0.3,
    zIndex: -1,
  },
});

export default RevenueChart;
