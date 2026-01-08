
import React, { useState } from 'react';
import { User, UserRole } from '../../types';

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
    
    // Simulate authentication
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: isLogin ? (formData.username === 'admin' ? 'Ustadz Ahmad' : 'Santri Budi') : formData.name,
      username: formData.username,
      role: role,
      studentId: role === 'santri' ? '1' : undefined // Link to mock student '1' for demo
    };

    // Save user to simulated DB
    const users = JSON.parse(localStorage.getItem('tpq_users') || '[]');
    if (!isLogin) {
      users.push(mockUser);
      localStorage.setItem('tpq_users', JSON.stringify(users));
    }

    onLogin(mockUser);
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl shadow-emerald-200/50 overflow-hidden border border-emerald-100">
        <div className="bg-emerald-600 p-8 text-center text-white">
          <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <i className="fa-solid fa-mosque text-3xl"></i>
          </div>
          <h1 className="text-2xl font-bold">TPQ Smart Manager</h1>
          <p className="text-emerald-100 text-sm mt-1 opacity-90">Sistem Manajemen Pendidikan Al-Quran</p>
        </div>

        <div className="p-8">
          <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${isLogin ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Masuk
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!isLogin ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Daftar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button 
                type="button"
                onClick={() => setRole('asatidz')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${role === 'asatidz' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold' : 'border-slate-100 text-slate-400'}`}
              >
                <i className="fa-solid fa-chalkboard-user"></i> Asatidz
              </button>
              <button 
                type="button"
                onClick={() => setRole('santri')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${role === 'santri' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold' : 'border-slate-100 text-slate-400'}`}
              >
                <i className="fa-solid fa-user-graduate"></i> Santri
              </button>
            </div>

            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nama Lengkap</label>
                <div className="relative">
                  <i className="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-50 border-slate-100 border rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    placeholder="Masukkan nama anda"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Username</label>
              <div className="relative">
                <i className="fa-solid fa-at absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                <input 
                  required
                  type="text" 
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                  className="w-full bg-slate-50 border-slate-100 border rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="Username"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Kata Sandi</label>
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                <input 
                  required
                  type="password" 
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-slate-50 border-slate-100 border rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-100 transition-all active:scale-[0.98] mt-4"
            >
              {isLogin ? 'Masuk ke Akun' : 'Daftar Sekarang'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-xs mt-8">
            &copy; {new Date().getFullYear()} TPQ Smart Manager. Terlindungi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
