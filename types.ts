
export type AttendanceStatus = 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';
export type UserRole = 'asatidz' | 'santri';

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  password?: string; // In a real app, this wouldn't be handled like this
  studentId?: string; // Linked student record for santri role
}

export interface Student {
  id: string;
  name: string;
  class: string;
  parentName: string;
  joinDate: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
}

export interface PaymentRecord {
  id: string;
  studentId: string;
  month: number; // 0-11
  year: number;
  amount: number;
  paidDate: string | null;
  status: 'Lunas' | 'Belum Lunas';
}

export type ViewType = 'dashboard' | 'students' | 'attendance' | 'payments' | 'reports' | 'my-progress' | 'my-payments';
