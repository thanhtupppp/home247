import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

export const CreateBuilding: React.FC = () => {
  const navigation = useNavigation();

  const [buildingName, setBuildingName] = React.useState('');
  const [selectedType, setSelectedType] = React.useState('');
  const [showTypeDropdown, setShowTypeDropdown] = React.useState(false);

  const [selectedProvince, setSelectedProvince] = React.useState('');
  const [showProvinceDropdown, setShowProvinceDropdown] = React.useState(false);

  const [selectedWard, setSelectedWard] = React.useState('');
  const [showWardDropdown, setShowWardDropdown] = React.useState(false);

  const [detailAddress, setDetailAddress] = React.useState('');

  const types = ['Chung cư mini', 'Nhà nguyên căn', 'Dãy phòng trọ'];
  const provinces = ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng'];
  const wards = ['Phường 1', 'Phường 2', 'Phường 3'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Thêm nhà</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          {/* Section 1: Thông tin cơ bản */}
          <View style={styles.sectionHeader}>
            <MaterialIcons name="fact-check" size={22} color={theme.colors.onSurface} />
            <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
          </View>

          <Text style={styles.label}>Tên nhà</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Vd: Cơ sở 1"
            value={buildingName}
            onChangeText={setBuildingName}
          />

          <Text style={[styles.label, { marginTop: 16 }]}>Loại nhà</Text>
          <Pressable onPress={() => setShowTypeDropdown(!showTypeDropdown)} style={styles.dropdownButton}>
            <Text style={styles.dropdownButtonText}>{selectedType || 'Chọn loại nhà'}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={24} color="#a1a1aa" />
          </Pressable>
          {showTypeDropdown && (
            <View style={styles.dropdown}>
              {types.map((t) => (
                <Pressable key={t} style={styles.dropdownItem} onPress={() => { setSelectedType(t); setShowTypeDropdown(false); }}>
                  <Text style={styles.dropdownItemText}>{t}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Section 2: Địa chỉ */}
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <MaterialIcons name="place" size={22} color={theme.colors.onSurface} />
            <Text style={styles.sectionTitle}>Địa chỉ</Text>
          </View>

          <Text style={styles.label}>Tỉnh thành phố</Text>
          <Pressable onPress={() => setShowProvinceDropdown(!showProvinceDropdown)} style={styles.dropdownButton}>
            <Text style={styles.dropdownButtonText}>{selectedProvince || 'Chọn tỉnh/thành'}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={24} color="#a1a1aa" />
          </Pressable>
          {showProvinceDropdown && (
            <View style={styles.dropdown}>
              {provinces.map((p) => (
                <Pressable key={p} style={styles.dropdownItem} onPress={() => { setSelectedProvince(p); setShowProvinceDropdown(false); }}>
                  <Text style={styles.dropdownItemText}>{p}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <Text style={[styles.label, { marginTop: 16 }]}>Phường/Xã</Text>
          {!selectedProvince ? (
            <View style={styles.banner}>
              <Text style={styles.bannerText}>Vui lòng chọn tỉnh/thành trước</Text>
            </View>
          ) : (
            <View>
              <Pressable onPress={() => setShowWardDropdown(!showWardDropdown)} style={styles.dropdownButton}>
                <Text style={styles.dropdownButtonText}>{selectedWard || 'Chọn phường/xã'}</Text>
                <MaterialIcons name="keyboard-arrow-down" size={24} color="#a1a1aa" />
              </Pressable>
              {showWardDropdown && (
                <View style={styles.dropdown}>
                  {wards.map((w) => (
                    <Pressable key={w} style={styles.dropdownItem} onPress={() => { setSelectedWard(w); setShowWardDropdown(false); }}>
                      <Text style={styles.dropdownItemText}>{w}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          )}

          <Text style={[styles.label, { marginTop: 16 }]}>Địa chỉ chi tiết</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Số nhà, tên đường..."
            value={detailAddress}
            onChangeText={setDetailAddress}
          />
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtnText}>Đóng</Text>
        </Pressable>
        <Pressable style={styles.saveBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.saveBtnText}>Thêm nhà</Text>
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
  },
  sectionTitle: {
    ...theme.typography.titleLg,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 14,
  },
  saveBtnText: {
    ...theme.typography.bodyLg,
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
  },
});

export default CreateBuilding;
