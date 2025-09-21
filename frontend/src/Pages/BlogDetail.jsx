// // import React, { useEffect, useState } from 'react';
// // import { useParams, Link } from 'react-router-dom';
// // import axios from 'axios';

// // // Polished Blog Detail page following DESIGN_INSTRUCTIONS.md
// // // - hero with title/metadata
// // // - large responsive image carousel (click thumbnails)
// // // - author fetch for display (uses /api/user/:id or /api/user/me depending on availability)
// // // - sanitized HTML rendering (light sanitizer)
// // // - responsive two-column layout with sidebar on wide screens

// // const SAFE_TAGS = ['p','br','strong','b','em','i','ul','ol','li','h1','h2','h3','h4','blockquote','a','img','figure','figcaption','pre','code'];

// // function sanitizeHtml(html) {
// //   if (!html) return '';
// //   // remove script/style and on* attributes, keep basic safe tags and attributes (href, src, alt)
// //   // Note: this is a minimal sanitizer for demo purposes. For production, use DOMPurify or a server-side sanitizer.
// //   try {
// //     // remove script and style blocks
// //     let out = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
// //     out = out.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '');

// //     // strip dangerous attributes like on* and javascript: URIs
// //     out = out.replace(/on[a-zA-Z]+\s*=\s*\"[\s\S]*?\"/gi, '');
// //     out = out.replace(/on[a-zA-Z]+\s*=\s*\'[\s\S]*?\'/gi, '');
// //     out = out.replace(/href\s*=\s*\"javascript:[^\"]*\"/gi, '');
// //     out = out.replace(/href\s*=\s*\'javascript:[^\']*\'/gi, '');

// //     // remove tags that are not in SAFE_TAGS
// //     out = out.replace(/<\/?([a-zA-Z0-9-]+)([^>]*)>/g, (match, tag, attrs) => {
// //       const t = tag.toLowerCase();
// //       if (!SAFE_TAGS.includes(t)) return '';
// //       // allow href, src, alt in attributes, strip others
// //       let kept = '';
// //       if (attrs && attrs.length) {
// //         const href = attrs.match(/href\s*=\s*\"([^\"]*)\"/i) || attrs.match(/href\s*=\s*'([^']*)'/i);
// //         const src = attrs.match(/src\s*=\s*\"([^\"]*)\"/i) || attrs.match(/src\s*=\s*'([^']*)'/i);
// //         const alt = attrs.match(/alt\s*=\s*\"([^\"]*)\"/i) || attrs.match(/alt\s*=\s*'([^']*)'/i);
// //         if (href && href[1]) {
// //           const val = href[1].replace(/\"/g, '');
// //           kept += ` href=\"${val}\"`;
// //         }
// //         if (src && src[1]) {
// //           const val = src[1].replace(/\"/g, '');
// //           kept += ` src=\"${val}\"`;
// //         }
// //         if (alt && alt[1]) {
// //           const val = alt[1].replace(/\"/g, '');
// //           kept += ` alt=\"${val}\"`;
// //         }
// //       }
// //       return `<${t}${kept}>`;
// //     });

// //     return out;
// //   } catch (e) {
// //     return '';
// //   }
// // }

// // const BlogDetail = () => {
// //   const { idOrSlug } = useParams();
// //   const [blog, setBlog] = useState(null);
// //   const [author, setAuthor] = useState(null);
// //   const [loading, setLoading] = useState(true);
// //   const [mainImage, setMainImage] = useState(null);
// //   const base = import.meta.env.VITE_BACKEND_URL || '';

// //   useEffect(() => {
// //     const fetchBlog = async () => {
// //       setLoading(true);
// //       try {
// //         const res = await axios.get(`${base}/api/blogs/${encodeURIComponent(idOrSlug)}`);
// //         const data = res.data;
// //         console.log('Fetched blog data:', data);
// //         setBlog(data);
// //         const imgs = data.images || (data.image ? [data.image] : []);
// //         if (imgs.length) setMainImage(imgs[0]);

// //         if (data.author) {
// //           try {
// //             const candidates = [`${base}/api/user/user/${data.author}`, `${base}/api/user/${data.author}`];
// //             let u = null;
// //             for (const url of candidates) {
// //               try {
// //                 const r = await axios.get(url);
// //                 if (r.status === 200) { u = r.data; break; }
// //               } catch (e) {
// //                 // continue
// //               }
// //             }
// //             if (u) setAuthor(u);
// //           } catch (e) {
// //             // ignore
// //           }
// //         }
// //       } catch (err) {
// //         console.error('Error loading blog', err);
// //         setBlog(null);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };
// //     fetchBlog();
// //   }, [idOrSlug]);

