import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Upload, Trash2, X, GripVertical, ImagePlus, ImageOff } from 'lucide-react';
import { supabase, type GalleryImage } from '../../lib/supabase';

export default function AdminGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<GalleryImage | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const load = () => {
    supabase.from('gallery_images').select('*').order('sort_order')
      .then(({ data }) => { setImages(data as GalleryImage[] || []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const reorder = async (newList: GalleryImage[]) => {
    setImages(newList);
    const updates = newList.map((img, i) => supabase.from('gallery_images').update({ sort_order: i + 1 }).eq('id', img.id));
    await Promise.all(updates);
    toast.success('Order saved');
  };

  const onDrop = (idx: number) => {
    if (dragIdx === null || dragIdx === idx) return;
    const newList = [...images];
    const [moved] = newList.splice(dragIdx, 1);
    newList.splice(idx, 0, moved);
    setDragIdx(null);
    reorder(newList);
  };

  const deleteImage = async (img: GalleryImage) => {
    const { error } = await supabase.from('gallery_images').delete().eq('id', img.id);
    if (error) toast.error(error.message);
    else { toast.success('Image deleted'); setConfirmDelete(null); load(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">Gallery</h1>
          <p className="text-ink-muted mt-1">{images.length} images. Drag to reorder.</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="btn-primary"><ImagePlus className="w-4 h-4" /> Add Images</button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-48" />)}
        </div>
      ) : images.length === 0 ? (
        <div className="card p-12 text-center">
          <ImageOff className="w-10 h-10 mx-auto text-ink-subtle mb-3" />
          <p className="text-ink-muted">No images yet. Add your first gallery photo!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, i) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => setDragIdx(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(i)}
              className="card overflow-hidden group relative cursor-move"
            >
              <img src={img.url} alt={img.caption || ''} className="w-full h-48 object-cover" />
              <div className="absolute top-2 left-2 opacity-60 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-5 h-5 text-white drop-shadow" />
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setConfirmDelete(img)} className="p-1.5 rounded-lg bg-error text-white hover:bg-red-700" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
              </div>
              {img.caption && (
                <div className="p-3">
                  <p className="text-sm text-ink truncate">{img.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add modal */}
      <AnimatePresence>
        {addOpen && (
          <AddImagesModal onClose={() => setAddOpen(false)} onSaved={() => { load(); setAddOpen(false); }} />
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-50 bg-navy-950/60 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-display font-semibold text-lg text-ink mb-2">Delete Image?</h3>
              <p className="text-sm text-ink-muted">This image will be removed from the gallery. This cannot be undone.</p>
              <div className="flex gap-2 mt-6">
                <button onClick={() => setConfirmDelete(null)} className="btn-ghost">Cancel</button>
                <button onClick={() => deleteImage(confirmDelete)} className="btn-danger ml-auto"><Trash2 className="w-4 h-4" /> Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AddImagesModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [urls, setUrls] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [saving, setSaving] = useState(false);

  const addUrl = () => {
    setUrls([...urls, '']);
  };

  const updateUrl = (i: number, val: string) => {
    setUrls(urls.map((u, idx) => idx === i ? val : u));
  };

  const removeUrl = (i: number) => {
    setUrls(urls.filter((_, idx) => idx !== i));
  };

  const save = async () => {
    const valid = urls.filter((u) => u.trim());
    if (!valid.length) { toast.error('Add at least one image URL'); return; }
    setSaving(true);
    try {
      const payload = valid.map((url, i) => ({
        url: url.trim(),
        caption: caption.trim() || null,
        sort_order: 999 + i,
      }));
      const { error } = await supabase.from('gallery_images').insert(payload);
      if (error) throw error;
      toast.success(`${valid.length} image${valid.length > 1 ? 's' : ''} added`);
      onSaved();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/60 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-lg text-ink">Add Gallery Images</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="label">Image URLs</label>
            <p className="text-xs text-ink-muted mb-2">Paste direct image URLs (e.g. from Pexels, Unsplash, or your CDN).</p>
            <div className="space-y-2">
              {urls.map((u, i) => (
                <div key={i} className="flex gap-2">
                  <input className="input" placeholder="https://images.pexels.com/..." value={u} onChange={(e) => updateUrl(i, e.target.value)} />
                  <button onClick={() => removeUrl(i)} className="btn-ghost px-3"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
            <button onClick={addUrl} className="btn-secondary mt-2 w-full"><Upload className="w-4 h-4" /> Add URL field</button>
          </div>
          <div>
            <label className="label">Caption (optional, applies to all)</label>
            <input className="input" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="e.g. Main study hall" />
          </div>
          {urls.filter((u) => u.trim()).map((u, i) => (
            <img key={i} src={u} alt="preview" className="w-full h-32 object-cover rounded-lg" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ))}
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-primary ml-auto">
            {saving ? 'Adding...' : <><Upload className="w-4 h-4" /> Add Images</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
