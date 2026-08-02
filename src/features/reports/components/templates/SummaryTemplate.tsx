import React from 'react';
import { formatDateID } from '@/utils/dateFormatter';

interface SummaryTemplateProps {
  bulan?: number;
  tahun?: number;
  periodeLabel?: string;
  data: any; // Dashboard stats data
  kecamatan?: string;
}

export const SummaryTemplate: React.FC<SummaryTemplateProps> = ({ 
  bulan, 
  tahun, 
  periodeLabel,
  data,
  kecamatan = 'Cijeruk'
}) => {
  const getBulanStr = (m: number) => {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return months[m - 1] || '';
  };

  return (
    <div className="w-full bg-white text-black font-sans" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
      {/* === HEADER KOP SURAT === */}
      <div style={{ borderBottom: '1.5pt solid black', paddingBottom: '4pt', marginBottom: '8pt' }}>
        <h1 style={{ fontSize: '10pt', fontWeight: 'bold', margin: 0, lineHeight: '1.2' }}>PEMERINTAH KABUPATEN BOGOR</h1>
        <h2 style={{ fontSize: '9pt', fontWeight: 'bold', margin: 0, lineHeight: '1.2' }}>DINAS PEMBERDAYAAN PEREMPUAN DAN PERLINDUNGAN ANAK, PENGENDALIAN PENDUDUK DAN KELUARGA BERENCANA</h2>
        <h3 style={{ fontSize: '10pt', fontWeight: 'bold', margin: 0, marginTop: '2pt' }}>RINGKASAN KESELURUHAN SASARAN POSYANDU</h3>
      </div>

      {/* === INFO METADATA === */}
      <div style={{ fontSize: '8pt', marginBottom: '12pt' }}>
        <table style={{ border: 'none', width: '100%' }}>
          <tbody>
            <tr>
              <td style={{ width: '70pt', paddingBottom: '2pt', verticalAlign: 'top' }}>Program</td>
              <td style={{ width: '8pt', textAlign: 'center', verticalAlign: 'top' }}>:</td>
              <td style={{ paddingBottom: '2pt', verticalAlign: 'top' }}>Pemberdayaan dan Peningkatan Keluarga Sejahtera (2.14.04)</td>
            </tr>
            <tr>
              <td style={{ paddingBottom: '2pt', verticalAlign: 'top' }}>Kegiatan</td>
              <td style={{ textAlign: 'center', verticalAlign: 'top' }}>:</td>
              <td style={{ paddingBottom: '2pt', verticalAlign: 'top' }}>Pelaksanaan dan Peningkatan Peran Serta Organisasi Kemasyarakatan Tingkat Daerah Kabupaten/Kota dalam Pembangunan Keluarga melalui Pembinaan Ketahanan dan Kesejahteraan Keluarga. (2.14.04.2.02)</td>
            </tr>
            <tr>
              <td style={{ paddingBottom: '2pt' }}>Bulan/Tahun</td>
              <td style={{ textAlign: 'center' }}>:</td>
              <td style={{ paddingBottom: '2pt', fontWeight: 'bold' }}>{periodeLabel || `${getBulanStr(bulan!)} ${tahun}`}</td>
            </tr>
            <tr>
              <td style={{ paddingBottom: '2pt' }}>Cakupan Wilayah</td>
              <td style={{ textAlign: 'center' }}>:</td>
              <td style={{ paddingBottom: '2pt' }}>Kecamatan {kecamatan}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* === TABEL DATA RINGKASAN === */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt', marginBottom: '20pt' }}>
        <thead>
          <tr>
            <th style={{ border: '1pt solid black', padding: '6pt', textAlign: 'center', background: '#f0f0f0', width: '10%' }}>NO</th>
            <th style={{ border: '1pt solid black', padding: '6pt', textAlign: 'center', background: '#f0f0f0', width: '50%' }}>KATEGORI SASARAN</th>
            <th style={{ border: '1pt solid black', padding: '6pt', textAlign: 'center', background: '#f0f0f0', width: '40%' }}>TOTAL (JIWA)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: '1pt solid black', padding: '6pt', textAlign: 'center' }}>1</td>
            <td style={{ border: '1pt solid black', padding: '6pt', fontWeight: 'bold' }}>Total Warga Terdata</td>
            <td style={{ border: '1pt solid black', padding: '6pt', textAlign: 'center', fontWeight: 'bold', fontSize: '10pt' }}>
              {data?.total_warga || 0}
            </td>
          </tr>
          <tr>
            <td style={{ border: '1pt solid black', padding: '6pt', textAlign: 'center' }}>2</td>
            <td style={{ border: '1pt solid black', padding: '6pt' }}>Anak Usia 0 - 59 Bulan (Balita)</td>
            <td style={{ border: '1pt solid black', padding: '6pt', textAlign: 'center' }}>
              {data?.total_balita || 0}
            </td>
          </tr>
          <tr>
            <td style={{ border: '1pt solid black', padding: '6pt', textAlign: 'center' }}>3</td>
            <td style={{ border: '1pt solid black', padding: '6pt' }}>Ibu Hamil</td>
            <td style={{ border: '1pt solid black', padding: '6pt', textAlign: 'center' }}>
              {data?.total_bumil || 0}
            </td>
          </tr>
          <tr>
            <td style={{ border: '1pt solid black', padding: '6pt', textAlign: 'center' }}>4</td>
            <td style={{ border: '1pt solid black', padding: '6pt' }}>Lansia</td>
            <td style={{ border: '1pt solid black', padding: '6pt', textAlign: 'center' }}>
              {data?.total_lansia || 0}
            </td>
          </tr>
        </tbody>
      </table>

      {/* === FOOTER TANDA TANGAN === */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9pt', marginTop: '30pt' }}>
        <div style={{ textAlign: 'center', width: '200pt' }}>
          <p style={{ marginBottom: '2pt' }}>Mengetahui,</p>
          <p style={{ marginBottom: '50pt' }}>Koordinator Lapangan</p>
          <p style={{ fontWeight: 'bold' }}>( .................... )</p>
          <p>NIP. ....................</p>
        </div>

        <div style={{ textAlign: 'center', width: '200pt' }}>
          <p style={{ marginBottom: '2pt' }}>{kecamatan}, {formatDateID(new Date())}</p>
          <p style={{ fontWeight: 'bold', marginBottom: '50pt' }}>Kepala Seksi Terkait</p>
          <p style={{ fontWeight: 'bold' }}>( .................... )</p>
          <p>NIP. ....................</p>
        </div>
      </div>
      
      <div style={{ marginTop: '40pt', textAlign: 'left', fontSize: '7pt', color: '#666', fontStyle: 'italic' }}>
        * Dokumen dicetak secara otomatis melalui Sistem Dashboard Kesehatan.
      </div>
    </div>
  );
};
