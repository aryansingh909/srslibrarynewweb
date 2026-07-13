import { createContext, useContext, useState, type ReactNode } from 'react';
import { supabase, type Admin, type AdminPermissionKey } from '../lib/supabase';

type AdminContextType = {
  admin: Admin | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => void;
  hasPermission: (key: AdminPermissionKey) => boolean;
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const STORAGE_KEY = 'pathshala_admin';

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) as Admin : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-login`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || 'Login failed' };
      }
      const adminData = data.admin as Admin;
      // Fetch full row (includes permissions + created_at) since edge fn may return minimal fields
      const { data: row } = await supabase
        .from('admins')
        .select('id, name, email, role, permissions, created_at')
        .eq('id', adminData.id)
        .maybeSingle();
      const enriched: Admin = row ?? adminData;
      setAdmin(enriched);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(enriched));
      return { error: null };
    } catch (err) {
      return { error: (err as Error).message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const hasPermission = (key: AdminPermissionKey): boolean => {
    if (!admin) return false;
    if (admin.role === 'superadmin') return true;
    return admin.permissions?.[key] === true;
  };

  return (
    <AdminContext.Provider value={{ admin, loading, login, logout, hasPermission }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}
