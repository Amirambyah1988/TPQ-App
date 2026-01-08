
import React, { useState, useEffect } from 'react';
import { Student, Asatidz, AttendanceRecord, AsatidzAttendanceRecord, ProgressRecord, PaymentRecord, ViewType, AttendanceStatus, User } from './types';
import { INITIAL_STUDENTS, INITIAL_ASATIDZ, TPQ_NAME, TPQ_LOCATION, TPQ_ADDRESS } from './constants';
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

  useEffect(() => {
    const savedUser = localStorage.getItem('tpq_session');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('tpq_session');
      }
    }

    const savedStudents = localStorage.getItem('tpq_students');
    const savedAsatidz = localStorage.getItem('tpq_asatidz');
    const savedAttendance = localStorage.getItem('tpq_attendance');
    const savedAsatidzAttendance = localStorage.getItem('tpq_asatidz_attendance');
    const savedProgress = localStorage.getItem('tpq_progress');
    const savedPayments = localStorage.getItem('tpq_payments');

    if (savedStudents) setStudents(JSON.parse(savedStudents));
    else setStudents(INITIAL_STUDENTS);

    if (savedAsatidz) setAsatidz(JSON.parse(savedAsatidz));
    else setAsatidz(INITIAL_ASATIDZ);

    if (savedAttendance) setAttendance(JSON.parse(savedAttendance));
    if (savedAsatidzAttendance) setAsatidzAttendance(JSON.parse(savedAsatidzAttendance));
    if (savedProgress) setProgress(JSON.parse(savedProgress));
    if (savedPayments) setPayments(JSON.parse(savedPayments));
  }, []);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'santri') setView('my-progress');
      else setView('dashboard');
    }
  }, [currentUser]);

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
  };

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      setCurrentUser(null);
      localStorage.removeItem('tpq_session');
      setView('dashboard');
    }
  };

  const handleAddAsatidz = (newUstadz: Omit<Asatidz, 'id'>) => {
    const ustadz: Asatidz = { ...newUstadz, id: Math.random().toString(36).substr(2, 9) };
    setAsatidz(prev => [...prev, ustadz]);
  };

  const handleUpdateAsatidz = (updated: Asatidz) => {
    setAsatidz(prev => prev.map(u => u.id === updated.id ? updated : u));
  };

  const handleDeleteAsatidz = (id: string) => {
    if (window.confirm('Hapus data asatidz ini?')) {
      setAsatidz(prev => prev.filter(u => u.id !== id));
      setAsatidzAttendance(prev => prev.filter(a => a.asatidzId !== id));
    }
  };

  const handleAddStudent = (newStudent: Omit<Student, 'id'>) => {
    const student: Student = { ...newStudent, id: Math.random().toString(36).substr(2, 9) };
    setStudents(prev => [...prev, student]);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
  };

  const handleDeleteStudent = (id: string) => {
    if (window.confirm('Hapus data santri ini?')) {
      setStudents(prev => prev.filter(s => s.id !== id));
      setAttendance(prev => prev.filter(a => a.studentId !== id));
      setProgress(prev => prev.filter(p => p.studentId !== id));
      setPayments(prev => prev.filter(p => p.studentId !== id));
    }
  };

  const handleMarkAttendance = (studentId: string, date: string, status: AttendanceStatus) => {
    setAttendance(prev => {
      const existing = prev.findIndex(a => a.studentId === studentId && a.date === date);
      if (existing !== -1) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], status };
        return updated;
      }
      return [...prev, { id: Math.random().toString(36).substr(2, 9), studentId, date, status }];
    });
  };

  const handleMarkAsatidzAttendance = (asatidzId: string, date: string, status: AttendanceStatus) => {
    setAsatidzAttendance(prev => {
      const existing = prev.findIndex(a => a.asatidzId === asatidzId && a.date === date);
      if (existing !== -1) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], status };
        return updated;
      }
      return [...prev, { id: Math.random().toString(36).substr(2, 9), asatidzId, date, status }];
    });
  };

  const handleSaveProgress = (record: Omit<ProgressRecord, 'id'>) => {
    setProgress(prev => [
      { id: Math.random().toString(36).substr(2, 9), ...record },
      ...prev
    ]);
  };

  const handleTogglePayment = (studentId: string, month: number, year: number, amount: number) => {
    setPayments(prev => {
      const existingIdx = prev.findIndex(p => p.studentId === studentId && p.month === month && p.year === year);
      
      if (existingIdx !== -1) {
        const updated = [...prev];
        if (updated[existingIdx].status === 'Lunas') {
          updated[existingIdx] = { ...updated[existingIdx], status: 'Belum Lunas', paidDate: null };
        } else {
          updated[existingIdx] = { ...updated[existingIdx], status: 'Lunas', paidDate: new Date().toISOString(), amount };
        }
        return updated;
      }

      return [...prev, { 
        id: Math.random().toString(36).substr(2, 9), 
        studentId, 
        month, 
        year, 
        amount, 
        status: 'Lunas', 
        paidDate: new Date().toISOString() 
      }];
    });
  };

  if (!currentUser) return <AuthScreen onLogin={handleLogin} />;

  const isAsatidz = currentUser.role === 'asatidz';

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50/50">
      <nav className="hidden md:flex w-72 bg-white border-r border-slate-100 p-8 flex-col sticky top-0 h-screen z-10">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-emerald-600 w-14 h-14 rounded-[1.25rem] flex items-center justify-center text-white shadow-emerald-200 shadow-xl border-2 border-amber-300">
            <i className="fa-solid fa-book-quran text-2xl"></i>
          </div>
          <div>
            <h1 className="font-black text-slate-800 text-lg leading-none tracking-tight">{TPQ_NAME}</h1>
            <span className="text-[9px] text-emerald-600 font-black tracking-[0.2em] uppercase mt-1 block">{TPQ_LOCATION}</span>
          </div>
        </div>

        <div className="space-y-1.5 flex-grow overflow-y-auto">
          {isAsatidz ? (
            <>
              <NavItem active={view === 'dashboard'} icon="fa-chart-pie" label="Ringkasan Umum" onClick={() => setView('dashboard')} />
              <NavItem active={view === 'asatidz'} icon="fa-chalkboard-user" label="Data Asatidz" onClick={() => setView('asatidz')} />
              <NavItem active={view === 'students'} icon="fa-users" label="Data Santri" onClick={() => setView('students')} />
              <NavItem active={view === 'progress'} icon="fa-book-open-reader" label="Progres Belajar" onClick={() => setView('progress')} />
              <NavItem active={view === 'attendance'} icon="fa-calendar-check" label="Presensi Santri" onClick={() => setView('attendance')} />
              <NavItem active={view === 'asatidz-attendance'} icon="fa-user-check" label="Presensi Guru" onClick={() => setView('asatidz-attendance')} />
              <NavItem active={view === 'payments'} icon="fa-wallet" label="Syahriah Bulanan" onClick={() => setView('payments')} />
              <NavItem active={view === 'reports'} icon="fa-wand-magic-sparkles" label="Analisis Pintar AI" onClick={() => setView('reports')} />
            </>
          ) : (
            <NavItem active={view === 'my-progress'} icon="fa-graduation-cap" label="Progres Saya" onClick={() => setView('my-progress')} />
          )}
        </div>

        <div className="mt-auto pt-6 space-y-4">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
               <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold border border-emerald-200">{currentUser.name.charAt(0)}</div>
               <div className="overflow-hidden">
                 <p className="text-sm font-bold text-slate-800 truncate">{currentUser.name}</p>
                 <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">{currentUser.role}</p>
               </div>
            </div>
            <p className="text-[8px] text-slate-400 font-bold uppercase mb-3 leading-tight tracking-tighter">
              <i className="fa-solid fa-location-dot mr-1 text-emerald-500"></i> {TPQ_ADDRESS}
            </p>
            <button onClick={handleLogout} className="w-full py-2.5 bg-white text-red-500 text-xs font-bold rounded-xl border border-red-100 hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"><i className="fa-solid fa-right-from-bracket"></i> Keluar</button>
          </div>
        </div>
      </nav>

      <header className="md:hidden bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-600 w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-md border border-amber-300"><i className="fa-solid fa-book-quran text-sm"></i></div>
          <div className="leading-tight">
            <h1 className="font-bold text-slate-800 text-xs">{TPQ_NAME}</h1>
            <span className="text-[8px] text-emerald-600 font-bold uppercase">{TPQ_LOCATION}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleLogout} className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center border border-red-100 cursor-pointer active:scale-90 transition-transform"><i className="fa-solid fa-power-off text-xs"></i></button>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-10 max-w-7xl mx-auto w-full overflow-y-auto pb-44 md:pb-10">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {view === 'dashboard' && <Dashboard students={students} asatidz={asatidz} attendance={attendance} asatidzAttendance={asatidzAttendance} payments={payments} />}
          {view === 'asatidz' && <AsatidzList asatidz={asatidz} onAdd={handleAddAsatidz} onUpdate={handleUpdateAsatidz} onDelete={handleDeleteAsatidz} />}
          {view === 'students' && <StudentList students={students} onAdd={handleAddStudent} onUpdate={handleUpdateStudent} onDelete={handleDeleteStudent} />}
          {view === 'progress' && <ProgressTracker students={students} progress={progress} onSaveProgress={handleSaveProgress} />}
          {view === 'attendance' && <AttendanceTracker students={students} attendance={attendance} onMark={handleMarkAttendance} />}
          {view === 'asatidz-attendance' && <AsatidzAttendanceTracker asatidz={asatidz} attendance={asatidzAttendance} onMark={handleMarkAsatidzAttendance} />}
          {view === 'payments' && <PaymentTracker students={students} payments={payments} onTogglePayment={handleTogglePayment} />}
          {view === 'reports' && <ReportGenerator students={students} attendance={attendance} payments={payments} />}
          {view === 'my-progress' && <SantriView user={currentUser} students={students} attendance={attendance} payments={payments} progress={progress} />}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-100 px-2 py-4 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.05)]">
        {isAsatidz ? (
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-y-4 gap-x-1 max-w-lg mx-auto">
            <MobileNavItem active={view === 'dashboard'} icon="fa-house" label="Home" onClick={() => setView('dashboard')} />
            <MobileNavItem active={view === 'students'} icon="fa-users" label="Santri" onClick={() => setView('students')} />
            <MobileNavItem active={view === 'asatidz'} icon="fa-chalkboard-user" label="Asatidz" onClick={() => setView('asatidz')} />
            <MobileNavItem active={view === 'progress'} icon="fa-book-open" label="Log" onClick={() => setView('progress')} />
            <MobileNavItem active={view === 'attendance'} icon="fa-calendar-check" label="Presensi" onClick={() => setView('attendance')} />
            <MobileNavItem active={view === 'asatidz-attendance'} icon="fa-user-check" label="Presensi Guru" onClick={() => setView('asatidz-attendance')} />
            <MobileNavItem active={view === 'payments'} icon="fa-wallet" label="Syahriah" onClick={() => setView('payments')} />
            <button 
              onClick={handleLogout} 
              className="flex flex-col items-center justify-center gap-1.5 transition-all text-red-500 active:scale-90"
            >
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all bg-red-50 text-red-500 border border-red-100">
                <i className="fa-solid fa-right-from-bracket text-sm"></i>
              </div>
              <span className="text-[8px] font-black uppercase tracking-tighter">Keluar</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-12">
            <MobileNavItem active={view === 'my-progress'} icon="fa-graduation-cap" label="Progres" onClick={() => setView('my-progress')} />
            <button onClick={handleLogout} className="flex flex-col items-center justify-center gap-1.5 transition-all text-red-500 active:scale-90"><div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all bg-red-50 shadow-sm border border-red-100"><i className="fa-solid fa-power-off text-lg"></i></div><span className="text-[10px] font-extrabold uppercase tracking-wider">Keluar</span></button>
          </div>
        )}
      </nav>
    </div>
  );
};

interface NavItemProps { active: boolean; icon: string; label: string; onClick: () => void; }
const NavItem: React.FC<NavItemProps> = ({ active, icon, label, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm cursor-pointer ${active ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200/50 translate-x-1' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${active ? 'bg-white/20' : 'bg-slate-50'}`}><i className={`fa-solid ${icon} ${active ? 'text-white' : 'text-slate-400'}`}></i></div>{label}
  </button>
);

const MobileNavItem: React.FC<NavItemProps> = ({ active, icon, label, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${active ? 'text-emerald-600' : 'text-slate-400'}`}>
    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${active ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100 scale-110' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}><i className={`fa-solid ${icon} text-base`}></i></div><span className={`text-[8px] font-black uppercase tracking-tighter ${active ? 'text-emerald-700' : 'text-slate-400'}`}>{label}</span>
  </button>
);

export default App;
