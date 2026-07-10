import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import TopAppBar from '../components/TopAppBar';
import { mockBuildings, mockDevices, mockContracts, mockTenants } from '../data/mockData';
import { theme } from '../theme';

export interface GenericScreenProps {
  readonly title: string;
  readonly type: 'building' | 'device' | 'contract' | 'tenant' | 'utility' | 'pricing' | 'settings' | 'stats' | 'general';
  readonly description?: string;
}

export const GenericScreen: React.FC<GenericScreenProps> = ({ title, type, description }) => {
  const navigation = useNavigation();
  const [toggle1, setToggle1] = React.useState(true);
  const [toggle2, setToggle2] = React.useState(true);
  const [toggle3, setToggle3] = React.useState(false);

  return (
    <View style={styles.container}>
      <TopAppBar />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Pressable 
            onPress={() => navigation.goBack()} 
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <MaterialIcons name="arrow-back" size={20} color={theme.colors.onSurface} />
          </Pressable>
          <View>
            <Text style={styles.subtitle}>CHI TIẾT</Text>
            <Text style={styles.title}>{title}</Text>
          </View>
        </View>

        {description && (
          <View style={styles.descCard}>
            <Text style={styles.descText}>{description}</Text>
          </View>
        )}

        {/* Dynamic content rendering based on type */}
        <View style={styles.contentCard}>
          {type === 'building' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Danh sách tòa nhà quản lý</Text>
              <View style={styles.list}>
                {mockBuildings.map(b => (
                  <View key={b.id} style={styles.itemCard}>
                    <Text style={styles.itemTitle}>{b.name}</Text>
                    <Text style={styles.itemDesc}>{b.address}</Text>
                    <View style={styles.itemMeta}>
                      <Text style={styles.metaText}>{b.floorsCount} Tầng</Text>
                      <Text style={styles.metaText}>•</Text>
                      <Text style={styles.metaText}>{b.roomsCount} Phòng</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {type === 'device' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Danh sách thiết bị & tài sản</Text>
              <View style={styles.list}>
                {mockDevices.map(d => (
                  <View key={d.id} style={styles.deviceRow}>
                    <View>
                      <Text style={styles.deviceName}>{d.name}</Text>
                      <Text style={styles.deviceRoom}>Phòng: {d.roomCode}</Text>
                    </View>
                    <View style={styles.deviceStatusCol}>
                      <View style={[styles.statusBadge, d.status === 'normal' ? styles.successBadge : styles.errorBadge]}>
                        <Text style={[styles.statusText, d.status === 'normal' ? styles.successText : styles.errorText]}>
                          {d.status === 'normal' ? 'Tốt' : 'Hỏng'}
                        </Text>
                      </View>
                      <Text style={styles.deviceCheckDate}>{d.lastCheck}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {type === 'contract' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Danh sách hợp đồng thuê nhà</Text>
              <View style={styles.list}>
                {mockContracts.map(c => (
                  <View key={c.id} style={styles.itemCard}>
                    <View style={styles.cardHeaderRow}>
                      <Text style={styles.itemTitle}>Phòng {c.roomCode}</Text>
                      <View style={[styles.statusBadge, c.status === 'active' ? styles.successBadge : styles.errorBadge]}>
                        <Text style={[styles.statusText, c.status === 'active' ? styles.successText : styles.errorText]}>
                          {c.status === 'active' ? 'Đang hiệu lực' : 'Hết hạn'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.gridData}>
                      <Text style={styles.gridLabel}>Khách thuê: <Text style={styles.gridValue}>{c.tenantName}</Text></Text>
                      <Text style={styles.gridLabel}>Tiền cọc: <Text style={styles.gridValue}>{c.deposit}</Text></Text>
                      <Text style={styles.gridLabel}>Từ ngày: <Text style={styles.gridValue}>{c.startDate}</Text></Text>
                      <Text style={styles.gridLabel}>Đến ngày: <Text style={styles.gridValue}>{c.endDate}</Text></Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {type === 'tenant' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quản lý Khách thuê & Cư dân</Text>
              <View style={styles.list}>
                {mockTenants.map(t => (
                  <View key={t.id} style={styles.itemCard}>
                    <Text style={styles.itemTitle}>{t.name}</Text>
                    <Text style={styles.gridLabel}>CCCD: <Text style={styles.gridValue}>{t.cccd}</Text></Text>
                    <Text style={styles.gridLabel}>SĐT: <Text style={styles.gridValue}>{t.phone}</Text></Text>
                    <Text style={styles.gridLabel}>Email: <Text style={styles.gridValue}>{t.email}</Text></Text>
                    <View style={styles.cardHeaderRow}>
                      <Text style={styles.roomCodeText}>Phòng: {t.roomCode}</Text>
                      <View style={styles.successBadge}>
                        <Text style={styles.successText}>Tạm trú</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {type === 'utility' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ghi chỉ số Điện & Nước</Text>
              <Text style={styles.deviceRoom}>Nhập các chỉ số tiêu thụ điện, nước định kỳ hàng tháng cho từng phòng để tự động tính toán hóa đơn.</Text>
              
              <View style={styles.utilityGrid}>
                <View style={styles.utilityBox}>
                  <Text style={styles.deviceName}>Chỉ số Điện</Text>
                  <Text style={styles.deviceCheckDate}>Đơn giá: 3.500 đ/kWh</Text>
                  <TextInput 
                    keyboardType="numeric" 
                    placeholder="Nhập số điện mới..." 
                    style={styles.textInput} 
                  />
                </View>
                <View style={styles.utilityBox}>
                  <Text style={styles.deviceName}>Chỉ số Nước</Text>
                  <Text style={styles.deviceCheckDate}>Đơn giá: 15.000 đ/m³</Text>
                  <TextInput 
                    keyboardType="numeric" 
                    placeholder="Nhập số nước mới..." 
                    style={styles.textInput} 
                  />
                </View>
              </View>

              <Pressable style={styles.submitBtn} accessibilityRole="button" accessibilityLabel="Save metrics">
                <Text style={styles.submitBtnText}>Lưu chỉ số</Text>
              </Pressable>
            </View>
          )}

          {type === 'pricing' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bảng giá Dịch vụ & Phí định kỳ</Text>
              <View style={styles.list}>
                <View style={styles.priceRow}>
                  <Text style={styles.deviceName}>Tiền điện</Text>
                  <Text style={styles.itemTitle}>3,500đ / kWh</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.deviceName}>Tiền nước</Text>
                  <Text style={styles.itemTitle}>15,000đ / m³</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.deviceName}>Phí dịch vụ chung (vệ sinh, rác)</Text>
                  <Text style={styles.itemTitle}>100,000đ / tháng</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.deviceName}>Phí Internet / Wifi</Text>
                  <Text style={styles.itemTitle}>100,000đ / tháng</Text>
                </View>
              </View>
            </View>
          )}

          {type === 'settings' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cấu hình hệ thống</Text>
              <View style={styles.settingsList}>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Tự động gửi thông báo hóa đơn qua Zalo/Email cho khách thuê</Text>
                  <Switch value={toggle1} onValueChange={setToggle1} trackColor={{ true: theme.colors.primary }} />
                </View>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Cảnh báo quá hạn thanh toán sau 3 ngày</Text>
                  <Switch value={toggle2} onValueChange={setToggle2} trackColor={{ true: theme.colors.primary }} />
                </View>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Cho phép khách thuê thanh toán tự động qua cổng VNPAY</Text>
                  <Switch value={toggle3} onValueChange={setToggle3} trackColor={{ true: theme.colors.primary }} />
                </View>
              </View>
            </View>
          )}

          {(type === 'general' || type === 'stats') && (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="auto-awesome" size={64} color={theme.colors.primary} style={{ opacity: 0.5 }} />
              <Text style={styles.emptyText}>Màn hình đang được kết nối dữ liệu</Text>
              <Text style={styles.deviceCheckDate}>Giao diện thiết kế của trang này đã được đồng bộ hóa thành công từ Stitch.</Text>
            </View>
          )}
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
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.marginMobile,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    gap: 16,
  },
  backBtn: {
    padding: 8,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surfaceContainerLowest,
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
  },
  descCard: {
    marginHorizontal: theme.spacing.marginMobile,
    backgroundColor: '#004ac608',
    borderWidth: 1,
    borderColor: '#004ac615',
    padding: 12,
    borderRadius: theme.borderRadius.lg,
    marginBottom: 16,
  },
  descText: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 18,
  },
  contentCard: {
    marginHorizontal: theme.spacing.marginMobile,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    padding: 16,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    ...theme.typography.titleLg,
    color: theme.colors.primary,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceContainer,
    paddingBottom: 8,
    marginBottom: 8,
  },
  list: {
    gap: 12,
  },
  itemCard: {
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surfaceContainerLow,
    gap: 6,
  },
  itemTitle: {
    ...theme.typography.bodyLg,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  itemDesc: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurfaceVariant,
  },
  itemMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  metaText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  deviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceContainer,
  },
  deviceName: {
    ...theme.typography.bodyLg,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  deviceRoom: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurfaceVariant,
  },
  deviceStatusCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  deviceCheckDate: {
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  roomCodeText: {
    ...theme.typography.bodyMd,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  successBadge: {
    backgroundColor: '#d1fae5',
  },
  successText: {
    color: '#065f46',
    fontSize: 9,
    fontWeight: 'bold',
  },
  errorBadge: {
    backgroundColor: '#fee2e2',
  },
  errorText: {
    color: '#991b1b',
    fontSize: 9,
    fontWeight: 'bold',
  },
  gridData: {
    gap: 4,
    marginTop: 4,
  },
  gridLabel: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  gridValue: {
    color: theme.colors.onSurface,
    fontWeight: '500',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  utilityGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  utilityBox: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surfaceContainerLow,
    gap: 6,
  },
  textInput: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.default,
    paddingHorizontal: 8,
    paddingVertical: 6,
    ...theme.typography.bodyMd,
  },
  submitBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  submitBtnText: {
    ...theme.typography.labelMd,
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.lg,
  },
  settingsList: {
    gap: 16,
    marginTop: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  settingLabel: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurface,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  emptyText: {
    ...theme.typography.bodyLg,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginTop: 8,
  },
});

export default GenericScreen;
