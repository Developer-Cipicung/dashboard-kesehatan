import React, { useMemo } from 'react';
import { Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import { Warga } from '../../warga/services/wargaService';

interface BumilChartProps {
  warga: Warga;
}

export const BumilChart: React.FC<BumilChartProps> = ({ warga }) => {
  const chartData = useMemo(() => {
    if (!warga.pemeriksaan_bumil || warga.pemeriksaan_bumil.length === 0) return [];

    // Sort checkups by gestational age
    const sortedCheckups = [...warga.pemeriksaan_bumil].sort((a, b) => 
      (a.usia_kehamilan_minggu || 0) - (b.usia_kehamilan_minggu || 0)
    );

    // Find the first valid checkup to establish base weight
    const firstCheckup = sortedCheckups.find(c => c.bb && c.usia_kehamilan_minggu != null);
    if (!firstCheckup) return [];

    const w0 = firstCheckup.usia_kehamilan_minggu || 0;
    const bb0 = Number(firstCheckup.bb);

    // Calculate generic gain at w0 to reverse-engineer base weight at week 0
    let medianGainAtW0 = 0;
    if (w0 <= 12) {
      medianGainAtW0 = (1.5 / 12) * w0;
    } else {
      medianGainAtW0 = 1.5 + (0.4375 * (w0 - 12)); // Average of 0.375 and 0.5
    }

    const baseWeight = Math.max(30, bb0 - medianGainAtW0); // Ensure baseWeight is somewhat realistic

    // Generate curve from Week 0 to Week 40
    const data: Array<{ week: number; minWeight: number; maxWeight: number; actualWeight?: number | null }> = [];
    for (let w = 0; w <= 40; w++) {
      let minGain = 0;
      let maxGain = 0;
      
      if (w <= 12) {
        minGain = (1.0 / 12) * w;
        maxGain = (2.0 / 12) * w;
      } else {
        const past12 = w - 12;
        minGain = 1.0 + (0.375 * past12);
        maxGain = 2.0 + (0.5 * past12);
      }

      data.push({
        week: w,
        minWeight: Number((baseWeight + minGain).toFixed(2)),
        maxWeight: Number((baseWeight + maxGain).toFixed(2)),
        actualWeight: null as number | null
      });
    }

    // Map actual weights
    sortedCheckups.forEach(checkup => {
      const w = checkup.usia_kehamilan_minggu;
      if (w != null && w >= 0 && w <= 40 && checkup.bb) {
        data[w].actualWeight = Number(checkup.bb);
      }
    });

    return data;
  }, [warga]);

  if (chartData.length === 0) {
    return (
      <div className="w-full h-80 bg-slate-50 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 text-sm mt-4 print:hidden">
        Data berat badan atau usia kehamilan tidak tersedia.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const actualWeight = payload.find((p: any) => p.dataKey === 'actualWeight')?.value;
      
      let targetMin = 0;
      let targetMax = 0;
      const rangePayload = payload.find((p: any) => p.dataKey && p.dataKey.length === 2);
      if (rangePayload) {
        targetMin = rangePayload.value[0];
        targetMax = rangePayload.value[1];
      }

      return (
        <div className="bg-white p-3 border border-slate-200 rounded shadow-lg text-sm">
          <p className="font-bold text-slate-800 mb-2">Usia {label} Minggu</p>
          {actualWeight !== undefined && actualWeight !== null && (
            <p className="text-blue-600 font-semibold mb-1">
              Berat Ibu: <span className="font-bold">{actualWeight} kg</span>
            </p>
          )}
          {targetMax > 0 && (
            <p className="text-slate-500">Rentang Normal: {targetMin} - {targetMax} kg</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80 sm:h-96 bg-white p-4 rounded-xl border border-slate-100 shadow-sm print:shadow-none print:border-black print:p-0 print:h-64 mt-4">
      <div className="mb-4 text-center">
        <h3 className="text-sm font-bold text-slate-800 print:text-black">Grafik Evaluasi Kenaikan Berat Badan Ibu Hamil</h3>
        <p className="text-xs text-slate-500 print:text-slate-600">
          Standar IOM - Area Hijau adalah Rekomendasi Kenaikan Berat Badan Normal
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height="80%">
        <ComposedChart
          data={chartData}
          margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="week" 
            tick={{ fontSize: 10 }}
            tickMargin={10}
            stroke="#94a3b8"
            label={{ value: 'Usia Kehamilan (Minggu)', position: 'insideBottomRight', offset: -10, fontSize: 10, fill: '#64748b' }} 
            ticks={[0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40]}
          />
          <YAxis 
            tick={{ fontSize: 10 }}
            stroke="#94a3b8"
            label={{ value: 'Berat (kg)', angle: -90, position: 'insideLeft', offset: 25, fontSize: 10, fill: '#64748b' }}
            domain={['dataMin - 2', 'dataMax + 2']}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Background Band (Zona Hijau Normal) */}
          <Area type="monotone" dataKey={['minWeight', 'maxWeight'] as any} fill="#dcfce7" stroke="none" activeDot={false} isAnimationActive={false} />

          {/* Defining the edges of the green band */}
          <Line type="monotone" dataKey="minWeight" stroke="#4ade80" strokeWidth={1} strokeDasharray="3 3" dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="maxWeight" stroke="#4ade80" strokeWidth={1} strokeDasharray="3 3" dot={false} isAnimationActive={false} />
          
          {/* Mother's Actual Weight Data */}
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
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-green-100 border border-green-500 rounded-sm"></div><span className="text-[10px] text-slate-600">Rentang Normal</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-blue-600 rounded-sm"></div><span className="text-[10px] text-slate-600 font-bold">Berat Ibu</span></div>
      </div>
    </div>
  );
};
