import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

export const EditProfile: React.FC = () => {
  const navigation = useNavigation();

  const [dob, setDob] = React.useState('');
  const [city, setCity] = React.useState('');

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
          
          <Pressable style={styles.blueBtn} onPress={() => {}}>
            <MaterialIcons name="badge" size={20} color="#ffffff" />
            <Text style={styles.blueBtnText}>Xác thực CCCD</Text>
          </Pressable>

          <Pressable style={[styles.blueBtn, { marginTop: 14 }]} onPress={() => navigation.goBack()}>
            <MaterialIcons name="save" size={20} color="#ffffff" />
            <Text style={styles.blueBtnText}>Lưu thông tin</Text>
          </Pressable>

          {/* Section 3: Cập nhật số điện thoại */}
          <Pressable style={styles.phoneCard} onPress={() => {}}>
            <View style={styles.phoneCardLeft}>
              <View style={styles.phoneIconCircle}>
                <MaterialIcons name="phone" size={20} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={styles.phoneTitle}>Cập nhật số điện thoại</Text>
                <Text style={styles.phoneSubtitle}>Cần nhập mật khẩu để xác nhận</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={22} color="#cbd5e1" />
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