// //   if (loading) return <div className="p-6">Loading...</div>;
// //   if (!blog) return <div className="p-6">Blog not found. <Link to="/blogs" className="text-blue-600">Back to list</Link></div>;

// //   const images = blog.images || (blog.image ? [blog.image] : []);
// //   const safeHtml = sanitizeHtml(blog.content || '');

// //   // build content with injected images at random paragraph boundaries
// //   const buildContent = () => {
// //     if (!safeHtml) return '';
// //     if (!images || images.length <= 1) return safeHtml;

// //     const extras = images.slice(1);
// //     const parts = safeHtml.split(/<\/p>/i).map((p, idx, arr) => idx < arr.length - 1 ? p + '</p>' : p);
// //     if (parts.length > 1) {
// //       const indices = Array.from({ length: parts.length - 1 }, (_, i) => i);
// //       for (let i = indices.length - 1; i > 0; i--) {
// //         const j = Math.floor(Math.random() * (i + 1));
// //         [indices[i], indices[j]] = [indices[j], indices[i]];
// //       }
// //       const chosen = indices.slice(0, extras.length);
// //       const insertMap = {};
// //       chosen.forEach((idx, i) => { insertMap[idx] = insertMap[idx] || []; insertMap[idx].push(extras[i]); });
// //       const out = [];
// //       for (let i = 0; i < parts.length; i++) {
// //         out.push(parts[i]);
// //         if (insertMap[i]) {
// //           for (const src of insertMap[i]) out.push(`<figure class=\"my-6\"><img src=\"${src}\" alt=\"\" class=\"w-full rounded\" /><figcaption class=\"text-xs text-gray-500 mt-1\">Image</figcaption></figure>`);
// //         }
// //       }
// //       return out.join('');
// //     }

// //     let out = safeHtml;
// //     for (const src of extras) {
// //       const insertAt = Math.floor(Math.random() * (out.length + 1));
// //       const imgHtml = `<figure class=\"my-6\"><img src=\"${src}\" alt=\"\" class=\"w-full rounded\" /><figcaption class=\"text-xs text-gray-500 mt-1\">Image</figcaption></figure>`;
// //       out = out.slice(0, insertAt) + imgHtml + out.slice(insertAt);
// //     }
// //     return out;
// //   };

// //   const contentWithImages = buildContent();

// //   return (
// //     <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
// //       <main className="lg:col-span-2">
// //         {/* Hero */}
// //         <div className="mb-6">
// //           <div className="text-sm text-gray-500">{new Date(blog.createdAt || blog.updatedAt).toLocaleDateString()}</div>
// //           <h1 className="text-4xl font-extrabold leading-tight mt-2">{blog.title}</h1>
// //           <div className="mt-3 flex items-center gap-3">
// //             <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
// //               {/* placeholder avatar */}
// //               <img src={author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(author?.username || 'Author')}`} alt="author" className="w-full h-full object-cover" />
// //             </div>
// //             <div>
// //               <div className="text-sm font-semibold">{author?.username || author?.name || 'Unknown author'}</div>
// //               <div className="text-xs text-gray-500">{(author && author.role) ? author.role : 'Dealer'}</div>
// //             </div>
// //           </div>
// //         </div>

// //         {/* Carousel */}
// //         {images && images.length > 0 && (
// //           <div className="mb-6">
// //             <div className="w-full h-96 bg-gray-100 rounded overflow-hidden">
// //               <img src={mainImage || images[0]} alt={blog.title} className="w-full h-full object-cover" />
// //             </div>
// //             {images.length > 1 && (
// //               <div className="mt-3 flex gap-3 overflow-x-auto">
// //                 {images.map((src, i) => (
// //                   <button key={i} onClick={() => setMainImage(src)} className={`flex-none rounded overflow-hidden border ${mainImage === src ? 'ring-2 ring-blue-400' : ''}`}>
// //                     <img src={src} alt={`thumb-${i}`} className="w-36 h-24 object-cover" />
// //                   </button>
// //                 ))}
// //               </div>
// //             )}
// //           </div>
// //         )}

// //         {/* Content */}
// //         <article className="prose max-w-none">
// //           <div dangerouslySetInnerHTML={{ __html: contentWithImages }} />
// //         </article>

