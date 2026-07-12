import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  ActivityIndicator, Alert, Share
} from 'react-native';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { doc, getDoc, getDocs, collection, query, where, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

interface ContractData {
  id: string;
  tenantName: string;
  phoneNumber: string;
  addressNote: string;
  buildingId: string;
  buildingName: string;
  roomId: string;
  roomCode: string;
  startDate: string;
  endDate: string;
  rentPrice: number;
  depositPrice: number;
  cycle: string;
  collectionDay: number;
  paidUntilDate: string;
  status: 'active' | 'expired' | 'pending';
}

interface TenantData {
  fullName: string;
  phoneNumber: string;
  dob?: string;
  cccd?: string;
  province?: string;
  ward?: string;
  detailAddress?: string;
  gender?: string;
}

interface RoomData {
  floor?: number;
  area?: string;
  type?: string;
}

export const ContractDetail: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isFocused = useIsFocused();
  const { contractId } = route.params || {};

  const [contract, setContract] = React.useState<ContractData | null>(null);
  const [tenant, setTenant] = React.useState<TenantData | null>(null);
  const [room, setRoom] = React.useState<RoomData | null>(null);
  const [admin, setAdmin] = React.useState<any>(null);
  const [devices, setDevices] = React.useState<any[]>([]);

  const [loading, setLoading] = React.useState(true);
  const [generatingPdf, setGeneratingPdf] = React.useState(false);
  const [updatingStatus, setUpdatingStatus] = React.useState(false);

  React.useEffect(() => {
    if (isFocused && contractId) {
      fetchContractDetail();
    }
  }, [isFocused, contractId]);

  const fetchContractDetail = async () => {
    try {
      setLoading(true);

      // 1. Fetch Contract Document
      const cSnap = await getDoc(doc(db, 'contracts', contractId));
      if (!cSnap.exists()) {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin hợp đồng.');
        navigation.goBack();
        return;
      }
      const cData = { id: cSnap.id, ...cSnap.data() } as ContractData;
      setContract(cData);

      // 2. Fetch Tenant Document
      const tSnap = await getDocs(
        query(collection(db, 'tenants'), where('contractId', '==', contractId))
      );
      if (!tSnap.empty) {
        setTenant(tSnap.docs[0].data() as TenantData);
      } else {
        // Fallback: search by phone number
        const tSnapPhone = await getDocs(
          query(collection(db, 'tenants'), where('phoneNumber', '==', cData.phoneNumber))
        );
        if (!tSnapPhone.empty) {
          setTenant(tSnapPhone.docs[0].data() as TenantData);
        }
      }

      // 3. Fetch Room Document
      if (cData.roomId) {
        const rSnap = await getDoc(doc(db, 'rooms', cData.roomId));
        if (rSnap.exists()) {
          setRoom(rSnap.data() as RoomData);
        }
      }

      // 4. Fetch Devices for this room/building
      if (cData.buildingId) {
        const dSnap = await getDocs(
          query(collection(db, 'devices'), where('buildingId', '==', cData.buildingId))
        );
        const dList = dSnap.docs.map(doc => doc.data());
        setDevices(dList);
      }

      // 5. Fetch Admin Profile (Bên A)
      const uid = auth.currentUser?.uid;
      if (uid) {
        const aSnap = await getDoc(doc(db, 'admins', uid));
        if (aSnap.exists()) {
          setAdmin(aSnap.data());
        }
      }

    } catch (err) {
      console.error('Error loading contract details:', err);
      Alert.alert('Lỗi', 'Không thể tải chi tiết hợp đồng.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: 'active' | 'expired' | 'pending') => {
    if (!contract) return;
    try {
      setUpdatingStatus(true);
      await updateDoc(doc(db, 'contracts', contractId), { status: newStatus });
      setContract(prev => prev ? { ...prev, status: newStatus } : null);
      Alert.alert('Thành công', 'Đã cập nhật trạng thái hợp đồng.');
    } catch (err) {
      console.error('Error updating contract status:', err);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const generatePDFContract = async () => {
    if (!contract) return;

    try {
      setGeneratingPdf(true);

      const ngayKy = contract.startDate ? contract.startDate.split('/') : ['', '', ''];
      const benAName = admin?.name || 'Nguyễn Văn Admin';
      const benAPhone = admin?.phone || '0901234567';
      const benADob = admin?.dob || '........................';
      const benACccd = admin?.cccd || '079090001234';
      const benAAddress = admin?.city || '123 Đường Số 1, Phường 2, Quận 3, TP. Hồ Chí Minh';
      const benABankAccount = admin?.bankAccount?.accountNumber || '1903456789999';
      const benABankName = admin?.bankAccount?.bankName || 'Techcombank';

      const benBName = tenant?.fullName || contract.tenantName;
      const benBPhone = tenant?.phoneNumber || contract.phoneNumber;
      const benBCccd = tenant?.cccd || '........................';
      const benBDob = tenant?.dob || '........................';
      const benBAddress = [tenant?.detailAddress, tenant?.ward, tenant?.province].filter(Boolean).join(', ') || contract.addressNote || '........................';

      const roomsSpecTableRows = devices.length > 0
        ? devices.map((d, index) => `
            <tr>
              <td style="text-align: center; border: 1px solid black; padding: 6px;">${index + 1}</td>
              <td style="border: 1px solid black; padding: 6px;">${d.name}</td>
              <td style="text-align: center; border: 1px solid black; padding: 6px;">1</td>
              <td style="border: 1px solid black; padding: 6px;">Hoạt động tốt</td>
              <td style="border: 1px solid black; padding: 6px;">${d.description || ''}</td>
            </tr>
          `).join('')
        : `
            <tr>
              <td style="text-align: center; border: 1px solid black; padding: 6px;">1</td>
              <td style="border: 1px solid black; padding: 6px;">Giường ngủ</td>
              <td style="text-align: center; border: 1px solid black; padding: 6px;">1</td>
              <td style="border: 1px solid black; padding: 6px;">Mới</td>
              <td style="border: 1px solid black; padding: 6px;">Tiêu chuẩn</td>
            </tr>
            <tr>
              <td style="text-align: center; border: 1px solid black; padding: 6px;">2</td>
              <td style="border: 1px solid black; padding: 6px;">Máy lạnh</td>
              <td style="text-align: center; border: 1px solid black; padding: 6px;">1</td>
              <td style="border: 1px solid black; padding: 6px;">Hoạt động tốt</td>
              <td style="border: 1px solid black; padding: 6px;">Ghi rõ hãng</td>
            </tr>
          `;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Times New Roman', Times, serif; font-size: 14px; line-height: 1.5; color: black; margin: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .national-title { font-weight: bold; font-size: 16px; margin: 0; }
            .national-subtitle { font-size: 13px; margin: 0; margin-top: 4px; }
            .document-title { font-weight: bold; font-size: 18px; text-align: center; margin-top: 25px; margin-bottom: 20px; }
            .section-title { font-weight: bold; margin-top: 15px; margin-bottom: 5px; text-transform: uppercase; }
            .bold { font-weight: bold; }
            .table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            .sign-section { display: flex; justify-content: space-between; margin-top: 40px; padding: 0 40px; }
            .sign-box { text-align: center; width: 45%; }
            .sign-space { height: 80px; }
          </style>
        </head>
        <body>
          <div class="header">
            <p class="national-title">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
            <p class="national-subtitle">Độc lập - Tự do - Hạnh phúc</p>
            <p style="margin: 0; margin-top: 8px;">-----------------------------------</p>
          </div>

          <h2 class="document-title">HỢP ĐỒNG THUÊ PHÒNG TRỌ</h2>
          <p style="text-align: center; margin-top: -15px; font-style: italic;">Số: ……/HĐTPT</p>

          <p>Hôm nay, ngày ${ngayKy[0] || '……'} tháng ${ngayKy[1] || '……'} năm ${ngayKy[2] || '……'}, tại ${contract.buildingName || '…………………………'}, các bên gồm:</p>

           <p class="section-title">Bên cho thuê (Bên A)</p>
          <table style="width: 100%;">
            <tr><td style="width: 180px;"><span class="bold">Họ và tên:</span></td><td>${benAName}</td></tr>
            <tr><td><span class="bold">Ngày sinh:</span></td><td>${benADob}</td></tr>
            <tr><td><span class="bold">Số điện thoại:</span></td><td>${benAPhone}</td></tr>
            <tr><td><span class="bold">CCCD/CMND số:</span></td><td>${benACccd}</td></tr>
            <tr><td><span class="bold">Địa chỉ thường trú:</span></td><td>${benAAddress}</td></tr>
            <tr><td><span class="bold">Tài khoản ngân hàng:</span></td><td>${benABankAccount} (${benABankName})</td></tr>
          </table>

          <p class="section-title" style="margin-top: 15px;">Bên thuê (Bên B)</p>
          <table style="width: 100%;">
            <tr><td style="width: 180px;"><span class="bold">Họ và tên:</span></td><td>${benBName}</td></tr>
            <tr><td><span class="bold">Ngày sinh:</span></td><td>${benBDob}</td></tr>
            <tr><td><span class="bold">CCCD/CMND số:</span></td><td>${benBCccd}</td></tr>
            <tr><td><span class="bold">Địa chỉ thường trú:</span></td><td>${benBAddress}</td></tr>
            <tr><td><span class="bold">Số điện thoại:</span></td><td>${benBPhone}</td></tr>
          </table>

          <p>Hai bên tự nguyện thỏa thuận ký hợp đồng thuê phòng trọ với các điều khoản sau:</p>

          <p><span class="bold">Điều 1. Đối tượng thuê</span></p>
          <p>Bên A đồng ý cho Bên B thuê phòng trọ tại địa chỉ: <span class="bold">${contract.buildingName || '……………………………………………'}</span></p>
          <p>Thông tin phòng thuê: Số phòng: <span class="bold">${contract.roomCode || '……'}</span> • Diện tích sàn chính: <span class="bold">${room?.area || '……m²'}</span></p>
          <p>Mục đích thuê: để ở, không sử dụng làm kho chứa hàng, kinh doanh trái phép, sản xuất gây cháy nổ hoặc mục đích khác trái pháp luật.</p>

          <p><span class="bold">Điều 2. Trang thiết bị và nội thất bàn giao</span></p>
          <p>Các tài sản bàn giao kèm theo phòng gồm:</p>
          <table class="table" style="border: 1px solid black;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid black; padding: 6px;">STT</th>
                <th style="border: 1px solid black; padding: 6px;">Hạng mục</th>
                <th style="border: 1px solid black; padding: 6px;">Số lượng</th>
                <th style="border: 1px solid black; padding: 6px;">Tình trạng bàn giao</th>
                <th style="border: 1px solid black; padding: 6px;">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              ${roomsSpecTableRows}
            </tbody>
          </table>

          <p><span class="bold">Điều 3. Thời hạn thuê</span></p>
          <p>Thời hạn thuê: từ ngày <span class="bold">${contract.startDate}</span> đến hết ngày <span class="bold">${contract.endDate}</span></p>

          <p><span class="bold">Điều 4. Giá thuê, tiền cọc và phương thức thanh toán</span></p>
          <p>- Giá thuê phòng: <span class="bold">${Number(contract.rentPrice).toLocaleString('vi-VN')} đồng/tháng</span>.</p>
          <p>- Tiền đặt cọc: <span class="bold">${Number(contract.depositPrice).toLocaleString('vi-VN')} đồng</span>.</p>
          <p>- Thời điểm thanh toán: chậm nhất vào ngày <span class="bold">${contract.collectionDay}</span> hàng tháng.</p>
          <p>- Chu kỳ thanh toán: <span class="bold">${contract.cycle}</span>.</p>

          <p><span class="bold">Điều 5. Điện, nước và các chi phí sử dụng</span></p>
          <p>- Điện và nước tính theo chỉ số sử dụng thực tế của đồng hồ, đơn giá dịch vụ đã được ghi nhận trong nội quy nhà trọ.</p>

          <p><span class="bold">Điều 6 - Điều 14. Quy định chung và Nghĩa vụ</span></p>
          <p>Hai bên có trách nhiệm tuân thủ đầy đủ luật pháp Việt Nam về trật tự cư trú, phòng cháy chữa cháy và thanh toán chi phí phát sinh đầy đủ, đúng hạn như thỏa thuận.</p>

          <p><span class="bold">Điều 15. Hiệu lực hợp đồng</span></p>
          <p>Hợp đồng có hiệu lực kể từ ngày ${contract.startDate}. Hợp đồng được lập thành 02 bản, mỗi bên giữ 01 bản có giá trị pháp lý ngang nhau.</p>

          <div class="sign-section">
            <div class="sign-box">
              <span class="bold">BÊN CHO THUÊ (BÊN A)</span>
              <p style="font-size: 11px; font-style: italic; margin: 0;">(Ký, ghi rõ họ tên)</p>
              <div class="sign-space"></div>
              <p class="bold">${benAName}</p>
            </div>
            <div class="sign-box">
              <span class="bold">BÊN THUÊ (BÊN B)</span>
              <p style="font-size: 11px; font-style: italic; margin: 0;">(Ký, ghi rõ họ tên)</p>
              <div class="sign-space"></div>
              <p class="bold">${benBName}</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const printResult = await Print.printToFileAsync({
        html: htmlContent,
        base64: true
      });
      
      if (!printResult.base64) {
        throw new Error('Không thể xuất dữ liệu PDF.');
      }
      
      const safeRoomCode = contract.roomCode.replace(/[^a-zA-Z0-9]/g, '_');
      const cleanFileName = `Hop_Dong_Thue_Phong_${safeRoomCode}.pdf`;
      const cachedUri = `${FileSystem.cacheDirectory}${cleanFileName}`;
      
      await FileSystem.writeAsStringAsync(cachedUri, printResult.base64, {
        encoding: FileSystem.EncodingType.Base64
      });

      await Sharing.shareAsync(cachedUri, {
        mimeType: 'application/pdf',
        dialogTitle: `Hợp đồng thuê phòng ${contract.roomCode}`,
        UTI: 'com.adobe.pdf'
      });
      
      Alert.alert('Thành công', 'Đã tạo và chia sẻ tệp PDF hợp đồng thành công!');
    } catch (err) {
      console.error('Error generating PDF:', err);
      Alert.alert('Lỗi', 'Không thể tạo file PDF hợp đồng.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Đang tải chi tiết hợp đồng...</Text>
      </View>
    );
  }

  if (!contract) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Chi tiết Hợp đồng</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Core status card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.roomCode}>Phòng {contract.roomCode}</Text>
              <Text style={styles.buildingName}>{contract.buildingName}</Text>
            </View>
            <View style={[
              styles.statusBadge,
              contract.status === 'active' ? styles.activeBadge : contract.status === 'expired' ? styles.expiredBadge : styles.pendingBadge
            ]}>
              <Text style={[
                styles.statusText,
                contract.status === 'active' ? styles.activeText : contract.status === 'expired' ? styles.expiredText : styles.pendingText
              ]}>
                {contract.status === 'active' ? 'Đang hiệu lực' : contract.status === 'expired' ? 'Hết hạn' : 'Chờ duyệt'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.gridData}>
            <View style={styles.dataRow}>
              <Text style={styles.label}>Ngày ký kết:</Text>
              <Text style={styles.value}>{contract.startDate}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.label}>Ngày hết hạn:</Text>
              <Text style={styles.value}>{contract.endDate}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.label}>Tiền thuê phòng:</Text>
              <Text style={[styles.value, { color: theme.colors.primary, fontWeight: 'bold' }]}>
                {Number(contract.rentPrice).toLocaleString('vi-VN')} đ/tháng
              </Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.label}>Tiền đặt cọc:</Text>
              <Text style={styles.value}>{Number(contract.depositPrice).toLocaleString('vi-VN')} đ</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.label}>Chu kỳ thanh toán:</Text>
              <Text style={styles.value}>{contract.cycle}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.label}>Ngày chốt tiền hàng tháng:</Text>
              <Text style={styles.value}>Ngày {contract.collectionDay} hàng tháng</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.label}>Đã trả đến hết ngày:</Text>
              <Text style={styles.value}>{contract.paidUntilDate}</Text>
            </View>
          </View>
        </View>

        {/* Section 2: Thông tin khách thuê */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Thông tin khách thuê (Bên B)</Text>
          <View style={styles.gridData}>
            <View style={styles.dataRow}>
              <Text style={styles.label}>Họ và tên:</Text>
              <Text style={styles.value}>{contract.tenantName}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.label}>Số điện thoại:</Text>
              <Text style={styles.value}>{contract.phoneNumber}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.label}>Ngày sinh:</Text>
              <Text style={styles.value}>{tenant?.dob || 'Chưa cập nhật'}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.label}>Số CCCD/CMND:</Text>
              <Text style={styles.value}>{tenant?.cccd || 'Chưa cập nhật'}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.label}>Ghi chú địa chỉ:</Text>
              <Text style={styles.value}>{contract.addressNote || 'Không có ghi chú'}</Text>
            </View>
          </View>
        </View>

        {/* Actions section */}
        <View style={styles.actionsBox}>
          {/* PDF Generate Button */}
          <Pressable 
            style={styles.pdfButton} 
            onPress={generatePDFContract}
            disabled={generatingPdf}
          >
            {generatingPdf ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialIcons name="picture-as-pdf" size={20} color="#fff" />
                <Text style={styles.pdfButtonText}>Xuất & Chia sẻ file PDF Hợp đồng</Text>
              </>
            )}
          </Pressable>

          {/* Quick status update triggers */}
          <View style={styles.statusTriggersRow}>
            {contract.status !== 'active' && (
              <Pressable 
                style={[styles.statusTriggerBtn, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}
                onPress={() => handleUpdateStatus('active')}
                disabled={updatingStatus}
              >
                <Text style={{ color: '#1d4ed8', fontWeight: 'bold', fontSize: 13 }}>Hiệu lực</Text>
              </Pressable>
            )}
            {contract.status !== 'expired' && (
              <Pressable 
                style={[styles.statusTriggerBtn, { backgroundColor: '#fef2f2', borderColor: '#fecaca' }]}
                onPress={() => handleUpdateStatus('expired')}
                disabled={updatingStatus}
              >
                <Text style={{ color: '#dc2626', fontWeight: 'bold', fontSize: 13 }}>Hết hạn</Text>
              </Pressable>
            )}
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
    ...theme.typography.titleLg,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: theme.spacing.marginMobile,
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  roomCode: {
    ...theme.typography.headlineLgMobile,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  buildingName: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  activeBadge: {
    backgroundColor: '#e6f4ea',
  },
  activeText: {
    color: '#137333',
    fontSize: 11,
    fontWeight: 'bold',
  },
  expiredBadge: {
    backgroundColor: '#fce8e6',
  },
  expiredText: {
    color: '#c5221f',
    fontSize: 11,
    fontWeight: 'bold',
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
  },
  pendingText: {
    color: '#b45309',
    fontSize: 11,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 16,
  },
  gridData: {
    gap: 12,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
  },
  value: {
    fontSize: 14,
    color: theme.colors.onSurface,
    fontWeight: '500',
  },
  sectionCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sectionTitle: {
    ...theme.typography.titleLg,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
  },
  actionsBox: {
    gap: 12,
    marginTop: 8,
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 14,
    gap: 8,
  },
  pdfButtonText: {
    ...theme.typography.bodyLg,
    color: '#fff',
    fontWeight: 'bold',
  },
  statusTriggersRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statusTriggerBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 12,
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

export default ContractDetail;
