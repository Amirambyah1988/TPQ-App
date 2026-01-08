
import React, { useState, useMemo } from 'react';
import { Student, PaymentRecord } from '../types';
import { MONTHS, SYAHRIAH_AMOUNT } from '../constants';

interface PaymentTrackerProps {
  students: Student[];
  payments: PaymentRecord[];
  onTogglePayment: (studentId: string, month: number, year: number, amount: number) => void;
}

const PaymentTracker: React.FC<PaymentTrackerProps> = ({ students, payments, onTogglePayment }) => {
  const currentYear = new Date().getFullYear();
  const [viewYear, setViewYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for dynamic nominal (default from constants)
  const [syahriahNominal, setSyahriahNominal] = useState(SYAHRIAH_AMOUNT);
  
  // UI State for Modals
  const [historyStudent, setHistoryStudent] = useState<Student | null>(null);
  const [paymentConfirm, setPaymentConfirm] = useState<{student: Student, month: number} | null>(null);

  // Filter students based on search query
  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.class.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  // Calculate Recap Metrics for selected month and year using ACTUAL record amounts
  const recap = useMemo(() => {
    const monthlyPayments = payments.filter(p => p.month === selectedMonth && p.year === viewYear && p.status === 'Lunas');
    const totalCollected = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);
    const paidCount = monthlyPayments.length;
    const unpaidCount = students.length - paidCount;
    const collectionRate = students.length > 0 ? Math.round((paidCount / students.length) * 100) : 0;

    return { totalCollected, paidCount, unpaidCount, collectionRate };
  }, [payments, students.length, selectedMonth, viewYear]);

  const getPaymentStatus = (studentId: string, month: number) => {
    return payments.find(p => p.studentId === studentId && p.month === month && p.year === viewYear);
  };

  const getStudentHistory = (studentId: string) => {
    return payments
      .filter(p => p.studentId === studentId && p.year === viewYear)
      .sort((a, b) => a.month - b.month);
  };

  const exportToCSV = () => {
    const headers = ['Nama Santri', 'Kelas', 'Bulan', 'Tahun', 'Nominal', 'Status', 'Tgl Bayar'];
    const rows = payments
      .filter(p => p.year === viewYear)
      .map(p => {
        const student = students.find(s => s.id === p.studentId);
        return [
          student?.name || 'Unknown',
          student?.class || '-',
          MONTHS[p.month],
          p.year,
          p.amount,
          p.status,
          p.paidDate ? new Date(p.paidDate).toLocaleString('id-ID') : '-'
        ];
      });
    
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `rekap_syahriah_${viewYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Syahriah Bulanan</h2>
          <p className="text-slate-500 text-sm font-medium">Monitoring iuran dan pelunasan syahriah santri.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button 
            onClick={exportToCSV}
            className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-all font-bold text-xs shadow-sm"
          >
            <i className="fa-solid fa-file-csv text-emerald-600"></i> Eksport {viewYear}
          </button>
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
            <i className="fa-solid fa-calendar text-emerald-500 text-xs"></i>
            <select 
              value={viewYear}
              onChange={e => setViewYear(Number(e.target.value))}
              className="bg-transparent outline-none text-xs font-bold text-slate-700"
            >
              {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
            <i className="fa-solid fa-calendar-check text-emerald-500 text-xs"></i>
            <select 
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent outline-none text-xs font-bold text-slate-700"
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Recap Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <RecapCard 
          label="Total Terkumpul" 
          value={`Rp ${recap.totalCollected.toLocaleString('id-ID')}`} 
          icon="fa-money-bill-trend-up" 
          color="emerald" 
          subtext={`Bulan ${MONTHS[selectedMonth]}`}
        />
        <RecapCard 
          label="Santri Lunas" 
          value={recap.paidCount} 
          icon="fa-user-check" 
          color="blue" 
          subtext="Sudah membayar"
        />
        <RecapCard 
          label="Belum Bayar" 
          value={recap.unpaidCount} 
          icon="fa-user-clock" 
          color="amber" 
          subtext="Menunggu iuran"
        />
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Laju Pelunasan</p>
            <span className="text-emerald-600 font-bold text-sm">{recap.collectionRate}%</span>
          </div>
          <div className="mt-2 h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${recap.collectionRate}%` }}></div>
          </div>
          <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase">Target {MONTHS[selectedMonth]}</p>
        </div>
      </div>

      {/* Configuration & Search */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="relative w-full md:w-80">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm"></i>
            <input 
              type="text" 
              placeholder="Cari nama santri..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Nominal Syahriah Aktif:</label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 group focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
              <span className="text-xs font-bold text-slate-400">Rp</span>
              <input 
                type="number"
                value={syahriahNominal}
                onChange={e => setSyahriahNominal(Number(e.target.value))}
                className="bg-transparent outline-none text-sm font-black text-emerald-600 w-24"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-8 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Santri</th>
                <th className="px-8 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Kelas</th>
                <th className="px-8 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">Status {MONTHS[selectedMonth]}</th>
                <th className="px-8 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right">Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.map(s => {
                const record = getPaymentStatus(s.id, selectedMonth);
                const isPaid = record?.status === 'Lunas';
                return (
                  <tr key={s.id} className="hover:bg-slate-50/50 group transition-colors">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs border ${isPaid ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{s.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">NIS: {s.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <span className="text-xs font-bold text-slate-500 uppercase">{s.class}</span>
                    </td>
                    <td className="px-8 py-4 text-center">
                      {isPaid ? (
                        <div className="flex flex-col items-center">
                          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border border-emerald-200">
                            <i className="fa-solid fa-check-circle mr-1"></i> Lunas
                          </span>
                          <span className="text-[8px] text-slate-400 font-bold mt-1 uppercase">Bayar: {new Date(record.paidDate!).toLocaleDateString('id-ID')}</span>
                        </div>
                      ) : (
                        <span className="bg-slate-100 text-slate-400 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border border-slate-200">
                          Belum Lunas
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setHistoryStudent(s)}
                          className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-emerald-600 hover:border-emerald-100 transition-all flex items-center justify-center shadow-sm"
                          title="Lihat Rekap Seluruh Bulan"
                        >
                          <i className="fa-solid fa-receipt text-xs"></i>
                        </button>
                        <button
                          onClick={() => isPaid ? onTogglePayment(s.id, selectedMonth, viewYear, record.amount) : setPaymentConfirm({student: s, month: selectedMonth})}
                          className={`
                            min-w-[100px] py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all border-2
                            ${isPaid 
                              ? 'bg-red-50 border-red-100 text-red-500 hover:bg-red-100 hover:border-red-200' 
                              : 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-100 hover:bg-emerald-700 active:scale-95'
                            }
                          `}
                        >
                          {isPaid ? 'Batal Bayar' : 'Bayar'}
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

      {/* Payment Confirmation Modal */}
      {paymentConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden">
            <div className="bg-emerald-600 p-8 text-center text-white">
              <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30 backdrop-blur-md">
                <i className="fa-solid fa-wallet text-2xl"></i>
              </div>
              <h3 className="text-xl font-extrabold">Bayar Syahriah</h3>
              <p className="text-emerald-100 text-xs mt-1 uppercase tracking-widest font-bold">Periode: {MONTHS[paymentConfirm.month]} {viewYear}</p>
            </div>
            <div className="p-8 text-center">
              <p className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest">Nominal Pembayaran</p>
              <h4 className="text-3xl font-black text-emerald-600 mt-2">Rp {syahriahNominal.toLocaleString('id-ID')}</h4>
              
              <div className="mt-8 bg-slate-50 p-5 rounded-2xl border border-slate-100 text-left">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Data Santri</p>
                <p className="text-sm font-bold text-slate-800 mt-1">{paymentConfirm.student.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Kelas {paymentConfirm.student.class}</p>
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => setPaymentConfirm(null)} 
                  className="flex-1 py-4 font-extrabold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all"
                >
                  Batal
                </button>
                <button 
                  onClick={() => {
                    onTogglePayment(paymentConfirm.student.id, paymentConfirm.month, viewYear, syahriahNominal);
                    setPaymentConfirm(null);
                  }} 
                  className="flex-1 py-4 font-extrabold text-white bg-emerald-600 rounded-2xl shadow-xl shadow-emerald-100 transition-all active:scale-95"
                >
                  Proses Bayar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student History Modal (Rekap per Anak) */}
      {historyStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-extrabold text-slate-800">Rekap Pembayaran</h3>
                <p className="text-xs text-emerald-600 font-bold uppercase mt-1">{historyStudent.name} • Tahun {viewYear}</p>
              </div>
              <button onClick={() => setHistoryStudent(null)} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-grow space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MONTHS.map((m, i) => {
                  const record = getPaymentStatus(historyStudent.id, i);
                  const isPaid = record?.status === 'Lunas';
                  return (
                    <div key={m} className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${isPaid ? 'bg-emerald-50 border-emerald-100 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                      <div>
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{m}</p>
                        <p className={`text-sm font-extrabold ${isPaid ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {isPaid ? `Rp ${record.amount.toLocaleString('id-ID')}` : 'Belum Bayar'}
                        </p>
                        {isPaid && (
                          <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">
                            Bayar: {new Date(record.paidDate!).toLocaleDateString('id-ID', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'})}
                          </p>
                        )}
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isPaid ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                        <i className={`fa-solid ${isPaid ? 'fa-check' : 'fa-clock'} text-[10px]`}></i>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Akumulasi Terbayar ({viewYear})</p>
                <p className="text-xl font-black text-emerald-600">
                  Rp {getStudentHistory(historyStudent.id).filter(p => p.status === 'Lunas').reduce((sum, p) => sum + p.amount, 0).toLocaleString('id-ID')}
                </p>
              </div>
              <button 
                onClick={() => setHistoryStudent(null)}
                className="bg-white border border-slate-200 px-6 py-2.5 rounded-xl font-extrabold text-sm text-slate-600 hover:bg-slate-100 transition-all shadow-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RecapCard = ({ label, value, icon, color, subtext }: { label: string, value: string | number, icon: string, color: string, subtext: string }) => {
  const colorClasses: any = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm transition-transform hover:-translate-y-1">
      <div className="flex justify-between items-start mb-3">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${colorClasses[color]}`}>
          <i className={`fa-solid ${icon} text-sm`}></i>
        </div>
        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mt-1">{label}</p>
      </div>
      <h4 className="text-xl font-extrabold text-slate-800 tracking-tight">{value}</h4>
      <p className="text-[9px] font-bold text-slate-400 uppercase mt-1.5 tracking-wider">{subtext}</p>
    </div>
  );
};

export default PaymentTracker;
