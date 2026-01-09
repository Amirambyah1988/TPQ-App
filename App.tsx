
import React, { useState, useEffect, useCallback } from 'react';
import { Student, Asatidz, AttendanceRecord, AsatidzAttendanceRecord, ProgressRecord, PaymentRecord, ViewType, AttendanceStatus, User } from './types';
import { INITIAL_STUDENTS, INITIAL_ASATIDZ, TPQ_NAME, TPQ_LOCATION } from './constants';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import AsatidzList from './components/AsatidzList';
import AttendanceTracker from './components/AttendanceTracker';
import AsatidzAttendanceTracker from './components/AsatidzAttendanceTracker';
import ProgressTracker from './components/ProgressTracker';
import PaymentTracker from './components/PaymentTracker';
import ReportGenerator from './components/ReportGenerator';
import AuthScreen from './components/Auth/AuthScreen';
import SantriView from './components/SantriView';
import DataSync from './components/DataSync';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewType>('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [asatidz, setAsatidz] = useState<Asatidz[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [asatidzAttendance, setAsatidzAttendance] = useState<AsatidzAttendanceRecord[]>([]);
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'danger' | 'info'} | null>(null);
  
  const [syncId, setSyncId] = useState<string | null>(localStorage.getItem('tpq_sync_id'));
  const [isSyncing, setIsSyncing] = useState(false);

  const showToast = (message: string, type: 'success' | 'danger' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('tpq_session');
    if (savedUser) {
      try { setCurrentUser(JSON.parse(savedUser)); } catch (e) { localStorage.removeItem('tpq_session'); }
    }
    setStudents(JSON.parse(localStorage.getItem('tpq_students') || JSON.stringify(INITIAL_STUDENTS)));
    setAsatidz(JSON.parse(localStorage.getItem('tpq_asatidz') || JSON.stringify(INITIAL_ASATIDZ)));
    setAttendance(JSON.parse(localStorage.getItem('tpq_attendance') || '[]'));
    setAsatidzAttendance(JSON.parse(localStorage.getItem('tpq_asatidz_attendance') || '[]'));
    setProgress(JSON.parse(localStorage.getItem('tpq_progress') || '[]'));
    setPayments(JSON.parse(localStorage.getItem('tpq_payments') || '[]'));
  }, []);

  useEffect(() => {
    localStorage.setItem('tpq_students', JSON.stringify(students));
    localStorage.setItem('tpq_asatidz', JSON.stringify(asatidz));
    localStorage.setItem('tpq_attendance', JSON.stringify(attendance));
    localStorage.setItem('tpq_asatidz_attendance', JSON.stringify(asatidzAttendance));
    localStorage.setItem('tpq_progress', JSON.stringify(progress));
    localStorage.setItem('tpq_payments', JSON.stringify(payments));
  }, [students, asatidz, attendance, asatidzAttendance, progress, payments]);

  // Function to strip photos to keep data small for cloud sync (< 50KB limit of npoint)
  const getOptimizedData = () => {
    const cleanStudents = students.map(({ photo, ...rest }) => rest);
    const cleanAsatidz = asatidz.map(({ photo, ...rest }) => rest);
    return { 
      students: cleanStudents, 
      asatidz: cleanAsatidz, 
      attendance, 
      asatidzAttendance, 
      progress, 
      payments, 
      lastUpdate: new Date().toISOString() 
    };
  };

  const handlePushToCloud = async () => {
    if (!syncId) return;
    setIsSyncing(true);
    try {
      const data = getOptimizedData();
      const response = await fetch(`https://api.npoint.io/${syncId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) showToast('Data MEGA Sinkron!', 'success');
      else throw new Error('Response not OK');
    } catch (e) {
      console.error(e);
      showToast('Gagal Update Cloud (Cek Koneksi)', 'danger');
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePullFromCloud = async (targetId?: string) => {
    const id = targetId || syncId;
    if (!id) return false;
    setIsSyncing(true);
    try {
      const response = await fetch(`https://api.npoint.io/${id}`);
      if (response.ok) {
        const data = await response.json();
        // Merge data, keeping local photos if IDs match
        if (data.students) {
          const mergedStudents = data.students.map((s: Student) => {
            const local = students.find(ls => ls.id === s.id);
            return local ? { ...s, photo: local.photo } : s;
          });
          setStudents(mergedStudents);
        }
        if (data.asatidz) {
          const mergedAsatidz = data.asatidz.map((a: Asatidz) => {
            const local = asatidz.find(la => la.id === a.id);
            return local ? { ...a, photo: local.photo } : a;
          });
          setAsatidz(mergedAsatidz);
        }
        if (data.attendance) setAttendance(data.attendance);
        if (data.asatidzAttendance) setAsatidzAttendance(data.asatidzAttendance);
        if (data.progress) setProgress(data.progress);
        if (data.payments) setPayments(data.payments);
        showToast('Sinkronisasi MEGA Berhasil!', 'success');
        return true;
      } else throw new Error('Cloud Storage Tidak Ditemukan');
    } catch (e) {
      showToast('Secure Key Salah atau Expired', 'danger');
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateCloudSync = async () => {
    setIsSyncing(true);
    try {
      const data = getOptimizedData();
      // npoint creation endpoint
      const response = await fetch('https://api.npoint.io/bins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: data })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.id) {
          setSyncId(result.id);
          localStorage.setItem('tpq_sync_id', result.id);
          showToast('MEGA Storage Siap!', 'success');
        } else throw new Error('No ID returned');
      } else {
        const errData = await response.text();
        console.error("Npoint Error:", errData);
        throw new Error('Gagal membuat storage baru');
      }
    } catch (e) {
      console.error(e);
      showToast('Inisialisasi Gagal (Limit Ukuran Data?)', 'danger');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSetSyncId = (id: string | null) => {
    setSyncId(id);
    if (id) localStorage.setItem('tpq_sync_id', id);
    else localStorage.removeItem('tpq_sync_id');
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('tpq_session', JSON.stringify(user));
    setView(user.role === 'santri' ? 'my-progress' : 'dashboard');
    showToast(`Selamat datang, ${user.name}`);
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem('tpq_session');
    setCurrentUser(null);
    setView('dashboard');
  }, []);

  const handleAddStudent = (s: Omit<Student, 'id'>) => {
    setStudents(prev => [...prev, { ...s, id: 'st-' + Date.now() }]);
    showToast('Santri terdaftar');
  };

  const handleAddAsatidz = (u: Omit<Asatidz, 'id'>) => {
    setAsatidz(prev => [...prev, { ...u, id: 'at-' + Date.now() }]);
    showToast('Asatidz terdaftar');
  };

  const handleUpdateStudent = (updated: Student) => {
    setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
    showToast('Data Santri diperbarui');
  };

  const handleUpdateAsatidz = (updated: Asatidz) => {
    setAsatidz(prev => prev.map(u => u.id === updated.id ? updated : u));
    showToast('Data Asatidz diperbarui');
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    showToast('Data Santri dihapus', 'danger');
  };

  const handleDeleteAsatidz = (id: string) => {
    setAsatidz(prev => prev.filter(u => u.id !== id));
    showToast('Data Asatidz dihapus', 'danger');
  };

  const handleMarkAttendance = (studentId: string, date: string, status: AttendanceStatus) => {
    setAttendance(prev => {
      const idx = prev.findIndex(a => a.studentId === studentId && a.date === date);
      if (idx !== -1) {
        const up = [...prev];
        up[idx] = { ...up[idx], status };
        return up;
      }
      return [...prev, { id: 'att-' + Date.now(), studentId, date, status }];
    });
  };

  const handleMarkAsatidzAttendance = (asatidzId: string, date: string, status: AttendanceStatus) => {
    setAsatidzAttendance(prev => {
      const idx = prev.findIndex(a => a.asatidzId === asatidzId && a.date === date);
      if (idx !== -1) {
        const up = [...prev];
        up[idx] = { ...up[idx], status };
        return up;
      }
      return [...prev, { id: 'aat-' + Date.now(), asatidzId, date, status }];
    });
  };

  const handleSaveProgress = (record: Omit<ProgressRecord, 'id'>) => {
    setProgress(prev => [{ id: 'prog-' + Date.now(), ...record }, ...prev]);
    showToast('Progres disimpan');
  };

  const handleTogglePayment = (studentId: string, month: number, year: number, amount: number) => {
    setPayments(prev => {
      const idx = prev.findIndex(p => p.studentId === studentId && p.month === month && p.year === year);
      if (idx !== -1) {
        const up = [...prev];
        const newStatus = up[idx].status === 'Lunas' ? 'Belum Lunas' : 'Lunas';
        up[idx] = { ...up[idx], status: newStatus, paidDate: newStatus === 'Lunas' ? new Date().toISOString() : null };
        return up;
      }
      return [...prev, { id: 'pay-' + Date.now(), studentId, month, year, amount, status: 'Lunas', paidDate: new Date().toISOString() }];
    });
  };

  const handleBulkPayment = (studentId: string, selectedMonths: number[], year: number, monthlyAmount: number) => {
    setPayments(prev => {
      const updated = [...prev];
      selectedMonths.forEach(month => {
        const existingIdx = updated.findIndex(p => p.studentId === studentId && p.month === month && p.year === year);
        if (existingIdx !== -1) {
          updated[existingIdx] = { ...updated[existingIdx], status: 'Lunas', paidDate: new Date().toISOString(), amount: monthlyAmount };
        } else {
          updated.push({ id: 'pay-' + Date.now() + Math.random(), studentId, month, year, amount: monthlyAmount, status: 'Lunas', paidDate: new Date().toISOString() });
        }
      });
      return updated;
    });
    showToast(`Pelunasan berhasil`);
  };

  const handleImport = (data: any) => {
    if (data.students) setStudents(data.students);
    if (data.asatidz) setAsatidz(data.asatidz);
    if (data.attendance) setAttendance(data.attendance);
    if (data.asatidzAttendance) setAsatidzAttendance(data.asatidzAttendance);
    if (data.progress) setProgress(data.progress);
    if (data.payments) setPayments(data.payments);
    showToast('Data berhasil dipulihkan!');
  };

  if (!currentUser) return <AuthScreen onLogin={handleLogin} />;
  const isAdmin = currentUser.role === 'asatidz';

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 relative">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-4 fade-in duration-300">
          <div className={`${toast.type === 'success' ? 'bg-red-600' : toast.type === 'info' ? 'bg-slate-800' : 'bg-red-500'} text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white/10`}>
            <i className={`fa-solid ${toast.type === 'success' ? 'fa-cloud-arrow-up' : toast.type === 'info' ? 'fa-info-circle' : 'fa-triangle-exclamation'}`}></i>
            <span className="text-xs font-bold uppercase tracking-widest">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <nav className="hidden md:flex w-72 bg-white border-r border-slate-100 p-8 flex-col sticky top-0 h-screen z-10">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-red-600 w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg border-2 border-white/20">
            <span className="font-black italic text-xl">M</span>
          </div>
          <div>
            <h1 className="font-black text-slate-800 text-sm leading-none">{TPQ_NAME}</h1>
            <span className="text-[9px] text-red-600 font-bold uppercase mt-1 block tracking-widest">{TPQ_LOCATION}</span>
          </div>
        </div>

        <div className="space-y-1 flex-grow overflow-y-auto pr-2 custom-scrollbar">
          {isAdmin ? (
            <>
              <NavItem active={view === 'dashboard'} icon="fa-house" label="Dashboard" onClick={() => setView('dashboard')} />
              <NavItem active={view === 'asatidz'} icon="fa-chalkboard-user" label="Data Asatidz" onClick={() => setView('asatidz')} />
              <NavItem active={view === 'students'} icon="fa-users" label="Daftar Santri" onClick={() => setView('students')} />
              <NavItem active={view === 'attendance'} icon="fa-calendar-check" label="Absensi Santri" onClick={() => setView('attendance')} />
              <NavItem active={view === 'asatidz-attendance'} icon="fa-user-check" label="Absensi Asatidz" onClick={() => setView('asatidz-attendance')} />
              <NavItem active={view === 'progress'} icon="fa-book-open" label="Log Progress" onClick={() => setView('progress')} />
              <NavItem active={view === 'payments'} icon="fa-wallet" label="Uang Syahriah" onClick={() => setView('payments')} />
              <div className="pt-4 pb-2"><p className="text-[9px] font-black text-slate-300 uppercase px-4 tracking-[0.2em]">Mega System</p></div>
              <NavItem active={view === 'reports'} icon="fa-wand-magic-sparkles" label="Laporan AI" onClick={() => setView('reports')} />
              <NavItem active={view === 'settings'} icon="fa-cloud" label="Cloud Sync" onClick={() => setView('settings')} />
            </>
          ) : (
            <>
              <NavItem active={view === 'my-progress'} icon="fa-house" label="Beranda" onClick={() => setView('my-progress')} />
              <NavItem active={view === 'my-payments'} icon="fa-receipt" label="Info Syahriah" onClick={() => setView('my-payments')} />
            </>
          )}
        </div>

        {syncId && (
          <div className="mb-4 px-4 py-3 bg-red-50 rounded-2xl border border-red-100 flex items-center justify-between group cursor-pointer hover:bg-red-100 transition-colors" onClick={handlePushToCloud}>
            <div>
              <p className="text-[8px] font-black text-red-600 uppercase">Cloud Active</p>
              <p className="text-[10px] font-bold text-slate-500 font-mono tracking-tighter">ID: {syncId.substring(0,6)}...</p>
            </div>
            <button disabled={isSyncing} className={`text-red-600 hover:scale-110 transition-transform ${isSyncing ? 'animate-spin' : ''}`}>
              <i className="fa-solid fa-rotate"></i>
            </button>
          </div>
        )}

        <div className="mt-auto pt-6 border-t border-slate-100">
          <button onClick={handleLogout} className="w-full py-4 bg-slate-50 text-slate-500 text-xs font-black rounded-xl border border-slate-100 hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest">
            Logout
          </button>
        </div>
      </nav>

      {/* Main Area */}
      <main className="flex-grow p-4 md:p-10 max-w-7xl mx-auto w-full overflow-y-auto pb-32 md:pb-10">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {view === 'dashboard' && <Dashboard students={students} asatidz={asatidz} attendance={attendance} asatidzAttendance={asatidzAttendance} payments={payments} />}
          {view === 'asatidz' && <AsatidzList asatidz={asatidz} onAdd={handleAddAsatidz} onUpdate={handleUpdateAsatidz} onDelete={handleDeleteAsatidz} />}
          {view === 'students' && <StudentList students={students} onAdd={handleAddStudent} onUpdate={handleUpdateStudent} onDelete={handleDeleteStudent} />}
          {view === 'attendance' && <AttendanceTracker students={students} attendance={attendance} onMark={handleMarkAttendance} />}
          {view === 'asatidz-attendance' && <AsatidzAttendanceTracker asatidz={asatidz} attendance={asatidzAttendance} onMark={handleMarkAsatidzAttendance} />}
          {view === 'progress' && <ProgressTracker students={students} progress={progress} onSaveProgress={handleSaveProgress} />}
          {view === 'payments' && <PaymentTracker students={students} payments={payments} onTogglePayment={handleTogglePayment} onBulkPayment={handleBulkPayment} />}
          {view === 'reports' && <ReportGenerator students={students} attendance={attendance} payments={payments} />}
          {view === 'my-progress' && <SantriView user={currentUser!} students={students} attendance={attendance} payments={payments} progress={progress} />}
          {view === 'settings' && (
            <DataSync 
              students={students} 
              asatidz={asatidz} 
              attendance={attendance} 
              asatidzAttendance={asatidzAttendance} 
              payments={payments} 
              progress={progress} 
              syncId={syncId} 
              isSyncing={isSyncing} 
              onPull={handlePullFromCloud} 
              onSetSyncId={handleSetSyncId} 
              onCreateSync={handleCreateCloudSync}
              onImport={handleImport} 
            />
          )}
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 h-20 px-2 flex items-center z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
        <div className="flex w-full overflow-x-auto gap-4 px-2 py-2 no-scrollbar scroll-smooth items-center">
          {isAdmin ? (
            <>
              <MobileNavItem active={view === 'dashboard'} icon="fa-house" onClick={() => setView('dashboard')} label="Home" />
              <MobileNavItem active={view === 'asatidz'} icon="fa-chalkboard-user" onClick={() => setView('asatidz')} label="Asatidz" />
              <MobileNavItem active={view === 'students'} icon="fa-users" onClick={() => setView('students')} label="Santri" />
              <MobileNavItem active={view === 'attendance'} icon="fa-calendar-check" onClick={() => setView('attendance')} label="Absen S" />
              <MobileNavItem active={view === 'asatidz-attendance'} icon="fa-user-check" onClick={() => setView('asatidz-attendance')} label="Absen A" />
              <MobileNavItem active={view === 'progress'} icon="fa-book-open" onClick={() => setView('progress')} label="Progres" />
              <MobileNavItem active={view === 'payments'} icon="fa-wallet" onClick={() => setView('payments')} label="Bayar" />
              <MobileNavItem active={view === 'settings'} icon="fa-cloud" onClick={() => setView('settings')} label="Sync" />
            </>
          ) : (
            <>
              <MobileNavItem active={view === 'my-progress'} icon="fa-house" onClick={() => setView('my-progress')} label="Home" />
              <MobileNavItem active={view === 'my-payments'} icon="fa-receipt" onClick={() => setView('my-payments')} label="Bayar" />
            </>
          )}
          <div className="min-w-[1px] h-8 bg-slate-100 mx-1"></div>
          <MobileNavItem active={false} icon="fa-right-from-bracket" onClick={handleLogout} label="Logout" isDanger />
        </div>
      </nav>
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

const NavItem = ({ active, icon, label, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-bold text-xs ${active ? 'bg-red-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-red-600'}`}>
    <i className={`fa-solid ${icon} w-5 text-center`}></i>{label}
  </button>
);

const MobileNavItem = ({ active, icon, onClick, label, isDanger }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 min-w-[64px] shrink-0 transition-all ${active ? 'text-red-600 scale-105' : isDanger ? 'text-red-500' : 'text-slate-400'}`}>
    <div className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${active ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-50'}`}>
      <i className={`fa-solid ${icon} text-sm`}></i>
    </div>
    <span className="text-[8px] font-black uppercase tracking-widest whitespace-nowrap">{label}</span>
  </button>
);

export default App;
