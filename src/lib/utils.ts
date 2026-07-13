export function formatINR(amount: number | null | undefined): string {
  if (amount == null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date | null): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(date: string | Date | null): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) + ', ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export function daysUntil(date: string | Date | null): number {
  if (!date) return 0;
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function generateBookingId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `SRS-${year}-${random}`;
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function shiftIcon(shift: string): string {
  switch (shift.toLowerCase()) {
    case 'morning': return '🌅';
    case 'evening': return '🌆';
    case 'night': return '🌙';
    case 'full day': return '☀️';
    default: return '📚';
  }
}

export function statusColor(status: string): string {
  switch (status) {
    case 'active':
    case 'confirmed':
    case 'paid':
      return 'bg-success-light text-success';
    case 'pending':
    case 'unpaid':
    case 'partial':
      return 'bg-warning-light text-warning';
    case 'expired':
    case 'rejected':
    case 'cancelled':
    case 'suspended':
      return 'bg-error-light text-error';
    default:
      return 'bg-slate-100 text-ink-muted';
  }
}

export function downloadCSV(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers.map((h) => {
        const val = row[h];
        if (val == null) return '';
        const s = String(val).replace(/"/g, '""');
        return /[",\n]/.test(s) ? `"${s}"` : s;
      }).join(','),
    ),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
