import React from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import TopAppBar from '../components/TopAppBar';
import { theme } from '../theme';

export interface SupportRequestsProps {
  readonly className?: string;
}

export const SupportRequests: React.FC<SupportRequestsProps> = () => {
  return (
    <View style={styles.container}>
      <TopAppBar />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Page Title */}
        <View style={styles.titleSection}>
          <View>
            <Text style={styles.subtitle}>TRANG QUẢN TRỊ</Text>
            <Text style={styles.title}>Yêu cầu hỗ trợ</Text>
          </View>
        </View>

        {/* Support Request list */}
        <View style={styles.listContainer}>
          <View style={styles.requestCard}>
            <View style={styles.cardHeader}>
              <View style={styles.badgeRow}>
                <View style={styles.emergencyBadge}>
                  <Text style={styles.emergencyText}>SỰ CỐ KHẨN CẤP</Text>
                </View>
                <Text style={styles.roomCode}>Phòng 305</Text>
              </View>
            </View>
            <Text style={styles.requestTitle}>Mất điện đột ngột khu vực bếp</Text>
            <Text style={styles.requestDesc}>
              Khách hàng phản hồi: Ổ cắm điện góc bếp đột ngột mất điện khi đang cắm nồi cơm, các thiết bị khác trong phòng vẫn hoạt động bình thường.
            </Text>
            <View style={styles.cardActions}>
              <Pressable 
                style={styles.primaryActionBtn}
                accessibilityRole="button"
                accessibilityLabel="Dispatch electrician"
              >
                <Text style={styles.primaryActionText}>Điều thợ sửa</Text>
              </Pressable>
              <Pressable 
                style={styles.secondaryActionBtn}
                accessibilityRole="button"
                accessibilityLabel="Close request"
              >
                <Text style={styles.secondaryActionText}>Đóng yêu cầu</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.requestCard}>
            <View style={styles.cardHeader}>
              <View style={styles.badgeRow}>
                <View style={styles.warningBadge}>
                  <Text style={styles.warningText}>CẦN GIẢI QUYẾT</Text>
                </View>
                <Text style={styles.roomCode}>Phòng 102</Text>
              </View>
            </View>
            <Text style={styles.requestTitle}>Đề nghị sửa vòi hoa sen rỉ nước</Text>
            <Text style={styles.requestDesc}>
              Khách hàng phản hồi: Vòi hoa sen trong phòng tắm bị rỉ nước liên tục gây thất thoát nước và ẩm ướt phòng vệ sinh.
            </Text>
            <View style={styles.cardActions}>
              <Pressable 
                style={styles.primaryActionBtn}
                accessibilityRole="button"
                accessibilityLabel="Mark resolved"
              >
                <Text style={styles.primaryActionText}>Đã xử lý</Text>
              </Pressable>
              <Pressable 
                style={styles.secondaryActionBtn}
                accessibilityRole="button"
                accessibilityLabel="Ignore request"
              >
                <Text style={styles.secondaryActionText}>Bỏ qua</Text>
              </Pressable>
            </View>
          </View>
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
  listContainer: {
    paddingHorizontal: theme.spacing.marginMobile,
    gap: 16,
  },
  requestCard: {
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
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emergencyBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  emergencyText: {
    color: '#991b1b',
    fontSize: 9,
    fontWeight: 'bold',
  },
  warningBadge: {
    backgroundColor: '#fff7ed',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  warningText: {
    color: '#9a3412',
    fontSize: 9,
    fontWeight: 'bold',
  },
  roomCode: {
    ...theme.typography.bodyMd,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  requestTitle: {
    ...theme.typography.titleLg,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  requestDesc: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: 16,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryActionBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    ...theme.typography.labelMd,
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
  },
  secondaryActionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionText: {
    ...theme.typography.labelMd,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
});

export default SupportRequests;
