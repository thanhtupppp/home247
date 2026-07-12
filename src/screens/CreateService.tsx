import React from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  TextInput, ActivityIndicator, Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { collection, addDoc, getDocs, query, orderBy, doc, getDoc, updateDoc, where } from 'firebase/firestore';
import { db, auth } from '../firebase';

const CALC_METHODS = ['Cố định', 'Theo người', 'Theo chỉ số đồng hồ'];

interface Building {
  id: string;
  name: string;
}

export const CreateService: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { serviceId } = route.params || {};

  const [serviceName, setServiceName] = React.useState('');
  
  const [buildings, setBuildings] = React.useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = React.useState<Building | null>(null);
  const [showBuildingDropdown, setShowBuildingDropdown] = React.useState(false);
  const [loadingBuildings, setLoadingBuildings] = React.useState(false);

  const [calcMethod, setCalcMethod] = React.useState('Cố định');
  const [showCalcDropdown, setShowCalcDropdown] = React.useState(false);

  const [unit, setUnit] = React.useState('');
  const [unitPrice, setUnitPrice] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [loadingService, setLoadingService] = React.useState(false);
  
  const [initialBuildingId, setInitialBuildingId] = React.useState<string | null>(null);

  const fetchBuildings = React.useCallback(async () => {
    try {
      setLoadingBuildings(true);
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const qSnap = await getDocs(query(collection(db, 'buildings'), where('ownerId', '==', uid)));
      const list = qSnap.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || '',
      }));
      list.sort((a, b) => a.name.localeCompare(b.name));
      const fullList = [{ id: 'all', name: 'Tất cả tòa nhà (Dịch vụ chung)' }, ...list];
      setBuildings(fullList);
      if (!serviceId) {
        setSelectedBuilding(fullList[0]);
      }
    } catch (err) {
      console.error('Error fetching buildings for service:', err);
    } finally {
      setLoadingBuildings(false);
    }
  }, [serviceId]);

  const fetchServiceDetail = React.useCallback(async () => {
    try {
      setLoadingService(true);
      const docSnap = await getDoc(doc(db, 'services', serviceId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setServiceName(data.name || '');
        setCalcMethod(data.calcMethod || 'Cố định');
        setUnit(data.unit || '');
        setUnitPrice(String(data.unitPrice || ''));
        setInitialBuildingId(data.buildingId || 'all');
      }
    } catch (err) {
      console.error('Error fetching service details:', err);
      Alert.alert('Lỗi', 'Không thể tải chi tiết dịch vụ.');
    } finally {
      setLoadingService(false);
    }
  }, [serviceId]);

  React.useEffect(() => {
    fetchBuildings();
  }, [fetchBuildings]);

  React.useEffect(() => {
    if (serviceId) {
      fetchServiceDetail();
    }
  }, [serviceId, fetchServiceDetail]);

  React.useEffect(() => {
    if (buildings.length > 0 && initialBuildingId) {
      const matched = buildings.find(b => b.id === initialBuildingId);
      if (matched) {
        setSelectedBuilding(matched);
      }
    }
  }, [buildings, initialBuildingId]);

  const handleSave = async () => {
    if (!serviceName.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên dịch vụ.');
      return;
    }
    if (!selectedBuilding) {
      Alert.alert('Thông báo', 'Vui lòng chọn tòa nhà áp dụng.');
      return;
    }
    if (!calcMethod) {
      Alert.alert('Thông báo', 'Vui lòng chọn phương thức tính toán.');
      return;
    }
    if (!unitPrice.trim() || isNaN(Number(unitPrice))) {
      Alert.alert('Thông báo', 'Đơn giá phải là số hợp lệ.');
      return;
    }

    try {
      setSaving(true);
      const uid = auth.currentUser?.uid || 'system';
      const serviceData = {
        name: serviceName.trim(),
        buildingId: selectedBuilding.id,
        buildingName: selectedBuilding.id === 'all' ? 'Khác' : selectedBuilding.name,
        calcMethod,
        unit: unit.trim() || (calcMethod === 'Theo người' ? 'người' : calcMethod === 'Theo chỉ số đồng hồ' ? 'chỉ số' : 'tháng'),
        unitPrice: Number(unitPrice),
        ownerId: uid,
      };

      if (serviceId) {
        // Edit mode
        await updateDoc(doc(db, 'services', serviceId), serviceData);
        Alert.alert('Thành công', `Đã cập nhật cấu hình dịch vụ ${serviceName.trim()}!`);
      } else {
        // Create mode
        const newDoc = {
          ...serviceData,
          createdAt: new Date(),
          createdBy: uid,
        };
        await addDoc(collection(db, 'services'), newDoc);
        Alert.alert('Thành công', `Đã thêm cấu hình dịch vụ ${serviceName.trim()} thành công!`);
      }
      navigation.goBack();
    } catch (err) {
      console.error('Error saving service:', err);
      Alert.alert('Lỗi', 'Không thể lưu dịch vụ.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingService) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Đang tải cấu hình dịch vụ...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>{serviceId ? 'Chỉnh sửa dịch vụ' : 'Tạo dịch vụ mới'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Tên dịch vụ */}
          <Text style={styles.label}>Tên dịch vụ</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Vd: Điện, Nước, Internet, Vệ sinh"
            value={serviceName}
            onChangeText={setServiceName}
          />

          {/* Tòa nhà Dropdown */}
          <Text style={[styles.label, { marginTop: 16 }]}>Tòa nhà áp dụng</Text>
          {loadingBuildings ? (
            <ActivityIndicator size="small" color={theme.colors.primary} style={{ alignSelf: 'flex-start', marginVertical: 12 }} />
          ) : (
            <View style={{ zIndex: 30 }}>
              <Pressable onPress={() => setShowBuildingDropdown(!showBuildingDropdown)} style={styles.dropdownButton}>
                <Text style={styles.dropdownButtonText}>{selectedBuilding?.name || 'Chọn tòa nhà'}</Text>
                <MaterialIcons name="keyboard-arrow-down" size={24} color="#a1a1aa" />
              </Pressable>
              {showBuildingDropdown && (
                <View style={styles.dropdown}>
                  {buildings.map((b) => (
                    <Pressable key={b.id} style={styles.dropdownItem} onPress={() => { setSelectedBuilding(b); setShowBuildingDropdown(false); }}>
                      <Text style={styles.dropdownItemText}>{b.name}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Phương thức tính Dropdown */}
          <Text style={[styles.label, { marginTop: 16 }]}>Phương thức tính</Text>
          <View style={{ zIndex: 20 }}>
            <Pressable onPress={() => setShowCalcDropdown(!showCalcDropdown)} style={styles.dropdownButton}>
              <Text style={styles.dropdownButtonText}>{calcMethod || 'Chọn phương thức tính'}</Text>
              <MaterialIcons name="keyboard-arrow-down" size={24} color="#a1a1aa" />
            </Pressable>
            {showCalcDropdown && (
              <View style={styles.dropdown}>
                {CALC_METHODS.map((m) => (
                  <Pressable key={m} style={styles.dropdownItem} onPress={() => { setCalcMethod(m); setShowCalcDropdown(false); }}>
                    <Text style={styles.dropdownItemText}>{m}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Đơn vị */}
          <Text style={[styles.label, { marginTop: 16 }]}>Đơn vị đo lường (Tùy chọn)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Vd: kWh (cho điện), m³ (cho nước), phòng (cho cố định)"
            value={unit}
            onChangeText={setUnit}
          />

          {/* Giá đơn vị */}
          <Text style={[styles.label, { marginTop: 16 }]}>Đơn giá (VND) *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Vd: 3500 hoặc 150000"
            keyboardType="numeric"
            value={unitPrice}
            onChangeText={setUnitPrice}
          />
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.closeBtn} onPress={() => navigation.goBack()} disabled={saving}>
          <Text style={styles.closeBtnText}>Hủy</Text>
        </Pressable>
        <Pressable style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <MaterialIcons name="check" size={20} color="#fff" />
              <Text style={styles.saveBtnText}>{serviceId ? 'Lưu thay đổi' : 'Tạo dịch vụ'}</Text>
            </>
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
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
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
    paddingBottom: 100,
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
    marginBottom: 4,
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
    marginBottom: 12,
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 14,
    gap: 8,
  },
  saveBtnText: {
    ...theme.typography.bodyLg,
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: theme.colors.onSurfaceVariant,
  },
});

export default CreateService;
