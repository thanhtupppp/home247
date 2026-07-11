import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Switch } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { mockRooms } from '../data/mockData';

export const UtilityRecording: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const initialBuilding = route.params?.building || 'nơ trang long';

  const [activeTab, setActiveTab] = React.useState<'room' | 'bulk'>('room');
  const [selectedBuilding, setSelectedBuilding] = React.useState(initialBuilding);
  const [selectedRoom, setSelectedRoom] = React.useState('');
  const [showBuildingDropdown, setShowBuildingDropdown] = React.useState(false);
  const [showRoomDropdown, setShowRoomDropdown] = React.useState(false);

  // States for recording data
  const [singleElectricNew, setSingleElectricNew] = React.useState('');
  const [singleWaterNew, setSingleWaterNew] = React.useState('');

  // Bulk rooms state (simulating rooms P.101, P.102, P.201, P.202)
  const [bulkRooms, setBulkRooms] = React.useState([
    { id: '1', code: 'Phòng p1', enabled: true, electricOld: 0, electricNew: '' },
    { id: '2', code: 'Phòng p2', enabled: false, electricOld: 124, electricNew: '' },
    { id: '3', code: 'Phòng p3', enabled: true, electricOld: 256, electricNew: '' },
  ]);

  const buildings = ['nơ trang long', 'Home247 Landmark', 'Home247 Riverside'];
  const rooms = mockRooms.map(r => r.code);

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
                {buildings.map((b) => (
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
                      <TextInput style={styles.textInputRead} value="1245" editable={false} />
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
                      <TextInput style={styles.textInputRead} value="342" editable={false} />
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
                {buildings.map((b) => (
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
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Save Button */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.saveBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="save" size={24} color={theme.colors.onPrimary} />
          <Text style={styles.saveBtnText}>Ghi điện nước</Text>
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
