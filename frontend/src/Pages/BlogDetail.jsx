import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const BlogDetail = () => {
  const { idOrSlug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const base = import.meta.env.VITE_BACKEND_URL || '';

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${base}/api/blogs/${encodeURIComponent(idOrSlug)}`);
        if (!res.ok) throw new Error('Blog not found');
        const data = await res.json();
        setBlog(data);
      } catch (err) {
        console.error('Error loading blog', err);
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [idOrSlug]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!blog) return <div className="p-4">Blog not found. <Link to="/blogs" className="text-blue-600">Back to list</Link></div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">{blog.title}</h1>
      <p className="text-sm text-gray-500 mb-4">By {blog.authorName || blog.author || 'Unknown'} • {new Date(blog.createdAt || blog.updatedAt).toLocaleDateString()}</p>

      {/* Assuming server sanitizes blog.content. If not, avoid dangerouslySetInnerHTML. */}
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: blog.content || '' }} />

      <div className="mt-6">
        <Link to="/blogs" className="text-blue-600">← Back to blogs</Link>
      </div>
    </div>
  );
};

export default BlogDetail;
