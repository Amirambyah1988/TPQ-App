
import React, { useState } from 'react';
import { User, UserRole, Student, Asatidz } from '../../types';
import { TPQ_NAME, TPQ_LOCATION, TPQ_ADDRESS } from '../../constants';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [role, setRole] = useState<UserRole>('asatidz');
  const [error, setError] = useState<string | null>(null);
  const [showForgotMsg, setShowForgotMsg] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const getAsatidzData = (): Asatidz[] => {
    const saved = localStorage.getItem('tpq_asatidz');
    return saved ? JSON.parse(saved) : [];
  };

  const getStudentsData = (): Student[] => {
    const saved = localStorage.getItem('tpq_students');
    return saved ? JSON.parse(saved) : [];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowForgotMsg(false);
    
    if (role === 'asatidz') {
      // 1. Cek Super Admin (Fallback jika data kosong atau untuk akses awal)
      if (formData.username.toLowerCase() === 'admin' && formData.password === 'password') {
        onLogin({
          id: 'super-admin',
          name: 'Super Admin TPQ',
          username: 'admin',
          role: 'asatidz'
        });
        return;
      }

      // 2. Cek di daftar Asatidz yang terdaftar di sistem
      const asatidzList = getAsatidzData();
      const foundUstadz = asatidzList.find(u => 
        u.username?.toLowerCase() === formData.username.toLowerCase() && 
        u.password === formData.password
      );

      if (!foundUstadz) {
        setError("Username atau password Asatidz salah!");
        return;
      }

      onLogin({
        id: foundUstadz.id,
        name: foundUstadz.name,
        username: foundUstadz.username || '',
        role: 'asatidz',
        asatidzId: foundUstadz.id
      });
    } else {
      // LOGIN SANTRI: Validasi ke daftar santri yang dibuat Asatidz
      const students = getStudentsData();
      const foundStudent = students.find(s => 
        s.username?.toLowerCase() === formData.username.toLowerCase() && 
        s.password === formData.password
      );

      if (!foundStudent) {
        setError("Akun Santri tidak ditemukan atau password salah!");
        return;
      }

      onLogin({
        id: foundStudent.id,
        name: foundStudent.name,
        username: foundStudent.username || '',
        role: 'santri',
        studentId: foundStudent.id
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#ecfdf5] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-emerald-200/50 overflow-hidden border border-emerald-100">
        <div className="bg-emerald-600 p-8 text-center text-white relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
            <i className="fa-solid fa-mosque text-[10rem] -ml-10 -mt-10"></i>
          </div>
          <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/30 relative z-10">
            <i className="fa-solid fa-book-quran text-3xl text-amber-300"></i>
          </div>
          <h1 className="text-2xl font-black tracking-tight relative z-10">{TPQ_NAME}</h1>
          <p className="text-emerald-100 text-[9px] mt-1 uppercase tracking-[0.3em] font-black opacity-90 relative z-10">{TPQ_LOCATION}</p>
        </div>

        <div className="p-8">
          <div className="space-y-2 mb-8">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Masuk Sebagai</p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={() => { setRole('asatidz'); setError(null); }}
                className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all ${role === 'asatidz' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-lg' : 'border-slate-100 text-slate-300'}`}
              >
                <i className="fa-solid fa-chalkboard-user text-xl"></i>
                <span className="text-[10px] font-black uppercase tracking-widest">Asatidz</span>
              </button>
              <button 
                type="button"
                onClick={() => { setRole('santri'); setError(null); }}
                className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all ${role === 'santri' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-lg' : 'border-slate-100 text-slate-300'}`}
              >
                <i className="fa-solid fa-user-graduate text-xl"></i>
                <span className="text-[10px] font-black uppercase tracking-widest">Santri</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-500 px-4 py-3 rounded-2xl text-[11px] font-bold mb-5 animate-in fade-in">
              <i className="fa-solid fa-circle-exclamation mr-2"></i>{error}
            </div>
          )}

          {showForgotMsg && (
            <div className="bg-blue-50 border border-blue-100 text-blue-600 px-4 py-3 rounded-2xl text-[11px] font-bold mb-5 animate-in fade-in">
              <i className="fa-solid fa-info-circle mr-2"></i>
              {role === 'santri' 
                ? "Silakan hubungi Ustadz/Ustadzah untuk melihat atau mereset kata sandi Anda." 
                : "Gunakan kredensial Super Admin atau hubungi pengelola data untuk reset password."}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
              <input 
                required
                type="text" 
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
                className="w-full bg-slate-50 border-slate-200 border rounded-2xl py-3.5 px-5 outline-none transition-all text-sm font-bold text-slate-700"
                placeholder="Masukkan username"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kata Sandi</label>
              <input 
                required
                type="password" 
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full bg-slate-50 border-slate-200 border rounded-2xl py-3.5 px-5 outline-none transition-all text-sm font-bold text-slate-700"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-[1.25rem] shadow-xl transition-all active:scale-[0.98] mt-4 text-sm uppercase tracking-widest">
              Masuk Sekarang
            </button>
            
            <button 
              type="button" 
              onClick={() => setShowForgotMsg(true)}
              className="w-full text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-colors pt-2"
            >
              Lupa Kata Sandi?
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-300 text-[9px] font-bold uppercase tracking-[0.2em]">
              &copy; {new Date().getFullYear()} {TPQ_NAME}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
