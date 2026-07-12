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

interface ServiceData {
  id: string;
  name: string;
  buildingId: string;
  buildingName: string;
  calcMethod: string;
  unit: string;
  unitPrice: number;
}

export const ServicesList: React.FC = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [services, setServices] = React.useState<ServiceData[]>([]);
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({
    'Khác': true
  });

  React.useEffect(() => {
    if (isFocused) {
      fetchServices();
    }
  }, [isFocused]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(query(collection(db, 'services')));
      const list: ServiceData[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          name: data.name || '',
          buildingId: data.buildingId || 'all',
          buildingName: data.buildingName || 'Khác',
          calcMethod: data.calcMethod || 'Cố định',
          unit: data.unit || 'tháng',
          unitPrice: Number(data.unitPrice) || 0,
        });
      });
      setServices(list);

      // Auto-expand groups that have items
      const initialExp: Record<string, boolean> = { 'Khác': true };
      list.forEach((s) => {
        if (s.buildingName) {
          initialExp[s.buildingName] = true;
        }
      });
      setExpandedGroups((prev) => ({ ...prev, ...initialExp }));

    } catch (err) {
      console.error('Error fetching services:', err);
      Alert.alert('Lỗi', 'Không thể tải danh sách dịch vụ.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchServices();
    setRefreshing(false);
  };

  const handleDelete = (service: ServiceData) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa dịch vụ "${service.name}" của tòa nhà "${service.buildingName}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'services', service.id));
              Alert.alert('Thành công', 'Đã xóa dịch vụ.');
              fetchServices();
            } catch (err) {
              console.error('Error deleting service:', err);
              Alert.alert('Lỗi', 'Không thể xóa cấu hình dịch vụ.');
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

  // Grouping services by buildingName
  const groupedServices = React.useMemo(() => {
    const groups: Record<string, ServiceData[]> = {};
    
    // Ensure 'Khác' always exists as a group
    groups['Khác'] = [];

    services.forEach((s) => {
      const gName = s.buildingName || 'Khác';
      if (!groups[gName]) {
        groups[gName] = [];
      }
      groups[gName].push(s);
    });

    return groups;
  }, [services]);

  if (loading && !refreshing) {
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
        <View style={styles.headerTitleContainer}>
          <View style={styles.headerIconContainer}>
            <MaterialIcons name="room-service" size={20} color={theme.colors.primary} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Cấu hình Dịch vụ</Text>
            <Text style={styles.headerSubtitle}>Bảng giá dịch vụ cố định và chỉ số</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
        }
      >
        {Object.keys(groupedServices).map((groupName) => {
          const groupList = groupedServices[groupName];
          if (groupName !== 'Khác' && groupList.length === 0) return null;

          const isExpanded = !!expandedGroups[groupName];
          return (
            <View key={groupName} style={[styles.accordionCard, isExpanded && styles.accordionCardExpanded]}>
              <Pressable onPress={() => toggleGroup(groupName)} style={styles.accordionHeader}>
                <View style={styles.accordionHeaderLeft}>
                  <View style={styles.buildingIconContainer}>
                    <MaterialIcons name={groupName === 'Khác' ? "dns" : "apartment"} size={20} color={theme.colors.primary} />
                  </View>
                  <View>
                    <Text style={groupNameStyle(isExpanded)}>{groupName}</Text>
                    <Text style={styles.groupSubtitle}>{groupList.length} dịch vụ</Text>
                  </View>
                </View>
                <MaterialIcons 
                  name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                  size={24} 
                  color={isExpanded ? theme.colors.primary : "#a1a1aa"} 
                  style={styles.chevron}
                />
              </Pressable>

              {isExpanded && (
                <View style={styles.accordionContent}>
                  {groupList.length === 0 ? (
                    <Text style={styles.emptyGroupText}>Chưa có dịch vụ nào được cấu hình.</Text>
                  ) : (
                    groupList.map((service) => {
                      const methodColor = service.calcMethod === 'Theo chỉ số đồng hồ' ? '#3b82f6' : service.calcMethod === 'Theo người' ? '#f59e0b' : '#10b981';
                      return (
                        <View key={service.id} style={styles.serviceItemCard}>
                          <View style={styles.serviceItemLeft}>
                            <Text style={styles.serviceName}>{service.name}</Text>
                            <View style={styles.serviceMetaRow}>
                              <Text style={[styles.methodBadge, { color: methodColor }]}>{service.calcMethod}</Text>
                              <Text style={styles.servicePrice}>
                                • {Number(service.unitPrice).toLocaleString('vi-VN')} đ / {service.unit}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.actionButtons}>
                            <Pressable style={styles.editButton} onPress={() => navigation.navigate('cau-hinh-gia/them', { serviceId: service.id })}>
                              <MaterialIcons name="edit" size={20} color="#64748b" />
                            </Pressable>
                            <Pressable style={styles.deleteButton} onPress={() => handleDelete(service)}>
                              <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
                            </Pressable>
                          </View>
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
          style={styles.addServiceButton}
          onPress={() => navigation.navigate('cau-hinh-gia/them')}
        >
          <MaterialIcons name="add" size={22} color="#fff" />
          <Text style={styles.addServiceButtonText}>Thêm dịch vụ</Text>
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
  headerTitle: {
    ...theme.typography.titleLg,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
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
  emptyGroupText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    paddingVertical: 12,
  },
  serviceItemCard: {
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
  serviceItemLeft: {
    gap: 4,
    flex: 1,
  },
  serviceName: {
    ...theme.typography.bodyMd,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  serviceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  methodBadge: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  servicePrice: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editButton: {
    padding: 8,
    marginRight: 4,
  },
  deleteButton: {
    padding: 8,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  addServiceButton: {
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
  addServiceButtonText: {
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

export default ServicesList;
