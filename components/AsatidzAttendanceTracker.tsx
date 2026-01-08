
import React, { useState } from 'react';
import { Asatidz, AsatidzAttendanceRecord, AttendanceStatus } from '../types';
import { MONTHS } from '../constants';

interface AsatidzAttendanceTrackerProps {
  asatidz: Asatidz[];
  attendance: AsatidzAttendanceRecord[];
  onMark: (asatidzId: string, date: string, status: AttendanceStatus) => void;
}

const AsatidzAttendanceTracker: React.FC<AsatidzAttendanceTrackerProps> = ({ asatidz, attendance, onMark }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const getStatus = (id: string) => {
    return attendance.find(a => a.asatidzId === id && a.date === selectedDate)?.status;
  };

  const statusOptions: { label: string, value: AttendanceStatus, color: string }[] = [
    { label: 'H', value: 'Hadir', color: 'bg-emerald-500' },
    { label: 'I', value: 'Izin', color: 'bg-blue-500' },
    { label: 'S', value: 'Sakit', color: 'bg-amber-500' },
    { label: 'A', value: 'Alpa', color: 'bg-red-500' },
  ];

  const downloadRekap = (type: 'daily' | 'weekly' | 'monthly') => {
    const dateObj = new Date(selectedDate);
    let filteredRecords = attendance;
    let fileName = '';

    if (type === 'daily') {
      filteredRecords = attendance.filter(a => a.date === selectedDate);
      fileName = `rekap_harian_asatidz_${selectedDate}.csv`;
    } else if (type === 'monthly') {
      const monthStr = selectedDate.substring(0, 7);
      filteredRecords = attendance.filter(a => a.date.startsWith(monthStr));
      fileName = `rekap_bulanan_asatidz_${MONTHS[dateObj.getMonth()]}_${dateObj.getFullYear()}.csv`;
    } else if (type === 'weekly') {
      const start = new Date(dateObj);
      start.setDate(start.getDate() - 6);
      filteredRecords = attendance.filter(a => {
        const d = new Date(a.date);
        return d >= start && d <= dateObj;
      });
      fileName = `rekap_mingguan_asatidz_${start.toISOString().split('T')[0]}_to_${selectedDate}.csv`;
    }

    const headers = ['Tanggal', 'Nama Asatidz', 'Bidang', 'Status'];
    const rows = filteredRecords.map(a => {
      const u = asatidz.find(item => item.id === a.asatidzId);
      return [a.date, u?.name || 'Unknown', u?.specialization || '-', a.status];
    });

    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Presensi Asatidz</h2>
          <p className="text-slate-500 text-sm">Monitoring kehadiran pengajar TPQ.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-xl shadow-sm border border-slate-100">
            <i className="fa-solid fa-calendar-day text-emerald-600"></i>
            <input 
              type="date" 
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="outline-none text-slate-700 font-medium text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => downloadRekap('daily')} className="text-[10px] font-bold bg-white border border-slate-200 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 uppercase">Daily</button>
            <button onClick={() => downloadRekap('weekly')} className="text-[10px] font-bold bg-white border border-slate-200 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 uppercase">Weekly</button>
            <button onClick={() => downloadRekap('monthly')} className="text-[10px] font-bold bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl text-emerald-700 hover:bg-emerald-100 uppercase">Monthly</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Asatidz</th>
              <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Bidang</th>
              <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">Kehadiran</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {asatidz.map(u => {
              const currentStatus = getStatus(u.id);
              return (
                <tr key={u.id} className="hover:bg-slate-50/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                       <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-xs overflow-hidden">
                         {u.photo ? <img src={u.photo} className="w-full h-full object-cover" /> : u.name.charAt(0)}
                       </div>
                       <span className="font-bold text-slate-800 text-sm">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-500">{u.specialization}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-1.5">
                      {statusOptions.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => onMark(u.id, selectedDate, opt.value)}
                          className={`
                            w-9 h-9 rounded-xl font-bold transition-all flex items-center justify-center text-xs
                            ${currentStatus === opt.value 
                              ? `${opt.color} text-white shadow-lg shadow-emerald-100 scale-110` 
                              : 'bg-slate-50 text-slate-300 hover:text-slate-500 hover:bg-slate-100'
                            }
                          `}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AsatidzAttendanceTracker;
