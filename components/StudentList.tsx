
import React, { useState } from 'react';
import { Student } from '../types';

interface StudentListProps {
  students: Student[];
  onAdd: (student: Omit<Student, 'id'>) => void;
  onDelete: (id: string) => void;
}

const StudentList: React.FC<StudentListProps> = ({ students, onAdd, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', class: 'Iqra 1', parentName: '', joinDate: new Date().toISOString().split('T')[0] });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({ name: '', class: 'Iqra 1', parentName: '', joinDate: new Date().toISOString().split('T')[0] });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg md:text-xl font-bold text-slate-800">Daftar Santri</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 md:px-4 md:py-2 rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95 text-sm font-semibold"
        >
          <i className={`fa-solid ${isAdding ? 'fa-times' : 'fa-plus'}`}></i>
          {isAdding ? 'Batal' : 'Tambah'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-5 md:p-6 rounded-2xl border border-emerald-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nama Santri</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition-all"
                placeholder="Contoh: Budi Santoso"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Kelas</label>
              <select 
                value={formData.class}
                onChange={e => setFormData({...formData, class: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-sm appearance-none cursor-pointer"
              >
                {['Iqra 1', 'Iqra 2', 'Iqra 3', 'Iqra 4', 'Iqra 5', 'Iqra 6', 'Al-Quran'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nama Orang Tua</label>
              <input 
                required
                type="text" 
                value={formData.parentName}
                onChange={e => setFormData({...formData, parentName: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
                placeholder="Nama ayah/ibu"
              />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full bg-emerald-600 text-white py-2.5 rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-50 transition-all active:scale-95">Simpan Data</button>
            </div>
          </div>
        </form>
      )}

      {/* Responsive List: Table on desktop, Cards on mobile */}
      <div className="md:hidden space-y-3">
        {students.map(s => (
          <div key={s.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
                {s.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">{s.name}</p>
                <div className="flex gap-2 mt-0.5">
                  <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-1.5 py-0.5 rounded uppercase">{s.class}</span>
                  <span className="text-[10px] text-slate-400 font-medium italic">{s.parentName}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => onDelete(s.id)}
              className="w-8 h-8 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition-all"
            >
              <i className="fa-solid fa-trash-can text-xs"></i>
            </button>
          </div>
        ))}
        {students.length === 0 && (
          <div className="py-12 text-center text-slate-400">
            <i className="fa-solid fa-folder-open text-4xl mb-3 block"></i>
            Belum ada santri terdaftar.
          </div>
        )}
      </div>

      <div className="hidden md:block bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-extrabold text-slate-400 uppercase tracking-widest">Santri</th>
              <th className="px-6 py-4 text-xs font-extrabold text-slate-400 uppercase tracking-widest">Kelas</th>
              <th className="px-6 py-4 text-xs font-extrabold text-slate-400 uppercase tracking-widest">Orang Tua</th>
              <th className="px-6 py-4 text-xs font-extrabold text-slate-400 uppercase tracking-widest text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {students.map(s => (
              <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-100 group-hover:bg-emerald-100 transition-colors">
                      {s.name.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-800">{s.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider">{s.class}</span>
                </td>
                <td className="px-6 py-4 text-slate-600 text-sm font-medium">{s.parentName}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => onDelete(s.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentList;
