import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Switch, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { mockRooms } from '../data/mockData';
import { doc, getDoc, setDoc, writeBatch, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { api } from '../api/client';
import * as ImagePicker from 'expo-image-picker';

const getPreviousMonth = (monthStr: string): string => {
  const [m, y] = monthStr.split('/').map(Number);
  if (m === 1) {
    return `12/${y - 1}`;
  }
  return `${String(m - 1).padStart(2, '0')}/${y}`;
};

const generateMonthsList = (): string[] => {
  const list: string[] = [];
  const date = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    list.push(`${mm}/${yyyy}`);
  }
  return list;
};

export const UtilityRecording: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const monthsList = generateMonthsList();
  const defaultMonth = monthsList[monthsList.length - 1];

  const initialBuilding = route.params?.building || 'nơ trang long';
  const initialRoom = route.params?.room || '';
  const initialMonth = route.params?.month || defaultMonth;

  const [activeTab, setActiveTab] = React.useState<'room' | 'bulk'>('room');
  const [selectedBuilding, setSelectedBuilding] = React.useState(initialBuilding);
  const [selectedRoom, setSelectedRoom] = React.useState(initialRoom);
  const [selectedMonth, setSelectedMonth] = React.useState(initialMonth);
  
  const [showBuildingDropdown, setShowBuildingDropdown] = React.useState(false);
  const [showRoomDropdown, setShowRoomDropdown] = React.useState(false);

  // States for recording data
  const [electricOld, setElectricOld] = React.useState('');
  const [waterOld, setWaterOld] = React.useState('');
  const [singleElectricNew, setSingleElectricNew] = React.useState('');
  const [singleWaterNew, setSingleWaterNew] = React.useState('');
  
  const [bulkRooms, setBulkRooms] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [scanningElectric, setScanningElectric] = React.useState(false);
  const [scanningWater, setScanningWater] = React.useState(false);

  const handleScanMeter = async (type: 'electricity' | 'water') => {
    // 1. Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'Ứng dụng cần quyền truy cập thư viện ảnh để quét chỉ số công tơ.');
      return;
    }

    // 2. Launch Image Picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (result.canceled || !result.assets?.[0]?.base64) return;

    try {
      if (type === 'electricity') setScanningElectric(true);
      else setScanningWater(true);

      const resData = await api.ocrUtilityMeter(
        result.assets[0].base64,
        type === 'electricity' ? 'diện' : 'nước'
      );

      if (resData.reading !== undefined) {
        Alert.alert(
          'Kết quả nhận diện AI',
          `AI đọc được chỉ số: ${resData.reading} (Độ tin cậy: ${Math.round((resData.confidence || 0) * 100)}%).\nBạn có muốn sử dụng số này không?`,
          [
            { text: 'Hủy', style: 'cancel' },
            { 
              text: 'Đồng ý', 
              onPress: () => {
                if (type === 'electricity') {
                  setSingleElectricNew(String(resData.reading));
                } else {
                  setSingleWaterNew(String(resData.reading));
                }
              } 
            }
          ]
        );
      } else {
        Alert.alert('Thông báo', 'AI không thể nhận diện được số trên công tơ này. Vui lòng nhập tay.');
      }
    } catch (err) {
      console.error('Error scanning meter:', err);
      Alert.alert('Lỗi', 'Không thể kết nối dịch vụ quét ảnh AI. Vui lòng nhập thủ công.');
    } finally {
      setScanningElectric(false);
      setScanningWater(false);
    }
  };

  const [buildings, setBuildings] = React.useState<any[]>([]);
  const [rooms, setRooms] = React.useState<any[]>([]);
  const [waterCalcMethod, setWaterCalcMethod] = React.useState('Theo chỉ số đồng hồ');

  // Effect 1: Fetch buildings list, rooms list and water service type
  // Only re-runs when selectedBuilding changes
  React.useEffect(() => {
    const run = async () => {
      if (!selectedBuilding) return;
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        // Fetch buildings
        const bSnapshot = await getDocs(query(collection(db, 'buildings'), where('ownerId', '==', uid)));
        const bList: any[] = [];
        bSnapshot.forEach((d: any) => bList.push({ id: d.id, ...d.data() }));
        setBuildings(bList);

        // Fetch rooms for current building
        const rSnapshot = await getDocs(
          query(collection(db, 'rooms'), where('ownerId', '==', uid), where('buildingName', '==', selectedBuilding))
        );
        const rList: any[] = [];
        rSnapshot.forEach((d: any) => { if (d.data().code) rList.push({ id: d.id, code: d.data().code }); });
        rList.sort((a, b) => a.code.localeCompare(b.code));
        setRooms(rList);

        // Fetch water service calc method
        const svcSnap = await getDocs(query(collection(db, 'services'), where('ownerId', '==', uid)));
        let method = 'Theo chỉ số đồng hồ';
        let foundSpecific = false;
        svcSnap.forEach((d) => {
          const data = d.data();
          const sName = (data.name || '').toLowerCase();
          if (sName.includes('nước') || sName.includes('nuoc')) {
            if (data.buildingName === selectedBuilding) {
              method = data.calcMethod || 'Theo chỉ số đồng hồ';
              foundSpecific = true;
            } else if (!foundSpecific && (data.buildingName === 'Khác' || data.buildingId === 'all')) {
              method = data.calcMethod || 'Theo chỉ số đồng hồ';
            }
          }
        });
        setWaterCalcMethod(method);
      } catch (e) {
        console.error('Error loading buildings/rooms:', e);
      }
    };
    run();
  }, [selectedBuilding]);

  // Effect 2: Load meter reading data when room/month/tab changes
  // Depends only on primitive values (strings), not on functions or arrays
  React.useEffect(() => {
    const run = async () => {
      if (!selectedBuilding) return;
      try {
        setLoading(true);
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        // We read buildings/rooms from DB fresh here to avoid depending on state arrays
        const bSnapshot = await getDocs(query(collection(db, 'buildings'), where('ownerId', '==', uid), where('name', '==', selectedBuilding)));
        let buildingId = 'unknown';
        bSnapshot.forEach((d: any) => { buildingId = d.id; });

        if (activeTab === 'room') {
          if (!selectedRoom) { setLoading(false); return; }

          const rSnapshot = await getDocs(
            query(collection(db, 'rooms'), where('ownerId', '==', uid), where('buildingName', '==', selectedBuilding), where('code', '==', selectedRoom))
          );
          let roomId = 'unknown';
          rSnapshot.forEach((d: any) => { roomId = d.id; });

          const prevMonth = getPreviousMonth(selectedMonth);
          const period = selectedMonth.split('/').reverse().join('-');
          const prevPeriod = prevMonth.split('/').reverse().join('-');
          const currentDocId = `${buildingId}_${roomId}_${period}`;
          const prevDocId = `${buildingId}_${roomId}_${prevPeriod}`;

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
          setElectricOld(String(oldElectric));
          setWaterOld(String(oldWater));

          if (currentSnap.exists()) {
            const curData = currentSnap.data();
            setSingleElectricNew(String(curData.electricNew || ''));
            setSingleWaterNew(String(curData.waterNew || ''));
            if (curData.electricOld !== undefined) setElectricOld(String(curData.electricOld));
            if (curData.waterOld !== undefined) setWaterOld(String(curData.waterOld));
          } else {
            setSingleElectricNew('');
            setSingleWaterNew('');
          }
        } else {
          // Bulk tab
          const prevMonth = getPreviousMonth(selectedMonth);
          const period = selectedMonth.split('/').reverse().join('-');
          const prevPeriod = prevMonth.split('/').reverse().join('-');

          const rSnapshot = await getDocs(
            query(collection(db, 'rooms'), where('ownerId', '==', uid), where('buildingName', '==', selectedBuilding))
          );
          const roomsList: any[] = [];
          rSnapshot.forEach((d: any) => roomsList.push({ id: d.id, ...d.data() }));
          roomsList.sort((a, b) => a.code.localeCompare(b.code));

          const promises = roomsList.map(async (room) => {
            const currentDocId = `${buildingId}_${room.id}_${period}`;
            const prevDocId = `${buildingId}_${room.id}_${prevPeriod}`;
            const [curSnap, prvSnap] = await Promise.all([
              getDoc(doc(db, 'utilityReadings', currentDocId)),
              getDoc(doc(db, 'utilityReadings', prevDocId))
            ]);
            let oldElectric = prvSnap.exists() ? (prvSnap.data().electricNew || 0) : 0;
            let oldWater = prvSnap.exists() ? (prvSnap.data().waterNew || 0) : 0;
            let newElectric = '';
            let newWater = '';
            let electricOldVal = String(oldElectric);
            let waterOldVal = String(oldWater);
            if (curSnap.exists()) {
              const d = curSnap.data();
              newElectric = d.electricNew !== undefined ? String(d.electricNew) : '';
              newWater = d.waterNew !== undefined ? String(d.waterNew) : '';
              if (d.electricOld !== undefined) electricOldVal = String(d.electricOld);
              if (d.waterOld !== undefined) waterOldVal = String(d.waterOld);
            }
            return { id: room.id, roomCode: room.code, electricOld: electricOldVal, waterOld: waterOldVal, electricNew: newElectric, waterNew: newWater, enabled: true };
          });
          const list = await Promise.all(promises);
          setBulkRooms(list);
        }
      } catch (error) {
        console.error('Error loading utility data:', error);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [selectedBuilding, selectedRoom, selectedMonth, activeTab]);

  const handleSave = async () => {
    if (activeTab === 'room') {
      if (!selectedRoom) {
        Alert.alert('Thông báo', 'Vui lòng chọn phòng.');
        return;
      }
      if (!singleElectricNew) {
        Alert.alert('Thông báo', 'Vui lòng nhập chỉ số điện mới.');
        return;
      }
      if (waterCalcMethod === 'Theo chỉ số đồng hồ' && !singleWaterNew) {
        Alert.alert('Thông báo', 'Vui lòng nhập chỉ số nước mới.');
        return;
      }
      
      try {
        setSaving(true);
        const uid = auth.currentUser?.uid || 'system';
        const buildingObj = buildings.find(b => b.name === selectedBuilding);
        const buildingId = buildingObj ? buildingObj.id : 'unknown';
        const roomObj = rooms.find(r => r.code === selectedRoom);
        const roomId = roomObj ? roomObj.id : 'unknown';

        const period = selectedMonth.split('/').reverse().join('-');
        const docId = `${buildingId}_${roomId}_${period}`;
        const docRef = doc(db, 'utilityReadings', docId);
        
        await setDoc(docRef, {
          buildingId,
          buildingName: selectedBuilding,
          roomId,
          roomCode: selectedRoom,
          period,
          month: selectedMonth,
          electricOld: Number(electricOld) || 0,
          electricNew: Number(singleElectricNew) || 0,
          waterOld: waterCalcMethod === 'Theo chỉ số đồng hồ' ? (Number(waterOld) || 0) : 0,
          waterNew: waterCalcMethod === 'Theo chỉ số đồng hồ' ? (Number(singleWaterNew) || 0) : 0,
          isRecorded: true,
          recordedAt: new Date(),
          recordedBy: uid,
          ownerId: uid,
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
      
      const incomplete = enabledRooms.some(r => {
        const isElectricMissing = !r.electricNew;
        const isWaterMissing = waterCalcMethod === 'Theo chỉ số đồng hồ' && !r.waterNew;
        return isElectricMissing || isWaterMissing;
      });
      if (incomplete) {
        Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ chỉ số mới cho các phòng được bật.');
        return;
      }
      
      try {
        setSaving(true);
        const uid = auth.currentUser?.uid || 'system';
        const buildingObj = buildings.find(b => b.name === selectedBuilding);
        const buildingId = buildingObj ? buildingObj.id : 'unknown';
        const period = selectedMonth.split('/').reverse().join('-');

        const batch = writeBatch(db);
        
        enabledRooms.forEach(room => {
          const docId = `${buildingId}_${room.id}_${period}`;
          const docRef = doc(db, 'utilityReadings', docId);
          batch.set(docRef, {
            buildingId,
            buildingName: selectedBuilding,
            roomId: room.id,
            roomCode: room.roomCode,
            period,
            month: selectedMonth,
            electricOld: Number(room.electricOld) || 0,
            electricNew: Number(room.electricNew) || 0,
            waterOld: waterCalcMethod === 'Theo chỉ số đồng hồ' ? (Number(room.waterOld) || 0) : 0,
            waterNew: waterCalcMethod === 'Theo chỉ số đồng hồ' ? (Number(room.waterNew) || 0) : 0,
            isRecorded: true,
            recordedAt: new Date(),
            recordedBy: uid,
            ownerId: uid,
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

  const handleBulkOldElectricChange = (id: string, value: string) => {
    setBulkRooms(bulkRooms.map(item => 
      item.id === id ? { ...item, electricOld: value } : item
    ));
  };

  const handleBulkOldWaterChange = (id: string, value: string) => {
    setBulkRooms(bulkRooms.map(item => 
      item.id === id ? { ...item, waterOld: value } : item
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
                  {buildings.map((b: any) => (
                    <Pressable key={b.id} style={styles.dropdownItem} onPress={() => { setSelectedBuilding(b.name); setShowBuildingDropdown(false); }}>
                      <Text style={styles.dropdownItemText}>{b.name}</Text>
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
                    <Pressable key={r.id} style={styles.dropdownItem} onPress={() => { setSelectedRoom(r.code); setShowRoomDropdown(false); }}>
                      <Text style={styles.dropdownItemText}>{r.code}</Text>
                    </Pressable>
                  ))}
                </View>
              )}

              {selectedRoom !== '' && (
                <View style={styles.inputsSection}>
                  {/* Electricity Card */}
                  <View style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <MaterialIcons name="bolt" size={20} color="#d97706" />
                        <Text style={styles.cardTitle}>Điện</Text>
                      </View>
                      <Pressable 
                        style={styles.aiScanInlineBtn}
                        onPress={() => handleScanMeter('electricity')}
                        disabled={scanningElectric}
                      >
                        {scanningElectric ? (
                          <ActivityIndicator size="small" color={theme.colors.primary} />
                        ) : (
                          <>
                            <MaterialIcons name="auto-awesome" size={14} color={theme.colors.primary} />
                            <Text style={styles.aiScanInlineText}>AI Quét chỉ số</Text>
                          </>
                        )}
                      </Pressable>
                    </View>
                    <View style={styles.cardRow}>
                      <View style={styles.inputCol}>
                        <Text style={styles.inputLabel}>Chỉ số cũ</Text>
                        <TextInput 
                          style={styles.textInput} 
                          placeholder="Chỉ số cũ" 
                          keyboardType="numeric" 
                          value={electricOld}
                          onChangeText={setElectricOld}
                        />
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
                  {waterCalcMethod === 'Theo chỉ số đồng hồ' ? (
                    <View style={styles.card}>
                      <View style={styles.cardHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <MaterialIcons name="water-drop" size={20} color={theme.colors.primary} />
                          <Text style={styles.cardTitle}>Nước</Text>
                        </View>
                        <Pressable 
                          style={styles.aiScanInlineBtn}
                          onPress={() => handleScanMeter('water')}
                          disabled={scanningWater}
                        >
                          {scanningWater ? (
                            <ActivityIndicator size="small" color={theme.colors.primary} />
                          ) : (
                            <>
                              <MaterialIcons name="auto-awesome" size={14} color={theme.colors.primary} />
                              <Text style={styles.aiScanInlineText}>AI Quét chỉ số</Text>
                            </>
                          )}
                        </Pressable>
                      </View>
                      <View style={styles.cardRow}>
                        <View style={styles.inputCol}>
                          <Text style={styles.inputLabel}>Chỉ số cũ</Text>
                          <TextInput 
                            style={styles.textInput} 
                            placeholder="Chỉ số cũ" 
                            keyboardType="numeric" 
                            value={waterOld}
                            onChangeText={setWaterOld}
                          />
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
                  ) : (
                    <View style={[styles.card, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
                      <MaterialIcons name="info-outline" size={20} color="#16a34a" />
                      <Text style={{ fontSize: 13, color: '#15803d', fontWeight: '500', flex: 1 }}>
                        Dịch vụ nước tòa nhà được cấu hình: <Text style={{ fontWeight: 'bold' }}>{waterCalcMethod}</Text>. Không cần ghi chỉ số nước cho tòa nhà này.
                      </Text>
                    </View>
                  )}
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
                  {buildings.map((b: any) => (
                    <Pressable key={b.id} style={styles.dropdownItem} onPress={() => { setSelectedBuilding(b.name); setShowBuildingDropdown(false); }}>
                      <Text style={styles.dropdownItemText}>{b.name}</Text>
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
                            <TextInput 
                              style={styles.textInput} 
                              placeholder="Nhập chỉ số" 
                              keyboardType="numeric"
                              value={String(room.electricOld)} 
                              onChangeText={(val) => handleBulkOldElectricChange(room.id, val)}
                            />
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
                        {waterCalcMethod === 'Theo chỉ số đồng hồ' && (
                          <>
                            <Text style={[styles.bulkSubTitle, { color: theme.colors.primary, marginTop: 12 }]}>nước</Text>
                            <View style={styles.cardRow}>
                              <View style={styles.inputCol}>
                                <Text style={styles.inputLabel}>Chỉ số cũ</Text>
                                <TextInput 
                                  style={styles.textInput} 
                                  placeholder="Nhập chỉ số" 
                                  keyboardType="numeric"
                                  value={String(room.waterOld)} 
                                  onChangeText={(val) => handleBulkOldWaterChange(room.id, val)}
                                />
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
                          </>
                        )}
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
  aiScanInlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.default,
    backgroundColor: '#eff6ff',
  },
  aiScanInlineText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
});

export default UtilityRecording;
