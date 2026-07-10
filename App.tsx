import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { theme } from './src/theme';

// Import Screens
import Dashboard from './src/screens/Dashboard';
import RoomsManagement from './src/screens/RoomsManagement';
import InvoicesList from './src/screens/InvoicesList';
import SupportRequests from './src/screens/SupportRequests';
import GenericScreen from './src/screens/GenericScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigation configuration
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surfaceContainer,
          borderTopColor: theme.colors.outlineVariant,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap = 'dashboard';
          if (route.name === 'Overview') {
            iconName = 'dashboard';
          } else if (route.name === 'Rooms') {
            iconName = 'king-bed';
          } else if (route.name === 'Invoices') {
            iconName = 'receipt-long';
          } else if (route.name === 'Support') {
            iconName = 'chat-bubble-outline';
          }
          return (
            <MaterialIcons 
              name={iconName} 
              size={size} 
              color={color} 
            />
          );
        },
      })}
    >
      <Tab.Screen 
        name="Overview" 
        component={Dashboard} 
        options={{ tabBarLabel: 'Tổng quan' }}
      />
      <Tab.Screen 
        name="Rooms" 
        component={RoomsManagement} 
        options={{ tabBarLabel: 'Quản lý Phòng' }}
      />
      <Tab.Screen 
        name="Invoices" 
        component={InvoicesList} 
        options={{ tabBarLabel: 'Hóa đơn' }}
      />
      <Tab.Screen 
        name="Support" 
        component={SupportRequests} 
        options={{ tabBarLabel: 'Hỗ trợ' }}
      />
    </Tab.Navigator>
  );
}

// App Root Entrypoint
export function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          {/* Main Tab Views */}
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />

          {/* Sub-Pages & Detail views mapped directly from Stitch screens */}
          <Stack.Screen name="phong/id">
            {() => (
              <GenericScreen 
                title="Chi tiết Phòng & Hợp đồng" 
                type="contract" 
                description="Thông tin chi tiết về phòng trọ, giá thuê, trang thiết bị và thời hạn hợp đồng đang áp dụng." 
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="hop-dong">
            {() => (
              <GenericScreen 
                title="Danh sách Hợp đồng" 
                type="contract" 
                description="Hồ sơ quản lý các hợp đồng thuê phòng của khách thuê, bao gồm hợp đồng đang hoạt động và đã hết hạn." 
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="hop-dong/loc">
            {() => (
              <GenericScreen 
                title="Bộ lọc Hợp đồng" 
                type="contract" 
                description="Tìm kiếm và chọn lọc hợp đồng thuê phòng theo trạng thái, ngày bắt đầu/kết thúc." 
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="hop-dong/moi">
            {() => (
              <GenericScreen 
                title="Tạo hợp đồng mới" 
                type="contract" 
                description="Nhập thông tin đăng ký hợp đồng thuê phòng mới cho khách hàng." 
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="hoa-don/id">
            {() => (
              <GenericScreen 
                title="Chi tiết Hóa đơn" 
                type="utility" 
                description="Chi tiết các khoản phí dịch vụ, chỉ số điện nước tiêu thụ trong kỳ." 
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="thong-ke">
            {() => (
              <GenericScreen 
                title="Thống kê Doanh thu" 
                type="stats" 
                description="Số liệu thống kê chi tiết doanh thu, dòng tiền của tòa nhà." 
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="giao-dich">
            {() => (
              <GenericScreen 
                title="Lịch sử Giao dịch" 
                type="stats" 
                description="Lịch sử chi tiết các giao dịch đóng tiền phòng, chuyển khoản của khách thuê." 
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="khach-thue">
            {() => (
              <GenericScreen 
                title="Quản lý Khách thuê" 
                type="tenant" 
                description="Hồ sơ liên lạc và thông tin pháp lý của người chịu trách nhiệm ký hợp đồng thuê phòng." 
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="cu-dan">
            {() => (
              <GenericScreen 
                title="Quản lý Cư dân" 
                type="tenant" 
                description="Danh sách tất cả những người đang sinh sống, lưu trú tại các phòng trọ." 
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="cu-dan/them">
            {() => (
              <GenericScreen 
                title="Thêm cư dân mới" 
                type="tenant" 
                description="Khai báo thông tin nhân khẩu và đăng ký tạm trú cho cư dân mới dọn vào." 
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="toa-nha">
            {() => (
              <GenericScreen 
                title="Quản lý Tòa nhà" 
                type="building" 
                description="Cấu hình các tòa nhà, chung cư mini, chi nhánh phòng cho thuê đang hoạt động." 
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="thiet-bi">
            {() => (
              <GenericScreen 
                title="Quản lý Thiết bị" 
                type="device" 
                description="Danh mục tài sản, trang thiết bị cố định được cấp phát tại từng phòng trọ." 
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="dien-nuoc">
            {() => (
              <GenericScreen 
                title="Ghi chỉ số Điện & Nước" 
                type="utility" 
                description="Nhập chỉ số điện và nước tiêu thụ đầu kỳ, cuối kỳ để tính toán hóa đơn." 
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="cau-hinh-gia">
            {() => (
              <GenericScreen 
                title="Cấu hình Dịch vụ & Giá" 
                type="pricing" 
                description="Điều chỉnh giá điện, giá nước, phí dịch vụ chung và các gói Internet áp dụng cho tòa nhà." 
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="cai-dat">
            {() => (
              <GenericScreen 
                title="Cài đặt hệ thống" 
                type="settings" 
                description="Thiết lập các thông số thông báo tự động, cấu hình nhắc nợ và tích hợp cổng thanh toán." 
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