// //         {/* Tags / CTA */}
// //         <div className="mt-8 flex items-center justify-between">
// //           <div className="flex gap-2 items-center">
// //             {(blog.tags || []).map((t) => (<span key={t} className="text-xs bg-gray-100 px-2 py-1 rounded">#{t}</span>))}
// //           </div>

// //         </div>
// //       </main>

// //       <aside className="lg:col-span-1">
// //         <div className="bg-white p-4 rounded shadow">
// //           <h4 className="font-semibold mb-2">About Author</h4>
// //           <div className="text-sm text-gray-700">{author?.bio || 'Dealer and automotive enthusiast.'}</div>
// //         </div>

// //         <div className="mt-6 bg-white p-4 rounded shadow">
// //           <h4 className="font-semibold mb-2">Related posts</h4>
// //           <div className="text-sm text-gray-500">More posts about cars</div>
// //         </div>
// //       </aside>
// //     </div>
// //   );
// // };

// // export default BlogDetail;


// import React, { useEffect, useState } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import axios from 'axios';

// // Enhanced Blog Detail page with modern design and related posts
// const SAFE_TAGS = ['p','br','strong','b','em','i','ul','ol','li','h1','h2','h3','h4','blockquote','a','img','figure','figcaption','pre','code'];

// function sanitizeHtml(html) {
//   if (!html) return '';
//   try {
//     let out = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
//     out = out.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '');
//     out = out.replace(/on[a-zA-Z]+\s*=\s*\"[\s\S]*?\"/gi, '');
//     out = out.replace(/on[a-zA-Z]+\s*=\s*\'[\s\S]*?\'/gi, '');
//     out = out.replace(/href\s*=\s*\"javascript:[^\"]*\"/gi, '');
//     out = out.replace(/href\s*=\s*\'javascript:[^\']*\'/gi, '');

//     out = out.replace(/<\/?([a-zA-Z0-9-]+)([^>]*)>/g, (match, tag, attrs) => {
//       const t = tag.toLowerCase();
//       if (!SAFE_TAGS.includes(t)) return '';
//       let kept = '';
//       if (attrs && attrs.length) {
//         const href = attrs.match(/href\s*=\s*\"([^\"]*)\"/i) || attrs.match(/href\s*=\s*'([^']*)'/i);
//         const src = attrs.match(/src\s*=\s*\"([^\"]*)\"/i) || attrs.match(/src\s*=\s*'([^']*)'/i);
//         const alt = attrs.match(/alt\s*=\s*\"([^\"]*)\"/i) || attrs.match(/alt\s*=\s*'([^']*)'/i);
//         if (href && href[1]) {
//           const val = href[1].replace(/\"/g, '');
//           kept += ` href="${val}"`;
//         }
//         if (src && src[1]) {
//           const val = src[1].replace(/\"/g, '');
//           kept += ` src="${val}"`;
//         }
//         if (alt && alt[1]) {
//           const val = alt[1].replace(/\"/g, '');
//           kept += ` alt="${val}"`;
//         }
//       }
//       return `<${t}${kept}>`;
//     });

//     return out;
//   } catch (e) {
//     return '';
//   }
// }

// const BlogDetail = () => {
//   const { idOrSlug } = useParams();
//   const [blog, setBlog] = useState(null);
//   const [author, setAuthor] = useState(null);
//   const [relatedBlogs, setRelatedBlogs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [mainImage, setMainImage] = useState(null);
//   const [readingTime, setReadingTime] = useState(0);
//   const base = import.meta.env.VITE_BACKEND_URL || '';

//   // Calculate reading time
//   const calculateReadingTime = (text) => {
//     const wordsPerMinute = 200;
//     const wordCount = text.replace(/<[^>]*>/g, '').split(/\s+/).length;
//     return Math.ceil(wordCount / wordsPerMinute);
//   };

//   // Fetch related blogs based on tags
//   const fetchRelatedBlogs = async (currentBlog) => {
//     try {
//       const res = await axios.get(`${base}/api/blogs`);
//       const allBlogs = res.data;
      
//       if (!currentBlog.tags || !Array.isArray(currentBlog.tags)) {
//         setRelatedBlogs(allBlogs.filter(b => b._id !== currentBlog._id).slice(0, 4));
//         return;
//       }

