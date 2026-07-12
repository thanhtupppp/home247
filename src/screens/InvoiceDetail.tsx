import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  ActivityIndicator, Share, Alert
} from 'react-native';
import { Image } from 'expo-image';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

interface LineItem {
  type: string;
  name: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface Invoice {
  id: string;
  roomCode: string;
  roomId: string;
  buildingId: string;
  buildingName: string;
  tenantName: string;
  tenantId: string;
  type: string;
  amount: number;
  status: 'success' | 'pending' | 'overdue';
  month: string;
  dueDate: any;
  createdAt: any;
  lineItems?: LineItem[];
}

interface BankAccount {
  bankName: string;
  bankCode: string;
  bin: string;
  logo: string;
  accountNumber: string;
  branch: string;
  ownerName: string;
}

function removeVietnameseTones(str: string) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|tilde|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  return str;
}

export const InvoiceDetail: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const invoiceId = route.params?.id;

  const [invoice, setInvoice] = React.useState<Invoice | null>(null);
  const [bankAccount, setBankAccount] = React.useState<BankAccount | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [updating, setUpdating] = React.useState(false);

  React.useEffect(() => {
    const fetchInvoiceAndBank = async () => {
      try {
        setLoading(true);
        if (!invoiceId) return;

        // 1. Get invoice details
        const invoiceRef = doc(db, 'invoices', invoiceId);
        const invoiceSnap = await getDoc(invoiceRef);
        if (!invoiceSnap.exists()) {
          Alert.alert('Lỗi', 'Không tìm thấy hóa đơn này.');
          navigation.goBack();
          return;
        }

        const invData = { id: invoiceSnap.id, ...invoiceSnap.data() } as Invoice;
        setInvoice(invData);

        // 2. Get landlord bank account configuration
        const landlordId = (invoiceSnap.data() as any).ownerId || auth.currentUser?.uid;
        if (landlordId) {
          const adminRef = doc(db, 'admins', landlordId);
          const adminSnap = await getDoc(adminRef);
          if (adminSnap.exists() && adminSnap.data()?.bankAccount) {
            setBankAccount(adminSnap.data()?.bankAccount as BankAccount);
          }
        }
      } catch (err) {
        console.error('Error fetching invoice/bank:', err);
        Alert.alert('Lỗi', 'Không thể tải chi tiết hóa đơn.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceAndBank();
  }, [invoiceId, navigation]);

  const handleMarkAsPaid = async () => {
    if (!invoice) return;
    try {
      setUpdating(true);
      const invoiceRef = doc(db, 'invoices', invoice.id);
      await updateDoc(invoiceRef, { status: 'success' });
      setInvoice(prev => prev ? { ...prev, status: 'success' } : null);
      Alert.alert('Thành công', 'Đã đánh dấu hóa đơn đã thanh toán thành công!');
    } catch (err) {
      console.error('Error updating invoice status:', err);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái hóa đơn.');
    } finally {
      setUpdating(false);
    }
  };

  const handleShare = async () => {
    if (!invoice) return;
    try {
      let message = `[Home247] Gửi bạn thông tin hóa đơn thanh toán tiền phòng ${invoice.roomCode} - Tháng ${invoice.month}:\n`;
      message += `--------------------------------------\n`;

      if (invoice.lineItems && invoice.lineItems.length > 0) {
        invoice.lineItems.forEach(item => {
          const itemAmount = (item.amount || 0).toLocaleString('vi-VN');
          if (item.type === 'electricity' || item.type === 'water') {
            message += `- ${item.name}: ${itemAmount} đ\n`;
          } else {
            message += `- ${item.name}: ${itemAmount} đ\n`;
          }
        });
      } else {
        message += `- Tổng tiền thanh toán: ${invoice.amount.toLocaleString('vi-VN')} đ\n`;
      }

      message += `--------------------------------------\n`;
      message += `Tổng cộng số tiền: ${invoice.amount.toLocaleString('vi-VN')} đ\n`;

      if (bankAccount) {
        const rawMemo = `Thanh toan phong ${invoice.roomCode} thang ${invoice.month.replace('/', '-')}`;
        const cleanMemo = removeVietnameseTones(rawMemo);
        const qrUrl = `https://img.vietqr.io/image/${bankAccount.bin}-${bankAccount.accountNumber}-compact2.png?amount=${invoice.amount}&addInfo=${encodeURIComponent(cleanMemo)}&accountName=${encodeURIComponent(bankAccount.ownerName)}`;
        
        message += `Chuyển khoản theo số tài khoản:\n`;
        message += `- Số tài khoản: ${bankAccount.accountNumber}\n`;
        message += `- Ngân hàng: ${bankAccount.bankName} (${bankAccount.bankCode})\n`;
        message += `- Chủ tài khoản: ${bankAccount.ownerName}\n`;
        message += `- Nội dung CK: ${cleanMemo}\n`;
        message += `Hoặc quét mã QR thanh toán nhanh tại đây:\n${qrUrl}\n`;
      } else {
        message += `Vui lòng liên hệ chủ nhà để biết thông tin số tài khoản thanh toán.\n`;
      }

      await Share.share({
        message,
        title: `Hóa đơn phòng ${invoice.roomCode}`,
      });
    } catch (err: any) {
      console.error('Error sharing invoice:', err);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Đang tải chi tiết hóa đơn...</Text>
      </View>
    );
  }

  if (!invoice) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Không thể tìm thấy hóa đơn.</Text>
      </View>
    );
  }

  // Generate VietQR URL
  let vietQRUrl = '';
  let cleanMemo = '';
  if (bankAccount) {
    const rawMemo = `Thanh toan phong ${invoice.roomCode} thang ${invoice.month.replace('/', '-')}`;
    cleanMemo = removeVietnameseTones(rawMemo);
    vietQRUrl = `https://img.vietqr.io/image/${bankAccount.bin}-${bankAccount.accountNumber}-compact2.png?amount=${invoice.amount}&addInfo=${encodeURIComponent(cleanMemo)}&accountName=${encodeURIComponent(bankAccount.ownerName)}`;
  }

  // Format Due Date
  let dueDateStr = 'Không xác định';
  if (invoice.dueDate) {
    const dateObj = invoice.dueDate.toDate ? invoice.dueDate.toDate() : new Date(invoice.dueDate);
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const yyyy = dateObj.getFullYear();
    dueDateStr = `${dd}/${mm}/${yyyy}`;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Chi tiết hóa đơn</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Info Card */}
        <View style={styles.invoiceMainCard}>
          <View style={styles.roomBuildingRow}>
            <View style={styles.roomBadge}>
              <Text style={styles.roomBadgeText}>Phòng {invoice.roomCode}</Text>
            </View>
            <Text style={styles.buildingNameText}>{invoice.buildingName}</Text>
          </View>

          <Text style={styles.monthLabelText}>Hóa đơn tháng {invoice.month}</Text>
          <Text style={styles.totalAmountText}>{invoice.amount.toLocaleString('vi-VN')} đ</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>Khách thuê</Text>
              <Text style={styles.metaValue}>{invoice.tenantName || 'Trống'}</Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>Hạn thanh toán</Text>
              <Text style={styles.metaValue}>{dueDateStr}</Text>
            </View>
            <View style={styles.metaColAlignRight}>
              <Text style={styles.metaLabel}>Trạng thái</Text>
              <View style={[
                styles.statusBadge,
                invoice.status === 'success' ? styles.successBadge : styles.overdueBadge
              ]}>
                <Text style={[
                  styles.statusBadgeText,
                  invoice.status === 'success' ? styles.successText : styles.overdueText
                ]}>
                  {invoice.status === 'success' ? 'Đã thu tiền' : 'Chưa thanh toán'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Billing items details */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Chi tiết dịch vụ</Text>
          {invoice.lineItems && invoice.lineItems.length > 0 ? (
            <View style={styles.itemsTable}>
              {invoice.lineItems.map((item) => (
                <View key={item.name} style={styles.itemRow}>
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    {item.quantity > 1 && (
                      <Text style={styles.itemSubtext}>
                        {item.quantity} x {item.unitPrice.toLocaleString('vi-VN')} đ
                      </Text>
                    )}
                  </View>
                  <Text style={styles.itemSubtotal}>
                    {(item.amount || 0).toLocaleString('vi-VN')} đ
                  </Text>
                </View>
              ))}
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tổng cộng</Text>
                <Text style={styles.totalValue}>{invoice.amount.toLocaleString('vi-VN')} đ</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.noItemsText}>Không có chi tiết hạng mục dịch vụ.</Text>
          )}
        </View>

        {/* Payment VietQR Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Thanh toán qua mã QR (VietQR)</Text>
          {bankAccount ? (
            <View style={styles.qrContainer}>
              <View style={styles.bankInfoCard}>
                {bankAccount.logo ? (
                  <Image source={{ uri: bankAccount.logo }} style={styles.bankLogo} />
                ) : (
                  <View style={styles.bankLogoPlaceholder}>
                    <MaterialIcons name="account-balance" size={24} color={theme.colors.primary} />
                  </View>
                )}
                <View style={styles.bankDetails}>
                  <Text style={styles.bankName}>{bankAccount.bankName} ({bankAccount.bankCode})</Text>
                  <Text style={styles.bankAccountNo}>STK: {bankAccount.accountNumber}</Text>
                  <Text style={styles.bankOwnerName}>Chủ TK: {bankAccount.ownerName}</Text>
                  <Text style={styles.bankMemo}>Nội dung CK: {cleanMemo}</Text>
                </View>
              </View>

              <View style={styles.qrImageWrapper}>
                <Image source={{ uri: vietQRUrl }} style={styles.qrCodeImage} resizeMode="contain" />
              </View>
              <Text style={styles.qrInstruction}>
                Quét mã QR bằng bất kỳ ứng dụng ngân hàng di động nào của bạn để tự động điền số tiền và nội dung chuyển khoản.
              </Text>
            </View>
          ) : (
            <View style={styles.noBankWarning}>
              <MaterialIcons name="warning" size={32} color="#f59e0b" style={{ marginBottom: 8 }} />
              <Text style={styles.warningText}>Bạn chưa liên kết tài khoản ngân hàng để nhận thanh toán.</Text>
              <Pressable
                style={styles.setupBankButton}
                onPress={() => navigation.navigate('cai-dat/ngan-hang')}
              >
                <MaterialIcons name="settings" size={18} color={theme.colors.onPrimary} style={{ marginRight: 6 }} />
                <Text style={styles.setupBankText}>Thiết lập ngân hàng ngay</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <Pressable onPress={handleShare} style={styles.shareBtn}>
          <MaterialIcons name="share" size={20} color={theme.colors.primary} />
          <Text style={styles.shareBtnText}>Gửi hóa đơn</Text>
        </Pressable>

        {invoice.status !== 'success' && (
          <Pressable 
            onPress={handleMarkAsPaid} 
            disabled={updating}
            style={[styles.payBtn, updating && { opacity: 0.7 }]}
          >
            {updating ? (
              <ActivityIndicator size="small" color={theme.colors.onPrimary} />
            ) : (
              <>
                <MaterialIcons name="check-circle" size={20} color={theme.colors.onPrimary} />
                <Text style={styles.payBtnText}>Đánh dấu đã thu</Text>
              </>
            )}
          </Pressable>
        )}
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
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.titleLg.fontSize,
    lineHeight: theme.typography.titleLg.lineHeight,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: theme.spacing.marginMobile,
    gap: 16,
    paddingBottom: 100,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: theme.typography.bodyMd.fontSize,
    lineHeight: theme.typography.bodyMd.lineHeight,
    color: theme.colors.onSurfaceVariant,
  },
  errorText: {
    fontSize: theme.typography.bodyLg.fontSize,
    lineHeight: theme.typography.bodyLg.lineHeight,
    color: theme.colors.error,
  },
  invoiceMainCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  roomBuildingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  roomBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  roomBadgeText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: theme.typography.bodyMd.fontSize,
    lineHeight: theme.typography.bodyMd.lineHeight,
  },
  buildingNameText: {
    fontSize: theme.typography.bodyMd.fontSize,
    lineHeight: theme.typography.bodyMd.lineHeight,
    color: theme.colors.onSurfaceVariant,
    fontWeight: '500',
  },
  monthLabelText: {
    fontSize: theme.typography.bodyMd.fontSize,
    lineHeight: theme.typography.bodyMd.lineHeight,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 4,
  },
  totalAmountText: {
    fontSize: theme.typography.headlineLg.fontSize,
    lineHeight: theme.typography.headlineLg.lineHeight,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
    paddingTop: 16,
  },
  metaCol: {
    flex: 1,
  },
  metaColAlignRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  metaLabel: {
    fontSize: theme.typography.labelMd.fontSize,
    lineHeight: theme.typography.labelMd.lineHeight,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: theme.typography.bodyMd.fontSize,
    lineHeight: theme.typography.bodyMd.lineHeight,
    color: theme.colors.onSurface,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.default,
  },
  successBadge: {
    backgroundColor: '#dcfce7',
  },
  overdueBadge: {
    backgroundColor: '#fee2e2',
  },
  statusBadgeText: {
    fontSize: theme.typography.labelMd.fontSize,
    lineHeight: theme.typography.labelMd.lineHeight,
    fontWeight: 'bold',
  },
  successText: {
    color: '#15803d',
  },
  overdueText: {
    color: '#b91c1c',
  },
  sectionCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  sectionTitle: {
    fontSize: theme.typography.titleLg.fontSize,
    lineHeight: theme.typography.titleLg.lineHeight,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  itemsTable: {
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLeft: {
    flex: 1,
  },
  itemName: {
    fontSize: theme.typography.bodyMd.fontSize,
    lineHeight: theme.typography.bodyMd.lineHeight,
    color: theme.colors.onSurface,
    fontWeight: '500',
  },
  itemSubtext: {
    fontSize: theme.typography.labelMd.fontSize,
    lineHeight: theme.typography.labelMd.lineHeight,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  itemSubtotal: {
    fontSize: theme.typography.bodyMd.fontSize,
    lineHeight: theme.typography.bodyMd.lineHeight,
    color: theme.colors.onSurface,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.outlineVariant,
    marginVertical: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: theme.typography.titleLg.fontSize,
    lineHeight: theme.typography.titleLg.lineHeight,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: theme.typography.titleLg.fontSize,
    lineHeight: theme.typography.titleLg.lineHeight,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  noItemsText: {
    fontSize: theme.typography.bodyMd.fontSize,
    lineHeight: theme.typography.bodyMd.lineHeight,
    color: theme.colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  qrContainer: {
    alignItems: 'center',
    gap: 16,
  },
  bankInfoCard: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    width: '100%',
    gap: 12,
  },
  bankLogo: {
    width: 60,
    height: 36,
    resizeMode: 'contain',
  },
  bankLogoPlaceholder: {
    width: 60,
    height: 36,
    backgroundColor: '#f1f5f9',
    borderRadius: theme.borderRadius.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankDetails: {
    flex: 1,
    gap: 2,
  },
  bankName: {
    fontSize: theme.typography.bodyMd.fontSize,
    lineHeight: theme.typography.bodyMd.lineHeight,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  bankAccountNo: {
    fontSize: theme.typography.bodyMd.fontSize,
    lineHeight: theme.typography.bodyMd.lineHeight,
    color: theme.colors.onSurfaceVariant,
    fontWeight: '500',
  },
  bankOwnerName: {
    fontSize: theme.typography.labelMd.fontSize,
    lineHeight: theme.typography.labelMd.lineHeight,
    color: theme.colors.onSurfaceVariant,
  },
  bankMemo: {
    fontSize: theme.typography.labelMd.fontSize,
    lineHeight: theme.typography.labelMd.lineHeight,
    color: theme.colors.primary,
    fontWeight: '500',
    marginTop: 4,
  },
  qrImageWrapper: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  qrCodeImage: {
    width: 200,
    height: 200,
  },
  qrInstruction: {
    fontSize: theme.typography.labelMd.fontSize,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 18,
  },
  noBankWarning: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  warningText: {
    fontSize: theme.typography.bodyMd.fontSize,
    lineHeight: theme.typography.bodyMd.lineHeight,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 16,
  },
  setupBankButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.full,
  },
  setupBankText: {
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
    fontSize: theme.typography.bodyMd.fontSize,
    lineHeight: theme.typography.bodyMd.lineHeight,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
    paddingHorizontal: theme.spacing.marginMobile,
    paddingVertical: 14,
    gap: 12,
    alignItems: 'center',
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  shareBtnText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: theme.typography.bodyMd.fontSize,
    lineHeight: theme.typography.bodyMd.lineHeight,
  },
  payBtn: {
    flex: 1.2,
    flexDirection: 'row',
    height: 48,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  payBtnText: {
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
    fontSize: theme.typography.bodyMd.fontSize,
    lineHeight: theme.typography.bodyMd.lineHeight,
  },
});

export default InvoiceDetail;
