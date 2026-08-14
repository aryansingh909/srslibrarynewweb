import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  UserPlus, Search, Download, Eye, Pencil, Ban, Trash2, X, Filter, KeyRound, RefreshCw,
} from 'lucide-react';
import { supabase, type Member, type Plan } from '../../lib/supabase';
import { formatDate, statusColor, downloadCSV } from '../../lib/utils';
import RenewMembershipModal from '../../components/admin/RenewMembershipModal';

export default function AdminMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [filterShift, setFilterShift] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewMember, setViewMember] = useState<Member | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Member | null>(null);
  const [resetTarget, setResetTarget] = useState<Member | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [renewTarget, setRenewTarget] = useState<Member | null>(null);

  const submitResetPassword = async () => {
    if (!resetTarget) return;
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setResetting(true);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reset-member-password`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ email: resetTarget.email, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to set password');
      toast.success(`Password updated for ${resetTarget.email}`);
      setResetTarget(null);
      setNewPassword('');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setResetting(false);
    }
  };

  const load = () => {
    supabase.from('members').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setMembers(data as Member[] || []); setLoading(false); });
  };

  useEffect(() => {
    load();
    supabase.from('plans').select('*').order('sort_order')
      .then(({ data }) => setPlans(data as Plan[] || []));
  }, []);

  const filtered = useMemo(() => {
    return members.filter((m) => {
      if (search && !`${m.full_name} ${m.email} ${m.phone}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterPlan && m.current_plan_name !== filterPlan) return false;
      if (filterShift && m.current_shift !== filterShift) return false;
      if (filterStatus && m.membership_status !== filterStatus) return false;
      return true;
    });
  }, [members, search, filterPlan, filterShift, filterStatus]);

  const exportCSV = () => {
    downloadCSV('pathshala-members.csv', filtered.map((m, i) => ({
      '#': i + 1,
      Name: m.full_name,
      Phone: m.phone,
      Email: m.email,
      Plan: m.current_plan_name || '',
      Shift: m.current_shift || '',
      Seat: m.seat_number || '',
      Expiry: m.current_expiry_date || '',
      Status: m.membership_status,
    })));
    toast.success('CSV exported');
  };

  const updateStatus = async (m: Member, status: Member['membership_status']) => {
    const { error } = await supabase.from('members').update({ membership_status: status }).eq('id', m.id);
    if (error) toast.error(error.message);
    else { toast.success(`Member ${status}`); load(); setViewMember(null); }
  };

  const renewMembership = async (member: Member, planId: string, shiftName: string, startDate: string) => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) { toast.error('Plan not found'); return; }
    const shift = plan.shifts.find((s) => s.shiftName === shiftName);
    const start = new Date(startDate);
    const expiry = new Date(start);
    expiry.setMonth(expiry.getMonth() + plan.duration_months);
    const { error } = await supabase.from('members').update({
      current_plan_id: plan.id,
      current_plan_name: plan.name,
      current_shift: shiftName,
      current_shift_time: shift?.shiftTime || '',
      current_start_date: startDate,
      current_expiry_date: expiry.toISOString().split('T')[0],
      membership_status: 'active',
    }).eq('id', member.id);
    if (error) toast.error(error.message);
    else { toast.success(`${member.full_name}'s membership renewed`); load(); setRenewTarget(null); setViewMember(null); }
  };

  const deleteMember = async (m: Member) => {
    const { error } = await supabase.from('members').delete().eq('id', m.id);
    if (error) toast.error(error.message);
    else { toast.success('Member deleted'); load(); setConfirmDelete(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">Members</h1>
          <p className="text-ink-muted mt-1">{members.length} total members</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-secondary"><Download className="w-4 h-4" /> Export CSV</button>
          <button onClick={() => setAddOpen(true)} className="btn-primary"><UserPlus className="w-4 h-4" /> Add Member</button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-ink-subtle" />
            <input className="input pl-10" placeholder="Search name, phone, email" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input" value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)}>
            <option value="">All Plans</option>
            {plans.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
          <select className="input" value={filterShift} onChange={(e) => setFilterShift(e.target.value)}>
            <option value="">All Shifts</option>
            <option value="Morning">Morning</option>
            <option value="Evening">Evening</option>
            <option value="Night">Night</option>
            <option value="Full Day">Full Day</option>
          </select>
          <select className="input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-12" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Filter className="w-10 h-10 mx-auto text-ink-subtle mb-3" />
            <p className="text-ink-muted">No members match your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-ink-muted">
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Shift</th>
                  <th className="px-4 py-3 font-medium">Seat</th>
                  <th className="px-4 py-3 font-medium">Expiry</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => (
                  <tr key={m.id} className="border-t border-line hover:bg-slate-50">
                    <td className="px-4 py-3 text-ink-muted">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-ink">{m.full_name}</td>
                    <td className="px-4 py-3 text-ink-muted">{m.phone}</td>
                    <td className="px-4 py-3 text-ink">{m.current_plan_name || '—'}</td>
                    <td className="px-4 py-3 text-ink">{m.current_shift || '—'}</td>
                    <td className="px-4 py-3 text-ink">{m.seat_number || '—'}</td>
                    <td className="px-4 py-3 text-ink-muted">{formatDate(m.current_expiry_date)}</td>
                    <td className="px-4 py-3"><span className={`badge ${statusColor(m.membership_status)}`}>{m.membership_status}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setViewMember(m)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-700" aria-label="View"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => setEditMember(m)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-700" aria-label="Edit"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setRenewTarget(m)} className="p-1.5 rounded-lg hover:bg-success-light text-success" aria-label="Renew Membership" title="Renew Membership"><RefreshCw className="w-4 h-4" /></button>
                        <button onClick={() => setResetTarget(m)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-700" aria-label="Set Password"><KeyRound className="w-4 h-4" /></button>
                        <button onClick={() => updateStatus(m, m.membership_status === 'suspended' ? 'active' : 'suspended')} className="p-1.5 rounded-lg hover:bg-warning-light text-warning" aria-label="Suspend"><Ban className="w-4 h-4" /></button>
                        <button onClick={() => setConfirmDelete(m)} className="p-1.5 rounded-lg hover:bg-error-light text-error" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View modal */}
      <AnimatePresence>
        {viewMember && (
          <Modal onClose={() => setViewMember(null)} title="Member Details">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Name" value={viewMember.full_name} />
                <Field label="Phone" value={viewMember.phone} />
                <Field label="Email" value={viewMember.email} />
                <Field label="ID Proof" value={`${viewMember.id_proof_type || ''} ${viewMember.id_proof_number || ''}`} />
                <Field label="Plan" value={viewMember.current_plan_name || '—'} />
                <Field label="Shift" value={viewMember.current_shift ? `${viewMember.current_shift} (${viewMember.current_shift_time})` : '—'} />
                <Field label="Seat" value={viewMember.seat_number || 'Not assigned'} />
                <Field label="Status" value={viewMember.membership_status} />
                <Field label="Start Date" value={formatDate(viewMember.current_start_date)} />
                <Field label="Expiry Date" value={formatDate(viewMember.current_expiry_date)} />
              </div>
              <Field label="Address" value={viewMember.address || '—'} />
              <div className="flex gap-2 pt-3 border-t border-line">
                <button onClick={() => setRenewTarget(viewMember)} className="btn-secondary"><RefreshCw className="w-4 h-4" /> Renew Membership</button>
                <button onClick={() => setResetTarget(viewMember)} className="btn-secondary"><KeyRound className="w-4 h-4" /> Set Password</button>
                <button onClick={() => updateStatus(viewMember, 'suspended')} className="btn-secondary"><Ban className="w-4 h-4" /> Suspend</button>
                <button onClick={() => { setEditMember(viewMember); setViewMember(null); }} className="btn-secondary"><Pencil className="w-4 h-4" /> Edit</button>
                <button onClick={() => { setConfirmDelete(viewMember); setViewMember(null); }} className="btn-danger ml-auto"><Trash2 className="w-4 h-4" /> Delete</button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Add/Edit modal */}
      <AnimatePresence>
        {(addOpen || editMember) && (
          <MemberForm
            member={editMember}
            plans={plans}
            onClose={() => { setAddOpen(false); setEditMember(null); }}
            onSaved={() => { load(); setAddOpen(false); setEditMember(null); }}
          />
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {confirmDelete && (
          <Modal onClose={() => setConfirmDelete(null)} title="Delete Member?">
            <p className="text-sm text-ink-muted">Are you sure you want to delete <span className="font-semibold text-ink">{confirmDelete.full_name}</span>? This action cannot be undone.</p>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setConfirmDelete(null)} className="btn-ghost">Cancel</button>
              <button onClick={() => deleteMember(confirmDelete)} className="btn-danger"><Trash2 className="w-4 h-4" /> Delete</button>
            </div>
          </Modal>
        )}

        {renewTarget && (
          <RenewMembershipModal
            member={renewTarget}
            plans={plans}
            onClose={() => setRenewTarget(null)}
            onRenew={(planId, shiftName, startDate) => renewMembership(renewTarget, planId, shiftName, startDate)}
          />
        )}

        {resetTarget && (
          <Modal onClose={() => { setResetTarget(null); setNewPassword(''); }} title="Set Temporary Password">
            <p className="text-sm text-ink-muted mb-4">
              Set a new password for <span className="font-semibold text-ink">{resetTarget.full_name}</span> ({resetTarget.email}). The member can use this to sign in and should change it later.
            </p>
            <label className="label">New Password</label>
            <input
              type="text"
              className="input"
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2 mt-6">
              <button onClick={() => { setResetTarget(null); setNewPassword(''); }} className="btn-ghost">Cancel</button>
              <button onClick={submitResetPassword} disabled={resetting || newPassword.length < 6} className="btn-primary ml-auto">
                {resetting ? 'Updating...' : 'Set Password'}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function Modal({ children, title, onClose }: { children: React.ReactNode; title: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-navy-950/60 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-lg text-ink">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-ink-muted mb-0.5">{label}</p>
      <p className="text-sm font-medium text-ink">{value}</p>
    </div>
  );
}

function MemberForm({ member, plans, onClose, onSaved }: { member: Member | null; plans: Plan[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    full_name: member?.full_name || '',
    email: member?.email || '',
    phone: member?.phone || '',
    address: member?.address || '',
    id_proof_type: member?.id_proof_type || 'Aadhaar',
    id_proof_number: member?.id_proof_number || '',
    current_plan_name: member?.current_plan_name || plans[0]?.name || '',
    current_shift: member?.current_shift || 'Morning',
    seat_number: member?.seat_number || '',
    membership_status: member?.membership_status || 'pending',
    current_start_date: member?.current_start_date || new Date().toISOString().split('T')[0],
  });
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const plan = plans.find((p) => p.name === form.current_plan_name);
      const shift = plan?.shifts.find((s) => s.shiftName === form.current_shift);
      const start = new Date(form.current_start_date);
      const expiry = new Date(start);
      if (plan) expiry.setMonth(expiry.getMonth() + plan.duration_months);

      const payload = {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        address: form.address || null,
        id_proof_type: form.id_proof_type,
        id_proof_number: form.id_proof_number,
        current_plan_id: plan?.id || null,
        current_plan_name: form.current_plan_name,
        current_shift: form.current_shift,
        current_shift_time: shift?.shiftTime || '',
        current_start_date: form.current_start_date,
        current_expiry_date: expiry.toISOString().split('T')[0],
        seat_number: form.seat_number || null,
        membership_status: form.membership_status,
      };

      if (member) {
        const { error } = await supabase.from('members').update(payload).eq('id', member.id);
        if (error) throw error;
        toast.success('Member updated');
      } else {
        const { error } = await supabase.from('members').insert(payload);
        if (error) throw error;
        toast.success('Member added');
      }
      onSaved();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose} title={member ? 'Edit Member' : 'Add Member'}>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="label">Full Name *</label>
            <input required className="input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div>
            <label className="label">Phone *</label>
            <input required className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="label">Email *</label>
            <input required type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Plan</label>
            <select className="input" value={form.current_plan_name} onChange={(e) => setForm({ ...form, current_plan_name: e.target.value })}>
              {plans.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Shift</label>
            <select className="input" value={form.current_shift} onChange={(e) => setForm({ ...form, current_shift: e.target.value })}>
              <option>Morning</option><option>Evening</option><option>Night</option><option>Full Day</option>
            </select>
          </div>
          <div>
            <label className="label">Seat Number</label>
            <input className="input" value={form.seat_number} onChange={(e) => setForm({ ...form, seat_number: e.target.value })} placeholder="e.g. A12" />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.membership_status} onChange={(e) => setForm({ ...form, membership_status: e.target.value as Member['membership_status'] })}>
              <option value="pending">Pending</option><option value="active">Active</option><option value="expired">Expired</option><option value="suspended">Suspended</option>
            </select>
          </div>
          <div>
            <label className="label">Start Date</label>
            <input type="date" className="input" value={form.current_start_date} onChange={(e) => setForm({ ...form, current_start_date: e.target.value })} />
          </div>
          <div>
            <label className="label">ID Proof Type</label>
            <select className="input" value={form.id_proof_type} onChange={(e) => setForm({ ...form, id_proof_type: e.target.value })}>
              <option>Aadhaar</option><option>Student ID</option><option>PAN</option><option>Driving License</option>
            </select>
          </div>
          <div>
            <label className="label">ID Proof Number</label>
            <input className="input" value={form.id_proof_number} onChange={(e) => setForm({ ...form, id_proof_number: e.target.value })} />
          </div>
          <div className="col-span-2">
            <label className="label">Address</label>
            <textarea className="input" rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary ml-auto">
            {saving ? 'Saving...' : member ? 'Save Changes' : 'Add Member'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
