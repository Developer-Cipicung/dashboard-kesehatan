import React, { useState } from 'react';
import { publicService } from '../../../services/publicService';
import { Warga } from '../../warga/services/wargaService';
import { KartuPosyandu } from '../components/KartuPosyandu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldAlert, Search, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const CekKartuPage = () => {
  const [nik, setNik] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [loading, setLoading] = useState(false);
  const [wargaData, setWargaData] = useState<Warga | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nik || nik.trim() === '') {
      toast.error('NIK wajib diisi');
      return;
    }
    if (!tanggalLahir) {
      toast.error('Tanggal lahir wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const data = await publicService.cekKartu(nik, tanggalLahir);
      setWargaData(data);
      toast.success('Kartu ditemukan!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Data tidak ditemukan. Pastikan NIK dan Tanggal Lahir sesuai.');
      setWargaData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setWargaData(null);
    setNik('');
    setTanggalLahir('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 print:bg-white print:p-0">
      
      {/* Background Pattern for Public Page */}
      <div className="fixed inset-0 z-0 opacity-40 print:hidden" style={{
        backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }}></div>

      <div className="relative z-10 w-full max-w-md print:max-w-none">
        
        {!wargaData ? (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">Cek Kartu Posyandu</h1>
              <p className="text-slate-500 text-sm mt-2">
                Masukkan NIK (atau NIK Sementara) dan Tanggal Lahir Anda untuk melihat riwayat posyandu digital Anda.
              </p>
            </div>

            <form onSubmit={handleSearch} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="nik">Nomor Induk Kependudukan (NIK)</Label>
                <Input 
                  id="nik" 
                  type="text" 
                  placeholder="Masukkan NIK / NIK Sementara" 
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ttl">Tanggal Lahir</Label>
                <Input 
                  id="ttl" 
                  type="date" 
                  value={tanggalLahir}
                  onChange={(e) => setTanggalLahir(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 mt-4">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  Data kesehatan Anda dilindungi. Hanya pemilik NIK dan Tanggal Lahir yang sesuai yang dapat mengakses kartu ini.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-md font-semibold"
                disabled={loading}
              >
                {loading ? 'Mencari...' : 'Lihat Kartu Digital'}
              </Button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <KartuPosyandu warga={wargaData} />
            
            <div className="flex flex-col sm:flex-row gap-3 print:hidden">
              <Button onClick={() => window.print()} className="flex-1 h-12 bg-slate-800 hover:bg-slate-900">
                Print Kartu
              </Button>
              <Button onClick={handleReset} variant="outline" className="flex-1 h-12 border-slate-300">
                <RefreshCw className="w-4 h-4 mr-2" /> Cek NIK Lain
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
