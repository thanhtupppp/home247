# Design Spec: Login Screen (Màn hình Đăng nhập)
Date: 2026-07-11
Status: Approved

## Overview
This design document defines the layout and behavior for the Login screen:
1. **Login Screen** (`LoginScreen.tsx`): The entrypoint of the application. It features a modern logo, inputs for phone/email and password, forgot password link, a login button, and a signup link.
2. **Integration**: Set the Stack Navigator's initial route to `Login` so that users see it first. Tapping `Đăng nhập` redirects to the main app dashboard (`MainTabs`).

## Proposed Changes

### 1. Navigation Shell (`App.tsx`)
* Register a new stack screen `Login` pointing to `LoginScreen`.
* Set `initialRouteName="Login"` on the `Stack.Navigator`.

### 2. Login Screen (`src/screens/LoginScreen.tsx`) [NEW]
Create a premium React Native login screen:
* **Logo Section**:
  - House/building icon (blue color, themed) and title "Home247" in bold display.
  - Subtitle: "Quản lý tòa nhà thông minh & tiện lợi".
* **Form Inputs**:
  * **Phone/Email**: TextInput, left icon `phone-android`, placeholder "Số điện thoại hoặc Email".
  * **Password**: TextInput, left icon `lock-outline`, placeholder "Mật khẩu", secure text entry with password visibility toggle (eye icon).
* **Forgot Password Link**:
  - Right aligned link: "Quên mật khẩu?".
* **Action Buttons**:
  - Blue button: `Đăng nhập` (Login). Redirects to `MainTabs`.
  - Social Logins or Quick Login options (e.g. OTP).
* **Footer**:
  - Text: "Chưa có tài khoản? Đăng ký ngay".

## Verification Plan
* Compile project using TypeScript compiler to verify no syntax errors.
* Verify app starts on `LoginScreen`.
* Verify tapping `Đăng nhập` navigates to `MainTabs`.
