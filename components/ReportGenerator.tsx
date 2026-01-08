
import React, { useState } from 'react';
import { Student, AttendanceRecord, PaymentRecord } from '../types';
import { generateTPQReport } from '../services/geminiService';

interface ReportGeneratorProps {
  students: Student[];
  attendance: AttendanceRecord[];
  payments: PaymentRecord[];
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ students, attendance, payments }) => {
  const [report, setReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    const result = await generateTPQReport(students, attendance, payments);
    setReport(result || "Gagal membuat laporan.");
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-8 rounded-3xl text-white shadow-xl">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <i className="fa-solid fa-wand-magic-sparkles"></i> Laporan Cerdas TPQ
          </h2>
          <p className="text-emerald-50 opacity-90 mb-6">
            Gunakan kecerdasan buatan untuk merangkum perkembangan santri, kehadiran, dan kedisiplinan syahriah bulan ini secara otomatis.
          </p>
          <button 
            onClick={handleGenerate}
            disabled={isLoading}
            className={`
              bg-white text-emerald-700 font-bold px-8 py-3 rounded-2xl shadow-lg transition-all active:scale-95
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-50'}
            `}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <i className="fa-solid fa-spinner fa-spin"></i> Menganalisis Data...
              </span>
            ) : 'Hasilkan Laporan Bulan Ini'}
          </button>
        </div>
      </div>

      {report && (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm prose prose-slate max-w-none animate-in fade-in zoom-in duration-500">
          <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-4">
             <h3 className="text-xl font-bold text-slate-800 m-0">Hasil Analisis AI</h3>
             <button 
              onClick={() => {
                navigator.clipboard.writeText(report);
                alert('Laporan disalin ke clipboard!');
              }}
              className="text-emerald-600 text-sm font-semibold hover:underline"
             >
               Salin Teks
             </button>
          </div>
          <div className="whitespace-pre-wrap text-slate-700 leading-relaxed text-sm md:text-base">
            {report}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;
