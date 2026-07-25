import DOMPurify from "dompurify";
import {
  ArrowLeft,
  Bookmark,
  Calendar,
  Clock,
  Share2,
  Tag,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getAuthorByName } from "../data/authors";
import type { BlogPost } from "../data/blogPosts";

export default function BlogPostLayout({
  post,
  relatedPosts,
}: {
  post: BlogPost;
  relatedPosts?: any[];
}) {
  const safeHTML = DOMPurify.sanitize(post.content || "");

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-start gap-8">
          <main className="flex-1">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <Link
                to="/blog"
                className="hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </Link>
              <span>/</span>
              <span className="text-gray-700 dark:text-gray-200">Article</span>
            </div>

            <article className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              {post.image && (
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-72 md:h-96 object-cover"
                />
              )}

              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                      {post.category.charAt(0).toUpperCase() +
                        post.category.slice(1)}
                    </span>

                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {post.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.readTime}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400">
                        {(post.views || 0).toLocaleString()} views
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-900 transition">
                      <Share2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                    <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-900 transition">
                      <Bookmark className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                  </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
                  {post.title}
                </h1>

                <div className="flex items-center gap-4 mb-8">
                  {post.authorImage && (
                    <img
                      src={post.authorImage}
                      alt={post.author}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {post.author}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Content Strategist
                    </div>
                  </div>
                </div>

                <div
                  className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-900 dark:prose-p:text-gray-300 prose-li:text-gray-900 dark:prose-li:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-white"
                  dangerouslySetInnerHTML={{ __html: safeHTML }}
                />

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap gap-2">
                    {(post.tags || []).map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg flex items-start gap-4">
                  {post.authorImage && (
                    <img
                      src={post.authorImage}
                      alt={post.author}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      About {post.author}
                    </h3>
                    <p className="text-gray-900 dark:text-gray-300">
                      {post.authorBio}
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      {(() => {
                        const slug = getAuthorByName(post.author);
                        return (
                          <Link
                            to={slug ? `/author/${slug}` : "#"}
                            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 inline-block transition-colors"
                          >
                            View profile
                          </Link>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Inline Newsletter CTA */}
            <div className="mt-10 rounded-2xl p-6 text-center bg-gradient-to-r from-primary-600 via-pink-600 to-green-600 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-2">
                Enjoyed this article?
              </h2>
              <p className="text-white/90 mb-4">
                Subscribe to get more insights on digital tools and strategies
                delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button className="bg-white text-gray-900 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition">
                  Subscribe
                </button>
              </div>
            </div>
          </main>

          <aside className="w-80 hidden lg:block">
            <div className="sticky top-28 space-y-6">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Related Articles
                </h4>
                <div className="flex flex-col gap-3">
                  {(relatedPosts || []).map((rp) => (
                    <Link
                      key={rp.id}
                      to={`/blog/${rp.slug || rp.id}`}
                      className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg overflow-hidden hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      <img
                        src={rp.image}
                        alt={rp.title}
                        className="w-20 h-14 object-cover"
                      />
                      <div className="p-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                          {rp.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {rp.date} • {rp.readTime}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary-600 to-pink-600 rounded-2xl p-4 text-center shadow-lg">
                <h4 className="text-white font-semibold mb-2">
                  Join our newsletter
                </h4>
                <p className="text-white/90 text-sm mb-4">
                  Weekly insights on tools and strategies.
                </p>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-3 py-2 rounded-lg mb-3 text-gray-900"
                />
                <button className="w-full px-4 py-2 rounded-lg bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-colors">
                  Subscribe
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Share
                </h4>
                <div className="flex gap-2">
                  <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-900">
                    <Share2 className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  </button>
                  <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-900">
                    <Bookmark className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