//       // Find blogs with matching tags
//       const related = allBlogs
//         .filter(b => b._id !== currentBlog._id)
//         .map(b => {
//           const matchingTags = (b.tags || []).filter(tag => 
//             currentBlog.tags.includes(tag)
//           ).length;
//           return { ...b, matchingTags };
//         })
//         .sort((a, b) => b.matchingTags - a.matchingTags)
//         .slice(0, 4);

//       setRelatedBlogs(related);
//     } catch (error) {
//       console.error('Error fetching related blogs:', error);
//     }
//   };

//   useEffect(() => {
//     const fetchBlog = async () => {
//       setLoading(true);
//       try {
//         const res = await axios.get(`${base}/api/blogs/${encodeURIComponent(idOrSlug)}`);
//         const data = res.data;
//         console.log('Fetched blog data:', data);
//         setBlog(data);
        
//         const imgs = data.images || (data.image ? [data.image] : []);
//         if (imgs.length) setMainImage(imgs[0]);

//         // Calculate reading time
//         setReadingTime(calculateReadingTime(data.content || ''));

//         // Fetch related blogs
//         await fetchRelatedBlogs(data);

//         if (data.author) {
//           try {
//             const candidates = [`${base}/api/user/user/${data.author}`, `${base}/api/user/${data.author}`];
//             let u = null;
//             for (const url of candidates) {
//               try {
//                 const r = await axios.get(url);
//                 if (r.status === 200) { u = r.data; break; }
//               } catch (e) {
//                 // continue
//               }
//             }
//             if (u) setAuthor(u);
//           } catch (e) {
//             // ignore
//           }
//         }
//       } catch (err) {
//         console.error('Error loading blog', err);
//         setBlog(null);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchBlog();
//   }, [idOrSlug]);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
//           <p className="text-gray-600 text-lg">Loading amazing content...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!blog) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-3xl font-bold text-gray-800 mb-4">Blog not found</h2>
//           <Link to="/blogs" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-300">
//             <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//             </svg>
//             Back to Blog List
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   const images = blog.images || (blog.image ? [blog.image] : []);
//   const safeHtml = sanitizeHtml(blog.content || '');

//   const buildContent = () => {
//     if (!safeHtml) return '';
//     if (!images || images.length <= 1) return safeHtml;

//     const extras = images.slice(1);
//     const parts = safeHtml.split(/<\/p>/i).map((p, idx, arr) => idx < arr.length - 1 ? p + '</p>' : p);
//     if (parts.length > 1) {
//       const indices = Array.from({ length: parts.length - 1 }, (_, i) => i);
//       for (let i = indices.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [indices[i], indices[j]] = [indices[j], indices[i]];
//       }
//       const chosen = indices.slice(0, extras.length);
//       const insertMap = {};
//       chosen.forEach((idx, i) => { insertMap[idx] = insertMap[idx] || []; insertMap[idx].push(extras[i]); });
//       const out = [];
//       for (let i = 0; i < parts.length; i++) {
//         out.push(parts[i]);
//         if (insertMap[i]) {
//           for (const src of insertMap[i]) {
//             out.push(`<figure class="my-8 relative group"><img src="${src}" alt="" class="w-full rounded-2xl shadow-lg transition-transform duration-500 group-hover:scale-[1.02]" /><figcaption class="text-sm text-gray-500 mt-3 text-center italic">Image</figcaption></figure>`);
//           }
//         }
//       }
//       return out.join('');
//     }

//     let out = safeHtml;
//     for (const src of extras) {
//       const insertAt = Math.floor(Math.random() * (out.length + 1));
//       const imgHtml = `<figure class="my-8 relative group"><img src="${src}" alt="" class="w-full rounded-2xl shadow-lg transition-transform duration-500 group-hover:scale-[1.02]" /><figcaption class="text-sm text-gray-500 mt-3 text-center italic">Image</figcaption></figure>`;
//       out = out.slice(0, insertAt) + imgHtml + out.slice(insertAt);
//     }
//     return out;
//   };

