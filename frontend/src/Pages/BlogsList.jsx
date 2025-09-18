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
      setBlogs(data.docs || data.blogs || data);
      setTotal(data.total || data.count || 0);
    } catch (err) {
      console.error('Error fetching blogs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs(page);
  }, [page]);

  if (loading) return <div className="p-4">Loading blogs...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Blog</h1>
      {blogs && blogs.length ? (
        <div className="space-y-6">
          {blogs.map((b) => (
            <article key={b._id || b.id || b.slug} className="border rounded p-4">
              <Link to={`/blogs/${b._id || b.slug}`} className="text-xl font-semibold text-blue-600 hover:underline">
                {b.title}
              </Link>
              <p className="text-sm text-gray-500">By {b.authorName || b.author || 'Unknown'} • {new Date(b.createdAt || b.updatedAt).toLocaleDateString()}</p>
              <p className="mt-2 text-gray-700">{(b.content || '').slice(0, 250)}{(b.content || '').length > 250 ? '...' : ''}</p>
              <div className="mt-3">
                <Link to={`/blogs/${b._id || b.slug}`} className="text-sm text-blue-600 hover:underline">Read more</Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div>No blogs found.</div>
      )}

      {total > 10 && (
        <div className="flex justify-between items-center mt-6">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 bg-gray-100 rounded">Prev</button>
          <div>Page {page}</div>
          <button onClick={() => setPage((p) => p + 1)} className="px-3 py-1 bg-gray-100 rounded">Next</button>
        </div>
      )}
    </div>
  );
};

export default BlogsList;
