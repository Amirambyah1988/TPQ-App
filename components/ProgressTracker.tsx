
import React from 'react';
import { Student, ProgressRecord, FluencyLevel, MemorizationStatus, CustomMemorization } from '../types';

interface ProgressTrackerProps {
  students: Student[];
  progress: ProgressRecord[];
  onSaveProgress: (record: Omit<ProgressRecord, 'id'>) => void;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ students, progress, onSaveProgress }) => {
  const [selectedStudentId, setSelectedStudentId] = React.useState<string>('');
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [isFormOpen, setIsFormOpen] = React.useState(false);

  const initialFormState: Omit<ProgressRecord, 'id' | 'studentId' | 'date'> = {
    readingType: 'Iqra',
    readingLevel: '',
    readingPage: '',
    fluency: 'Lancar',
    memorizationSurah: '',
    memorizationSurahStatus: 'Belum',
    memorizationDua: '',
    memorizationDuaStatus: 'Belum',
    memorizationHadith: '',
    memorizationHadithStatus: 'Belum',
    memorizationShalat: '',
    memorizationShalatStatus: 'Belum',
    customMemorization: [],
    notes: ''
  };

  const [formData, setFormData] = React.useState(initialFormState);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;
    onSaveProgress({
      ...formData,
      studentId: selectedStudentId,
      date: date
    });
    setIsFormOpen(false);
    setFormData(initialFormState);
  };

  const addCustomMateri = () => {
    const newItem: CustomMemorization = { label: '', value: '', status: 'Belum' };
    setFormData({ ...formData, customMemorization: [...(formData.customMemorization || []), newItem] });
  };

  const updateCustomMateri = (index: number, field: keyof CustomMemorization, val: string) => {
    const updated = [...(formData.customMemorization || [])];
    updated[index] = { ...updated[index], [field]: val };
    setFormData({ ...formData, customMemorization: updated });
  };

  const removeCustomMateri = (index: number) => {
    setFormData({ ...formData, customMemorization: formData.customMemorization?.filter((_, i) => i !== index) });
  };

  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const studentHistory = progress
    .filter(p => p.studentId === selectedStudentId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Progres Belajar Santri</h2>
          <p className="text-sm text-slate-500 font-medium">Catat pencapaian bacaan dan hafalan harian.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <select 
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="flex-grow lg:flex-grow-0 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          >
            <option value="">Pilih Santri...</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.class})</option>)}
          </select>
          <button 
            disabled={!selectedStudentId}
            onClick={() => setIsFormOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-100 transition-all active:scale-95"
          >
            <i className="fa-solid fa-pen-to-square mr-2"></i> Catat Progres
          </button>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden flex flex-col max-h-[95vh]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white z-10">
              <div>
                <h3 className="text-xl font-extrabold text-slate-800">Log Progres Belajar</h3>
                <p className="text-xs text-slate-400 font-bold uppercase mt-1">{selectedStudent?.name}</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"><i className="fa-solid fa-times"></i></button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6 overflow-y-auto flex-grow">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Tanggal</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Jenis Bacaan</label>
                  <select value={formData.readingType} onChange={e => setFormData({...formData, readingType: e.target.value as any})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="Iqra">Iqra</option>
                    <option value="Al-Quran">Al-Quran</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Jilid / Juz</label>
                  <input placeholder="Contoh: Jilid 2 / Juz 30" value={formData.readingLevel} onChange={e => setFormData({...formData, readingLevel: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Halaman</label>
                  <input placeholder="Halaman ke-..." value={formData.readingPage} onChange={e => setFormData({...formData, readingPage: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Tingkat Kelancaran</label>
                <div className="flex gap-2">
                  {(['Lancar', 'Cukup', 'Kurang'] as FluencyLevel[]).map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData({...formData, fluency: level})}
                      className={`flex-1 py-3 rounded-2xl text-xs font-bold border transition-all ${
                        formData.fluency === level 
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100' 
                        : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-slate-100">
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Hafalan Baru & Status</h4>
                <div className="space-y-4">
                  <MemorizationInput label="Hafalan Surat" value={formData.memorizationSurah} status={formData.memorizationSurahStatus} 
                    onValueChange={v => setFormData({...formData, memorizationSurah: v})} 
                    onStatusChange={s => setFormData({...formData, memorizationSurahStatus: s})} />
                  
                  <MemorizationInput label="Doa Harian" value={formData.memorizationDua} status={formData.memorizationDuaStatus} 
                    onValueChange={v => setFormData({...formData, memorizationDua: v})} 
                    onStatusChange={s => setFormData({...formData, memorizationDuaStatus: s})} />

                  <MemorizationInput label="Hafalan Hadits" value={formData.memorizationHadith} status={formData.memorizationHadithStatus} 
                    onValueChange={v => setFormData({...formData, memorizationHadith: v})} 
                    onStatusChange={s => setFormData({...formData, memorizationHadithStatus: s})} />

                  <MemorizationInput label="Praktek Shalat" value={formData.memorizationShalat} status={formData.memorizationShalatStatus} 
                    onValueChange={v => setFormData({...formData, memorizationShalat: v})} 
                    onStatusChange={s => setFormData({...formData, memorizationShalatStatus: s})} />
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Materi Hafalan Kustom</h4>
                  <button type="button" onClick={addCustomMateri} className="text-emerald-600 text-xs font-bold hover:underline">+ Tambah</button>
                </div>
                {formData.customMemorization?.map((m, i) => (
                  <div key={i} className="flex gap-2 items-end">
                    <div className="flex-grow grid grid-cols-2 gap-2">
                       <input placeholder="Label (ex: Tajwid)" value={m.label} onChange={e => updateCustomMateri(i, 'label', e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold" />
                       <input placeholder="Materi" value={m.value} onChange={e => updateCustomMateri(i, 'value', e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold" />
                    </div>
                    <select value={m.status} onChange={e => updateCustomMateri(i, 'status', e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs font-bold">
                       <option value="Belum">Belum</option>
                       <option value="Lancar">Lancar</option>
                    </select>
                    <button type="button" onClick={() => removeCustomMateri(i)} className="text-red-400 hover:text-red-600 px-2 py-2"><i className="fa-solid fa-trash-can text-sm"></i></button>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Catatan Tambahan</label>
                <textarea rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Berikan catatan singkat..."></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 py-4 font-extrabold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all text-sm">Batal</button>
                <button type="submit" className="flex-1 py-4 font-extrabold text-white bg-emerald-600 rounded-2xl shadow-xl shadow-emerald-100 transition-all active:scale-95 text-sm">Simpan Progres</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedStudentId ? (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-800">Riwayat Belajar: {selectedStudent?.name}</h3>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-bold uppercase tracking-widest">{selectedStudent?.class}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Tanggal</th>
                  <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Bacaan</th>
                  <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">Lancarness</th>
                  <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Hafalan Baru</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {studentHistory.map(h => (
                  <tr key={h.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-700">{new Date(h.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${h.readingType === 'Iqra' ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{h.readingType} - {h.readingLevel}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Hal. {h.readingPage}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <FluencyBadge level={h.fluency} />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {h.memorizationSurah && <MemorizationBadge label="S" value={h.memorizationSurah} status={h.memorizationSurahStatus} color="blue" />}
                        {h.memorizationDua && <MemorizationBadge label="D" value={h.memorizationDua} status={h.memorizationDuaStatus} color="purple" />}
                        {h.memorizationHadith && <MemorizationBadge label="H" value={h.memorizationHadith} status={h.memorizationHadithStatus} color="amber" />}
                        {h.memorizationShalat && <MemorizationBadge label="P" value={h.memorizationShalat} status={h.memorizationShalatStatus} color="indigo" />}
                        {h.customMemorization?.map((m, idx) => (
                           <MemorizationBadge key={idx} label={m.label.substring(0,1).toUpperCase()} value={m.value} status={m.status} color="teal" />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {studentHistory.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic text-xs font-medium uppercase tracking-widest">Belum ada riwayat belajar untuk santri ini.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-20 rounded-[2.5rem] border border-slate-100 shadow-sm text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
            <i className="fa-solid fa-magnifying-glass text-slate-200 text-3xl"></i>
          </div>
          <h3 className="text-slate-800 font-extrabold text-lg">Cek Progres Santri</h3>
          <p className="text-slate-400 text-sm max-w-xs mt-2">Pilih salah satu santri dari daftar di atas untuk melihat atau mencatat progres belajarnya.</p>
        </div>
      )}
    </div>
  );
};

const MemorizationInput = ({ label, value, status, onValueChange, onStatusChange }: { label: string, value: string, status?: MemorizationStatus, onValueChange: (v: string) => void, onStatusChange: (s: MemorizationStatus) => void }) => (
  <div className="grid grid-cols-4 gap-2 items-end">
    <div className="col-span-3 space-y-1">
      <label className="text-[10px] font-extrabold text-slate-400 uppercase ml-1">{label}</label>
      <input value={value} onChange={e => onValueChange(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700" placeholder="..." />
    </div>
    <select value={status} onChange={e => onStatusChange(e.target.value as MemorizationStatus)} className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs font-bold text-slate-700">
      <option value="Belum">Belum</option>
      <option value="Lancar">Lancar</option>
    </select>
  </div>
);

// Fix: Use React.FC to correctly handle reserved props like 'key' in mapped components
const MemorizationBadge: React.FC<{ label: string; value: string; status?: MemorizationStatus; color: string }> = ({ label, value, status, color }) => {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    teal: 'bg-teal-50 text-teal-600 border-teal-100',
  };
  return (
    <span className={`text-[9px] px-2 py-0.5 rounded-lg font-bold border ${colors[color]} flex items-center gap-1`}>
      {label}: {value} {status === 'Lancar' && <i className="fa-solid fa-check text-[8px] text-emerald-500"></i>}
    </span>
  );
};

const FluencyBadge = ({ level }: { level: FluencyLevel }) => {
  const styles = {
    'Lancar': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Cukup': 'bg-amber-50 text-amber-700 border-amber-200',
    'Kurang': 'bg-red-50 text-red-700 border-red-200'
  };
  return (
    <span className={`px-2 py-1 rounded-lg text-[9px] font-extrabold uppercase border ${styles[level]}`}>
      {level}
    </span>
  );
};

export default ProgressTracker;
