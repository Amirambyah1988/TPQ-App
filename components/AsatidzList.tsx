
import React, { useState, useRef } from 'react';
import { Asatidz } from '../types';

interface AsatidzListProps {
  asatidz: Asatidz[];
  onAdd: (ustadz: Omit<Asatidz, 'id'>) => void;
  onUpdate: (ustadz: Asatidz) => void;
  onDelete: (id: string) => void;
}

const AVAILABLE_CLASSES = ['Iqra 1', 'Iqra 2', 'Iqra 3', 'Iqra 4', 'Iqra 5', 'Iqra 6', 'Al-Quran'];

const AsatidzList: React.FC<AsatidzListProps> = ({ asatidz, onAdd, onUpdate, onDelete }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUstadz, setEditingUstadz] = useState<Asatidz | null>(null);
  const [viewingUstadz, setViewingUstadz] = useState<Asatidz | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialFormData: Omit<Asatidz, 'id'> = {
    name: '',
    nik: '',
    phone: '',
    address: '',
    specialization: '',
    assignedClasses: [],
    joinDate: new Date().toISOString().split('T')[0],
    status: 'Aktif',
    photo: ''
  };

  const [formData, setFormData] = useState<Omit<Asatidz, 'id'>>(initialFormData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUstadz) {
      onUpdate({ ...formData, id: editingUstadz.id } as Asatidz);
    } else {
      onAdd(formData);
    }
    closeForm();
  };

  const openEdit = (ustadz: Asatidz) => {
    setEditingUstadz(ustadz);
    setFormData({ ...ustadz });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingUstadz(null);
    setFormData(initialFormData);
  };

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

  const toggleClass = (className: string) => {
    const current = formData.assignedClasses || [];
    if (current.includes(className)) {
      setFormData({ ...formData, assignedClasses: current.filter(c => c !== className) });
    } else {
      setFormData({ ...formData, assignedClasses: [...current, className] });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Hapus data pengajar ini secara permanen?')) {
      onDelete(id);
    }
  };

  const exportToCSV = () => {
    const headers = ['Nama', 'NIK', 'Telepon', 'Alamat', 'Spesialisasi', 'Kelas Diampu', 'Status', 'Tgl Bergabung'];
    const rows = asatidz.map(u => [
      u.name, u.nik, u.phone, u.address, u.specialization, u.assignedClasses?.join('; ') || '', u.status, u.joinDate
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `manajemen_asatidz_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Manajemen Asatidz</h2>
          <p className="text-sm text-slate-500 font-medium">Pengelolaan data pengajar dan penugasan kelas.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={exportToCSV}
            className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-all font-bold text-sm shadow-sm"
          >
            <i className="fa-solid fa-file-export"></i> Export CSV
          </button>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-100 active:scale-95 text-sm font-bold"
          >
            <i className="fa-solid fa-user-plus"></i> Tambah Asatidz
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white z-10">
              <div>
                <h3 className="text-xl font-extrabold text-slate-800">{editingUstadz ? 'Edit Data Pengajar' : 'Pendaftaran Asatidz'}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Lengkapi informasi di bawah ini</p>
              </div>
              <button onClick={closeForm} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"><i className="fa-solid fa-times"></i></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto flex-grow">
              <div className="flex items-center gap-6">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-emerald-500 transition-all group"
                >
                  {formData.photo ? (
                    <img src={formData.photo} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <i className="fa-solid fa-camera text-slate-300 group-hover:text-emerald-500 text-xl mb-1"></i>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Foto</span>
                    </>
                  )}
                </div>
                <div className="flex-grow space-y-1">
                  <p className="text-sm font-bold text-slate-700">Foto Profil</p>
                  <p className="text-[10px] text-slate-400 leading-relaxed uppercase font-bold">Gunakan foto formal dengan background polos.</p>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input label="Nama Lengkap" value={formData.name} onChange={v => setFormData({...formData, name: v})} />
                <Input label="NIK" value={formData.nik} onChange={v => setFormData({...formData, nik: v})} placeholder="32xxxxxxxxxxxxxx" />
                <Input label="No. WhatsApp" value={formData.phone} onChange={v => setFormData({...formData, phone: v})} placeholder="08xxxxxxxx" />
                <Input label="Spesialisasi" value={formData.specialization} onChange={v => setFormData({...formData, specialization: v})} placeholder="Contoh: Tahsin, Tajwid, Fiqh" />
                
                <div className="space-y-1">
                   <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Status Kepegawaian</label>
                   <select 
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                   >
                     <option value="Aktif">Aktif</option>
                     <option value="Cuti">Cuti</option>
                     <option value="Non-Aktif">Non-Aktif</option>
                   </select>
                </div>

                <div className="space-y-1">
                   <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Mulai Mengajar</label>
                   <input 
                    type="date"
                    value={formData.joinDate}
                    onChange={e => setFormData({...formData, joinDate: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                   />
                </div>

                <div className="md:col-span-2">
                  <Input label="Alamat Domisili" value={formData.address} onChange={v => setFormData({...formData, address: v})} />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Penugasan Kelas</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_CLASSES.map(cls => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => toggleClass(cls)}
                      className={`
                        px-4 py-2 rounded-xl text-xs font-bold border transition-all
                        ${(formData.assignedClasses || []).includes(cls)
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-100'
                          : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                        }
                      `}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-slate-100">
                <button type="button" onClick={closeForm} className="flex-1 py-4 font-extrabold text-slate-500 hover:bg-slate-50 rounded-[1.25rem] transition-all text-sm">Batal</button>
                <button type="submit" className="flex-1 py-4 font-extrabold text-white bg-emerald-600 rounded-[1.25rem] shadow-xl shadow-emerald-100 transition-all active:scale-95 text-sm">Simpan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {viewingUstadz && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-emerald-600 h-32 relative">
               <div className="absolute top-4 left-6 flex items-center gap-2">
                 <span className={`w-2.5 h-2.5 rounded-full ${viewingUstadz.status === 'Aktif' ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`}></span>
                 <span className="text-[10px] font-bold text-white uppercase tracking-widest">{viewingUstadz.status}</span>
               </div>
               <button onClick={() => setViewingUstadz(null)} className="absolute top-4 right-4 w-9 h-9 bg-black/10 text-white rounded-full flex items-center justify-center hover:bg-black/20 transition-all">
                 <i className="fa-solid fa-times"></i>
               </button>
            </div>
            <div className="px-8 pb-10 text-center -mt-16 relative">
              <div className="w-36 h-36 rounded-[2.5rem] border-8 border-white shadow-2xl overflow-hidden mx-auto bg-slate-100 flex items-center justify-center">
                {viewingUstadz.photo ? (
                  <img src={viewingUstadz.photo} alt={viewingUstadz.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-emerald-600">{viewingUstadz.name.charAt(0)}</span>
                )}
              </div>
              <div className="mt-6">
                <h3 className="text-2xl font-extrabold text-slate-800 leading-tight">{viewingUstadz.name}</h3>
                <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest mt-1">{viewingUstadz.specialization}</p>
              </div>
              <div className="mt-8 space-y-5 text-left bg-slate-50/80 p-6 rounded-[2rem] border border-slate-100">
                <DetailRow label="NIK Pengajar" value={viewingUstadz.nik} />
                <DetailRow label="WhatsApp" value={viewingUstadz.phone} />
                <DetailRow label="Kelas Diampu" value={viewingUstadz.assignedClasses?.join(', ') || 'Belum ditugaskan'} />
                <DetailRow label="Tgl Bergabung" value={new Date(viewingUstadz.joinDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })} />
              </div>
              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => { setViewingUstadz(null); openEdit(viewingUstadz); }}
                  className="flex-1 bg-white border border-slate-200 py-4 rounded-2xl text-slate-700 font-extrabold text-sm hover:bg-slate-50 transition-all active:scale-95"
                >
                  Edit Profil
                </button>
                <button 
                  onClick={() => { setViewingUstadz(null); handleDelete(viewingUstadz.id); }}
                  className="flex-1 bg-red-50 text-red-500 py-4 rounded-2xl font-extrabold text-sm hover:bg-red-100 transition-all active:scale-95"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/80 border-b border-slate-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Profil Asatidz</th>
              <th className="px-8 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Kompetensi</th>
              <th className="px-8 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Penugasan Kelas</th>
              <th className="px-8 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {asatidz.map(u => (
              <tr key={u.id} className="hover:bg-slate-50/50 group transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center font-bold text-emerald-700 overflow-hidden shadow-sm">
                      {u.photo ? <img src={u.photo} className="w-full h-full object-cover" /> : u.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-extrabold text-slate-800 text-sm">{u.name}</p>
                        <StatusBadge status={u.status} />
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{u.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider shadow-sm border border-blue-100">{u.specialization}</span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex flex-wrap gap-1">
                    {u.assignedClasses && u.assignedClasses.length > 0 ? (
                      u.assignedClasses.map(cls => (
                        <span key={cls} className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg text-[9px] font-bold border border-slate-200">{cls}</span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-300 italic font-medium">Belum ditugaskan</span>
                    )}
                  </div>
                </td>
                <td className="px-8 py-5 text-right">
                   <div className="flex justify-end gap-1.5 group-hover:opacity-100 transition-opacity">
                    <ActionButton onClick={() => setViewingUstadz(u)} icon="fa-eye" color="text-slate-400 hover:text-emerald-500 hover:bg-emerald-50" title="Detail" />
                    <ActionButton onClick={() => openEdit(u)} icon="fa-edit" color="text-slate-400 hover:text-blue-500 hover:bg-blue-50" title="Edit" />
                    <ActionButton onClick={() => handleDelete(u.id)} icon="fa-trash-can" color="text-slate-400 hover:text-red-500 hover:bg-red-50" title="Hapus" />
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
        {asatidz.map(u => (
          <div key={u.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center font-bold text-emerald-700 overflow-hidden shadow-sm">
                  {u.photo ? <img src={u.photo} className="w-full h-full object-cover" /> : u.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-extrabold text-slate-800 text-sm">{u.name}</p>
                    <StatusBadge status={u.status} />
                  </div>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">{u.specialization}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
               {u.assignedClasses?.map(cls => (
                 <span key={cls} className="bg-slate-50 text-slate-500 px-2 py-0.5 rounded-lg text-[9px] font-bold border border-slate-100">{cls}</span>
               ))}
            </div>
            <div className="flex gap-2 pt-2 border-t border-slate-50">
              <button onClick={() => setViewingUstadz(u)} className="flex-1 bg-slate-50 text-slate-600 py-3 rounded-xl text-[10px] font-extrabold uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-600 transition-all">Detail</button>
              <button onClick={() => openEdit(u)} className="flex-1 bg-slate-50 text-slate-600 py-3 rounded-xl text-[10px] font-extrabold uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-all">Edit</button>
              <button onClick={() => handleDelete(u.id)} className="w-12 bg-red-50 text-red-500 py-3 rounded-xl flex items-center justify-center hover:bg-red-100 transition-all"><i className="fa-solid fa-trash-can text-xs"></i></button>
            </div>
          </div>
        ))}
        {asatidz.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border border-slate-100 shadow-sm">
            <i className="fa-solid fa-user-slash text-slate-200 text-3xl mb-3"></i>
            <p className="text-slate-400 font-bold text-sm">Belum ada data asatidz.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Input = ({ label, value, onChange, placeholder = "" }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input 
      required 
      value={value} 
      onChange={e => onChange(e.target.value)} 
      placeholder={placeholder}
      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300" 
    />
  </div>
);

const ActionButton = ({ onClick, icon, color, title }: { onClick: () => void, icon: string, color: string, title: string }) => (
  <button 
    onClick={onClick}
    title={title}
    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${color}`}
  >
    <i className={`fa-solid ${icon} text-sm`}></i>
  </button>
);

const DetailRow = ({ label, value }: { label: string, value: string }) => (
  <div>
    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 leading-none">{label}</p>
    <p className="text-sm font-extrabold text-slate-700 leading-tight">{value}</p>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const colors = {
    'Aktif': 'bg-emerald-500',
    'Cuti': 'bg-amber-500',
    'Non-Aktif': 'bg-slate-300'
  };
  return (
    <span className="flex items-center gap-1">
      <span className={`w-1.5 h-1.5 rounded-full ${colors[status as keyof typeof colors] || 'bg-slate-300'}`}></span>
      <span className="text-[8px] font-extrabold uppercase text-slate-400 tracking-tighter">{status}</span>
    </span>
  );
};

export default AsatidzList;
