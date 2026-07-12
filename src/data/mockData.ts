// Type definitions
export interface StatItem {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly change?: string;
  readonly icon: string;
  readonly isWarning?: boolean;
  readonly progress?: number;
  readonly progressText?: string;
}

export interface RevenueMonth {
  readonly month: string;
  readonly amount: string;
  readonly height: number; // For representation in CSS chart
}

export interface AlertItemType {
  readonly id: string;
  readonly type: 'error' | 'warning' | 'info';
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly actionText?: string;
}

export interface Transaction {
  readonly id: string;
  readonly roomCode: string;
  readonly tenantName: string;
  readonly type: string;
  readonly amount: string;
  readonly isExpense: boolean;
  readonly status: 'success' | 'pending' | 'overdue';
}

export interface Room {
  readonly id: string;
  readonly code: string;
  readonly type: string;
  readonly price: string;
  readonly area: string;
  readonly status: 'occupied' | 'empty' | 'maintenance';
  readonly tenant?: string;
  readonly floor: number;
}

export interface Contract {
  readonly id: string;
  readonly roomCode: string;
  readonly tenantName: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly deposit: string;
  readonly status: 'active' | 'expired' | 'pending';
}

export interface Tenant {
  readonly id: string;
  readonly name: string;
  readonly phone: string;
  readonly email: string;
  readonly cccd: string;
  readonly roomCode: string;
  readonly status: 'active' | 'temporary';
}

export interface Device {
  readonly id: string;
  readonly name: string;
  readonly roomCode: string;
  readonly status: 'normal' | 'broken' | 'repairing';
  readonly lastCheck: string;
}

export interface Building {
  readonly id: string;
  readonly name: string;
  readonly address: string;
  readonly roomsCount: number;
  readonly floorsCount: number;
}

// Mock Data implementation
const dashboardStats: readonly StatItem[] = [
  {
    id: '1',
    label: 'Tổng doanh thu tháng này',
    value: '128.5M',
    change: '+12.4% so với tháng trước',
    icon: 'payments'
  },
  {
    id: '2',
    label: 'Tình trạng phòng',
    value: '5 / 20',
    icon: 'bed',
    progress: 75,
    progressText: '75% công suất lấp đầy'
  },
  {
    id: '3',
    label: 'Yêu cầu mới',
    value: '08',
    change: 'Cần phản hồi gấp',
    icon: 'message',
    isWarning: true
  }
];

const revenueHistory: readonly RevenueMonth[] = [
  { month: 'Th5', amount: '95M', height: 120 },
  { month: 'Th6', amount: '105M', height: 140 },
  { month: 'Th7', amount: '112M', height: 160 },
  { month: 'Th8', amount: '108M', height: 150 },
  { month: 'Th9', amount: '120M', height: 180 },
  { month: 'Th10', amount: '128.5M', height: 200 }
];

const emergencyAlerts: readonly AlertItemType[] = [
  {
    id: '1',
    type: 'error',
    title: 'Phòng 102 quá hạn',
    description: 'Quá hạn thanh toán 3 ngày. Tổng nợ: 4.500.000đ',
    icon: 'report',
    actionText: 'Xử lý ngay'
  },
  {
    id: '2',
    type: 'warning',
    title: 'Sửa điện phòng 305',
    description: 'Khách báo mất điện đột ngột tại ổ cắm khu vực bếp.',
    icon: 'electrical_services',
    actionText: 'Điều thợ đến'
  },
  {
    id: '3',
    type: 'info',
    title: 'Kiểm tra nước định kỳ',
    description: 'Lịch ghi số nước cho toàn bộ tòa nhà vào sáng mai.',
    icon: 'water_drop'
  }
];

