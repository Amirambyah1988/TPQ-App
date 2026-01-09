
import React, { useState, useMemo } from 'react';
import { Student, PaymentRecord } from '../types';
import { MONTHS, SYAHRIAH_AMOUNT, TPQ_NAME } from '../constants';

interface PaymentTrackerProps {
  students: Student[];
  payments: PaymentRecord[];
  onTogglePayment: (studentId: string, month: number, year: number, amount: number) => void;
  onBulkPayment: (studentId: string, selectedMonths: number[], year: number, monthlyAmount: number) => void;
}

const PaymentTracker: React.FC<PaymentTrackerProps> = ({ students, payments, onTogglePayment, onBulkPayment }) => {
  const currentYear = new Date().getFullYear();
  const [viewYear, setViewYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [searchQuery, setSearchQuery] = useState('');
  const [syahriahNominal, setSyahriahNominal] = useState(SYAHRIAH_AMOUNT);
  
  const [historyStudent, setHistoryStudent] = useState<Student | null>(null);
  const [paymentConfirm, setPaymentConfirm] = useState<{student: Student, selectedMonths: number[]} | null>(null);

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.class.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

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

  const sendWhatsAppNotification = (student: Student, month: number, amount: number) => {
    const message = `Assalamu'alaikum Warahmatullah Bpk/Ibu wali dari ${student.name}.%0A%0AAlhamdulillah, pembayaran Syahriah TPQ bulan *${MONTHS[month]} ${viewYear}* sebesar *Rp ${amount.toLocaleString('id-ID')}* telah kami terima.%0A%0A_Syukran Jazakumullah Khairan._%0A*Pengurus ${TPQ_NAME}*`;
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const openPaymentModal = (student: Student) => {
    setPaymentConfirm({ student, selectedMonths: [selectedMonth] });
  };

  const toggleMonthInModal = (month: number) => {
    if (!paymentConfirm) return;
    const current = [...paymentConfirm.selectedMonths];
    if (current.includes(month)) {
      setPaymentConfirm({ ...paymentConfirm, selectedMonths: current.filter(m => m !== month) });
    } else {
      setPaymentConfirm({ ...paymentConfirm, selectedMonths: [...current, month].sort((a,b) => a-b) });
    }
  };

  const selectNext3Months = () => {
    if (!paymentConfirm) return;
    const start = selectedMonth;
    const months = [start, (start + 1) % 12, (start + 2) % 12].filter(m => !getPaymentStatus(paymentConfirm.student.id, m));
    setPaymentConfirm({ ...paymentConfirm, selectedMonths: Array.from(new Set([...paymentConfirm.selectedMonths, ...months])).sort((a,b) => a-b) });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Syahriah Bulanan</h2>
          <p className="text-slate-500 text-sm font-bold">Manajemen iuran operasional TPQ.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase">Tahun</span>
            <select value={viewYear} onChange={e => setViewYear(Number(e.target.value))} className="text-xs font-black text-slate-700 outline-none bg-transparent">
              {[currentYear - 1, currentYear, currentYear + 1].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase">Bulan</span>
            <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className="text-xs font-black text-slate-700 outline-none bg-transparent">
              {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <RecapCard label="Terkumpul" value={`Rp ${recap.totalCollected.toLocaleString('id-ID')}`} icon="fa-money-bill-trend-up" color="emerald" subtext={MONTHS[selectedMonth]} />
        <RecapCard label="Lunas" value={recap.paidCount} icon="fa-user-check" color="blue" subtext="Santri" />
        <RecapCard label="Belum" value={recap.unpaidCount} icon="fa-user-clock" color="amber" subtext="Santri" />
        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</p>
            <p className="text-xs font-black text-emerald-600">{recap.collectionRate}%</p>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${recap.collectionRate}%` }}></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative w-full md:w-80">
            <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input type="text" placeholder="Cari nama/kelas..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-5 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner" />
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
            <label className="text-[10px] font-black text-slate-400 uppercase">Tarif:</label>
            <input type="number" value={syahriahNominal} onChange={e => setSyahriahNominal(Number(e.target.value))} className="w-24 bg-transparent text-sm font-black text-emerald-600 outline-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white border-b border-slate-100">
              <tr>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Santri</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.length > 0 ? filteredStudents.map(s => {
                const record = getPaymentStatus(s.id, selectedMonth);
                const isPaid = record?.status === 'Lunas';
                return (
                  <tr key={s.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-4">
                      <p className="font-black text-slate-800 text-sm leading-none mb-1">{s.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{s.class}</p>
                    </td>
                    <td className="px-8 py-4 text-center">
                      <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${isPaid ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                        {isPaid ? <><i className="fa-solid fa-check-circle mr-1"></i> Lunas</> : 'Belum Lunas'}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {isPaid && (
                          <button onClick={() => sendWhatsAppNotification(s, selectedMonth, record.amount)} className="w-9 h-9 rounded-xl bg-green-50 text-green-600 border border-green-100 hover:bg-green-500 hover:text-white flex items-center justify-center shadow-sm transition-all" title="Kirim Bukti WA"><i className="fa-brands fa-whatsapp text-xs"></i></button>
                        )}
                        <button onClick={() => setHistoryStudent(s)} className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 flex items-center justify-center shadow-sm" title="Riwayat"><i className="fa-solid fa-clock-rotate-left text-xs"></i></button>
                        <button onClick={() => isPaid ? onTogglePayment(s.id, selectedMonth, viewYear, record.amount) : openPaymentModal(s)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm ${isPaid ? 'bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white' : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'}`}>
                          {isPaid ? 'Batal' : 'Bayar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={3} className="px-8 py-16 text-center text-slate-400 italic text-sm font-bold uppercase tracking-widest">Data tidak ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Konfirmasi Pembayaran */}
      {paymentConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
            <div className="bg-emerald-600 p-8 text-center text-white relative">
              <button onClick={() => setPaymentConfirm(null)} className="absolute top-4 right-4 text-emerald-200 hover:text-white"><i className="fa-solid fa-times"></i></button>
              <h3 className="text-xl font-black tracking-tight uppercase">Pelunasan Syahriah</h3>
              <p className="text-emerald-100 text-[10px] mt-1 font-bold uppercase tracking-widest opacity-80">{paymentConfirm.student.name}</p>
            </div>
            
            <div className="p-8 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pilih Bulan ({viewYear})</p>
                  <button onClick={selectNext3Months} className="text-[9px] font-black text-emerald-600 uppercase bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-all">+ 3 Bulan</button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {MONTHS.map((m, i) => {
                    const alreadyPaid = !!getPaymentStatus(paymentConfirm.student.id, i);
                    const isSelected = paymentConfirm.selectedMonths.includes(i);
                    return (
                      <button 
                        key={m} 
                        disabled={alreadyPaid}
                        onClick={() => toggleMonthInModal(i)}
                        className={`py-3 rounded-2xl text-[9px] font-black uppercase border transition-all ${
                          alreadyPaid ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed' :
                          isSelected ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        {m.substring(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-3">
                 <div className="flex justify-between items-center text-slate-500">
                   <p className="text-[10px] font-black uppercase tracking-widest">Item</p>
                   <p className="text-sm font-black text-slate-700">{paymentConfirm.selectedMonths.length} Bulan</p>
                 </div>
                 <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                   <p className="text-xl font-black text-emerald-600">Rp {(paymentConfirm.selectedMonths.length * syahriahNominal).toLocaleString('id-ID')}</p>
                 </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setPaymentConfirm(null)} className="flex-1 py-4 font-black text-slate-400 text-sm">Batal</button>
                <button 
                  disabled={paymentConfirm.selectedMonths.length === 0}
                  onClick={() => {
                    onBulkPayment(paymentConfirm.student.id, paymentConfirm.selectedMonths, viewYear, syahriahNominal);
                    setPaymentConfirm(null);
                  }}
                  className="flex-1 py-4 font-black text-white bg-emerald-600 rounded-[1.25rem] shadow-xl hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50"
                >
                  Bayar Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Riwayat Bayar {viewYear}</h3>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mt-1">{historyStudent.name}</p>
              </div>
              <button onClick={() => setHistoryStudent(null)} className="w-10 h-10 rounded-full bg-white text-slate-400 border border-slate-200 shadow-sm flex items-center justify-center hover:text-slate-600"><i className="fa-solid fa-times"></i></button>
            </div>
            <div className="p-8 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MONTHS.map((m, i) => {
                const record = getPaymentStatus(historyStudent.id, i);
                const isPaid = record?.status === 'Lunas';
                return (
                  <div key={m} className={`p-5 rounded-3xl border transition-all ${isPaid ? 'bg-emerald-50 border-emerald-100 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{m}</p>
                    <div className="flex justify-between items-center">
                      <p className={`text-sm font-black ${isPaid ? 'text-emerald-700' : 'text-slate-400'}`}>{isPaid ? 'Lunas' : 'Belum'}</p>
                      {isPaid && <button onClick={() => sendWhatsAppNotification(historyStudent, i, record.amount)} className="text-emerald-500 hover:text-emerald-700"><i className="fa-brands fa-whatsapp text-lg"></i></button>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RecapCard = ({ label, value, icon, color, subtext }: any) => {
  const colorMap: any = {
    emerald: 'bg-emerald-500 text-white',
    blue: 'bg-blue-500 text-white',
    amber: 'bg-amber-500 text-white',
  };
  return (
    <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
      <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center text-xl ${colorMap[color]} shadow-lg`}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
        <p className="text-xl font-black text-slate-800 leading-none">{value}</p>
        <p className="text-[9px] font-bold text-slate-400 uppercase mt-2 italic opacity-60">{subtext}</p>
      </div>
    </div>
  );
};

export default PaymentTracker;
