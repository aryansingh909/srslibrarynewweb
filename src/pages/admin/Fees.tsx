import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import {
  CheckCircle2, FileText, MessageCircle, Download, Wallet, AlertTriangle, Clock, X, Trash2,
} from 'lucide-react';
import { supabase, type Booking } from '../../lib/supabase';
import { formatINR, formatDate, statusColor, downloadCSV } from '../../lib/utils';

export default function AdminFees() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [payBooking, setPayBooking] = useState<Booking | null>(null);
  const [deleteBooking, setDeleteBooking] = useState<Booking | null>(null);

  const load = () => {
    supabase.from('bookings').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setBookings(data as Booking[] || []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const summary = useMemo(() => {
    const now = new Date();
    const collectedThisMonth = bookings
      .filter((b) => {
        const d = new Date(b.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, b) => sum + b.paid_amount, 0);
    const pending = bookings.reduce((sum, b) => sum + b.due_amount, 0);
    const overdue = bookings
      .filter((b) => b.due_amount > 0 && new Date(b.created_at) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .reduce((sum, b) => sum + b.due_amount, 0);
    return { collectedThisMonth, pending, overdue };
  }, [bookings]);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (filter === 'paid') return b.payment_status === 'paid';
      if (filter === 'unpaid') return b.payment_status === 'unpaid';
      if (filter === 'partial') return b.payment_status === 'partial';
      if (filter === 'overdue') return b.due_amount > 0 && new Date(b.created_at) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return true;
    });
  }, [bookings, filter]);

  const markPaid = async (amount: number, mode: 'cash' | 'upi') => {
    if (!payBooking) return;
    const newPaid = payBooking.paid_amount + amount;
    const newDue = Math.max(0, payBooking.amount - newPaid);
    const status = newDue === 0 ? 'paid' : 'partial';
    const { error } = await supabase.from('bookings').update({
      paid_amount: newPaid,
      due_amount: newDue,
      payment_status: status,
      payment_mode: mode,
    }).eq('id', payBooking.id);
    if (error) toast.error(error.message);
    else { toast.success('Payment recorded'); setPayBooking(null); load(); }
  };

  const generateReceipt = (b: Booking) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(30, 58, 95);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('SRS Digital Library', 14, 15);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('9th Floor, Tradex Tower, Alpha I, Greater Noida, UP 201310', 14, 22);
    doc.text('Phone: 098005 50047', 14, 27);

    // Title
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('FEE RECEIPT', pageWidth / 2, 45, { align: 'center' });
    doc.setDrawColor(30, 64, 175);
    doc.setLineWidth(0.5);
    doc.line(60, 48, pageWidth - 60, 48);

    // Details
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const rows: [string, string][] = [
      ['Receipt No.', b.booking_id],
      ['Date', formatDate(new Date())],
      ['Member Name', b.member_name],
      ['Phone', b.member_phone],
      ['Plan', b.plan_name],
      ['Shift', `${b.shift} (${b.shift_time})`],
      ['Start Date', formatDate(b.start_date)],
      ['Expiry Date', formatDate(b.expiry_date)],
      ['Seat Number', b.seat_number || '—'],
      ['Total Amount', formatINR(b.amount)],
      ['Amount Paid', formatINR(b.paid_amount)],
      ['Due Amount', formatINR(b.due_amount)],
      ['Payment Mode', b.payment_mode.toUpperCase()],
      ['Payment Status', b.payment_status.toUpperCase()],
    ];
    let y = 60;
    rows.forEach(([k, v]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(k, 14, y);
      doc.setFont('helvetica', 'normal');
      doc.text(v, 80, y);
      y += 10;
    });

    // Stamp area
    y += 10;
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.3);
    doc.rect(pageWidth - 70, y, 50, 25);
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Received by', pageWidth - 45, y + 10, { align: 'center' });
    doc.text('(Library Stamp)', pageWidth - 45, y + 20, { align: 'center' });

    // Footer
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.text('Thank you for choosing SRS Digital Library.', 14, y + 35);
    doc.text('This is a computer-generated receipt and does not require a physical signature.', 14, y + 42);

    doc.save(`Receipt-${b.booking_id}.pdf`);
    toast.success('Receipt downloaded');
  };

  const waReminder = (b: Booking) => {
    const msg = `Dear ${b.member_name}, your fee of ${formatINR(b.due_amount)} is pending at SRS Digital Library. Kindly clear it at the earliest. Thank you!`;
    return `https://wa.me/91${b.member_phone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(msg)}`;
  };

  const deleteEntry = async (b: Booking) => {
    const { error } = await supabase.from('bookings').delete().eq('id', b.id);
    if (error) toast.error(error.message);
    else { toast.success('Entry deleted'); setDeleteBooking(null); load(); }
  };

  const exportCSV = () => {
    downloadCSV('pathshala-fees.csv', filtered.map((b) => ({
      Member: b.member_name,
      Phone: b.member_phone,
      Plan: b.plan_name,
      Shift: b.shift,
      Total: b.amount,
      Paid: b.paid_amount,
      Due: b.due_amount,
      Status: b.payment_status,
      Mode: b.payment_mode,
    })));
    toast.success('CSV exported');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">Fee Tracking</h1>
        <p className="text-ink-muted mt-1">Record cash/UPI payments and generate receipts.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-muted">Collected This Month</p>
              <p className="font-display font-bold text-2xl text-success mt-1">{formatINR(summary.collectedThisMonth)}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-success-light flex items-center justify-center"><Wallet className="w-5 h-5 text-success" /></div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-muted">Total Pending</p>
              <p className="font-display font-bold text-2xl text-warning mt-1">{formatINR(summary.pending)}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-warning-light flex items-center justify-center"><Clock className="w-5 h-5 text-warning" /></div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-muted">Overdue (30+ days)</p>
              <p className="font-display font-bold text-2xl text-error mt-1">{formatINR(summary.overdue)}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-error-light flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-error" /></div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <select className="input max-w-48" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All Records</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
          <option value="partial">Partial</option>
          <option value="overdue">Overdue</option>
        </select>
        <button onClick={exportCSV} className="btn-secondary ml-auto"><Download className="w-4 h-4" /> Export CSV</button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-12" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet className="w-10 h-10 mx-auto text-ink-subtle mb-3" />
            <p className="text-ink-muted">No fee records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-ink-muted">
                  <th className="px-4 py-3 font-medium">Member</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Paid</th>
                  <th className="px-4 py-3 font-medium">Due</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-t border-line hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-ink">{b.member_name}</td>
                    <td className="px-4 py-3 text-ink-muted">{b.member_phone}</td>
                    <td className="px-4 py-3 text-ink">{b.plan_name} · {b.shift}</td>
                    <td className="px-4 py-3 text-ink">{formatINR(b.amount)}</td>
                    <td className="px-4 py-3 text-success">{formatINR(b.paid_amount)}</td>
                    <td className="px-4 py-3 text-error">{formatINR(b.due_amount)}</td>
                    <td className="px-4 py-3"><span className={`badge ${statusColor(b.payment_status)}`}>{b.payment_status}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {b.due_amount > 0 && (
                          <button onClick={() => setPayBooking(b)} className="p-1.5 rounded-lg hover:bg-success-light text-success" aria-label="Mark paid"><CheckCircle2 className="w-4 h-4" /></button>
                        )}
                        <button onClick={() => generateReceipt(b)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-700" aria-label="Receipt"><FileText className="w-4 h-4" /></button>
                        {b.due_amount > 0 && (
                          <a href={waReminder(b)} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg hover:bg-success-light text-success" aria-label="WhatsApp"><MessageCircle className="w-4 h-4" /></a>
                        )}
                        <button onClick={() => setDeleteBooking(b)} className="p-1.5 rounded-lg hover:bg-error-light text-error" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pay modal */}
      <AnimatePresence>
        {payBooking && (
          <PayModal booking={payBooking} onClose={() => setPayBooking(null)} onPay={markPaid} />
        )}
      </AnimatePresence>

      {/* Delete confirmation modal */}
      {deleteBooking && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 flex items-center justify-center p-4" onClick={() => setDeleteBooking(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-lg text-ink">Delete Fee Entry?</h3>
              <button onClick={() => setDeleteBooking(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-ink-muted">
              Are you sure you want to delete the fee record for <span className="font-semibold text-ink">{deleteBooking.member_name}</span> ({deleteBooking.booking_id})? This action cannot be undone.
            </p>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setDeleteBooking(null)} className="btn-ghost">Cancel</button>
              <button onClick={() => deleteEntry(deleteBooking)} className="btn-danger ml-auto"><Trash2 className="w-4 h-4" /> Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function PayModal({ booking, onClose, onPay }: { booking: Booking; onClose: () => void; onPay: (amount: number, mode: 'cash' | 'upi') => void }) {
  const [amount, setAmount] = useState(booking.due_amount);
  const [mode, setMode] = useState<'cash' | 'upi'>('cash');

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/60 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-lg text-ink">Record Payment</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-slate-50 text-sm">
            <p className="text-ink-muted">Member: <span className="font-semibold text-ink">{booking.member_name}</span></p>
            <p className="text-ink-muted">Due: <span className="font-semibold text-error">{formatINR(booking.due_amount)}</span></p>
          </div>
          <div>
            <label className="label">Amount Received (₹)</label>
            <input type="number" className="input" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          </div>
          <div>
            <label className="label">Payment Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setMode('cash')} className={`p-3 rounded-xl border-2 text-sm font-semibold ${mode === 'cash' ? 'border-primary-600 bg-primary-50 text-primary-800' : 'border-line text-ink-muted'}`}>Cash</button>
              <button onClick={() => setMode('upi')} className={`p-3 rounded-xl border-2 text-sm font-semibold ${mode === 'upi' ? 'border-primary-600 bg-primary-50 text-primary-800' : 'border-line text-ink-muted'}`}>UPI</button>
            </div>
          </div>
          <div>
            <label className="label">Payment Date</label>
            <input type="date" className="input" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={() => onPay(amount, mode)} className="btn-success ml-auto"><CheckCircle2 className="w-4 h-4" /> Record Payment</button>
        </div>
      </motion.div>
    </div>
  );
}
