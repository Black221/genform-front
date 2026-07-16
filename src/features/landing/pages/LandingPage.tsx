import { Link, useNavigate } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import {
  Camera, Map, RefreshCw, BarChart2, ArrowRight,
} from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import logoFull from '@/assets/logo-observatoire.jpg';
import logoSquare from '@/assets/logo-observatoire-carre.jpg';

/* ── Révélation au scroll ─────────────────────────────────── */
function Reveal({
  children, delay = 0, className,
}: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity 0.55s ${delay}s cubic-bezier(.2,.7,.2,1), transform 0.55s ${delay}s cubic-bezier(.2,.7,.2,1)`,
    }}>
      {children}
    </div>
  );
}

/* ── Courbes de niveau SVG (décor héro) ───────────────────── */
function TopoLines() {
  return (
    <svg aria-hidden className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 800 560" fill="none" preserveAspectRatio="xMidYMid slice">
      {[65, 115, 165, 215, 265, 315, 370].map((r, i) => (
        <ellipse key={r} cx="680" cy="280" rx={r * 1.55} ry={r}
          stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none"
          strokeDasharray="1000"
          style={{ strokeDashoffset: 1000, animation: `draw-line 1.5s ${0.15 + i * 0.13}s cubic-bezier(.2,.7,.2,1) both` }}
        />
      ))}
      <circle cx="680" cy="280" r="4" fill="rgba(255,255,255,0.22)" />
      <circle cx="680" cy="280" r="14" fill="rgba(255,255,255,0.05)" />
    </svg>
  );
}

/* ── Étape processus ──────────────────────────────────────── */
function Step({ n, title, desc, icon }: {
  n: number; title: string; desc: string; icon: React.ReactNode;
}) {
  return (
    <div className="flex gap-5">
      <div className="shrink-0 flex flex-col items-center">
        <div className="size-9 rounded-full border-2 border-primary text-primary font-mono font-bold text-sm flex items-center justify-center bg-surface">
          {n}
        </div>
        {n < 3 && <div className="w-px flex-1 bg-border mt-2" />}
      </div>
      <div className="pb-8">
        <div className="flex items-center gap-2.5 mb-1.5">
          <span className="text-primary">{icon}</span>
          <h3 className="font-display font-semibold text-(--color-text)">{title}</h3>
        </div>
        <p className="text-sm text-muted leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────── */
export default function LandingPage() {
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-app font-body">

      {/* Nav */}
      <nav className="sticky top-0 z-30 border-b border-theme bg-surface/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between h-16 px-6">
          <img src={logoFull} alt="L'Observatoire éco-citoyen" className="h-9 w-auto object-contain" />
          <div className="hidden md:flex items-center gap-6 text-sm text-muted">
            <a href="#mission"    className="hover:text-(--color-text) transition-colors">Le projet</a>
            <a href="#comment"   className="hover:text-(--color-text) transition-colors">Comment ça marche</a>
            <a href="#participer" className="hover:text-(--color-text) transition-colors">Participer</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/capture">
              <Button size="sm"><Camera size={15} className="mr-1.5" />Signaler</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="sm">Se connecter</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-primary min-h-[68vh] flex items-center">
        <TopoLines />
        <div
          className="relative z-10 max-w-3xl mx-auto px-6 py-24 text-center"
          style={{ animation: 'rise-in 0.65s 0.1s cubic-bezier(.16,1,.3,1) both' }}
        >
          <p className="font-mono text-[10px] text-white/45 uppercase tracking-widest mb-6">
            Observatoire · Participation citoyenne
          </p>
          <h1
            className="font-display text-4xl md:text-5xl font-bold text-white leading-tight mb-6"
            style={{ letterSpacing: '-0.025em' }}
          >
            Cartographier l'environnement,{' '}
            <span className="text-white/55">ensemble.</span>
          </h1>
          <p className="text-white/65 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            L'Observatoire éco-citoyen permet à chacun de signaler et géolocaliser des
            observations environnementales — air, eau, sols, santé — sur 5 communes.
            Sans réseau. Sans compte.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/capture">
              <Button size="lg" variant="accent" icon={<Camera size={16} />}>
                Signaler maintenant
              </Button>
            </Link>
            <Link to="/map">
              <Button
                size="lg"
                className="bg-white/10 text-white border border-white/20 hover:bg-white/18 hover:border-white/30"
                icon={<Map size={16} />}
              >
                Voir la carte
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section id="mission" className="max-w-3xl mx-auto px-6 py-20 text-center">
        <Reveal>
          <p className="font-mono text-[10px] text-muted uppercase tracking-widest mb-3">Le projet</p>
          <h2
            className="font-display text-2xl md:text-3xl font-bold text-(--color-text) mb-6"
            style={{ letterSpacing: '-0.02em' }}
          >
            Observation terrain, impact collectif
          </h2>
          <p className="text-muted text-base leading-relaxed">
            Porté par des associations éco-citoyennes, l'Observatoire mobilise habitants,
            coordinateurs et autorités locales autour d'une même plateforme de collecte.
            Chaque observation est géolocalisée, documentée et rendue accessible pour
            nourrir le dialogue territorial et orienter l'action publique.
          </p>
        </Reveal>
      </section>

      {/* Comment ça marche */}
      <section id="comment" className="bg-sunken py-20">
        <div className="max-w-2xl mx-auto px-6">
          <Reveal>
            <p className="font-mono text-[10px] text-muted uppercase tracking-widest mb-3 text-center">
              Processus
            </p>
            <h2
              className="font-display text-2xl md:text-3xl font-bold text-(--color-text) text-center mb-12"
              style={{ letterSpacing: '-0.02em' }}
            >
              Comment ça marche
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Step
              n={1}
              icon={<Camera size={16} />}
              title="Prendre une photo"
              desc="Photographiez la situation sur le terrain. La position GPS est capturée au même moment, même sans connexion réseau."
            />
            <Step
              n={2}
              icon={<RefreshCw size={16} />}
              title="Remplir un formulaire"
              desc="Associez votre photo à un formulaire d'observation maintenant ou plus tard. Vos données restent sur l'appareil jusqu'à synchronisation."
            />
            <Step
              n={3}
              icon={<BarChart2 size={16} />}
              title="Contribuer à la carte"
              desc="Votre signalement est géolocalisé et analysé. Les coordinateurs et autorités locales accèdent aux données en temps réel."
            />
          </Reveal>
        </div>
      </section>

      {/* Participer */}
      <section id="participer" className="max-w-5xl mx-auto px-6 py-20">
        <Reveal>
          <p className="font-mono text-[10px] text-muted uppercase tracking-widest mb-3 text-center">
            Rejoindre
          </p>
          <h2
            className="font-display text-2xl md:text-3xl font-bold text-(--color-text) text-center mb-10"
            style={{ letterSpacing: '-0.02em' }}
          >
            Comment participer ?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">

            {/* Citoyen */}
            <div className="p-8 rounded-(--radius-lg) border border-theme bg-surface shadow-soft flex flex-col gap-5">
              <div className="size-12 rounded-2xl bg-primary-soft flex items-center justify-center">
                <Camera className="size-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-bold text-(--color-text) mb-2">En tant que citoyen</h3>
                <p className="text-sm text-muted leading-relaxed">
                  Prenez une photo, géolocalisez une observation, remplissez un formulaire.
                  Aucun compte nécessaire. Fonctionne hors ligne — les données se synchronisent
                  dès que vous retrouvez du réseau.
                </p>
              </div>
              <Link to="/capture" className="mt-auto">
                <Button className="w-full" icon={<ArrowRight size={15} />}>
                  Signaler maintenant
                </Button>
              </Link>
            </div>

            {/* Observateur */}
            <div className="p-8 rounded-(--radius-lg) border border-theme bg-surface shadow-soft flex flex-col gap-5">
              <div className="size-12 rounded-2xl bg-primary-soft flex items-center justify-center">
                <Map className="size-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-bold text-(--color-text) mb-2">En tant qu'observateur</h3>
                <p className="text-sm text-muted leading-relaxed">
                  Rejoignez le réseau pour accéder à la carte complète, valider des signalements
                  citoyens et exporter des statistiques pour votre commune.
                </p>
              </div>
              <Link to="/register" className="mt-auto">
                <Button variant="secondary" className="w-full" icon={<ArrowRight size={15} />}>
                  Créer un compte
                </Button>
              </Link>
            </div>

          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-theme bg-surface">
        <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
          <div className="flex items-center gap-2.5">
            <img src={logoSquare} alt="" className="size-8 rounded-md object-cover" />
            <span className="font-display font-semibold text-(--color-text)">L'Observatoire éco-citoyen</span>
          </div>
          <div className="flex gap-5">
            <Link to="/capture" className="hover:text-(--color-text) transition-colors">Signaler</Link>
            <Link to="/map"     className="hover:text-(--color-text) transition-colors">La carte</Link>
            <Link to="/login"   className="hover:text-(--color-text) transition-colors">Connexion</Link>
          </div>
          <span className="font-mono text-xs">© 2026 · Observation Citoyenne</span>
        </div>
      </footer>

    </div>
  );
}
