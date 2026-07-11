import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

export const UtilityManagement: React.FC = () => {
  const navigation = useNavigation<any>();
  const [selectedMonth, setSelectedMonth] = React.useState('10/2026');
  const [selectedBuilding, setSelectedBuilding] = React.useState('nơ trang long');
  const [showBuildingDropdown, setShowBuildingDropdown] = React.useState(false);

  const months = ['2026', '09/2026', '10/2026', '11/2026', '12/2026'];
  const buildings = ['nơ trang long', 'Home247 Landmark', 'Home247 Riverside'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Điện nước</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Months Selector */}
      <View style={styles.monthsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthsScroll}>
          {months.map((month) => {
            const isActive = selectedMonth === month;
            return (
              <Pressable key={month} onPress={() => setSelectedMonth(month)} style={styles.monthItem}>
                <Text style={[styles.monthText, isActive && styles.monthTextActive]}>
                  {month}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Building Selector Card */}
      <View style={styles.content}>
        <Pressable onPress={() => setShowBuildingDropdown(!showBuildingDropdown)} style={styles.selectorCard}>
          <View style={styles.selectorLeft}>
            <MaterialIcons name="apartment" size={20} color={theme.colors.primary} />
            <Text style={styles.buildingName}>{selectedBuilding}</Text>
          </View>
          <View style={styles.selectorRight}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>0</Text>
            </View>
            <MaterialIcons name="keyboard-arrow-down" size={24} color={theme.colors.primary} />
          </View>
        </Pressable>

        {showBuildingDropdown && (
          <View style={styles.dropdown}>
            {buildings.map((building) => (
              <Pressable
                key={building}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedBuilding(building);
                  setShowBuildingDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{building}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <Pressable 
          style={styles.actionBtn}
          onPress={() => navigation.navigate('dien-nuoc/ghi', { building: selectedBuilding })}
        >
          <MaterialIcons name="add" size={24} color={theme.colors.onPrimary} />
          <Text style={styles.actionBtnText}>Ghi điện nước</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.marginMobile,
    paddingTop: theme.spacing.lg + 16,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...theme.typography.titleLg,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  monthsContainer: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  monthsScroll: {
    paddingHorizontal: theme.spacing.marginMobile,
    gap: 24,
  },
  monthItem: {
    paddingVertical: 4,
  },
  monthText: {
    ...theme.typography.bodyLg,
    color: theme.colors.onSurfaceVariant,
  },
  monthTextActive: {
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: theme.spacing.marginMobile,
    zIndex: 1,
  },
  selectorCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    borderWidth: 1,
    borderColor: '#bce0fd',
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buildingName: {
    ...theme.typography.bodyMd,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  selectorRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: '#dbeafe',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  dropdown: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.xl,
    marginTop: 8,
    overflow: 'hidden',
    boxShadow: [{
      offsetX: 0,
      offsetY: 4,
      blurRadius: 8,
      color: 'rgba(0,0,0,0.05)'
    }],
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceContainer,
  },
  dropdownItemText: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurface,
  },
  bottomBar: {
    padding: theme.spacing.marginMobile,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 14,
    gap: 8,
  },
  actionBtnText: {
    ...theme.typography.bodyLg,
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
  },
});

export default UtilityManagement;
