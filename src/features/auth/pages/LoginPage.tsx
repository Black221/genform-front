import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../useAuth';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { useState } from 'react';
import logoFull from '@/assets/logo-observatoire.jpg';

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe trop court'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuth((s) => s.login);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setError('');
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch {
      setError('Email ou mot de passe incorrect');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-app bg-mesh px-4">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <img
            src={logoFull}
            alt="L'Observatoire éco-citoyen"
            className="h-16 w-auto mx-auto mb-8"
          />
          <h1 className="font-display text-3xl font-bold text-(--color-text) mb-2">Connexion</h1>
          <p className="text-muted text-sm">Accédez à votre espace L'Observatoire</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-8">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            required
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Mot de passe"
            type="password"
            autoComplete="current-password"
            required
            error={errors.password?.message}
            {...register('password')}
          />

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          <Button type="submit" size="lg" loading={isSubmitting} className="mt-2">
            Se connecter
          </Button>

          <p className="text-center text-sm text-[var(--color-text-muted)]">
            Pas de compte ?{' '}
            <Link to="/register" className="text-[var(--color-primary)] hover:underline">
              S'inscrire
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
