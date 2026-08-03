import React from 'react';
import { formatDateID } from '@/utils/dateFormatter';
import { calculateHpl } from '@/features/warga/components/PatientTable';

interface VisumTemplateProps {
  kategori: string;
  data: any[];
  bulan?: number;
  tahun?: number;
  periodeLabel?: string;
  posyanduName?: string;
  desa?: string;
  kecamatan?: string;
}

export const VisumTemplate: React.FC<VisumTemplateProps> = ({ 
  kategori, 
  data, 
  bulan, 
  tahun,
  periodeLabel,
  posyanduName = '...',
  desa = 'Cipicung',
  kecamatan = 'Cijeruk'
}) => {
  // Config per kategori
  let columns: { header: string | React.ReactNode; accessor: (row: any, i: number) => React.ReactNode; width?: string }[] = [];
  let titleRight = '';

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatAddress = (warga: any) => {
    if (!warga) return '-';
    let result = warga.alamat || '';
    if (warga.rt || warga.rw) {
      const rtrw = `RT ${warga.rt || '-'} RW ${warga.rw || '-'}`;
      result = result ? `${result}, ${rtrw}` : rtrw;
    }
    result = result ? `${result}, Desa Cipicung` : 'Desa Cipicung';
    return result;
  };

  if (kategori === 'baduta' || kategori === 'balita') {
    titleRight = kategori === 'baduta' ? 'Anak Usia 0 - 23 Bulan' : 'Anak Usia 0 - 59 Bulan';
    columns = [
      { header: 'No.', accessor: (_, i) => i + 1, width: '3%' },
      { header: 'Tanggal\nKunjungan', accessor: (r) => formatDate(r.tanggal_kunjungan), width: '8%' },
      { header: 'Nama Ibu', accessor: (r) => r.warga?.ibu?.nama || r.warga?.nama_ibu || '-', width: '8%' },
      { header: 'NIK', accessor: (r) => r.warga?.nik || '-', width: '8%' },
      { header: 'Tempat Tgl\nLahir', accessor: (r) => `${r.warga?.tempat_lahir || '-'}, ${formatDate(r.warga?.tanggal_lahir)}`, width: '8%' },
      { header: 'Alamat', accessor: (r) => formatAddress(r.warga), width: '9%' },
      { header: 'Penggunaan\nKontrasepsi', accessor: (r) => r.penggunaan_kontrasepsi || '-', width: '7%' },
      { header: 'Nama Bayi/Baduta', accessor: (r) => r.warga?.nama || '-', width: '8%' },
      { header: 'Tgl Lahir\nBayi/Baduta', accessor: (r) => formatDate(r.warga?.tanggal_lahir), width: '6%' },
      { header: 'Jenis\nKelamin\nBaduta', accessor: (r) => r.warga?.jenis_kelamin === 'L' ? 'L' : 'P', width: '4%' },
      { header: 'BB\nLahir/\nsaat ini\n(Kg)', accessor: (r) => r.bb ? `${r.bb}` : '-', width: '4%' },
      { header: 'Pjg\nLahir/\nsaat ini\n(Cm)', accessor: (r) => r.tb ? `${r.tb}` : '-', width: '4%' },
      { header: 'Kondisi\nBayi/\nBaduta', accessor: (r) => r.kondisi || '-', width: '5%' },
      { header: 'Asi\nEksklusif\n(Ya/Tdk)', accessor: (r) => r.asi_eksklusif ? 'Ya' : 'Tdk', width: '4%' },
      { header: 'Imunisasi\n(Ya/Tdk)', accessor: () => '-', width: '4%' }, // Needs rel
      { header: 'Fasilitasi\nBantuan\nSosial\n(Ya/Tdk)', accessor: (r) => r.fasilitasi_bantuan_sosial ? 'Ya' : 'Tdk', width: '4%' },
      { header: 'Tgl\nKunjungan\nBerikut', accessor: (r) => formatDate(r.tanggal_kunjungan_berikut), width: '6%' },
      { header: 'Tanda Tangan/\nCap Jempol\nIbu', accessor: () => '', width: '6%' },
    ];
  } else if (kategori === 'bumil') {
    titleRight = 'Ibu Hamil';
    columns = [
      { header: 'No.', accessor: (_, i) => i + 1, width: '3%' },
      { header: 'Tanggal\nKunjungan', accessor: (r) => formatDate(r.tanggal_kunjungan), width: '8%' },
      { header: 'Nama Ibu', accessor: (r) => r.warga?.nama || '-', width: '8%' },
      { header: 'NIK', accessor: (r) => r.warga?.nik || '-', width: '8%' },
      { header: 'Tempat Tgl\nLahir', accessor: (r) => `${r.warga?.tempat_lahir || '-'}, ${formatDate(r.warga?.tanggal_lahir)}`, width: '8%' },
      { header: 'Alamat', accessor: (r) => formatAddress(r.warga), width: '10%' },
      { header: 'Nama Suami', accessor: (r) => r.warga?.nama_suami || '-', width: '7%' },
      { header: 'Usia\nKandungan\n(Mgg)', accessor: (r) => r.usia_kehamilan_minggu || '-', width: '4%' },
      { header: 'HPHT / HPL', accessor: (r) => {
        const hphtStr = r.warga?.hpht ? formatDate(r.warga.hpht) : '-';
        const hplStr = r.warga?.htp ? formatDate(r.warga.htp) : (r.warga?.hpht ? formatDate(calculateHpl(r.warga.hpht)) : '-');
        return `${hphtStr}\n${hplStr}`;
      }, width: '6%' },
      { header: 'LILA (cm)', accessor: (r) => r.lingkar_lengan_atas || '-', width: '4%' },
      { header: 'BB (Kg)', accessor: (r) => r.bb || r.berat_badan || '-', width: '4%' },
      { header: 'TD (mmHg)', accessor: (r) => (r.tekanan_darah_sistolik && r.tekanan_darah_diastolik) ? `${r.tekanan_darah_sistolik}/${r.tekanan_darah_diastolik}` : '-', width: '6%' },
      { header: 'Beresiko', accessor: (r) => r.is_berisiko_stunting ? 'Ya' : 'Tdk', width: '4%' },
      { header: 'Kondisi Ibu', accessor: (r) => r.kondisi_ibu || '-', width: '5%' },
      { header: 'TTD\n(Ya/Tdk)', accessor: (r) => r.suplemen_tambah_darah ? 'Ya' : 'Tdk', width: '4%' },
      { header: 'KIE\n(Ya/Tdk)', accessor: (r) => r.kie ? 'Ya' : 'Tdk', width: '4%' },
      { header: 'Fasilitasi\nBansos', accessor: (r) => r.fasilitasi_bantuan_sosial ? 'Ya' : 'Tdk', width: '4%' },
      { header: 'Tgl\nKunjungan\nBerikut', accessor: (r) => formatDate(r.tanggal_kunjungan_berikut), width: '5%' },
      { header: 'Tanda Tangan', accessor: () => '', width: '6%' },
    ];
  } else if (kategori === 'pasca_persalinan' || kategori === 'pasca-persalinan') {
    titleRight = 'Ibu Pasca Persalinan';
    columns = [
      { header: 'No.', accessor: (_, i) => i + 1, width: '3%' },
      { header: 'Tanggal Kunjungan', accessor: (r) => formatDate(r.tanggal_kunjungan), width: '8%' },
      { header: 'Nama Ibu', accessor: (r) => r.warga?.nama || '-', width: '9%' },
      { header: 'NIK', accessor: (r) => r.warga?.nik || '-', width: '9%' },
      { header: 'Tempat Tgl Lahir', accessor: (r) => `${r.warga?.tempat_lahir || '-'}, ${formatDate(r.warga?.tanggal_lahir)}`, width: '10%' },
      { header: 'Alamat', accessor: (r) => formatAddress(r.warga), width: '12%' },
      { header: 'Penggunaan\nKontrasepsi', accessor: (r) => r.penggunaan_kontrasepsi || '-', width: '8%' },
      { header: 'BB Ibu (Kg)', accessor: (r) => r.berat_badan_ibu || '-', width: '6%' },
      { header: 'Kondisi Ibu', accessor: (r) => r.kondisi_ibu || '-', width: '7%' },
      { header: 'BB Bayi (Kg)', accessor: (r) => r.berat_badan_bayi || '-', width: '6%' },
      { header: 'TB Bayi (Cm)', accessor: (r) => r.tinggi_badan_bayi || '-', width: '6%' },
      { header: 'Asi Eksklusif', accessor: (r) => r.asi_eksklusif ? 'Ya' : 'Tdk', width: '5%' },
      { header: 'KIE', accessor: (r) => r.kie ? 'Ya' : 'Tdk', width: '5%' },
      { header: 'Tanda Tangan', accessor: () => '', width: '8%' },
    ];
  } else if (kategori === 'lansia') {
    titleRight = 'Lansia';
    columns = [
      { header: 'No.', accessor: (_, i) => i + 1, width: '3%' },
      { header: 'Tanggal Kunjungan', accessor: (r) => formatDate(r.tanggal_kunjungan), width: '8%' },
      { header: 'Nama Lansia', accessor: (r) => r.warga?.nama || '-', width: '9%' },
      { header: 'NIK', accessor: (r) => r.warga?.nik || '-', width: '9%' },
      { header: 'Alamat', accessor: (r) => formatAddress(r.warga), width: '11%' },
      { header: 'Usia (Thn)', accessor: (r) => {
        if (!r.warga?.tanggal_lahir) return '-';
        const ageDifMs = Date.now() - new Date(r.warga.tanggal_lahir).getTime();
        return Math.abs(new Date(ageDifMs).getUTCFullYear() - 1970);
      }, width: '5%' },
      { header: 'Tensi\nSistol/Diastol', accessor: (r) => (r.tekanan_darah_sistolik && r.tekanan_darah_diastolik) ? `${r.tekanan_darah_sistolik}/${r.tekanan_darah_diastolik}` : '-', width: '7%' },
      { header: 'BB / TB', accessor: (r) => `${r.bb || '-'} / ${r.tb || '-'}`, width: '6%' },
      { header: 'Lingkar Perut', accessor: (r) => r.lingkar_perut || '-', width: '6%' },
      { header: 'Gula Darah', accessor: (r) => r.gula_darah_sewaktu || '-', width: '6%' },
      { header: 'Kolesterol', accessor: (r) => r.kolesterol || '-', width: '6%' },
      { header: 'Asam Urat', accessor: (r) => r.asam_urat || '-', width: '6%' },
      { header: 'Tingkat\nKemandirian', accessor: (r) => r.tingkat_kemandirian || '-', width: '7%' },
      { header: 'Catatan', accessor: (r) => r.catatan || '-', width: '8%' },
      { header: 'Tanda Tangan', accessor: () => '', width: '7%' },
    ];
  } else {
    // Default fallback
    titleRight = 'Semua Kategori';
    columns = [
      { header: 'No.', accessor: (_, i) => i + 1 },
      { header: 'Tanggal', accessor: (r) => formatDate(r.tanggal_kunjungan) },
      { header: 'Nama', accessor: (r) => r.warga?.nama || '-' },
      { header: 'NIK', accessor: (r) => r.warga?.nik || '-' },
    ];
  }

  // Helper to split text by newline for table headers
  const renderHeader = (header: string | React.ReactNode) => {
    if (typeof header === 'string') {
      return header.split('\n').map((line, i) => <div key={i}>{line}</div>);
    }
    return header;
  };

  const getBulanStr = (m: number) => {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return months[m - 1] || '';
  };

  return (
    <div className="w-full bg-white print:bg-white text-black print:break-after-page mb-8 print:mb-0" style={{ fontFamily: "'Times New Roman', serif", fontSize: '9pt', lineHeight: '1.3' }}>
      {/* === KOP SURAT === */}
      <div style={{ marginBottom: '6pt' }}>
        <p style={{ fontSize: '9pt', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '1pt' }}>PEMERINTAH KABUPATEN BOGOR</p>
        <p style={{ fontSize: '8pt', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '4pt' }}>DINAS PEMBERDAYAAN PEREMPUAN DAN PERLINDUNGAN ANAK, PENGENDALIAN PENDUDUK DAN KELUARGA BERENCANA</p>
        <p style={{ fontSize: '9pt', fontWeight: 'bold', marginBottom: '4pt' }}>DAFTAR VISUM PENDAMPING SASARAN TPK</p>
        
        <table style={{ fontSize: '7.5pt', borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            <tr>
              <td style={{ width: '70pt', paddingBottom: '1pt', verticalAlign: 'top' }}>Program</td>
              <td style={{ width: '8pt', textAlign: 'center', verticalAlign: 'top' }}>:</td>
              <td style={{ paddingBottom: '1pt', verticalAlign: 'top' }}>Pemberdayaan dan Peningkatan Keluarga Sejahtera (2.14.04)</td>
            </tr>
            <tr>
              <td style={{ paddingBottom: '1pt', verticalAlign: 'top' }}>Kegiatan</td>
              <td style={{ textAlign: 'center', verticalAlign: 'top' }}>:</td>
              <td style={{ paddingBottom: '1pt', verticalAlign: 'top' }}>Pelaksanaan dan Peningkatan Peran Serta Organisasi Kemasyarakatan Tingkat Daerah Kabupaten/Kota dalam Pembangunan Keluarga melalui Pembinaan Ketahanan dan Kesejahteraan Keluarga. (2.14.04.2.02)</td>
            </tr>
            <tr>
              <td style={{ paddingBottom: '1pt', verticalAlign: 'top' }}>Sub Kegiatan</td>
              <td style={{ textAlign: 'center', verticalAlign: 'top' }}>:</td>
              <td style={{ paddingBottom: '1pt', verticalAlign: 'top' }}>Pendampingan Keluarga Berisiko Stunting (termasuk Remaja Calon Pengantin/Calon PUS, Ibu Hamil, Pasca Salin/Kelahiran, Baduta/Balita) (2.14.04.2.02.0005)</td>
            </tr>
            <tr>
              <td style={{ paddingBottom: '1pt' }}>Bulan/Tahun</td>
              <td style={{ textAlign: 'center' }}>:</td>
              <td style={{ paddingBottom: '1pt', fontWeight: 'bold' }}>{periodeLabel || `${getBulanStr(bulan!)} ${tahun}`}</td>
            </tr>
            <tr>
              <td style={{ paddingBottom: '1pt' }}>TPK</td>
              <td style={{ textAlign: 'center' }}>:</td>
              <td style={{ paddingBottom: '1pt', fontWeight: 'bold' }}>{posyanduName}</td>
            </tr>
            <tr>
              <td style={{ paddingBottom: '1pt' }}>RT/RW</td>
              <td style={{ textAlign: 'center' }}>:</td>
              <td style={{ paddingBottom: '1pt' }}></td>
            </tr>
            <tr>
              <td style={{ paddingBottom: '1pt' }}>Desa</td>
              <td style={{ textAlign: 'center' }}>:</td>
              <td style={{ paddingBottom: '1pt' }}>{desa}</td>
            </tr>
            <tr>
              <td style={{ paddingBottom: '1pt' }}>Kecamatan</td>
              <td style={{ textAlign: 'center' }}>:</td>
              <td style={{ paddingBottom: '1pt' }}>{kecamatan}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* === LABEL KATEGORI === */}
      <div style={{ textAlign: 'right', fontWeight: 'bold', fontStyle: 'italic', fontSize: '8pt', marginBottom: '2pt' }}>
        {titleRight}
      </div>

      {/* === TABEL DATA === */}
      <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '6.5pt', marginBottom: '8pt' }}>
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                style={{
                  border: '0.5pt solid black',
                  padding: '3pt 1pt',
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  fontWeight: 'bold',
                  lineHeight: '1.25',
                  width: col.width,
                  wordBreak: 'break-word',
                  background: '#f8f8f8',
                }}
              >
                {renderHeader(col.header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <>
              {/* 12 baris kosong bernomor agar terlihat seperti form asli */}
              {Array.from({ length: 12 }).map((_, i) => (
                <tr key={`empty-${i}`}>
                  {columns.map((_, cIdx) => (
                    <td key={`empty-cell-${cIdx}`} style={{ border: '0.5pt solid black', padding: '5pt 1pt', textAlign: 'center', verticalAlign: 'middle' }}>
                      {cIdx === 0 ? i + 1 : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </>
          ) : (
            <>
              {data.map((row, rIdx) => (
                <tr key={rIdx}>
                  {columns.map((col, cIdx) => (
                    <td
                      key={cIdx}
                      style={{
                        border: '0.5pt solid black',
                        padding: '2pt 1pt',
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        wordBreak: 'break-word',
                      }}
                    >
                      {renderHeader(col.accessor(row, rIdx))}
                    </td>
                  ))}
                </tr>
              ))}
              {/* Baris kosong filler bernomor lanjutan */}
              {data.length < 12 && Array.from({ length: 12 - data.length }).map((_, i) => (
                <tr key={`empty-${i}`}>
                  {columns.map((_, cIdx) => (
                    <td key={`empty-cell-${cIdx}`} style={{ border: '0.5pt solid black', padding: '5pt 1pt', textAlign: 'center', verticalAlign: 'middle' }}>
                      {cIdx === 0 ? data.length + i + 1 : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </>
          )}
        </tbody>
      </table>

      {/* === FOOTER TANDA TANGAN === */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '7.5pt', marginTop: '4pt' }}>
        <div style={{ textAlign: 'center', width: '160pt' }}>
          <p style={{ marginBottom: '2pt' }}>Mengetahui,</p>
          <p style={{ marginBottom: '30pt' }}>Koordinator Lapangan</p>
          <section className='flex flex-col gap-2'>
            <p style={{ fontWeight: 'bold' }}>( .................... )</p>
            <p>NIP. ....................</p>
          </section>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{ textAlign: 'right', marginBottom: '4pt' }}>{kecamatan}, {formatDateID(new Date())}</p>
          <p style={{ fontWeight: 'bold', marginBottom: '4pt' }}>TIM PENDAMPING KELUARGA</p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '32pt', marginTop: '6pt' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ marginBottom: '30pt' }}>Nakes/Kader KB</p>
              <p style={{ fontWeight: 'bold' }}>( .................... )</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p>Pendamping TPK</p>
              <p style={{ marginBottom: '20pt' }}>Kader PKK</p>
              <p style={{ fontWeight: 'bold' }}>( .................... )</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ marginBottom: '30pt' }}>Kader KB</p>
              <p style={{ fontWeight: 'bold' }}>( .................... )</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
