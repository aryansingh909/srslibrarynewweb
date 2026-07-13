import { useState } from 'react';
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, CalendarCheck, Wallet, Megaphone, ClipboardList,
  Image, Settings, LogOut, Menu, X, ChevronLeft, ChevronRight, Armchair,  MessageSquare,
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';

const nav = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/members', label: 'Members', icon: Users },
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  { to: '/admin/fees', label: 'Fee Tracking', icon: Wallet },
  { to: '/admin/inquiries', label: 'Enquiries', icon: MessageSquare },
  { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/admin/plans', label: 'Plans & Pricing', icon: ClipboardList },
  { to: '/admin/seats', label: 'Seat Management', icon: Armchair },
  { to: '/admin/gallery', label: 'Gallery', icon: Image },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const { admin, logout } = useAdmin();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!admin) return <Navigate to="/admin/login" replace />;

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const SidebarInner = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-16 border-b border-white/10 shrink-0">
        <span className="text-xl">📚</span>
        {!collapsed && (
          <span className="font-display font-bold text-base text-white">
            SRS <span className="text-primary-300">Admin</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`
            }
          >
            <n.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{n.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 shrink-0 space-y-2">
        {!collapsed && (
          <div className="px-3 py-2">
            <p className="text-xs text-slate-400">Signed in as</p>
            <p className="text-sm font-semibold text-white truncate">{admin.name}</p>
            <p className="text-xs text-slate-400 truncate">{admin.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-error/20 hover:text-error transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-5 h-5 shrink-0" /> : <ChevronLeft className="w-5 h-5 shrink-0" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas flex">
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col bg-navy-900 transition-all duration-300 shrink-0 ${collapsed ? 'w-20' : 'w-64'}`}>
        <SidebarInner />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-navy-950/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-navy-900 flex flex-col">
            <SidebarInner />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-line flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
            <Menu className="w-6 h-6" />
          </button>
          <div className="hidden lg:block">
            <h2 className="font-display font-semibold text-ink">Admin Panel</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-ink">{admin.name}</p>
              <p className="text-xs text-ink-muted capitalize">{admin.role}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary-800 text-white flex items-center justify-center font-semibold text-sm">
              {admin.name.charAt(0)}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
