import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Lock, Mail, Shield, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@srsdigitalibrary.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAdmin();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await login(email, password);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Welcome back, Admin!');
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 via-primary-800 to-navy-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-glow p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-primary-800 flex items-center justify-center mb-4">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-display font-bold text-2xl text-ink">Admin Panel</h1>
            <p className="text-sm text-ink-muted mt-1">SRS Digital Library Management</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-ink-subtle" />
                <input type="email" required className="input pl-10" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-ink-subtle" />
                <input type={showPassword ? 'text' : 'password'} required className="input pl-10 pr-10" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-2.5 text-ink-subtle hover:text-ink transition-colors" tabIndex={-1}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in...' : <>Sign In <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-6 p-3 rounded-xl bg-primary-50 text-xs text-ink-muted text-center">
            Default: <span className="font-mono font-semibold">admin@srsdigitalibrary.com</span> / <span className="font-mono font-semibold">SRS@Admin123</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
