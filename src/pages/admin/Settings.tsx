import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Save, Phone, Mail, MapPin, Armchair, Instagram, Facebook, Youtube,
  MessageCircle, Settings as SettingsIcon, Users, Lock, Plus, Trash2,
  ShieldCheck, ShieldAlert, X, Eye, EyeOff,
} from 'lucide-react';
import {
  supabase, type SiteSettings, type Admin,
  type AdminPermissionKey, type AdminPermissions,
  ALL_ADMIN_PERMISSIONS, PERMISSION_LABELS,
} from '../../lib/supabase';
import { useAdmin } from '../../contexts/AdminContext';

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
        <div className="space-y-6 max-w-3xl">
          <div className="card p-6">
            <h3 className="font-display font-semibold text-lg text-ink mb-5">Change Your Password</h3>
            <ChangePasswordForm />
          </div>
          <AdminManagement />
        </div>
      )}
    </div>
  );
}

// ─── Admin Management ────────────────────────────────────────────────────────

function AdminManagement() {
  const { admin: currentAdmin } = useAdmin();
  const isSuperAdmin = currentAdmin?.role === 'superadmin';

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [permTarget, setPermTarget] = useState<Admin | null>(null);

  const load = async () => {
    setLoadingList(true);
    const { data, error } = await supabase
      .from('admins')
      .select('id, name, email, role, permissions, created_at')
      .order('created_at', { ascending: true });
    if (error) {
      toast.error('Failed to load admins: ' + error.message);
    } else {
      setAdmins((data ?? []) as Admin[]);
    }
    setLoadingList(false);
  };

  useEffect(() => { load(); }, []);

  const deleteAdmin = async (a: Admin) => {
    if (!window.confirm(`Delete admin "${a.name}"? This cannot be undone.`)) return;
    const { error } = await supabase.rpc('delete_admin', { target_id: a.id });
    if (error) { toast.error(error.message); return; }
    toast.success(`${a.name} removed`);
    load();
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-semibold text-lg text-ink">Admin Accounts</h3>
        {isSuperAdmin && (
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" /> Add Admin
          </button>
        )}
      </div>

      {loadingList ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="skeleton h-14 rounded-lg" />)}
        </div>
      ) : admins.length === 0 ? (
        <p className="text-sm text-ink-muted py-4 text-center">No admin accounts found.</p>
      ) : (
        <div className="divide-y divide-line">
          {admins.map((a) => (
            <div key={a.id} className="flex items-center gap-3 py-3">
              <div className={`p-2 rounded-lg ${a.role === 'superadmin' ? 'bg-amber-50' : 'bg-sky-50'}`}>
                {a.role === 'superadmin'
                  ? <ShieldCheck className="w-5 h-5 text-amber-600" />
                  : <ShieldAlert className="w-5 h-5 text-sky-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink text-sm truncate">{a.name}</p>
                <p className="text-ink-muted text-xs truncate">{a.email}</p>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                a.role === 'superadmin' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'
              }`}>
                {a.role === 'superadmin' ? 'Super Admin' : 'Staff'}
              </span>
              {isSuperAdmin && a.role !== 'superadmin' && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPermTarget(a)}
                    title="Manage permissions"
                    className="p-1.5 rounded hover:bg-slate-100 text-ink-muted hover:text-primary-700 transition-colors"
                  >
                    <Lock className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteAdmin(a)}
                    title="Delete admin"
                    className="p-1.5 rounded hover:bg-red-50 text-ink-muted hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAddForm && (
        <AddAdminModal onClose={() => setShowAddForm(false)} onAdded={() => { setShowAddForm(false); load(); }} />
      )}
      {permTarget && (
        <PermissionsModal admin={permTarget} onClose={() => setPermTarget(null)} onSaved={() => { setPermTarget(null); load(); }} />
      )}
    </div>
  );
}

// ─── Add Admin Modal ──────────────────────────────────────────────────────────

function AddAdminModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff' as 'staff' | 'superadmin' });
  const [saving, setSaving] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    if (!form.email.trim()) { toast.error('Email is required'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setSaving(true);
    try {
      const { error } = await supabase.rpc('create_admin', {
        admin_name: form.name.trim(),
        admin_email: form.email.trim(),
        admin_password: form.password,
        admin_role: form.role,
      });
      if (error) throw error;
      toast.success(`Admin "${form.name}" added successfully`);
      onAdded();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h4 className="font-display font-semibold text-ink text-lg">Add New Admin</h4>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-slate-100 text-ink-muted">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input
              className="input"
              placeholder="e.g. Rahul Sharma"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Email Address</label>
            <input
              type="email"
              className="input"
              placeholder="e.g. rahul@library.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                className="input pr-10"
                placeholder="Min 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-3 text-ink-subtle hover:text-ink"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="label">Role</label>
            <select
              className="input"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as 'staff' | 'superadmin' })}
            >
              <option value="staff">Staff</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Adding...' : <><Plus className="w-4 h-4" /> Add Admin</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Permissions Modal ────────────────────────────────────────────────────────

function PermissionsModal({ admin, onClose, onSaved }: { admin: Admin; onClose: () => void; onSaved: () => void }) {
  const [perms, setPerms] = useState<AdminPermissions>(admin.permissions ?? {});
  const [saving, setSaving] = useState(false);

  const toggle = (key: AdminPermissionKey) =>
    setPerms((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.rpc('update_admin_permissions', {
      target_id: admin.id,
      new_permissions: perms,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Permissions updated');
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <div>
            <h4 className="font-display font-semibold text-ink text-lg">Manage Permissions</h4>
            <p className="text-xs text-ink-muted mt-0.5">{admin.name} &middot; {admin.email}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-slate-100 text-ink-muted">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-3">
          {ALL_ADMIN_PERMISSIONS.map((key) => (
            <label key={key} className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-ink">{PERMISSION_LABELS[key]}</span>
              <div
                onClick={() => toggle(key)}
                className={`relative w-10 h-5 rounded-full transition-colors ${perms[key] ? 'bg-primary-600' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${perms[key] ? 'translate-x-5' : ''}`} />
              </div>
            </label>
          ))}
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
            {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Change Password Form ─────────────────────────────────────────────────────

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
      const { data, error } = await supabase.rpc('update_admin_password', { new_password: newPass });
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
