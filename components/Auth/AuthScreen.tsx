
import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { TPQ_NAME, TPQ_LOCATION, TPQ_ADDRESS } from '../../constants';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>('asatidz');
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: isLogin ? (formData.username === 'admin' ? 'Ustadz Ahmad' : 'Santri Budi') : formData.name,
      username: formData.username,
      role: role,
      studentId: role === 'santri' ? '1' : undefined
    };

    onLogin(mockUser);
  };

  return (
    <div className="min-h-screen bg-[#ecfdf5] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-emerald-200/50 overflow-hidden border border-emerald-100">
        <div className="bg-emerald-600 p-10 text-center text-white relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
            <i className="fa-solid fa-mosque text-9xl -ml-20 -mt-10"></i>
            <i className="fa-solid fa-book-quran text-9xl -mr-20 -mb-10 absolute bottom-0 right-0"></i>
          </div>
          
          <div className="bg-white/20 w-20 h-20 rounded-[1.75rem] flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/30 shadow-xl relative z-10">
            <i className="fa-solid fa-book-quran text-4xl text-amber-300"></i>
          </div>
          <h1 className="text-3xl font-black tracking-tight relative z-10">{TPQ_NAME}</h1>
          <p className="text-emerald-100 text-xs mt-1 uppercase tracking-[0.3em] font-black opacity-90 relative z-10">{TPQ_LOCATION}</p>
        </div>

        <div className="p-8">
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Masuk
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Daftar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button 
                type="button"
                onClick={() => setRole('asatidz')}
                className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border-2 transition-all ${role === 'asatidz' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 text-slate-300'}`}
              >
                <i className="fa-solid fa-chalkboard-user text-xl"></i>
                <span className="text-[10px] font-black uppercase tracking-widest">Asatidz</span>
              </button>
              <button 
                type="button"
                onClick={() => setRole('santri')}
                className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border-2 transition-all ${role === 'santri' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 text-slate-300'}`}
              >
                <i className="fa-solid fa-user-graduate text-xl"></i>
                <span className="text-[10px] font-black uppercase tracking-widest">Santri</span>
              </button>
            </div>

            <div className="space-y-4">
              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                  <div className="relative">
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-50 border-slate-200 border rounded-2xl py-3.5 px-5 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-bold text-slate-700"
                      placeholder="Nama lengkap santri/guru"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                <div className="relative">
                  <input 
                    required
                    type="text" 
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    className="w-full bg-slate-50 border-slate-200 border rounded-2xl py-3.5 px-5 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-bold text-slate-700"
                    placeholder="Username"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kata Sandi</label>
                <div className="relative">
                  <input 
                    required
                    type="password" 
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-slate-50 border-slate-200 border rounded-2xl py-3.5 px-5 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-bold text-slate-700"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-[1.25rem] shadow-xl shadow-emerald-100 transition-all active:scale-[0.98] mt-6 text-sm uppercase tracking-widest"
            >
              {isLogin ? 'Masuk Sekarang' : 'Daftar Akun'}
            </button>
          </form>

          <div className="mt-10 text-center space-y-2">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-relaxed px-4">
              <i className="fa-solid fa-location-dot text-emerald-500 mr-1"></i> {TPQ_ADDRESS}
            </p>
            <p className="text-slate-300 text-[9px] font-bold uppercase tracking-[0.2em] pt-2">
              &copy; {new Date().getFullYear()} {TPQ_NAME}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