const recentTransactions: readonly Transaction[] = [
  {
    id: '1',
    roomCode: 'P.201',
    tenantName: 'Nguyễn Văn An',
    type: 'Tiền phòng',
    amount: '5,200,000đ',
    isExpense: false,
    status: 'success'
  },
  {
    id: '2',
    roomCode: 'P.402',
    tenantName: 'Lê Thị Bích',
    type: 'Tiền điện & nước',
    amount: '850,000đ',
    isExpense: false,
    status: 'success'
  },
  {
    id: '3',
    roomCode: 'P.102',
    tenantName: 'Trần Văn Cường',
    type: 'Tiền phòng',
    amount: '4,500,000đ',
    isExpense: true,
    status: 'overdue'
  }
];

export const mockRooms: readonly Room[] = [
  { id: '1', code: 'P.101', type: 'Phòng Đơn', price: '3,500,000đ', area: '20m²', status: 'occupied', tenant: 'Trần Bình Minh', floor: 1 },
  { id: '2', code: 'P.102', type: 'Phòng Đơn', price: '3,500,000đ', area: '20m²', status: 'occupied', tenant: 'Trần Văn Cường', floor: 1 },
  { id: '3', code: 'P.201', type: 'Phòng Đôi', price: '5,200,000đ', area: '30m²', status: 'occupied', tenant: 'Nguyễn Văn An', floor: 2 },
  { id: '4', code: 'P.202', type: 'Phòng Đôi', price: '5,200,000đ', area: '30m²', status: 'empty', floor: 2 },
  { id: '5', code: 'P.301', type: 'Phòng Vip', price: '7,000,000đ', area: '40m²', status: 'occupied', tenant: 'Phạm Thanh Sơn', floor: 3 },
  { id: '6', code: 'P.305', type: 'Phòng Đơn', price: '3,800,000đ', area: '22m²', status: 'occupied', tenant: 'Lê Hoàng Long', floor: 3 }
];

export const mockContracts: readonly Contract[] = [
  { id: '1', roomCode: 'P.201', tenantName: 'Nguyễn Văn An', startDate: '01/01/2023', endDate: '01/01/2024', deposit: '10,000,000đ', status: 'active' },
  { id: '2', roomCode: 'P.102', tenantName: 'Trần Văn Cường', startDate: '15/03/2023', endDate: '15/09/2023', deposit: '7,000,000đ', status: 'expired' },
  { id: '3', roomCode: 'P.301', tenantName: 'Phạm Thanh Sơn', startDate: '01/06/2023', endDate: '01/06/2024', deposit: '14,000,000đ', status: 'active' }
];

export const mockTenants: readonly Tenant[] = [
  { id: '1', name: 'Nguyễn Văn An', phone: '0987654321', email: 'an.nv@gmail.com', cccd: '012345678901', roomCode: 'P.201', status: 'active' },
  { id: '2', name: 'Lê Thị Bích', phone: '0912345678', email: 'bich.lt@gmail.com', cccd: '012345678902', roomCode: 'P.402', status: 'active' },
  { id: '3', name: 'Trần Văn Cường', phone: '0909090909', email: 'cuong.tv@gmail.com', cccd: '012345678903', roomCode: 'P.102', status: 'active' }
];

export const mockDevices: readonly Device[] = [
  { id: '1', name: 'Điều hòa Daikin 12000 BTU', roomCode: 'P.201', status: 'normal', lastCheck: '12/05/2023' },
  { id: '2', name: 'Tủ lạnh Panasonic 180L', roomCode: 'P.201', status: 'normal', lastCheck: '12/05/2023' },
  { id: '3', name: 'Bình nóng lạnh Ariston 20L', roomCode: 'P.305', status: 'repairing', lastCheck: '20/09/2023' }
];

export const mockBuildings: readonly Building[] = [
  { id: '1', name: 'Home247 Landmark', address: 'Số 123 Đường Cầu Giấy, Hà Nội', roomsCount: 20, floorsCount: 5 },
  { id: '2', name: 'Home247 Riverside', address: 'Số 456 Đường Nguyễn Hữu Thọ, TP. HCM', roomsCount: 15, floorsCount: 4 }
];
