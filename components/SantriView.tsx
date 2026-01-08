
import React from 'react';
import { Student, AttendanceRecord, PaymentRecord, User } from '../types';
import { MONTHS, SYAHRIAH_AMOUNT } from '../constants';

interface SantriViewProps {
  user: User;
  students: Student[];
  attendance: AttendanceRecord[];
  payments: PaymentRecord[];
}

const SantriView: React.FC<SantriViewProps> = ({ user, students, attendance, payments }) => {
  // Find linked student data
  const studentData = students.find(s => s.id === user.studentId) || students[0];
  const myAttendance = attendance.filter(a => a.studentId === studentData.id);
  const myPayments = payments.filter(p => p.studentId === studentData.id);

  const presentCount = myAttendance.filter(a => a.status === 'Hadir').length;
  const totalMeetings = myAttendance.length;
  const attendanceRate = totalMeetings > 0 ? Math.round((presentCount / totalMeetings) * 100) : 0;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const isPaidThisMonth = myPayments.some(p => p.month === currentMonth && p.year === currentYear && p.status === 'Lunas');

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 rounded-3xl text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold backdrop-blur-md">
            {studentData.name.charAt(0)}
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold">Assalamu'alaikum, {studentData.name}!</h2>
            <p className="text-emerald-50 opacity-90 mt-1">Tetap semangat belajar Al-Quran hari ini ya.</p>
            <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">Kelas: {studentData.class}</span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">ID: {studentData.id}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Kehadiran</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-800">{attendanceRate}%</span>
            <span className="text-slate-400 text-sm mb-1">Tingkat Absensi</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-4">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${attendanceRate}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Syahriah {MONTHS[currentMonth]}</p>
          <div className="flex items-center gap-3 mt-2">
             <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPaidThisMonth ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
               <i className={`fa-solid ${isPaidThisMonth ? 'fa-check' : 'fa-xmark'}`}></i>
             </div>
             <div>
               <p className={`font-bold ${isPaidThisMonth ? 'text-emerald-700' : 'text-red-700'}`}>
                 {isPaidThisMonth ? 'Sudah Lunas' : 'Belum Dibayar'}
               </p>
               <p className="text-slate-400 text-xs">Rp {SYAHRIAH_AMOUNT.toLocaleString()}</p>
             </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Hafalan & Progres</p>
          <div className="mt-2">
            <p className="font-bold text-slate-800">Target Bulan Ini:</p>
            <p className="text-slate-500 text-sm italic">"Menyelesaikan Juz Amma Surat Al-Buruj"</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Attendance History */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Riwayat Kehadiran</h3>
            <i className="fa-solid fa-calendar text-slate-300"></i>
          </div>
          <div className="divide-y divide-slate-50 max-h-[300px] overflow-y-auto">
            {myAttendance.length > 0 ? myAttendance.slice().reverse().map(a => (
              <div key={a.id} className="px-6 py-4 flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold text-slate-700">{new Date(a.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  a.status === 'Hadir' ? 'bg-emerald-50 text-emerald-700' :
                  a.status === 'Izin' ? 'bg-blue-50 text-blue-700' :
                  a.status === 'Sakit' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                }`}>
                  {a.status}
                </span>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-400 text-sm italic">Belum ada catatan kehadiran.</div>
            )}
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Riwayat Pembayaran</h3>
            <i className="fa-solid fa-receipt text-slate-300"></i>
          </div>
          <div className="divide-y divide-slate-50 max-h-[300px] overflow-y-auto">
            {myPayments.length > 0 ? myPayments.slice().reverse().map(p => (
              <div key={p.id} className="px-6 py-4 flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold text-slate-700">{MONTHS[p.month]} {p.year}</p>
                  <p className="text-xs text-slate-400">Rp {p.amount.toLocaleString()}</p>
                </div>
                <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">Lunas</span>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-400 text-sm italic">Belum ada riwayat pembayaran.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SantriView;
