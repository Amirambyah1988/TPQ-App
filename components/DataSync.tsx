
import React, { useRef, useState } from 'react';
import { Student, Asatidz, AttendanceRecord, AsatidzAttendanceRecord, PaymentRecord, ProgressRecord } from '../types';

interface DataSyncProps {
  students: Student[];
  asatidz: Asatidz[];
  attendance: AttendanceRecord[];
  asatidzAttendance: AsatidzAttendanceRecord[];
  payments: PaymentRecord[];
  progress: ProgressRecord[];
  onImport: (data: any) => void;
  syncId: string | null;
  isSyncing: boolean;
  onPull: (id?: string) => Promise<boolean>;
  onSetSyncId: (id: string | null) => void;
  onCreateSync: () => void;
}

const DataSync: React.FC<DataSyncProps> = ({ 
  students, asatidz, attendance, asatidzAttendance, payments, progress, onImport,
  syncId, isSyncing, onPull, onSetSyncId, onCreateSync
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inputSyncId, setInputSyncId] = useState('');
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);

  const calculateDataSize = () => {
    const data = JSON.stringify({ students, asatidz, attendance, asatidzAttendance, payments, progress });
    return (data.length / 1024).toFixed(2); // KB
  };

  const handleCopyKey = () => {
    if (syncId) {
      navigator.clipboard.writeText(syncId);
      setShowCopyTooltip(true);
      setTimeout(() => setShowCopyTooltip(false), 2000);
    }
  };

  const handleJoinSync = async () => {
    const cleanId = inputSyncId.trim();
    if (cleanId.length < 5) return alert('Kode Secure Key tidak valid!');
    
    if (confirm('Hubungkan dengan Cloud Storage ini? Data lokal Anda akan digantikan dengan data dari Cloud.')) {
      const success = await onPull(cleanId);
      if (success) {
        onSetSyncId(cleanId);
      }
    }
  };

  const handleExport = () => {
    const data = { students, asatidz, attendance, asatidzAttendance, payments, progress, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MEGA_BACKUP_TPQ_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (confirm('Impor data dari backup file? Ini akan menimpa data saat ini.')) onImport(json);
      } catch (err) { alert('Format file backup tidak didukung!'); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500 max-w-5xl mx-auto pb-20">
      {/* Header Ala MEGA */}
      <div className="bg-[#1a1a1a] p-10 md:p-16 rounded-[3rem] text-white shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <i className="fa-solid fa-cloud text-[15rem] text-red-600 rotate-12"></i>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-red-600 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-red-900/40 border-2 border-white/10">
              <span className="font-black italic">M</span>
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight leading-none uppercase">Mega Cloud Sync</h2>
              <div className="flex items-center gap-2 mt-2">
                 <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                 <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">End-to-End Encrypted Storage</p>
              </div>
            </div>
          </div>
          
          <p className="text-slate-400 text-sm font-bold opacity-80 leading-relaxed max-w-2xl">
            Sistem ini memungkinkan sinkronisasi data antar perangkat Ustadz. Cukup gunakan satu <b>Secure Key</b> untuk semua pengajar di TPQ Anda.
          </p>
          
          <div className="mt-12 p-8 bg-black/40 rounded-[2.5rem] border border-white/10 backdrop-blur-xl shadow-inner">
            {syncId ? (
              <div className="flex flex-col items-center text-center gap-8">
                <div className="w-full">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">KUNCI SYNC ANDA (SALIN & BAGIKAN)</p>
                  <div className="relative inline-block group">
                    <div 
                      onClick={handleCopyKey}
                      className="flex items-center gap-4 bg-red-600/10 hover:bg-red-600/20 px-8 py-6 rounded-[2rem] border-2 border-red-600/30 cursor-pointer transition-all active:scale-95"
                    >
                      <i className="fa-solid fa-key text-red-500 text-xl"></i>
                      <code className="text-2xl md:text-3xl font-black font-mono text-white tracking-wider">{syncId}</code>
                      <i className="fa-solid fa-copy text-slate-500 group-hover:text-white transition-colors"></i>
                    </div>
                    {showCopyTooltip && (
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest animate-bounce shadow-xl">
                        Tersalin!
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-red-400/60 mt-6 font-bold uppercase tracking-tighter italic">Gunakan kunci ini di HP ustadz lain agar data otomatis sama.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                  <button 
                    onClick={() => onPull()} 
                    disabled={isSyncing} 
                    className="px-10 py-5 bg-red-600 text-white font-black rounded-2xl text-[11px] uppercase tracking-widest shadow-xl shadow-red-900/20 active:scale-95 transition-all hover:bg-red-700 disabled:opacity-50"
                  >
                    {isSyncing ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : <i className="fa-solid fa-arrows-rotate mr-2"></i>}
                    Sinkronkan Sekarang
                  </button>
                  <button 
                    onClick={() => onSetSyncId(null)} 
                    className="px-10 py-5 bg-white/5 text-slate-400 font-black rounded-2xl text-[11px] uppercase tracking-widest border border-white/10 hover:bg-white/10 hover:text-white transition-all"
                  >
                    Putus Koneksi
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-8 relative">
                    <i className="fa-solid fa-shield-halved absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"></i>
                    <input 
                      type="text" 
                      placeholder="Tempel Kunci dari Ustadz lain di sini..." 
                      value={inputSyncId} 
                      onChange={e => setInputSyncId(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-5 outline-none text-white font-bold focus:border-red-500 transition-colors shadow-inner"
                    />
                  </div>
                  <button 
                    onClick={handleJoinSync} 
                    disabled={isSyncing || !inputSyncId.trim()}
                    className="md:col-span-4 px-10 py-5 bg-red-600 text-white font-black rounded-2xl text-[11px] uppercase tracking-widest shadow-xl hover:bg-red-700 disabled:opacity-50 transition-all active:scale-95"
                  >
                    {isSyncing ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : <i className="fa-solid fa-link mr-2"></i>}
                    Hubungkan
                  </button>
                </div>
                
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                  <div className="relative flex justify-center"><span className="bg-[#1a1a1a] px-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Atau buat kunci baru</span></div>
                </div>

                <button 
                  onClick={onCreateSync} 
                  disabled={isSyncing}
                  className="w-full py-5 bg-white text-slate-900 font-black rounded-2xl text-[11px] uppercase tracking-widest hover:bg-slate-200 disabled:opacity-50 shadow-lg shadow-white/5 transition-all"
                >
                  {isSyncing ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : <i className="fa-solid fa-cloud-arrow-up mr-2"></i>}
                  Inisialisasi Cloud & Dapatkan Kunci Baru
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Guide Section */}
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
        <h3 className="text-xl font-black text-slate-800 mb-8 uppercase tracking-tight flex items-center gap-3">
          <i className="fa-solid fa-circle-info text-red-600"></i> Cara Mendapatkan & Menggunakan Kunci
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StepCard 
            number="01" 
            title="Klik Inisialisasi" 
            desc="Jika Anda adalah pengelola utama, klik tombol 'Inisialisasi Cloud' untuk mendaftarkan data TPQ ke server." 
          />
          <StepCard 
            number="02" 
            title="Salin Kunci Unik" 
            desc="Sistem akan memberikan kode unik (misal: 7a8b...). Salin kode ini dan kirim ke Ustadz lain via WhatsApp." 
          />
          <StepCard 
            number="03" 
            title="Hubungkan Perangkat" 
            desc="Ustadz lain cukup menempelkan kunci tersebut di kolom 'Hubungkan' untuk menarik data yang sama." 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-red-500 transition-all border-b-8 border-b-red-500/10">
          <div className="w-20 h-20 rounded-[1.5rem] bg-red-50 text-red-600 flex items-center justify-center text-3xl mb-8 shadow-inner group-hover:bg-red-600 group-hover:text-white transition-all duration-500 group-hover:rotate-6">
            <i className="fa-solid fa-file-shield"></i>
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-3 uppercase tracking-tight">Manual Backup</h3>
          <p className="text-slate-400 text-xs font-bold mb-10 uppercase tracking-widest leading-relaxed px-6">Simpan file backup secara lokal jika ingin melakukan pemindahan data manual.</p>
          <button onClick={handleExport} className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl text-[11px] hover:bg-black transition-all uppercase tracking-widest shadow-lg shadow-slate-200">
             Export Data (.JSON)
          </button>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:border-slate-800 transition-all border-b-8 border-b-slate-800/10">
          <div className="w-20 h-20 rounded-[1.5rem] bg-slate-100 text-slate-800 flex items-center justify-center text-3xl mb-8 shadow-inner group-hover:bg-slate-800 group-hover:text-white transition-all duration-500 group-hover:-rotate-6">
            <i className="fa-solid fa-file-import"></i>
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-3 uppercase tracking-tight">Restore Data</h3>
          <p className="text-slate-400 text-xs font-bold mb-10 uppercase tracking-widest leading-relaxed px-6">Pulihkan data Anda dari file backup yang telah disimpan sebelumnya.</p>
          <button onClick={() => fileInputRef.current?.click()} className="w-full py-5 bg-slate-100 text-slate-600 font-black rounded-2xl text-[11px] hover:bg-slate-200 transition-all uppercase tracking-widest">
            Import Backup File
          </button>
          <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
        </div>
      </div>
    </div>
  );
};

const StepCard = ({ number, title, desc }: { number: string, title: string, desc: string }) => (
  <div className="relative p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
    <span className="absolute -top-4 -left-4 w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center font-black text-sm shadow-lg shadow-red-200">{number}</span>
    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-2 mt-2">{title}</h4>
    <p className="text-[11px] font-bold text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

export default DataSync;
