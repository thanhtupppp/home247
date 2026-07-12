import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  ActivityIndicator, Alert, RefreshControl
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { collection, getDocs, query, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

interface DeviceData {
  id: string;
  name: string;
  buildingId: string;
  buildingName: string;
  category: 'Gia dụng' | 'Phòng tắm' | 'Nội thất' | string;
  description: string;
}

export const DevicesList: React.FC = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [devices, setDevices] = React.useState<DeviceData[]>([]);
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({
    'Chưa gán tòa nhà': true
  });

  React.useEffect(() => {
    if (isFocused) {
      fetchDevices();
    }
  }, [isFocused]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(query(collection(db, 'devices')));
      const list: DeviceData[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          name: data.name || '',
          buildingId: data.buildingId || 'unassigned',
          buildingName: data.buildingName || 'Chưa gán tòa nhà',
          category: data.category || 'Gia dụng',
          description: data.description || '',
        });
      });
      setDevices(list);

      // Auto-expand groups that have items
      const initialExp: Record<string, boolean> = { 'Chưa gán tòa nhà': true };
      list.forEach((d) => {
        if (d.buildingName) {
          initialExp[d.buildingName] = true;
        }
      });
      setExpandedGroups((prev) => ({ ...prev, ...initialExp }));

    } catch (err) {
      console.error('Error fetching devices:', err);
      Alert.alert('Lỗi', 'Không thể tải danh sách trang thiết bị.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDevices();
    setRefreshing(false);
  };

  const handleDelete = (device: DeviceData) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa thiết bị "${device.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'devices', device.id));
              Alert.alert('Thành công', 'Đã xóa thiết bị.');
              fetchDevices();
            } catch (err) {
              console.error('Error deleting device:', err);
              Alert.alert('Lỗi', 'Không thể xóa thiết bị.');
            }
          }
        }
      ]
    );
  };

  const toggleGroup = (name: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  // Group devices: Building -> Category -> Device[]
  const groupedDevices = React.useMemo(() => {
    const groups: Record<string, Record<string, DeviceData[]>> = {};

    // Ensure 'Chưa gán tòa nhà' group always exists
    groups['Chưa gán tòa nhà'] = {
      'Gia dụng': [],
      'Phòng tắm': [],
      'Nội thất': [],
    };

    devices.forEach((d) => {
      const bName = d.buildingName || 'Chưa gán tòa nhà';
      const cat = d.category || 'Gia dụng';

      if (!groups[bName]) {
        groups[bName] = {
          'Gia dụng': [],
          'Phòng tắm': [],
          'Nội thất': [],
        };
      }
      if (!groups[bName][cat]) {
        groups[bName][cat] = [];
      }
      groups[bName][cat].push(d);
    });

    return groups;
  }, [devices]);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Đang tải trang thiết bị...</Text>
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
        <View style={styles.headerTitleContainer}>
          <View style={styles.headerIconContainer}>
            <MaterialIcons name="router" size={20} color={theme.colors.primary} />
          </View>
          <View style={styles.titleTextWrapper}>
            <Text style={styles.headerTitle}>Trang thiết bị</Text>
            <Text style={styles.headerSubtitle}>Quản lý tài sản và thiết bị tòa nhà</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
        }
      >
        {Object.keys(groupedDevices).map((buildingName) => {
          const categories = groupedDevices[buildingName];
          const totalCount = Object.values(categories).reduce((sum, list) => sum + list.length, 0);

          // Only render building groups that are either 'Chưa gán tòa nhà' or have at least 1 device
          if (buildingName !== 'Chưa gán tòa nhà' && totalCount === 0) return null;

          const isExpanded = !!expandedGroups[buildingName];

          return (
            <View key={buildingName} style={[styles.accordionCard, isExpanded && styles.accordionCardExpanded]}>
              <Pressable onPress={() => toggleGroup(buildingName)} style={styles.accordionHeader}>
                <View style={styles.accordionHeaderLeft}>
                  <View style={styles.buildingIconContainer}>
                    <MaterialIcons name={(buildingName === 'Chưa gán tòa nhà' ? "help-outline" : "apartment") as any} size={20} color={theme.colors.primary} />
                  </View>
                  <View>
                    <Text style={groupNameStyle(isExpanded)}>{buildingName}</Text>
                    <Text style={styles.groupSubtitle}>{totalCount} thiết bị</Text>
                  </View>
                </View>
                <MaterialIcons 
                  name={(isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down") as any} 
                  size={24} 
                  color={isExpanded ? theme.colors.primary : "#a1a1aa"} 
                  style={styles.chevron}
                />
              </Pressable>

              {isExpanded && (
                <View style={styles.accordionContent}>
                  {totalCount === 0 ? (
                    <Text style={styles.emptyGroupText}>Chưa có thiết bị nào trong nhóm này.</Text>
                  ) : (
                    Object.keys(categories).map((catName) => {
                      const list = categories[catName];
                      if (list.length === 0) return null;

                      let catIcon = 'kitchen';
                      let catColor = theme.colors.primary;
                      if (catName === 'Phòng tắm') {
                        catIcon = 'water-drop';
                        catColor = '#06b6d4';
                      } else if (catName === 'Nội thất') {
                        catIcon = 'chair';
                        catColor = '#b45309';
                      }

                      return (
                        <View key={catName} style={styles.categoryBlock}>
                          <View style={styles.categoryHeader}>
                            <View style={styles.categoryHeaderLeft}>
                              <MaterialIcons name={catIcon as any} size={16} color={catColor} />
                              <Text style={[styles.categoryTitle, { color: catColor }]}>{catName}</Text>
                            </View>
                            <Text style={styles.categoryCount}>{list.length}</Text>
                          </View>

                          {list.map((device) => (
                            <View key={device.id} style={styles.deviceItemCard}>
                              <View style={styles.deviceItemLeft}>
                                <Text style={styles.deviceName}>{device.name}</Text>
                                <Text style={styles.deviceDesc}>{device.description || 'Không có mô tả'}</Text>
                              </View>
                              
                              <View style={styles.actionButtons}>
                                <Pressable style={styles.actionBtn} onPress={() => navigation.navigate('thiet-bi/them', { deviceId: device.id })}>
                                  <MaterialIcons name="edit" size={18} color="#64748b" />
                                </Pressable>
                                <Pressable style={styles.actionBtn} onPress={() => handleDelete(device)}>
                                  <MaterialIcons name="delete-outline" size={18} color="#ef4444" />
                                </Pressable>
                              </View>
                            </View>
                          ))}
                        </View>
                      );
                    })
                  )}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.bottomContainer}>
        <Pressable 
          style={styles.addDeviceButton}
          onPress={() => navigation.navigate('thiet-bi/them')}
        >
          <MaterialIcons name="add" size={22} color="#fff" />
          <Text style={styles.addDeviceButtonText}>Thêm thiết bị</Text>
        </Pressable>
      </View>
    </View>
  );
};

const groupNameStyle = (isExpanded: boolean) => {
  return [
    styles.groupName,
    isExpanded && { color: theme.colors.primary }
  ];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginRight: 8,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleTextWrapper: {
    gap: 2,
  },
  headerTitle: {
    ...theme.typography.titleLg,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  scrollContent: {
    padding: theme.spacing.marginMobile,
    gap: 16,
    paddingBottom: 100,
  },
  accordionCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    overflow: 'hidden',
  },
  accordionCardExpanded: {
    borderColor: '#bce0fd',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  accordionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buildingIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupName: {
    ...theme.typography.bodyLg,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  groupSubtitle: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  chevron: {
    padding: 4,
  },
  accordionContent: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  categoryBlock: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  categoryCount: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  emptyGroupText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    paddingVertical: 12,
  },
  deviceItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: theme.colors.surfaceContainerLowest,
    marginBottom: 10,
  },
  deviceItemLeft: {
    gap: 4,
    flex: 1,
    marginRight: 12,
  },
  deviceName: {
    ...theme.typography.bodyMd,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  deviceDesc: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    padding: 6,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  addDeviceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  addDeviceButtonText: {
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

export default DevicesList;
