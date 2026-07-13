import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ChevronDown, ArrowRight, Sunrise, Sunset, Moon, Sun } from 'lucide-react';
import { supabase, type Plan } from '../../lib/supabase';
import { formatINR } from '../../lib/utils';

const shiftTabs = [
  { key: 'Morning', icon: Sunrise },
  { key: 'Evening', icon: Sunset },
  { key: 'Night', icon: Moon },
  { key: 'Full Day', icon: Sun },
];

const faqs = [
  { q: 'Can I change my shift after joining?', a: 'Yes, you can change your shift once per billing cycle free of charge. Visit the front desk or call us to request a shift change.' },
  { q: 'What happens when my plan expires?', a: 'Your seat is held for 3 days after expiry so you can renew without losing it. After 3 days, the seat may be reassigned to a new member.' },
  // { q: 'Is there a daily or trial pass?', a: 'We offer a 1-day trial pass so you can experience the library before committing.' },
  // { q: 'How do I get a locker?', a: 'Personal lockers are available for ₹200/month on a first-come, first-served basis. Request one at the front desk when you join.' },
  { q: 'Is the library really open 24 hours?', a: 'Yes, we are open 24 hours a day, 7 days a week, including all holidays.' },
  { q: 'What ID proof is required to join?', a: 'Any government-issued photo ID — Aadhaar, PAN, Driving License, or a valid Student ID — is accepted at the time of registration.' },
];

export default function Plans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeShift, setActiveShift] = useState('Morning');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    supabase.from('plans').select('*').eq('is_active', true).order('sort_order')
      .then(({ data }) => {
        setPlans(data as Plan[] || []);
        setLoading(false);
      });
  }, []);

  const getShift = (plan: Plan, name: string) => plan.shifts.find((s) => s.shiftName === name);
  const monthly = plans.find((p) => p.duration_months === 1);

  return (
    <div>
      <section className="bg-gradient-to-br from-navy-900 to-primary-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display font-bold text-4xl lg:text-5xl text-white">Simple, Transparent Pricing</h1>
          <p className="text-primary-100 mt-4 max-w-2xl mx-auto">
            Choose the plan and shift that fits your schedule. All plans include AC, WiFi, CCTV, Parking, and Clean Washroom.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Shift tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-white rounded-2xl border border-line p-1.5 shadow-card overflow-x-auto max-w-full">
            {shiftTabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveShift(t.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  activeShift === t.key
                    ? 'bg-primary-800 text-white shadow-soft'
                    : 'text-ink-muted hover:text-primary-800 hover:bg-primary-50'
                }`}
              >
                <t.icon className="w-4 h-4" /> {t.key}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton h-96" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, i) => {
              const shift = getShift(plan, activeShift);
              const isPopular = plan.duration_months === 6;
              if (!shift || !shift.isActive) {
                return (
                  <div key={plan.id} className="card p-7 opacity-50">
                    <h3 className="font-display font-bold text-xl text-ink">{plan.name}</h3>
                    <p className="text-sm text-ink-muted mt-4">Not available for this shift.</p>
                  </div>
                );
              }
              const perMonth = shift.price / plan.duration_months;
              const monthlyShift = monthly ? getShift(monthly, activeShift) : null;
              const savings = monthlyShift ? monthlyShift.price * plan.duration_months - shift.price : 0;
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className={`card p-7 relative ${isPopular ? 'ring-2 ring-primary-600 shadow-glow' : ''}`}
                >
                  {isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary-700 text-white text-xs font-semibold">
                      Most Popular
                    </span>
                  )}
                  <h3 className="font-display font-bold text-xl text-ink">{plan.name}</h3>
                  <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold">
                    {plan.duration_months} Month{plan.duration_months > 1 ? 's' : ''}
                  </span>
                  <div className="mt-5">
                    <p className="font-display font-bold text-4xl text-primary-800">{formatINR(shift.price)}</p>
                    {plan.duration_months > 1 && (
                      <p className="text-sm text-ink-muted mt-1">≈ {formatINR(perMonth)}/month</p>
                    )}
                  </div>
                  {savings > 0 && (
                    <span className="inline-block mt-3 px-2.5 py-1 rounded-lg bg-success-light text-success text-xs font-semibold">
                      Save {formatINR(savings)} vs Monthly
                    </span>
                  )}
                  <ul className="mt-6 space-y-2.5">
                    {['Air Conditioned', 'High-Speed WiFi', 'CCTV Security', 'Parking Available', 'Clean Washroom', activeShift === 'Full Day' ? '24/7 Access' : `${activeShift} Shift Access`].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-ink">
                        <Check className="w-4 h-4 text-success" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={`/book?plan=${encodeURIComponent(plan.name)}&shift=${encodeURIComponent(activeShift)}`}
                    className={`mt-7 w-full ${isPopular ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    Book This Plan <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* FAQ */}
      <section className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-bold text-3xl text-ink text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-semibold text-ink">{f.q}</span>
                  <ChevronDown className={`w-5 h-5 text-ink-muted transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-ink-muted leading-relaxed">{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
