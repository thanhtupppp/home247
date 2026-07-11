import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

export const CreateService: React.FC = () => {
  const navigation = useNavigation();

  const [serviceName, setServiceName] = React.useState('');
  const [selectedBuilding, setSelectedBuilding] = React.useState('');
  const [showBuildingDropdown, setShowBuildingDropdown] = React.useState(false);

  const [calcMethod, setCalcMethod] = React.useState('');
  const [showCalcDropdown, setShowCalcDropdown] = React.useState(false);

  const [unit, setUnit] = React.useState('');
  const [unitPrice, setUnitPrice] = React.useState('');

  const buildings = ['nơ trang long', 'Home247 Landmark', 'Home247 Riverside'];
  const calcMethods = ['Cố định', 'Theo người', 'Theo chỉ số đồng hồ'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Tạo dịch vụ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          {/* Tên dịch vụ */}
          <Text style={styles.label}>Tên dịch vụ</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Vd: Điện, Nước, Internet"
            value={serviceName}
            onChangeText={setServiceName}
          />

          {/* Tòa nhà Dropdown */}
          <Text style={[styles.label, { marginTop: 16 }]}>Tòa nhà</Text>
          <Pressable onPress={() => setShowBuildingDropdown(!showBuildingDropdown)} style={styles.dropdownButton}>
            <Text style={styles.dropdownButtonText}>{selectedBuilding || 'Chọn tòa nhà'}</Text>
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

          {/* Phương thức tính Dropdown */}
          <Text style={[styles.label, { marginTop: 16 }]}>Phương thức tính</Text>
          <Pressable onPress={() => setShowCalcDropdown(!showCalcDropdown)} style={styles.dropdownButton}>
            <Text style={styles.dropdownButtonText}>{calcMethod || 'Chọn phương thức tính'}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={24} color="#a1a1aa" />
          </Pressable>
          {showCalcDropdown && (
            <View style={styles.dropdown}>
              {calcMethods.map((m) => (
                <Pressable key={m} style={styles.dropdownItem} onPress={() => { setCalcMethod(m); setShowCalcDropdown(false); }}>
                  <Text style={styles.dropdownItemText}>{m}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Đơn vị */}
          <Text style={[styles.label, { marginTop: 16 }]}>Đơn vị (tùy chọn)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Vd: kWh, m³, tháng"
            value={unit}
            onChangeText={setUnit}
          />

          {/* Giá đơn vị */}
          <Text style={[styles.label, { marginTop: 16 }]}>Giá đơn vị</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Vd: 3500"
            keyboardType="numeric"
            value={unitPrice}
            onChangeText={setUnitPrice}
          />
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtnText}>Đóng</Text>
        </Pressable>
        <Pressable style={styles.saveBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="add" size={20} color={theme.colors.onPrimary} />
          <Text style={styles.saveBtnText}>Tạo dịch vụ</Text>
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
  bottomBar: {
    flexDirection: 'row',
    padding: theme.spacing.marginMobile,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
    gap: 12,
  },
  closeBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 14,
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  closeBtnText: {
    ...theme.typography.bodyLg,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  saveBtn: {
    flex: 1,
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

export default CreateService;
