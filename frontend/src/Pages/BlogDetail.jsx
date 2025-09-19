import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

// Polished Blog Detail page following DESIGN_INSTRUCTIONS.md
// - hero with title/metadata
// - large responsive image carousel (click thumbnails)
// - author fetch for display (uses /api/user/:id or /api/user/me depending on availability)
// - sanitized HTML rendering (light sanitizer)
// - responsive two-column layout with sidebar on wide screens

const SAFE_TAGS = ['p','br','strong','b','em','i','ul','ol','li','h1','h2','h3','h4','blockquote','a','img','figure','figcaption','pre','code'];

function sanitizeHtml(html) {
  if (!html) return '';
  // remove script/style and on* attributes, keep basic safe tags and attributes (href, src, alt)
  // Note: this is a minimal sanitizer for demo purposes. For production, use DOMPurify or a server-side sanitizer.
  try {
    // remove script and style blocks
    let out = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
    out = out.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '');

    // strip dangerous attributes like on* and javascript: URIs
    out = out.replace(/on[a-zA-Z]+\s*=\s*\"[\s\S]*?\"/gi, '');
    out = out.replace(/on[a-zA-Z]+\s*=\s*\'[\s\S]*?\'/gi, '');
    out = out.replace(/href\s*=\s*\"javascript:[^\"]*\"/gi, '');
    out = out.replace(/href\s*=\s*\'javascript:[^\']*\'/gi, '');

    // remove tags that are not in SAFE_TAGS
    out = out.replace(/<\/?([a-zA-Z0-9-]+)([^>]*)>/g, (match, tag, attrs) => {
      const t = tag.toLowerCase();
      if (!SAFE_TAGS.includes(t)) return '';
      // allow href, src, alt in attributes, strip others
      let kept = '';
      if (attrs && attrs.length) {
        const href = attrs.match(/href\s*=\s*\"([^\"]*)\"/i) || attrs.match(/href\s*=\s*'([^']*)'/i);
        const src = attrs.match(/src\s*=\s*\"([^\"]*)\"/i) || attrs.match(/src\s*=\s*'([^']*)'/i);
        const alt = attrs.match(/alt\s*=\s*\"([^\"]*)\"/i) || attrs.match(/alt\s*=\s*'([^']*)'/i);
        if (href && href[1]) {
          const val = href[1].replace(/\"/g, '');
          kept += ` href=\"${val}\"`;
        }
        if (src && src[1]) {
          const val = src[1].replace(/\"/g, '');
          kept += ` src=\"${val}\"`;
        }
        if (alt && alt[1]) {
          const val = alt[1].replace(/\"/g, '');
          kept += ` alt=\"${val}\"`;
        }
      }
      return `<${t}${kept}>`;
    });

    return out;
  } catch (e) {
    return '';
  }
}

const BlogDetail = () => {
  const { idOrSlug } = useParams();
  const [blog, setBlog] = useState(null);
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState(null);
  const base = import.meta.env.VITE_BACKEND_URL || '';

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${base}/api/blogs/${encodeURIComponent(idOrSlug)}`);
        if (!res.ok) throw new Error('Blog not found');
        const data = await res.json();
        setBlog(data);
        const imgs = data.images || (data.image ? [data.image] : []);
        if (imgs.length) setMainImage(imgs[0]);

        // try fetch author name if author id is present
        if (data.author) {
          try {
            const uRes = await fetch(`${base}/api/user/${data.author}`);
            if (uRes.ok) {
              const u = await uRes.json();
              setAuthor(u);
            }
          } catch (e) {
            // ignore
          }
        }
      } catch (err) {
        console.error('Error loading blog', err);
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [idOrSlug]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!blog) return <div className="p-6">Blog not found. <Link to="/blogs" className="text-blue-600">Back to list</Link></div>;

  const images = blog.images || (blog.image ? [blog.image] : []);
  const safeHtml = sanitizeHtml(blog.content || '');

  // build content with injected images at random paragraph boundaries
  const buildContent = () => {
    if (!safeHtml) return '';
    if (!images || images.length <= 1) return safeHtml;

    const extras = images.slice(1);
    const parts = safeHtml.split(/<\/p>/i).map((p, idx, arr) => idx < arr.length - 1 ? p + '</p>' : p);
    if (parts.length > 1) {
      const indices = Array.from({ length: parts.length - 1 }, (_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      const chosen = indices.slice(0, extras.length);
      const insertMap = {};
      chosen.forEach((idx, i) => { insertMap[idx] = insertMap[idx] || []; insertMap[idx].push(extras[i]); });
      const out = [];
      for (let i = 0; i < parts.length; i++) {
        out.push(parts[i]);
        if (insertMap[i]) {
          for (const src of insertMap[i]) out.push(`<figure class=\"my-6\"><img src=\"${src}\" alt=\"\" class=\"w-full rounded\" /><figcaption class=\"text-xs text-gray-500 mt-1\">Image</figcaption></figure>`);
        }
      }
      return out.join('');
    }

    let out = safeHtml;
    for (const src of extras) {
      const insertAt = Math.floor(Math.random() * (out.length + 1));
      const imgHtml = `<figure class=\"my-6\"><img src=\"${src}\" alt=\"\" class=\"w-full rounded\" /><figcaption class=\"text-xs text-gray-500 mt-1\">Image</figcaption></figure>`;
      out = out.slice(0, insertAt) + imgHtml + out.slice(insertAt);
    }
    return out;
  };

  const contentWithImages = buildContent();

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <main className="lg:col-span-2">
        {/* Hero */}
        <div className="mb-6">
          <div className="text-sm text-gray-500">{new Date(blog.createdAt || blog.updatedAt).toLocaleDateString()}</div>
          <h1 className="text-4xl font-extrabold leading-tight mt-2">{blog.title}</h1>
          <div className="mt-3 flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
              {/* placeholder avatar */}
              <img src={author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(author?.username || 'Author')}`} alt="author" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-sm font-semibold">{author?.username || author?.name || 'Unknown author'}</div>
              <div className="text-xs text-gray-500">{(author && author.role) ? author.role : 'Dealer'}</div>
            </div>
          </div>
        </div>

        {/* Carousel */}
        {images && images.length > 0 && (
          <div className="mb-6">
            <div className="w-full h-96 bg-gray-100 rounded overflow-hidden">
              <img src={mainImage || images[0]} alt={blog.title} className="w-full h-full object-cover" />
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-3 overflow-x-auto">
                {images.map((src, i) => (
                  <button key={i} onClick={() => setMainImage(src)} className={`flex-none rounded overflow-hidden border ${mainImage === src ? 'ring-2 ring-blue-400' : ''}`}>
                    <img src={src} alt={`thumb-${i}`} className="w-36 h-24 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <article className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: contentWithImages }} />
        </article>

        {/* Tags / CTA */}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex gap-2 items-center">
            {(blog.tags || []).map((t) => (<span key={t} className="text-xs bg-gray-100 px-2 py-1 rounded">#{t}</span>))}
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded">Contact Dealer</button>
            <button className="px-4 py-2 border rounded">Share</button>
          </div>
        </div>
      </main>

      <aside className="lg:col-span-1">
        <div className="bg-white p-4 rounded shadow">
          <h4 className="font-semibold mb-2">About Author</h4>
          <div className="text-sm text-gray-700">{author?.bio || 'Dealer and automotive enthusiast.'}</div>
        </div>

        <div className="mt-6 bg-white p-4 rounded shadow">
          <h4 className="font-semibold mb-2">Related posts</h4>
          <div className="text-sm text-gray-500">More posts about cars</div>
        </div>
      </aside>
    </div>
  );
};

export default BlogDetail;