//   const contentWithImages = buildContent();

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
//       {/* Hero Section */}
//       <div className="relative bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 overflow-hidden">
//         <div className="absolute inset-0 bg-black/20"></div>
//         {images.length > 0 && (
//           <div className="absolute inset-0">
//             <img 
//               src={mainImage || images[0]} 
//               alt={blog.title} 
//               className="w-full h-full object-cover opacity-30"
//             />
//           </div>
//         )}
//         <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
//           <div className="max-w-4xl">
//             <div className="flex items-center gap-4 mb-6">
//               <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
//                 {new Date(blog.createdAt || blog.updatedAt).toLocaleDateString('en-US', {
//                   year: 'numeric',
//                   month: 'long',
//                   day: 'numeric'
//                 })}
//               </span>
//               <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
//                 {readingTime} min read
//               </span>
//             </div>
//             <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-8 tracking-tight">
//               {blog.title}
//             </h1>
//             <div className="flex items-center gap-4">
//               <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden ring-4 ring-white/30">
//                 <img 
//                   src={author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(author?.username || 'Author')}&background=6366f1&color=fff`} 
//                   alt="author" 
//                   className="w-full h-full object-cover" 
//                 />
//               </div>
//               <div className="text-white">
//                 <div className="text-xl font-bold">{author?.username || author?.name || 'Unknown author'}</div>
//                 <div className="text-white/80">{(author && author.role) ? author.role : 'Automotive Expert'}</div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-6 py-16">
//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
//           {/* Main Content */}
//           <main className="lg:col-span-3">
//             {/* Image Carousel */}
//             {images && images.length > 0 && (
//               <div className="mb-12">
//                 <div className="relative w-full h-96 lg:h-[500px] bg-gray-100 rounded-3xl overflow-hidden shadow-2xl">
//                   <img 
//                     src={mainImage || images[0]} 
//                     alt={blog.title} 
//                     className="w-full h-full object-cover transition-all duration-700" 
//                   />
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
//                 </div>
//                 {images.length > 1 && (
//                   <div className="mt-6 flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
//                     {images.map((src, i) => (
//                       <button 
//                         key={i} 
//                         onClick={() => setMainImage(src)} 
//                         className={`flex-none rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 ${
//                           mainImage === src ? 'ring-4 ring-blue-500 scale-105' : ''
//                         }`}
//                       >
//                         <img src={src} alt={`thumb-${i}`} className="w-32 h-20 lg:w-40 lg:h-24 object-cover" />
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Article Content */}
//             <article className="prose prose-xl max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg">
//               <div dangerouslySetInnerHTML={{ __html: contentWithImages }} />
//             </article>

//             {/* Tags */}
//             {blog.tags && blog.tags.length > 0 && (
//               <div className="mt-12 pt-8 border-t border-gray-200">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Topics</h3>
//                 <div className="flex flex-wrap gap-3">
//                   {blog.tags.map((tag) => (
//                     <span 
//                       key={tag} 
//                       className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300"
//                     >
//                       #{tag}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </main>

//           {/* Sidebar */}
//           <aside className="lg:col-span-1 space-y-8">
//             {/* Author Card */}
//             <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
//               <div className="text-center">
//                 <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full overflow-hidden ring-4 ring-blue-100 shadow-lg mb-4">
//                   <img 
//                     src={author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(author?.username || 'Author')}&background=6366f1&color=fff`} 
//                     alt="author" 
//                     className="w-full h-full object-cover" 
//                   />
//                 </div>
//                 <h3 className="text-xl font-bold text-gray-900 mb-1">
//                   {author?.username || author?.name || 'Unknown author'}
//                 </h3>
//                 <p className="text-blue-600 font-medium mb-4">
//                   {(author && author.role) ? author.role : 'Automotive Expert'}
//                 </p>
//                 <p className="text-gray-600 text-sm leading-relaxed">
//                   {author?.bio || 'Passionate dealer and automotive enthusiast sharing insights about the latest trends in the automotive world.'}
//                 </p>
//               </div>
//             </div>

//             {/* Related Posts */}
//             {relatedBlogs.length > 0 && (
//               <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
//                 <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
//                   <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
//                   </svg>
//                   Related Posts
//                 </h3>
//                 <div className="space-y-6">
//                   {relatedBlogs.map((relatedBlog) => (
//                     <Link
//                       key={relatedBlog._id}
//                       to={`/blogs/${relatedBlog.slug || relatedBlog._id}`}
//                       className="block group hover:transform hover:scale-[1.02] transition-all duration-300"
//                     >
//                       <div className="flex gap-4">
//                         <div className="w-20 h-16 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow duration-300">
//                           {relatedBlog.image || (relatedBlog.images && relatedBlog.images[0]) ? (
//                             <img 
//                               src={relatedBlog.image || relatedBlog.images[0]} 
//                               alt={relatedBlog.title} 
//                               className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
//                             />
//                           ) : (
//                             <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
//                               <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                               </svg>
//                             </div>
//                           )}
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2 leading-snug">
//                             {relatedBlog.title}
//                           </h4>
//                           <p className="text-xs text-gray-500 mt-2">
//                             {new Date(relatedBlog.createdAt || relatedBlog.updatedAt).toLocaleDateString()}
//                           </p>
//                           {relatedBlog.matchingTags > 0 && (
//                             <div className="mt-2">
//                               <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
//                                 {relatedBlog.matchingTags} shared topic{relatedBlog.matchingTags > 1 ? 's' : ''}
//                               </span>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </Link>
//                   ))}
//                 </div>
//                 <Link
//                   to="/blogs"
//                   className="inline-flex items-center justify-center w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
//                 >
//                   View All Posts
//                   <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
//                   </svg>
//                 </Link>
//               </div>
//             )}
//             </div>
//           </aside>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BlogDetail;
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

