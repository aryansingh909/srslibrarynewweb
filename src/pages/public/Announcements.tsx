import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Pin, Bell, Calendar, PartyPopper, AlertTriangle, Megaphone } from 'lucide-react';
import { supabase, type Announcement } from '../../lib/supabase';
import { formatDateTime } from '../../lib/utils';

const categoryConfig = {
  notice: { icon: Bell, label: 'Notice', color: 'bg-primary-50 text-primary-700' },
  holiday: { icon: Calendar, label: 'Holiday', color: 'bg-warning-light text-warning' },
  event: { icon: PartyPopper, label: 'Event', color: 'bg-success-light text-success' },
  urgent: { icon: AlertTriangle, label: 'Urgent', color: 'bg-error-light text-error' },
};

export default function Announcements() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('announcements').select('*').eq('is_published', true).order('is_pinned', { ascending: false }).order('published_at', { ascending: false })
      .then(({ data }) => {
        setItems(data as Announcement[] || []);
        setLoading(false);
      });
  }, []);

  const pinned = items.filter((a) => a.is_pinned);
  const rest = items.filter((a) => !a.is_pinned);

  return (
    <div>
      <section className="bg-gradient-to-br from-navy-900 to-primary-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display font-bold text-4xl lg:text-5xl text-white">Announcements</h1>
          <p className="text-primary-100 mt-4 max-w-2xl mx-auto">
            Stay updated with the latest notices, events, and holidays at SRS Digital Library.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-32" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <Megaphone className="w-12 h-12 mx-auto text-ink-subtle mb-4" />
            <h3 className="font-display font-semibold text-xl text-ink">No announcements at the moment</h3>
            <p className="text-ink-muted mt-2">Check back soon for updates!</p>
          </div>
        ) : (
          <>
            {pinned.length > 0 && (
              <div className="mb-8">
                <h2 className="font-display font-semibold text-lg text-ink mb-4 flex items-center gap-2">
                  <Pin className="w-5 h-5 text-primary-700" /> Pinned
                </h2>
                <div className="space-y-4">
                  {pinned.map((a, i) => (
                    <AnnouncementCard key={a.id} a={a} delay={i * 0.05} pinned />
                  ))}
                </div>
              </div>
            )}
            {rest.length > 0 && (
              <div className="space-y-4">
                {rest.map((a, i) => (
                  <AnnouncementCard key={a.id} a={a} delay={i * 0.05} />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function AnnouncementCard({ a, delay, pinned }: { a: Announcement; delay: number; pinned?: boolean }) {
  const cfg = categoryConfig[a.category];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className={`card p-6 ${pinned ? 'ring-1 ring-primary-200' : ''}`}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`badge ${cfg.color}`}>
            <cfg.icon className="w-3.5 h-3.5" /> {cfg.label}
          </span>
          {pinned && (
            <span className="badge bg-primary-800 text-white">
              <Pin className="w-3.5 h-3.5" /> Pinned
            </span>
          )}
        </div>
        <span className="text-xs text-ink-subtle">{formatDateTime(a.published_at || a.created_at)}</span>
      </div>
      <h3 className="font-display font-semibold text-lg text-ink mb-2">{a.title}</h3>
      <p className="text-sm text-ink-muted leading-relaxed whitespace-pre-line">{a.body}</p>
    </motion.div>
  );
}
