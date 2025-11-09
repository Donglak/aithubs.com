import { ArrowRight, Calendar, Search, Tag, User } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BLOG_POSTS } from '../data/blogPosts';

const BlogPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'All Posts' },
    { value: 'guides', label: 'Guides' },
    { value: 'reviews', label: 'Reviews' },
    { value: 'comparisons', label: 'Comparisons' },
    { value: 'news', label: 'News' }
  ];

  const posts = BLOG_POSTS.map(p => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: (p.excerpt && p.excerpt.length > 0)
      ? p.excerpt
      : ((p.content || '').replace(/<[^>]*>/g, '').trim().slice(0, 150) + '...'),
    category: p.category,
    author: p.author,
    date: p.date,
    readTime: p.readTime,
    image: p.image,
    tags: p.tags || [],
    featured: p.featured || false
  }));

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const featuredPost = posts.find(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-sky-300/90 bg-sky-500/10 border border-sky-500/30 px-3 py-1 rounded-full">
            Digital Tools Blog
          </span>

          <h1 className="mt-4 text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            <span className="bg-gradient-to-r from-sky-400 via-fuchsia-400 to-emerald-400 bg-clip-text text-transparent">Expert insights</span> for building with modern tools
          </h1>
          <p className="mt-3 text-lg text-slate-300 max-w-3xl mx-auto">
            Reviews, guides, and practical tutorials to help you choose and use the best digital tools.
          </p>
        </div>

        {/* Search and Filters (glassy) */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-white/5 to-white/3 border border-white/6 rounded-2xl p-5 backdrop-blur-sm shadow-md">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-800 text-slate-100 border border-white/6 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 rounded-lg bg-slate-800 text-slate-100 border border-white/6 focus:ring-2 focus:ring-sky-500"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value} className="bg-slate-900 text-slate-100">
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Featured Post */}
        {featuredPost && selectedCategory === 'all' && !searchTerm && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Featured Article</h2>
            <Link
              to={`/blog/${featuredPost.slug}`}
              className="group overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/6 shadow-xl hover:scale-[1.01] transition-transform duration-300"
            >
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-600/15 text-indigo-300">
                      {categories.find(cat => cat.value === featuredPost.category)?.label}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-pink-600/15 text-pink-300">
                      Featured
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-sky-300 transition-colors">
                    {featuredPost.title}
                  </h3>
                  <p className="text-slate-300 mb-4 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {featuredPost.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {featuredPost.date}
                      </div>
                      <span>{featuredPost.readTime}</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-sky-300 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Regular Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularPosts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="group overflow-hidden rounded-2xl bg-slate-800/50 border border-white/6 hover:shadow-xl transition-all duration-300"
            >
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-600/15 text-indigo-300">
                    {categories.find(cat => cat.value === post.category)?.label}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-sky-300 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-slate-300 mb-4 leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="bg-white/6 text-slate-100 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3 text-slate-200" />
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-slate-400">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {post.date}
                    </div>
                  </div>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* No Results */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-500 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No articles found</h3>
            <p className="text-slate-400">Try adjusting your search criteria or browse all articles</p>
          </div>
        )}

        {/* Newsletter CTA */}
        <div className="mt-16 rounded-2xl p-8 text-center bg-gradient-to-r from-sky-500 via-fuchsia-500 to-emerald-400 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-4">Stay Updated with Latest Insights</h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">Get weekly updates on the latest digital tools, expert reviews, and actionable guides delivered to your inbox.</p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-slate-900 hover:bg-slate-100 px-6 py-3 rounded-lg font-semibold transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;