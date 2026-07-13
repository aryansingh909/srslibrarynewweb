import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, CheckCircle2, CalendarPlus, Wallet, TrendingUp, ArrowRight,
  Sunrise, Sunset, Moon, Sun, AlertTriangle,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { supabase, type Member, type Booking, type SiteSettings } from '../../lib/supabase';
import { formatINR, formatDate, daysUntil, statusColor } from '../../lib/utils';

export default function AdminDashboard() {
  const [members, setMembers] = useState<Member[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('members').select('*').order('created_at', { ascending: false }),
      supabase.from('bookings').select('*').order('created_at', { ascending: false }),
      supabase.from('site_settings').select('*').eq('id', 1).maybeSingle(),
    ]).then(([m, b, s]) => {
      setMembers(m.data as Member[] || []);
      setBookings(b.data as Booking[] || []);
      setSettings(s.data as SiteSettings);
      setLoading(false);
    });
  }, []);

  const stats = useMemo(() => {
    const activeMembers = members.filter((m) => m.membership_status === 'active').length;
    const today = new Date().toDateString();
    const todayBookings = bookings.filter((b) => new Date(b.created_at).toDateString() === today).length;
    const totalDue = bookings.reduce((sum, b) => sum + (b.due_amount || 0), 0);
    return {
      total: members.length,
      active: activeMembers,
      todayBookings,
      totalDue,
    };
  }, [members, bookings]);

  const shiftOccupancy = useMemo(() => {
    const counts = { Morning: 0, Evening: 0, Night: 0, 'Full Day': 0 };
    members.forEach((m) => {
      if (m.membership_status === 'active' && m.current_shift && counts[m.current_shift as keyof typeof counts] !== undefined) {
        counts[m.current_shift as keyof typeof counts]++;
      }
    });
    return [
      { name: 'Morning', count: counts.Morning, total: settings?.seats_morning || 40, icon: Sunrise },
      { name: 'Evening', count: counts.Evening, total: settings?.seats_evening || 40, icon: Sunset },
      { name: 'Night', count: counts.Night, total: settings?.seats_night || 40, icon: Moon },
      { name: 'Full Day', count: counts['Full Day'], total: settings?.seats_fullday || 40, icon: Sun },
    ];
  }, [members, settings]);

  const expiringSoon = useMemo(() => {
    return members
      .filter((m) => m.current_expiry_date && m.membership_status === 'active' && daysUntil(m.current_expiry_date) <= 30 && daysUntil(m.current_expiry_date) >= 0)
      .sort((a, b) => daysUntil(a.current_expiry_date) - daysUntil(b.current_expiry_date))
      .slice(0, 5);
  }, [members]);

  const revenueData = useMemo(() => {
    const months: { month: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleDateString('en-IN', { month: 'short' });
      const revenue = bookings
        .filter((b) => {
          const bd = new Date(b.created_at);
          return bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear() && b.paid_amount > 0;
        })
        .reduce((sum, b) => sum + b.paid_amount, 0);
      months.push({ month: label, revenue });
    }
    return months;
  }, [bookings]);

  const recentBookings = bookings.slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28" />)}
        </div>
        <div className="skeleton h-64" />
      </div>
    );
  }

  const kpis = [
    { label: 'Total Members', value: stats.total, icon: Users, bg: 'bg-primary-50', fg: 'text-primary-700' },
    { label: 'Active Memberships', value: stats.active, icon: CheckCircle2, bg: 'bg-success-light', fg: 'text-success' },
    { label: "Today's New Bookings", value: stats.todayBookings, icon: CalendarPlus, bg: 'bg-warning-light', fg: 'text-warning' },
    { label: 'Total Fees Due', value: formatINR(stats.totalDue), icon: Wallet, bg: 'bg-error-light', fg: 'text-error' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">Dashboard</h1>
        <p className="text-ink-muted mt-1">Overview of library operations.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink-muted">{k.label}</p>
                <p className="font-display font-bold text-2xl text-ink mt-1">{k.value}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${k.bg}`}>
                <k.icon className={`w-5 h-5 ${k.fg}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shift occupancy */}
        <div className="card p-6">
          <h3 className="font-display font-semibold text-lg text-ink mb-4">Shift-wise Occupancy</h3>
          <div className="space-y-4">
            {shiftOccupancy.map((s) => {
              const pct = s.total ? Math.round((s.count / s.total) * 100) : 0;
              return (
                <div key={s.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-ink flex items-center gap-2">
                      <s.icon className="w-4 h-4 text-primary-700" /> {s.name}
                    </span>
                    <span className="text-sm text-ink-muted">{s.count}/{s.total} ({pct}%)</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6 }}
                      className={`h-full rounded-full ${pct >= 90 ? 'bg-error' : pct >= 70 ? 'bg-warning' : 'bg-primary-600'}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue chart */}
        <div className="card p-6">
          <h3 className="font-display font-semibold text-lg text-ink mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-700" /> Monthly Revenue
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip
                formatter={(v) => [formatINR(Number(v)), 'Revenue']}
                contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 13 }}
              />
              <Bar dataKey="revenue" fill="#1E40AF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiring soon */}
        <div className="card p-6">
          <h3 className="font-display font-semibold text-lg text-ink mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" /> Expiring This Month
          </h3>
          {expiringSoon.length === 0 ? (
            <p className="text-sm text-ink-muted py-6 text-center">No memberships expiring soon.</p>
          ) : (
            <div className="space-y-3">
              {expiringSoon.map((m) => {
                const days = daysUntil(m.current_expiry_date);
                return (
                  <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                    <div>
                      <p className="font-medium text-ink text-sm">{m.full_name}</p>
                      <p className="text-xs text-ink-muted">{m.current_plan_name} · {m.current_shift}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-ink-muted">{formatDate(m.current_expiry_date)}</p>
                      <p className={`text-sm font-semibold ${days <= 7 ? 'text-error' : 'text-warning'}`}>{days}d left</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent bookings */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg text-ink">Recent Bookings</h3>
            <Link to="/admin/bookings" className="text-sm text-primary-700 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {recentBookings.length === 0 ? (
            <p className="text-sm text-ink-muted py-6 text-center">No bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <div>
                    <p className="font-medium text-ink text-sm">{b.member_name}</p>
                    <p className="text-xs text-ink-muted font-mono">{b.booking_id} · {b.plan_name}</p>
                  </div>
                  <span className={`badge ${statusColor(b.status)}`}>{b.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
