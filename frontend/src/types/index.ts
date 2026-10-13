export type UserRole = 'ADMIN' | 'STAFF' | 'IT_SPECIALIST';

export type DeviceCategory = 
  | 'LAPTOP' 
  | 'DESKTOP' 
  | 'MONITOR' 
  | 'SERVER' 
  | 'PHONE' 
  | 'TABLET' 
  | 'PRINTER' 
  | 'NETWORK_DEVICE' 
  | 'OTHER';

export type DeviceStatus = 
  | 'AVAILABLE' 
  | 'ASSIGNED' 
  | 'FAULTY' 
  | 'IN_REPAIR' 
  | 'SCRAPPED';

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  role: UserRole;
  department: string | null;
  phone_number: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CurrentHolder {
  assignment_id: number;
  user_id: number;
  full_name: string;
  department: string | null;
  email: string;
  assigned_at: string;
}

export interface Device {
  id: number;
  asset_tag: string;
  serial_number: string;
  category: DeviceCategory;
  brand: string;
  model: string;
  specs: Record<string, any> | null;
  status: DeviceStatus;
  purchase_date: string | null;
  warranty_end_date: string | null;
  qr_code_path: string | null;
  barcode: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  current_holder?: CurrentHolder | null;
}

export interface Assignment {
  id: number;
  device_id: number;
  user_id: number;
  assigned_by_id: number;
  assigned_at: string;
  returned_at: string | null;
  expected_return_date: string | null;
  condition_at_assignment: string;
  condition_at_return: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
  device?: Device;
  assigned_by?: User;
}

export interface AuditLog {
  id: number;
  user_id: number | null;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ASSIGN' | 'RETURN' | 'STATUS_CHANGE' | 'AUTH_LOGIN' | 'AUTH_LOGOUT';
  entity_type: string;
  entity_id: string | null;
  description: string;
  changes: Record<string, any> | null;
  ip_address: string | null;
  created_at: string;
  user?: User;
}

export interface DashboardSummary {
  total_devices: number;
  available_devices: number;
  assigned_devices: number;
  faulty_devices: number;
  in_repair_devices: number;
  scrapped_devices: number;
  total_users: number;
  active_assignments: number;
  utilization_rate: number;
}

export interface StatusBreakdown {
  status: string;
  count: number;
  key: DeviceStatus;
  color: string;
}

export interface CategoryBreakdown {
  category: string;
  count: number;
}

export interface DepartmentBreakdown {
  department: string;
  count: number;
}

export interface DashboardStats {
  summary: DashboardSummary;
  status_breakdown: StatusBreakdown[];
  categories_breakdown: CategoryBreakdown[];
  departments_breakdown: DepartmentBreakdown[];
  recent_assignments: Array<{
    id: number;
    device_tag: string;
    device_name: string;
    user_name: string;
    user_dept: string;
    assigned_at: string;
    is_active: boolean;
  }>;
  recent_activities: Array<{
    id: number;
    action: string;
    entity_type: string;
    description: string;
    user_name: string;
    created_at: string;
  }>;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}
