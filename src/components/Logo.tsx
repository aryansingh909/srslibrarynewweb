import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export default function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link to="/" onClick={onClick} className="flex items-center gap-2 group">
      <div className="w-9 h-9 rounded-xl bg-primary-800 flex items-center justify-center">
        <BookOpen className="w-5 h-5 text-white" />
      </div>
      <span className="font-display font-bold text-[22px] leading-none tracking-tight">
        <span className="text-primary-800">SRS</span>{' '}
        <span className="text-ink">Digital Library</span>
      </span>
    </Link>
  );
}
