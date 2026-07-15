import { useState, useMemo } from 'react';
import { X, RefreshCw } from 'lucide-react';
import type { Member, Plan } from '../../lib/supabase';

type Props = {
  member: Member;
  plans: Plan[];
  onClose: () => void;
  onRenew: (planId: string, shiftName: string, startDate: string, paymentMode: 'cash' | 'upi', paymentStatus: 'paid' | 'unpaid' | 'partial', paidAmount: number) => void;
};

export default function RenewMembershipModal({ member, plans, onClose, onRenew }: Props) {
  const activePlans = useMemo(() => plans.filter((p) => p.is_active && !p.is_archived), [plans]);

  const [planId, setPlanId] = useState(member.current_plan_id || activePlans[0]?.id || '');
  const [shiftName, setShiftName] = useState(member.current_shift || '');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi'>('cash');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid' | 'partial'>('paid');
  const [paidAmount, setPaidAmount] = useState<number>(0);

  const selectedPlan = activePlans.find((p) => p.id === planId);
  const shifts = selectedPlan?.shifts.filter((s) => s.isActive) ?? [];
  const selectedShift = shifts.find((s) => s.shiftName === shiftName);
  const amount = selectedShift?.price ?? 0;

  const effectivePaid = paymentStatus === 'paid' ? amount : paymentStatus === 'partial' ? paidAmount : 0;
  const dueAmount = Math.max(0, amount - effectivePaid);

  const expiryDate = useMemo(() => {
    if (!selectedPlan || !startDate) return '';
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + selectedPlan.duration_months);
    return d.toISOString().split('T')[0];
  }, [selectedPlan, startDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planId || !shiftName || !startDate) return;
    onRenew(planId, shiftName, startDate, paymentMode, paymentStatus, effectivePaid);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <h2 className="text-lg font-bold text-neutral-900">Renew Membership</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-neutral-50 rounded-xl p-3 text-sm text-neutral-600">
            <span className="font-semibold text-neutral-900">{member.full_name}</span> — {member.email}
            <div className="mt-1">Current status: <span className={member.membership_status === 'expired' ? 'text-error font-medium' : 'text-success font-medium'}>{member.membership_status}</span></div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Plan</label>
            <select value={planId} onChange={(e) => { setPlanId(e.target.value); setShiftName(''); }} className="input" required>
              <option value="">Select a plan</option>
              {activePlans.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.duration_months} month{p.duration_months !== 1 ? 's' : ''})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Shift</label>
            <select value={shiftName} onChange={(e) => setShiftName(e.target.value)} className="input" required disabled={!selectedPlan}>
              <option value="">Select a shift</option>
              {shifts.map((s) => (
                <option key={s.shiftName} value={s.shiftName}>{s.shiftName} ({s.shiftTime}) — ₹{s.price}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input" required />
          </div>

          {expiryDate && (
            <div className="bg-success-light/30 rounded-xl p-3 text-sm text-neutral-700">
              New expiry date: <span className="font-semibold text-neutral-900">{expiryDate}</span>
            </div>
          )}

          {amount > 0 && (
            <div className="border-t border-neutral-100 pt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Fee Amount</label>
                <div className="input bg-neutral-50 font-semibold text-neutral-900">₹{amount}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Payment Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setPaymentMode('cash')} className={`p-2.5 rounded-xl border-2 text-sm font-semibold ${paymentMode === 'cash' ? 'border-primary-600 bg-primary-50 text-primary-800' : 'border-line text-ink-muted'}`}>Cash</button>
                  <button type="button" onClick={() => setPaymentMode('upi')} className={`p-2.5 rounded-xl border-2 text-sm font-semibold ${paymentMode === 'upi' ? 'border-primary-600 bg-primary-50 text-primary-800' : 'border-line text-ink-muted'}`}>UPI</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Payment Status</label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setPaymentStatus('paid')} className={`p-2.5 rounded-xl border-2 text-sm font-semibold ${paymentStatus === 'paid' ? 'border-success bg-success-light text-success' : 'border-line text-ink-muted'}`}>Paid</button>
                  <button type="button" onClick={() => setPaymentStatus('partial')} className={`p-2.5 rounded-xl border-2 text-sm font-semibold ${paymentStatus === 'partial' ? 'border-warning bg-warning-light text-warning' : 'border-line text-ink-muted'}`}>Partial</button>
                  <button type="button" onClick={() => setPaymentStatus('unpaid')} className={`p-2.5 rounded-xl border-2 text-sm font-semibold ${paymentStatus === 'unpaid' ? 'border-error bg-error-light text-error' : 'border-line text-ink-muted'}`}>Unpaid</button>
                </div>
              </div>
              {paymentStatus === 'partial' && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Amount Paid (₹)</label>
                  <input type="number" min={0} max={amount} className="input" value={paidAmount} onChange={(e) => setPaidAmount(Number(e.target.value))} />
                  <p className="text-xs text-neutral-500 mt-1">Due: ₹{dueAmount}</p>
                </div>
              )}
              {paymentStatus !== 'partial' && (
                <div className="text-sm text-neutral-600 flex justify-between bg-neutral-50 rounded-lg p-2.5">
                  <span>Paid: <span className="font-semibold text-neutral-900">₹{effectivePaid}</span></span>
                  <span>Due: <span className="font-semibold text-error">₹{dueAmount}</span></span>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Renew</button>
          </div>
        </form>
      </div>
    </div>
  );
}
