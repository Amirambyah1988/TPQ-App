
import React from 'react';
import { Student, AttendanceRecord, PaymentRecord, ProgressRecord, User, MemorizationStatus } from '../types';
import { MONTHS, SYAHRIAH_AMOUNT, TPQ_NAME, TPQ_LOCATION } from '../constants';

interface SantriViewProps {
  user: User;
  students: Student[];
  attendance: AttendanceRecord[];
  payments: PaymentRecord[];
  progress: ProgressRecord[];
}

const SantriView: React.FC<SantriViewProps> = ({ user, students, attendance, payments, progress }) => {
  const studentData = students.find(s => s.id === user.studentId) || students[0];
  const myAttendance = attendance.filter(a => a.studentId === studentData.id);
  const myPayments = payments.filter(p => p.studentId === studentData.id);
  const myProgress = progress
    .filter(p => p.studentId === studentData.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const latestProgress = myProgress[0];

  const presentCount = myAttendance.filter(a => a.status === 'Hadir').length;
  const totalMeetings = myAttendance.length;
  const attendanceRate = totalMeetings > 0 ? Math.round((presentCount / totalMeetings) * 100) : 0;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const recordThisMonth = myPayments.find(p => p.month === currentMonth && p.year === currentYear);
  const isPaidThisMonth = recordThisMonth?.status === 'Lunas';

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-8 md:p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
          <i className="fa-solid fa-book-quran text-[12rem] rotate-12"></i>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="w-28 h-28 rounded-[2.25rem] bg-white/20 border-2 border-white/30 flex items-center justify-center text-4xl font-black backdrop-blur-md shadow-2xl">
            {studentData.photo ? <img src={studentData.photo} className="w-full h-full object-cover rounded-[2.1rem]" /> : studentData.name.charAt(0)}
          </div>
          <div className="text-center md:text-left flex-grow">
            <div className="inline-flex items-center gap-2 bg-amber-400 text-emerald-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
              <i className="fa-solid fa-star"></i> Santri {TPQ_NAME}
            </div>
            <h2 className="text-3xl font-black tracking-tight leading-none mb-2">Assalamu'alaikum, {studentData.name}!</h2>
            <p className="text-emerald-50 opacity-90 text-sm font-bold italic max-w-lg">"Siapa yang membaca satu huruf dari Kitabullah, maka baginya satu kebaikan." (HR. Tirmidzi)</p>
            <div className="flex flex-wrap gap-2 mt-6 justify-center md:justify-start">
              <span className="bg-white/10 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest backdrop-blur-sm border border-white/10">Kelas: {studentData.class}</span>
              <span className="bg-white/10 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest backdrop-blur-sm border border-white/10">NIS: {studentData.id}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <HighlightCard 
          icon="fa-book-open-reader" 
          label="Capaian Terakhir" 
          value={latestProgress ? `${latestProgress.readingType} ${latestProgress.readingLevel}` : 'Baru'} 
          subtext={latestProgress ? `Halaman ${latestProgress.readingPage}` : 'Yuk mulai mengaji!'}
          color="emerald"
        />
        <HighlightCard 
          icon="fa-calendar-check" 
          label="Kehadiran" 
          value={`${attendanceRate}%`} 
          subtext={`${presentCount} Hari Aktif`}
          color="blue"
        />
        <HighlightCard 
          icon="fa-wallet" 
          label={`Syahriah ${MONTHS[currentMonth]}`} 
          value={isPaidThisMonth ? 'Lunas' : 'Belum Bayar'} 
          subtext={isPaidThisMonth ? `Rp ${recordThisMonth.amount.toLocaleString('id-ID')}` : 'Yuk Selesaikan!'}
          color={isPaidThisMonth ? 'teal' : 'red'}
        />
        <HighlightCard 
          icon="fa-mosque" 
          label="Target Hafalan" 
          value={latestProgress?.memorizationSurah || 'N/A'} 
          subtext={latestProgress?.memorizationSurahStatus === 'Lancar' ? 'Sudah Lancar' : 'Proses Menghafal'}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
            <div>
               <h3 className="font-black text-slate-800 tracking-tight">Lini Masa Belajar</h3>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Progress mengaji harian</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
               <i className="fa-solid fa-feather-pointed"></i>
            </div>
          </div>
          <div className="p-8 space-y-8 max-h-[600px] overflow-y-auto">
            {myProgress.length > 0 ? myProgress.map((p, idx) => (
              <div key={p.id} className="relative pl-10 pb-2">
                {idx !== myProgress.length - 1 && <div className="absolute left-[13px] top-8 bottom-0 w-0.5 bg-slate-100"></div>}
                <div className="absolute left-0 top-1.5 w-[26px] h-[26px] rounded-full bg-white border-4 border-emerald-500 flex items-center justify-center z-10 shadow-sm">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                </div>
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 transition-all hover:bg-emerald-50/50">
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{new Date(p.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${p.fluency === 'Lancar' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                      {p.fluency}
                    </span>
                  </div>
                  <h4 className="font-black text-slate-800 text-base">{p.readingType} {p.readingLevel}</h4>
                  <p className="text-xs text-slate-500 font-bold mt-1">Halaman: <span className="text-emerald-600 font-black">{p.readingPage}</span></p>
                  
                  {(p.memorizationSurah || p.memorizationDua || p.memorizationHadith || p.memorizationShalat || p.customMemorization?.length! > 0) && (
                    <div className="mt-5 pt-5 border-t border-slate-200 flex flex-wrap gap-2">
                       {p.memorizationSurah && <Tag label="Surat" value={p.memorizationSurah} status={p.memorizationSurahStatus} icon="fa-book-quran" />}
                       {p.memorizationDua && <Tag label="Doa" value={p.memorizationDua} status={p.memorizationDuaStatus} icon="fa-hands-praying" />}
                       {p.memorizationHadith && <Tag label="Hadits" value={p.memorizationHadith} status={p.memorizationHadithStatus} icon="fa-mosque" />}
                       {p.memorizationShalat && <Tag label="Shalat" value={p.memorizationShalat} status={p.memorizationShalatStatus} icon="fa-person-praying" />}
                       {p.customMemorization?.map((m, i) => (
                         <Tag key={i} label={m.label} value={m.value} status={m.status} icon="fa-bookmark" />
                       ))}
                    </div>
                  )}
                  {p.notes && <div className="mt-4 bg-white/50 p-3 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400 italic">"{p.notes}"</div>}
                </div>
              </div>
            )) : (
              <div className="py-24 text-center">
                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <i className="fa-solid fa-feather text-3xl text-slate-200"></i>
                </div>
                <p className="font-black text-slate-300 uppercase tracking-widest text-xs">Belum ada catatan belajar.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-50 flex justify-between items-center">
              <h3 className="font-black text-slate-800 tracking-tight">Rekap Presensi</h3>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center"><i className="fa-solid fa-calendar-check text-xs"></i></div>
            </div>
            <div className="divide-y divide-slate-50 max-h-[300px] overflow-y-auto">
              {myAttendance.slice().reverse().map(a => (
                <div key={a.id} className="px-8 py-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <p className="text-xs font-bold text-slate-700">{new Date(a.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}</p>
                  <span className={`px-4 py-1 rounded-xl text-[10px] font-black uppercase tracking-tighter border ${
                    a.status === 'Hadir' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                  }`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-slate-800 tracking-tight">Syahriah {currentYear}</h3>
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center"><i className="fa-solid fa-receipt text-xs"></i></div>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {MONTHS.map((m, i) => {
                const paid = myPayments.some(p => p.month === i && p.year === currentYear && p.status === 'Lunas');
                return (
                  <div key={m} className={`aspect-square rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${
                    paid ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-300'
                  }`}>
                    <span className="text-[9px] font-black uppercase mb-1">{m.substring(0, 3)}</span>
                    <i className={`fa-solid ${paid ? 'fa-check-double' : 'fa-circle-xmark'} text-[10px]`}></i>
                  </div>
                );
              })}
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Terbayar</p>
                <p className="text-lg font-black text-emerald-600 leading-none">
                  Rp {myPayments.filter(p => p.year === currentYear && p.status === 'Lunas').reduce((s, p) => s + p.amount, 0).toLocaleString('id-ID')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status Bulan Ini</p>
                <span className={`text-[10px] font-black uppercase tracking-widest ${isPaidThisMonth ? 'text-emerald-500' : 'text-red-400'}`}>
                  {isPaidThisMonth ? 'Lunas' : 'Belum Lunas'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Fix: Use React.FC to correctly handle reserved props like 'key' in mapped components
const Tag: React.FC<{ label: string; value: string; status?: MemorizationStatus; icon: string }> = ({ label, value, status, icon }) => (
  <div className="bg-white border border-slate-200 px-3 py-2 rounded-xl flex items-center gap-3 shadow-sm">
    <div className={`w-6 h-6 rounded-lg ${status === 'Lancar' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400'} flex items-center justify-center text-[10px]`}>
      <i className={`fa-solid ${icon}`}></i>
    </div>
    <div className="leading-tight">
      <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-0.5">{label} {status === 'Lancar' && '✅'}</p>
      <p className="text-[10px] font-black text-slate-700 leading-none">{value}</p>
    </div>
  </div>
);

const HighlightCard = ({ icon, label, value, subtext, color }: { icon: string, label: string, value: string, subtext: string, color: string }) => {
  const themes: any = {
    emerald: 'bg-emerald-50 text-emerald-600',
    teal: 'bg-teal-50 text-teal-600',
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-transform hover:-translate-y-2 group">
      <div className={`${themes[color] || themes.emerald} w-12 h-12 rounded-2xl flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-transform`}>
        <i className={`fa-solid ${icon} text-base`}></i>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 leading-none">{label}</p>
      <h4 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-2">{value}</h4>
      <p className="text-[10px] font-bold text-slate-500">{subtext}</p>
    </div>
  );
};

export default SantriView;
