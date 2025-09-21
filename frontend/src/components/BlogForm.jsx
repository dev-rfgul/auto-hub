import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const toHTML = (raw = '') => {
        const s = String(raw || '').trim();
        if (!s) return '';
        // If it already contains HTML tags, assume user provided HTML
        if (/<[a-z][\s\S]*>/i.test(s)) return s;

        const lines = s.split(/\r?\n/);
        const blocks = [];
        let i = 0;
        while (i < lines.length) {
          const line = lines[i].trim();
          if (line === '') { i++; continue; }

          if (/^[-\*]\s+/.test(line)) {
            const items = [];
            while (i < lines.length && /^[-\*]\s+/.test(lines[i].trim())) {
              items.push(lines[i].trim().replace(/^[-\*]\s+/, ''));
              i++;
            }
            blocks.push('<ul>' + items.map(it => `<li>${formatInline(it)}</li>`).join('') + '</ul>');
            continue;
          }

          if (/^\d+\.\s+/.test(line)) {
            const items = [];
            while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
              items.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
              i++;
            }
            blocks.push('<ol>' + items.map(it => `<li>${formatInline(it)}</li>`).join('') + '</ol>');
            continue;
          }

          const para = [line];
          i++;
          while (i < lines.length && lines[i].trim() !== '' && !/^[-\*]\s+/.test(lines[i].trim()) && !/^\d+\.\s+/.test(lines[i].trim())) {
            para.push(lines[i].trim());
            i++;
          }
          blocks.push('<p>' + formatInline(para.join(' ')) + '</p>');
        }

        function formatInline(str) {
          const esc = (s) => String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
          let out = esc(str);
          out = out.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          out = out.replace(/\*(.*?)\*/g, '<em>$1</em>');
          return out;
        }

        return blocks.join('\n');
      };

      const form = new FormData();
      form.append('title', title);
      form.append('content', toHTML(content));
      form.append('published', published ? 'true' : 'false');
  tags.split(',').map(t => t.trim()).filter(Boolean).forEach(t => form.append('tags[]', t));
  images.forEach((f) => form.append('images', f));

  // send cookies (session) to backend; backend expects cookie-based auth
  const res = await axios.post(`${base}/api/blogs/add-blog`, form, {
        withCredentials: true,
      });

      const data = res.data;
      if (onCreated) onCreated(data);
      onClose();
    } catch (err) {
      console.error('Create blog error', err);
      // axios error handling
      if (err?.response) {
        const status = err.response.status;
        const body = err.response.data;
        const msg = body?.message || body?.error || JSON.stringify(body) || err.message;
        // redirect to login on auth errors
        if (status === 401 || status === 403) {
          setError('You must be logged in to create a blog. Redirecting to login...');
          setTimeout(() => navigate('/login'), 600);
          return;
        }
        setError(msg || 'Could not create blog');
      } else {
        setError(err.message || 'Could not create blog');
      }
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
            <label className="block text-sm font-medium text-gray-700">Content </label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={10} required className="mt-1 block w-full border rounded px-3 py-2" />
            <p className="text-xs text-gray-500 mt-1">You can paste plain text or simple markdown-like lists; the form will convert it into HTML for you.</p>
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
