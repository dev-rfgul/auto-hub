import React, { useState } from 'react';

const BlogForm = ({ onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [published, setPublished] = useState(true);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const base = import.meta.env.VITE_BACKEND_URL || '';

  const handleFiles = (e) => {
    setImages(Array.from(e.target.files || []));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('title', title);
      form.append('content', content);
      form.append('published', published ? 'true' : 'false');
  tags.split(',').map(t => t.trim()).filter(Boolean).forEach(t => form.append('tags[]', t));
  images.forEach((f) => form.append('images', f));

      const res = await fetch(`${base}/api/blogs`, {
        method: 'POST',
        body: form,
        credentials: 'include',
      });

      if (!res.ok) {
        let errMsg = 'Create blog failed';
        try { errMsg = await res.text(); } catch {}
        throw new Error(errMsg);
      }
      const data = await res.json();
      if (onCreated) onCreated(data);
      onClose();
    } catch (err) {
      console.error('Create blog error', err);
      setError(err.message || 'Could not create blog');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <form onSubmit={handleSubmit} className="bg-white w-full max-w-2xl p-6 rounded shadow">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold">Create Blog</h3>
          <button type="button" onClick={onClose} className="text-gray-500">Close</button>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 block w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Content (HTML allowed)</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={10} required className="mt-1 block w-full border rounded px-3 py-2" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
              <input value={tags} onChange={(e) => setTags(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Images</label>
              <input type="file" multiple onChange={handleFiles} className="mt-1 block w-full" />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <label className="inline-flex items-center">
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="mr-2" /> Publish
            </label>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>

        <div className="mt-4 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 rounded">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Creating...' : 'Create'}</button>
        </div>
      </form>
    </div>
  );
};

export default BlogForm;
