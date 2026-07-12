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
import GenericScreen from './src/screens/GenericScreen';
import UtilityManagement from './src/screens/UtilityManagement';
import UtilityRecording from './src/screens/UtilityRecording';
import CreateInvoice from './src/screens/CreateInvoice';
import ContractsList from './src/screens/ContractsList';
import CreateContract from './src/screens/CreateContract';
import ServicesList from './src/screens/ServicesList';
import CreateService from './src/screens/CreateService';
import DevicesList from './src/screens/DevicesList';
import CreateDevice from './src/screens/CreateDevice';
import TenantsManagement from './src/screens/TenantsManagement';
import TenantsList from './src/screens/TenantsList';
import CreateTenant from './src/screens/CreateTenant';
import TenantDetail from './src/screens/TenantDetail';
import CreateBuilding from './src/screens/CreateBuilding';
import SettingsScreen from './src/screens/SettingsScreen';
import EditProfile from './src/screens/EditProfile';
import AddBankAccount from './src/screens/AddBankAccount';
import LoginScreen from './src/screens/LoginScreen';


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
          let iconName: keyof typeof MaterialIcons.glyphMap = 'home';
          if (route.name === 'Overview') {
            iconName = 'home';
          } else if (route.name === 'Invoices') {
            iconName = 'payments';
          } else if (route.name === 'Residents') {
            iconName = 'group';
          } else if (route.name === 'Rooms') {
            iconName = 'apartment';
          } else if (route.name === 'Settings') {
            iconName = 'settings';
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
        options={{ tabBarLabel: 'Trang chủ' }}
      />
      <Tab.Screen 
        name="Invoices" 
        component={InvoicesList} 
        options={{ tabBarLabel: 'Tài chính' }}
      />
      <Tab.Screen 
        name="Residents" 
        component={TenantsManagement}
        options={{ tabBarLabel: 'Cư dân' }}
      />
      <Tab.Screen 
        name="Rooms" 
        component={RoomsManagement} 
        options={{ tabBarLabel: 'Căn hộ' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ tabBarLabel: 'Cài đặt' }}
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
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
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

          <Stack.Screen name="hop-dong" component={ContractsList} />

          <Stack.Screen name="hop-dong/loc">
            {() => (
              <GenericScreen 
                title="Bộ lọc Hợp đồng" 
                type="contract" 
                description="Tìm kiếm và chọn lọc hợp đồng thuê phòng theo trạng thái, ngày bắt đầu/kết thúc." 
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="hop-dong/moi" component={CreateContract} />

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


          <Stack.Screen name="toa-nha" component={RoomsManagement} />
          <Stack.Screen name="toa-nha/them" component={CreateBuilding} />

          <Stack.Screen name="thiet-bi" component={DevicesList} />
          <Stack.Screen name="thiet-bi/them" component={CreateDevice} />
          <Stack.Screen name="cu-dan/danh-sach" component={TenantsList} />
          <Stack.Screen name="cu-dan/them" component={CreateTenant} />
          <Stack.Screen name="cu-dan/chi-tiet" component={TenantDetail} />

          <Stack.Screen name="dien-nuoc" component={UtilityManagement} />
          <Stack.Screen name="dien-nuoc/ghi" component={UtilityRecording} />
          <Stack.Screen name="hoa-don/them" component={CreateInvoice} />

          <Stack.Screen name="cau-hinh-gia" component={ServicesList} />
          <Stack.Screen name="cau-hinh-gia/them" component={CreateService} />

          <Stack.Screen name="cai-dat" component={SettingsScreen} />
          <Stack.Screen name="cai-dat/chinh-sua" component={EditProfile} />
          <Stack.Screen name="cai-dat/ngan-hang" component={AddBankAccount} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
