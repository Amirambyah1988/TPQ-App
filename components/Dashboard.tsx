
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import { Student, AttendanceRecord, PaymentRecord } from '../types';
import { MONTHS } from '../constants';

interface DashboardProps {
  students: Student[];
  attendance: AttendanceRecord[];
  payments: PaymentRecord[];
}

const Dashboard: React.FC<DashboardProps> = ({ students, attendance, payments }) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Metrics
  const totalStudents = students.length;
  const paidCurrentMonth = payments.filter(p => p.month === currentMonth && p.year === currentYear && p.status === 'Lunas').length;
  const paymentPercentage = totalStudents > 0 ? (paidCurrentMonth / totalStudents) * 100 : 0;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const presentToday = attendance.filter(a => a.date === todayStr && a.status === 'Hadir').length;

  // Chart Data: Attendance status distribution
  const attendanceDist = [
    { name: 'Hadir', value: attendance.filter(a => a.status === 'Hadir').length, color: '#10b981' },
    { name: 'Izin', value: attendance.filter(a => a.status === 'Izin').length, color: '#3b82f6' },
    { name: 'Sakit', value: attendance.filter(a => a.status === 'Sakit').length, color: '#f59e0b' },
    { name: 'Alpa', value: attendance.filter(a => a.status === 'Alpa').length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Chart Data: Payment history (last 6 months)
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const m = d.getMonth();
    const y = d.getFullYear();
    const count = payments.filter(p => p.month === m && p.year === y && p.status === 'Lunas').length;
    return { name: MONTHS[m].substring(0, 3), lunas: count };
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon="fa-users" label="Total Santri" value={totalStudents} color="bg-emerald-500" />
        <MetricCard icon="fa-calendar-check" label="Hadir Hari Ini" value={presentToday} color="bg-blue-500" />
        <MetricCard icon="fa-money-bill-wave" label="Lunas Syahriah" value={paidCurrentMonth} color="bg-amber-500" />
        <MetricCard icon="fa-chart-pie" label="Persentase Bayar" value={`${Math.round(paymentPercentage)}%`} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <i className="fa-solid fa-chart-line text-emerald-600"></i> Tren Pembayaran Syahriah
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last6Months}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="lunas" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <i className="fa-solid fa-user-check text-blue-600"></i> Distribusi Kehadiran (Kumulatif)
          </h3>
          <div className="h-64 flex items-center justify-center">
            {attendanceDist.length > 0 ? (
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
            ) : (
              <p className="text-slate-400 text-sm">Belum ada data kehadiran.</p>
            )}
            <div className="flex flex-col gap-2 ml-4">
              {attendanceDist.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: d.color}}></div>
                  <span className="text-xs text-slate-600 font-medium">{d.name}: {d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, label, value, color }: { icon: string, label: string, value: string | number, color: string }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
    <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg`}>
      <i className={`fa-solid ${icon} text-lg`}></i>
    </div>
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

export default Dashboard;
