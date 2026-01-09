
import React from 'react';
import { Student, Asatidz, AttendanceRecord, AsatidzAttendanceRecord, PaymentRecord } from '../types';

interface DashboardProps {
  students: Student[];
  asatidz: Asatidz[];
  attendance: AttendanceRecord[];
  asatidzAttendance: AsatidzAttendanceRecord[];
  payments: PaymentRecord[];
}

const Dashboard: React.FC<DashboardProps> = ({ students, asatidz, attendance, asatidzAttendance, payments }) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const todayStr = new Date().toISOString().split('T')[0];
  const hasSyncId = !!localStorage.getItem('tpq_sync_id');

  const totalStudents = students.length;
  const totalAsatidz = asatidz.length;
  const presentToday = attendance.filter(a => a.date === todayStr && a.status === 'Hadir').length;
  const asatidzPresentToday = asatidzAttendance.filter(a => a.date === todayStr && a.status === 'Hadir').length;
  
  const paidThisMonth = payments.filter(p => p.month === currentMonth && p.year === currentYear && p.status === 'Lunas').length;
  const paymentRate = totalStudents > 0 ? Math.round((paidThisMonth / totalStudents) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Ringkasan Sistem</h2>
          <div className="flex items-center gap-2 mt-1">
             <p className="text-sm font-bold text-slate-400 italic">Selamat mengabdi, Ustadz/Ustadzah!</p>
             {hasSyncId && (
               <span className="flex items-center gap-1.5 bg-red-50 text-red-600 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border border-red-100 shadow-sm">
                 <i className="fa-solid fa-cloud"></i> MEGA Sync Active
               </span>
             )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em]">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon="fa-users" 
          label="Total Santri" 
          value={totalStudents} 
          color="bg-red-600" 
          desc="Santri Aktif"
        />
        <StatCard 
          icon="fa-chalkboard-user" 
          label="Total Asatidz" 
          value={totalAsatidz} 
          color="bg-slate-800" 
          desc="Pengajar Aktif"
        />
        <StatCard 
          icon="fa-calendar-check" 
          label="Absensi Hari Ini" 
          value={`${presentToday}/${totalStudents}`} 
          color="bg-blue-600" 
          desc="Kehadiran Santri"
        />
        <StatCard 
          icon="fa-wallet" 
          label="Syahriah Bulan Ini" 
          value={`${paymentRate}%`} 
          color="bg-amber-500" 
          desc={`${paidThisMonth} Santri Lunas`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-3 uppercase tracking-tight">
                <i className="fa-solid fa-clock-rotate-left text-red-600"></i> Aktivitas Terakhir
              </h3>
           </div>
           <div className="space-y-4">
              <ActivityItem icon="fa-user-plus" label="Santri Baru" value={students[students.length-1]?.name || "-"} color="bg-red-50 text-red-600" />
              <ActivityItem icon="fa-hand-holding-dollar" label="Syahriah Terkumpul" value={`Rp ${(paidThisMonth * 50000).toLocaleString('id-ID')}`} color="bg-amber-50 text-amber-600" />
              <ActivityItem icon="fa-user-tie" label="Asatidz Hadir" value={`${asatidzPresentToday} Orang`} color="bg-slate-100 text-slate-800" />
           </div>
        </div>

        <div className="bg-[#1a1a1a] p-8 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <i className="fa-solid fa-quote-right text-[8rem] text-red-600"></i>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-red-500 italic">Mutiara Hikmah</p>
            <p className="text-lg font-bold leading-relaxed mb-6">
              "Sebaik-baik kalian adalah orang yang belajar Al-Qur'an dan mengajarkannya."
            </p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">— HR. Bukhari</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color, desc }: any) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
    <div className={`${color} w-12 h-12 rounded-2xl flex items-center justify-center text-white text-base mb-6 shadow-lg shadow-slate-100 group-hover:scale-110 transition-transform`}>
      <i className={`fa-solid ${icon}`}></i>
    </div>
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{label}</p>
    <h4 className="text-2xl font-black text-slate-800 tracking-tighter mb-2">{value}</h4>
    <p className="text-[9px] font-bold text-slate-400 italic opacity-70">{desc}</p>
  </div>
);

const ActivityItem = ({ icon, label, value, color }: any) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all">
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <i className={`fa-solid ${icon} text-sm`}></i>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
    <p className="text-xs font-black text-slate-700">{value}</p>
  </div>
);

export default Dashboard;
