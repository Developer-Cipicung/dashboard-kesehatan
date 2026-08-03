import React, { useMemo } from 'react';
import { Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import kmsData from './kmsData.json';
import { Warga } from '../../warga/services/wargaService';


interface KMSChartProps {
  warga: Warga;
}

export const KMSChart: React.FC<KMSChartProps> = ({ warga }) => {
  // Determine standard reference dataset based on gender
  const standardData = useMemo(() => {
    return warga.jenis_kelamin === 'L' ? kmsData.boys : kmsData.girls;
  }, [warga.jenis_kelamin]);

  // Combine standard curves with the child's actual weight data
  const chartData = useMemo(() => {
    if (!warga.pemeriksaan_balita_baduta) return standardData;

    // Clone standard data to avoid mutation
    const merged = standardData.map(d => ({ ...d, actualWeight: null as number | null }));

    warga.pemeriksaan_balita_baduta.forEach(checkup => {
      if (checkup.bb) {
        const checkupDate = new Date(checkup.tanggal_kunjungan || checkup.tanggal_pemeriksaan);
        const birthDate = new Date(warga.tanggal_lahir);
        
        // Calculate precise age in months at checkup
        const msDiff = checkupDate.getTime() - birthDate.getTime();
        const daysDiff = msDiff / (1000 * 60 * 60 * 24);
        const months = Math.round(daysDiff / 30.4375);

        // Only plot if within 0-60 months range
        if (months >= 0 && months <= 60) {
          // If there are multiple checkups in a month, take the latest (simplified) or highest
          merged[months].actualWeight = Number(checkup.bb);
        }
      }
    });

    return merged;
  }, [standardData, warga]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const actualWeight = payload.find((p: any) => p.dataKey === 'actualWeight')?.value;
      const median = payload.find((p: any) => p.dataKey === 'median')?.value;
      
      return (
        <div className="bg-white p-3 border border-slate-200 rounded shadow-lg text-sm">
          <p className="font-bold text-slate-800 mb-2">Usia {label} Bulan</p>
          {actualWeight !== undefined && actualWeight !== null && (
            <p className="text-blue-600 font-semibold mb-1">
              Berat Bayi: <span className="font-bold">{actualWeight} kg</span>
            </p>
          )}
          <p className="text-slate-500">Berat Normal (Median): {median} kg</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80 sm:h-96 bg-white p-4 rounded-xl border border-slate-100 shadow-sm print:shadow-none print:border-black print:p-0 print:h-64 mt-4">
      <div className="mb-4 text-center">
        <h3 className="text-sm font-bold text-slate-800 print:text-black">Grafik Pertumbuhan Anak (KMS)</h3>
        <p className="text-xs text-slate-500 print:text-slate-600">
          Berat Badan menurut Umur (BB/U) - {warga.jenis_kelamin === 'L' ? 'Anak Laki-laki' : 'Anak Perempuan'}
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height="80%">
        <ComposedChart
          data={chartData}
          margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 10 }}
            tickMargin={10}
            stroke="#94a3b8"
            label={{ value: 'Usia (Bulan)', position: 'insideBottomRight', offset: -10, fontSize: 10, fill: '#64748b' }} 
            ticks={[0, 6, 12, 18, 24, 30, 36, 42, 48, 54, 60]}
          />
          <YAxis 
            tick={{ fontSize: 10 }}
            stroke="#94a3b8"
            label={{ value: 'Berat (kg)', angle: -90, position: 'insideLeft', offset: 25, fontSize: 10, fill: '#64748b' }}
            domain={[0, 'dataMax + 2']}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Background Bands (KMS Ranges) */}
          {/* Merah Bawah (BGM) */}
          <Area type="monotone" dataKey="sd3neg" fill="#fee2e2" stroke="none" activeDot={false} isAnimationActive={false} />
          
          {/* Kuning Bawah */}
          <Area type="monotone" dataKey={['sd3neg', 'sd2neg'] as any} fill="#fef9c3" stroke="none" activeDot={false} isAnimationActive={false} />
          
          {/* Hijau (Normal) */}
          <Area type="monotone" dataKey={['sd2neg', 'sd2pos'] as any} fill="#dcfce7" stroke="none" activeDot={false} isAnimationActive={false} />
          
          {/* Kuning Atas */}
          <Area type="monotone" dataKey={['sd2pos', 'sd3pos'] as any} fill="#fef9c3" stroke="none" activeDot={false} isAnimationActive={false} />

          {/* Lines defining the edges for clarity (optional) */}
          <Line type="monotone" dataKey="sd3neg" stroke="#ef4444" strokeWidth={1} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="sd2neg" stroke="#eab308" strokeWidth={1} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="sd2pos" stroke="#eab308" strokeWidth={1} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="sd3pos" stroke="#ef4444" strokeWidth={1} dot={false} isAnimationActive={false} />
          
          {/* The Median / SD0 Line */}
          <Line type="monotone" dataKey="median" stroke="#22c55e" strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={false} />

          {/* Child's Actual Weight Data */}
          <Line 
            type="monotone" 
            dataKey="actualWeight" 
            stroke="#2563eb" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} 
            activeDot={{ r: 6 }} 
            isAnimationActive={true}
            connectNulls={true}
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      <div className="flex flex-wrap justify-center gap-4 mt-2 print:hidden">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-100 border border-red-500 rounded-sm"></div><span className="text-[10px] text-slate-600">Sangat Kurang/Lebih</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-yellow-100 border border-yellow-500 rounded-sm"></div><span className="text-[10px] text-slate-600">Risiko/Kurang</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-green-100 border border-green-500 rounded-sm"></div><span className="text-[10px] text-slate-600">Normal (KMS)</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-blue-600 rounded-sm"></div><span className="text-[10px] text-slate-600 font-bold">Berat Anak</span></div>
      </div>
    </div>
  );
};
