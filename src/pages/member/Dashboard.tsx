import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  User, Calendar, Clock, Armchair, CreditCard, LogOut, AlertCircle,
  CheckCircle2, History, Phone,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, type Booking } from '../../lib/supabase';
import { formatINR, formatDate, daysUntil, statusColor } from '../../lib/utils';

export default function MemberDashboard() {
  const { user, member, loading, signOut } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }
    if (user) {
      supabase.from('bookings').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
        .then(({ data }) => setBookings(data as Booking[] || []));
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="skeleton h-40 mb-6" />
        <div className="skeleton h-64" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="text-5xl mb-4">📚</div>
        <h2 className="font-display font-bold text-2xl text-ink mb-3">No Membership Found</h2>
        <p className="text-ink-muted mb-6">
          Your account doesn't have an active membership yet. Book a seat and the library staff will activate your membership.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/book" className="btn-primary">Book a Seat</Link>
          <button onClick={async () => { await signOut(); navigate('/'); }} className="btn-secondary">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    );
  }

  const daysToExpiry = daysUntil(member.current_expiry_date);
  const expiringSoon = daysToExpiry > 0 && daysToExpiry <= 30;
  const expired = daysToExpiry <= 0;
  const due = bookings.reduce((sum, b) => sum + (b.due_amount || 0), 0);

  const statusBadge = expired ? 'expired' : expiringSoon ? 'pending' : 'active';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display font-bold text-2xl lg:text-3xl text-ink">
              Welcome back, {member.full_name.split(' ')[0]}!
            </h1>
            <p className="text-ink-muted mt-1">Here's your membership overview.</p>
          </div>
          <button onClick={async () => { await signOut(); navigate('/'); }} className="btn-ghost">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </motion.div>

      {/* Expiry alert */}
      {(expiringSoon || expired) && (
        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${expired ? 'bg-error-light' : 'bg-warning-light'}`}>
          <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${expired ? 'text-error' : 'text-warning'}`} />
          <div>
            <p className={`font-semibold text-sm ${expired ? 'text-error' : 'text-warning'}`}>
              {expired ? 'Your membership has expired' : `Expiring in ${daysToExpiry} days`}
            </p>
            <p className="text-sm text-ink-muted mt-0.5">
              {expired
                ? 'Please contact the library to renew your membership.'
                : 'Contact the library to renew and keep your seat.'}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Membership card */}
        <div className="lg:col-span-2">
          <div className="card p-6 bg-gradient-to-br from-navy-900 to-primary-800 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📚</span>
                  <span className="font-display font-semibold">SRS Digital Library</span>
                </div>
                <span className={`badge ${statusBadge === 'active' ? 'bg-success text-white' : statusBadge === 'pending' ? 'bg-warning text-white' : 'bg-error text-white'}`}>
                  {statusBadge === 'active' ? '✅ Active' : statusBadge === 'pending' ? '⚠️ Expiring Soon' : '🔴 Expired'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Info icon={User} label="Member" value={member.full_name} />
                <Info icon={CreditCard} label="Plan" value={member.current_plan_name || '—'} />
                <Info icon={Clock} label="Shift" value={member.current_shift ? `${member.current_shift} (${member.current_shift_time})` : '—'} />
                <Info icon={Armchair} label="Seat No." value={member.seat_number || 'To be assigned'} />
                <Info icon={Calendar} label="Start Date" value={formatDate(member.current_start_date)} />
                <Info icon={Calendar} label="Expiry Date" value={formatDate(member.current_expiry_date)} />
              </div>
            </div>
          </div>

          {/* Fee status */}
          <div className="card p-6 mt-6">
            <h3 className="font-display font-semibold text-lg text-ink mb-4">Fee Status</h3>
            {due > 0 ? (
              <div className="flex items-center justify-between p-4 rounded-xl bg-warning-light">
                <div>
                  <p className="font-semibold text-warning">{formatINR(due)} Due</p>
                  <p className="text-sm text-ink-muted mt-0.5">Please contact the library to clear your dues.</p>
                </div>
                <a href="tel:+919800550047" className="btn-secondary">Call Library</a>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-success-light">
                <CheckCircle2 className="w-6 h-6 text-success" />
                <div>
                  <p className="font-semibold text-success">₹0 Due</p>
                  <p className="text-sm text-ink-muted">All your fees are clear. Thank you!</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-display font-semibold text-lg text-ink mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/announcements" className="btn-secondary w-full">
                <AlertCircle className="w-4 h-4" /> View Announcements
              </Link>
              <Link to="/plans" className="btn-ghost w-full">
                <CreditCard className="w-4 h-4" /> View Plans
              </Link>
              {expired && (
                <a href="tel:+919800550047" className="btn-primary w-full">
                  <Phone className="w-4 h-4" /> Contact Library to Renew
                </a>
              )}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-display font-semibold text-lg text-ink mb-4">Profile</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-ink-muted">Email</span><span className="font-medium text-ink truncate ml-2">{member.email}</span></div>
              <div className="flex justify-between"><span className="text-ink-muted">Phone</span><span className="font-medium text-ink">{member.phone}</span></div>
              <div className="flex justify-between"><span className="text-ink-muted">ID</span><span className="font-medium text-ink">{member.id_proof_type}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking history */}
      <div className="card p-6 mt-6">
        <h3 className="font-display font-semibold text-lg text-ink mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-primary-700" /> Booking History
        </h3>
        {bookings.length === 0 ? (
          <div className="text-center py-10">
            <History className="w-10 h-10 mx-auto text-ink-subtle mb-3" />
            <p className="text-ink-muted">No bookings yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-muted border-b border-line">
                  <th className="pb-3 font-medium">Booking ID</th>
                  <th className="pb-3 font-medium">Plan</th>
                  <th className="pb-3 font-medium">Shift</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Start</th>
                  <th className="pb-3 font-medium">Expiry</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-line last:border-0">
                    <td className="py-3 font-mono text-xs text-ink">{b.booking_id}</td>
                    <td className="py-3 text-ink">{b.plan_name}</td>
                    <td className="py-3 text-ink">{b.shift}</td>
                    <td className="py-3 text-ink">{formatINR(b.amount)}</td>
                    <td className="py-3 text-ink-muted">{formatDate(b.start_date)}</td>
                    <td className="py-3 text-ink-muted">{formatDate(b.expiry_date)}</td>
                    <td className="py-3">
                      <span className={`badge ${statusColor(b.status)}`}>{b.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-primary-200 flex items-center gap-1.5 mb-1">
        <Icon className="w-3.5 h-3.5" /> {label}
      </p>
      <p className="font-semibold text-white text-sm">{value}</p>
    </div>
  );
}
