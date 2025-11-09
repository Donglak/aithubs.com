import DOMPurify from 'dompurify';
import { ArrowLeft, Bookmark, Calendar, Clock, Share2, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAuthorByName } from '../data/authors';
import type { BlogPost } from '../data/blogPosts';

export default function BlogPostLayout({ post, relatedPosts }: { post: BlogPost; relatedPosts?: any[] }) {
  const safeHTML = DOMPurify.sanitize(post.content || '');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-start gap-8">
          <main className="flex-1">
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
              <Link to="/blog" className="hover:text-sky-300 flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </Link>
              <span>/</span>
              <span className="text-slate-200">Article</span>
            </div>

            <article className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/6 rounded-2xl overflow-hidden shadow-xl">
              {post.image && <img src={post.image} alt={post.title} className="w-full h-72 md:h-96 object-cover" />}

              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-600/15 text-indigo-300">
                      {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
                    </span>

                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1"><Calendar className="w-4 h-4" />{post.date}</div>
                      <div className="flex items-center gap-1"><Clock className="w-4 h-4" />{post.readTime}</div>
                      <div className="text-slate-400">{(post.views || 0).toLocaleString()} views</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-2 bg-white/5 rounded-lg hover:bg-white/8 transition"><Share2 className="w-5 h-5 text-slate-100" /></button>
                    <button className="p-2 bg-white/5 rounded-lg hover:bg-white/8 transition"><Bookmark className="w-5 h-5 text-slate-100" /></button>
                  </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">{post.title}</h1>

                <div className="flex items-center gap-4 mb-8">
                  {post.authorImage && <img src={post.authorImage} alt={post.author} className="w-14 h-14 rounded-full object-cover" />}
                  <div>
                    <div className="font-semibold text-white">{post.author}</div>
                    <div className="text-sm text-slate-400">Content Strategist</div>
                  </div>
                </div>

                <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-white prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-white" dangerouslySetInnerHTML={{ __html: safeHTML }} />

                <div className="mt-8 pt-6 border-t border-white/6">
                  <div className="flex flex-wrap gap-2">
                    {(post.tags || []).map((tag, index) => (
                      <span key={index} className="bg-white/6 text-slate-100 px-3 py-1 rounded-full text-sm flex items-center gap-1"><Tag className="w-3 h-3" />{tag}</span>
                    ))}
                  </div>
                </div>

                <div className="mt-8 p-6 bg-slate-800/50 rounded-lg flex items-start gap-4">
                  {post.authorImage && <img src={post.authorImage} alt={post.author} className="w-16 h-16 rounded-full object-cover" />}
                  <div>
                    <h3 className="font-semibold text-white mb-2">About {post.author}</h3>
                    <p className="text-slate-300">{post.authorBio}</p>
                    <div className="mt-4 flex items-center gap-3">
                      {/* Follow removed — using profile page instead */}
                      {
                        (() => {
                          const slug = getAuthorByName(post.author);
                          return (
                            <Link to={slug ? `/author/${slug}` : '#'} className="px-4 py-2 rounded-lg border border-white/6 text-white inline-block">View profile</Link>
                          );
                        })()
                      }
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Inline Newsletter CTA */}
            <div className="mt-10 rounded-2xl p-6 text-center bg-gradient-to-r from-sky-600 via-fuchsia-600 to-emerald-400 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-2">Enjoyed this article?</h2>
              <p className="text-white/90 mb-4">Subscribe to get more insights on digital tools and strategies delivered to your inbox.</p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input type="email" placeholder="Your email" className="flex-1 px-4 py-3 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white" />
                <button className="bg-white text-slate-900 hover:bg-slate-100 px-6 py-3 rounded-lg font-semibold transition">Subscribe</button>
              </div>
            </div>
          </main>

          <aside className="w-80 hidden lg:block">
            <div className="sticky top-28 space-y-6">
              <div className="bg-slate-800/40 border border-white/6 rounded-2xl p-4">
                <h4 className="text-sm font-semibold text-slate-200 mb-3">Related Articles</h4>
                <div className="flex flex-col gap-3">
                  {(relatedPosts || []).map(rp => (
                    <Link key={rp.id} to={`/blog/${rp.slug || rp.id}`} className="flex items-center gap-3 bg-slate-800/30 rounded-lg overflow-hidden hover:bg-slate-800/50 transition">
                      <img src={rp.image} alt={rp.title} className="w-20 h-14 object-cover" />
                      <div className="p-3">
                        <div className="text-sm font-medium text-white line-clamp-2">{rp.title}</div>
                        <div className="text-xs text-slate-400">{rp.date} • {rp.readTime}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-sky-600 to-fuchsia-600 rounded-2xl p-4 text-center shadow-lg">
                <h4 className="text-white font-semibold mb-2">Join our newsletter</h4>
                <p className="text-white/90 text-sm mb-4">Weekly insights on tools and strategies.</p>
                <input type="email" placeholder="Email" className="w-full px-3 py-2 rounded-lg mb-3 text-slate-900" />
                <button className="w-full px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold">Subscribe</button>
              </div>

              <div className="bg-slate-800/40 border border-white/6 rounded-2xl p-4">
                <h4 className="text-sm font-semibold text-slate-200 mb-3">Share</h4>
                <div className="flex gap-2">
                  <button className="p-2 bg-white/5 rounded-lg hover:bg-white/8"><Share2 className="w-4 h-4 text-slate-100" /></button>
                  <button className="p-2 bg-white/5 rounded-lg hover:bg-white/8"><Bookmark className="w-4 h-4 text-slate-100" /></button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
