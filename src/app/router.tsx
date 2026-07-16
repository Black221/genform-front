import { createBrowserRouter, RouterProvider, Navigate } from 'react-router';
import { lazy, Suspense } from 'react';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { RequireRole } from '@/features/auth/RequireRole';
import { ManagementLayout } from '@/app/layouts/ManagementLayout';
import { CollectionLayout } from '@/app/layouts/CollectionLayout';
import { PublicLayout } from '@/app/layouts/PublicLayout';
import { CaptureLayout } from '@/app/layouts/CaptureLayout';

// Landing (public)
const LandingPage = lazy(() => import('@/features/landing/pages/LandingPage'));

// Auth
const LoginPage       = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage    = lazy(() => import('@/features/auth/pages/RegisterPage'));

// Management
const DashboardPage      = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const FormListPage       = lazy(() => import('@/features/forms/pages/FormListPage'));
const FormEditPage       = lazy(() => import('@/features/forms/pages/FormEditPage'));
const StatisticsPage     = lazy(() => import('@/features/statistics/pages/StatisticsPage'));
const ResponseListPage   = lazy(() => import('@/features/responses/pages/ResponseListPage'));
const ResponseDetailPage = lazy(() => import('@/features/responses/pages/ResponseDetailPage'));
const TemplateGallery    = lazy(() => import('@/features/templates/pages/TemplateGallery'));
const TemplateEditor     = lazy(() => import('@/features/templates/pages/TemplateEditor'));
const ThemeGallery       = lazy(() => import('@/features/themes/pages/ThemeGallery'));
const ThemeEditorPage    = lazy(() => import('@/features/themes/pages/ThemeEditorPage'));
const MapPage            = lazy(() => import('@/features/map/pages/MapPage'));
const UsersPage          = lazy(() => import('@/features/users/pages/UsersPage'));
const AdminPage          = lazy(() => import('@/features/admin/pages/AdminPage'));

// Collection
const CollectPage = lazy(() => import('@/features/observations/pages/CollectPage'));

// Capture publique anonyme
const CapturePage   = lazy(() => import('@/features/capture/pages/CapturePage'));
const AssociatePage = lazy(() => import('@/features/capture/pages/AssociatePage'));
const HistoryPage   = lazy(() => import('@/features/capture/pages/HistoryPage'));

// Public
const PublicFormPage = lazy(() => import('@/features/public-form/pages/PublicFormPage'));

// 404
const NotFoundPage = lazy(() => import('@/app/pages/NotFoundPage'));

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-app">
      <div className="size-8 rounded-full border-2 border-(--color-primary) border-t-transparent animate-spin" />
    </div>
  );
}

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Spinner />}>{children}</Suspense>;
}

const router = createBrowserRouter([
  // Redirects anciens chemins
  { path: '/home', element: <Navigate to="/dashboard" replace /> },
  { path: '/library', element: <Navigate to="/templates" replace /> },

  // ── Landing (public) ────────────────────────────────────────────────────────
  { path: '/', element: <Lazy><LandingPage /></Lazy> },

  // ── Auth ────────────────────────────────────────────────────────────────────
  { path: '/login',    element: <Lazy><LoginPage /></Lazy> },
  { path: '/register', element: <Lazy><RegisterPage /></Lazy> },

  // ── Public microsite ────────────────────────────────────────────────────────
  {
    element: <PublicLayout />,
    children: [
      { path: '/f/:slug', element: <Lazy><PublicFormPage /></Lazy> },
    ],
  },

  // ── Carte plein écran (publique — visibilité fine gérée par le backend) ─────
  { path: '/map', element: <Lazy><MapPage /></Lazy> },

  // ── Capture citoyenne anonyme (publique, hors ligne) ────────────────────────
  {
    element: <CaptureLayout />,
    children: [
      { path: '/capture',           element: <Lazy><CapturePage /></Lazy> },
      { path: '/capture/associate', element: <Lazy><AssociatePage /></Lazy> },
      { path: '/capture/history',   element: <Lazy><HistoryPage /></Lazy> },
    ],
  },

  // ── Protected app ───────────────────────────────────────────────────────────
  {
    element: <RequireAuth />,
    children: [
      // Management shell (sidebar + topbar)
      {
        element: <ManagementLayout />,
        children: [
          { path: '/dashboard', element: <Lazy><DashboardPage /></Lazy> },

          // COORDINATOR+
          {
            element: <RequireRole minRole="COORDINATOR" />,
            children: [
              { path: '/forms',                               element: <Lazy><FormListPage /></Lazy> },
              { path: '/forms/:id/edit',                     element: <Lazy><FormEditPage /></Lazy> },
              { path: '/forms/:id/statistics',               element: <Lazy><StatisticsPage /></Lazy> },
              { path: '/forms/:id/responses',                element: <Lazy><ResponseListPage /></Lazy> },
              { path: '/forms/:id/responses/:responseId',    element: <Lazy><ResponseDetailPage /></Lazy> },
              { path: '/templates',                          element: <Lazy><TemplateGallery /></Lazy> },
              { path: '/templates/new',                      element: <Lazy><TemplateEditor /></Lazy> },
              { path: '/templates/:id/edit',                 element: <Lazy><TemplateEditor /></Lazy> },
              { path: '/themes',                             element: <Lazy><ThemeGallery /></Lazy> },
              { path: '/themes/new',                         element: <Lazy><ThemeEditorPage /></Lazy> },
              { path: '/themes/:id/edit',                    element: <Lazy><ThemeEditorPage /></Lazy> },
              { path: '/users',                              element: <Lazy><UsersPage /></Lazy> },
            ],
          },

          // ADMIN only
          {
            element: <RequireRole minRole="ADMIN" />,
            children: [
              { path: '/admin', element: <Lazy><AdminPage /></Lazy> },
            ],
          },
        ],
      },

      // Collection shell (mobile, no sidebar)
      {
        element: <CollectionLayout />,
        children: [
          { path: '/collect',         element: <Lazy><CollectPage /></Lazy> },
          { path: '/collect/:formId', element: <Lazy><CollectPage /></Lazy> },
        ],
      },
    ],
  },

  // ── 404 catch-all ───────────────────────────────────────────────────────────
  { path: '*', element: <Lazy><NotFoundPage /></Lazy> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
