import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { MapPin, Phone, Mail, Clock, Send, Instagram, Facebook, Youtube, MessageCircle } from 'lucide-react';
import { supabase, type SiteSettings } from '../../lib/supabase';

export default function Contact() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.from('site_settings').select('*').eq('id', 1).maybeSingle()
      .then(({ data }) => setSettings(data as SiteSettings));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('inquiries').insert({
        name: form.name,
        phone: form.phone,
        email: form.email || null,
        message: form.message,
      });
      if (error) throw error;
      toast.success('Message sent! We will get back to you soon.');
      setForm({ name: '', phone: '', email: '', message: '' });
    } catch (err) {
      toast.error((err as Error).message || 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <section className="bg-gradient-to-br from-navy-900 to-primary-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display font-bold text-4xl lg:text-5xl text-white">Get in Touch</h1>
          <p className="text-primary-100 mt-4 max-w-2xl mx-auto">
            Have a question? Want to visit? We're here to help — call, message, or come see us.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-5">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary-700" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-ink">Find Us</h3>
                  <p className="text-sm text-ink-muted mt-1">{settings?.library_address || 'Hasiya, Barsethi, Jaunpur — Near Miya Ka Chak Tiraha, beside Holy Angel English School'}</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-primary-700" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-ink">Call Us</h3>
                  <a href="tel:9415660616" className="text-[#0B3D91] hover:text-[#F97316] font-small text-lg transition-colors">
                      +91 94156 60616
                    </a>
                  <br />
                  <a href="tel:9415660616" className="text-[#0B3D91] hover:text-[#F97316] font-small text-lg transition-colors">
                      +91 9730469473
                    </a>
                    {/* <p className="text-sm text-ink-muted mt-1">Call us for current timings and enquiries.</p> */}
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-primary-700" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-ink">Email</h3>
                  <a href={`mailto:${settings?.library_email || 'krishnakumarsingh909@gmail.com'}`} className="text-sm text-primary-700 hover:underline mt-1 block">
                    {settings?.library_email || 'krishnakumarsingh909@gmail.com'}
                  </a>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-primary-700" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-ink">Hours</h3>
                  <p className="text-sm text-ink-muted mt-1">Open all days including public holidays. Call for current timings.</p>
                </div>
              </div>
            </motion.div>

            {settings && (
              <div className="flex gap-3">
                {settings.instagram_url && <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="w-11 h-11 rounded-xl bg-white border border-line flex items-center justify-center hover:bg-primary-50 hover:border-primary-300 transition-colors" aria-label="Instagram"><Instagram className="w-5 h-5 text-primary-700" /></a>}
                {settings.facebook_url && <a href={settings.facebook_url} target="_blank" rel="noreferrer" className="w-11 h-11 rounded-xl bg-white border border-line flex items-center justify-center hover:bg-primary-50 hover:border-primary-300 transition-colors" aria-label="Facebook"><Facebook className="w-5 h-5 text-primary-700" /></a>}
                {settings.youtube_url && <a href={settings.youtube_url} target="_blank" rel="noreferrer" className="w-11 h-11 rounded-xl bg-white border border-line flex items-center justify-center hover:bg-primary-50 hover:border-primary-300 transition-colors" aria-label="YouTube"><Youtube className="w-5 h-5 text-primary-700" /></a>}
                {settings.whatsapp_number && <a href={`https://wa.me/${settings.whatsapp_number}`} target="_blank" rel="noreferrer" className="w-11 h-11 rounded-xl bg-white border border-line flex items-center justify-center hover:bg-success-light hover:border-success transition-colors" aria-label="WhatsApp"><MessageCircle className="w-5 h-5 text-success" /></a>}
              </div>
            )}
          </div>

          <div className="card p-6">
            <h2 className="font-display font-semibold text-xl text-ink mb-5">Send Us a Message</h2>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="label">Name *</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
              </div>
              <div>
                <label className="label">Phone *</label>
                <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Your phone number" />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
              </div>
              <div>
                <label className="label">Message *</label>
                <textarea className="input" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="How can we help you?" />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? 'Sending...' : <>Send Message <Send className="w-4 h-4" /></>}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-10 rounded-2xl overflow-hidden shadow-card border border-line">
          <iframe
            title="SRS Digital Library Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3598.665473756508!2d82.48075357524816!3d25.58279407746474!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399019007038cfe9%3A0x74a143c5f33ac72b!2sSRS%20Digital%20Library!5e0!3m2!1sen!2sin!4v1783937225107!5m2!1sen!2sin"
            width="100%"
            height="360"
            loading="lazy"
            style={{ border: 0 }}
          />
        </div>
      </section>
    </div>
  );
}
