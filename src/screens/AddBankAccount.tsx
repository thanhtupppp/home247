import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

const BANKS = ['Vietcombank', 'Techcombank', 'MB Bank', 'ACB'];

export const AddBankAccount: React.FC = () => {
  const navigation = useNavigation<any>();

  const [selectedBank, setSelectedBank] = React.useState('');
  const [showBankDropdown, setShowBankDropdown] = React.useState(false);
  const [accountNumber, setAccountNumber] = React.useState('');
  const [branch, setBranch] = React.useState('');
  const [ownerName, setOwnerName] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    loadBankData();
  }, []);

  const loadBankData = async () => {
    try {
      setLoading(true);
      const uid = auth.currentUser?.uid;
      if (!uid) {
        setLoading(false);
        return;
      }
      const docRef = doc(db, 'admins', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.bankAccount) {
          setSelectedBank(data.bankAccount.bankName || '');
          setAccountNumber(data.bankAccount.accountNumber || '');
          setBranch(data.bankAccount.branch || '');
          setOwnerName(data.bankAccount.ownerName || '');
        }
      }
    } catch (error) {
      console.error('Error loading bank details:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin tài khoản ngân hàng.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedBank || !accountNumber || !ownerName || !branch) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin tài khoản.');
      return;
    }

    try {
      setSaving(true);
      const uid = auth.currentUser?.uid;
      if (!uid) {
        Alert.alert('Lỗi', 'Phiên đăng nhập đã hết hạn.');
        setSaving(false);
        return;
      }
      const docRef = doc(db, 'admins', uid);
      await setDoc(
        docRef,
        {
          bankAccount: {
            bankName: selectedBank,
            accountNumber,
            branch,
            ownerName,
          },
        },
        { merge: true }
      );
      Alert.alert('Thành công', 'Lưu tài khoản ngân hàng thành công!');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving bank account:', error);
      Alert.alert('Lỗi', 'Lưu thông tin tài khoản ngân hàng thất bại.');
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
        <Text style={styles.headerTitle}>Tài khoản ngân hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          {/* Ngân hàng Dropdown */}
          <Text style={styles.label}>Ngân hàng</Text>
          <Pressable onPress={() => setShowBankDropdown(!showBankDropdown)} style={styles.dropdownButton}>
            <Text style={styles.dropdownButtonText}>{selectedBank || 'Chọn ngân hàng'}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={24} color="#a1a1aa" />
          </Pressable>
          {showBankDropdown && (
            <View style={styles.dropdown}>
              {BANKS.map((b) => (
                <Pressable key={b} style={styles.dropdownItem} onPress={() => { setSelectedBank(b); setShowBankDropdown(false); }}>
                  <Text style={styles.dropdownItemText}>{b}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Số TK */}
          <Text style={[styles.label, { marginTop: 16 }]}>Số TK</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Nhập số tài khoản"
            keyboardType="numeric"
            value={accountNumber}
            onChangeText={setAccountNumber}
          />

          {/* Chi nhánh */}
          <Text style={[styles.label, { marginTop: 16 }]}>Chi nhánh</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Nhập chi nhánh"
            value={branch}
            onChangeText={setBranch}
          />

          {/* Tên chủ tài khoản */}
          <Text style={[styles.label, { marginTop: 16 }]}>Tên chủ tài khoản</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Tên chủ tài khoản"
            value={ownerName}
            onChangeText={setOwnerName}
          />

          {/* Bottom Button */}
          <Pressable style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.saveBtnText}>Lưu tài khoản</Text>
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
  label: {
    ...theme.typography.labelMd,
    color: theme.colors.onSurfaceVariant,
    fontWeight: 'bold',
    marginBottom: 8,
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
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownButtonText: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurface,
  },
  dropdown: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.xl,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceContainer,
  },
  dropdownItemText: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurface,
  },
  saveBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 14,
    marginTop: 24,
  },
  saveBtnText: {
    ...theme.typography.bodyLg,
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
  },
});

export default AddBankAccount;
