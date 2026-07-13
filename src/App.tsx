import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="members" element={<AdminMembers />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="fees" element={<AdminFees />} />
              <Route path="inquiries" element={<AdminInquiries />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
              <Route path="plans" element={<AdminPlans />} />
              <Route path="gallery" element={<AdminGallery />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="seats" element={<AdminSeats />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AdminProvider>
    </AuthProvider>
  );
}
