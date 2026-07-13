import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Instagram, Facebook, Youtube, MessageCircle, Clock, BookOpen, GraduationCap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase, type SiteSettings } from '../lib/supabase';

export default function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    supabase.from('site_settings').select('*').eq('id', 1).maybeSingle()
      .then(({ data }) => setSettings(data as SiteSettings));
  }, []);

  const quickLinks = [
    { to: '/', label: 'Home' },
    { to: '/plans', label: 'Plans & Pricing' },
    { to: '/programs', label: 'Online Degrees' },
    { to: '/about', label: 'About Us' },
    { to: '/gallery', label: 'Gallery' },
    { to: '/announcements', label: 'Announcements' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <footer className="bg-navy-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary-700 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                SRS <span className="text-primary-300">Digital Library</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Your local digital library and authorized Mangalayatan University Academic Counselling Centre. Study locally, earn a university degree.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-slate-400 hover:text-primary-300 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-4">University Partner</h4>
            <div className="space-y-2 text-sm text-slate-400">
              <p className="flex items-start gap-2">
                <GraduationCap className="w-4 h-4 mt-0.5 text-primary-300 shrink-0" />
                <span>Mangalayatan University, Aligarh<br />NAAC A+ Accredited</span>
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Ref: MU/ALI//2026-27/254<br />Dated: 21-05-2026
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-primary-300 shrink-0" />
                <span className="text-slate-400">{settings?.library_address || 'Hasiya, Barsethi, Jaunpur, Uttar Pradesh'}</span>
              </li>
              <li>
                <a href={`mailto:${settings?.library_email || 'srsdigitalibrary@gmail.com'}`} className="flex items-center gap-3 text-slate-400 hover:text-primary-300">
                  <Mail className="w-4 h-4 text-primary-300" />
                  {settings?.library_email || 'srsdigitalibrary@gmail.com'}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-primary-300" />
                <span className="text-slate-400">Open all days · Call for timings</span>
              </li>
            </ul>
            <div className="flex gap-3 mt-4">
              {settings?.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-primary-600 flex items-center justify-center transition-colors" aria-label="Instagram">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {settings?.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-primary-600 flex items-center justify-center transition-colors" aria-label="Facebook">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {settings?.youtube_url && (
                <a href={settings.youtube_url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-primary-600 flex items-center justify-center transition-colors" aria-label="YouTube">
                  <Youtube className="w-5 h-5" />
                </a>
              )}
              {settings?.whatsapp_number && (
                <a href={`https://wa.me/${settings.whatsapp_number}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-success flex items-center justify-center transition-colors" aria-label="WhatsApp">
                  <MessageCircle className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-slate-500">© 2026 SRS Digital Library, Barsethi, Jaunpur. All rights reserved.</p>
          <p className="text-sm text-slate-500">Study locally, earn a university degree.</p>
        </div>
      </div>
    </footer>
  );
}
