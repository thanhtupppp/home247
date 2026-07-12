import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

export const AddBankAccount: React.FC = () => {
  const navigation = useNavigation<any>();

  const [selectedBank, setSelectedBank] = React.useState('');
  const [selectedBankLogo, setSelectedBankLogo] = React.useState('');
  const [selectedBankCode, setSelectedBankCode] = React.useState('');
  const [selectedBankBin, setSelectedBankBin] = React.useState('');
  
  const [showBankDropdown, setShowBankDropdown] = React.useState(false);
  const [accountNumber, setAccountNumber] = React.useState('');
  const [branch, setBranch] = React.useState('');
  const [ownerName, setOwnerName] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const [banksList, setBanksList] = React.useState<any[]>([]);
  const [filteredBanks, setFilteredBanks] = React.useState<any[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    fetchBanks();
    loadBankData();
  }, []);

  const fetchBanks = async () => {
    try {
      const response = await fetch('https://api.vietqr.io/v2/banks');
      const json = await response.json();
      if (json.code === '00' && json.data) {
        setBanksList(json.data);
        setFilteredBanks(json.data);
      }
    } catch (error) {
      console.error('Error fetching banks list:', error);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (!text) {
      setFilteredBanks(banksList);
      return;
    }
    const query = text.toLowerCase();
    const filtered = banksList.filter(
      (b) =>
        (b.short_name && b.short_name.toLowerCase().includes(query)) ||
        (b.name && b.name.toLowerCase().includes(query)) ||
        (b.code && b.code.toLowerCase().includes(query))
    );
    setFilteredBanks(filtered);
  };

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
          setSelectedBankLogo(data.bankAccount.logo || '');
          setSelectedBankCode(data.bankAccount.bankCode || '');
          setSelectedBankBin(data.bankAccount.bin || '');
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
            bankCode: selectedBankCode,
            bin: selectedBankBin,
            logo: selectedBankLogo,
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
          {/* Live Card Preview */}
          <View style={[styles.bankCard, { marginBottom: 20 }]}>
            <View style={styles.bankCardHeader}>
              {selectedBankLogo ? (
                <Image source={{ uri: selectedBankLogo }} style={styles.bankLogoImage} />
              ) : (
                <MaterialIcons name="account-balance" size={24} color={theme.colors.primary} />
              )}
              <View style={styles.bankDetails}>
                <Text style={styles.bankNameText}>{selectedBank || 'Tên ngân hàng'}</Text>
                <Text style={styles.bankNumberText}>{accountNumber || 'Số tài khoản'}</Text>
              </View>
            </View>
            <View style={styles.bankCardFooter}>
              <Text style={styles.bankOwnerText}>{ownerName ? ownerName.toUpperCase() : 'TÊN CHỦ TÀI KHOẢN'}</Text>
              <Text style={styles.bankBranchText}>{branch || 'Chi nhánh'}</Text>
            </View>
          </View>

          {/* Ngân hàng Dropdown */}
          <Text style={styles.label}>Ngân hàng</Text>
          <Pressable onPress={() => setShowBankDropdown(!showBankDropdown)} style={styles.dropdownButton}>
            <Text style={styles.dropdownButtonText}>{selectedBank || 'Chọn ngân hàng'}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={24} color="#a1a1aa" />
          </Pressable>
          {showBankDropdown && (
            <View style={styles.dropdown}>
              <View style={styles.searchBar}>
                <MaterialIcons name="search" size={20} color="#94a3b8" />
                <TextInput
                  style={styles.dropdownSearchInput}
                  placeholder="Tìm kiếm ngân hàng..."
                  value={searchQuery}
                  onChangeText={handleSearch}
                />
              </View>
              <ScrollView style={{ maxHeight: 250 }} nestedScrollEnabled>
                {filteredBanks.map((b) => (
                  <Pressable
                    key={b.bin}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedBank(b.short_name);
                      setSelectedBankLogo(b.logo);
                      setSelectedBankCode(b.code);
                      setSelectedBankBin(b.bin);
                      setShowBankDropdown(false);
                    }}
                  >
                    <Image source={{ uri: b.logo }} style={styles.bankItemLogo} />
                    <View style={styles.bankItemInfo}>
                      <Text style={styles.bankItemShortName}>{b.short_name}</Text>
                      <Text style={styles.bankItemFullName} numberOfLines={1}>{b.name}</Text>
                    </View>
                  </Pressable>
                ))}
                {filteredBanks.length === 0 && (
                  <Text style={styles.emptySearchText}>Không tìm thấy ngân hàng nào</Text>
                )}
              </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceContainer,
    backgroundColor: '#f8fafc',
    height: 48,
  },
  dropdownSearchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: theme.colors.onSurface,
  },
  bankItemLogo: {
    width: 40,
    height: 24,
    resizeMode: 'contain',
    marginRight: 12,
  },
  bankItemInfo: {
    flex: 1,
  },
  bankItemShortName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  bankItemFullName: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  emptySearchText: {
    padding: 16,
    textAlign: 'center',
    color: theme.colors.onSurfaceVariant,
    fontSize: 14,
  },
});

export default AddBankAccount;
