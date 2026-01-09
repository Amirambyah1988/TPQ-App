
export type AttendanceStatus = 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';
export type UserRole = 'asatidz' | 'santri';
export type FluencyLevel = 'Lancar' | 'Cukup' | 'Kurang';
export type MemorizationStatus = 'Lancar' | 'Belum';

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
  placeOfBirth: string;
  dateOfBirth: string;
  education: string;
  specialization: string; // e.g., Tajwid, Tahfidz, Fiqh
  assignedClasses: string[]; // Classes they teach
  joinDate: string;
  status: 'Aktif' | 'Cuti' | 'Non-Aktif';
  photo?: string;
  username?: string; // Akun login asatidz
  password?: string; // Akun login asatidz
}

export interface Student {
  id: string;
  name: string;
  nik: string;
  placeOfBirth: string;
  dateOfBirth: string;
  address: string;
  fatherName: string;
  motherName: string;
  class: string;
  joinDate: string;
  photo?: string; // base64 string
  username?: string; // Akun login santri
  password?: string; // Akun login santri
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

export interface CustomMemorization {
  label: string;
  value: string;
  status: MemorizationStatus;
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
  memorizationSurahStatus?: MemorizationStatus;
  memorizationDua: string;
  memorizationDuaStatus?: MemorizationStatus;
  memorizationHadith: string;
  memorizationHadithStatus?: MemorizationStatus;
  memorizationShalat: string;
  memorizationShalatStatus?: MemorizationStatus;
  customMemorization?: CustomMemorization[];
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
