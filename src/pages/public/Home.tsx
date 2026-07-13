import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Snowflake, Camera, Lock, Droplets, Wifi, Star, Users, Clock, Armchair,
  Volume2, ShieldCheck, Heart, ArrowRight, Phone, MapPin, Sunrise, Sunset, Moon, Sun,
  GraduationCap, BookOpen, Car, Zap, CheckCircle2, MessageCircle, ChevronRight,
} from 'lucide-react';
import { supabase, type Plan, type SiteSettings, type GalleryImage } from '../../lib/supabase';
import { formatINR } from '../../lib/utils';

const amenities = [
  { icon: Snowflake, label: 'Air-Conditioned', desc: 'Cool, comfortable study environment all day' },
  { icon: Wifi, label: 'Free WiFi', desc: 'High-speed internet for research and online learning' },
  { icon: Zap, label: '24x7 Power Backup', desc: 'Never lose study time during power cuts' },
  { icon: Camera, label: 'CCTV Surveillance', desc: 'Secure premises monitored round the clock' },
  { icon: Car, label: 'Parking Available', desc: 'Convenient parking for two-wheelers and vehicles' },
  { icon: Droplets, label: 'Clean Washroom', desc: 'Well-maintained, hygienic washroom facilities' },
];

const whyChoose = [
  { icon: Volume2, title: 'Peaceful Environment', desc: 'A quiet, focused atmosphere designed for serious study.' },
  { icon: Armchair, title: 'Comfortable Seating', desc: 'Ergonomic chairs and wide personal desks for long study hours.' },
  { icon: Clock, title: 'Open All Days', desc: 'Study any day, including public holidays. Call to confirm timings.' },
  { icon: ShieldCheck, title: 'Safe & Secure', desc: 'CCTV at all entry and exit points for your peace of mind.' },
  { icon: Heart, title: 'Friendly Staff', desc: 'Helpful and respectful library staff always present.' },
  { icon: GraduationCap, title: 'University Counselling', desc: 'Official academic counsellor for Mangalayatan University online degrees.' },
];

const programs = [
  { name: 'BA (Online)', level: 'Undergraduate', desc: 'Bachelor of Arts — flexible online learning' },
  { name: 'BCA (Online)', level: 'Undergraduate · Lateral Entry', desc: 'Bachelor of Computer Applications' },
  { name: 'MCA (Online)', level: 'Postgraduate', desc: 'Master of Computer Applications' },
  { name: 'MBA — Marketing', level: 'Postgraduate', desc: 'Master of Business Administration' },
];

const steps = [
  { icon: MessageCircle, title: 'Enquire', desc: 'Fill in a quick form or call us. Tell us your qualification and the programme you\'re interested in.' },
  { icon: Phone, title: 'Counselling Call', desc: 'We contact you, answer every question, and help you choose the right programme for your career goals.' },
  { icon: GraduationCap, title: 'Enroll Online', desc: 'Complete enrollment from our library — no city travel needed. Study right here at your convenience.' },
];

const testimonials = [
  { name: 'Amit Rajput', text: 'I recently joined the library and it has quickly become one of my favorite study spots. What truly stands out is the peaceful and focused study environment.' },
  { name: 'Rashmi Tomar', text: 'The facilities of library are very good. The environment is very peaceful — no voice or any type of disturbance. Librarian & receptionist behave very well.' },
  { name: 'Verified Student', text: 'Mind blowing place to study peacefully. Overall good behavior of staff. Highly recommended for serious aspirants.' },
];

