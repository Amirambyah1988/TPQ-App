
import { Student, Asatidz } from './types';

export const TPQ_NAME = "TPQ Nurul Islam";
export const TPQ_LOCATION = "Cangkiran - Mijen";
export const TPQ_ADDRESS = "Jl. RM. Hadi Soebeno, Cangkiran, Mijen, Semarang";

export const INITIAL_ASATIDZ: Asatidz[] = [
  {
    id: 'a1',
    name: 'Ustadz Ahmad Hidayat',
    nik: '3201020304050601',
    phone: '081234567890',
    address: 'Jl. Masjid No. 12, Cangkiran',
    placeOfBirth: 'Semarang',
    dateOfBirth: '1990-05-10',
    education: 'S1 Pendidikan Agama Islam',
    specialization: 'Tahfidz & Tajwid',
    assignedClasses: ['Iqra 1', 'Iqra 2'],
    joinDate: '2022-05-20',
    status: 'Aktif',
    username: 'ahmad',
    password: '123'
  },
  {
    id: 'a2',
    name: 'Ustadzah Siti Maryam',
    nik: '3201020304050602',
    phone: '081234567891',
    address: 'Perum Gading Indah B3, Mijen',
    placeOfBirth: 'Kendal',
    dateOfBirth: '1995-08-15',
    education: 'D3 Komunikasi Islam',
    specialization: 'Fiqh & Adab',
    assignedClasses: ['Al-Quran'],
    joinDate: '2022-08-15',
    status: 'Aktif',
    username: 'siti',
    password: '123'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  { 
    id: '1', 
    name: 'Ahmad Fauzi', 
    nik: '1234567890123456',
    placeOfBirth: 'Semarang',
    dateOfBirth: '2015-05-12',
    address: 'Jl. Raya Cangkiran No. 5',
    fatherName: 'Slamet',
    motherName: 'Siti',
    class: 'Iqra 1', 
    joinDate: '2023-01-10',
    username: 'fauzi',
    password: '123'
  },
  { 
    id: '2', 
    name: 'Siti Aminah', 
    nik: '1234567890123457',
    placeOfBirth: 'Semarang',
    dateOfBirth: '2016-08-20',
    address: 'Perum Taman Mijen B-12',
    fatherName: 'Abdullah',
    motherName: 'Fatimah',
    class: 'Iqra 3', 
    joinDate: '2023-02-15',
    username: 'siti',
    password: '123'
  }
];

export const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const SYAHRIAH_AMOUNT = 50000;