// Enhanced Blog Detail page with modern design and tag-based related posts
const SAFE_TAGS = ['p','br','strong','b','em','i','ul','ol','li','h1','h2','h3','h4','blockquote','a','img','figure','figcaption','pre','code'];

function sanitizeHtml(html) {
  if (!html) return '';
  try {
    let out = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
    out = out.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '');
    out = out.replace(/on[a-zA-Z]+\s*=\s*\"[\s\S]*?\"/gi, '');
    out = out.replace(/on[a-zA-Z]+\s*=\s*\'[\s\S]*?\'/gi, '');
    out = out.replace(/href\s*=\s*\"javascript:[^\"]*\"/gi, '');
    out = out.replace(/href\s*=\s*\'javascript:[^\']*\'/gi, '');

    out = out.replace(/<\/?([a-zA-Z0-9-]+)([^>]*)>/g, (match, tag, attrs) => {
      const t = tag.toLowerCase();
      if (!SAFE_TAGS.includes(t)) return '';
      let kept = '';
      if (attrs && attrs.length) {
        const href = attrs.match(/href\s*=\s*\"([^\"]*)\"/i) || attrs.match(/href\s*=\s*'([^']*)'/i);
        const src = attrs.match(/src\s*=\s*\"([^\"]*)\"/i) || attrs.match(/src\s*=\s*'([^']*)'/i);
        const alt = attrs.match(/alt\s*=\s*\"([^\"]*)\"/i) || attrs.match(/alt\s*=\s*'([^']*)'/i);
        if (href && href[1]) {
          const val = href[1].replace(/\"/g, '');
          kept += ` href="${val}"`;
        }
        if (src && src[1]) {
          const val = src[1].replace(/\"/g, '');
          kept += ` src="${val}"`;
        }
        if (alt && alt[1]) {
          const val = alt[1].replace(/\"/g, '');
          kept += ` alt="${val}"`;
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
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState(null);
  const [readingTime, setReadingTime] = useState(0);
  const base = import.meta.env.VITE_BACKEND_URL || '';

  // Calculate reading time
  const calculateReadingTime = (text) => {
    const wordsPerMinute = 200;
    const wordCount = text.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  // Enhanced function to fetch related blogs based on tags with better scoring
  const fetchRelatedBlogs = async (currentBlog) => {
    try {
      const res = await axios.get(`${base}/api/blogs`);
      const allBlogs = res.data;
      
      if (!currentBlog.tags || !Array.isArray(currentBlog.tags) || currentBlog.tags.length === 0) {
        // If no tags, show recent blogs excluding current
        const recentBlogs = allBlogs
          .filter(b => b._id !== currentBlog._id)
          .sort((a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt))
          .slice(0, 6);
        setRelatedBlogs(recentBlogs);
        return;
      }

      // Calculate similarity score for each blog
      const relatedWithScores = allBlogs
        .filter(b => b._id !== currentBlog._id && b.tags && Array.isArray(b.tags))
        .map(blog => {
          const blogTags = blog.tags.map(tag => tag.toLowerCase());
          const currentTags = currentBlog.tags.map(tag => tag.toLowerCase());
          
          // Calculate exact matches
          const exactMatches = blogTags.filter(tag => currentTags.includes(tag));
          
          // Calculate partial matches (similar words)
          let partialMatches = 0;
          blogTags.forEach(blogTag => {
            currentTags.forEach(currentTag => {
              if (blogTag !== currentTag && 
                  (blogTag.includes(currentTag) || currentTag.includes(blogTag) ||
                   (blogTag.length > 3 && currentTag.length > 3 && 
                    (blogTag.substring(0, 3) === currentTag.substring(0, 3))))) {
                partialMatches += 0.5;
              }
            });
          });

          // Calculate final similarity score
          const exactScore = exactMatches.length * 2;
          const partialScore = partialMatches;
          const totalScore = exactScore + partialScore;
          
          // Add recency bonus (newer posts get slight boost)
          const daysDiff = Math.max(0, (new Date() - new Date(blog.createdAt || blog.updatedAt)) / (1000 * 60 * 60 * 24));
          const recencyBonus = Math.max(0, (30 - daysDiff) / 100); // Small bonus for posts less than 30 days old
          
          return {
            ...blog,
            matchingTags: exactMatches,
            partialMatches: Math.floor(partialMatches),
            similarityScore: totalScore + recencyBonus,
            exactMatchCount: exactMatches.length
          };
        })
        .filter(blog => blog.similarityScore > 0) // Only include blogs with some similarity
        .sort((a, b) => {
          // Sort by similarity score first, then by recency
          if (b.similarityScore !== a.similarityScore) {
            return b.similarityScore - a.similarityScore;
          }
          return new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt);
        })
        .slice(0, 6);

      // If no similar blogs found, show recent blogs
      if (relatedWithScores.length === 0) {
        const recentBlogs = allBlogs
          .filter(b => b._id !== currentBlog._id)
          .sort((a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt))
          .slice(0, 6)
          .map(blog => ({ ...blog, matchingTags: [], similarityScore: 0, exactMatchCount: 0 }));
        setRelatedBlogs(recentBlogs);
      } else {
        setRelatedBlogs(relatedWithScores);
      }
    } catch (error) {
      console.error('Error fetching related blogs:', error);
      setRelatedBlogs([]);
    }
  };

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${base}/api/blogs/${encodeURIComponent(idOrSlug)}`);
        const data = res.data;
        console.log('Fetched blog data:', data);
        setBlog(data);
        
        const imgs = data.images || (data.image ? [data.image] : []);
        if (imgs.length) setMainImage(imgs[0]);

        // Calculate reading time
        setReadingTime(calculateReadingTime(data.content || ''));

        // Fetch related blogs
        await fetchRelatedBlogs(data);

        if (data.author) {
          try {
            const candidates = [`${base}/api/user/user/${data.author}`, `${base}/api/user/${data.author}`];
            let u = null;
            for (const url of candidates) {
              try {
                const r = await axios.get(url);
                if (r.status === 200) { u = r.data; break; }
              } catch (e) {
                // continue
              }
            }
            if (u) setAuthor(u);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading amazing content...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Blog not found</h2>
          <Link to="/blogs" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-300">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Blog List
          </Link>
        </div>
      </div>
    );
  }

  const images = blog.images || (blog.image ? [blog.image] : []);
  const safeHtml = sanitizeHtml(blog.content || '');

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
          for (const src of insertMap[i]) {
            out.push(`<figure class="my-8 relative group"><img src="${src}" alt="" class="w-full rounded-2xl shadow-lg transition-transform duration-500 group-hover:scale-[1.02]" /><figcaption class="text-sm text-gray-500 mt-3 text-center italic">Image</figcaption></figure>`);
          }
        }
      }
      return out.join('');
    }

    let out = safeHtml;
    for (const src of extras) {
      const insertAt = Math.floor(Math.random() * (out.length + 1));
      const imgHtml = `<figure class="my-8 relative group"><img src="${src}" alt="" class="w-full rounded-2xl shadow-lg transition-transform duration-500 group-hover:scale-[1.02]" /><figcaption class="text-sm text-gray-500 mt-3 text-center italic">Image</figcaption></figure>`;
      out = out.slice(0, insertAt) + imgHtml + out.slice(insertAt);
    }
    return out;
  };

  const contentWithImages = buildContent();

  // Helper function to get similarity badge
  const getSimilarityBadge = (relatedBlog) => {
    if (relatedBlog.exactMatchCount > 0) {
      return {
        text: `${relatedBlog.exactMatchCount} shared topic${relatedBlog.exactMatchCount > 1 ? 's' : ''}`,
        className: 'bg-green-100 text-green-800',
        icon: '🎯'
      };
    } else if (relatedBlog.partialMatches > 0) {
      return {
        text: 'Similar topics',
        className: 'bg-blue-100 text-blue-800',
        icon: '🔗'
      };
    } else {
      return {
        text: 'Recent post',
        className: 'bg-gray-100 text-gray-600',
        icon: '📅'
      };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        {images.length > 0 && (
          <div className="absolute inset-0">
            <img 
              src={mainImage || images[0]} 
              alt={blog.title} 
              className="w-full h-full object-cover opacity-30"
            />
          </div>
        )}
        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                {new Date(blog.createdAt || blog.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                {readingTime} min read
              </span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-8 tracking-tight">
              {blog.title}
            </h1>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden ring-4 ring-white/30">
                <img 
                  src={author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(author?.username || 'Author')}&background=6366f1&color=fff`} 
                  alt="author" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="text-white">
                <div className="text-xl font-bold">{author?.username || author?.name || 'Unknown author'}</div>
                <div className="text-white/80">{(author && author.role) ? author.role : 'Automotive Expert'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Image Carousel */}
            {images && images.length > 0 && (
              <div className="mb-12">
                <div className="relative w-full h-96 lg:h-[500px] bg-gray-100 rounded-3xl overflow-hidden shadow-2xl">
                  <img 
                    src={mainImage || images[0]} 
                    alt={blog.title} 
                    className="w-full h-full object-cover transition-all duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                {images.length > 1 && (
                  <div className="mt-6 flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {images.map((src, i) => (
                      <button 
                        key={i} 
                        onClick={() => setMainImage(src)} 
                        className={`flex-none rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                          mainImage === src ? 'ring-4 ring-blue-500 scale-105' : ''
                        }`}
                      >
                        <img src={src} alt={`thumb-${i}`} className="w-32 h-20 lg:w-40 lg:h-24 object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Article Content */}
            <article className="prose prose-xl max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg">
              <div dangerouslySetInnerHTML={{ __html: contentWithImages }} />
            </article>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Topics</h3>
                <div className="flex flex-wrap gap-3">
                  {blog.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-8">
            {/* Author Card */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full overflow-hidden ring-4 ring-blue-100 shadow-lg mb-4">
                  <img 
                    src={author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(author?.username || 'Author')}&background=6366f1&color=fff`} 
                    alt="author" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {author?.username || author?.name || 'Unknown author'}
                </h3>
                <p className="text-blue-600 font-medium mb-4">
                  {(author && author.role) ? author.role : 'Automotive Expert'}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {author?.bio || 'Passionate dealer and automotive enthusiast sharing insights about the latest trends in the automotive world.'}
                </p>
              </div>
            </div>

            {/* Related Posts */}
            {relatedBlogs.length > 0 && (
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  Recommended for You
                </h3>
                <div className="space-y-6">
                  {relatedBlogs.map((relatedBlog) => {
                    const badge = getSimilarityBadge(relatedBlog);
                    return (
                      <Link
                        key={relatedBlog._id}
                        to={`/blogs/${relatedBlog.slug || relatedBlog._id}`}
                        className="block group hover:transform hover:scale-[1.02] transition-all duration-300"
                      >
                        <div className="flex gap-4">
                          <div className="w-20 h-16 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow duration-300 relative">
                            {relatedBlog.image || (relatedBlog.images && relatedBlog.images[0]) ? (
                              <img 
                                src={relatedBlog.image || relatedBlog.images[0]} 
                                alt={relatedBlog.title} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                            {relatedBlog.exactMatchCount > 0 && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2 leading-snug mb-2">
                              {relatedBlog.title}
                            </h4>
                            <p className="text-xs text-gray-500 mb-2">
                              {new Date(relatedBlog.createdAt || relatedBlog.updatedAt).toLocaleDateString()}
                            </p>
                            <div className="flex items-center gap-1">
                              <span className="text-xs">{badge.icon}</span>
                              <span className={`inline-block px-2 py-1 text-xs rounded-full ${badge.className}`}>
                                {badge.text}
                              </span>
                            </div>
                            {/* Show matching tags if available */}
                            {relatedBlog.matchingTags && relatedBlog.matchingTags.length > 0 && (
                              <div className="mt-2">
                                <div className="flex flex-wrap gap-1">
                                  {relatedBlog.matchingTags.slice(0, 2).map((tag) => (
                                    <span 
                                      key={tag} 
                                      className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                  {relatedBlog.matchingTags.length > 2 && (
                                    <span className="text-xs text-gray-500">
                                      +{relatedBlog.matchingTags.length - 2} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <Link
                  to="/blogs"
                  className="inline-flex items-center justify-center w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  View All Posts
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
