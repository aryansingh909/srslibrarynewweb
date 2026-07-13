import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Plus, Pencil, Eye, Pin, PinOff, Trash2, X, Megaphone, Bell, Calendar, PartyPopper, AlertTriangle,
} from 'lucide-react';
import { supabase, type Announcement } from '../../lib/supabase';
import { formatDateTime } from '../../lib/utils';

const categories = [
  { key: 'notice', label: 'Notice', icon: Bell, color: 'bg-primary-50 text-primary-700' },
  { key: 'holiday', label: 'Holiday', icon: Calendar, color: 'bg-warning-light text-warning' },
  { key: 'event', label: 'Event', icon: PartyPopper, color: 'bg-success-light text-success' },
  { key: 'urgent', label: 'Urgent', icon: AlertTriangle, color: 'bg-error-light text-error' },
] as const;

export default function AdminAnnouncements() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState<Announcement | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [preview, setPreview] = useState<Announcement | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Announcement | null>(null);

  const load = () => {
    supabase.from('announcements').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setItems(data as Announcement[] || []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const togglePublished = async (a: Announcement) => {
    const { error } = await supabase.from('announcements').update({
      is_published: !a.is_published,
      published_at: !a.is_published ? new Date().toISOString() : a.published_at,
    }).eq('id', a.id);
    if (error) toast.error(error.message);
    else { toast.success(a.is_published ? 'Unpublished' : 'Published'); load(); }
  };

  const togglePinned = async (a: Announcement) => {
    const { error } = await supabase.from('announcements').update({ is_pinned: !a.is_pinned }).eq('id', a.id);
    if (error) toast.error(error.message);
    else { toast.success(a.is_pinned ? 'Unpinned' : 'Pinned'); load(); }
  };

  const deleteItem = async (a: Announcement) => {
    const { error } = await supabase.from('announcements').delete().eq('id', a.id);
    if (error) toast.error(error.message);
    else { toast.success('Announcement deleted'); setConfirmDelete(null); load(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">Announcements</h1>
          <p className="text-ink-muted mt-1">{items.length} total announcements</p>
        </div>
        <button onClick={() => { setEditItem(null); setFormOpen(true); }} className="btn-primary"><Plus className="w-4 h-4" /> New Announcement</button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-16" />)}</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <Megaphone className="w-10 h-10 mx-auto text-ink-subtle mb-3" />
            <p className="text-ink-muted">No announcements yet. Create your first one!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-ink-muted">
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Published</th>
                  <th className="px-4 py-3 font-medium">Pinned</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((a) => {
                  const cat = categories.find((c) => c.key === a.category)!;
                  return (
                    <tr key={a.id} className="border-t border-line hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-ink">{a.title}</td>
                      <td className="px-4 py-3"><span className={`badge ${cat.color}`}><cat.icon className="w-3.5 h-3.5" /> {cat.label}</span></td>
                      <td className="px-4 py-3">
                        <span className={`badge ${a.is_published ? 'bg-success-light text-success' : 'bg-slate-100 text-ink-muted'}`}>{a.is_published ? 'Published' : 'Draft'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${a.is_pinned ? 'bg-primary-50 text-primary-700' : 'bg-slate-100 text-ink-muted'}`}>{a.is_pinned ? 'Pinned' : 'No'}</span>
                      </td>
                      <td className="px-4 py-3 text-ink-muted">{formatDateTime(a.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => setPreview(a)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-700" aria-label="Preview"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => { setEditItem(a); setFormOpen(true); }} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-700" aria-label="Edit"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => togglePublished(a)} className="p-1.5 rounded-lg hover:bg-slate-100 text-ink-muted" aria-label="Toggle publish">{a.is_published ? <Eye className="w-4 h-4" /> : <Megaphone className="w-4 h-4" />}</button>
                          <button onClick={() => togglePinned(a)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-700" aria-label="Toggle pin">{a.is_pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}</button>
                          <button onClick={() => setConfirmDelete(a)} className="p-1.5 rounded-lg hover:bg-error-light text-error" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form modal */}
      <AnimatePresence>
        {formOpen && (
          <AnnouncementForm
            item={editItem}
            onClose={() => { setFormOpen(false); setEditItem(null); }}
            onSaved={() => { load(); setFormOpen(false); setEditItem(null); }}
          />
        )}
      </AnimatePresence>

      {/* Preview modal */}
      <AnimatePresence>
        {preview && (
          <div className="fixed inset-0 z-50 bg-navy-950/60 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-lg text-ink">Preview</h3>
                <button onClick={() => setPreview(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
              </div>
              <h2 className="font-display font-bold text-xl text-ink mb-2">{preview.title}</h2>
              <p className="text-sm text-ink-muted whitespace-pre-line">{preview.body}</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-50 bg-navy-950/60 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-display font-semibold text-lg text-ink mb-2">Delete Announcement?</h3>
              <p className="text-sm text-ink-muted">Are you sure you want to delete "{confirmDelete.title}"? This cannot be undone.</p>
              <div className="flex gap-2 mt-6">
                <button onClick={() => setConfirmDelete(null)} className="btn-ghost">Cancel</button>
                <button onClick={() => deleteItem(confirmDelete)} className="btn-danger ml-auto"><Trash2 className="w-4 h-4" /> Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AnnouncementForm({ item, onClose, onSaved }: { item: Announcement | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    title: item?.title || '',
    body: item?.body || '',
    category: item?.category || 'notice',
    is_pinned: item?.is_pinned || false,
    is_published: item?.is_published || false,
  });
  const [saving, setSaving] = useState(false);

  const submit = async (publish: boolean) => {
    if (!form.title.trim() || !form.body.trim()) {
      toast.error('Title and body are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        body: form.body,
        category: form.category,
        is_pinned: form.is_pinned,
        is_published: publish,
        published_at: publish ? (item?.published_at || new Date().toISOString()) : null,
      };
      if (item) {
        const { error } = await supabase.from('announcements').update(payload).eq('id', item.id);
        if (error) throw error;
        toast.success('Announcement updated');
      } else {
        const { error } = await supabase.from('announcements').insert(payload);
        if (error) throw error;
        toast.success(publish ? 'Announcement published' : 'Draft saved');
      }
      onSaved();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/60 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-lg text-ink">{item ? 'Edit Announcement' : 'New Announcement'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="label">Title *</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Announcement title" />
          </div>
          <div>
            <label className="label">Body *</label>
            <textarea className="input" rows={6} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Write your announcement..." />
            <p className="text-xs text-ink-subtle mt-1">Line breaks are preserved.</p>
          </div>
          <div>
            <label className="label">Category *</label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map((c) => (
                <button key={c.key} onClick={() => setForm({ ...form, category: c.key })} className={`p-3 rounded-xl border-2 text-xs font-semibold flex flex-col items-center gap-1 ${form.category === c.key ? 'border-primary-600 bg-primary-50' : 'border-line'}`}>
                  <c.icon className="w-4 h-4" /> {c.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_pinned} onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })} className="w-4 h-4 rounded" />
              <span className="text-sm font-medium text-ink">Pin to top</span>
            </label>
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={() => submit(false)} disabled={saving} className="btn-secondary ml-auto">Save Draft</button>
          <button onClick={() => submit(true)} disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Publish Now'}</button>
        </div>
      </motion.div>
    </div>
  );
}
