import { Outlet } from 'react-router';

// No chrome — public microsite pages fill the entire viewport
export function PublicLayout() {
  return <Outlet />;
}
