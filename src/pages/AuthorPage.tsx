<<<<<<< HEAD
import { Link, useParams } from "react-router-dom";
import { getAuthorBySlug } from "../data/authors";
import { BLOG_POSTS } from "../data/blogPosts";
=======
import { Link, useParams } from 'react-router-dom';
import { getAuthorBySlug } from '../data/authors';
import { BLOG_POSTS } from '../data/blogPosts';
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e

export default function AuthorPage() {
  const { slug } = useParams();
  const author = getAuthorBySlug(slug);
<<<<<<< HEAD
  if (!author)
    return (
      <div className="p-8 text-gray-900 dark:text-white">Author not found</div>
    );

  const posts = BLOG_POSTS.filter(
    (p) => p.author.toLowerCase() === author.name.toLowerCase(),
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white pt-16">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-6 mb-6">
          {author.image && (
            <img
              src={author.image}
              alt={author.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {author.name}
            </h1>
            <div className="text-gray-500 dark:text-gray-400">
              {author.role}
            </div>
          </div>
        </div>

        <p className="text-gray-900 dark:text-gray-300 mb-6">{author.bio}</p>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Articles by {author.name}
        </h2>
        <div className="space-y-4">
          {posts.map((p) => (
            <Link
              key={p.id}
              to={`/blog/${p.slug}`}
              className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white">
                {p.title}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {p.date} • {p.readTime}
              </div>
            </Link>
          ))}
          {posts.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No articles found for this author.
            </div>
          )}
=======
  if (!author) return <div className="p-8">Author not found</div>;

  const posts = BLOG_POSTS.filter(p => p.author.toLowerCase() === author.name.toLowerCase());

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pt-16">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-6 mb-6">
          {author.image && <img src={author.image} alt={author.name} className="w-24 h-24 rounded-full object-cover" />}
          <div>
            <h1 className="text-2xl font-bold">{author.name}</h1>
            <div className="text-slate-400">{author.role}</div>
          </div>
        </div>

        <p className="text-slate-300 mb-6">{author.bio}</p>

        <h2 className="text-xl font-semibold mb-4">Articles by {author.name}</h2>
        <div className="space-y-4">
          {posts.map(p => (
            <Link key={p.id} to={`/blog/${p.slug}`} className="block p-4 bg-slate-800/40 rounded-lg">
              <div className="font-medium text-white">{p.title}</div>
              <div className="text-sm text-slate-400">{p.date} • {p.readTime}</div>
            </Link>
          ))}
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
        </div>
      </div>
    </div>
  );
}
