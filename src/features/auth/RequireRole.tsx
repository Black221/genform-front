import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from './useAuth';
import type { UserRole } from '@/shared/types';

const ROLE_WEIGHT: Record<UserRole, number> = { OBSERVER: 0, COORDINATOR: 1, ADMIN: 2 };

interface Props {
  minRole: UserRole;
}

export function RequireRole({ minRole }: Props) {
  const role = useAuth((s) => s.role);
  const location = useLocation();

  if (ROLE_WEIGHT[role] < ROLE_WEIGHT[minRole]) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
