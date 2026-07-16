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
  password: z.string().min(8, 'Au moins 8 caractères'),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirm'],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const register_ = useAuth((s) => s.register);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setError('');
      await register_(data.email, data.password);
      navigate('/dashboard');
    } catch {
      setError('Impossible de créer le compte');
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
          <h1 className="font-display text-3xl font-bold text-(--color-text) mb-2">Créer un compte</h1>
          <p className="text-muted text-sm">Rejoignez L'Observatoire et créez vos premiers formulaires</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-8">
          <Input label="Email" type="email" required error={errors.email?.message} {...register('email')} />
          <Input label="Mot de passe" type="password" required error={errors.password?.message} {...register('password')} />
          <Input label="Confirmer le mot de passe" type="password" required error={errors.confirm?.message} {...register('confirm')} />

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          <Button type="submit" size="lg" loading={isSubmitting} className="mt-2">
            Créer mon compte
          </Button>

          <p className="text-center text-sm text-[var(--color-text-muted)]">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-[var(--color-primary)] hover:underline">Se connecter</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
