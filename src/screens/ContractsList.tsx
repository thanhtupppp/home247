import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

const FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'active', label: 'Đang ở' },
  { key: 'expiring', label: 'Sắp đến hạn' },
  { key: 'expired', label: 'Đã hết hạn' },
] as const;

export const ContractsList: React.FC = () => {
  const navigation = useNavigation<any>();
  const [searchText, setSearchText] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState<'active' | 'all' | 'expiring' | 'expired'>('active');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Hợp đồng</Text>
        <Pressable onPress={() => navigation.navigate('hop-dong/moi')} style={styles.createButton}>
          <MaterialIcons name="add" size={16} color={theme.colors.primary} />
          <Text style={styles.createButtonText}>Tạo HĐ</Text>
        </Pressable>
      </View>

      {/* Search Bar & Tune button */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={22} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm hợp đồng"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <Pressable style={styles.filterIconButton}>
          <MaterialIcons name="tune" size={22} color="#475569" />
          <View style={styles.badgeDot} />
        </Pressable>
      </View>

      {/* Filter Pills */}
      <View style={styles.pillsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsScroll}
          data={FILTERS}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => {
            const isActive = activeFilter === item.key;
            return (
              <Pressable
                style={[styles.pill, isActive && styles.pillActive]}
                onPress={() => setActiveFilter(item.key)}
              >
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Empty State */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Không có hợp đồng nào</Text>
        </View>
      </ScrollView>
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  createButtonText: {
    ...theme.typography.bodyMd,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.marginMobile,
    paddingVertical: 12,
    backgroundColor: theme.colors.surfaceContainerLowest,
    gap: 12,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.onSurface,
    padding: 0,
  },
  filterIconButton: {
    width: 46,
    height: 46,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: theme.colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    borderWidth: 1.5,
    borderColor: theme.colors.surfaceContainerLowest,
  },
  pillsContainer: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  pillsScroll: {
    paddingHorizontal: theme.spacing.marginMobile,
    gap: 10,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  pillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  pillText: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurfaceVariant,
  },
  pillTextActive: {
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
  },
  scrollContent: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 180,
  },
  emptyStateText: {
    ...theme.typography.bodyLg,
    color: theme.colors.onSurfaceVariant,
  },
});

export default ContractsList;
