
import React, { useState, useRef } from 'react';
import { Asatidz } from '../types';

interface AsatidzListProps {
  asatidz: Asatidz[];
  onAdd: (ustadz: Omit<Asatidz, 'id'>) => void;
  onUpdate: (ustadz: Asatidz) => void;
  onDelete: (id: string) => void;
}

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
    placeOfBirth: '',
    dateOfBirth: '',
    education: '',
    specialization: '', 
    assignedClasses: [],
    joinDate: new Date().toISOString().split('T')[0], 
    status: 'Aktif', 
    photo: '', 
    username: '', 
    password: ''
  };

  const [formData, setFormData] = useState<Omit<Asatidz, 'id'>>(initialFormData);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (editingUstadz) onUpdate({ ...formData, id: editingUstadz.id } as Asatidz);
    else onAdd(formData);
    closeForm();
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingUstadz(null);
    setFormData(initialFormData);
  };

  const handleDeleteClick = (id: string) => {
    onDelete(id);
    if (viewingUstadz?.id === id) setViewingUstadz(null);
  };

  const handleEdit = (u: Asatidz) => {
    setEditingUstadz(u);
    setFormData({ ...u });
    setIsFormOpen(true);
    setViewingUstadz(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Data Asatidz</h2>
          <p className="text-sm text-slate-500 font-bold">Total: {asatidz.length} Pengajar</p>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black text-sm shadow-xl active:scale-95 transition-all">
          <i className="fa-solid fa-user-plus mr-2"></i> Tambah Asatidz
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asatidz</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bidang</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {asatidz.length > 0 ? asatidz.map(u => (
              <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 shadow-inner overflow-hidden">
                    {u.photo ? <img src={u.photo} className="w-full h-full object-cover" /> : u.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800 leading-none mb-1">{u.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{u.education || 'N/A'}</p>
                  </div>
                </td>
                <td className="px-8 py-4">
                  <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-tighter">{u.specialization}</span>
                </td>
                <td className="px-8 py-4 text-center">
                  <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border ${u.status === 'Aktif' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-8 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setViewingUstadz(u)} className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 flex items-center justify-center transition-all shadow-sm"><i className="fa-solid fa-eye text-xs"></i></button>
                    <button onClick={() => handleEdit(u)} className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 flex items-center justify-center transition-all shadow-sm"><i className="fa-solid fa-edit text-xs"></i></button>
                    <button 
                      onClick={() => handleDeleteClick(u.id)} 
                      className="h-9 px-3 rounded-xl bg-red-50 border border-red-100 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shadow-sm gap-2 text-[10px] font-black uppercase tracking-tighter"
                    >
                      <i className="fa-solid fa-trash-can text-[10px]"></i>
                      <span className="hidden sm:inline">Hapus</span>
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center text-slate-300 italic text-sm font-bold uppercase tracking-widest">Belum ada data asatidz.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal View Detail Asatidz */}
      {viewingUstadz && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-300 my-auto">
            <div className="bg-indigo-600 h-32 relative">
              <button onClick={() => setViewingUstadz(null)} className="absolute top-4 right-4 w-9 h-9 bg-black/20 text-white rounded-full flex items-center justify-center hover:bg-black/30 transition-colors"><i className="fa-solid fa-times"></i></button>
            </div>
            <div className="px-8 pb-8 text-center -mt-16 relative">
              <div className="w-32 h-32 rounded-[2rem] border-4 border-white shadow-xl overflow-hidden mx-auto bg-slate-100 flex items-center justify-center">
                {viewingUstadz.photo ? <img src={viewingUstadz.photo} className="w-full h-full object-cover" /> : <span className="text-4xl font-black text-indigo-600">{viewingUstadz.name.charAt(0)}</span>}
              </div>
              <h3 className="text-2xl font-black text-slate-800 mt-4 tracking-tight">{viewingUstadz.name}</h3>
              <p className="text-indigo-600 font-bold text-xs uppercase tracking-widest mt-1">{viewingUstadz.specialization}</p>
              
              <div className="mt-8 grid grid-cols-1 gap-4 text-left">
                <InfoItem label="NIK" value={viewingUstadz.nik} />
                <InfoItem label="Tempat, Tgl Lahir" value={`${viewingUstadz.placeOfBirth}, ${new Date(viewingUstadz.dateOfBirth).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`} />
                <InfoItem label="Pendidikan" value={viewingUstadz.education} />
                <InfoItem label="Mulai Tugas" value={new Date(viewingUstadz.joinDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} />
                <InfoItem label="Alamat" value={viewingUstadz.address} />
                <InfoItem label="No. HP / WA" value={viewingUstadz.phone} />
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mt-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Akun Portal</p>
                  <p className="text-xs font-black text-slate-700">User: <span className="text-indigo-600">{viewingUstadz.username}</span> | Pass: <span className="text-indigo-600">{viewingUstadz.password}</span></p>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button onClick={() => handleEdit(viewingUstadz)} className="flex-1 py-4 bg-slate-100 text-slate-700 font-black rounded-2xl text-xs hover:bg-slate-200 transition-all uppercase tracking-widest">Edit</button>
                <button 
                  onClick={() => handleDeleteClick(viewingUstadz.id)} 
                  className="flex-1 py-4 bg-red-50 text-red-500 font-black rounded-2xl text-xs hover:bg-red-500 hover:text-white transition-all shadow-sm uppercase tracking-widest"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-3xl shadow-2xl p-8 relative my-auto">
            <button onClick={closeForm} className="absolute top-6 right-8 text-slate-300 hover:text-slate-500 transition-colors"><i className="fa-solid fa-times text-xl"></i></button>
            <h3 className="text-2xl font-black text-slate-800 mb-8 tracking-tight">{editingUstadz ? 'Update Data Asatidz' : 'Pendaftaran Asatidz Baru'}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Photo Upload Section */}
                <div className="flex flex-col items-center gap-4">
                  <div className="w-32 h-32 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group">
                    {formData.photo ? (
                      <img src={formData.photo} className="w-full h-full object-cover" />
                    ) : (
                      <i className="fa-solid fa-camera text-slate-300 text-2xl"></i>
                    )}
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] font-black uppercase"
                    >
                      <i className="fa-solid fa-upload mb-1"></i> Ganti Foto
                    </button>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  <p className="text-[9px] font-black text-slate-400 uppercase text-center max-w-[120px]">Format: JPG/PNG, Maks: 2MB</p>
                </div>

                {/* Form Fields Section */}
                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <Input label="Nama Lengkap" value={formData.name} onChange={v => setFormData({...formData, name: v})} />
                  <Input label="NIK" value={formData.nik} onChange={v => setFormData({...formData, nik: v})} />
                  <Input label="Tempat Lahir" value={formData.placeOfBirth} onChange={v => setFormData({...formData, placeOfBirth: v})} />
                  <Input label="Tanggal Lahir" type="date" value={formData.dateOfBirth} onChange={v => setFormData({...formData, dateOfBirth: v})} />
                  <Input label="Pendidikan Terakhir" placeholder="Contoh: S1 PAI" value={formData.education} onChange={v => setFormData({...formData, education: v})} />
                  <Input label="Mulai Tugas" type="date" value={formData.joinDate} onChange={v => setFormData({...formData, joinDate: v})} />
                  <Input label="Bidang Spesialisasi" placeholder="Contoh: Tahfidz" value={formData.specialization} onChange={v => setFormData({...formData, specialization: v})} />
                  <Input label="Nomor WhatsApp" value={formData.phone} onChange={v => setFormData({...formData, phone: v})} />
                  <div className="md:col-span-2">
                    <Input label="Alamat Lengkap" value={formData.address} onChange={v => setFormData({...formData, address: v})} />
                  </div>
                  <div className="pt-4 border-t border-slate-100 md:col-span-2 grid grid-cols-2 gap-4">
                    <Input label="Username Portal" value={formData.username || ''} onChange={v => setFormData({...formData, username: v})} />
                    <Input label="Password Portal" value={formData.password || ''} onChange={v => setFormData({...formData, password: v})} />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-10 pt-6 border-t border-slate-100">
                <button type="button" onClick={closeForm} className="flex-1 py-4 font-black text-slate-500 text-sm hover:bg-slate-50 rounded-2xl transition-all uppercase tracking-widest">Batal</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 text-sm hover:bg-indigo-700 transition-all uppercase tracking-widest">Simpan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Input = ({ label, value, onChange, type = "text", placeholder }: any) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input 
      required 
      type={type} 
      value={value} 
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)} 
      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
    />
  </div>
);

const InfoItem = ({ label, value }: { label: string, value: string }) => (
  <div className="border-b border-slate-50 pb-2">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <p className="text-sm font-bold text-slate-700">{value || '-'}</p>
  </div>
);

export default AsatidzList;
