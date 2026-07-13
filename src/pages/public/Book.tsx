import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Check, ChevronRight, ChevronLeft, Sunrise, Sunset, Moon, Sun, User, Phone, Mail,
  Lock, Calendar, MapPin, CreditCard, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { supabase, type Plan } from '../../lib/supabase';
import { formatINR, generateBookingId, formatDate } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

const shiftOptions = [
  { key: 'Morning', icon: Sunrise, time: '6AM – 2PM' },
  { key: 'Evening', icon: Sunset, time: '2PM – 10PM' },
  { key: 'Night', icon: Moon, time: '10PM – 6AM' },
  { key: 'Full Day', icon: Sun, time: '12 Hours' },
];

const idTypes = ['Aadhaar', 'Student ID', 'PAN', 'Driving License'];

type FormState = {
  shift: string;
  planId: string;
  planName: string;
  shiftTime: string;
  amount: number;
  fullName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  startDate: string;
  address: string;
  idProofType: string;
  idProofNumber: string;
};

export default function Book() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ id: string; phone: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState<FormState>({
    shift: searchParams.get('shift') || 'Morning',
    planId: '',
    planName: searchParams.get('plan') || '',
    shiftTime: '',
    amount: 0,
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    startDate: new Date().toISOString().split('T')[0],
    address: '',
    idProofType: 'Aadhaar',
    idProofNumber: '',
  });

  useEffect(() => {
    supabase.from('plans').select('*').eq('is_active', true).order('sort_order')
      .then(({ data }) => {
        const list = data as Plan[] || [];
        setPlans(list);
        if (list.length && !form.planId) {
          const preselect = searchParams.get('plan')
            ? list.find((p) => p.name === searchParams.get('plan'))
            : list[0];
          if (preselect) selectPlan(preselect);
        }
      });
  }, []);

  const selectPlan = (plan: Plan) => {
    const shift = plan.shifts.find((s) => s.shiftName === form.shift && s.isActive);
    setForm((f) => ({
      ...f,
      planId: plan.id,
      planName: plan.name,
      shiftTime: shift?.shiftTime || '',
      amount: shift?.price || 0,
    }));
  };

  const selectShift = (shiftKey: string) => {
    setForm((f) => {
      const plan = plans.find((p) => p.id === f.planId);
      const shift = plan?.shifts.find((s) => s.shiftName === shiftKey && s.isActive);
      return {
        ...f,
        shift: shiftKey,
        shiftTime: shift?.shiftTime || '',
        amount: shift?.price || 0,
      };
    });
  };

  const validateStep = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!form.planId) e.planId = 'Please select a plan';
    }
    if (s === 2) {
      if (!form.fullName.trim()) e.fullName = 'Full name is required';
      if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Enter a valid 10-digit phone';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
      if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
      if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
      if (!form.startDate) e.startDate = 'Start date is required';
      else if (new Date(form.startDate) < new Date(new Date().toDateString())) e.startDate = 'Start date cannot be in the past';
      if (!form.idProofNumber.trim()) e.idProofNumber = 'ID proof number is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep(step)) setStep(step + 1); };
  const back = () => setStep(step - 1);

  const submit = async () => {
    if (!validateStep(2)) return;
    setSubmitting(true);
    try {
      const plan = plans.find((p) => p.id === form.planId);
      const durationMonths = plan?.duration_months || 1;
      const start = new Date(form.startDate);
      const expiry = new Date(start);
      expiry.setMonth(expiry.getMonth() + durationMonths);

      const bookingId = generateBookingId();

      // Create auth user - REQUIRED for login
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      // If email already registered, redirect to login
      if (authError?.message?.includes('already registered')) {
        toast.error('This email is already registered. Please log in instead.');
        navigate('/login');
        setSubmitting(false);
        return;
      }

      // For any other auth error, show message and stop
      if (authError) {
        toast.error(authError.message);
        setSubmitting(false);
        return;
      }

      // Must have a valid user_id
      const userId = authData?.user?.id;
      if (!userId) {
        toast.error('Failed to create account. Please try again.');
        setSubmitting(false);
        return;
      }

      // Create member record
      const memberPayload = {
        user_id: userId,
        full_name: form.fullName,
        email: form.email,
        phone: form.phone,
        address: form.address || null,
        id_proof_type: form.idProofType,
        id_proof_number: form.idProofNumber,
        current_plan_id: form.planId,
        current_plan_name: form.planName,
        current_shift: form.shift,
        current_shift_time: form.shiftTime,
        current_start_date: form.startDate,
        current_expiry_date: expiry.toISOString().split('T')[0],
        membership_status: 'pending' as const,
      };
      const { data: memberData } = await supabase.from('members').insert(memberPayload).select().maybeSingle();

      // Create booking
      const bookingPayload = {
        booking_id: bookingId,
        member_id: (memberData as { id: string } | null)?.id || null,
        user_id: userId,
        member_name: form.fullName,
        member_phone: form.phone,
        member_email: form.email,
        plan_id: form.planId,
        plan_name: form.planName,
        shift: form.shift,
        shift_time: form.shiftTime,
        amount: form.amount,
        start_date: form.startDate,
        expiry_date: expiry.toISOString().split('T')[0],
        status: 'pending' as const,
        payment_mode: 'pending' as const,
        payment_status: 'unpaid' as const,
        paid_amount: 0,
        due_amount: form.amount,
        id_proof_type: form.idProofType,
        id_proof_number: form.idProofNumber,
        address: form.address || null,
      };
      const { error: bookingError } = await supabase.from('bookings').insert(bookingPayload);
      if (bookingError) throw bookingError;

      setSuccess({ id: bookingId, phone: form.phone });
      toast.success('Booking submitted successfully!');
    } catch (err) {
      toast.error((err as Error).message || 'Failed to submit booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-8 text-center"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-success-light flex items-center justify-center mb-5">
            <CheckCircle2 className="w-9 h-9 text-success" />
          </div>
          <h2 className="font-display font-bold text-2xl text-ink">Booking Submitted!</h2>
          <p className="text-ink-muted mt-2">Your booking is submitted for confirmation. We will contact you at {success.phone}.</p>
          <div className="mt-6 p-4 rounded-xl bg-primary-50 border border-primary-100">
            <p className="text-sm text-ink-muted">Your Booking ID</p>
            <p className="font-mono font-bold text-2xl text-primary-800 mt-1">{success.id}</p>
          </div>
          <p className="text-sm text-ink-muted mt-5">
            Seat will be assigned by us and after registration you will be able to Sign in.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="btn-secondary">Back to Home</Link>
            <Link to="/login" className="btn-primary">Login to Dashboard</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (user) {
    // Already a member — show prompt
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="card p-8">
          <AlertCircle className="w-12 h-12 mx-auto text-primary-600 mb-4" />
          <h2 className="font-display font-bold text-2xl text-ink">You're already a member</h2>
          <p className="text-ink-muted mt-2">Visit your dashboard to manage your membership or renew.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary mt-6">Go to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="font-display font-bold text-3xl lg:text-4xl text-ink">Book a Seat</h1>
        <p className="text-ink-muted mt-2">Complete 3 quick steps to reserve your study space.</p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center mb-10">
        {[1, 2, 3].map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
              step >= s ? 'bg-primary-800 text-white' : 'bg-slate-200 text-ink-muted'
            }`}>
              {step > s ? <Check className="w-5 h-5" /> : s}
            </div>
            {i < 2 && <div className={`w-16 sm:w-24 h-1 mx-1 rounded ${step > s ? 'bg-primary-800' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="card p-6"
              >
                <h2 className="font-display font-semibold text-xl text-ink mb-5">Step 1 — Choose Your Plan</h2>

                <label className="label">Select Shift</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {shiftOptions.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => selectShift(s.key)}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        form.shift === s.key
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-line hover:border-primary-300'
                      }`}
                    >
                      <s.icon className="w-6 h-6 mx-auto text-primary-700 mb-2" />
                      <p className="text-sm font-semibold text-ink">{s.key}</p>
                      <p className="text-xs text-ink-muted">{s.time}</p>
                    </button>
                  ))}
                </div>

                <label className="label">Select Plan</label>
                <div className="space-y-3">
                  {plans.map((p) => {
                    const shift = p.shifts.find((s) => s.shiftName === form.shift && s.isActive);
                    if (!shift) return null;
                    return (
                      <button
                        key={p.id}
                        onClick={() => selectPlan(p)}
                        className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all text-left ${
                          form.planId === p.id
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-line hover:border-primary-300'
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-ink">{p.name}</p>
                          <p className="text-sm text-ink-muted">{p.duration_months} Month{p.duration_months > 1 ? 's' : ''} · {shift.shiftTime}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-display font-bold text-lg text-primary-800">{formatINR(shift.price)}</p>
                          {p.duration_months > 1 && (
                            <p className="text-xs text-ink-muted">≈ {formatINR(shift.price / p.duration_months)}/mo</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {errors.planId && <p className="text-sm text-error mt-2">{errors.planId}</p>}

                <div className="flex justify-end mt-6">
                  <button onClick={next} className="btn-primary">
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="card p-6"
              >
                <h2 className="font-display font-semibold text-xl text-ink mb-5">Step 2 — Your Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="label">Full Name *</label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-3 text-ink-subtle" />
                      <input className="input pl-10" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Your full name" />
                    </div>
                    {errors.fullName && <p className="text-sm text-error mt-1">{errors.fullName}</p>}
                  </div>
                  <div>
                    <label className="label">Phone Number *</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-3 text-ink-subtle" />
                      <span className="absolute left-9 top-2.5 text-sm text-ink-muted">+91</span>
                      <input className="input pl-16" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" maxLength={10} />
                    </div>
                    {errors.phone && <p className="text-sm text-error mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="label">Email Address *</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-ink-subtle" />
                      <input type="email" className="input pl-10" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
                    </div>
                    {errors.email && <p className="text-sm text-error mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="label">Password *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-3 text-ink-subtle" />
                      <input type="password" className="input pl-10" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" />
                    </div>
                    {errors.password && <p className="text-sm text-error mt-1">{errors.password}</p>}
                  </div>
                  <div>
                    <label className="label">Confirm Password *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-3 text-ink-subtle" />
                      <input type="password" className="input pl-10" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Re-enter password" />
                    </div>
                    {errors.confirmPassword && <p className="text-sm text-error mt-1">{errors.confirmPassword}</p>}
                  </div>
                  <div>
                    <label className="label">Start Date *</label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 absolute left-3 top-3 text-ink-subtle" />
                      <input type="date" className="input pl-10" value={form.startDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                    </div>
                    {errors.startDate && <p className="text-sm text-error mt-1">{errors.startDate}</p>}
                  </div>
                  <div>
                    <label className="label">ID Proof Type</label>
                    <select className="input" value={form.idProofType} onChange={(e) => setForm({ ...form, idProofType: e.target.value })}>
                      {idTypes.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">ID Proof Number *</label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 absolute left-3 top-3 text-ink-subtle" />
                      <input className="input pl-10" value={form.idProofNumber} onChange={(e) => setForm({ ...form, idProofNumber: e.target.value })} placeholder="Enter ID number" />
                    </div>
                    {errors.idProofNumber && <p className="text-sm text-error mt-1">{errors.idProofNumber}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Address</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3 top-3 text-ink-subtle" />
                      <textarea className="input pl-10" rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Your address (optional)" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between mt-6">
                  <button onClick={back} className="btn-ghost">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button onClick={next} className="btn-primary">
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="card p-6"
              >
                <h2 className="font-display font-semibold text-xl text-ink mb-5">Step 3 — Confirm & Submit</h2>
                <div className="space-y-3">
                  {[
                    ['Plan', form.planName],
                    ['Shift', `${form.shift} (${form.shiftTime})`],
                    ['Start Date', formatDate(form.startDate)],
                    ['Name', form.fullName],
                    ['Phone', `+91 ${form.phone}`],
                    ['Email', form.email],
                    ['ID Proof', `${form.idProofType}: ${form.idProofNumber}`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2.5 border-b border-line">
                      <span className="text-sm text-ink-muted">{k}</span>
                      <span className="text-sm font-medium text-ink text-right">{v}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-3">
                    <span className="text-base font-semibold text-ink">Total Amount</span>
                    <span className="text-base font-bold text-primary-800">{formatINR(form.amount)}</span>
                  </div>
                </div>
                <div className="mt-5 p-4 rounded-xl bg-amber-50 border border-amber-200 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                  <p className="text-sm text-ink-muted">
                    Seat will be assigned by us and after registration You will be able to Sign in to your Dashboard.
                  </p>
                </div>
                <div className="flex justify-between mt-6">
                  <button onClick={back} className="btn-ghost">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button onClick={submit} disabled={submitting} className="btn-primary">
                    {submitting ? 'Submitting...' : <>Confirm Booking <Check className="w-4 h-4" /></>}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h3 className="font-display font-semibold text-lg text-ink mb-4">Booking Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-muted">Plan</span>
                <span className="font-medium text-ink">{form.planName || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Shift</span>
                <span className="font-medium text-ink">{form.shift}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Timing</span>
                <span className="font-medium text-ink">{form.shiftTime || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Start</span>
                <span className="font-medium text-ink">{formatDate(form.startDate)}</span>
              </div>
              <div className="pt-3 border-t border-line flex justify-between">
                <span className="font-semibold text-ink">Total</span>
                <span className="font-display font-bold text-xl text-primary-800">{formatINR(form.amount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
