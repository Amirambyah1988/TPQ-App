
import { GoogleGenAI } from "@google/genai";
import { Student, AttendanceRecord, PaymentRecord } from "../types";
import { MONTHS } from "../constants";

export const generateTPQReport = async (
  students: Student[],
  attendance: AttendanceRecord[],
  payments: PaymentRecord[]
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthName = MONTHS[currentMonth];
  
  const prompt = `
    Analisis data TPQ (Taman Pendidikan Al-Quran) berikut untuk bulan ${monthName} ${currentYear}:
    
    Data Santri: ${JSON.stringify(students)}
    Data Kehadiran: ${JSON.stringify(attendance.filter(a => a.date.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`)))}
    Data Pembayaran Syahriah: ${JSON.stringify(payments.filter(p => p.month === currentMonth && p.year === currentYear))}

    Berikan laporan ringkas dalam Bahasa Indonesia yang mencakup:
    1. Ringkasan performa kehadiran santri (siapa yang paling rajin, siapa yang butuh perhatian).
    2. Status keuangan syahriah (persentase lunas vs belum).
    3. 3 Saran konkret untuk meningkatkan kualitas pengajaran atau kedisiplinan santri.
    4. Buatkan pesan motivasi islami pendek untuk para pengajar.
    
    Format dalam Markdown yang rapi dengan emoji yang relevan.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Gagal menghasilkan laporan. Pastikan koneksi internet tersedia.";
  }
};
