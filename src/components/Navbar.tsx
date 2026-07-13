import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, GraduationCap } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../contexts/AuthContext';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/plans', label: 'Plans' },
  { to: '/programs', label: 'Degrees' },
  { to: '/book', label: 'Book a Seat' },
  { to: '/about', label: 'About' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/announcements', label: 'Announcements' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setOpen(false); }, [location]);

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white shadow-card border-b border-line' : 'bg-white/80 backdrop-blur'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo />

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === l.to
                    ? 'text-primary-800 bg-primary-50'
                    : 'text-ink-muted hover:text-ink hover:bg-slate-100'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            {user ? (
              <Link to="/dashboard" className="btn-primary text-sm px-4 py-2">
                <GraduationCap className="w-4 h-4" /> Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm px-4 py-2">Sign In</Link>
                <Link to="/book" className="btn-primary text-sm px-4 py-2">Book a Seat</Link>
              </>
            )}
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-white border-t border-line px-4 py-3 space-y-1">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === l.to
                  ? 'text-primary-800 bg-primary-50'
                  : 'text-ink-muted hover:text-ink hover:bg-slate-100'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            {user ? (
              <Link to="/dashboard" className="btn-primary text-sm">
                <GraduationCap className="w-4 h-4" /> Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm">Sign In</Link>
                <Link to="/book" className="btn-primary text-sm">Book a Seat</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
