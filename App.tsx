
import React, { useState, useEffect } from 'react';
import { Student, AttendanceRecord, PaymentRecord, ViewType, AttendanceStatus, User } from './types';
import { INITIAL_STUDENTS } from './constants';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import AttendanceTracker from './components/AttendanceTracker';
import PaymentTracker from './components/PaymentTracker';
import ReportGenerator from './components/ReportGenerator';
import AuthScreen from './components/Auth/AuthScreen';
import SantriView from './components/SantriView';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewType>('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  // Load initial data
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
    const savedAttendance = localStorage.getItem('tpq_attendance');
    const savedPayments = localStorage.getItem('tpq_payments');

    if (savedStudents) setStudents(JSON.parse(savedStudents));
    else setStudents(INITIAL_STUDENTS);

    if (savedAttendance) setAttendance(JSON.parse(savedAttendance));
    if (savedPayments) setPayments(JSON.parse(savedPayments));
  }, []);

  // Set default view based on role when user logs in
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'santri') {
        setView('my-progress');
      } else {
        setView('dashboard');
      }
    }
  }, [currentUser]);

  // Save data on change
  useEffect(() => {
    localStorage.setItem('tpq_students', JSON.stringify(students));
    localStorage.setItem('tpq_attendance', JSON.stringify(attendance));
    localStorage.setItem('tpq_payments', JSON.stringify(payments));
  }, [students, attendance, payments]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('tpq_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    // Immediate logout for better responsiveness in the prototype
    setCurrentUser(null);
    localStorage.removeItem('tpq_session');
    // Optional: Reset view to dashboard for next login
    setView('dashboard');
  };

  const handleAddStudent = (newStudent: Omit<Student, 'id'>) => {
    const student: Student = {
      ...newStudent,
      id: Math.random().toString(36).substr(2, 9)
    };
    setStudents(prev => [...prev, student]);
  };

  const handleDeleteStudent = (id: string) => {
    if (window.confirm('Hapus data santri ini?')) {
      setStudents(prev => prev.filter(s => s.id !== id));
      setAttendance(prev => prev.filter(a => a.studentId !== id));
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

  const handleTogglePayment = (studentId: string, month: number, year: number) => {
    setPayments(prev => {
      const existingIdx = prev.findIndex(p => p.studentId === studentId && p.month === month && p.year === year);
      
      if (existingIdx !== -1) {
        const updated = [...prev];
        if (updated[existingIdx].status === 'Lunas') {
          updated[existingIdx] = { ...updated[existingIdx], status: 'Belum Lunas', paidDate: null };
        } else {
          updated[existingIdx] = { ...updated[existingIdx], status: 'Lunas', paidDate: new Date().toISOString() };
        }
        return updated;
      }

      return [...prev, { 
        id: Math.random().toString(36).substr(2, 9), 
        studentId, 
        month, 
        year, 
        amount: 50000, 
        status: 'Lunas', 
        paidDate: new Date().toISOString() 
      }];
    });
  };

  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  const isAsatidz = currentUser.role === 'asatidz';

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50/50">
      {/* Desktop Sidebar Navigation */}
      <nav className="hidden md:flex w-72 bg-white border-r border-slate-100 p-8 flex-col sticky top-0 h-screen z-10">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-emerald-600 w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-emerald-200 shadow-xl">
            <i className="fa-solid fa-mosque text-xl"></i>
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg leading-tight">TPQ Smart</h1>
            <span className="text-[10px] text-emerald-600 font-extrabold tracking-[0.2em] uppercase">Manager</span>
          </div>
        </div>

        <div className="space-y-1.5 flex-grow">
          {isAsatidz ? (
            <>
              <NavItem active={view === 'dashboard'} icon="fa-chart-pie" label="Ringkasan Umum" onClick={() => setView('dashboard')} />
              <NavItem active={view === 'students'} icon="fa-users" label="Data Santri" onClick={() => setView('students')} />
              <NavItem active={view === 'attendance'} icon="fa-calendar-check" label="Absensi Harian" onClick={() => setView('attendance')} />
              <NavItem active={view === 'payments'} icon="fa-wallet" label="Syahriah Bulanan" onClick={() => setView('payments')} />
              <NavItem active={view === 'reports'} icon="fa-wand-magic-sparkles" label="Analisis Pintar AI" onClick={() => setView('reports')} />
            </>
          ) : (
            <>
              <NavItem active={view === 'my-progress'} icon="fa-graduation-cap" label="Progres Saya" onClick={() => setView('my-progress')} />
            </>
          )}
        </div>

        <div className="mt-auto space-y-4">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
               <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold border border-emerald-200">
                 {currentUser.name.charAt(0)}
               </div>
               <div className="overflow-hidden">
                 <p className="text-sm font-bold text-slate-800 truncate">{currentUser.name}</p>
                 <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">{currentUser.role}</p>
               </div>
            </div>
            <button 
              type="button"
              onClick={handleLogout}
              className="w-full py-2.5 bg-white text-red-500 text-xs font-bold rounded-xl border border-red-100 hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <i className="fa-solid fa-right-from-bracket"></i> Keluar Sistem
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Top Header */}
      <header className="md:hidden bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-600 w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md">
            <i className="fa-solid fa-mosque text-sm"></i>
          </div>
          <h1 className="font-bold text-slate-800 text-sm">TPQ Smart</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-700 truncate max-w-[80px] leading-none">{currentUser.name.split(' ')[0]}</p>
            <span className="text-[8px] text-emerald-600 font-bold uppercase">{currentUser.role}</span>
          </div>
          <button 
            type="button"
            onClick={handleLogout}
            className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center border border-red-100 cursor-pointer active:scale-90 transition-transform"
            aria-label="Logout"
            title="Keluar"
          >
            <i className="fa-solid fa-power-off text-xs"></i>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow p-4 md:p-10 max-w-7xl mx-auto w-full overflow-y-auto pb-24 md:pb-10">
        <header className="mb-6 md:mb-10 hidden md:flex justify-between items-start">
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
              {view === 'dashboard' && 'Beranda Utama'}
              {view === 'students' && 'Manajemen Santri'}
              {view === 'attendance' && 'Presensi Harian'}
              {view === 'payments' && 'Iuran Syahriah'}
              {view === 'reports' && 'Laporan Cerdas'}
              {view === 'my-progress' && 'Dashboard Santri'}
            </h2>
            <p className="text-slate-400 font-medium flex items-center gap-2 mt-1 text-sm">
              <i className="fa-regular fa-calendar"></i>
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 hidden md:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Sistem Aktif</span>
          </div>
        </header>

        {/* Mobile Title (Visible only on mobile) */}
        <div className="md:hidden mb-6">
           <h2 className="text-xl font-bold text-slate-800">
              {view === 'dashboard' && 'Dashboard'}
              {view === 'students' && 'Data Santri'}
              {view === 'attendance' && 'Absensi'}
              {view === 'payments' && 'Syahriah'}
              {view === 'reports' && 'Laporan AI'}
              {view === 'my-progress' && 'Progres Saya'}
           </h2>
           <p className="text-slate-400 text-xs font-medium">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {view === 'dashboard' && <Dashboard students={students} attendance={attendance} payments={payments} />}
          {view === 'students' && <StudentList students={students} onAdd={handleAddStudent} onDelete={handleDeleteStudent} />}
          {view === 'attendance' && <AttendanceTracker students={students} attendance={attendance} onMark={handleMarkAttendance} />}
          {view === 'payments' && <PaymentTracker students={students} payments={payments} onTogglePayment={handleTogglePayment} />}
          {view === 'reports' && <ReportGenerator students={students} attendance={attendance} payments={payments} />}
          {view === 'my-progress' && <SantriView user={currentUser} students={students} attendance={attendance} payments={payments} />}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-2 py-2 flex items-center justify-around z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
        {isAsatidz ? (
          <>
            <MobileNavItem active={view === 'dashboard'} icon="fa-chart-pie" label="Home" onClick={() => setView('dashboard')} />
            <MobileNavItem active={view === 'students'} icon="fa-users" label="Santri" onClick={() => setView('students')} />
            <MobileNavItem active={view === 'attendance'} icon="fa-calendar-check" label="Absensi" onClick={() => setView('attendance')} />
            <MobileNavItem active={view === 'payments'} icon="fa-wallet" label="Bayar" onClick={() => setView('payments')} />
            <button 
              type="button"
              onClick={handleLogout}
              className="flex flex-col items-center justify-center flex-1 py-1 gap-1 transition-all text-red-400 active:scale-95 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-red-50">
                <i className="fa-solid fa-right-from-bracket text-lg"></i>
              </div>
              <span className="text-[10px] font-bold tracking-tighter">Keluar</span>
            </button>
          </>
        ) : (
          <>
            <MobileNavItem active={view === 'my-progress'} icon="fa-graduation-cap" label="Progres" onClick={() => setView('my-progress')} />
            <button 
              type="button"
              onClick={handleLogout}
              className="flex flex-col items-center justify-center flex-1 py-1 gap-1 transition-all text-red-400 active:scale-95 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-red-50">
                <i className="fa-solid fa-right-from-bracket text-lg"></i>
              </div>
              <span className="text-[10px] font-bold tracking-tighter">Keluar</span>
            </button>
          </>
        )}
      </nav>
    </div>
  );
};

interface NavItemProps {
  active: boolean;
  icon: string;
  label: string;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ active, icon, label, onClick }) => (
  <button 
    type="button"
    onClick={onClick}
    className={`
      w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm cursor-pointer
      ${active 
        ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200/50 translate-x-1' 
        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
      }
    `}
  >
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${active ? 'bg-white/20' : 'bg-slate-50'}`}>
      <i className={`fa-solid ${icon} ${active ? 'text-white' : 'text-slate-400'}`}></i>
    </div>
    {label}
  </button>
);

const MobileNavItem: React.FC<NavItemProps> = ({ active, icon, label, onClick }) => (
  <button 
    type="button"
    onClick={onClick}
    className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 transition-all cursor-pointer ${active ? 'text-emerald-600' : 'text-slate-400'}`}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${active ? 'bg-emerald-50 scale-110 shadow-sm' : ''}`}>
      <i className={`fa-solid ${icon} text-lg`}></i>
    </div>
    <span className="text-[10px] font-bold tracking-tighter">{label}</span>
  </button>
);

export default App;
