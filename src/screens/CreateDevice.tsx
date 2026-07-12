import React from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  TextInput, ActivityIndicator, Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { collection, addDoc, getDocs, query, orderBy, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

const CATEGORIES = ['Gia dụng', 'Phòng tắm', 'Nội thất'];

interface Building {
  id: string;
  name: string;
}

export const CreateDevice: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { deviceId } = route.params || {};

  const [deviceName, setDeviceName] = React.useState('');
  const [description, setDescription] = React.useState('');

  const [buildings, setBuildings] = React.useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = React.useState<Building | null>(null);
  const [showBuildingDropdown, setShowBuildingDropdown] = React.useState(false);
  const [loadingBuildings, setLoadingBuildings] = React.useState(false);

  const [selectedCategory, setSelectedCategory] = React.useState('Gia dụng');
  const [showCategoryDropdown, setShowCategoryDropdown] = React.useState(false);

  const [saving, setSaving] = React.useState(false);
  const [loadingDevice, setLoadingDevice] = React.useState(false);
  const [initialBuildingId, setInitialBuildingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchBuildings();
  }, []);

  React.useEffect(() => {
    if (deviceId) {
      fetchDeviceDetail();
    }
  }, [deviceId]);

  React.useEffect(() => {
    if (buildings.length > 0 && initialBuildingId) {
      const matched = buildings.find(b => b.id === initialBuildingId);
      if (matched) {
        setSelectedBuilding(matched);
      }
    }
  }, [buildings, initialBuildingId]);

  const fetchBuildings = async () => {
    try {
      setLoadingBuildings(true);
      const qSnap = await getDocs(query(collection(db, 'buildings'), orderBy('name')));
      const list = qSnap.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || '',
      }));
      const fullList = [{ id: 'unassigned', name: 'Chưa gán tòa nhà' }, ...list];
      setBuildings(fullList);
      if (!deviceId) {
        setSelectedBuilding(fullList[0]);
      }
    } catch (err) {
      console.error('Error fetching buildings for devices:', err);
    } finally {
      setLoadingBuildings(false);
    }
  };

  const fetchDeviceDetail = async () => {
    try {
      setLoadingDevice(true);
      const docSnap = await getDoc(doc(db, 'devices', deviceId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDeviceName(data.name || '');
        setSelectedCategory(data.category || 'Gia dụng');
        setDescription(data.description || '');
        setInitialBuildingId(data.buildingId || 'unassigned');
      }
    } catch (err) {
      console.error('Error fetching device details:', err);
      Alert.alert('Lỗi', 'Không thể tải chi tiết thiết bị.');
    } finally {
      setLoadingDevice(false);
    }
  };

  const handleSave = async () => {
    if (!deviceName.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên thiết bị.');
      return;
    }
    if (!selectedBuilding) {
      Alert.alert('Thông báo', 'Vui lòng chọn tòa nhà.');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Thông báo', 'Vui lòng chọn danh mục.');
      return;
    }

    try {
      setSaving(true);
      const deviceData = {
        name: deviceName.trim(),
        buildingId: selectedBuilding.id,
        buildingName: selectedBuilding.id === 'unassigned' ? 'Chưa gán tòa nhà' : selectedBuilding.name,
        category: selectedCategory,
        description: description.trim(),
      };

      if (deviceId) {
        // Edit mode
        await updateDoc(doc(db, 'devices', deviceId), deviceData);
        Alert.alert('Thành công', `Đã cập nhật thiết bị ${deviceName.trim()}!`);
      } else {
        // Create mode
        const newDoc = {
          ...deviceData,
          createdAt: new Date(),
          createdBy: auth.currentUser?.uid || 'system',
        };
        await addDoc(collection(db, 'devices'), newDoc);
        Alert.alert('Thành công', `Đã thêm thiết bị ${deviceName.trim()} thành công!`);
      }
      navigation.goBack();
    } catch (err) {
      console.error('Error saving device:', err);
      Alert.alert('Lỗi', 'Không thể lưu thiết bị.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingDevice) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Đang tải cấu hình thiết bị...</Text>
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
        <Text style={styles.headerTitle}>{deviceId ? 'Chỉnh sửa thiết bị' : 'Thêm thiết bị mới'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Tòa nhà Dropdown */}
          <Text style={styles.label}>Tòa nhà áp dụng</Text>
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

          {/* Tên thiết bị */}
          <Text style={[styles.label, { marginTop: 16 }]}>Tên thiết bị *</Text>
          <View style={styles.inputContainer}>
            <MaterialIcons name="router" size={20} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Vd: Máy giặt, Điều hòa, Giường ngủ"
              value={deviceName}
              onChangeText={setDeviceName}
            />
          </View>

          {/* Danh mục Dropdown */}
          <Text style={[styles.label, { marginTop: 16 }]}>Danh mục thiết bị</Text>
          <View style={{ zIndex: 20 }}>
            <Pressable onPress={() => setShowCategoryDropdown(!showCategoryDropdown)} style={styles.dropdownButton}>
              <Text style={styles.dropdownButtonText}>{selectedCategory || 'Chọn danh mục'}</Text>
              <MaterialIcons name="keyboard-arrow-down" size={24} color="#a1a1aa" />
            </Pressable>
            {showCategoryDropdown && (
              <View style={styles.dropdown}>
                {CATEGORIES.map((c) => (
                  <Pressable key={c} style={styles.dropdownItem} onPress={() => { setSelectedCategory(c); setShowCategoryDropdown(false); }}>
                    <Text style={styles.dropdownItemText}>{c}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Mô tả */}
          <Text style={[styles.label, { marginTop: 16 }]}>Mô tả chi tiết</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <MaterialIcons name="description" size={20} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Nhập mô tả thiết bị, hãng sản xuất, thời gian mua..."
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>{deviceId ? 'Lưu thay đổi' : 'Thêm thiết bị'}</Text>
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingTop: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: theme.colors.onSurface,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
    paddingVertical: 0,
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
    padding: theme.spacing.marginMobile,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  saveBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 14,
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

export default CreateDevice;
