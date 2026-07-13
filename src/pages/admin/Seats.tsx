import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RefreshCw, X, User, Phone, CreditCard, Calendar, Clock,
  AlertTriangle, ChevronRight, Armchair, Edit, Eye, ArrowRightLeft,
} from 'lucide-react';
import { supabase, type Member } from '../../lib/supabase';
import { formatDate, daysUntil, statusColor } from '../../lib/utils';

const TOTAL_SEATS = 40;
const PARTIAL_SHIFTS = ['Morning', 'Evening', 'Night'] as const;
const ALL_SHIFTS = ['Morning', 'Evening', 'Night', 'Full Day'] as const;

const SHIFT_META: Record<string, { icon: string; label: string; color: string; bg: string }> = {
  Morning:  { icon: '🌞', label: 'Day',     color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200' },
  Evening:  { icon: '🌆', label: 'Evening', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  Night:    { icon: '🌙', label: 'Night',   color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
  'Full Day': { icon: '⭐', label: 'Full Day', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
};

type SeatOccupancy = {
  seatNumber: number;
  bookings: Record<string, Member>; // shift -> member
};

type Filter = 'all' | 'occupied' | 'available';

export default function Seats() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<{ seat: number; shift: string; member: Member } | null>(null);
  const [changeSeatOpen, setChangeSeatOpen] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('membership_status', 'active')
      .not('seat_number', 'is', null)
      .not('current_shift', 'is', null);
    if (error) toast.error(error.message);
    else setMembers((data as Member[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const seats: SeatOccupancy[] = useMemo(() => {
    const map: Record<number, Record<string, Member>> = {};
    for (let i = 1; i <= TOTAL_SEATS; i++) map[i] = {};
    for (const m of members) {
      const seat = parseInt(m.seat_number || '0', 10);
      if (seat >= 1 && seat <= TOTAL_SEATS && m.current_shift) {
        map[seat][m.current_shift] = m;
      }
    }
    return Array.from({ length: TOTAL_SEATS }, (_, i) => ({
      seatNumber: i + 1,
      bookings: map[i + 1],
    }));
  }, [members]);

  const hasFullDay = (s: SeatOccupancy) => 'Full Day' in s.bookings;
  const isPartiallyOccupied = (s: SeatOccupancy) => !hasFullDay(s) && Object.keys(s.bookings).length > 0;
  const isAvailable = (s: SeatOccupancy) => Object.keys(s.bookings).length === 0;

  const filteredSeats = useMemo(() => {
    if (filter === 'occupied') return seats.filter((s) => !isAvailable(s));
    if (filter === 'available') return seats.filter(isAvailable);
    return seats;
  }, [seats, filter]);

  const stats = useMemo(() => ({
    total: TOTAL_SEATS,
    occupied: seats.filter((s) => !isAvailable(s)).length,
    available: seats.filter(isAvailable).length,
    fullDay: seats.filter(hasFullDay).length,
  }), [seats]);

  const handleShiftClick = (seat: SeatOccupancy, shift: string) => {
    const member = seat.bookings[shift];
    if (member) setSelected({ seat: seat.seatNumber, shift, member });
  };

  const removeBooking = async (member: Member) => {
    const { error } = await supabase
      .from('members')
      .update({ seat_number: null, current_shift: null, membership_status: 'pending' })
      .eq('id', member.id);
    if (error) toast.error(error.message);
    else {
      toast.success('Booking removed');
      setSelected(null);
      load();
    }
  };

  const statusDot = (s: SeatOccupancy) => {
    if (hasFullDay(s)) return 'bg-red-500';
    if (isPartiallyOccupied(s)) return 'bg-amber-400';
    return 'bg-emerald-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink flex items-center gap-2">
            <Armchair className="w-6 h-6 text-primary-700" /> Seat Management
          </h1>
          <p className="text-ink-muted mt-1">Live seat layout — updates automatically from member records</p>
        </div>
        <button onClick={load} disabled={loading} className="btn-secondary">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Seats', value: stats.total, color: 'text-primary-700', bg: 'bg-primary-50 border-primary-200' },
          { label: 'Occupied', value: stats.occupied, color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
          { label: 'Available', value: stats.available, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'Full Day', value: stats.fullDay, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
        ].map((s) => (
          <div key={s.label} className={`card p-4 border ${s.bg}`}>
            <p className="text-xs font-medium text-ink-muted uppercase tracking-wide">{s.label}</p>
            <p className={`text-3xl font-display font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'occupied', 'available'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
              filter === f ? 'bg-primary-800 text-white' : 'bg-white border border-line text-ink-muted hover:bg-slate-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(TOTAL_SEATS)].map((_, i) => (
            <div key={i} className="skeleton h-40 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredSeats.map((seat) => (
            <SeatCard
              key={seat.seatNumber}
              seat={seat}
              statusDot={statusDot(seat)}
              hasFullDay={hasFullDay(seat)}
              onShiftClick={(shift) => handleShiftClick(seat, shift)}
            />
          ))}
        </div>
      )}

      {/* Detail drawer */}
      <AnimatePresence>
        {selected && (
          <MemberDetailPanel
            seatNumber={selected.seat}
            shift={selected.shift}
            member={selected.member}
            onClose={() => setSelected(null)}
            onViewMember={() => navigate('/admin/members')}
            onEditMember={() => navigate('/admin/members')}
            onChangeSeat={() => setChangeSeatOpen(true)}
            onRemoveBooking={() => removeBooking(selected.member)}
          />
        )}
      </AnimatePresence>

      {/* Change seat modal */}
      <AnimatePresence>
        {selected && changeSeatOpen && (
          <ChangeSeatModal
            member={selected.member}
            allMembers={members}
            onClose={() => setChangeSeatOpen(false)}
            onSaved={() => {
              setChangeSeatOpen(false);
              setSelected(null);
              load();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Seat Card ─────────────────────────────────────────── */
function SeatCard({
  seat, statusDot, onShiftClick,
}: {
  seat: SeatOccupancy;
  statusDot: string;
  onShiftClick: (shift: string) => void;
}) {
  const hasMorning = !!seat.bookings['Morning'];
  const hasEvening = !!seat.bookings['Evening'];
  // const hasNight = !!seat.bookings['Night'];
  const fullDayBooked = !!seat.bookings['Full Day'];

let shiftsToShow: string[] = [];

// Morning & Evening are hidden only if Full Day exists
if (!fullDayBooked) {
  shiftsToShow.push('Morning');
  shiftsToShow.push('Evening');
}

// Night is ALWAYS shown
shiftsToShow.push('Night');

// Full Day is hidden only if Morning or Evening exists
if (!hasMorning && !hasEvening) {
  shiftsToShow.push('Full Day');
}

  return (
    <div className="card p-3 hover:shadow-md transition-shadow">
      {/* Card header */}
      <div className="flex items-center justify-between mb-2.5">
        <span className="font-display font-bold text-base text-ink">Seat {seat.seatNumber}</span>
        <span className={`w-2.5 h-2.5 rounded-full ${statusDot} ring-2 ring-white`} />
      </div>

      {/* Shift rows */}
      <div className="space-y-1.5">
        {shiftsToShow.map((shift) => {
          const meta = SHIFT_META[shift];
          const member = seat.bookings[shift];
          return (
            <button
              key={shift}
              onClick={() => member && onShiftClick(shift)}
              disabled={!member}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                member
                  ? `${meta.bg} ${meta.color} hover:opacity-90 cursor-pointer shadow-sm`
                  : 'bg-slate-50 border-slate-200 text-ink-subtle cursor-default'
              }`}
            >
              <span className="text-sm">{meta.icon}</span>
              <div className="flex-1 text-left min-w-0">
                <div className="font-semibold">{meta.label}</div>
                {member ? (
                  <div className="truncate text-[10px] opacity-80">{member.full_name}</div>
                ) : (
                  <div className="text-[10px] opacity-60">Available</div>
                )}
              </div>
              {member && <ChevronRight className="w-3 h-3 shrink-0 opacity-60" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Detail Panel ──────────────────────────────────────── */
function MemberDetailPanel({
  seatNumber, shift, member, onClose, onViewMember, onEditMember, onChangeSeat, onRemoveBooking,
}: {
  seatNumber: number;
  shift: string;
  member: Member;
  onClose: () => void;
  onViewMember: () => void;
  onEditMember: () => void;
  onChangeSeat: () => void;
  onRemoveBooking: () => void;
}) {
  const days = daysUntil(member.current_expiry_date);
  const meta = SHIFT_META[shift];

  const daysColor = days <= 0
    ? 'text-error bg-error-light'
    : days <= 7
    ? 'text-warning bg-warning-light'
    : 'text-success bg-success-light';

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-navy-950/40 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 32 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col"
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <div>
            <h3 className="font-display font-bold text-ink">Seat {seatNumber}</h3>
            <span className={`badge ${meta.bg} ${meta.color} border mt-0.5`}>
              {meta.icon} {meta.label}
            </span>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5 text-ink-muted" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Member name */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="w-6 h-6 text-primary-700" />
            </div>
            <div>
              <p className="font-semibold text-ink">{member.full_name}</p>
              <p className="text-sm text-ink-muted flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> {member.phone}
              </p>
            </div>
          </div>

          {/* Info rows */}
          <div className="card p-4 space-y-3">
            <InfoRow icon={CreditCard} label="Plan" value={member.current_plan_name || '—'} />
            <InfoRow icon={Armchair} label="Seat" value={`Seat ${seatNumber}`} />
            <InfoRow icon={Clock} label="Shift" value={`${meta.icon} ${meta.label}`} />
            <InfoRow icon={Calendar} label="Admitted" value={formatDate(member.current_start_date)} />
            <InfoRow icon={Calendar} label="Expires" value={formatDate(member.current_expiry_date)} />
          </div>

          {/* Remaining days */}
          <div className={`rounded-xl px-4 py-3 flex items-center justify-between ${daysColor}`}>
            <span className="text-sm font-medium">Remaining Days</span>
            <span className="font-display font-bold text-lg">
              {days <= 0 ? 'Expired' : `${days}d`}
            </span>
          </div>

          {/* Payment status */}
          <div>
            <p className="text-xs text-ink-muted mb-1">Payment Status</p>
            <span className={`badge ${statusColor(member.membership_status)}`}>
              {member.membership_status}
            </span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="p-4 border-t border-line space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={onViewMember} className="btn-secondary text-xs">
              <Eye className="w-3.5 h-3.5" /> View Member
            </button>
            <button onClick={onEditMember} className="btn-secondary text-xs">
              <Edit className="w-3.5 h-3.5" /> Edit Member
            </button>
          </div>
          <button onClick={onChangeSeat} className="btn-primary w-full text-xs">
            <ArrowRightLeft className="w-3.5 h-3.5" /> Change Seat
          </button>
          <button
            onClick={onRemoveBooking}
            className="btn-ghost w-full text-xs text-error hover:bg-error-light"
          >
            <AlertTriangle className="w-3.5 h-3.5" /> Remove Booking
          </button>
        </div>
      </motion.aside>
    </>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-ink-subtle shrink-0" />
      <div className="flex-1 flex items-center justify-between gap-2">
        <span className="text-xs text-ink-muted">{label}</span>
        <span className="text-sm font-medium text-ink">{value}</span>
      </div>
    </div>
  );
}

/* ── Change Seat Modal ─────────────────────────────────── */
function ChangeSeatModal({
  member, allMembers, onClose, onSaved,
}: {
  member: Member;
  allMembers: Member[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [seatInput, setSeatInput] = useState(member.seat_number || '');
  const [shift, setShift] = useState(member.current_shift || 'Morning');
  const [saving, setSaving] = useState(false);

  const validateAndSave = async () => {
    const seat = parseInt(seatInput, 10);
    if (!seatInput || isNaN(seat) || seat < 1 || seat > TOTAL_SEATS) {
      toast.error(`Seat must be a number between 1 and ${TOTAL_SEATS}`);
      return;
    }

    // Build current occupancy for the target seat (excluding this member)
    const others = allMembers.filter(
      (m) => m.id !== member.id && m.seat_number === String(seat),
    );

   const occupiedShifts = new Set(
  others.map((m) => m.current_shift).filter(Boolean)
);

// Same shift cannot be booked twice
if (occupiedShifts.has(shift)) {
  toast.error(`${shift} shift on Seat ${seat} is already occupied.`);
  return;
}

// Full Day conflicts ONLY with Morning and Evening
if (
  shift === 'Full Day' &&
  (occupiedShifts.has('Morning') || occupiedShifts.has('Evening'))
) {
  toast.error(
    `Seat ${seat} already has Morning or Evening booked. Cannot assign Full Day.`
  );
  return;
}

// Morning/Evening conflict with Full Day
if (
  (shift === 'Morning' || shift === 'Evening') &&
  occupiedShifts.has('Full Day')
) {
  toast.error(
    `Seat ${seat} already has Full Day booked. Cannot assign ${shift}.`
  );
  return;
}

// Night is independent, so no extra checks are needed.

    setSaving(true);
    const { error } = await supabase
      .from('members')
      .update({ seat_number: String(seat), current_shift: shift })
      .eq('id', member.id);
    if (error) toast.error(error.message);
    else { toast.success('Seat updated'); onSaved(); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-navy-950/60 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="card p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-semibold text-lg text-ink">Change Seat</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">New Seat Number (1–{TOTAL_SEATS})</label>
            <input
              type="number"
              min={1}
              max={TOTAL_SEATS}
              className="input"
              value={seatInput}
              onChange={(e) => setSeatInput(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Shift</label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_SHIFTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setShift(s)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    shift === s
                      ? 'bg-primary-800 border-primary-800 text-white'
                      : 'border-line text-ink-muted hover:bg-slate-50'
                  }`}
                >
                  <span>{SHIFT_META[s].icon}</span> {SHIFT_META[s].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={validateAndSave} disabled={saving} className="btn-primary flex-1">
            {saving ? 'Saving...' : 'Confirm'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
