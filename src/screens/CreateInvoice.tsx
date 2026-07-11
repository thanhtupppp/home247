import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Switch } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

export const CreateInvoice: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const initialBuilding = route.params?.building || 'nơ trang long';

  const [selectedBuilding, setSelectedBuilding] = React.useState(initialBuilding);
  const [selectedRoom, setSelectedRoom] = React.useState('p1');
  const [showBuildingDropdown, setShowBuildingDropdown] = React.useState(false);
  const [showRoomDropdown, setShowRoomDropdown] = React.useState(false);

  // Form toggles and states
  const [includeRent, setIncludeRent] = React.useState(true);
  const [rentAmount, setRentAmount] = React.useState('');
  const [includeService, setIncludeService] = React.useState(true);
  const [includeMeter, setIncludeMeter] = React.useState(true);
  const [showMonthDropdown, setShowMonthDropdown] = React.useState(false);
  const [selectedMonth, setSelectedMonth] = React.useState('Tháng 7 2026');

  const buildings = ['nơ trang long', 'Home247 Landmark', 'Home247 Riverside'];
  const rooms = ['p1', 'p2', 'p3', 'p4', 'p5'];
  const months = ['Tháng 6 2026', 'Tháng 7 2026', 'Tháng 8 2026'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Tạo hoá đơn</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          {/* Tòa nhà selector */}
          <Text style={styles.label}>Tòa nhà *</Text>
          <Pressable onPress={() => setShowBuildingDropdown(!showBuildingDropdown)} style={styles.dropdownButton}>
            <Text style={styles.dropdownButtonText}>{selectedBuilding}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={24} color="#a1a1aa" />
          </Pressable>
          {showBuildingDropdown && (
            <View style={styles.dropdown}>
              {buildings.map((b) => (
                <Pressable key={b} style={styles.dropdownItem} onPress={() => { setSelectedBuilding(b); setShowBuildingDropdown(false); }}>
                  <Text style={styles.dropdownItemText}>{b}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Phòng selector */}
          <Text style={[styles.label, { marginTop: 16 }]}>Phòng *</Text>
          <Pressable onPress={() => setShowRoomDropdown(!showRoomDropdown)} style={styles.dropdownButton}>
            <Text style={styles.dropdownButtonText}>{selectedRoom}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={24} color="#a1a1aa" />
          </Pressable>
          {showRoomDropdown && (
            <View style={styles.dropdown}>
              {rooms.map((r) => (
                <Pressable key={r} style={styles.dropdownItem} onPress={() => { setSelectedRoom(r); setShowRoomDropdown(false); }}>
                  <Text style={styles.dropdownItemText}>{r}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <View style={styles.divider} />

          {/* Hợp đồng banner */}
          <Text style={styles.sectionHeaderLabel}>Hợp đồng</Text>
          <View style={styles.banner}>
            <Text style={styles.bannerText}>Phòng này chưa có hợp đồng</Text>
          </View>

          <View style={styles.divider} />

          {/* Tiền phòng Section */}
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionHeaderLabel}>Tiền phòng</Text>
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Bao gồm tiền phòng</Text>
            <Switch
              value={includeRent}
              onValueChange={setIncludeRent}
              trackColor={{ false: '#e2e8f0', true: '#60a5fa' }}
              thumbColor={includeRent ? theme.colors.primary : '#94a3b8'}
            />
          </View>

          {includeRent && (
            <View style={styles.rentInputs}>
              <TextInput
                style={styles.textInput}
                placeholder="Vd: 5.500.000"
                keyboardType="numeric"
                value={rentAmount}
                onChangeText={setRentAmount}
              />
              
              <Text style={[styles.inputLabel, { marginTop: 14 }]}>Thu tiền phòng từ ngày:</Text>
              <View style={styles.dateSelector}>
                <MaterialIcons name="calendar-today" size={18} color="#64748b" />
                <Text style={styles.dateSelectorText}>01/07/2026</Text>
              </View>

              <Text style={[styles.inputLabel, { marginTop: 14 }]}>Đến ngày:</Text>
              <View style={styles.dateSelector}>
                <MaterialIcons name="calendar-today" size={18} color="#64748b" />
                <Text style={styles.dateSelectorText}>31/07/2026</Text>
              </View>
            </View>
          )}

          <View style={styles.divider} />

          {/* Dịch vụ Section */}
          <Text style={styles.sectionHeaderLabel}>Dịch vụ</Text>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Bao gồm dịch vụ</Text>
            <Switch
              value={includeService}
              onValueChange={setIncludeService}
              trackColor={{ false: '#e2e8f0', true: '#60a5fa' }}
              thumbColor={includeService ? theme.colors.primary : '#94a3b8'}
            />
          </View>
          {includeService && (
            <View style={styles.banner}>
              <Text style={styles.bannerText}>Vui lòng chọn hợp đồng để xem dịch vụ</Text>
            </View>
          )}

          <View style={styles.divider} />

          {/* Đồng hồ Section */}
          <Text style={styles.sectionHeaderLabel}>Đồng hồ</Text>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Bao gồm chỉ số đồng hồ</Text>
            <Switch
              value={includeMeter}
              onValueChange={setIncludeMeter}
              trackColor={{ false: '#e2e8f0', true: '#60a5fa' }}
              thumbColor={includeMeter ? theme.colors.primary : '#94a3b8'}
            />
          </View>
          {includeMeter && (
            <View style={styles.meterInputs}>
              <Text style={styles.inputLabel}>Tháng chốt *</Text>
              <Pressable onPress={() => setShowMonthDropdown(!showMonthDropdown)} style={styles.dropdownButton}>
                <Text style={styles.dropdownButtonText}>{selectedMonth}</Text>
                <MaterialIcons name="keyboard-arrow-down" size={24} color="#a1a1aa" />
              </Pressable>
              {showMonthDropdown && (
                <View style={styles.dropdown}>
                  {months.map((m) => (
                    <Pressable key={m} style={styles.dropdownItem} onPress={() => { setSelectedMonth(m); setShowMonthDropdown(false); }}>
                      <Text style={styles.dropdownItemText}>{m}</Text>
                    </Pressable>
                  ))}
                </View>
              )}

              <View style={[styles.banner, { marginTop: 12 }]}>
                <Text style={styles.bannerText}>Không có chỉ số đồng hồ cho tháng này</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Save Button */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.saveBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="add" size={24} color={theme.colors.onPrimary} />
          <Text style={styles.saveBtnText}>Tạo hoá đơn</Text>
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
  scrollContent: {
    paddingBottom: 40,
  },
  form: {
    padding: theme.spacing.marginMobile,
  },
  label: {
    ...theme.typography.labelMd,
    color: theme.colors.onSurfaceVariant,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownButtonText: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurface,
  },
  dropdown: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.xl,
    marginTop: 4,
    overflow: 'hidden',
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
  divider: {
    height: 1,
    backgroundColor: theme.colors.outlineVariant,
    marginVertical: 20,
  },
  sectionHeaderLabel: {
    ...theme.typography.titleLg,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  banner: {
    backgroundColor: '#f1f5f9',
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bannerText: {
    ...theme.typography.bodyMd,
    color: '#64748b',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleLabel: {
    ...theme.typography.bodyLg,
    color: theme.colors.onSurface,
    fontWeight: '500',
  },
  rentInputs: {
    marginTop: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: theme.colors.onSurface,
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  inputLabel: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 6,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  dateSelectorText: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurface,
  },
  meterInputs: {
    marginTop: 8,
  },
  bottomBar: {
    padding: theme.spacing.marginMobile,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 14,
    gap: 8,
  },
  saveBtnText: {
    ...theme.typography.bodyLg,
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
  },
});

export default CreateInvoice;
