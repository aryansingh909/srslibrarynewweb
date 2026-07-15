import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { AdminProvider } from './contexts/AdminContext';
import PublicLayout from './components/PublicLayout';
import Home from './pages/public/Home';
import Plans from './pages/public/Plans';
import Book from './pages/public/Book';
import About from './pages/public/About';
import Gallery from './pages/public/Gallery';
import Contact from './pages/public/Contact';
import Announcements from './pages/public/Announcements';
import Programs from './pages/public/Programs';
import MemberLogin from './pages/member/Login';
import MemberDashboard from './pages/member/Dashboard';
import AdminLogin from './pages/admin/Login';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminMembers from './pages/admin/Members';
import AdminBookings from './pages/admin/Bookings';
import AdminFees from './pages/admin/Fees';
import AdminAnnouncements from './pages/admin/Announcements';
import AdminPlans from './pages/admin/Plans';
import AdminGallery from './pages/admin/Gallery';
import AdminInquiries from './pages/admin/Inquiries';
import AdminSettings from './pages/admin/Settings';
import AdminSeats from './pages/admin/Seats';
import ScrollToTop from './components/ScrollToTop'
import { useAdmin } from './contexts/AdminContext';
import type { AdminPermissionKey } from './lib/supabase';

function PermissionRoute({ perm, children }: { perm: AdminPermissionKey; children: React.ReactNode }) {
  const { hasPermission } = useAdmin();
  if (!hasPermission(perm)) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

const PERM_ROUTES: { path: string; perm: AdminPermissionKey }[] = [
  { path: '/admin/dashboard', perm: 'dashboard' },
  { path: '/admin/members', perm: 'members' },
  { path: '/admin/bookings', perm: 'bookings' },
  { path: '/admin/fees', perm: 'fees' },
  { path: '/admin/inquiries', perm: 'inquiries' },
  { path: '/admin/announcements', perm: 'announcements' },
  { path: '/admin/plans', perm: 'plans' },
  { path: '/admin/seats', perm: 'seats' },
  { path: '/admin/gallery', perm: 'gallery' },
  { path: '/admin/settings', perm: 'settings' },
];

function AdminIndexRedirect() {
  const { hasPermission } = useAdmin();
  const first = PERM_ROUTES.find((r) => hasPermission(r.perm));
  return <Navigate to={first?.path ?? '/admin/login'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                borderRadius: '12px',
                background: '#0F172A',
                color: '#fff',
                fontSize: '14px',
              },
            }}
          />
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/book" element={<Book />} />
              <Route path="/about" element={<About />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/programs" element={<Programs />} />
              <Route path="/login" element={<MemberLogin />} />
              <Route path="/dashboard" element={<MemberDashboard />} />
            </Route>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminIndexRedirect />} />
              <Route path="dashboard" element={<PermissionRoute perm="dashboard"><AdminDashboard /></PermissionRoute>} />
              <Route path="members" element={<PermissionRoute perm="members"><AdminMembers /></PermissionRoute>} />
              <Route path="bookings" element={<PermissionRoute perm="bookings"><AdminBookings /></PermissionRoute>} />
              <Route path="fees" element={<PermissionRoute perm="fees"><AdminFees /></PermissionRoute>} />
              <Route path="inquiries" element={<PermissionRoute perm="inquiries"><AdminInquiries /></PermissionRoute>} />
              <Route path="announcements" element={<PermissionRoute perm="announcements"><AdminAnnouncements /></PermissionRoute>} />
              <Route path="plans" element={<PermissionRoute perm="plans"><AdminPlans /></PermissionRoute>} />
              <Route path="gallery" element={<PermissionRoute perm="gallery"><AdminGallery /></PermissionRoute>} />
              <Route path="settings" element={<PermissionRoute perm="settings"><AdminSettings /></PermissionRoute>} />
              <Route path="seats" element={<PermissionRoute perm="seats"><AdminSeats /></PermissionRoute>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AdminProvider>
    </AuthProvider>
  );
}
