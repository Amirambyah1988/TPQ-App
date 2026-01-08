
import React, { useState } from 'react';
import { Student, AttendanceRecord, AttendanceStatus } from '../types';

interface AttendanceTrackerProps {
  students: Student[];
  attendance: AttendanceRecord[];
  onMark: (studentId: string, date: string, status: AttendanceStatus) => void;
}

const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({ students, attendance, onMark }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const getStatus = (studentId: string) => {
    return attendance.find(a => a.studentId === studentId && a.date === selectedDate)?.status;
  };

  const statusOptions: { label: string, value: AttendanceStatus, color: string }[] = [
    { label: 'H', value: 'Hadir', color: 'bg-emerald-500' },
    { label: 'I', value: 'Izin', color: 'bg-blue-500' },
    { label: 'S', value: 'Sakit', color: 'bg-amber-500' },
    { label: 'A', value: 'Alpa', color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Absensi Harian</h2>
          <p className="text-slate-500 text-sm">Catat kehadiran santri setiap pertemuan.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
          <i className="fa-solid fa-calendar-day text-emerald-600 ml-2"></i>
          <input 
            type="date" 
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="outline-none text-slate-700 font-medium"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Nama Santri</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Kelas</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider text-center">Status Kehadiran</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {students.map(s => {
              const currentStatus = getStatus(s.id);
              return (
                <tr key={s.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-medium text-slate-800">{s.name}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm">{s.class}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      {statusOptions.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => onMark(s.id, selectedDate, opt.value)}
                          title={opt.value}
                          className={`
                            w-10 h-10 rounded-full font-bold transition-all flex items-center justify-center border-2
                            ${currentStatus === opt.value 
                              ? `${opt.color} text-white border-transparent scale-110 shadow-md` 
                              : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
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

export default AttendanceTracker;
