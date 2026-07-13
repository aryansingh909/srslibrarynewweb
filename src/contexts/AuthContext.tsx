import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, type Member } from '../lib/supabase';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  member: Member | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null; data: unknown }>;
  signOut: () => Promise<void>;
  refreshMember: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMember = async (uid: string, email?: string) => {
    let query = supabase.from('members').select('*').eq('user_id', uid);
    const { data } = await query.maybeSingle();
    if (data) {
      setMember(data as Member);
      return;
    }
    if (email) {
      const { data: byEmail } = await supabase
        .from('members')
        .select('*')
        .eq('email', email.toLowerCase())
        .maybeSingle();
      if (byEmail) setMember(byEmail as Member);
    }
  };

  useEffect(() => {
    let initialDone = false;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        loadMember(data.session.user.id, data.session.user.email).finally(() => { setLoading(false); initialDone = true; });
      } else {
        setLoading(false);
        initialDone = true;
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        (async () => {
          await loadMember(sess.user.id, sess.user.email);
          if (!initialDone) { setLoading(false); initialDone = true; }
        })();
      } else {
        setMember(null);
        if (!initialDone) { setLoading(false); initialDone = true; }
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null, data };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setMember(null);
  };

  const refreshMember = async () => {
    if (user) await loadMember(user.id, user.email);
  };

  return (
    <AuthContext.Provider value={{ session, user, member, loading, signIn, signUp, signOut, refreshMember }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
