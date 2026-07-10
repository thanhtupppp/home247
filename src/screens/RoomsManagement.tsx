import React from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import TopAppBar from '../components/TopAppBar';
import { mockRooms } from '../data/mockData';
import { theme } from '../theme';

export interface RoomsManagementProps {
  readonly className?: string;
}

export const RoomsManagement: React.FC<RoomsManagementProps> = () => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <TopAppBar />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Page Title */}
        <View style={styles.titleSection}>
          <View>
            <Text style={styles.subtitle}>TRANG QUẢN TRỊ</Text>
            <Text style={styles.title}>Quản lý Phòng</Text>
          </View>
          <Pressable 
            style={styles.actionBtn}
            onPress={() => navigation.navigate('dien-nuoc')}
            accessibilityRole="button"
            accessibilityLabel="Record electric and water metrics"
          >
            <MaterialIcons name="bolt" size={16} color={theme.colors.onPrimary} />
            <Text style={styles.actionBtnText}>Ghi Điện & Nước</Text>
          </Pressable>
        </View>

        {/* Room Grid / List */}
        <View style={styles.listContainer}>
          {mockRooms.map((room) => (
            <View key={room.id} style={styles.roomCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.roomCode}>{room.code}</Text>
                <View 
                  style={[
                    styles.statusBadge,
                    room.status === 'occupied' 
                      ? styles.occupiedBadge 
                      : room.status === 'empty' 
                        ? styles.emptyBadge 
                        : styles.maintenanceBadge
                  ]}
                >
                  <Text 
                    style={[
                      styles.statusText,
                      room.status === 'occupied' 
                        ? styles.occupiedText 
                        : room.status === 'empty' 
                          ? styles.emptyText 
                          : styles.maintenanceText
                    ]}
                  >
                    {room.status === 'occupied' ? 'Đã thuê' : room.status === 'empty' ? 'Còn trống' : 'Bảo trì'}
                  </Text>
                </View>
              </View>

              <View style={styles.cardDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Loại phòng:</Text>
                  <Text style={styles.detailValue}>{room.type}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Diện tích:</Text>
                  <Text style={styles.detailValue}>{room.area}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Giá thuê:</Text>
                  <Text style={styles.priceValue}>{room.price}/tháng</Text>
                </View>
                {room.tenant && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Khách thuê:</Text>
                    <Text style={styles.detailValue}>{room.tenant}</Text>
                  </View>
                )}
              </View>

              <View style={styles.cardActions}>
                <Pressable 
                  style={styles.detailBtn}
                  onPress={() => navigation.navigate('phong/id', { id: room.code.replace('.', '_') })}
                  accessibilityRole="button"
                  accessibilityLabel={`View details for ${room.code}`}
                >
                  <Text style={styles.detailBtnText}>Chi tiết</Text>
                </Pressable>
                {room.status === 'empty' && (
                  <Pressable 
                    style={styles.contractBtn}
                    onPress={() => navigation.navigate('hop-dong/moi')}
                    accessibilityRole="button"
                    accessibilityLabel={`Create contract for ${room.code}`}
                  >
                    <Text style={styles.contractBtnText}>Tạo hợp đồng</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: theme.spacing.marginMobile,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  subtitle: {
    ...theme.typography.labelMd,
    color: theme.colors.onSurfaceVariant,
    letterSpacing: 1.2,
  },
  title: {
    ...theme.typography.headlineLgMobile,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
    marginTop: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  actionBtnText: {
    ...theme.typography.labelMd,
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: theme.spacing.marginMobile,
    gap: 16,
  },
  roomCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    padding: 16,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  roomCode: {
    ...theme.typography.titleLg,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  occupiedBadge: {
    backgroundColor: '#d1fae5',
  },
  occupiedText: {
    color: '#065f46',
  },
  emptyBadge: {
    backgroundColor: '#dbeafe',
  },
  emptyText: {
    color: '#1e40af',
  },
  maintenanceBadge: {
    backgroundColor: '#fef3c7',
  },
  maintenanceText: {
    color: '#92400e',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardDetails: {
    gap: 8,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceContainer,
    paddingBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurfaceVariant,
  },
  detailValue: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurface,
    fontWeight: '500',
  },
  priceValue: {
    ...theme.typography.bodyMd,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  detailBtn: {
    flex: 1,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailBtnText: {
    ...theme.typography.labelMd,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  contractBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contractBtnText: {
    ...theme.typography.labelMd,
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
  },
});

export default RoomsManagement;
