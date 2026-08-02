import React from 'react';
import { Warga } from '../../warga/services/wargaService';
import { calculateKolesterolStatus, calculateAsamUratStatus, calculateGdsStatus } from '../../warga/components/PatientTable';
import { formatDateID } from '@/utils/dateFormatter';

interface KartuPosyanduProps {
  warga: Warga;
}

export const KartuPosyandu: React.FC<KartuPosyanduProps> = ({ warga }) => {
  const getKategori = (w: Warga) => {
    if (w.status_kehamilan === 'HAMIL') return 'Ibu Hamil';
    if (w.status_kehamilan === 'PASCA_PERSALINAN') return 'Ibu Pasca Salin';
    const ageMs = Date.now() - new Date(w.tanggal_lahir).getTime();
    const ageYrs = ageMs / (1000 * 60 * 60 * 24 * 365.25);
    if (ageYrs <= 5) return 'Balita / Baduta';
    if (ageYrs >= 60) return 'Lansia';
    return 'Warga';
  };

  const renderRiwayatKesehatan = () => {
    let checkups: any[] = [];
    let type = '';

    if (warga.pemeriksaan_balita_baduta && warga.pemeriksaan_balita_baduta.length > 0) {
      checkups = warga.pemeriksaan_balita_baduta;
      type = 'balita';
    } else if (warga.pemeriksaan_bumil && warga.pemeriksaan_bumil.length > 0) {
      checkups = warga.pemeriksaan_bumil;
      type = 'bumil';
    } else if (warga.pemeriksaan_pasca_persalinan && warga.pemeriksaan_pasca_persalinan.length > 0) {
      checkups = warga.pemeriksaan_pasca_persalinan;
      type = 'pasca';
    } else if (warga.pemeriksaan_lansia && warga.pemeriksaan_lansia.length > 0) {
      checkups = warga.pemeriksaan_lansia;
      type = 'lansia';
    }

    if (checkups.length === 0) {
      return <p className="text-xs sm:text-sm font-medium text-slate-500 italic mt-1">Belum ada riwayat kesehatan terdata.</p>;
    }

    // Sort by date descending, fallback to created_at
    const recentCheckups = [...checkups]
      .sort((a, b) => {
        const bDateStr = b.tanggal_kunjungan || b.tanggal_pemeriksaan || b.created_at || 0;
        const aDateStr = a.tanggal_kunjungan || a.tanggal_pemeriksaan || a.created_at || 0;
        const db = new Date(bDateStr).getTime();
        const da = new Date(aDateStr).getTime();
        if (db === da) {
          const cb = b.created_at ? new Date(b.created_at).getTime() : 0;
          const ca = a.created_at ? new Date(a.created_at).getTime() : 0;
          return cb - ca;
        }
        return db - da;
      })
      .slice(0, 1);

    const formatStatusGizi = (p: any) => {
      const gizi = [];
      if (p.zscore_bb_u != null) {
        const val = parseFloat(p.zscore_bb_u);
        if (val < -3) gizi.push(`BB Sangat Kurang (${val})`);
        else if (val < -2) gizi.push(`BB Kurang (${val})`);
      }
      if (p.zscore_tb_u != null) {
        const val = parseFloat(p.zscore_tb_u);
        if (val < -3) gizi.push(`Sangat Pendek (${val})`);
        else if (val < -2) gizi.push(`Pendek (${val})`);
      }
      if (p.zscore_bb_tb != null) {
        const val = parseFloat(p.zscore_bb_tb);
        if (val < -3) gizi.push(`Gizi Buruk (${val})`);
        else if (val < -2) gizi.push(`Gizi Kurang (${val})`);
        else if (val > 3) gizi.push(`Obesitas (${val})`);
        else if (val > 2) gizi.push(`Gizi Lebih (${val})`);
        else if (val > 1) gizi.push(`Berisiko Lebih (${val})`);
      }
      return gizi.length > 0 ? gizi.join(', ') : 'Normal';
    };


    return (
      <div className="space-y-1 mt-2">
        {recentCheckups.map((p, idx) => {
          const rawDate = p.tanggal_kunjungan || p.tanggal_pemeriksaan;
          const dateStr = rawDate ? formatDateID(rawDate) : '-';
          let metrics: { label: string, value: string }[] = [];
          
          if (type === 'balita') {
            metrics = [
              { label: 'BB', value: `${p.bb || '-'} kg` },
              { label: 'TB', value: `${p.tb || '-'} cm` }
            ];
          } else if (type === 'bumil') {
            metrics = [
              { label: 'BB', value: `${p.bb || p.berat_badan || '-'} kg` },
              { label: 'TB', value: `${p.tb || '-'} cm` },
              { label: 'LILA', value: `${p.lingkar_lengan_atas || '-'} cm` },
              { label: 'Usia', value: `${p.usia_kehamilan_minggu || '-'} mgg` },
              { label: 'L.Perut', value: `${p.lingkar_perut || '-'} cm` },
              { label: 'T.Fundus', value: `${p.tinggi_fundus || '-'} cm` }
            ];
          } else if (type === 'pasca') {
            metrics = [
              { label: 'BB Ibu', value: `${p.berat_badan_ibu || '-'} kg` },
              { label: 'TB Ibu', value: `${p.tb || '-'} cm` },
              { label: 'BB Bayi', value: `${p.berat_badan_bayi || '-'} kg` },
              { label: 'TB Bayi', value: `${p.tinggi_badan_bayi || '-'} cm` }
            ];
          } else if (type === 'lansia') {
            metrics = [
              { label: 'Tensi', value: `${p.tekanan_darah_sistolik || '-'}/${p.tekanan_darah_diastolik || '-'}` },
              { label: 'BB', value: `${p.bb || '-'} kg` },
              { label: 'TB', value: `${p.tb || '-'} cm` },
              { label: 'L.Perut', value: `${p.lingkar_perut || '-'} cm` }
            ];
          }

          let finalStatus: { text: string, type: 'success' | 'warning' | 'danger' }[] = [];
          
          if (type === 'balita') {
            if (p.kondisi) {
              const k = p.kondisi.toLowerCase();
              const isDanger = k.includes('sakit') || k.includes('buruk') || k.includes('kurang');
              finalStatus.push({ text: p.kondisi, type: isDanger ? 'danger' : 'success' });
            }
          } else if (type === 'bumil') {
            if (p.riwayat_penyakit) {
              const isTidakAda = p.riwayat_penyakit.toLowerCase() === 'tidak ada' || p.riwayat_penyakit === '-';
              finalStatus.push({ text: `Riwayat Penyakit: ${p.riwayat_penyakit}`, type: isTidakAda ? 'success' : 'danger' });
            }
            if (p.kadar_hemoglobin && parseFloat(p.kadar_hemoglobin) > 0) {
               const hb = parseFloat(p.kadar_hemoglobin);
               if (hb < 11) finalStatus.push({ text: `Risiko Anemia (${hb})`, type: 'danger' });
               else finalStatus.push({ text: `Hb Normal (${hb})`, type: 'success' });
            }
            if (p.lingkar_lengan_atas) {
               const lila = parseFloat(p.lingkar_lengan_atas);
               if (lila < 23.5) finalStatus.push({ text: `Risiko KEK (${lila})`, type: 'danger' });
               else finalStatus.push({ text: `LILA Normal (${lila})`, type: 'success' });
            }
            if (p.terpapar_rokok) finalStatus.push({ text: 'Terpapar Asap Rokok', type: 'warning' });
            if (p.kie) finalStatus.push({ text: 'Edukasi KIE', type: 'success' });
            if (p.suplemen_tambah_darah) finalStatus.push({ text: 'Dapat TTD', type: 'success' });
            if (p.fasilitasi_rujukan) finalStatus.push({ text: 'Dirujuk', type: 'warning' });
            if (p.fasilitasi_bantuan_sosial) finalStatus.push({ text: 'Menerima Bansos', type: 'success' });
          } else if (type === 'pasca') {
            if (p.kondisi_ibu) {
              const isDanger = p.kondisi_ibu.toLowerCase().includes('sakit');
              finalStatus.push({ text: p.kondisi_ibu, type: isDanger ? 'danger' : 'success' });
            }
            if (warga.penggunaan_kontrasepsi) finalStatus.push({ text: `KB ${warga.penggunaan_kontrasepsi}`, type: 'success' });
            if (p.kie) finalStatus.push({ text: 'Edukasi KIE', type: 'success' });
            if (p.fasilitasi_rujukan) finalStatus.push({ text: 'Dirujuk', type: 'warning' });
            if (p.fasilitasi_bantuan_sosial) finalStatus.push({ text: 'Menerima Bansos', type: 'success' });
          } else if (type === 'lansia') {
            const tdS = parseFloat(p.tekanan_darah_sistolik);
            const tdD = parseFloat(p.tekanan_darah_diastolik);
            if (tdS >= 140 || tdD >= 90) finalStatus.push({ text: `Hipertensi (${tdS}/${tdD})`, type: 'danger' });
            else if (tdS < 90 || tdD < 60) finalStatus.push({ text: `Hipotensi (${tdS}/${tdD})`, type: 'warning' });
            else if (!isNaN(tdS) && !isNaN(tdD)) finalStatus.push({ text: `Tensi Normal (${tdS}/${tdD})`, type: 'success' });

            if (p.kolesterol) {
               const st = calculateKolesterolStatus(p.kolesterol);
               if (st) {
                 finalStatus.push({ text: `Kolesterol ${st.status} (${p.kolesterol})`, type: st.status === 'Normal' ? 'success' : st.status === 'Batas Tinggi' ? 'warning' : 'danger' });
               }
            }
            if (p.asam_urat) {
               const st = calculateAsamUratStatus(p.asam_urat, warga.jenis_kelamin);
               if (st) {
                 finalStatus.push({ text: `Asam Urat ${st.status} (${p.asam_urat})`, type: st.status === 'Normal' ? 'success' : 'danger' });
               }
            }
            if (p.gula_darah_sewaktu) {
               const st = calculateGdsStatus(p.gula_darah_sewaktu);
               if (st) {
                 finalStatus.push({ text: `GDS ${st.status} (${p.gula_darah_sewaktu})`, type: st.status === 'Normal' ? 'success' : 'danger' });
               }
            }
          }
          if (p.catatan) finalStatus.push({ text: p.catatan, type: 'warning' });

          return (
            <div key={idx} className="flex flex-col text-xs sm:text-[13px] pt-1 pb-2">
              <div className="font-bold text-slate-800 print:text-black mb-1.5 text-sm">{dateStr}</div>
              
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-2.5 bg-slate-50 print:bg-transparent rounded-md p-2 print:p-0 border border-slate-100 print:border-none">
                {metrics.map((m, i) => (
                  <div key={i} className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="text-slate-500 print:text-slate-600 font-medium text-[11px] sm:text-xs uppercase tracking-wider">{m.label}</span>
                    <span className="font-semibold text-slate-700 print:text-black">{m.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-1.5 text-[11px] sm:text-xs">
                {type === 'balita' && (
                  <div className="flex gap-2 items-start">
                    <span className="text-slate-400 print:text-slate-500 shrink-0 w-24">Status Gizi:</span>
                    <span className={`font-semibold print:text-black leading-snug ${formatStatusGizi(p) === 'Normal' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {formatStatusGizi(p)}
                    </span>
                  </div>
                )}
                <div className="flex gap-2 items-start mt-0.5">
                  <span className="text-slate-400 print:text-slate-500 shrink-0 w-24 pt-0.5">Status Kesehatan:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {finalStatus.length > 0 ? (
                      finalStatus.map((st, i) => {
                        let color = "bg-emerald-50 text-emerald-700 border-emerald-200 print:bg-white print:border-black print:text-black";
                        if (st.type === 'danger') {
                          color = "bg-red-50 text-red-700 border-red-200 print:bg-white print:border-black print:text-black";
                        } else if (st.type === 'warning') {
                          color = "bg-amber-50 text-amber-700 border-amber-200 print:bg-white print:border-black print:text-black";
                        }
                        
                        return (
                          <span key={i} className={`px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold rounded border ${color}`}>
                            {st.text}
                          </span>
                        )
                      })
                    ) : (
                      <span className="text-slate-700 print:text-black font-medium leading-snug">-</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* 
        This wrapper is styles differently in screen vs print. 
        In screen: glassmorphism, glowing effects, shadows.
        In print: solid white, black text, sharp borders.
      */}
      <div className="relative overflow-hidden rounded-2xl p-4 sm:p-6 transition-all duration-500
        bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]
        print:bg-white print:border-black print:border-2 print:shadow-none print:rounded-lg print:text-black
      ">
        {/* Background Decorative Blob - Only visible on screen */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl print:hidden pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl print:hidden pointer-events-none" />

        <div className="relative z-10 flex justify-between items-start mb-6">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent print:text-black print:bg-none">
              Kartu Posyandu
            </h1>
            <p className="text-sm text-slate-500 font-medium print:text-slate-800">
              {(warga as any).posyandu?.nama || 'Posyandu Digital'}
            </p>
          </div>
          {/* Posyandu Logo placeholder */}
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 print:border-black overflow-hidden">
            <img src="/logo-cipicung.webp" alt="Logo Posyandu" className="w-9 h-9 object-contain" />
          </div>
        </div>

        <div className="space-y-4 relative z-10">
          <div>
            <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold print:text-black print:text-xs">Nama Lengkap</p>
            <p className="text-base sm:text-lg font-bold text-slate-800 uppercase print:text-black">{warga.nama}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold print:text-black print:text-xs">NIK</p>
              <p className="text-xs sm:text-base font-semibold text-slate-700 tracking-normal sm:tracking-widest print:text-black print:tracking-widest">{warga.nik}</p>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold print:text-black print:text-xs">Tempat, Tgl Lahir</p>
              <p className="text-sm sm:text-base font-semibold text-slate-700 print:text-black">
                {warga.tempat_lahir || '-'}, {formatDateID(warga.tanggal_lahir)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold print:text-black print:text-xs">Kategori / Jenis Kelamin</p>
              <p className="text-sm sm:text-base font-medium text-slate-700 print:text-black">
                <span className="text-primary print:text-black font-semibold">{getKategori(warga)}</span> / {warga.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
              </p>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold print:text-black print:text-xs">No. Telepon</p>
              <p className="text-sm sm:text-base font-bold text-slate-700 print:text-black">
                {warga.nomor || '-'}
              </p>
            </div>
          </div>

          <div>
            <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold print:text-black print:text-xs">Alamat Domisili</p>
            <p className="text-sm font-medium text-slate-700 print:text-black leading-snug mt-0.5">
              {warga.alamat || '-'} 
              {warga.rt || warga.rw ? ` RT ${warga.rt || '-'}/RW ${warga.rw || '-'}` : ''}
              {warga.kelurahan ? `, ${warga.kelurahan}` : ''}
            </p>
          </div>
          
          <div className="pt-3 sm:pt-4 mt-2 border-t border-slate-200/60 print:border-black">
            <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold print:text-black print:text-xs">Riwayat Pemeriksaan Terakhir</p>
            {renderRiwayatKesehatan()}
          </div>



          {getKategori(warga) === 'Balita / Baduta' && (
            <div className="pt-3 sm:pt-4 mt-2 border-t border-slate-200/60 print:border-black">
              <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold print:text-black print:text-xs mb-2">Riwayat Imunisasi</p>
              {warga.riwayat_imunisasi && warga.riwayat_imunisasi.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {[...warga.riwayat_imunisasi]
                    .sort((a, b) => new Date(a.tanggal_pemberian).getTime() - new Date(b.tanggal_pemberian).getTime())
                    .map((imun, idx) => (
                      <span key={idx} className="bg-indigo-100 text-indigo-700 font-semibold px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] print:bg-white print:border print:border-black print:text-black print:px-2 print:py-0.5">
                        {imun.jenis_vaksin}
                      </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs sm:text-sm font-medium text-slate-500 italic mt-1">Belum ada riwayat imunisasi.</p>
              )}
            </div>
          )}
        </div>

        {/* Barcode/QR Code Placeholder for physical prints */}
        <div className="mt-6 flex justify-center print:block hidden">
          <div className="w-full h-12 bg-slate-200 border border-slate-300 flex items-center justify-center">
            <span className="text-xs text-slate-500">[ AREA BARCODE / QR CODE ]</span>
          </div>
        </div>
      </div>
    </div>
  );
};
