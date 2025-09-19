import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const BlogsList = () => {
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const base = import.meta.env.VITE_BACKEND_URL || '';

  const fetchBlogs = async (p = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`${base}/api/blogs?page=${p}&limit=10`);

      if (!res.ok) throw new Error('Failed to load blogs');
      const data = await res.json();
      // backend returns { total, page, limit, blogs }
      const list = data.blogs || data.docs || data;
      setBlogs(list || []);
      setTotal(data.total || data.count || (Array.isArray(list) ? list.length : 0));
    } catch (err) {
      console.error('Error fetching blogs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs(page);
  }, [page]);

  const stripHtml = (html = '') => {
    if (!html) return '';
    try {
      return html.replace(/<[^>]*>/g, '');
    } catch (e) { return String(html); }
  };

  const excerpt = (html = '', n = 220) => {
    const text = stripHtml(html);
    if (text.length <= n) return text;
    return text.slice(0, n).trim() + '...';
  };

  const firstImage = (b) => {
    if (!b) return null;
    const imgs = b.images || (b.image ? [b.image] : []);
    if (Array.isArray(imgs) && imgs.length) return imgs[0];
    return null;
  };

  if (loading) return <div className="p-6">Loading blogs...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Blog</h1>

      {blogs && blogs.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {blogs.map((b) => (
            <article key={b._id || b.id || b.slug} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
              {firstImage(b) && (
                <Link to={`/blogs/${b._id || b.slug}`} className="block h-48 overflow-hidden">
                  <img src={firstImage(b)} alt={b.title} className="w-full h-full object-cover" />
                </Link>
              )}
              <div className="p-4">
                <Link to={`/blogs/${b._id || b.slug}`} className="text-xl font-semibold text-gray-900 hover:text-blue-600">
                  {b.title}
                </Link>
                <p className="text-sm text-gray-500 mt-1">By {b.authorName || b.author || 'Unknown'} • {new Date(b.createdAt || b.updatedAt).toLocaleDateString()}</p>
                <p className="mt-3 text-gray-700">{excerpt(b.content)}</p>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {(b.tags || []).slice(0, 5).map((t) => (
                      <span key={t} className="text-xs bg-gray-100 px-2 py-1 rounded">#{t}</span>
                    ))}
                  </div>
                  <Link to={`/blogs/${b._id || b.slug}`} className="text-sm text-blue-600 hover:underline">Read more →</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div>No blogs found.</div>
      )}

      {total > 10 && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 bg-gray-100 rounded">Prev</button>
          <div>Page {page}</div>
          <button onClick={() => setPage((p) => p + 1)} className="px-3 py-1 bg-gray-100 rounded">Next</button>
        </div>
      )}
    </div>
  );
};

export default BlogsList;