export default function Home() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    supabase.from('plans').select('*').eq('is_active', true).order('sort_order')
      .then(({ data }) => setPlans(data as Plan[] || []));
    supabase.from('site_settings').select('*').eq('id', 1).maybeSingle()
      .then(({ data }) => setSettings(data as SiteSettings));
    supabase.from('gallery_images').select('*').order('sort_order').limit(4)
      .then(({ data }) => setGalleryImages(data as GalleryImage[] || []));
  }, []);

  const getStartingPrice = (plan: Plan) => {
    const active = plan.shifts.filter((s) => s.isActive);
    if (!active.length) return null;
    return Math.min(...active.map((s) => s.price));
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-primary-800 to-primary-700">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur text-primary-100 text-sm font-medium mb-6">
              <MapPin className="w-4 h-4" /> Barsethi, Jaunpur
            </span>
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-white leading-tight tracking-tight">
              Your Local Library,{' '}
              <span className="text-primary-300">Your Path to a University Degree</span>
            </h1>
            <p className="mt-6 text-lg text-primary-100 leading-relaxed max-w-2xl italic">
              "अब शहर जाकर ज़्यादा खर्चा उठाने की ज़रूरत नहीं है।"
            </p>
            <p className="mt-2 text-base text-primary-200 leading-relaxed max-w-2xl">
              No need to go to the city and spend a lot of money anymore. Study right here, at your own convenience, and earn your Bachelor's and Master's degree.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/book" className="btn bg-white text-primary-800 hover:bg-primary-50 shadow-glow">
                Book a Seat <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/programs" className="btn border border-white/30 text-white hover:bg-white/10">
                <GraduationCap className="w-4 h-4" /> View Online Degrees
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              { icon: Snowflake, label: 'AC Reading Room', sub: 'Cool & comfortable' },
              { icon: Wifi, label: 'Free WiFi', sub: 'High-speed' },
              { icon: Zap, label: '24x7 Power Backup', sub: 'Uninterrupted' },
              { icon: Camera, label: 'CCTV Security', sub: 'Round the clock' },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
                <s.icon className="w-5 h-5 text-primary-300 mb-2" />
                <div className="text-lg font-display font-bold text-white">{s.label}</div>
                <div className="text-sm text-primary-200">{s.sub}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Hero image */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl overflow-hidden shadow-glow border-4 border-white"
        >
          <img
            src="https://jmaqjjpqmrdedvwzpuhq.supabase.co/storage/v1/object/public/images/outside%20room.jpeg"
            alt="SRS Digital Library reading room"
            className="w-full h-[300px] sm:h-[400px] object-cover"
          />
        </motion.div>
      </section>

      {/* Why Study With Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-primary-700 font-semibold text-sm uppercase tracking-wider">World-Class Study Environment</span>
          <h2 className="font-display font-bold text-3xl lg:text-4xl text-ink mt-2">Why Study With Us?</h2>
          <p className="text-ink-muted mt-3">Everything you need to focus and succeed — right here in Barsethi, without the city commute.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {amenities.map((a, i) => (
            <motion.div
              key={a.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="card p-6 hover:shadow-soft transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
                <a.icon className="w-6 h-6 text-primary-700" />
              </div>
              <h3 className="font-display font-semibold text-lg text-ink mb-1.5">{a.label}</h3>
              <p className="text-sm text-ink-muted leading-relaxed">{a.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* University Counselling Centre */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100 text-primary-800 text-sm font-semibold mb-4">
              <ShieldCheck className="w-4 h-4" /> Officially Recognized
            </span>
            <h2 className="font-display font-bold text-3xl lg:text-4xl text-ink">
              University Counselling Centre
            </h2>
            <p className="text-ink-muted mt-4 text-lg leading-relaxed">
              SRS Digital Library is an officially appointed{' '}
              <strong className="text-primary-800">Academic Counsellor</strong> for{' '}
              <strong className="text-primary-800">Mangalayatan University</strong>, Aligarh —
              a NAAC A+ accredited institution recognized by the Government of India.
            </p>
            <p className="text-sm text-ink-subtle mt-3">
              Appointment Ref: MU/ALI//2026-27/254, dated 21-05-2026
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="card p-8"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary-800 flex items-center justify-center mb-5">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-display font-bold text-2xl text-ink mb-3">Mangalayatan University, Aligarh</h3>
              <div className="space-y-2.5">
                {[
                  'NAAC A+ Accredited',
                  'Recognized by the Government of India',
                  'Online degree programmes — valid for jobs and higher studies',
                  'No city travel needed — enroll from our library',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    <span className="text-sm text-ink">{item}</span>
                  </div>
                ))}
              </div>
              <Link to="/programs" className="btn-primary mt-6">
                View Degree Programmes <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl overflow-hidden shadow-glow"
            >
              <img
                src="https://jmaqjjpqmrdedvwzpuhq.supabase.co/storage/v1/object/public/images/inside%20room%20ac%20-%20Copy.jpeg"
                alt="AC study room at SRS Digital Library"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Online Degree Programmes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-primary-700 font-semibold text-sm uppercase tracking-wider">Online Degree Programmes</span>
          <h2 className="font-display font-bold text-3xl lg:text-4xl text-ink mt-2">Earn a Degree Without Leaving Your Town</h2>
          <p className="text-ink-muted mt-3">Choose from Bachelor's and Master's programmes from Mangalayatan University — valid for jobs and higher studies across India.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {programs.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="card p-6 hover:shadow-soft hover:-translate-y-1 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-primary-700" />
              </div>
              <h3 className="font-display font-semibold text-lg text-ink">{p.name}</h3>
              <p className="text-xs text-primary-700 font-medium mt-1">{p.level}</p>
              <p className="text-sm text-ink-muted mt-2">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-primary-700 font-semibold text-sm uppercase tracking-wider">Simple 3-Step Process</span>
            <h2 className="font-display font-bold text-3xl lg:text-4xl text-ink mt-2">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative text-center"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-800 flex items-center justify-center mb-5 shadow-soft">
                  <s.icon className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary-100 text-primary-800 font-display font-bold text-sm flex items-center justify-center">
                  {i + 1}
                </div>
                <h3 className="font-display font-semibold text-xl text-ink mb-2">{s.title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed max-w-xs mx-auto">{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-line" style={{ zIndex: -1 }} />
                )}
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/programs" className="btn-primary">
              Explore Programmes <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="bg-primary-50/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-primary-700 font-semibold text-sm uppercase tracking-wider">Why SRS</span>
            <h2 className="font-display font-bold text-3xl lg:text-4xl text-ink mt-2">Why Choose SRS Digital Library?</h2>
            <p className="text-ink-muted mt-3">Everything you need for serious, distraction-free study.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChoose.map((w, i) => (
              <motion.div
                key={w.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="p-6 rounded-2xl bg-white border border-line hover:border-primary-200 hover:shadow-soft transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-primary-800 flex items-center justify-center mb-4">
                  <w.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-display font-semibold text-lg text-ink mb-1.5">{w.title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{w.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Preview */}
      {plans.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-primary-700 font-semibold text-sm uppercase tracking-wider">Pricing</span>
            <h2 className="font-display font-bold text-3xl lg:text-4xl text-ink mt-2">Plans for Every Goal</h2>
            <p className="text-ink-muted mt-3">Simple, transparent pricing. No hidden charges.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p, i) => {
              const start = getStartingPrice(p);
              const isPopular = p.duration_months === 6;
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className={`card p-7 relative ${isPopular ? 'ring-2 ring-primary-600 shadow-glow' : ''}`}
                >
                  {isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary-700 text-white text-xs font-semibold">
                      Most Popular
                    </span>
                  )}
                  <h3 className="font-display font-bold text-xl text-ink">{p.name}</h3>
                  <p className="text-sm text-ink-muted mt-1">{p.duration_months} Month{p.duration_months > 1 ? 's' : ''}</p>
                  <div className="mt-5">
                    {start != null ? (
                      <>
                        <p className="text-sm text-ink-subtle">Starting from</p>
                        <p className="font-display font-bold text-3xl text-primary-800">{formatINR(start)}</p>
                      </>
                    ) : (
                      <p className="text-sm text-ink-subtle">Pricing unavailable</p>
                    )}
                  </div>
                  <Link to="/plans" className={`mt-6 w-full ${isPopular ? 'btn-primary' : 'btn-secondary'}`}>
                    See Full Pricing <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Gallery Preview */}
      {galleryImages.length > 0 && (
        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-primary-700 font-semibold text-sm uppercase tracking-wider">Inside Our Library</span>
              <h2 className="font-display font-bold text-3xl lg:text-4xl text-ink mt-2">See for Yourself</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {galleryImages.map((img, i) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="rounded-2xl overflow-hidden group relative aspect-square"
                >
                  <img src={img.url} alt={img.caption || 'Gallery image'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {img.caption && (
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <p className="text-white text-sm font-medium">{img.caption}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/gallery" className="btn-secondary">
                View Full Gallery <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-primary-700 font-semibold text-sm uppercase tracking-wider">Reviews</span>
            <h2 className="font-display font-bold text-3xl lg:text-4xl text-ink mt-2">What Our Students Say</h2>
            <p className="text-ink-muted mt-3">Real reviews from our students.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="card p-6"
              >
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-ink-muted text-sm leading-relaxed italic">"{t.text}"</p>
                <div className="mt-5 pt-4 border-t border-line">
                  <p className="font-semibold text-ink text-sm">{t.name}</p>
                  <p className="text-xs text-success flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3 h-3" /> Verified Review
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Location CTA */}
      <section className="bg-primary-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="font-display font-bold text-3xl lg:text-4xl text-white">
                Visit SRS Digital Library
              </h2>
              <p className="text-primary-100 mt-4 text-lg">
                Your local digital library and authorized Mangalayatan University Academic Counselling Centre. Study locally, earn a university degree.
              </p>
              <div className="mt-6 space-y-3">
                <p className="flex items-start gap-3 text-primary-100">
                  <MapPin className="w-5 h-5 mt-0.5 shrink-0" />
                  {settings?.library_address || 'Hasiya, Barsethi, Jaunpur — Near Miya Ka Chak Tiraha, beside Holy Angel English School'}
                </p>
                <p className="flex items-center gap-3 text-primary-100">
                  <Clock className="w-5 h-5" /> Open all days including public holidays. Call for timings.
                </p>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link to="/contact" className="btn bg-white text-primary-800 hover:bg-primary-50">
                  <MapPin className="w-4 h-4" /> Get Directions
                </Link>
                <Link to="/book" className="btn border border-white/30 text-white hover:bg-white/10">
                  Book a Seat <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-glow border-4 border-white/20">
              <iframe
                title="SRS Digital Library Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3598.665473756508!2d82.48075357524816!3d25.58279407746474!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399019007038cfe9%3A0x74a143c5f33ac72b!2sSRS%20Digital%20Library!5e0!3m2!1sen!2sin!4v1783937225107!5m2!1sen!2sin"
                width="100%"
                height="360"
                loading="lazy"
                style={{ border: 0 }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-navy-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-bold text-3xl lg:text-4xl text-white">
            Ready to Join?
          </h2>
          <p className="text-slate-300 mt-3 max-w-xl mx-auto">
            Reserve your seat today or inquire about online degree programmes. We'll call you within 24 hours.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/book" className="btn bg-primary-600 text-white hover:bg-primary-700">
              Register Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/programs" className="btn border border-white/30 text-white hover:bg-white/10">
              <GraduationCap className="w-4 h-4" /> Explore Degrees
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
