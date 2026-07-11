# Login Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the new "Đăng nhập" (Login) screen and integrate it as the default startup screen of the application.

**Architecture:**
- Create `src/screens/LoginScreen.tsx` containing the logo header, inputs with left icons, toggleable secure password entry, forgot password link, login action buttons, and footer.
- Update `App.tsx` navigation stack to make `Login` the initial route.

**Tech Stack:** React Native, Expo, React Navigation, MaterialIcons, TypeScript.

---

### Task 1: Create LoginScreen Screen

**Files:**
- Create: `src/screens/LoginScreen.tsx`

- [ ] **Step 1: Create `src/screens/LoginScreen.tsx`**

Write `LoginScreen.tsx` to render:
- House/building icon and "Home247" branding.
- Input: Email/phone with left icon.
- Input: Password with left lock icon, right eye icon toggle.
- Button: "Đăng nhập" navigating to `'MainTabs'`.
- Bottom footer: registration message.

```typescript
import React from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [identifier, setIdentifier] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  const handleLogin = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
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
```

---

### Task 2: Hook up Route in App Navigation

**Files:**
- Modify: `App.tsx`

- [ ] **Step 1: Import `LoginScreen` in `App.tsx`**

```typescript
import LoginScreen from './src/screens/LoginScreen';
```

- [ ] **Step 2: Add Login screen to Stack Navigator**

Inside Stack Navigator in `App.tsx`, set:
- `initialRouteName="Login"`
And add screen:
```typescript
          <Stack.Screen name="Login" component={LoginScreen} />
```

- [ ] **Step 3: Run typescript compiler check to verify**

Run `npx tsc --noEmit` and verify it compiles without errors.
