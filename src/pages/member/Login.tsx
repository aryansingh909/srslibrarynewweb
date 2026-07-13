import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Mail, Lock, LogIn, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function MemberLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Welcome back!');
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="card p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-primary-800 flex items-center justify-center mb-4">
              <LogIn className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-display font-bold text-2xl text-ink">Member Login</h1>
            <p className="text-sm text-ink-muted mt-1">Welcome back to SRS Digital Library</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-ink-subtle" />
                <input type="email" required className="input pl-10" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-ink-subtle" />
                <input type={showPassword ? 'text' : 'password'} required className="input pl-10 pr-10" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-2.5 text-ink-subtle hover:text-ink transition-colors" tabIndex={-1}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in...' : <>Sign In <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-ink-muted">
            New to SRS?{' '}
            <Link to="/book" className="text-primary-700 font-semibold hover:underline">
              Book a seat to register
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
