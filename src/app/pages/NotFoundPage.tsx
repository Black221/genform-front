import { useNavigate } from 'react-router';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6 px-4"
      style={{ background: '#F3F6F4', fontFamily: "'Hanken Grotesk', sans-serif" }}
    >
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center"
        style={{ background: '#DCEFEC' }}
      >
        <span className="text-4xl font-bold" style={{ color: '#0B6E63' }}>404</span>
      </div>

      <div className="text-center flex flex-col gap-2">
        <h1
          className="text-2xl font-bold"
          style={{ color: '#15211E', fontFamily: "'Bricolage Grotesque', sans-serif" }}
        >
          Page introuvable
        </h1>
        <p className="text-sm max-w-xs" style={{ color: '#576A65' }}>
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
          style={{ borderColor: '#D8E0DD', color: '#576A65', background: 'white' }}
        >
          <ArrowLeft size={15} />
          Retour
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ background: '#0B6E63' }}
        >
          <Home size={15} />
          Tableau de bord
        </button>
      </div>
    </div>
  );
}
