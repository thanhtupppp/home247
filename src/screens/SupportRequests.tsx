import React from 'react';
import {
  ScrollView, View, Text, StyleSheet, Pressable,
  ActivityIndicator, Alert, TextInput, Modal, Switch
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { collection, getDocs, doc, updateDoc, addDoc, query, orderBy, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

interface SupportRequest {
  id: string;
  roomCode: string;
  buildingName: string;
  title: string;
  description: string;
  level: 'emergency' | 'normal';
  status: 'pending' | 'processing' | 'resolved' | 'closed';
  createdAt: any;
}

export const SupportRequests: React.FC = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

  const [requests, setRequests] = React.useState<SupportRequest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'pending' | 'resolved'>('pending');

  // Modal State for creating support request
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const [newDesc, setNewDesc] = React.useState('');
  const [newRoom, setNewRoom] = React.useState('');
  const [newBuilding, setNewBuilding] = React.useState('');
  const [newLevel, setNewLevel] = React.useState<'emergency' | 'normal'>('normal');
  const [creating, setCreating] = React.useState(false);

  React.useEffect(() => {
    if (isFocused) {
      fetchRequests();
    }
  }, [isFocused]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(query(collection(db, 'supportRequests'), orderBy('createdAt', 'desc')));
      const list: SupportRequest[] = [];
      snap.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          roomCode: data.roomCode || '',
          buildingName: data.buildingName || '',
          title: data.title || '',
          description: data.description || '',
          level: data.level || 'normal',
          status: data.status || 'pending',
          createdAt: data.createdAt,
        });
      });
      setRequests(list);
    } catch (err) {
      console.error('Error fetching support requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'resolved' | 'closed' | 'pending') => {
    try {
      await updateDoc(doc(db, 'supportRequests', id), { status: newStatus });
      setRequests(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
      Alert.alert('Thành công', 'Đã cập nhật trạng thái yêu cầu hỗ trợ.');
    } catch (err) {
      console.error('Error updating support request status:', err);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái.');
    }
  };

  const handleDeleteRequest = async (id: string) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa phản ánh này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'supportRequests', id));
              setRequests(prev => prev.filter(item => item.id !== id));
            } catch (err) {
              console.error('Error deleting support request:', err);
              Alert.alert('Lỗi', 'Không thể xóa phản ánh.');
            }
          }
        }
      ]
    );
  };

  const handleCreateRequest = async () => {
    if (!newTitle.trim() || !newDesc.trim() || !newRoom.trim() || !newBuilding.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin yêu cầu.');
      return;
    }

    try {
      setCreating(true);
      const reqData = {
        title: newTitle.trim(),
        description: newDesc.trim(),
        roomCode: newRoom.trim(),
        buildingName: newBuilding.trim(),
        level: newLevel,
        status: 'pending',
        createdAt: new Date(),
        createdBy: auth.currentUser?.uid || 'system',
      };
      await addDoc(collection(db, 'supportRequests'), reqData);
      
      // Reset & close modal
      setNewTitle('');
      setNewDesc('');
      setNewRoom('');
      setNewBuilding('');
      setNewLevel('normal');
      setShowCreateModal(false);
      
      Alert.alert('Thành công', 'Đã tạo phản ánh hỗ trợ thành công!');
      fetchRequests();
    } catch (err) {
      console.error('Error creating support request:', err);
      Alert.alert('Lỗi', 'Không thể gửi phản ánh hỗ trợ.');
    } finally {
      setCreating(false);
    }
  };

  const filteredRequests = React.useMemo(() => {
    return requests.filter(r => {
      const isPending = r.status === 'pending' || r.status === 'processing';
      if (activeTab === 'pending') return isPending;
      return r.status === 'resolved' || r.status === 'closed';
    });
  }, [requests, activeTab]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Yêu cầu hỗ trợ</Text>
        <Pressable onPress={() => setShowCreateModal(true)} style={styles.createButton}>
          <MaterialIcons name="add" size={20} color={theme.colors.primary} />
          <Text style={styles.createButtonText}>Tạo yêu cầu</Text>
        </Pressable>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <Pressable 
          style={[styles.tabButton, activeTab === 'pending' && styles.tabButtonActive]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
            Chưa giải quyết
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.tabButton, activeTab === 'resolved' && styles.tabButtonActive]}
          onPress={() => setActiveTab('resolved')}
        >
          <Text style={[styles.tabText, activeTab === 'resolved' && styles.tabTextActive]}>
            Đã xử lý
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
        ) : filteredRequests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="forum" size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>Không có yêu cầu hỗ trợ nào</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredRequests.map((req) => (
              <View key={req.id} style={styles.requestCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.badgeRow}>
                    <View style={[
                      styles.levelBadge, 
                      req.level === 'emergency' ? styles.emergencyBadge : styles.normalBadge
                    ]}>
                      <Text style={[
                        styles.levelText,
                        req.level === 'emergency' ? styles.emergencyText : styles.normalText
                      ]}>
                        {req.level === 'emergency' ? 'SỰ CỐ KHẨN CẤP' : 'BÌNH THƯỜNG'}
                      </Text>
                    </View>
                    <Text style={styles.roomCode}>Phòng {req.roomCode} ({req.buildingName})</Text>
                  </View>
                  <Pressable onPress={() => handleDeleteRequest(req.id)}>
                    <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
                  </Pressable>
                </View>
                <Text style={styles.requestTitle}>{req.title}</Text>
                <Text style={styles.requestDesc}>{req.description}</Text>
                
                {req.status === 'pending' && (
                  <View style={styles.cardActions}>
                    <Pressable 
                      style={styles.primaryActionBtn}
                      onPress={() => handleUpdateStatus(req.id, 'resolved')}
                    >
                      <Text style={styles.primaryActionText}>Đã xử lý</Text>
                    </Pressable>
                    <Pressable 
                      style={styles.secondaryActionBtn}
                      onPress={() => handleUpdateStatus(req.id, 'closed')}
                    >
                      <Text style={styles.secondaryActionText}>Đóng yêu cầu</Text>
                    </Pressable>
                  </View>
                )}
                {req.status === 'resolved' && (
                  <View style={styles.resolvedLabelRow}>
                    <MaterialIcons name="check-circle" size={16} color="#16a34a" />
                    <Text style={styles.resolvedLabelText}>Đã xử lý xong</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal for creating support request */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tạo phản ánh mới</Text>
              <Pressable onPress={() => setShowCreateModal(false)}>
                <MaterialIcons name="close" size={24} color={theme.colors.onSurface} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm} keyboardShouldPersistTaps="handled">
              <Text style={styles.label}>Tên tòa nhà *</Text>
              <TextInput 
                style={styles.textInput} 
                placeholder="Vd: Nơ Trang Long" 
                value={newBuilding} 
                onChangeText={setNewBuilding} 
              />

              <Text style={styles.label}>Mã phòng *</Text>
              <TextInput 
                style={styles.textInput} 
                placeholder="Vd: 305" 
                value={newRoom} 
                onChangeText={setNewRoom} 
              />

              <Text style={styles.label}>Tiêu đề sự cố *</Text>
              <TextInput 
                style={styles.textInput} 
                placeholder="Vd: Hỏng điều hòa" 
                value={newTitle} 
                onChangeText={setNewTitle} 
              />

              <Text style={styles.label}>Mô tả chi tiết *</Text>
              <TextInput 
                style={[styles.textInput, styles.textArea]} 
                placeholder="Mô tả sự cố cần hỗ trợ..." 
                value={newDesc} 
                onChangeText={setNewDesc}
                multiline
                numberOfLines={4}
              />

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Mức độ khẩn cấp?</Text>
                <Switch 
                  value={newLevel === 'emergency'}
                  onValueChange={(val) => setNewLevel(val ? 'emergency' : 'normal')}
                  trackColor={{ false: '#cbd5e1', true: '#fca5a5' }}
                  thumbColor={newLevel === 'emergency' ? '#ef4444' : '#64748b'}
                />
              </View>

              <Pressable style={styles.submitBtn} onPress={handleCreateRequest} disabled={creating}>
                {creating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>Gửi yêu cầu hỗ trợ</Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  createButtonText: {
    ...theme.typography.bodyMd,
    color: theme.colors.primary,
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
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurfaceVariant,
  },
  tabTextActive: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: theme.spacing.marginMobile,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 120,
    gap: 8,
  },
  emptyText: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurfaceVariant,
  },
  listContainer: {
    gap: 16,
  },
  requestCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.default,
  },
  emergencyBadge: {
    backgroundColor: '#fee2e2',
  },
  normalBadge: {
    backgroundColor: '#f1f5f9',
  },
  levelText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  emergencyText: {
    color: '#ef4444',
  },
  normalText: {
    color: '#64748b',
  },
  roomCode: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.onSurfaceVariant,
  },
  requestTitle: {
    ...theme.typography.titleLg,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  requestDesc: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurfaceVariant,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  primaryActionBtn: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  secondaryActionBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionText: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 13,
    fontWeight: 'bold',
  },
  resolvedLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resolvedLabelText: {
    fontSize: 13,
    color: '#16a34a',
    fontWeight: 'bold',
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  modalForm: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.onSurfaceVariant,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  submitBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default SupportRequests;
