import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Save, Phone, Mail, MapPin, Armchair, Instagram, Facebook, Youtube, MessageCircle, Settings as SettingsIcon, Users, Lock } from 'lucide-react';
import { supabase, type SiteSettings } from '../../lib/supabase';

type Tab = 'general' | 'social' | 'admins';

export default function AdminSettings() {
  const [tab, setTab] = useState<Tab>('general');
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('site_settings').select('*').eq('id', 1).maybeSingle()
      .then(({ data }) => setSettings(data as SiteSettings));
  }, []);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('site_settings').update({
        library_name: settings.library_name,
        library_phone: settings.library_phone,
        library_email: settings.library_email,
        library_address: settings.library_address,
        total_seats: settings.total_seats,
        seats_morning: settings.seats_morning,
        seats_evening: settings.seats_evening,
        seats_night: settings.seats_night,
        seats_fullday: settings.seats_fullday,
        instagram_url: settings.instagram_url,
        facebook_url: settings.facebook_url,
        youtube_url: settings.youtube_url,
        whatsapp_number: settings.whatsapp_number,
      }).eq('id', 1);
      if (error) throw error;
      toast.success('Settings saved');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) {
    return <div className="skeleton h-96" />;
  }

  const tabs = [
    { key: 'general' as const, label: 'General', icon: SettingsIcon },
    { key: 'social' as const, label: 'Social Media', icon: Instagram },
    { key: 'admins' as const, label: 'Admin Accounts', icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">Settings</h1>
        <p className="text-ink-muted mt-1">Manage library information and configuration.</p>
      </div>

      <div className="flex gap-2 border-b border-line overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              tab === t.key ? 'border-primary-600 text-primary-800' : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'general' && (
        <div className="card p-6 max-w-3xl">
          <h3 className="font-display font-semibold text-lg text-ink mb-5">General Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Library Name</label>
              <input className="input" value={settings.library_name} onChange={(e) => setSettings({ ...settings, library_name: e.target.value })} />
            </div>
            <div>
              <label className="label">Phone</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-ink-subtle" />
                <input className="input pl-10" value={settings.library_phone} onChange={(e) => setSettings({ ...settings, library_phone: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-ink-subtle" />
                <input className="input pl-10" value={settings.library_email} onChange={(e) => setSettings({ ...settings, library_email: e.target.value })} />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="label">Address</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-ink-subtle" />
                <textarea className="input pl-10" rows={2} value={settings.library_address} onChange={(e) => setSettings({ ...settings, library_address: e.target.value })} />
              </div>
            </div>
          </div>

          <h4 className="font-display font-semibold text-ink mt-8 mb-4 flex items-center gap-2">
            <Armchair className="w-5 h-5 text-primary-700" /> Seat Configuration
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="label">Total Seats</label>
              <input type="number" className="input" value={settings.total_seats} onChange={(e) => setSettings({ ...settings, total_seats: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label">Morning</label>
              <input type="number" className="input" value={settings.seats_morning} onChange={(e) => setSettings({ ...settings, seats_morning: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label">Evening</label>
              <input type="number" className="input" value={settings.seats_evening} onChange={(e) => setSettings({ ...settings, seats_evening: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label">Night</label>
              <input type="number" className="input" value={settings.seats_night} onChange={(e) => setSettings({ ...settings, seats_night: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label">Full Day</label>
              <input type="number" className="input" value={settings.seats_fullday} onChange={(e) => setSettings({ ...settings, seats_fullday: Number(e.target.value) })} />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button onClick={save} disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Settings</>}
            </button>
          </div>
        </div>
      )}

      {tab === 'social' && (
        <div className="card p-6 max-w-3xl">
          <h3 className="font-display font-semibold text-lg text-ink mb-5">Social Media Links</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Instagram URL</label>
              <div className="relative">
                <Instagram className="w-4 h-4 absolute left-3 top-3 text-ink-subtle" />
                <input className="input pl-10" value={settings.instagram_url || ''} onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })} placeholder="https://instagram.com/..." />
              </div>
            </div>
            <div>
              <label className="label">Facebook URL</label>
              <div className="relative">
                <Facebook className="w-4 h-4 absolute left-3 top-3 text-ink-subtle" />
                <input className="input pl-10" value={settings.facebook_url || ''} onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })} placeholder="https://facebook.com/..." />
              </div>
            </div>
            <div>
              <label className="label">YouTube URL</label>
              <div className="relative">
                <Youtube className="w-4 h-4 absolute left-3 top-3 text-ink-subtle" />
                <input className="input pl-10" value={settings.youtube_url || ''} onChange={(e) => setSettings({ ...settings, youtube_url: e.target.value })} placeholder="https://youtube.com/..." />
              </div>
            </div>
            <div>
              <label className="label">WhatsApp Number (with country code)</label>
              <div className="relative">
                <MessageCircle className="w-4 h-4 absolute left-3 top-3 text-ink-subtle" />
                <input className="input pl-10" value={settings.whatsapp_number || ''} onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })} placeholder="919800550047" />
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button onClick={save} disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Settings</>}
            </button>
          </div>
        </div>
      )}

      {tab === 'admins' && (
        <div className="space-y-6">
          <div className="card p-6 max-w-3xl">
            <h3 className="font-display font-semibold text-lg text-ink mb-5">Change Your Password</h3>
            <ChangePasswordForm />
          </div>
          <div className="card p-6 max-w-3xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-lg text-ink">Admin Accounts</h3>
              <button className="btn-primary"><Users className="w-4 h-4" /> Add New Admin</button>
            </div>
            <p className="text-sm text-ink-muted">
              Admin accounts are managed securely. The default super admin is <span className="font-mono font-semibold text-ink">admin@pathshaalalibrary.com</span>. To add more admin accounts or change roles, contact your database administrator.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function ChangePasswordForm() {
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirm) { toast.error('Passwords do not match'); return; }
    if (newPass.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setSaving(true);
    try {
      const { data, error } = await supabase.rpc('update_admin_password', {
        new_password: newPass,
      });
      if (error) throw error;
      if (!data) throw new Error('Failed to update password');
      toast.success('Password updated');
      setNewPass(''); setConfirm('');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 max-w-md">
      <div>
        <label className="label">New Password</label>
        <div className="relative">
          <Lock className="w-4 h-4 absolute left-3 top-3 text-ink-subtle" />
          <input type="password" className="input pl-10" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="Min 8 characters" />
        </div>
      </div>
      <div>
        <label className="label">Confirm New Password</label>
        <div className="relative">
          <Lock className="w-4 h-4 absolute left-3 top-3 text-ink-subtle" />
          <input type="password" className="input pl-10" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter password" />
        </div>
      </div>
      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? 'Updating...' : <><Lock className="w-4 h-4" /> Update Password</>}
      </button>
    </form>
  );
}
