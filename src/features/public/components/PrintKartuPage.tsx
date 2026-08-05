import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGetWargaById } from '../../warga/hooks/useWarga';
import { KartuPosyandu } from './KartuPosyandu';
import { SkeletonCard } from '@/components/feedback/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PrintKartuPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: warga, isLoading } = useGetWargaById(id || '');

  useEffect(() => {
    if (warga) {
      // Auto trigger print after a short delay to ensure images/fonts load
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [warga]);

  if (isLoading) {
    return <div className="p-8"><SkeletonCard /></div>;
  }

  if (!warga) {
    return <div className="p-8 text-center text-slate-500">Data warga tidak ditemukan.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8 print:bg-white print:p-0">
      <div className="max-w-md mx-auto mb-6 print:hidden flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <Button variant="ghost" onClick={() => navigate(-1)} className="text-slate-500">
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
        </Button>
        <Button onClick={() => window.print()} className="bg-accent text-white hover:bg-accent/90 font-semibold">
          <Printer className="w-4 h-4 mr-2" /> Cetak Ulang
        </Button>
      </div>
      
      <KartuPosyandu warga={warga} />
    </div>
  );
};
