
import React, { useState } from 'react';
import { Student, PaymentRecord } from '../types';
import { MONTHS, SYAHRIAH_AMOUNT } from '../constants';

interface PaymentTrackerProps {
  students: Student[];
  payments: PaymentRecord[];
  onTogglePayment: (studentId: string, month: number, year: number) => void;
}

const PaymentTracker: React.FC<PaymentTrackerProps> = ({ students, payments, onTogglePayment }) => {
  const currentYear = new Date().getFullYear();
  const [viewYear, setViewYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const getPaymentStatus = (studentId: string, month: number) => {
    return payments.find(p => p.studentId === studentId && p.month === month && p.year === viewYear);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Syahriah Bulanan</h2>
          <p className="text-slate-500 text-sm">Kelola iuran bulanan santri (Rp {SYAHRIAH_AMOUNT.toLocaleString()}/bulan).</p>
        </div>
        <div className="flex gap-2">
           <select 
            value={viewYear}
            onChange={e => setViewYear(Number(e.target.value))}
            className="bg-white px-3 py-2 rounded-xl shadow-sm border border-slate-100 outline-none"
          >
            {[currentYear - 1, currentYear, currentYear + 1].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select 
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
            className="bg-white px-3 py-2 rounded-xl shadow-sm border border-slate-100 outline-none"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Nama Santri</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Bulan</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Nominal</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {students.map(s => {
              const record = getPaymentStatus(s.id, selectedMonth);
              const isPaid = record?.status === 'Lunas';
              return (
                <tr key={s.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{s.name}</div>
                    <div className="text-xs text-slate-400">{s.class}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{MONTHS[selectedMonth]}</td>
                  <td className="px-6 py-4 text-slate-600 font-mono">Rp {SYAHRIAH_AMOUNT.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <button
                        onClick={() => onTogglePayment(s.id, selectedMonth, viewYear)}
                        className={`
                          px-6 py-2 rounded-full text-sm font-bold transition-all border-2
                          ${isPaid 
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700' 
                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                          }
                        `}
                      >
                        {isPaid ? <><i className="fa-solid fa-check-circle mr-2"></i>Lunas</> : 'Belum Bayar'}
                      </button>
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

export default PaymentTracker;
