import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  MessageSquare, Phone, Mail, CheckCircle2, Trash2, X, Search, Download,
} from 'lucide-react';
import { supabase, type Inquiry } from '../../lib/supabase';
import { formatDateTime, downloadCSV } from '../../lib/utils';

export default function AdminInquiries() {
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [deleteItem, setDeleteItem] = useState<Inquiry | null>(null);

  const load = () => {
    setLoading(true);
    supabase.from('inquiries').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setItems(data as Inquiry[] || []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const toggleResolved = async (i: Inquiry) => {
    const { error } = await supabase.from('inquiries').update({ is_resolved: !i.is_resolved }).eq('id', i.id);
    if (error) toast.error(error.message);
    else { toast.success(i.is_resolved ? 'Marked as open' : 'Marked as resolved'); load(); }
  };

  const deleteEntry = async (i: Inquiry) => {
    const { error } = await supabase.from('inquiries').delete().eq('id', i.id);
    if (error) toast.error(error.message);
    else { toast.success('Inquiry deleted'); setDeleteItem(null); load(); }
  };

  const filtered = items.filter((i) => {
    if (filter === 'open' && i.is_resolved) return false;
    if (filter === 'resolved' && !i.is_resolved) return false;
    if (search) {
      const q = search.toLowerCase();
      return i.name.toLowerCase().includes(q) || i.phone.includes(q) || (i.email || '').toLowerCase().includes(q) || i.message.toLowerCase().includes(q);
    }
    return true;
  });

  const exportCSV = () => {
    downloadCSV('inquiries.csv', filtered.map((i) => ({
      Name: i.name, Phone: i.phone, Email: i.email || '', Message: i.message, Resolved: i.is_resolved ? 'Yes' : 'No', Received: i.created_at,
    })));
  };

  const openCount = items.filter((i) => !i.is_resolved).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">Enquiries</h1>
          <p className="text-ink-muted mt-1">{items.length} total · {openCount} open</p>
        </div>
        <button onClick={exportCSV} className="btn-secondary"><Download className="w-4 h-4" /> Export CSV</button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-ink-subtle" />
          <input className="input pl-10" placeholder="Search by name, phone, email, or message" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(['all', 'open', 'resolved'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-primary-800 text-white' : 'bg-white border border-line text-ink-muted hover:bg-slate-50'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="card p-8 text-center text-ink-muted">Loading enquiries…</div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <MessageSquare className="w-12 h-12 mx-auto text-ink-subtle mb-3" />
          <p className="text-ink-muted">No enquiries found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((i) => (
              <motion.div
                key={i.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="card p-5"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-semibold text-ink">{i.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${i.is_resolved ? 'bg-success-light text-success' : 'bg-warning-light text-warning'}`}>
                        {i.is_resolved ? 'Resolved' : 'Open'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 flex-wrap text-sm text-ink-muted">
                      <a href={`tel:${i.phone}`} className="flex items-center gap-1.5 hover:text-primary-700">
                        <Phone className="w-3.5 h-3.5" /> {i.phone}
                      </a>
                      {i.email && (
                        <a href={`mailto:${i.email}`} className="flex items-center gap-1.5 hover:text-primary-700">
                          <Mail className="w-3.5 h-3.5" /> {i.email}
                        </a>
                      )}
                      <span className="text-xs">{formatDateTime(i.created_at)}</span>
                    </div>
                    <p className="text-sm text-ink mt-3 leading-relaxed">{i.message}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a href={`https://wa.me/91${i.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-success-light text-success hover:opacity-80" aria-label="WhatsApp">
                      <MessageSquare className="w-4 h-4" />
                    </a>
                    <button onClick={() => toggleResolved(i)} className={`p-2 rounded-lg hover:opacity-80 ${i.is_resolved ? 'bg-slate-100 text-ink-muted' : 'bg-success-light text-success'}`} aria-label="Toggle resolved">
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteItem(i)} className="p-2 rounded-lg bg-error-light text-error hover:opacity-80" aria-label="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteItem && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 flex items-center justify-center p-4" onClick={() => setDeleteItem(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-lg text-ink">Delete Enquiry?</h3>
              <button onClick={() => setDeleteItem(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-ink-muted">
              Are you sure you want to delete the enquiry from <span className="font-semibold text-ink">{deleteItem.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setDeleteItem(null)} className="btn-ghost">Cancel</button>
              <button onClick={() => deleteEntry(deleteItem)} className="btn-danger ml-auto"><Trash2 className="w-4 h-4" /> Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
