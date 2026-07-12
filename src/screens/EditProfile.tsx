import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

export const EditProfile: React.FC = () => {
  const navigation = useNavigation<any>();

  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [dob, setDob] = React.useState('');
  const [city, setCity] = React.useState('');
  const [cccd, setCccd] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const uid = auth.currentUser?.uid || 'mock-admin-uid';
      const docRef = doc(db, 'admins', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setName(data.name || auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || '');
        setPhone(data.phone || auth.currentUser?.phoneNumber || '');
        setDob(data.dob || '');
        setCity(data.city || '');
        setCccd(data.cccd || '');
      } else {
        setName(auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || '');
        setPhone(auth.currentUser?.phoneNumber || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin cá nhân.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const uid = auth.currentUser?.uid || 'mock-admin-uid';
      const docRef = doc(db, 'admins', uid);
      await setDoc(docRef, { name, phone, dob, city, cccd }, { merge: true });
      Alert.alert('Thành công', 'Lưu thông tin thành công!');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Lỗi', 'Không thể lưu thông tin cá nhân.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
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
        <Text style={styles.headerTitle}>Chỉnh sửa thông tin</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          {/* Section 1: Thông tin liên hệ */}
          <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>

          <View style={styles.inputContainer}>
            <MaterialIcons name="person" size={20} color="#94a3b8" />
            <TextInput
              style={styles.textInput}
              placeholder="Họ và tên"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={[styles.inputContainer, { marginTop: 14 }]}>
            <MaterialIcons name="phone" size={20} color="#94a3b8" />
            <TextInput
              style={styles.textInput}
              placeholder="Số điện thoại"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={[styles.inputContainer, { marginTop: 14 }]}>
            <MaterialIcons name="calendar-today" size={20} color="#94a3b8" />
            <TextInput
              style={styles.textInput}
              placeholder="Ngày sinh"
              value={dob}
              onChangeText={setDob}
            />
          </View>

          <View style={[styles.inputContainer, { marginTop: 14 }]}>
            <MaterialIcons name="place" size={20} color="#94a3b8" />
            <TextInput
              style={styles.textInput}
              placeholder="Thành phố"
              value={city}
              onChangeText={setCity}
            />
          </View>

          {/* Section 2: CCCD/CMND */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>CCCD/CMND</Text>

          <View style={styles.inputContainer}>
            <MaterialIcons name="badge" size={20} color="#94a3b8" />
            <TextInput
              style={styles.textInput}
              placeholder="Số CCCD/CMND"
              value={cccd}
              onChangeText={setCccd}
              keyboardType="numeric"
            />
          </View>

          <Pressable style={[styles.blueBtn, { marginTop: 24 }]} onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <MaterialIcons name="save" size={20} color="#ffffff" />
                <Text style={styles.blueBtnText}>Lưu thông tin</Text>
              </>
            )}
          </Pressable>
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
    paddingBottom: 40,
  },
  form: {
    padding: theme.spacing.marginMobile,
  },
  sectionTitle: {
    ...theme.typography.labelMd,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.surfaceContainerLowest,
    gap: 10,
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: theme.colors.onSurface,
  },
  blueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 14,
    gap: 8,
  },
  blueBtnText: {
    ...theme.typography.bodyLg,
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
  },
  phoneCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: theme.colors.surfaceContainerLowest,
    marginTop: 24,
  },
  phoneCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  phoneIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneTitle: {
    ...theme.typography.bodyLg,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  phoneSubtitle: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
});

export default EditProfile;
