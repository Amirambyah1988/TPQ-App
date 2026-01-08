
import React, { useState, useRef } from 'react';
import { Student } from '../types';

interface StudentListProps {
  students: Student[];
  onAdd: (student: Omit<Student, 'id'>) => void;
  onUpdate: (student: Student) => void;
  onDelete: (id: string) => void;
}

const StudentList: React.FC<StudentListProps> = ({ students, onAdd, onUpdate, onDelete }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialFormData: Omit<Student, 'id'> = {
    name: '',
    nik: '',
    placeOfBirth: '',
    dateOfBirth: '',
    fatherName: '',
    motherName: '',
    class: 'Iqra 1',
    joinDate: new Date().toISOString().split('T')[0],
    photo: ''
  };

  const [formData, setFormData] = useState<Omit<Student, 'id'>>(initialFormData);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      onUpdate({ ...formData, id: editingStudent.id });
    } else {
      onAdd(formData);
    }
    closeForm();
  };

  const openEdit = (student: Student) => {
    setEditingStudent(student);
    const { id, ...studentData } = student;
    setFormData({ ...studentData, photo: studentData.photo || '' });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingStudent(null);
    setFormData(initialFormData);
  };

  const exportToCSV = () => {
    const headers = ['Nama', 'NIK', 'Tempat Lahir', 'Tgl Lahir', 'Nama Ayah', 'Nama Ibu', 'Kelas', 'Tgl Bergabung'];
    const rows = students.map(s => [
      s.name, s.nik, s.placeOfBirth, s.dateOfBirth, s.fatherName, s.motherName, s.class, s.joinDate
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `daftar_santri_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Manajemen Santri</h2>
          <p className="text-sm text-slate-500 font-medium">Pengelolaan data induk dan informasi keluarga santri.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={exportToCSV}
            className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-all font-semibold text-sm shadow-sm"
          >
            <i className="fa-solid fa-file-export"></i> Export CSV
          </button>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 text-sm font-semibold"
          >
            <i className="fa-solid fa-plus"></i> Tambah Santri
          </button>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-slate-800">
                {editingStudent ? 'Edit Data Santri' : 'Tambah Santri Baru'}
              </h3>
              <button onClick={closeForm} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400">
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="flex flex-col items-center gap-4 mb-6">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-emerald-500 transition-colors group"
                >
                  {formData.photo ? (
                    <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <i className="fa-solid fa-camera text-slate-300 group-hover:text-emerald-500 mb-1"></i>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Foto</span>
                    </>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nama Lengkap</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">NIK (16 Digit)</label>
                  <input required maxLength={16} value={formData.nik} onChange={e => setFormData({...formData, nik: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Tempat Lahir</label>
                  <input required value={formData.placeOfBirth} onChange={e => setFormData({...formData, placeOfBirth: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Tanggal Lahir</label>
                  <input type="date" required value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nama Ayah</label>
                  <input required value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nama Ibu</label>
                  <input required value={formData.motherName} onChange={e => setFormData({...formData, motherName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Kelas</label>
                  <select value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 text-sm">
                    {['Iqra 1', 'Iqra 2', 'Iqra 3', 'Iqra 4', 'Iqra 5', 'Iqra 6', 'Al-Quran'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={closeForm} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all">Batal</button>
                <button type="submit" className="flex-1 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-lg shadow-emerald-100 transition-all">Simpan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-emerald-600 h-32 relative">
               <button onClick={() => setViewingStudent(null)} className="absolute top-4 right-4 w-8 h-8 bg-black/20 text-white rounded-full flex items-center justify-center hover:bg-black/30 transition-all">
                 <i className="fa-solid fa-times"></i>
               </button>
            </div>
            <div className="px-6 pb-8 text-center -mt-16 relative">
              <div className="w-32 h-32 rounded-3xl border-4 border-white shadow-xl overflow-hidden mx-auto bg-slate-100">
                {viewingStudent.photo ? (
                  <img src={viewingStudent.photo} alt={viewingStudent.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-emerald-600">
                    {viewingStudent.name.charAt(0)}
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-800 mt-4">{viewingStudent.name}</h3>
              <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest">{viewingStudent.class}</p>
              
              <div className="mt-8 space-y-4 text-left bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <DetailRow label="NIK" value={viewingStudent.nik} />
                <DetailRow label="TTL" value={`${viewingStudent.placeOfBirth}, ${new Date(viewingStudent.dateOfBirth).toLocaleDateString('id-ID')}`} />
                <DetailRow label="Nama Ayah" value={viewingStudent.fatherName} />
                <DetailRow label="Nama Ibu" value={viewingStudent.motherName} />
                <DetailRow label="Bergabung" value={new Date(viewingStudent.joinDate).toLocaleDateString('id-ID')} />
              </div>

              <div className="mt-6 flex gap-2">
                <button 
                  onClick={() => { setViewingStudent(null); openEdit(viewingStudent); }}
                  className="flex-1 bg-white border border-slate-200 py-3 rounded-2xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all"
                >
                  Edit Data
                </button>
                <button 
                  onClick={() => { setViewingStudent(null); onDelete(viewingStudent.id); }}
                  className="flex-1 bg-red-50 text-red-500 py-3 rounded-2xl font-bold text-sm hover:bg-red-100 transition-all"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Santri</th>
              <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">NIK</th>
              <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Kelas</th>
              <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Orang Tua</th>
              <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {students.map(s => (
              <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 overflow-hidden flex items-center justify-center text-emerald-700 font-bold border border-emerald-100">
                      {s.photo ? <img src={s.photo} className="w-full h-full object-cover" /> : s.name.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-800">{s.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500 text-sm font-mono">{s.nik}</td>
                <td className="px-6 py-4">
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase">{s.class}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs">
                    <p className="font-bold text-slate-600">A: {s.fatherName}</p>
                    <p className="font-medium text-slate-400">I: {s.motherName}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <ActionButton onClick={() => setViewingStudent(s)} icon="fa-eye" color="text-slate-400 hover:text-emerald-500" title="Detail" />
                    <ActionButton onClick={() => openEdit(s)} icon="fa-edit" color="text-slate-400 hover:text-blue-500" title="Edit" />
                    <ActionButton onClick={() => onDelete(s.id)} icon="fa-trash-can" color="text-slate-400 hover:text-red-500" title="Hapus" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Card Layout */}
      <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
        {students.map(s => (
          <div key={s.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 overflow-hidden flex items-center justify-center text-emerald-700 font-bold border border-emerald-100">
                {s.photo ? <img src={s.photo} className="w-full h-full object-cover" /> : s.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">{s.name}</p>
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">{s.class}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setViewingStudent(s)} 
                className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center active:scale-90 transition-transform"
                title="Lihat Detail"
              >
                <i className="fa-solid fa-eye text-xs"></i>
              </button>
              <button 
                onClick={() => openEdit(s)} 
                className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center active:scale-90 transition-transform"
                title="Edit Data"
              >
                <i className="fa-solid fa-edit text-xs"></i>
              </button>
              <button 
                onClick={() => onDelete(s.id)} 
                className="w-9 h-9 rounded-xl bg-red-50 text-red-400 flex items-center justify-center active:scale-90 transition-transform"
                title="Hapus Santri"
              >
                <i className="fa-solid fa-trash-can text-xs"></i>
              </button>
            </div>
          </div>
        ))}
        {students.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-slate-100 border-dashed">
            <p className="text-slate-400 text-sm font-medium">Belum ada data santri.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ActionButton = ({ onClick, icon, color, title }: { onClick: () => void, icon: string, color: string, title: string }) => (
  <button 
    onClick={onClick}
    title={title}
    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-slate-50 ${color}`}
  >
    <i className={`fa-solid ${icon} text-sm`}></i>
  </button>
);

const DetailRow = ({ label, value }: { label: string, value: string }) => (
  <div>
    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
    <p className="text-sm font-bold text-slate-700">{value}</p>
  </div>
);

export default StudentList;
