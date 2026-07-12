import React from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, TextInput,
  Switch, ActivityIndicator, Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { collection, addDoc, getDocs, query, where, orderBy, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

interface Building {
  id: string;
  name: string;
}

interface Room {
  id: string;
  code: string;
  price?: number;
}

interface Tenant {
  id: string;
  fullName: string;
}

const MONTHS = ['05/2026', '06/2026', '07/2026', '08/2026', '09/2026', '10/2026', '11/2026', '12/2026'];

export const CreateInvoice: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const initialBuildingId = route.params?.buildingId || '';

  // ── States ─────────────────────────────────────────────────────────────────
  const [loadingBuildings, setLoadingBuildings] = React.useState(true);
  const [loadingRooms, setLoadingRooms] = React.useState(false);
  const [loadingTenant, setLoadingTenant] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [buildings, setBuildings] = React.useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = React.useState<Building | null>(null);
  const [showBuildingDropdown, setShowBuildingDropdown] = React.useState(false);

  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = React.useState<Room | null>(null);
  const [showRoomDropdown, setShowRoomDropdown] = React.useState(false);

  const [activeTenant, setActiveTenant] = React.useState<Tenant | null>(null);

  // Form toggles and states
  const [includeRent, setIncludeRent] = React.useState(true);
  const [rentAmount, setRentAmount] = React.useState('');
  const [includeService, setIncludeService] = React.useState(true);
  const [includeMeter, setIncludeMeter] = React.useState(true);
  const [showMonthDropdown, setShowMonthDropdown] = React.useState(false);

  // Default month: Current Month
  const currentMonthStr = React.useMemo(() => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    return `${mm}/${now.getFullYear()}`;
  }, []);

  const [selectedMonth, setSelectedMonth] = React.useState(currentMonthStr);

  const finalMonths = React.useMemo(() => {
    if (!MONTHS.includes(selectedMonth)) {
      return [...MONTHS, selectedMonth].sort((a, b) => {
        const [mA, yA] = a.split('/').map(Number);
        const [mB, yB] = b.split('/').map(Number);
        return yA !== yB ? yA - yB : mA - mB;
      });
    }
    return MONTHS;
  }, [selectedMonth]);

  const parsedDates = React.useMemo(() => {
    const parts = selectedMonth.split('/');
    if (parts.length !== 2) return { start: '01/07/2026', end: '31/07/2026' };
    const [mm, yyyy] = parts.map(Number);
    const daysInMonth = new Date(yyyy, mm, 0).getDate();
    return {
      start: `01/${String(mm).padStart(2, '0')}/${yyyy}`,
      end: `${String(daysInMonth).padStart(2, '0')}/${String(mm).padStart(2, '0')}/${yyyy}`,
    };
  }, [selectedMonth]);

  // ── Fetch Methods ──────────────────────────────────────────────────────────

  const fetchActiveTenant = React.useCallback(async (roomId: string) => {
    try {
      setLoadingTenant(true);
      setActiveTenant(null);
      const snap = await getDocs(
        query(collection(db, 'tenants'), where('roomId', '==', roomId), where('status', '==', 'active'))
      );
      if (!snap.empty) {
        const data = snap.docs[0].data();
        setActiveTenant({ id: snap.docs[0].id, fullName: data.fullName || '' });
      }
    } catch (err) {
      console.error('Error fetching tenant:', err);
    } finally {
      setLoadingTenant(false);
    }
  }, []);

  const fetchRooms = React.useCallback(async (buildingId: string) => {
    try {
      setLoadingRooms(true);
      setSelectedRoom(null);
      setActiveTenant(null);
      const snap = await getDocs(
        query(collection(db, 'rooms'), where('buildingId', '==', buildingId), orderBy('code'))
      );
      const list = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          code: data.code || '',
          price: data.price ? Number(data.price) : undefined,
        };
      });
      setRooms(list);
      if (list.length > 0) {
        setSelectedRoom(list[0]);
        // Set initial rent amount
        if (list[0].price) {
          setRentAmount(list[0].price.toString());
        }
        fetchActiveTenant(list[0].id);
      }
      return list;
    } catch (err) {
      console.error('Error fetching rooms:', err);
      return [];
    } finally {
      setLoadingRooms(false);
    }
  }, [fetchActiveTenant]);

  const fetchBuildings = React.useCallback(async () => {
    try {
      setLoadingBuildings(true);
      const snap = await getDocs(query(collection(db, 'buildings'), orderBy('name')));
      const list = snap.docs.map((d) => ({ id: d.id, name: d.data().name }));
      setBuildings(list);

      // Try selecting initial building or first building
      if (list.length > 0) {
        const found = list.find((b) => b.id === initialBuildingId) || list[0];
        setSelectedBuilding(found);
        fetchRooms(found.id);
      }
    } catch (err) {
      console.error('Error fetching buildings:', err);
    } finally {
      setLoadingBuildings(false);
    }
    // react-doctor-disable-next-line exhaustive-deps
  }, [initialBuildingId, fetchRooms]);

  React.useEffect(() => {
    fetchBuildings();
    // react-doctor-disable-next-line exhaustive-deps
  }, [fetchBuildings]);

  // ── Select Handlers ────────────────────────────────────────────────────────
  const handleSelectBuilding = (b: Building) => {
    setSelectedBuilding(b);
    setShowBuildingDropdown(false);
    fetchRooms(b.id);
  };

  const handleSelectRoom = (r: Room) => {
    setSelectedRoom(r);
    setShowRoomDropdown(false);
    if (r.price) {
      setRentAmount(r.price.toString());
    } else {
      setRentAmount('');
    }
    fetchActiveTenant(r.id);
  };

  // ── Save Invoice ───────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!selectedBuilding) {
      Alert.alert('Thông báo', 'Vui lòng chọn tòa nhà.');
      return;
    }
    if (!selectedRoom) {
      Alert.alert('Thông báo', 'Vui lòng chọn phòng.');
      return;
    }
    
    // Parse rent amount
    const parsedRent = Number(rentAmount.replace(/[^0-9]/g, '')) || 0;
    if (includeRent && parsedRent <= 0) {
      Alert.alert('Thông báo', 'Vui lòng nhập tiền phòng hợp lệ.');
      return;
    }

    try {
      setSaving(true);
      const uid = auth.currentUser?.uid;
      if (!uid) {
        Alert.alert('Lỗi', 'Phiên đăng nhập đã hết hạn.');
        setSaving(false);
        return;
      }

      // 1. Check for duplicate invoices
      const dupQuery = query(
        collection(db, 'invoices'),
        where('ownerId', '==', uid),
        where('roomId', '==', selectedRoom.id),
        where('month', '==', selectedMonth)
      );
      const dupSnap = await getDocs(dupQuery);
      if (!dupSnap.empty) {
        Alert.alert('Thông báo', `Phòng ${selectedRoom.code} đã có hóa đơn cho tháng ${selectedMonth} rồi.`);
        setSaving(false);
        return;
      }

      // 2. Fetch tenant count in room
      const tenantQuery = query(
        collection(db, 'tenants'),
        where('ownerId', '==', uid),
        where('roomId', '==', selectedRoom.id),
        where('status', '==', 'active')
      );
      const tenantSnap = await getDocs(tenantQuery);
      const tenantCount = Math.max(1, tenantSnap.size);

      // 3. Fetch active services for building
      const serviceQuery = query(
        collection(db, 'services'),
        where('ownerId', '==', uid)
      );
      const serviceSnap = await getDocs(serviceQuery);
      const allServices = serviceSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const buildingServices = allServices.filter((s: any) => s.buildingId === selectedBuilding.id || s.buildingId === 'all');

      // 4. Fetch utility readings for selectedMonth
      const period = selectedMonth.split('/').reverse().join('-');
      const readingId = `${selectedBuilding.id}_${selectedRoom.id}_${period}`;
      const readingSnap = await getDoc(doc(db, 'utilityReadings', readingId));

      if (includeMeter && !readingSnap.exists()) {
        Alert.alert(
          'Lỗi',
          `Chưa ghi chỉ số điện nước tháng ${selectedMonth} cho phòng ${selectedRoom.code}. Vui lòng ghi chỉ số trước khi lập hóa đơn!`
        );
        setSaving(false);
        return;
      }

      let rentCost = 0;
      let serviceCost = 0;
      let electricityCost = 0;
      let waterCost = 0;
      const lineItems: any[] = [];

      // Add rent if checked
      if (includeRent) {
        rentCost = parsedRent;
        lineItems.push({
          type: 'rent',
          name: 'Tiền phòng',
          quantity: 1,
          unitPrice: rentCost,
          amount: rentCost,
        });
      }

      // Add other services if checked
      if (includeService) {
        buildingServices.forEach((service: any) => {
          const sName = (service.name || '').toLowerCase();
          // Skip electricity/water metered services to avoid double charging
          if (includeMeter && (sName.includes('điện') || sName.includes('nước') || sName.includes('nuoc'))) {
            return;
          }
          if (service.calcMethod === 'Cố định') {
            const cost = Number(service.unitPrice) || 0;
            serviceCost += cost;
            lineItems.push({
              type: 'service',
              name: service.name,
              quantity: 1,
              unitPrice: cost,
              amount: cost,
            });
          } else if (service.calcMethod === 'Theo người') {
            const unitPrice = Number(service.unitPrice) || 0;
            const cost = unitPrice * tenantCount;
            serviceCost += cost;
            lineItems.push({
              type: 'service',
              name: `${service.name} (${tenantCount} người)`,
              quantity: tenantCount,
              unitPrice,
              amount: cost,
            });
          }
        });
      }

      // Add meter values if checked
      if (includeMeter && readingSnap.exists()) {
        const rData = readingSnap.data();
        
        // Electricity
        const electricUsage = Math.max(0, Number(rData.electricNew || 0) - Number(rData.electricOld || 0));
        const electricService = buildingServices.find((s: any) => (s.name || '').toLowerCase().includes('điện')) as any;
        const electricPrice = electricService ? Number(electricService.unitPrice) : 3500;
        electricityCost = electricUsage * electricPrice;
        lineItems.push({
          type: 'electricity',
          name: `Tiền điện (${rData.electricOld} -> ${rData.electricNew} kWh)`,
          quantity: electricUsage,
          unitPrice: electricPrice,
          amount: electricityCost,
        });

        // Water
        const waterService = buildingServices.find((s: any) => (s.name || '').toLowerCase().includes('nước') || (s.name || '').toLowerCase().includes('nuoc')) as any;
        if (waterService) {
          if (waterService.calcMethod === 'Theo chỉ số đồng hồ') {
            const waterUsage = Math.max(0, Number(rData.waterNew || 0) - Number(rData.waterOld || 0));
            const waterPrice = Number(waterService.unitPrice) || 15000;
            waterCost = waterUsage * waterPrice;
            lineItems.push({
              type: 'water',
              name: `Tiền nước (${rData.waterOld} -> ${rData.waterNew} m³)`,
              quantity: waterUsage,
              unitPrice: waterPrice,
              amount: waterCost,
            });
          } else if (waterService.calcMethod === 'Theo người') {
            const waterPrice = Number(waterService.unitPrice) || 50000;
            waterCost = tenantCount * waterPrice;
            lineItems.push({
              type: 'water',
              name: `Tiền nước (${tenantCount} người)`,
              quantity: tenantCount,
              unitPrice: waterPrice,
              amount: waterCost,
            });
          }
        } else {
          // Fallback if no water service configured
          const waterUsage = Math.max(0, Number(rData.waterNew || 0) - Number(rData.waterOld || 0));
          const waterPrice = 15000;
          waterCost = waterUsage * waterPrice;
          lineItems.push({
            type: 'water',
            name: `Tiền nước (${rData.waterOld} -> ${rData.waterNew} m³)`,
            quantity: waterUsage,
            unitPrice: waterPrice,
            amount: waterCost,
          });
        }
      }

      const totalAmount = rentCost + serviceCost + electricityCost + waterCost;

      // Calculate dueDate as 10th of chosen month
      const [mm, yyyy] = selectedMonth.split('/').map(Number);
      const dueDateObj = new Date(yyyy, mm - 1, 10);
      const dueDateTimestamp = Timestamp.fromDate(dueDateObj);

      const invoiceData = {
        buildingId: selectedBuilding.id,
        buildingName: selectedBuilding.name,
        roomId: selectedRoom.id,
        roomCode: selectedRoom.code,
        tenantName: activeTenant?.fullName || '',
        tenantId: activeTenant?.id || '',
        period,
        month: selectedMonth,
        type: includeRent ? 'Tiền phòng & Dịch vụ' : 'Dịch vụ & Điện nước',
        amount: totalAmount, // Stored as raw number
        rentAmount: rentCost,
        serviceAmount: serviceCost,
        electricityAmount: electricityCost,
        waterAmount: waterCost,
        includeRent,
        includeService,
        includeMeter,
        status: 'pending',
        lineItems,
        dueDate: dueDateTimestamp,
        createdAt: new Date(),
        createdBy: uid,
        ownerId: uid,
      };

      await addDoc(collection(db, 'invoices'), invoiceData);
      Alert.alert('Thành công', 'Tạo hóa đơn mới thành công!');
      navigation.goBack();
    } catch (err) {
      console.error('Error saving invoice:', err);
      Alert.alert('Lỗi', 'Không thể lưu hóa đơn mới.');
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
        <Text style={styles.headerTitle}>Tạo hoá đơn</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          {/* Tòa nhà selector */}
          <Text style={styles.label}>Tòa nhà *</Text>
          {loadingBuildings ? (
            <ActivityIndicator size="small" color={theme.colors.primary} style={{ alignSelf: 'flex-start', marginVertical: 12 }} />
          ) : (
            <View>
              <Pressable onPress={() => setShowBuildingDropdown(!showBuildingDropdown)} style={styles.dropdownButton}>
                <Text style={styles.dropdownButtonText}>{selectedBuilding?.name || 'Chọn tòa nhà'}</Text>
                <MaterialIcons name="keyboard-arrow-down" size={24} color="#a1a1aa" />
              </Pressable>
              {showBuildingDropdown && (
                <View style={styles.dropdown}>
                  {buildings.map((b) => (
                    <Pressable key={b.id} style={styles.dropdownItem} onPress={() => handleSelectBuilding(b)}>
                      <Text style={styles.dropdownItemText}>{b.name}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Phòng selector */}
          <Text style={[styles.label, { marginTop: 16 }]}>Phòng *</Text>
          {loadingRooms ? (
            <ActivityIndicator size="small" color={theme.colors.primary} style={{ alignSelf: 'flex-start', marginVertical: 12 }} />
          ) : !selectedBuilding ? (
            <View style={styles.disabledDropdown}>
              <Text style={styles.disabledDropdownText}>Vui lòng chọn tòa nhà trước</Text>
            </View>
          ) : (
            <View>
              <Pressable onPress={() => setShowRoomDropdown(!showRoomDropdown)} style={styles.dropdownButton}>
                <Text style={styles.dropdownButtonText}>{selectedRoom?.code || 'Chọn phòng'}</Text>
                <MaterialIcons name="keyboard-arrow-down" size={24} color="#a1a1aa" />
              </Pressable>
              {showRoomDropdown && (
                <View style={styles.dropdown}>
                  {rooms.length === 0 ? (
                    <Text style={styles.emptyDropdown}>Chưa có phòng nào trong nhà này</Text>
                  ) : (
                    rooms.map((r) => (
                      <Pressable key={r.id} style={styles.dropdownItem} onPress={() => handleSelectRoom(r)}>
                        <Text style={styles.dropdownItemText}>{r.code}</Text>
                      </Pressable>
                    ))
                  )}
                </View>
              )}
            </View>
          )}

          <View style={styles.divider} />

          {/* Hợp đồng/Khách thuê banner */}
          <Text style={styles.sectionHeaderLabel}>Khách thuê hiện tại</Text>
          {loadingTenant ? (
            <ActivityIndicator size="small" color={theme.colors.primary} style={{ alignSelf: 'flex-start' }} />
          ) : activeTenant ? (
            <View style={[styles.banner, { backgroundColor: '#e0f2fe', borderColor: '#bae6fd', borderWidth: 1 }]}>
              <Text style={[styles.bannerText, { color: '#0369a1', fontWeight: 'bold' }]}>
                👤 {activeTenant.fullName}
              </Text>
            </View>
          ) : (
            <View style={styles.banner}>
              <Text style={styles.bannerText}>Phòng này hiện đang trống (chưa có cư dân)</Text>
            </View>
          )}

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
                placeholder="Vd: 5500000"
                keyboardType="numeric"
                value={rentAmount}
                onChangeText={setRentAmount}
              />
              
              <Text style={[styles.inputLabel, { marginTop: 14 }]}>Thu tiền phòng từ ngày:</Text>
              <View style={styles.dateSelector}>
                <MaterialIcons name="calendar-today" size={18} color="#64748b" />
                <Text style={styles.dateSelectorText}>{parsedDates.start}</Text>
              </View>

              <Text style={[styles.inputLabel, { marginTop: 14 }]}>Đến ngày:</Text>
              <View style={styles.dateSelector}>
                <MaterialIcons name="calendar-today" size={18} color="#64748b" />
                <Text style={styles.dateSelectorText}>{parsedDates.end}</Text>
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
              <Text style={styles.bannerText}>Dịch vụ sẽ tự động đồng bộ theo phòng</Text>
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
                  {finalMonths.map((m) => (
                    <Pressable key={m} style={styles.dropdownItem} onPress={() => { setSelectedMonth(m); setShowMonthDropdown(false); }}>
                      <Text style={styles.dropdownItemText}>{m}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Save Button */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <MaterialIcons name="add" size={24} color={theme.colors.onPrimary} />
              <Text style={styles.saveBtnText}>Tạo hoá đơn</Text>
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
  disabledDropdown: {
    backgroundColor: '#f1f5f9',
    borderColor: theme.colors.outlineVariant,
    borderWidth: 1,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  disabledDropdownText: {
    ...theme.typography.bodyMd,
    color: '#94a3b8',
  },
  emptyDropdown: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

export default CreateInvoice;
