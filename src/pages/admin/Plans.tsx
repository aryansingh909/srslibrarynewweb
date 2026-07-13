import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, Save, Eye, EyeOff } from 'lucide-react';
import { supabase, type Plan, type PlanShift } from '../../lib/supabase';

const defaultShifts: PlanShift[] = [
  { shiftName: 'Morning', shiftTime: '6AM - 2PM', price: 0, isActive: true },
  { shiftName: 'Evening', shiftTime: '2PM - 10PM', price: 0, isActive: true },
  { shiftName: 'Night', shiftTime: '10PM - 6AM', price: 0, isActive: true },
  { shiftName: 'Full Day', shiftTime: '24 Hours', price: 0, isActive: true },
];

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors shrink-0 focus:outline-none ${value ? 'bg-success' : 'bg-slate-300'}`}
      role="switch"
      aria-checked={value}
    >
      <span
        className={`inline-block w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  );
}

export default function AdminPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Plan | null>(null);

  const load = () => {
    supabase.from('plans').select('*').order('sort_order')
      .then(({ data }) => {
        const list = data as Plan[] || [];
        setPlans(list);
        if (!selectedId && list.length) setSelectedId(list[0].id);
        setLoading(false);
      });
  };

  useEffect(() => { load(); }, []);

  const selected = plans.find((p) => p.id === selectedId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">Plans & Pricing</h1>
        <p className="text-ink-muted mt-1">Manage plans and shift pricing. Changes reflect instantly on the public site.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan list */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-ink">Plans</h3>
            <button onClick={() => setAddOpen(true)} className="btn-primary px-3 py-2 text-xs"><Plus className="w-3.5 h-3.5" /> New</button>
          </div>
          {loading ? (
            <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-16" />)}</div>
          ) : (
            <div className="space-y-2">
              {plans.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`w-full p-3 rounded-xl border-2 text-left transition-all ${selectedId === p.id ? 'border-primary-600 bg-primary-50' : 'border-line hover:border-primary-300'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-ink text-sm">{p.name}</p>
                      <p className="text-xs text-ink-muted">{p.duration_months} month{p.duration_months > 1 ? 's' : ''}</p>
                    </div>
                    {p.is_active ? <Eye className="w-4 h-4 text-success" /> : <EyeOff className="w-4 h-4 text-ink-subtle" />}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Edit panel */}
        <div className="lg:col-span-2">
          {selected ? (
            <PlanEditor key={selected.id} plan={selected} onSaved={load} onDelete={() => setConfirmDelete(selected)} />
          ) : (
            <div className="card p-12 text-center">
              <p className="text-ink-muted">Select a plan to edit.</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {addOpen && <AddPlanModal onClose={() => setAddOpen(false)} onSaved={load} />}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-50 bg-navy-950/60 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-display font-semibold text-lg text-ink mb-2">Archive Plan?</h3>
              <p className="text-sm text-ink-muted">This will archive "{confirmDelete.name}". Existing bookings keep their records. The plan will be hidden from the public site.</p>
              <div className="flex gap-2 mt-6">
                <button onClick={() => setConfirmDelete(null)} className="btn-ghost">Cancel</button>
                <button onClick={async () => {
                  const { error } = await supabase.from('plans').update({ is_archived: true, is_active: false }).eq('id', confirmDelete.id);
                  if (error) toast.error(error.message);
                  else { toast.success('Plan archived'); setConfirmDelete(null); load(); setSelectedId(null); }
                }} className="btn-danger ml-auto"><Trash2 className="w-4 h-4" /> Archive</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PlanEditor({ plan, onSaved, onDelete }: { plan: Plan; onSaved: () => void; onDelete: () => void }) {
  const [name, setName] = useState(plan.name);
  const [duration, setDuration] = useState(plan.duration_months);
  const [isActive, setIsActive] = useState(plan.is_active);
  const [shifts, setShifts] = useState<PlanShift[]>(plan.shifts);
  const [saving, setSaving] = useState(false);

  const updateShift = (idx: number, field: keyof PlanShift, value: string | number | boolean) => {
    setShifts((s) => s.map((sh, i) => i === idx ? { ...sh, [field]: value } : sh));
  };

  const save = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('plans').update({ name, duration_months: duration, is_active: isActive, shifts }).eq('id', plan.id);
      if (error) throw error;
      toast.success('Plan saved — public site updated');
      onSaved();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-semibold text-lg text-ink">Edit Plan</h3>
        <button onClick={onDelete} className="btn-ghost text-error hover:bg-error-light px-3 py-2 text-sm">
          <Trash2 className="w-4 h-4" /> Archive
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="label">Plan Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label">Duration (months)</label>
          <input type="number" min={1} className="input" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 rounded-xl">
        <Toggle value={isActive} onChange={setIsActive} />
        <span className="text-sm font-medium text-ink">Active (visible on public site)</span>
      </div>

      <div>
        <h4 className="font-display font-semibold text-ink mb-3">Shift Pricing</h4>
        <div className="rounded-xl border border-line overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-ink-muted">
                <th className="px-4 py-3 font-medium">Shift</th>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Price (₹)</th>
                <th className="px-4 py-3 font-medium text-center">Active</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((s, i) => (
                <tr key={s.shiftName} className="border-t border-line">
                  <td className="px-4 py-3 font-medium text-ink">{s.shiftName}</td>
                  <td className="px-4 py-3 text-ink-muted">{s.shiftTime}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      className="input py-1.5 max-w-32"
                      value={s.price}
                      onChange={(e) => updateShift(i, 'price', Number(e.target.value))}
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Toggle value={s.isActive} onChange={(v) => updateShift(i, 'isActive', v)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button onClick={save} disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
        </button>
      </div>
    </div>
  );
}

function AddPlanModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState(1);
  const [shifts, setShifts] = useState<PlanShift[]>(defaultShifts);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const updateShift = (idx: number, value: number) => {
    setShifts((s) => s.map((sh, i) => i === idx ? { ...sh, price: value } : sh));
  };

  const create = async () => {
    if (!name.trim()) { toast.error('Plan name is required'); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from('plans').insert({ name, duration_months: duration, is_active: isActive, shifts, sort_order: 99 });
      if (error) throw error;
      toast.success('Plan created');
      onSaved();
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/60 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-lg text-ink">Add New Plan</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Plan Name *</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Quarterly" />
            </div>
            <div>
              <label className="label">Duration (months) *</label>
              <input type="number" min={1} className="input" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
            </div>
          </div>
          <div>
            <label className="label">Shift Prices (₹)</label>
            <div className="space-y-2">
              {shifts.map((s, i) => (
                <div key={s.shiftName} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-ink w-20 shrink-0">{s.shiftName}</span>
                  <span className="text-xs text-ink-muted w-24 shrink-0">{s.shiftTime}</span>
                  <input type="number" className="input py-1.5" value={s.price} onChange={(e) => updateShift(i, Number(e.target.value))} />
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <Toggle value={isActive} onChange={setIsActive} />
            <span className="text-sm font-medium text-ink">Active (visible on public site)</span>
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={create} disabled={saving} className="btn-primary ml-auto">
            {saving ? 'Creating...' : <><Plus className="w-4 h-4" /> Create Plan</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
