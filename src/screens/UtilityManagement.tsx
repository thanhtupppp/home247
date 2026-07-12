import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';

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

const MONTHS = generateMonthsList();

export const UtilityManagement: React.FC = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const [selectedMonth, setSelectedMonth] = React.useState(MONTHS[MONTHS.length - 1]);
  const [selectedBuilding, setSelectedBuilding] = React.useState('');
  const [showBuildingDropdown, setShowBuildingDropdown] = React.useState(false);
  const [recordedRooms, setRecordedRooms] = React.useState<string[]>([]);
  const [buildings, setBuildings] = React.useState<any[]>([]);
  const [rooms, setRooms] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const loadRecordedRooms = React.useCallback(async () => {
    try {
      setLoading(true);
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      
      // 1. Fetch buildings
      const bSnapshot = await getDocs(query(collection(db, 'buildings'), where('ownerId', '==', uid)));
      const bList: any[] = [];
      bSnapshot.forEach((doc) => {
        bList.push({ id: doc.id, ...doc.data() });
      });
      setBuildings(bList);

      // Default selected building if not set or not in list
      let currentBuilding = selectedBuilding;
      if (bList.length > 0) {
        const exists = bList.some(b => b.name === selectedBuilding);
        if (!exists) {
          setSelectedBuilding(bList[0].name);
          currentBuilding = bList[0].name;
        }
      }

      // 2. Fetch rooms for this building
      let rList: any[] = [];
      if (currentBuilding) {
        const rQuery = query(
          collection(db, 'rooms'),
          where('ownerId', '==', uid),
          where('buildingName', '==', currentBuilding)
        );
        const rSnapshot = await getDocs(rQuery);
        rSnapshot.forEach((doc) => {
          rList.push({ id: doc.id, ...doc.data() });
        });
        rList.sort((a, b) => a.code.localeCompare(b.code));
      }
      setRooms(rList);

      // 3. Fetch utilityReadings (recorded status)
      if (currentBuilding) {
        const buildingObj = bList.find((b) => b.name === currentBuilding);
        const buildingId = buildingObj ? buildingObj.id : 'unknown';

        const q = query(
          collection(db, 'utilityReadings'),
          where('ownerId', '==', uid),
          where('buildingId', '==', buildingId),
          where('month', '==', selectedMonth)
        );
        const querySnapshot = await getDocs(q);
        const recorded: string[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.roomCode && data.isRecorded) {
            recorded.push(data.roomCode);
          }
        });
        setRecordedRooms(recorded);
      }
    } catch (error) {
      console.error('Error loading dynamic utility management data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedBuilding, selectedMonth]);

  React.useEffect(() => {
    if (isFocused) {
      loadRecordedRooms();
    }
  }, [isFocused, loadRecordedRooms]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Điện nước</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Months Selector */}
      <View style={styles.monthsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthsScroll}>
          {MONTHS.map((month) => {
            const isActive = selectedMonth === month;
            return (
              <Pressable key={month} onPress={() => setSelectedMonth(month)} style={styles.monthItem}>
                <Text style={[styles.monthText, isActive && styles.monthTextActive]}>
                  {month}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Building Selector Card */}
      <View style={styles.content}>
        <Pressable onPress={() => setShowBuildingDropdown(!showBuildingDropdown)} style={styles.selectorCard}>
          <View style={styles.selectorLeft}>
            <MaterialIcons name="apartment" size={20} color={theme.colors.primary} />
            <Text style={styles.buildingName}>{selectedBuilding}</Text>
          </View>
          <View style={styles.selectorRight}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{String(rooms.length)}</Text>
            </View>
            <MaterialIcons name="keyboard-arrow-down" size={24} color={theme.colors.primary} />
          </View>
        </Pressable>

        {showBuildingDropdown && (
          <View style={styles.dropdown}>
            {buildings.map((b) => (
              <Pressable
                key={b.id}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedBuilding(b.name);
                  setShowBuildingDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{b.name}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Progress List */}
        <Text style={styles.sectionTitle}>Tiến độ tháng này</Text>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <ScrollView style={styles.roomsList} showsVerticalScrollIndicator={false}>
            {rooms.length === 0 ? (
              <Text style={{ textAlign: 'center', color: '#94a3b8', marginTop: 24 }}>Tòa nhà này chưa có căn hộ/phòng nào.</Text>
            ) : (
              rooms.map((room) => {
                const isRecorded = recordedRooms.includes(room.code);
                return (
                  <Pressable 
                    key={room.id} 
                    style={styles.roomItem}
                    onPress={() => navigation.navigate('dien-nuoc/ghi', { building: selectedBuilding, room: room.code, month: selectedMonth })}
                  >
                    <View style={styles.roomLeft}>
                      <View style={[styles.statusDot, { backgroundColor: isRecorded ? '#10b981' : '#a1a1aa' }]} />
                      <Text style={styles.roomCode}>{room.code}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: isRecorded ? '#e6f4ea' : '#f1f5f9' }]}>
                      <Text style={[styles.statusBadgeText, { color: isRecorded ? '#137333' : '#475569' }]}>
                        {isRecorded ? 'Đã ghi' : 'Chưa ghi'}
                      </Text>
                    </View>
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        )}
      </View>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <Pressable 
          style={styles.actionBtn}
          onPress={() => navigation.navigate('dien-nuoc/ghi', { building: selectedBuilding, month: selectedMonth })}
        >
          <MaterialIcons name="add" size={24} color={theme.colors.onPrimary} />
          <Text style={styles.actionBtnText}>Ghi điện nước</Text>
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
  monthsContainer: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  monthsScroll: {
    paddingHorizontal: theme.spacing.marginMobile,
    gap: 24,
  },
  monthItem: {
    paddingVertical: 4,
  },
  monthText: {
    ...theme.typography.bodyLg,
    color: theme.colors.onSurfaceVariant,
  },
  monthTextActive: {
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: theme.spacing.marginMobile,
    zIndex: 1,
  },
  selectorCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    borderWidth: 1,
    borderColor: '#bce0fd',
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buildingName: {
    ...theme.typography.bodyMd,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  selectorRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: '#dbeafe',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  dropdown: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.xl,
    marginTop: 8,
    overflow: 'hidden',
    boxShadow: [{
      offsetX: 0,
      offsetY: 4,
      blurRadius: 8,
      color: 'rgba(0,0,0,0.05)'
    }],
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
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 14,
    gap: 8,
  },
  actionBtnText: {
    ...theme.typography.bodyLg,
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
  },
  sectionTitle: {
    ...theme.typography.titleLg,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
  },
  roomsList: {
    flex: 1,
    marginTop: 8,
  },
  roomItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    boxShadow: [{
      offsetX: 0,
      offsetY: 2,
      blurRadius: 4,
      color: 'rgba(0, 0, 0, 0.02)'
    }],
  },
  roomLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  roomCode: {
    ...theme.typography.bodyMd,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.lg,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default UtilityManagement;
