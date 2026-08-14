import { useState, useMemo } from 'react';
import { X, RefreshCw } from 'lucide-react';
import type { Member, Plan } from '../../lib/supabase';

type Props = {
  member: Member;
  plans: Plan[];
  onClose: () => void;
  onRenew: (planId: string, shiftName: string, startDate: string) => void;
};

export default function RenewMembershipModal({ member, plans, onClose, onRenew }: Props) {
  const activePlans = useMemo(() => plans.filter((p) => p.is_active && !p.is_archived), [plans]);

  const [planId, setPlanId] = useState(member.current_plan_id || activePlans[0]?.id || '');
  const [shiftName, setShiftName] = useState(member.current_shift || '');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const selectedPlan = activePlans.find((p) => p.id === planId);
  const shifts = selectedPlan?.shifts.filter((s) => s.isActive) ?? [];
  const selectedShift = shifts.find((s) => s.shiftName === shiftName);

  const expiryDate = useMemo(() => {
    if (!selectedPlan || !startDate) return '';
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + selectedPlan.duration_months);
    return d.toISOString().split('T')[0];
  }, [selectedPlan, startDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planId || !shiftName || !startDate) return;
    onRenew(planId, shiftName, startDate);
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

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Renew</button>
          </div>
        </form>
      </div>
    </div>
  );
}
