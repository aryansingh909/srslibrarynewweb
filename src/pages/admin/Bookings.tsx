import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Check, X, Eye, MessageCircle, List, Calendar, Filter, CheckCheck, XCircle, UserPlus, AlertTriangle,
} from 'lucide-react';
import { supabase, type Booking } from '../../lib/supabase';
import { formatINR, formatDate, statusColor } from '../../lib/utils';

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterShift, setFilterShift] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [viewBooking, setViewBooking] = useState<Booking | null>(null);
  const [confirmBooking, setConfirmBooking] = useState<Booking | null>(null);
  const [rejectBooking, setRejectBooking] = useState<Booking | null>(null);
  const [fixUserBooking, setFixUserBooking] = useState<Booking | null>(null);

  const load = () => {
    supabase.from('bookings').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setBookings(data as Booking[] || []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (filterStatus && b.status !== filterStatus) return false;
      if (filterShift && b.shift !== filterShift) return false;
      return true;
    });
  }, [bookings, filterStatus, filterShift]);

  const toggleSelect = (id: string) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const bulkConfirm = async () => {
    const ids = Array.from(selected);
    const { error } = await supabase.from('bookings').update({ status: 'confirmed' }).in('id', ids);
    if (error) toast.error(error.message);
    else {
      // Update member records and confirm emails for all selected bookings
      const selectedBookings = bookings.filter((b) => ids.includes(b.id));
      for (const b of selectedBookings) {
        if (b.member_id) {
          await supabase.from('members').update({
            membership_status: 'active',
            current_start_date: b.start_date,
            current_expiry_date: b.expiry_date,
            current_plan_name: b.plan_name,
            current_shift: b.shift,
            current_shift_time: b.shift_time,
          }).eq('id', b.member_id);
        }
        if (b.user_id) {
          try {
            const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/confirm-user-email`;
            await fetch(functionUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              },
              body: JSON.stringify({ user_id: b.user_id }),
            });
          } catch (e) {
            console.error('Failed to confirm email:', e);
          }
        }
      }
      toast.success(`${ids.length} bookings confirmed`);
      setSelected(new Set());
      load();
    }
  };

  const bulkReject = async () => {
    const ids = Array.from(selected);
    const { error } = await supabase.from('bookings').update({ status: 'rejected' }).in('id', ids);
    if (error) toast.error(error.message);
    else { toast.success(`${ids.length} bookings rejected`); setSelected(new Set()); load(); }
  };

  const confirmSingle = async (seat: string) => {
    if (!confirmBooking) return;

    // Step 1: Update booking status
    const { error } = await supabase.from('bookings').update({
      status: 'confirmed',
      seat_number: seat || null,
    }).eq('id', confirmBooking.id);
    if (error) { toast.error(error.message); return; }

    // Step 2: Update member record if linked
    if (confirmBooking.member_id) {
      await supabase.from('members').update({
        membership_status: 'active',
        seat_number: seat || null,
        current_start_date: confirmBooking.start_date,
        current_expiry_date: confirmBooking.expiry_date,
        current_plan_name: confirmBooking.plan_name,
        current_shift: confirmBooking.shift,
        current_shift_time: confirmBooking.shift_time,
      }).eq('id', confirmBooking.member_id);
    }

    // Step 3: Confirm user email so they can login immediately
    if (confirmBooking.user_id) {
      try {
        const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/confirm-user-email`;
        await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ user_id: confirmBooking.user_id }),
        });
      } catch (e) {
        console.error('Failed to confirm email:', e);
        // Don't fail the whole operation - email confirmation is optional
      }
    }

    toast.success('Booking confirmed');
    setConfirmBooking(null);
    load();
  };

  const rejectSingle = async (reason: string) => {
    if (!rejectBooking) return;
    const { error } = await supabase.from('bookings').update({
      status: 'rejected',
      admin_notes: reason,
    }).eq('id', rejectBooking.id);
    if (error) toast.error(error.message);
    else { toast.success('Booking rejected'); setRejectBooking(null); load(); }
  };

  const fixMissingUser = async (password: string) => {
    if (!fixUserBooking || !fixUserBooking.member_email) return;

    try {
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fix-missing-users`;
      const res = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          booking_id: fixUserBooking.booking_id,
          email: fixUserBooking.member_email,
          password: password || undefined,
          member_name: fixUserBooking.member_name,
          phone: fixUserBooking.member_phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to create account');
        return;
      }
      toast.success(data.message || 'Account created! User can now login.');
      setFixUserBooking(null);
      load();
    } catch (e) {
      toast.error((e as Error).message || 'Failed to create account');
    }
  };

  const waLink = (b: Booking, confirmed: boolean) => {
    const msg = confirmed
      ? `Hi ${b.member_name}, your booking ${b.booking_id} at SRS Digital Library is confirmed. Seat: ${b.seat_number || 'TBD'}. Plan: ${b.plan_name} (${b.shift}). Start: ${formatDate(b.start_date)}. Expiry: ${formatDate(b.expiry_date)}. Thank you!`
      : `Hi ${b.member_name}, your booking ${b.booking_id} at SRS Digital Library is pending confirmation. Our staff will contact you shortly. Thank you for choosing SRS Digital Library!`;
    return `https://wa.me/91${b.member_phone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">Bookings</h1>
          <p className="text-ink-muted mt-1">{bookings.length} total bookings</p>
        </div>
        <div className="inline-flex bg-white rounded-xl border border-line p-1">
          <button onClick={() => setView('list')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${view === 'list' ? 'bg-primary-800 text-white' : 'text-ink-muted'}`}>
            <List className="w-4 h-4" /> List
          </button>
          <button onClick={() => setView('calendar')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${view === 'calendar' ? 'bg-primary-800 text-white' : 'text-ink-muted'}`}>
            <Calendar className="w-4 h-4" /> Calendar
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <select className="input max-w-48" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select className="input max-w-48" value={filterShift} onChange={(e) => setFilterShift(e.target.value)}>
          <option value="">All Shifts</option>
          <option value="Morning">Morning</option>
          <option value="Evening">Evening</option>
          <option value="Night">Night</option>
          <option value="Full Day">Full Day</option>
        </select>
        {selected.size > 0 && (
          <div className="flex gap-2 ml-auto">
            <button onClick={bulkConfirm} className="btn-success"><CheckCheck className="w-4 h-4" /> Confirm All ({selected.size})</button>
            <button onClick={bulkReject} className="btn-danger"><XCircle className="w-4 h-4" /> Reject All</button>
          </div>
        )}
      </div>

      {view === 'list' ? (
        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-12" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Filter className="w-10 h-10 mx-auto text-ink-subtle mb-3" />
              <p className="text-ink-muted">No bookings found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-left text-ink-muted">
                    <th className="px-4 py-3 font-medium w-10"><input type="checkbox" onChange={(e) => setSelected(e.target.checked ? new Set(filtered.map((b) => b.id)) : new Set())} className="rounded" /></th>
                    <th className="px-4 py-3 font-medium">Booking ID</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Phone</th>
                    <th className="px-4 py-3 font-medium">Plan</th>
                    <th className="px-4 py-3 font-medium">Shift</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Start</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => (
                    <tr key={b.id} className="border-t border-line hover:bg-slate-50">
                      <td className="px-4 py-3"><input type="checkbox" checked={selected.has(b.id)} onChange={() => toggleSelect(b.id)} className="rounded" /></td>
                      <td className="px-4 py-3 font-mono text-xs text-ink">{b.booking_id}{!b.user_id && <span className="ml-1 text-warning" title="No login account"><AlertTriangle className="w-3 h-3 inline" /></span>}</td>
                      <td className="px-4 py-3 font-medium text-ink">{b.member_name}</td>
                      <td className="px-4 py-3 text-ink-muted">{b.member_phone}</td>
                      <td className="px-4 py-3 text-ink">{b.plan_name}</td>
                      <td className="px-4 py-3 text-ink">{b.shift}</td>
                      <td className="px-4 py-3 text-ink">{formatINR(b.amount)}</td>
                      <td className="px-4 py-3 text-ink-muted">{formatDate(b.start_date)}</td>
                      <td className="px-4 py-3"><span className={`badge ${statusColor(b.status)}`}>{b.status}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => setViewBooking(b)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-700" aria-label="View"><Eye className="w-4 h-4" /></button>
                          {b.status === 'pending' && (
                            <>
                              <button onClick={() => setConfirmBooking(b)} className="p-1.5 rounded-lg hover:bg-success-light text-success" aria-label="Confirm"><Check className="w-4 h-4" /></button>
                              <button onClick={() => setRejectBooking(b)} className="p-1.5 rounded-lg hover:bg-error-light text-error" aria-label="Reject"><X className="w-4 h-4" /></button>
                            </>
                          )}
                          {!b.user_id && (
                            <button onClick={() => setFixUserBooking(b)} className="p-1.5 rounded-lg hover:bg-warning-light text-warning" aria-label="Fix Account" title="Create login account">
                              <UserPlus className="w-4 h-4" />
                            </button>
                          )}
                          <a href={waLink(b, b.status === 'confirmed')} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg hover:bg-success-light text-success" aria-label="WhatsApp"><MessageCircle className="w-4 h-4" /></a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <CalendarView bookings={filtered} />
      )}

      {/* View modal */}
      <AnimatePresence>
        {viewBooking && (
          <Modal onClose={() => setViewBooking(null)} title={`Booking ${viewBooking.booking_id}`}>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Info label="Name" value={viewBooking.member_name} />
                <Info label="Phone" value={viewBooking.member_phone} />
                <Info label="Email" value={viewBooking.member_email || '—'} />
                <Info label="Plan" value={viewBooking.plan_name} />
                <Info label="Shift" value={`${viewBooking.shift} (${viewBooking.shift_time})`} />
                <Info label="Amount" value={formatINR(viewBooking.amount)} />
                <Info label="Start" value={formatDate(viewBooking.start_date)} />
                <Info label="Expiry" value={formatDate(viewBooking.expiry_date)} />
                <Info label="Seat" value={viewBooking.seat_number || 'Not assigned'} />
                <Info label="Payment" value={`${viewBooking.payment_status} (${viewBooking.payment_mode})`} />
                <Info label="Paid" value={formatINR(viewBooking.paid_amount)} />
                <Info label="Due" value={formatINR(viewBooking.due_amount)} />
              </div>
              <Info label="ID Proof" value={`${viewBooking.id_proof_type || ''} ${viewBooking.id_proof_number || ''}`} />
              {viewBooking.address && <Info label="Address" value={viewBooking.address} />}
              {viewBooking.admin_notes && <Info label="Admin Notes" value={viewBooking.admin_notes} />}
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Confirm modal */}
      <AnimatePresence>
        {confirmBooking && (
          <ConfirmModal booking={confirmBooking} onClose={() => setConfirmBooking(null)} onConfirm={confirmSingle} />
        )}
      </AnimatePresence>

      {/* Reject modal */}
      <AnimatePresence>
        {rejectBooking && (
          <RejectModal booking={rejectBooking} onClose={() => setRejectBooking(null)} onReject={rejectSingle} />
        )}
      </AnimatePresence>

      {/* Fix user modal */}
      <AnimatePresence>
        {fixUserBooking && (
          <FixUserModal
            booking={fixUserBooking}
            onClose={() => setFixUserBooking(null)}
            onFix={fixMissingUser}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Modal({ children, title, onClose }: { children: React.ReactNode; title: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-navy-950/60 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-lg text-ink">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-ink-muted mb-0.5">{label}</p><p className="text-sm font-medium text-ink">{value}</p></div>;
}

function ConfirmModal({ booking, onClose, onConfirm }: { booking: Booking; onClose: () => void; onConfirm: (seat: string) => void }) {
  const [seat, setSeat] = useState(booking.seat_number || '');
  return (
    <Modal onClose={onClose} title="Confirm Booking">
      <p className="text-sm text-ink-muted mb-4">Assign a seat number to confirm <span className="font-semibold text-ink">{booking.member_name}</span>'s booking.</p>
      <label className="label">Seat Number</label>
      <input className="input" value={seat} onChange={(e) => setSeat(e.target.value)} placeholder="e.g. A12" autoFocus />
      <div className="flex gap-2 mt-6">
        <button onClick={onClose} className="btn-ghost">Cancel</button>
        <button onClick={() => onConfirm(seat)} className="btn-success"><Check className="w-4 h-4" /> Confirm Booking</button>
      </div>
    </Modal>
  );
}

function RejectModal({ booking, onClose, onReject }: { booking: Booking; onClose: () => void; onReject: (reason: string) => void }) {
  const [reason, setReason] = useState('');
  return (
    <Modal onClose={onClose} title="Reject Booking">
      <p className="text-sm text-ink-muted mb-4">Provide a reason for rejecting <span className="font-semibold text-ink">{booking.member_name}</span>'s booking.</p>
      <label className="label">Reason</label>
      <textarea className="input" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. All seats full for this shift" />
      <div className="flex gap-2 mt-6">
        <button onClick={onClose} className="btn-ghost">Cancel</button>
        <button onClick={() => onReject(reason)} className="btn-danger"><X className="w-4 h-4" /> Reject Booking</button>
      </div>
    </Modal>
  );
}

function FixUserModal({ booking, onClose, onFix }: { booking: Booking; onClose: () => void; onFix: (password: string) => void }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const passwordsMatch = password === confirmPassword;
  const passwordValid = password === '' || (password.length >= 6 && passwordsMatch);
  return (
    <Modal onClose={onClose} title="Create Login Account">
      <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-warning-light border border-warning">
        <AlertTriangle className="w-5 h-5 text-warning" />
        <p className="text-sm text-ink">This booking has no login account. Create one so the user can log in.</p>
      </div>
      <div className="space-y-3 text-sm">
        <p><span className="text-ink-muted">Name:</span> <span className="font-medium text-ink">{booking.member_name}</span></p>
        <p><span className="text-ink-muted">Email:</span> <span className="font-medium text-ink">{booking.member_email}</span></p>
      </div>
      <div className="mt-4 space-y-3">
        <div>
          <label className="label">Password (optional - if empty, user will set via email)</label>
          <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters, or leave empty" />
        </div>
        {password && (
          <div>
            <label className="label">Confirm Password</label>
            <input type="password" className="input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" />
            {!passwordsMatch && <p className="text-xs text-error mt-1">Passwords do not match</p>}
          </div>
        )}
      </div>
      <div className="flex gap-2 mt-6">
        <button onClick={onClose} className="btn-ghost">Cancel</button>
        <button onClick={() => { setLoading(true); onFix(password); }} disabled={!passwordValid || loading} className="btn-primary">
          {loading ? 'Creating...' : <><UserPlus className="w-4 h-4" /> Create Account</>}
        </button>
      </div>
    </Modal>
  );
}

function CalendarView({ bookings }: { bookings: Booking[] }) {
  const [month, setMonth] = useState(new Date());
  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const startDay = first.getDay();
    const total = last.getDate();
    const arr: (Date | null)[] = [];
    for (let i = 0; i < startDay; i++) arr.push(null);
    for (let d = 1; d <= total; d++) arr.push(new Date(month.getFullYear(), month.getMonth(), d));
    return arr;
  }, [month]);

  const shiftColors: Record<string, string> = {
    Morning: 'bg-primary-500',
    Evening: 'bg-amber-500',
    Night: 'bg-indigo-500',
    'Full Day': 'bg-success',
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-lg text-ink">
          {month.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex gap-2">
          <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="btn-ghost px-3 py-2">←</button>
          <button onClick={() => setMonth(new Date())} className="btn-secondary px-3 py-2">Today</button>
          <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="btn-ghost px-3 py-2">→</button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-ink-muted py-2">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((d, i) => {
          if (!d) return <div key={i} />;
          const dayBookings = bookings.filter((b) => new Date(b.start_date).toDateString() === d.toDateString());
          return (
            <div key={i} className="min-h-20 p-2 rounded-lg border border-line bg-slate-50">
              <p className="text-xs font-semibold text-ink-muted mb-1">{d.getDate()}</p>
              <div className="space-y-1">
                {dayBookings.slice(0, 3).map((b) => (
                  <div key={b.id} className={`text-xs text-white px-1.5 py-0.5 rounded ${shiftColors[b.shift] || 'bg-slate-400'} truncate`}>
                    {b.member_name}
                  </div>
                ))}
                {dayBookings.length > 3 && <p className="text-xs text-ink-muted">+{dayBookings.length - 3} more</p>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 mt-4 flex-wrap">
        {Object.entries(shiftColors).map(([shift, color]) => (
          <div key={shift} className="flex items-center gap-2 text-xs text-ink-muted">
            <span className={`w-3 h-3 rounded ${color}`} /> {shift}
          </div>
        ))}
      </div>
    </div>
  );
}
