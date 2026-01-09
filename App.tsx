
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

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewType>('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [asatidz, setAsatidz] = useState<Asatidz[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [asatidzAttendance, setAsatidzAttendance] = useState<AsatidzAttendanceRecord[]>([]);
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'danger'} | null>(null);

  const showToast = (message: string, type: 'success' | 'danger' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load Data
  useEffect(() => {
    const savedUser = localStorage.getItem('tpq_session');
    if (savedUser) {
      try { setCurrentUser(JSON.parse(savedUser)); } catch (e) { localStorage.removeItem('tpq_session'); }
    }

    const savedStudents = localStorage.getItem('tpq_students');
    const savedAsatidz = localStorage.getItem('tpq_asatidz');
    const savedAttendance = localStorage.getItem('tpq_attendance');
    const savedAsatidzAttendance = localStorage.getItem('tpq_asatidz_attendance');
    const savedProgress = localStorage.getItem('tpq_progress');
    const savedPayments = localStorage.getItem('tpq_payments');

    setStudents(savedStudents ? JSON.parse(savedStudents) : INITIAL_STUDENTS);
    setAsatidz(savedAsatidz ? JSON.parse(savedAsatidz) : INITIAL_ASATIDZ);
    setAttendance(savedAttendance ? JSON.parse(savedAttendance) : []);
    setAsatidzAttendance(savedAsatidzAttendance ? JSON.parse(savedAsatidzAttendance) : []);
    setProgress(savedProgress ? JSON.parse(savedProgress) : []);
    setPayments(savedPayments ? JSON.parse(savedPayments) : []);
  }, []);

  // Sync LocalStorage
  useEffect(() => {
    localStorage.setItem('tpq_students', JSON.stringify(students));
    localStorage.setItem('tpq_asatidz', JSON.stringify(asatidz));
    localStorage.setItem('tpq_attendance', JSON.stringify(attendance));
    localStorage.setItem('tpq_asatidz_attendance', JSON.stringify(asatidzAttendance));
    localStorage.setItem('tpq_progress', JSON.stringify(progress));
    localStorage.setItem('tpq_payments', JSON.stringify(payments));
  }, [students, asatidz, attendance, asatidzAttendance, progress, payments]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('tpq_session', JSON.stringify(user));
    if (user.role === 'santri') setView('my-progress');
    else setView('dashboard');
    showToast(`Selamat datang, ${user.name}`);
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem('tpq_session');
    setCurrentUser(null);
    setView('dashboard');
  }, []);

  const handleDeleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    setAttendance(prev => prev.filter(a => a.studentId !== id));
    setProgress(prev => prev.filter(p => p.studentId !== id));
    setPayments(prev => prev.filter(p => p.studentId !== id));
    showToast('Data Santri berhasil dihapus', 'danger');
  };

  const handleDeleteAsatidz = (id: string) => {
    setAsatidz(prev => prev.filter(u => u.id !== id));
    setAsatidzAttendance(prev => prev.filter(a => a.asatidzId !== id));
    showToast('Data Asatidz berhasil dihapus', 'danger');
  };

  const handleUpdateStudent = (updated: Student) => {
    setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
    showToast('Data Santri berhasil diperbarui');
  };

  const handleUpdateAsatidz = (updated: Asatidz) => {
    setAsatidz(prev => prev.map(u => u.id === updated.id ? updated : u));
    showToast('Data Asatidz berhasil diperbarui');
  };

  const handleAddStudent = (s: Omit<Student, 'id'>) => {
    setStudents(prev => [...prev, { ...s, id: 'st-' + Date.now() }]);
    showToast('Santri baru berhasil didaftarkan');
  };

  const handleAddAsatidz = (u: Omit<Asatidz, 'id'>) => {
    setAsatidz(prev => [...prev, { ...u, id: 'at-' + Date.now() }]);
    showToast('Asatidz baru berhasil didaftarkan');
  };

  const handleMarkAttendance = (studentId: string, date: string, status: AttendanceStatus) => {
    setAttendance(prev => {
      const idx = prev.findIndex(a => a.studentId === studentId && a.date === date);
      if (idx !== -1) {
        const up = [...prev];
        up[idx] = { ...up[idx], status };
        return up;
      }
      return [...prev, { id: 'att-' + Date.now() + Math.random(), studentId, date, status }];
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
      return [...prev, { id: 'aat-' + Date.now() + Math.random(), asatidzId, date, status }];
    });
  };

  const handleSaveProgress = (record: Omit<ProgressRecord, 'id'>) => {
    setProgress(prev => [{ id: 'prog-' + Date.now(), ...record }, ...prev]);
    showToast('Progres belajar berhasil disimpan');
  };

  const handleTogglePayment = (studentId: string, month: number, year: number, amount: number) => {
    setPayments(prev => {
      const idx = prev.findIndex(p => p.studentId === studentId && p.month === month && p.year === year);
      if (idx !== -1) {
        const up = [...prev];
        const newStatus = up[idx].status === 'Lunas' ? 'Belum Lunas' : 'Lunas';
        up[idx] = { ...up[idx], status: newStatus, paidDate: newStatus === 'Lunas' ? new Date().toISOString() : null };
        if (newStatus === 'Lunas') showToast('Pembayaran berhasil dikonfirmasi');
        return up;
      }
      showToast('Pembayaran berhasil dikonfirmasi');
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
    showToast(`Pelunasan ${selectedMonths.length} bulan berhasil`);
  };

  if (!currentUser) return <AuthScreen onLogin={handleLogin} />;
  const isAdmin = currentUser.role === 'asatidz';

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-4 fade-in duration-300">
          <div className={`${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'} text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20 backdrop-blur-md`}>
            <i className={`fa-solid ${toast.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
            <span className="text-xs font-black uppercase tracking-widest">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Sidebar Navigation (Desktop) */}
      <nav className="hidden md:flex w-72 bg-white border-r border-slate-100 p-8 flex-col sticky top-0 h-screen z-10 shadow-sm">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-emerald-600 w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg border-2 border-amber-300">
            <i className="fa-solid fa-book-quran text-xl"></i>
          </div>
          <div>
            <h1 className="font-black text-slate-800 text-sm leading-none">{TPQ_NAME}</h1>
            <span className="text-[9px] text-emerald-600 font-bold uppercase mt-1 block">{TPQ_LOCATION}</span>
          </div>
        </div>

        <div className="space-y-1 flex-grow overflow-y-auto pr-2 scrollbar-hide">
          {isAdmin ? (
            <>
              <NavItem active={view === 'dashboard'} icon="fa-house" label="Home" onClick={() => setView('dashboard')} />
              <NavItem active={view === 'asatidz'} icon="fa-chalkboard-user" label="Asatidz" onClick={() => setView('asatidz')} />
              <NavItem active={view === 'students'} icon="fa-users" label="Santri" onClick={() => setView('students')} />
              <NavItem active={view === 'attendance'} icon="fa-calendar-check" label="Absensi" onClick={() => setView('attendance')} />
              <NavItem active={view === 'progress'} icon="fa-book-open" label="Log Progress" onClick={() => setView('progress')} />
              <NavItem active={view === 'payments'} icon="fa-wallet" label="Bayar" onClick={() => setView('payments')} />
              <div className="pt-6 pb-2">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-4">Lainnya</p>
              </div>
              <NavItem active={view === 'reports'} icon="fa-wand-magic-sparkles" label="Laporan AI" onClick={() => setView('reports')} />
              <NavItem active={view === 'asatidz-attendance'} icon="fa-user-check" label="Absensi Asatidz" onClick={() => setView('asatidz-attendance')} />
            </>
          ) : (
            <>
              <NavItem active={view === 'my-progress'} icon="fa-house" label="Home" onClick={() => setView('my-progress')} />
              <NavItem active={view === 'my-payments'} icon="fa-receipt" label="Bayar" onClick={() => setView('my-payments')} />
            </>
          )}
        </div>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <button 
            onClick={handleLogout} 
            className="w-full py-3.5 bg-red-50 text-red-500 text-xs font-black rounded-xl border border-red-100 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 group"
          >
            <i className="fa-solid fa-right-from-bracket group-hover:translate-x-1 transition-transform"></i> Logout
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
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 py-2 px-1 flex overflow-x-auto scrollbar-hide items-center z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        {isAdmin ? (
          <div className="flex w-full min-w-max justify-around px-2 gap-1">
            <MobileNavItem active={view === 'dashboard'} icon="fa-house" onClick={() => setView('dashboard')} label="Home" />
            <MobileNavItem active={view === 'asatidz'} icon="fa-chalkboard-user" onClick={() => setView('asatidz')} label="Asatidz" />
            <MobileNavItem active={view === 'students'} icon="fa-users" onClick={() => setView('students')} label="Santri" />
            <MobileNavItem active={view === 'attendance'} icon="fa-calendar-check" onClick={() => setView('attendance')} label="Absensi" />
            <MobileNavItem active={view === 'progress'} icon="fa-book-open" onClick={() => setView('progress')} label="Log" />
            <MobileNavItem active={view === 'payments'} icon="fa-wallet" onClick={() => setView('payments')} label="Bayar" />
            <MobileNavItem active={false} icon="fa-right-from-bracket" onClick={handleLogout} label="Logout" isDanger />
          </div>
        ) : (
          <div className="flex w-full justify-around px-4">
            <MobileNavItem active={view === 'my-progress'} icon="fa-house" onClick={() => setView('my-progress')} label="Home" />
            <MobileNavItem active={view === 'my-payments'} icon="fa-receipt" onClick={() => setView('my-payments')} label="Bayar" />
            <MobileNavItem active={false} icon="fa-right-from-bracket" onClick={handleLogout} label="Logout" isDanger />
          </div>
        )}
      </nav>
    </div>
  );
};

const NavItem = ({ active, icon, label, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-xs ${active ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-emerald-600'}`}>
    <i className={`fa-solid ${icon} w-5`}></i>{label}
  </button>
);

const MobileNavItem = ({ active, icon, onClick, label, isDanger }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-0.5 transition-all min-w-[56px] ${active ? 'text-emerald-600' : isDanger ? 'text-red-400' : 'text-slate-400'}`}>
    <div className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${active ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-50'}`}>
      <i className={`fa-solid ${icon} text-sm`}></i>
    </div>
    <span className="text-[7px] font-black uppercase tracking-tight">{label}</span>
  </button>
);

export default App;
