
export type AttendanceStatus = 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';
export type UserRole = 'asatidz' | 'santri';
export type FluencyLevel = 'Lancar' | 'Cukup' | 'Kurang';

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  password?: string;
  studentId?: string;
  asatidzId?: string;
}

export interface Asatidz {
  id: string;
  name: string;
  nik: string;
  phone: string;
  address: string;
  specialization: string; // e.g., Tajwid, Tahfidz, Fiqh
  assignedClasses: string[]; // Classes they teach
  joinDate: string;
  status: 'Aktif' | 'Cuti' | 'Non-Aktif';
  photo?: string;
}

export interface Student {
  id: string;
  name: string;
  nik: string;
  placeOfBirth: string;
  dateOfBirth: string;
  fatherName: string;
  motherName: string;
  class: string;
  joinDate: string;
  photo?: string; // base64 string
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
}

export interface AsatidzAttendanceRecord {
  id: string;
  asatidzId: string;
  date: string;
  status: AttendanceStatus;
}

export interface ProgressRecord {
  id: string;
  studentId: string;
  date: string;
  readingType: 'Iqra' | 'Al-Quran';
  readingLevel: string; // e.g., Volume 1 or Juz 30
  readingPage: string;
  fluency: FluencyLevel;
  memorizationSurah: string;
  memorizationDua: string;
  memorizationHadith: string;
  notes?: string;
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

export type ViewType = 'dashboard' | 'asatidz' | 'students' | 'attendance' | 'asatidz-attendance' | 'progress' | 'payments' | 'reports' | 'my-progress' | 'my-payments';
