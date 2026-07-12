import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { getProvinceNames, getWardNamesByProvinceName } from '../data/vietnameseAddress';

const TYPES = ['Chung cư mini', 'Nhà nguyên căn', 'Dãy phòng trọ'];
// Loaded once at module level for performance
const ALL_PROVINCES = getProvinceNames();

export const CreateBuilding: React.FC = () => {
  const navigation = useNavigation<any>();

  const [buildingName, setBuildingName] = React.useState('');
  const [selectedType, setSelectedType] = React.useState('');
  const [showTypeDropdown, setShowTypeDropdown] = React.useState(false);

  const [selectedProvince, setSelectedProvince] = React.useState('');
  const [showProvinceDropdown, setShowProvinceDropdown] = React.useState(false);
  const [provinceSearch, setProvinceSearch] = React.useState('');

  const [selectedWard, setSelectedWard] = React.useState('');
  const [showWardDropdown, setShowWardDropdown] = React.useState(false);
  const [wardSearch, setWardSearch] = React.useState('');

  const [detailAddress, setDetailAddress] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  // Computed lists from real database
  const filteredProvinces = React.useMemo(() => {
    if (!provinceSearch.trim()) return ALL_PROVINCES;
    const q = provinceSearch.toLowerCase();
    return ALL_PROVINCES.filter((p) => p.toLowerCase().includes(q));
  }, [provinceSearch]);

  const allWards = React.useMemo(
    () => (selectedProvince ? getWardNamesByProvinceName(selectedProvince) : []),
    [selectedProvince]
  );

  const filteredWards = React.useMemo(() => {
    if (!wardSearch.trim()) return allWards;
    const q = wardSearch.toLowerCase();
    return allWards.filter((w) => w.toLowerCase().includes(q));
  }, [allWards, wardSearch]);

  const handleSelectProvince = (p: string) => {
    setSelectedProvince(p);
    setSelectedWard(''); // reset ward when province changes
    setShowProvinceDropdown(false);
    setProvinceSearch('');
  };

  const handleSelectWard = (w: string) => {
    setSelectedWard(w);
    setShowWardDropdown(false);
    setWardSearch('');
  };

  const handleSave = async () => {
    if (!buildingName.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên nhà.');
      return;
    }
    if (!selectedType) {
      Alert.alert('Thông báo', 'Vui lòng chọn loại nhà.');
      return;
    }
    if (!selectedProvince) {
      Alert.alert('Thông báo', 'Vui lòng chọn tỉnh/thành phố.');
      return;
    }
    if (!selectedWard) {
      Alert.alert('Thông báo', 'Vui lòng chọn phường/xã.');
      return;
    }

    try {
      setSaving(true);
      await addDoc(collection(db, 'buildings'), {
        name: buildingName.trim(),
        type: selectedType,
        province: selectedProvince,
        ward: selectedWard,
        detailAddress: detailAddress.trim(),
        createdAt: new Date(),
        createdBy: auth.currentUser?.uid || 'system',
        ownerId: auth.currentUser?.uid || 'system',
      });
      Alert.alert('Thành công', 'Đã thêm nhà thành công!');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving building:', error);
      Alert.alert('Lỗi', 'Không thể thêm nhà.');
    } finally {
      setSaving(false);
    }
  };

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

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
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
              {TYPES.map((t) => (
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

          {/* Province dropdown with search */}
          <Text style={styles.label}>Tỉnh/Thành phố</Text>
          <Pressable onPress={() => { setShowProvinceDropdown(!showProvinceDropdown); setProvinceSearch(''); }} style={styles.dropdownButton}>
            <Text style={styles.dropdownButtonText}>{selectedProvince || 'Chọn tỉnh/thành'}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={24} color="#a1a1aa" />
          </Pressable>
          {showProvinceDropdown && (
            <View style={styles.dropdown}>
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm tỉnh/thành..."
                value={provinceSearch}
                onChangeText={setProvinceSearch}
                autoFocus
              />
              <ScrollView style={styles.dropdownScrollable} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
                {filteredProvinces.length === 0 ? (
                  <Text style={styles.emptyDropdown}>Không tìm thấy kết quả</Text>
                ) : (
                  filteredProvinces.map((p) => (
                    <Pressable key={p} style={styles.dropdownItem} onPress={() => handleSelectProvince(p)}>
                      <Text style={styles.dropdownItemText}>{p}</Text>
                    </Pressable>
                  ))
                )}
              </ScrollView>
            </View>
          )}

          {/* Ward dropdown with search — only active after province selected */}
          <Text style={[styles.label, { marginTop: 16 }]}>Phường/Xã</Text>
          {!selectedProvince ? (
            <View style={styles.banner}>
              <Text style={styles.bannerText}>Vui lòng chọn tỉnh/thành trước</Text>
            </View>
          ) : (
            <View>
              <Pressable onPress={() => { setShowWardDropdown(!showWardDropdown); setWardSearch(''); }} style={styles.dropdownButton}>
                <Text style={styles.dropdownButtonText}>{selectedWard || 'Chọn phường/xã'}</Text>
                <MaterialIcons name="keyboard-arrow-down" size={24} color="#a1a1aa" />
              </Pressable>
              {showWardDropdown && (
                <View style={styles.dropdown}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm phường/xã..."
                    value={wardSearch}
                    onChangeText={setWardSearch}
                    autoFocus
                  />
                  <ScrollView style={styles.dropdownScrollable} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
                    {filteredWards.length === 0 ? (
                      <Text style={styles.emptyDropdown}>Không tìm thấy kết quả</Text>
                    ) : (
                      filteredWards.map((w) => (
                        <Pressable key={w} style={styles.dropdownItem} onPress={() => handleSelectWard(w)}>
                          <Text style={styles.dropdownItemText}>{w}</Text>
                        </Pressable>
                      ))
                    )}
                  </ScrollView>
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
        <Pressable style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.saveBtnText}>Thêm nhà</Text>
          )}
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
  dropdownScrollable: {
    maxHeight: 220,
  },
  searchInput: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
    fontSize: 14,
    color: theme.colors.onSurface,
    backgroundColor: '#f8fafc',
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
  emptyDropdown: {
    padding: 16,
    color: '#94a3b8',
    textAlign: 'center',
    fontSize: 13,
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
