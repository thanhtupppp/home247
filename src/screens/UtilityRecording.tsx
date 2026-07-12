import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Switch, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { mockRooms } from '../data/mockData';
import { doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import { db, auth } from '../firebase';

const getPreviousMonth = (monthStr: string): string => {
  const [m, y] = monthStr.split('/').map(Number);
  if (m === 1) {
    return `12/${y - 1}`;
  }
  return `${String(m - 1).padStart(2, '0')}/${y}`;
};

const BUILDINGS = ['nơ trang long', 'Home247 Landmark', 'Home247 Riverside'];

export const UtilityRecording: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const initialBuilding = route.params?.building || 'nơ trang long';
  const initialRoom = route.params?.room || '';
  const initialMonth = route.params?.month || '10/2026';

  const [activeTab, setActiveTab] = React.useState<'room' | 'bulk'>('room');
  const [selectedBuilding, setSelectedBuilding] = React.useState(initialBuilding);
  const [selectedRoom, setSelectedRoom] = React.useState(initialRoom);
  const [selectedMonth, setSelectedMonth] = React.useState(initialMonth);
  
  const [showBuildingDropdown, setShowBuildingDropdown] = React.useState(false);
  const [showRoomDropdown, setShowRoomDropdown] = React.useState(false);

  // States for recording data
  const [electricOld, setElectricOld] = React.useState(0);
  const [waterOld, setWaterOld] = React.useState(0);
  const [singleElectricNew, setSingleElectricNew] = React.useState('');
  const [singleWaterNew, setSingleWaterNew] = React.useState('');
  
  const [bulkRooms, setBulkRooms] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const rooms = mockRooms.map(r => r.code);

  React.useEffect(() => {
    if (route.params?.room) {
      setSelectedRoom(route.params.room);
      setActiveTab('room');
    }
  }, [route.params?.room]);

  React.useEffect(() => {
    if (activeTab === 'room') {
      loadSingleRoomData();
    } else {
      loadBulkData();
    }
  }, [activeTab, selectedRoom, selectedBuilding, selectedMonth]);

  const loadSingleRoomData = async () => {
    if (!selectedRoom) return;
    try {
      setLoading(true);
      const prevMonth = getPreviousMonth(selectedMonth);
      
      const currentDocId = `${selectedBuilding}_${selectedRoom}_${selectedMonth.replace('/', '-')}`;
      const prevDocId = `${selectedBuilding}_${selectedRoom}_${prevMonth.replace('/', '-')}`;
      
      const [currentSnap, prevSnap] = await Promise.all([
        getDoc(doc(db, 'utilityReadings', currentDocId)),
        getDoc(doc(db, 'utilityReadings', prevDocId))
      ]);
      
      let oldElectric = 0;
      let oldWater = 0;
      
      if (prevSnap.exists()) {
        oldElectric = prevSnap.data().electricNew || 0;
        oldWater = prevSnap.data().waterNew || 0;
      }
      
      setElectricOld(oldElectric);
      setWaterOld(oldWater);
      
      if (currentSnap.exists()) {
        const curData = currentSnap.data();
        setSingleElectricNew(String(curData.electricNew || ''));
        setSingleWaterNew(String(curData.waterNew || ''));
        if (curData.electricOld !== undefined) setElectricOld(curData.electricOld);
        if (curData.waterOld !== undefined) setWaterOld(curData.waterOld);
      } else {
        setSingleElectricNew('');
        setSingleWaterNew('');
      }
    } catch (error) {
      console.error('Error loading single room utility data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBulkData = async () => {
    try {
      setLoading(true);
      const prevMonth = getPreviousMonth(selectedMonth);
      
      const promises = mockRooms.map(async (room) => {
        const currentDocId = `${selectedBuilding}_${room.code}_${selectedMonth.replace('/', '-')}`;
        const prevDocId = `${selectedBuilding}_${room.code}_${prevMonth.replace('/', '-')}`;
        
        const [currentSnap, prevSnap] = await Promise.all([
          getDoc(doc(db, 'utilityReadings', currentDocId)),
          getDoc(doc(db, 'utilityReadings', prevDocId))
        ]);
        
        let oldElectric = 0;
        let oldWater = 0;
        let newElectric = '';
        let newWater = '';
        let isRecorded = false;
        
        if (prevSnap.exists()) {
          oldElectric = prevSnap.data().electricNew || 0;
          oldWater = prevSnap.data().waterNew || 0;
        }
        
        if (currentSnap.exists()) {
          const curData = currentSnap.data();
          newElectric = String(curData.electricNew || '');
          newWater = String(curData.waterNew || '');
          oldElectric = curData.electricOld !== undefined ? curData.electricOld : oldElectric;
          oldWater = curData.waterOld !== undefined ? curData.waterOld : oldWater;
          isRecorded = true;
        }
        
        return {
          id: room.id,
          code: room.code,
          enabled: true,
          electricOld: oldElectric,
          electricNew: newElectric,
          waterOld: oldWater,
          waterNew: newWater,
          isRecorded
        };
      });
      
      const results = await Promise.all(promises);
      setBulkRooms(results);
    } catch (error) {
      console.error('Error loading bulk utility data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (activeTab === 'room') {
      if (!selectedRoom) {
        Alert.alert('Thông báo', 'Vui lòng chọn phòng.');
        return;
      }
      if (!singleElectricNew || !singleWaterNew) {
        Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ chỉ số mới.');
        return;
      }
      
      try {
        setSaving(true);
        const docId = `${selectedBuilding}_${selectedRoom}_${selectedMonth.replace('/', '-')}`;
        const docRef = doc(db, 'utilityReadings', docId);
        
        await setDoc(docRef, {
          building: selectedBuilding,
          room: selectedRoom,
          month: selectedMonth,
          electricOld: Number(electricOld),
          electricNew: Number(singleElectricNew),
          waterOld: Number(waterOld),
          waterNew: Number(singleWaterNew),
          recordedAt: new Date(),
          recordedBy: auth.currentUser?.uid || 'system'
        });
        
        Alert.alert('Thành công', `Đã ghi điện nước cho phòng ${selectedRoom} thành công!`);
        navigation.goBack();
      } catch (error) {
        console.error('Error saving utility reading:', error);
        Alert.alert('Lỗi', 'Không thể lưu chỉ số điện nước.');
      } finally {
        setSaving(false);
      }
    } else {
      const enabledRooms = bulkRooms.filter(r => r.enabled);
      if (enabledRooms.length === 0) {
        Alert.alert('Thông báo', 'Không có phòng nào được chọn để ghi.');
        return;
      }
      
      const incomplete = enabledRooms.some(r => !r.electricNew || !r.waterNew);
      if (incomplete) {
        Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ chỉ số mới cho tất cả các phòng được bật.');
        return;
      }
      
      try {
        setSaving(true);
        const batch = writeBatch(db);
        
        enabledRooms.forEach(room => {
          const docId = `${selectedBuilding}_${room.code}_${selectedMonth.replace('/', '-')}`;
          const docRef = doc(db, 'utilityReadings', docId);
          batch.set(docRef, {
            building: selectedBuilding,
            room: room.code,
            month: selectedMonth,
            electricOld: Number(room.electricOld),
            electricNew: Number(room.electricNew),
            waterOld: Number(room.waterOld),
            waterNew: Number(room.waterNew),
            recordedAt: new Date(),
            recordedBy: auth.currentUser?.uid || 'system'
          });
        });
        
        await batch.commit();
        Alert.alert('Thành công', `Đã ghi điện nước hàng loạt thành công!`);
        navigation.goBack();
      } catch (error) {
        console.error('Error saving bulk utility readings:', error);
        Alert.alert('Lỗi', 'Không thể lưu chỉ số điện nước hàng loạt.');
      } finally {
        setSaving(false);
      }
    }
  };

  const toggleBulkRoom = (id: string) => {
    setBulkRooms(bulkRooms.map(item => 
      item.id === id ? { ...item, enabled: !item.enabled } : item
    ));
  };

  const handleBulkElectricChange = (id: string, value: string) => {
    setBulkRooms(bulkRooms.map(item => 
      item.id === id ? { ...item, electricNew: value } : item
    ));
  };

  const handleBulkWaterChange = (id: string, value: string) => {
    setBulkRooms(bulkRooms.map(item => 
      item.id === id ? { ...item, waterNew: value } : item
    ));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Ghi điện nước</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <Pressable 
          style={[styles.tabButton, activeTab === 'room' && styles.tabButtonActive]}
          onPress={() => setActiveTab('room')}
        >
          <Text style={[styles.tabText, activeTab === 'room' && styles.tabTextActive]}>
            Ghi theo phòng
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.tabButton, activeTab === 'bulk' && styles.tabButtonActive]}
          onPress={() => setActiveTab('bulk')}
        >
          <Text style={[styles.tabText, activeTab === 'bulk' && styles.tabTextActive]}>
            Ghi hàng loạt
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Tab 1: Ghi theo phòng */}
          {activeTab === 'room' && (
            <View style={styles.form}>
              <Text style={styles.label}>Tòa nhà *</Text>
              <Pressable onPress={() => setShowBuildingDropdown(!showBuildingDropdown)} style={styles.dropdownButton}>
                <Text style={styles.dropdownButtonText}>{selectedBuilding}</Text>
                <MaterialIcons name="keyboard-arrow-down" size={24} color="#a1a1aa" />
              </Pressable>
              {showBuildingDropdown && (
                <View style={styles.dropdown}>
                  {BUILDINGS.map((b) => (
                    <Pressable key={b} style={styles.dropdownItem} onPress={() => { setSelectedBuilding(b); setShowBuildingDropdown(false); }}>
                      <Text style={styles.dropdownItemText}>{b}</Text>
                    </Pressable>
                  ))}
                </View>
              )}

              <Text style={[styles.label, { marginTop: 16 }]}>Chọn phòng *</Text>
              <Pressable onPress={() => setShowRoomDropdown(!showRoomDropdown)} style={styles.dropdownButton}>
                <Text style={styles.dropdownButtonText}>{selectedRoom || 'Chọn...'}</Text>
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

              {selectedRoom !== '' && (
                <View style={styles.inputsSection}>
                  {/* Electricity Card */}
                  <View style={styles.card}>
                    <View style={styles.cardHeader}>
                      <MaterialIcons name="bolt" size={20} color="#d97706" />
                      <Text style={styles.cardTitle}>Điện</Text>
                    </View>
                    <View style={styles.cardRow}>
                      <View style={styles.inputCol}>
                        <Text style={styles.inputLabel}>Chỉ số cũ</Text>
                        <TextInput style={styles.textInputRead} value={String(electricOld)} editable={false} />
                      </View>
                      <View style={styles.inputCol}>
                        <Text style={styles.inputLabel}>Chỉ số mới</Text>
                        <TextInput 
                          style={styles.textInput} 
                          placeholder="Nhập số..." 
                          keyboardType="numeric" 
                          value={singleElectricNew}
                          onChangeText={setSingleElectricNew}
                        />
                      </View>
                    </View>
                  </View>

                  {/* Water Card */}
                  <View style={styles.card}>
                    <View style={styles.cardHeader}>
                      <MaterialIcons name="water-drop" size={20} color={theme.colors.primary} />
                      <Text style={styles.cardTitle}>Nước</Text>
                    </View>
                    <View style={styles.cardRow}>
                      <View style={styles.inputCol}>
                        <Text style={styles.inputLabel}>Chỉ số cũ</Text>
                        <TextInput style={styles.textInputRead} value={String(waterOld)} editable={false} />
                      </View>
                      <View style={styles.inputCol}>
                        <Text style={styles.inputLabel}>Chỉ số mới</Text>
                        <TextInput 
                          style={styles.textInput} 
                          placeholder="Nhập số..." 
                          keyboardType="numeric" 
                          value={singleWaterNew}
                          onChangeText={setSingleWaterNew}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Tab 2: Ghi hàng loạt */}
          {activeTab === 'bulk' && (
            <View style={styles.form}>
              <Text style={styles.label}>Tòa nhà *</Text>
              <Pressable onPress={() => setShowBuildingDropdown(!showBuildingDropdown)} style={styles.dropdownButton}>
                <Text style={styles.dropdownButtonText}>{selectedBuilding}</Text>
                <MaterialIcons name="keyboard-arrow-down" size={24} color="#a1a1aa" />
              </Pressable>
              {showBuildingDropdown && (
                <View style={styles.dropdown}>
                  {BUILDINGS.map((b) => (
                    <Pressable key={b} style={styles.dropdownItem} onPress={() => { setSelectedBuilding(b); setShowBuildingDropdown(false); }}>
                      <Text style={styles.dropdownItemText}>{b}</Text>
                    </Pressable>
                  ))}
                </View>
              )}

              {/* List of rooms for bulk input */}
              <View style={styles.bulkList}>
                {bulkRooms.map((room) => (
                  <View key={room.id} style={styles.bulkCard}>
                    <View style={styles.bulkCardHeader}>
                      <Text style={styles.bulkRoomName}>{room.code}</Text>
                      <Switch 
                        value={room.enabled} 
                        onValueChange={() => toggleBulkRoom(room.id)}
                        trackColor={{ false: '#e2e8f0', true: '#60a5fa' }}
                        thumbColor={room.enabled ? theme.colors.primary : '#94a3b8'}
                      />
                    </View>

                    {room.enabled && (
                      <View style={styles.bulkInputsContainer}>
                        {/* Điện */}
                        <Text style={styles.bulkSubTitle}>điện</Text>
                        <View style={styles.cardRow}>
                          <View style={styles.inputCol}>
                            <Text style={styles.inputLabel}>Chỉ số cũ</Text>
                            <TextInput style={styles.textInputRead} value={String(room.electricOld)} editable={false} />
                          </View>
                          <View style={styles.inputCol}>
                            <Text style={styles.inputLabel}>Chỉ số mới</Text>
                            <TextInput 
                              style={styles.textInput} 
                              placeholder="Nhập chỉ số" 
                              keyboardType="numeric"
                              value={room.electricNew}
                              onChangeText={(val) => handleBulkElectricChange(room.id, val)}
                            />
                          </View>
                        </View>

                        {/* Nước */}
                        <Text style={[styles.bulkSubTitle, { color: theme.colors.primary, marginTop: 12 }]}>nước</Text>
                        <View style={styles.cardRow}>
                          <View style={styles.inputCol}>
                            <Text style={styles.inputLabel}>Chỉ số cũ</Text>
                            <TextInput style={styles.textInputRead} value={String(room.waterOld)} editable={false} />
                          </View>
                          <View style={styles.inputCol}>
                            <Text style={styles.inputLabel}>Chỉ số mới</Text>
                            <TextInput 
                              style={styles.textInput} 
                              placeholder="Nhập chỉ số" 
                              keyboardType="numeric"
                              value={room.waterNew}
                              onChangeText={(val) => handleBulkWaterChange(room.id, val)}
                            />
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* Bottom Save Button */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <MaterialIcons name="save" size={24} color={theme.colors.onPrimary} />
              <Text style={styles.saveBtnText}>Ghi điện nước</Text>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurfaceVariant,
    fontWeight: '500',
  },
  tabTextActive: {
    color: theme.colors.primary,
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
  inputsSection: {
    marginTop: 20,
    gap: 16,
  },
  card: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    padding: 16,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceContainer,
    paddingBottom: 8,
  },
  cardTitle: {
    ...theme.typography.titleLg,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputCol: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: theme.colors.onSurface,
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  textInputRead: {
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    backgroundColor: '#f1f5f9',
  },
  bulkList: {
    marginTop: 20,
    gap: 16,
  },
  bulkCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    padding: 16,
  },
  bulkCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bulkRoomName: {
    ...theme.typography.bodyLg,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  bulkInputsContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceContainer,
    paddingTop: 12,
  },
  bulkSubTitle: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'lowercase',
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

export default UtilityRecording;
