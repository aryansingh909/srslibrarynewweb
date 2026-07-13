import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const supabaseAdmin = createClient(url, anonKey, {
  auth: { persistSession: false },
});

export type PlanShift = {
  shiftName: string;
  shiftTime: string;
  price: number;
  isActive: boolean;
};

export type Plan = {
  id: string;
  name: string;
  duration_months: number;
  is_active: boolean;
  is_archived: boolean;
  sort_order: number;
  shifts: PlanShift[];
  created_at: string;
  updated_at: string;
};

export type Member = {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string;
  address: string | null;
  id_proof_type: string | null;
  id_proof_number: string | null;
  profile_photo: string | null;
  current_plan_id: string | null;
  current_plan_name: string | null;
  current_shift: string | null;
  current_shift_time: string | null;
  current_start_date: string | null;
  current_expiry_date: string | null;
  seat_number: string | null;
  membership_status: 'pending' | 'active' | 'expired' | 'suspended';
  role: string;
  created_at: string;
  updated_at: string;
};

export type Booking = {
  id: string;
  booking_id: string;
  member_id: string | null;
  user_id: string | null;
  member_name: string;
  member_phone: string;
  member_email: string | null;
  plan_id: string | null;
  plan_name: string;
  shift: string;
  shift_time: string;
  amount: number;
  start_date: string;
  expiry_date: string;
  seat_number: string | null;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  payment_mode: 'cash' | 'upi' | 'pending';
  payment_status: 'paid' | 'unpaid' | 'partial';
  paid_amount: number;
  due_amount: number;
  admin_notes: string | null;
  id_proof_type: string | null;
  id_proof_number: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  category: 'notice' | 'holiday' | 'event' | 'urgent';
  is_published: boolean;
  is_pinned: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type GalleryImage = {
  id: string;
  url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
};

export type SiteSettings = {
  id: number;
  library_name: string;
  library_phone: string;
  library_email: string;
  library_address: string;
  total_seats: number;
  seats_morning: number;
  seats_evening: number;
  seats_night: number;
  seats_fullday: number;
  instagram_url: string | null;
  facebook_url: string | null;
  youtube_url: string | null;
  whatsapp_number: string;
  updated_at: string;
};

export type Inquiry = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  is_resolved: boolean;
  created_at: string;
};

export type AdminPermissionKey =
  | 'dashboard' | 'members' | 'bookings' | 'fees' | 'inquiries'
  | 'announcements' | 'plans' | 'seats' | 'gallery' | 'settings';

export const ALL_ADMIN_PERMISSIONS: AdminPermissionKey[] = [
  'dashboard', 'members', 'bookings', 'fees', 'inquiries',
  'announcements', 'plans', 'seats', 'gallery', 'settings',
];

export const PERMISSION_LABELS: Record<AdminPermissionKey, string> = {
  dashboard: 'Dashboard', members: 'Members', bookings: 'Bookings',
  fees: 'Fee Tracking', inquiries: 'Enquiries', announcements: 'Announcements',
  plans: 'Plans & Pricing', seats: 'Seat Management', gallery: 'Gallery', settings: 'Settings',
};

export type AdminPermissions = Partial<Record<AdminPermissionKey, boolean>>;

export type Admin = {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'staff';
  permissions?: AdminPermissions;
  created_at?: string;
};
