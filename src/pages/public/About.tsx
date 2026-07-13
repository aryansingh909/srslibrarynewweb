import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Snowflake, Camera, Lock, Droplets, Wifi, Star, Users, Clock, MapPin, ArrowRight,
  ShieldCheck, Heart, Volume2, Armchair, Car, Zap, GraduationCap, BookOpen, CheckCircle2,
} from 'lucide-react';

const stats = [
  { icon: Star, label: '4.9 Rating', sub: 'On Google Reviews' },
  { icon: Users, label: '507+ Reviews', sub: 'Verified students' },
  { icon: Clock, label: 'Open All Days', sub: 'Including holidays' },
  { icon: GraduationCap, label: 'University Partner', sub: 'Mangalayatan University' },
];

const amenities = [
  { icon: Snowflake, label: 'Fully Air-Conditioned Reading Room', desc: 'Beat the Jaunpur heat year-round. Our AC room keeps you cool and comfortable so you can focus entirely on your studies, even in peak summer.' },
  { icon: Wifi, label: 'Free High-Speed WiFi', desc: 'Reliable internet for research, accessing your LMS portal, downloading study materials, and video sessions — all included at no extra charge.' },
  { icon: Zap, label: '24x7 Power Backup', desc: 'No more study interruptions during power cuts. Our uninterrupted power supply keeps the lights, fans, AC, and WiFi running without a break.' },
  { icon: Camera, label: 'CCTV Surveillance', desc: 'Your safety is our priority. The entire premises — inside and outside — is monitored by CCTV cameras 24 hours a day for a safe study environment.' },
  { icon: Car, label: 'Parking Available', desc: 'Convenient parking space for two-wheelers and vehicles. No need to worry about where to leave your vehicle while you study.' },
  { icon: Droplets, label: 'Clean Washroom', desc: 'Well-maintained, hygienic washroom available on premises. We take cleanliness seriously so you can study in comfort throughout the day.' },
];

const whyChoose = [
  { icon: Volume2, title: 'Peaceful Environment', desc: 'A quiet, focused atmosphere designed for serious study.' },
  { icon: Armchair, title: 'Comfortable Seating', desc: 'Ergonomic chairs and wide personal desks for long study hours.' },
  { icon: ShieldCheck, title: 'Safe & Secure', desc: 'CCTV at all entry and exit points for your peace of mind.' },
  { icon: Heart, title: 'Friendly Staff', desc: 'Helpful and respectful library staff always present.' },
];

export default function About() {
  return (
    <div>
      <section className="bg-gradient-to-br from-navy-900 to-primary-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display font-bold text-4xl lg:text-5xl text-white">About SRS Digital Library</h1>
          <p className="text-primary-100 mt-4 max-w-2xl mx-auto text-lg">
            Study Smart. Study Local.
          </p>
          <p className="text-primary-200 mt-2 max-w-2xl mx-auto">
            A modern digital library in Barsethi, Jaunpur — built for students who deserve a world-class study environment without the city commute.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="card p-6 text-center"
            >
              <s.icon className="w-8 h-8 mx-auto text-primary-700 mb-3" />
              <p className="font-display font-bold text-xl text-ink">{s.label}</p>
              <p className="text-sm text-ink-muted mt-1">{s.sub}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-primary-700 font-semibold text-sm uppercase tracking-wider">Our Story</span>
              <h2 className="font-display font-bold text-3xl text-ink mt-2 mb-4">Bringing Opportunity Closer to Home</h2>
              <p className="text-ink-muted leading-relaxed mb-4">
                SRS Digital Library was founded with a simple but powerful belief: students in small towns deserve the same quality learning environment as students in big cities. Located in Hasiya, Barsethi, Jaunpur, we serve students from across the district who want to study seriously but can't or don't want to move to a city.
              </p>
              <p className="text-ink-muted leading-relaxed mb-4">
                Our library features a fully air-conditioned reading room, free WiFi, 24x7 power backup, and CCTV security — everything a dedicated student needs to focus and succeed.
              </p>
              <p className="text-ink-muted leading-relaxed">
                We are also officially appointed as an <strong className="text-primary-800">Academic Counsellor</strong> for <strong className="text-primary-800">Mangalayatan University</strong>, Aligarh — a NAAC A+ accredited university. This means students can not only study here, but also enroll in government-recognized online BA, BCA, MCA, and MBA programmes — right from our library, without traveling to Aligarh or any other city.
              </p>
              <Link to="/programs" className="btn-primary mt-6">
                View Online Degrees <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-glow">
              <img
                src="https://jmaqjjpqmrdedvwzpuhq.supabase.co/storage/v1/object/public/images/Cctvoutsideroom%20-%20Copy.jpeg"
                alt="Students studying at SRS Digital Library"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-primary-700 font-semibold text-sm uppercase tracking-wider">What We Offer</span>
          <h2 className="font-display font-bold text-3xl text-ink mt-2">Library Facilities</h2>
          <p className="text-ink-muted mt-3">Everything carefully designed to give you the best possible study experience.</p>
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
              <h3 className="font-display font-semibold text-lg text-ink mb-2">{a.label}</h3>
              <p className="text-sm text-ink-muted leading-relaxed">{a.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-primary-700 font-semibold text-sm uppercase tracking-wider">Why SRS</span>
            <h2 className="font-display font-bold text-3xl text-ink mt-2">Why Students Choose Us</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChoose.map((w, i) => (
              <motion.div
                key={w.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="text-center"
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-primary-800 flex items-center justify-center mb-4">
                  <w.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-display font-semibold text-lg text-ink mb-1.5">{w.title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{w.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary-50/50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-primary-700 font-semibold text-sm uppercase tracking-wider">Library Timings</span>
          <h2 className="font-display font-bold text-3xl text-ink mt-2 mb-4">When Can You Study?</h2>
          <p className="text-ink-muted text-lg">
            Open all days including public holidays. Timings may vary — call to confirm.
          </p>
          <Link to="/contact" className="btn-primary mt-6">
            <Phone className="w-4 h-4" /> Contact Us
          </Link>
        </div>
      </section>

      <section className="bg-primary-800 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="font-display font-bold text-3xl text-white">Visit Us</h2>
            <p className="text-primary-100 mt-2 flex items-center justify-center gap-2">
              <MapPin className="w-5 h-5" /> Hasiya, Barsethi, Jaunpur, Uttar Pradesh
            </p>
            <p className="text-primary-200 mt-1 text-sm">Near Miya Ka Chak Tiraha, beside Holy Angel English School</p>
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
      </section>

      <section className="bg-navy-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-bold text-3xl text-white">Ready to Join?</h2>
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

function Phone({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
