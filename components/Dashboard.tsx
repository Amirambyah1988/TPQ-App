
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import { Student, Asatidz, AttendanceRecord, AsatidzAttendanceRecord, PaymentRecord } from '../types';
import { MONTHS } from '../constants';

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

  // Metrics
  const totalStudents = students.length;
  const totalAsatidz = asatidz.length;
  const paidCurrentMonth = payments.filter(p => p.month === currentMonth && p.year === currentYear && p.status === 'Lunas').length;
  const paymentPercentage = totalStudents > 0 ? (paidCurrentMonth / totalStudents) * 100 : 0;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const presentToday = attendance.filter(a => a.date === todayStr && a.status === 'Hadir').length;
  const asatidzPresentToday = asatidzAttendance.filter(a => a.date === todayStr && a.status === 'Hadir').length;

  const ratio = totalAsatidz > 0 ? (totalStudents / totalAsatidz).toFixed(1) : totalStudents;

  // Chart Data: Attendance status distribution (Students)
  const attendanceDist = [
    { name: 'Hadir', value: attendance.filter(a => a.status === 'Hadir').length, color: '#10b981' },
    { name: 'Izin', value: attendance.filter(a => a.status === 'Izin').length, color: '#3b82f6' },
    { name: 'Sakit', value: attendance.filter(a => a.status === 'Sakit').length, color: '#f59e0b' },
    { name: 'Alpa', value: attendance.filter(a => a.status === 'Alpa').length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Chart Data: Class Distribution
  const classDist = students.reduce((acc, s) => {
    acc[s.class] = (acc[s.class] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const classData = Object.entries(classDist).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      {/* Top row: Core Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard icon="fa-users" label="Total Santri" value={totalStudents} color="bg-emerald-500" />
        <MetricCard icon="fa-chalkboard-user" label="Total Asatidz" value={totalAsatidz} color="bg-indigo-500" />
        <MetricCard icon="fa-calendar-check" label="Santri Hadir" value={presentToday} color="bg-blue-500" />
        <MetricCard icon="fa-user-check" label="Asatidz Hadir" value={asatidzPresentToday} color="bg-teal-500" />
        <MetricCard icon="fa-scale-balanced" label="Rasio Santri/Guru" value={ratio} color="bg-amber-500" />
        <MetricCard icon="fa-money-bill-wave" label="Lunas Syahriah" value={`${Math.round(paymentPercentage)}%`} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <i className="fa-solid fa-chart-bar text-emerald-600"></i> Distribusi Kelas Santri
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <h3 className="text-lg font-extrabold text-slate-800 mb-6 flex items-center gap-2">
            <i className="fa-solid fa-user-check text-blue-600"></i> Kehadiran Santri Total
          </h3>
          <div className="h-64 flex flex-col md:flex-row items-center justify-center gap-6">
            {attendanceDist.length > 0 ? (
              <>
                <div className="w-full h-full md:w-2/3">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={attendanceDist}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {attendanceDist.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-2 w-full md:w-1/3">
                  {attendanceDist.map(d => (
                    <div key={d.name} className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: d.color}}></div>
                      <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">{d.name}</span>
                      <span className="ml-auto text-sm font-extrabold text-slate-800">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3 border border-slate-100">
                   <i className="fa-solid fa-clipboard-question text-slate-200 text-2xl"></i>
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Belum ada data kehadiran hari ini.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, label, value, color }: { icon: string, label: string, value: string | number, color: string }) => (
  <div className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-slate-100 flex items-center gap-4 transition-all hover:shadow-md hover:-translate-y-1">
    <div className={`${color} w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
      <i className={`fa-solid ${icon} text-sm`}></i>
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest truncate">{label}</p>
      <p className="text-xl font-extrabold text-slate-800 tracking-tight">{value}</p>
    </div>
  </div>
);

export default Dashboard;
