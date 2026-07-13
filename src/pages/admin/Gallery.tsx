import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Upload, Trash2, X, GripVertical, ImagePlus, ImageOff } from 'lucide-react';
import { supabase, type GalleryImage } from '../../lib/supabase';

type QueuedFile = {
  file: File;
  previewUrl: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  publicUrl?: string;
  errorMsg?: string;
};

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
    try {
      const url = new URL(img.url);
      const parts = url.pathname.split('/gallery/');
      const path = parts[1] || '';
      if (path) await supabase.storage.from('gallery').remove([path]);
    } catch { /* not a storage URL */ }
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
  const [queued, setQueued] = useState<QueuedFile[]>([]);
  const [caption, setCaption] = useState('');
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const arr = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (!arr.length) { toast.error('Please select image files only'); return; }
    const next: QueuedFile[] = arr.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'pending',
    }));
    setQueued((q) => [...q, ...next]);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = '';
  };

  const removeQueued = (i: number) => {
    setQueued((q) => {
      URL.revokeObjectURL(q[i].previewUrl);
      return q.filter((_, idx) => idx !== i);
    });
  };

  const save = async () => {
    const pending = queued.filter((q) => q.status !== 'done');
    if (!pending.length) { toast.error('Add at least one image'); return; }
    setSaving(true);
    let successCount = 0;
    try {
      const { count } = await supabase.from('gallery_images').select('*', { count: 'exact', head: true });
      let sortOrder = (count ?? 0) + 1;

      for (const item of pending) {
        const idx = queued.findIndex((q) => q === item);
        setQueued((q) => q.map((it, i) => i === idx ? { ...it, status: 'uploading' } : it));
        const ext = item.file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${crypto.randomUUID()}.${ext}`;
        const path = fileName;
        const { error: upErr } = await supabase.storage.from('gallery').upload(path, item.file, { upsert: false });
        if (upErr) {
          setQueued((q) => q.map((it, i) => i === idx ? { ...it, status: 'error', errorMsg: upErr.message } : it));
          continue;
        }
        const { data: pubData } = supabase.storage.from('gallery').getPublicUrl(path);
        const publicUrl = pubData.publicUrl;
        const { error: dbErr } = await supabase.from('gallery_images').insert({
          url: publicUrl,
          caption: caption.trim() || null,
          sort_order: sortOrder++,
        });
        if (dbErr) {
          setQueued((q) => q.map((it, i) => i === idx ? { ...it, status: 'error', errorMsg: dbErr.message } : it));
          continue;
        }
        setQueued((q) => q.map((it, i) => i === idx ? { ...it, status: 'done', publicUrl } : it));
        successCount++;
      }
      if (successCount > 0) {
        toast.success(`${successCount} image${successCount > 1 ? 's' : ''} added`);
        onSaved();
      } else {
        toast.error('Failed to upload images');
        setSaving(false);
      }
    } catch (err) {
      toast.error((err as Error).message);
      setSaving(false);
    }
  };

  const allDone = queued.length > 0 && queued.every((q) => q.status === 'done');

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/60 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-lg text-ink">Add Gallery Images</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>

        <div
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors mb-4 ${
            dragging ? 'border-primary-600 bg-primary-50' : 'border-line hover:border-primary-300 hover:bg-slate-50'
          }`}
        >
          <input ref={inputRef} type="file" accept="image/*" multiple onChange={onFileInput} className="hidden" />
          <Upload className={`w-10 h-10 mx-auto mb-3 ${dragging ? 'text-primary-600' : 'text-ink-subtle'}`} />
          <p className="text-sm font-semibold text-ink">{dragging ? 'Drop images here' : 'Drag & drop images here'}</p>
          <p className="text-xs text-ink-muted mt-1">or click to browse · PNG, JPG, WEBP</p>
        </div>

        {queued.length > 0 && (
          <div className="space-y-2 mb-4">
            {queued.map((q, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg border border-line">
                <img src={q.previewUrl} alt="preview" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{q.file.name}</p>
                  <p className="text-xs text-ink-muted">{(q.file.size / 1024).toFixed(0)} KB</p>
                  {q.status === 'uploading' && <p className="text-xs text-primary-700 mt-0.5">Uploading...</p>}
                  {q.status === 'done' && <p className="text-xs text-success mt-0.5">Uploaded</p>}
                  {q.status === 'error' && <p className="text-xs text-error mt-0.5">{q.errorMsg || 'Failed'}</p>}
                </div>
                {q.status === 'pending' && (
                  <button onClick={() => removeQueued(i)} className="p-1.5 rounded-lg hover:bg-slate-100 text-ink-muted hover:text-error">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mb-4">
          <label className="label">Caption (optional, applies to all)</label>
          <input className="input" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="e.g. Main study hall" />
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={save} disabled={saving || allDone || queued.length === 0} className="btn-primary ml-auto">
            {saving ? 'Uploading...' : <><Upload className="w-4 h-4" /> Upload {queued.length > 0 ? `(${queued.filter((q) => q.status !== 'done').length})` : ''}</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
