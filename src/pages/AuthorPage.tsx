import { Link, useParams } from 'react-router-dom';
import { getAuthorBySlug } from '../data/authors';
import { BLOG_POSTS } from '../data/blogPosts';

export default function AuthorPage() {
  const { slug } = useParams();
  const author = getAuthorBySlug(slug);
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
        </div>
      </div>
    </div>
  );
}
