import React from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [identifier, setIdentifier] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Thông báo', 'Vui lòng nhập tài khoản và mật khẩu.');
      return;
    }

    // Check if configuration uses dummy key
    const isDummyConfig = auth.app.options.apiKey?.includes('DummyKeyForDevelopment');

    if (isDummyConfig) {
      // Mock success for development/dummy configuration
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
      return;
    }

    try {
      const email = identifier.includes('@') ? identifier : `${identifier}@home247.vn`;
      await signInWithEmailAndPassword(auth, email, password);
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error: any) {
      Alert.alert('Đăng nhập thất bại', error.message || 'Tài khoản hoặc mật khẩu không chính xác.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Logo Branding */}
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <MaterialIcons name="home-work" size={54} color={theme.colors.primary} />
          </View>
          <Text style={styles.appName}>Home247</Text>
          <Text style={styles.tagline}>Quản lý tòa nhà thông minh & tiện lợi</Text>
        </View>

        {/* Form Inputs */}
        <View style={styles.form}>
          <Text style={styles.label}>Tài khoản</Text>
          <View style={styles.inputContainer}>
            <MaterialIcons name="phone-android" size={20} color="#94a3b8" />
            <TextInput
              style={styles.textInput}
              placeholder="Số điện thoại hoặc Email"
              placeholderTextColor="#94a3b8"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
            />
          </View>

          <Text style={[styles.label, { marginTop: 18 }]}>Mật khẩu</Text>
          <View style={styles.inputContainer}>
            <MaterialIcons name="lock-outline" size={20} color="#94a3b8" />
            <TextInput
              style={styles.textInput}
              placeholder="Mật khẩu"
              placeholderTextColor="#94a3b8"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
            <Pressable onPress={() => setShowPassword(!showPassword)}>
              <MaterialIcons
                name={showPassword ? 'visibility' : 'visibility-off'}
                size={20}
                color="#94a3b8"
              />
            </Pressable>
          </View>

          {/* Forgot Password */}
          <Pressable style={styles.forgotBtn} onPress={() => {}}>
            <Text style={styles.forgotText}>Quên mật khẩu?</Text>
          </Pressable>

          {/* Login Button */}
          <Pressable style={styles.loginBtn} onPress={handleLogin}>
            <Text style={styles.loginBtnText}>Đăng nhập</Text>
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Chưa có tài khoản? </Text>
          <Pressable onPress={() => {}}>
            <Text style={styles.signUpText}>Đăng ký ngay</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.marginMobile,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 40,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    ...theme.typography.displayLg,
    color: theme.colors.primary,
    fontSize: 32,
    fontWeight: 'bold',
  },
  tagline: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    marginTop: 6,
    textAlign: 'center',
  },
  form: {
    gap: 8,
  },
  label: {
    ...theme.typography.labelMd,
    color: theme.colors.onSurfaceVariant,
    fontWeight: 'bold',
    marginBottom: 6,
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
    paddingVertical: 14,
    fontSize: 15,
    color: theme.colors.onSurface,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 13,
    color: theme.colors.primaryContainer,
    fontWeight: 'bold',
  },
  loginBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 14,
  },
  loginBtnText: {
    ...theme.typography.bodyLg,
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
  },
  signUpText: {
    fontSize: 14,
    color: theme.colors.primaryContainer,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
