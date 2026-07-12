import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, ActivityIndicator, Image, Alert } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, auth, storage } from '../firebase';
import * as ImagePicker from 'expo-image-picker';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const [showBottomSheet, setShowBottomSheet] = React.useState(false);
  const [profile, setProfile] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);

  const pickImage = async () => {
    setShowBottomSheet(false);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập', 'Ứng dụng cần quyền truy cập thư viện ảnh để cập nhật avatar!');
        return;
      }
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.3,
        base64: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].base64) {
        await uploadAvatar(result.assets[0].base64);
      }
    } catch (error) {
      console.error('[ImagePicker Gallery] Error:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh từ thư viện.');
    }
  };

  const takePhoto = async () => {
    setShowBottomSheet(false);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập', 'Ứng dụng cần quyền truy cập camera để chụp ảnh đại diện!');
        return;
      }
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.3,
        base64: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].base64) {
        await uploadAvatar(result.assets[0].base64);
      }
    } catch (error) {
      console.error('[ImagePicker Camera] Error:', error);
      Alert.alert('Lỗi', 'Không thể chụp ảnh.');
    }
  };

  const uploadAvatar = async (base64Str: string) => {
    try {
      setUploading(true);
      const uid = auth.currentUser?.uid;
      if (!uid) {
        Alert.alert('Lỗi', 'Phiên đăng nhập đã hết hạn.');
        setUploading(false);
        return;
      }
      
      const avatarDataUrl = `data:image/jpeg;base64,${base64Str}`;
      
      // Update Firestore
      const docRef = doc(db, 'admins', uid);
      await updateDoc(docRef, { avatarUrl: avatarDataUrl });
      
      // Update local state
      setProfile((prev: any) => ({ ...prev, avatarUrl: avatarDataUrl }));
      Alert.alert('Thành công', 'Cập nhật ảnh đại diện thành công!');
    } catch (error) {
      console.error('[Base64 Avatar] Error uploading:', error);
      Alert.alert('Lỗi', 'Không thể lưu ảnh đại diện.');
    } finally {
      setUploading(false);
    }
  };

  const deleteAvatar = async () => {
    setShowBottomSheet(false);
    if (!profile?.avatarUrl) return;
    
    Alert.alert(
      'Gỡ ảnh đại diện',
      'Bạn có chắc chắn muốn gỡ ảnh đại diện hiện tại?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Gỡ',
          style: 'destructive',
          onPress: async () => {
            try {
              setUploading(true);
              const uid = auth.currentUser?.uid;
              if (!uid) {
                Alert.alert('Lỗi', 'Phiên đăng nhập đã hết hạn.');
                setUploading(false);
                return;
              }
              
              // Delete from Storage only if it is an HTTP Storage URL
              if (profile?.avatarUrl && profile.avatarUrl.startsWith('http')) {
                console.log('[Storage Avatar] Deleting HTTP avatar from storage for UID:', uid);
                const fileRef = ref(storage, `avatars/${uid}.jpg`);
                await deleteObject(fileRef).catch(err => {
                  console.log('[Storage Avatar] File did not exist or delete failed, proceeding to update DB:', err.message);
                });
              }
              
              // Update Firestore
              const docRef = doc(db, 'admins', uid);
              await updateDoc(docRef, { avatarUrl: null });
              
              // Update local state
              setProfile((prev: any) => ({ ...prev, avatarUrl: null }));
              Alert.alert('Thành công', 'Đã gỡ ảnh đại diện.');
            } catch (error) {
              console.error('[Storage Avatar] Error deleting:', error);
              Alert.alert('Lỗi', 'Không thể gỡ ảnh đại diện.');
            } finally {
              setUploading(false);
            }
          }
        }
      ]
    );
  };

  React.useEffect(() => {
    if (isFocused) {
      loadProfileData();
    }
  }, [isFocused]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.log('[Firestore Settings] No authenticated user. Bypassing Firestore read.');
        setProfile({
          name: 'Admin',
          phone: 'Chưa cập nhật',
          cccd: 'Chưa cập nhật',
          dob: 'Chưa cập nhật',
          city: 'Chưa cập nhật',
        });
        return;
      }
      const uid = currentUser.uid;
      console.log('[Firestore Settings] Loading profile for UID:', uid);
      const docRef = doc(db, 'admins', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log('[Firestore Settings] Profile data loaded:', docSnap.data());
        setProfile(docSnap.data());
      } else {
        console.log('[Firestore Settings] Document does not exist. Creating default profile...');
        const defaultProfile = {
          name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Admin',
          phone: currentUser.phoneNumber || 'Chưa cập nhật',
          cccd: 'Chưa cập nhật',
          dob: 'Chưa cập nhật',
          city: 'Chưa cập nhật',
        };
        await setDoc(docRef, defaultProfile);
        setProfile(defaultProfile);
      }
    } catch (error) {
      console.error('[Firestore Settings] Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await auth.signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const infoGrid = [
    { id: '1', label: 'Số điện thoại', value: profile?.phone || auth.currentUser?.phoneNumber || 'Chưa cập nhật', icon: 'phone' },
    { id: '2', label: 'CCCD', value: profile?.cccd || 'Chưa cập nhật', icon: 'badge' },
    { id: '3', label: 'Ngày sinh', value: profile?.dob || 'Chưa cập nhật', icon: 'calendar-today' },
    { id: '4', label: 'Thành phố', value: profile?.city || 'Chưa cập nhật', icon: 'place' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Thông tin tài khoản</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              {uploading ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : profile?.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <MaterialIcons name="person" size={54} color="#cbd5e1" />
              )}
            </View>
            <Pressable style={styles.cameraOverlay} onPress={() => setShowBottomSheet(true)} disabled={uploading}>
              <MaterialIcons name="photo-camera" size={16} color="#ffffff" />
            </Pressable>
          </View>
          <Text style={styles.username}>{profile?.name || auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'Admin'}</Text>
          <View style={styles.phoneRow}>
            <MaterialIcons name="phone" size={16} color="#64748b" />
            <Text style={styles.phoneText}>{profile?.phone || auth.currentUser?.phoneNumber || 'Chưa cập nhật'}</Text>
          </View>
        </View>

        {/* Info Grid (2x2) */}
        <View style={styles.grid}>
          {infoGrid.map((item) => (
            <View key={item.id} style={styles.gridCard}>
              <View style={styles.iconCircle}>
                <MaterialIcons name={item.icon as any} size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.gridLabel}>{item.label}</Text>
              <Text style={styles.gridValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Edit Info Button */}
        <Pressable 
          style={styles.editBtn} 
          onPress={() => navigation.navigate('cai-dat/chinh-sua')}
        >
          <MaterialIcons name="edit" size={20} color={theme.colors.primary} style={{ marginRight: 4 }} />
          <Text style={styles.editBtnText}>Chỉnh sửa thông tin</Text>
        </Pressable>

        {/* Bank Accounts Section */}
        <View style={styles.bankSection}>
          <View style={styles.bankHeader}>
            <Text style={styles.bankTitle}>Tài khoản ngân hàng</Text>
            <Pressable onPress={() => navigation.navigate('cai-dat/ngan-hang')}>
              <Text style={styles.addBankText}>{profile?.bankAccount ? 'Thay đổi' : 'Thêm'}</Text>
            </Pressable>
          </View>
          {profile?.bankAccount ? (
            <View style={styles.bankCard}>
              <View style={styles.bankCardHeader}>
                {profile.bankAccount.logo ? (
                  <Image source={{ uri: profile.bankAccount.logo }} style={styles.bankLogoImage} />
                ) : (
                  <MaterialIcons name="account-balance" size={24} color={theme.colors.primary} />
                )}
                <View style={styles.bankDetails}>
                  <Text style={styles.bankNameText}>{profile.bankAccount.bankName}</Text>
                  <Text style={styles.bankNumberText}>{profile.bankAccount.accountNumber}</Text>
                </View>
              </View>
              <View style={styles.bankCardFooter}>
                <Text style={styles.bankOwnerText}>{profile.bankAccount.ownerName || ''}</Text>
                <Text style={styles.bankBranchText}>{profile.bankAccount.branch || ''}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.bankEmptyText}>Chưa có tài khoản ngân hàng.</Text>
          )}
        </View>

        {/* Logout Button */}
        <Pressable 
          style={styles.logoutBtn} 
          onPress={handleLogout}
        >
          <MaterialIcons name="logout" size={20} color="#ef4444" style={{ marginRight: 6 }} />
          <Text style={styles.logoutBtnText}>Đăng xuất</Text>
        </Pressable>
      </ScrollView>

      {/* Bottom Sheet Modal */}
      <Modal
        visible={showBottomSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBottomSheet(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowBottomSheet(false)}>
          <View style={styles.modalContent}>
            <View style={styles.sheetHandle} />
            
            <Pressable style={styles.sheetItem} onPress={takePhoto}>
              <View style={styles.sheetItemLeft}>
                <View style={styles.sheetIconCircle}>
                  <MaterialIcons name="photo-camera" size={20} color="#3b82f6" />
                </View>
                <View>
                  <Text style={styles.sheetItemTitle}>Chụp ảnh mới</Text>
                  <Text style={styles.sheetItemSubtitle}>Dùng camera để cập nhật nhanh</Text>
                </View>
              </View>
              <MaterialIcons name="keyboard-arrow-right" size={24} color="#94a3b8" />
            </Pressable>

            <Pressable style={styles.sheetItem} onPress={pickImage}>
              <View style={styles.sheetItemLeft}>
                <View style={styles.sheetIconCircle}>
                  <MaterialIcons name="image" size={20} color="#3b82f6" />
                </View>
                <View>
                  <Text style={styles.sheetItemTitle}>Chọn từ thư viện</Text>
                  <Text style={styles.sheetItemSubtitle}>Tải ảnh sẵn có lên máy chủ</Text>
                </View>
              </View>
              <MaterialIcons name="keyboard-arrow-right" size={24} color="#94a3b8" />
            </Pressable>

            <Pressable 
              style={[styles.sheetItem, !profile?.avatarUrl && { opacity: 0.5 }]} 
              onPress={deleteAvatar}
              disabled={!profile?.avatarUrl}
            >
              <View style={styles.sheetItemLeft}>
                <View style={[styles.sheetIconCircle, { backgroundColor: '#fef2f2' }]}>
                  <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
                </View>
                <View>
                  <Text style={[styles.sheetItemTitle, { color: '#ef4444' }]}>Gỡ ảnh đại diện</Text>
                  <Text style={styles.sheetItemSubtitle}>Quay về ảnh mặc định</Text>
                </View>
              </View>
              <MaterialIcons name="keyboard-arrow-right" size={24} color="#94a3b8" />
            </Pressable>
          </View>
        </Pressable>
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
    fontSize: 22,
  },
  scrollContent: {
    padding: theme.spacing.marginMobile,
    gap: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  username: {
    ...theme.typography.bodyLg,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    fontSize: 18,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  phoneText: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCard: {
    width: '48%',
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridLabel: {
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
  },
  gridValue: {
    ...theme.typography.bodyMd,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primaryContainer,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 14,
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  editBtnText: {
    ...theme.typography.bodyLg,
    color: theme.colors.primaryContainer,
    fontWeight: 'bold',
  },
  bankSection: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 14,
  },
  bankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankTitle: {
    ...theme.typography.bodyLg,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  addBankText: {
    ...theme.typography.bodyMd,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  bankEmptyText: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
  },
  bankCard: {
    backgroundColor: '#eff6ff',
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  bankCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  bankDetails: {
    flex: 1,
  },
  bankNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  bankNumberText: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  bankCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#dbeafe',
    paddingTop: 10,
  },
  bankOwnerText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  bankBranchText: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  bankLogoImage: {
    width: 44,
    height: 28,
    resizeMode: 'contain',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 28, 48, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderTopLeftRadius: theme.borderRadius.xl * 2,
    borderTopRightRadius: theme.borderRadius.xl * 2,
    paddingHorizontal: theme.spacing.marginMobile,
    paddingBottom: 40,
    paddingTop: 10,
    gap: 16,
  },
  sheetHandle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#cbd5e1',
    alignSelf: 'center',
    marginBottom: 8,
  },
  sheetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  sheetItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  sheetIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetItemTitle: {
    ...theme.typography.bodyLg,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  sheetItemSubtitle: {
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 14,
    backgroundColor: '#fef2f2',
    marginTop: 8,
  },
  logoutBtnText: {
    ...theme.typography.bodyLg,
    color: '#ef4444',
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
