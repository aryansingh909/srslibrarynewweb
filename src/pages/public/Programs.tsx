import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  GraduationCap, BookOpen, CheckCircle2, ArrowRight, ShieldCheck, Award,
  Users, Clock, FileText, Phone, MessageCircle, Star, Building2, ArrowLeftRight,
} from 'lucide-react';

const programs = [
  {
    name: 'BA (Online)',
    level: 'Undergraduate',
    desc: 'Bachelor of Arts — flexible online learning from Mangalayatan University.',
    duration: '3 Years (6 Semesters)',
    eligibility: '10+2 from a recognized board',
    icon: BookOpen,
    highlights: ['Flexible online classes', 'Recognized degree', 'Affordable fees'],
  },
  {
    name: 'BCA (Online)',
    level: 'Undergraduate · Lateral Entry Available',
    desc: 'Bachelor of Computer Applications — build IT skills for the digital economy.',
    duration: '3 Years (6 Semesters)',
    eligibility: '10+2 from a recognized board',
    icon: BookOpen,
    highlights: ['Lateral entry available', 'Industry-relevant curriculum', 'IT-focused'],
  },
  {
    name: 'MCA (Online)',
    level: 'Postgraduate',
    desc: 'Master of Computer Applications — advanced computing and software development.',
    duration: '2 Years (4 Semesters)',
    eligibility: 'BCA or equivalent degree',
    icon: GraduationCap,
    highlights: ['Advanced specializations', 'Software development focus', 'Career advancement'],
  },
  {
    name: 'MBA — Marketing',
    level: 'Postgraduate',
    desc: 'Master of Business Administration — Marketing specialization for business leaders.',
    duration: '2 Years (4 Semesters)',
    eligibility: 'Bachelor\'s degree in any discipline',
    icon: GraduationCap,
    highlights: ['Marketing specialization', 'Leadership skills', 'Industry networking'],
  },
];

const steps = [
  { icon: MessageCircle, title: 'Enquire', desc: 'Fill in a quick form or call us. Tell us your qualification and the programme you\'re interested in.' },
  { icon: Phone, title: 'Counselling Call', desc: 'We contact you, answer every question, and help you choose the right programme for your career goals.' },
  { icon: GraduationCap, title: 'Enroll Online', desc: 'Complete enrollment from our library — no city travel needed. Study right here at your convenience.' },
];

const accreditation = [
  { icon: Award, label: 'NAAC A+ Accredited', desc: 'High-quality education standards certified by NAAC.' },
  { icon: ShieldCheck, label: 'Government Recognized', desc: 'Degrees recognized by the Government of India.' },
  { icon: CheckCircle2, label: 'Valid for Jobs & Higher Studies', desc: 'Online degrees valid across India for employment and further education.' },
  { icon: Building2, label: 'Mangalayatan University, Aligarh', desc: 'Established university with a strong academic reputation.' },
];

export default function Programs() {
  return (
    <div>
      <section className="bg-gradient-to-br from-navy-900 via-primary-800 to-primary-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur text-primary-100 text-sm font-medium mb-4">
            <ShieldCheck className="w-4 h-4" /> Officially Appointed Counselling Centre
          </span>
          <h1 className="font-display font-bold text-4xl lg:text-5xl text-white">
            Online Degree Programmes
          </h1>
          <p className="text-primary-100 mt-4 max-w-2xl mx-auto text-lg">
            Earn a Bachelor's or Master's degree from Mangalayatan University — a NAAC A+ accredited institution — without leaving your town.
          </p>
        </div>
      </section>

      <section className="bg-primary-50/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {accreditation.map((a, i) => (
              <motion.div
                key={a.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="card p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-800 flex items-center justify-center mb-4">
                  <a.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-display font-semibold text-base text-ink mb-1.5">{a.label}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{a.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-primary-700 font-semibold text-sm uppercase tracking-wider">Programmes</span>
          <h2 className="font-display font-bold text-3xl lg:text-4xl text-ink mt-2">Choose Your Programme</h2>
          <p className="text-ink-muted mt-3">Bachelor's and Master's programmes valid for jobs and higher studies across India.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {programs.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="card p-7 hover:shadow-soft transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center shrink-0">
                  <p.icon className="w-7 h-7 text-primary-700" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-xl text-ink">{p.name}</h3>
                  <span className="inline-block mt-1 text-xs font-semibold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-full">{p.level}</span>
                </div>
              </div>
              <p className="text-sm text-ink-muted mt-4 leading-relaxed">{p.desc}</p>
              <div className="mt-5 space-y-2.5">
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-ink-subtle">Duration</span>
                    <p className="text-sm font-medium text-ink">{p.duration}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-ink-subtle">Eligibility</span>
                    <p className="text-sm font-medium text-ink">{p.eligibility}</p>
                  </div>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {p.highlights.map((h) => (
                  <span key={h} className="inline-flex items-center gap-1 text-xs text-success bg-success-light px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> {h}
                  </span>
                ))}
              </div>
              <Link to="/contact" className="btn-secondary w-full mt-6">
                Enquire About This Programme <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-primary-700 font-semibold text-sm uppercase tracking-wider">Simple 3-Step Process</span>
            <h2 className="font-display font-bold text-3xl lg:text-4xl text-ink mt-2">How It Works</h2>
            <p className="text-ink-muted mt-3">From enquiry to enrollment — we guide you at every step.</p>
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary-50/50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-8">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-primary-800 flex items-center justify-center shrink-0">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1 text-center lg:text-left">
                <h3 className="font-display font-bold text-2xl text-ink">Mangalayatan University, Aligarh</h3>
                <p className="text-ink-muted mt-2">NAAC A+ Accredited · Recognized by the Government of India</p>
                <p className="text-sm text-ink-subtle mt-2">Appointment Ref: MU/ALI//2026-27/254 · Dated: 21-05-2026</p>
              </div>
              <div className="flex flex-col gap-2">
                <Link to="/contact" className="btn-primary">
                  <Phone className="w-4 h-4" /> Enquire Now
                </Link>
                <Link to="/book" className="btn-secondary">
                  Visit Library <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-navy-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-bold text-3xl text-white">Ready to Start Your Degree?</h2>
          <p className="text-slate-300 mt-3 max-w-xl mx-auto">
            Contact us today for a free counselling session. We'll help you choose the right programme and guide you through enrollment.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/contact" className="btn bg-primary-600 text-white hover:bg-primary-700">
              <MessageCircle className="w-4 h-4" /> Get Free Counselling
            </Link>
            <Link to="/" className="btn border border-white/30 text-white hover:bg-white/10">
              Back to Home <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
