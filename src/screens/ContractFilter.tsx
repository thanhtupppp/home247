import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

// ── Types ────────────────────────────────────────────────────────────────────

export interface ContractFilterParams {
  status?: 'all' | 'active' | 'pending' | 'expired';
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  minRent?: string;
  maxRent?: string;
  keyword?: string;
}

const STATUS_OPTIONS = [
  { key: 'all',     label: 'Tất cả',        icon: 'select-all' as const,   color: theme.colors.onSurfaceVariant },
  { key: 'active',  label: 'Đang hiệu lực', icon: 'check-circle' as const, color: '#137333' },
  { key: 'pending', label: 'Chờ duyệt',     icon: 'pending' as const,      color: '#b45309' },
  { key: 'expired', label: 'Đã hết hạn',    icon: 'cancel' as const,       color: '#c5221f' },
] as const;

// ── Component ─────────────────────────────────────────────────────────────────

const ContractFilter: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const initial: ContractFilterParams = route.params?.currentFilter ?? {};

  // ── State ──────────────────────────────────────────────────────────────────
  const [status, setStatus] = React.useState<ContractFilterParams['status']>(
    initial.status ?? 'all'
  );
  const [startDateFrom, setStartDateFrom] = React.useState(initial.startDateFrom ?? '');
  const [startDateTo, setStartDateTo] = React.useState(initial.startDateTo ?? '');
  const [endDateFrom, setEndDateFrom] = React.useState(initial.endDateFrom ?? '');
  const [endDateTo, setEndDateTo] = React.useState(initial.endDateTo ?? '');
  const [minRent, setMinRent] = React.useState(initial.minRent ?? '');
  const [maxRent, setMaxRent] = React.useState(initial.maxRent ?? '');
  const [keyword, setKeyword] = React.useState(initial.keyword ?? '');

  // ── Helpers ────────────────────────────────────────────────────────────────
  const isDateValid = (val: string) => {
    if (!val) return true;
    return /^\d{2}\/\d{4}$/.test(val) || /^\d{2}\/\d{2}\/\d{4}$/.test(val);
  };

  const countActiveFilters = () => {
    let n = 0;
    if (status && status !== 'all') n++;
    if (startDateFrom || startDateTo) n++;
    if (endDateFrom || endDateTo) n++;
    if (minRent || maxRent) n++;
    if (keyword) n++;
    return n;
  };

  const handleReset = () => {
    setStatus('all');
    setStartDateFrom('');
    setStartDateTo('');
    setEndDateFrom('');
    setEndDateTo('');
    setMinRent('');
    setMaxRent('');
    setKeyword('');
  };

  const handleApply = () => {
    const dates = [startDateFrom, startDateTo, endDateFrom, endDateTo];
    for (const d of dates) {
      if (!isDateValid(d)) {
        Alert.alert('Định dạng ngày không đúng', 'Vui lòng nhập ngày theo định dạng MM/YYYY.');
        return;
      }
    }
    const filter: ContractFilterParams = {
      status,
      startDateFrom: startDateFrom || undefined,
      startDateTo: startDateTo || undefined,
      endDateFrom: endDateFrom || undefined,
      endDateTo: endDateTo || undefined,
      minRent: minRent || undefined,
      maxRent: maxRent || undefined,
      keyword: keyword || undefined,
    };
    navigation.navigate('hop-dong', { filter });
  };

  const activeCount = countActiveFilters();

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Bộ lọc Hợp đồng</Text>
        <Pressable onPress={handleReset} style={styles.resetBtn}>
          <Text style={styles.resetBtnText}>Đặt lại</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Keyword Search ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TÌM KIẾM NHANH</Text>
          <View style={styles.inputRow}>
            <MaterialIcons name="search" size={20} color="#94a3b8" />
            <TextInput
              style={styles.textInput}
              placeholder="Tên khách thuê, số phòng, toà nhà..."
              placeholderTextColor="#94a3b8"
              value={keyword}
              onChangeText={setKeyword}
            />
            {keyword.length > 0 && (
              <Pressable onPress={() => setKeyword('')}>
                <MaterialIcons name="close" size={18} color="#94a3b8" />
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* ── Status ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TRẠNG THÁI HỢP ĐỒNG</Text>
          <View style={styles.statusGrid}>
            {STATUS_OPTIONS.map((opt) => {
              const isActive = status === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  style={[styles.statusCard, isActive && styles.statusCardActive]}
                  onPress={() => setStatus(opt.key)}
                >
                  <MaterialIcons
                    name={opt.icon}
                    size={22}
                    color={isActive ? theme.colors.primary : opt.color}
                  />
                  <Text style={[styles.statusCardText, isActive && styles.statusCardTextActive]}>
                    {opt.label}
                  </Text>
                  {isActive && (
                    <View style={styles.checkDot}>
                      <MaterialIcons name="check" size={12} color={theme.colors.onPrimary} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.divider} />

        {/* ── Date Range: Ngày bắt đầu ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <MaterialIcons name="calendar-today" size={15} color={theme.colors.primary} />
            <Text style={styles.sectionLabel}>NGÀY BẮT ĐẦU HỢP ĐỒNG</Text>
          </View>
          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <Text style={styles.dateFieldLabel}>Từ ngày</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="MM/YYYY"
                placeholderTextColor="#94a3b8"
                value={startDateFrom}
                onChangeText={setStartDateFrom}
                keyboardType="numeric"
                maxLength={7}
              />
            </View>
            <View style={styles.dateSeparator}>
              <MaterialIcons name="arrow-forward" size={18} color={theme.colors.outlineVariant} />
            </View>
            <View style={styles.dateField}>
              <Text style={styles.dateFieldLabel}>Đến ngày</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="MM/YYYY"
                placeholderTextColor="#94a3b8"
                value={startDateTo}
                onChangeText={setStartDateTo}
                keyboardType="numeric"
                maxLength={7}
              />
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* ── Date Range: Ngày kết thúc ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <MaterialIcons name="event" size={15} color={theme.colors.secondary} />
            <Text style={styles.sectionLabel}>NGÀY KẾT THÚC HỢP ĐỒNG</Text>
          </View>
          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <Text style={styles.dateFieldLabel}>Từ ngày</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="MM/YYYY"
                placeholderTextColor="#94a3b8"
                value={endDateFrom}
                onChangeText={setEndDateFrom}
                keyboardType="numeric"
                maxLength={7}
              />
            </View>
            <View style={styles.dateSeparator}>
              <MaterialIcons name="arrow-forward" size={18} color={theme.colors.outlineVariant} />
            </View>
            <View style={styles.dateField}>
              <Text style={styles.dateFieldLabel}>Đến ngày</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="MM/YYYY"
                placeholderTextColor="#94a3b8"
                value={endDateTo}
                onChangeText={setEndDateTo}
                keyboardType="numeric"
                maxLength={7}
              />
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* ── Rent Range ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <MaterialIcons name="payments" size={15} color="#137333" />
            <Text style={styles.sectionLabel}>TIỀN PHÒNG (VNĐ/THÁNG)</Text>
          </View>
          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <Text style={styles.dateFieldLabel}>Tối thiểu</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="0"
                placeholderTextColor="#94a3b8"
                value={minRent}
                onChangeText={setMinRent}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.dateSeparator}>
              <Text style={{ color: theme.colors.outlineVariant, fontSize: 18 }}>—</Text>
            </View>
            <View style={styles.dateField}>
              <Text style={styles.dateFieldLabel}>Tối đa</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="Không giới hạn"
                placeholderTextColor="#94a3b8"
                value={maxRent}
                onChangeText={setMaxRent}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Bottom Action Bar ── */}
      <View style={styles.bottomBar}>
        {activeCount > 0 && (
          <View style={styles.activeCountRow}>
            <MaterialIcons name="filter-list" size={16} color={theme.colors.primary} />
            <Text style={styles.activeCountText}>
              Đang áp dụng {activeCount} bộ lọc
            </Text>
          </View>
        )}
        <Pressable style={styles.applyBtn} onPress={handleApply}>
          <MaterialIcons name="done" size={20} color={theme.colors.onPrimary} />
          <Text style={styles.applyBtnText}>Áp dụng bộ lọc</Text>
        </Pressable>
      </View>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
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
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  backBtn: {
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
  resetBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  resetBtnText: {
    ...theme.typography.bodyMd,
    color: theme.colors.secondary,
    fontWeight: '600',
  },
  scroll: {
    paddingBottom: 40,
  },
  section: {
    paddingHorizontal: theme.spacing.marginMobile,
    paddingVertical: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.onSurfaceVariant,
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  divider: {
    height: 8,
    backgroundColor: theme.colors.surfaceContainerLow,
  },
  // Keyword
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.onSurface,
    padding: 0,
  },
  // Status grid
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusCard: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1.5,
    borderColor: theme.colors.outlineVariant,
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  statusCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: '#eff4ff',
  },
  statusCardText: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurfaceVariant,
    flex: 1,
  },
  statusCardTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  checkDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Date range
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateField: {
    flex: 1,
    gap: 6,
  },
  dateFieldLabel: {
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  dateInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: theme.colors.onSurface,
  },
  dateSeparator: {
    paddingTop: 20,
    alignItems: 'center',
  },
  // Bottom
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
    paddingHorizontal: theme.spacing.marginMobile,
    paddingVertical: 16,
    gap: 10,
  },
  activeCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeCountText: {
    ...theme.typography.bodyMd,
    color: theme.colors.primary,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 14,
    gap: 8,
  },
  applyBtnText: {
    ...theme.typography.bodyLg,
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
  },
});

export default ContractFilter;
