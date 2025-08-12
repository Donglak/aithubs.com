import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Clock, Share2, Bookmark, Tag } from 'lucide-react';

const BlogPostPage = () => {
  const { slug } = useParams();

  // Mock data - in real app, fetch based on slug
  const post = {
    id: 1,
    title: 'The Ultimate Guide to AI Tools for Content Creation in 2024',
    content: `
      <p>Artificial Intelligence has revolutionized the way we create content. From writing and editing to design and video production, AI tools are becoming indispensable for content creators, marketers, and businesses of all sizes.</p>
      
      <h2>Why AI Tools Matter for Content Creation</h2>
      <p>In today's fast-paced digital landscape, the demand for high-quality content has never been higher. AI tools help bridge the gap between quality and quantity, enabling creators to produce more content without sacrificing standards.</p>
      
      <h3>Key Benefits of AI Content Tools:</h3>
      <ul>
        <li><strong>Speed:</strong> Generate content in minutes instead of hours</li>
        <li><strong>Consistency:</strong> Maintain brand voice across all content</li>
        <li><strong>Scalability:</strong> Produce content at scale without hiring more staff</li>
        <li><strong>Cost-effectiveness:</strong> Reduce content creation costs significantly</li>
      </ul>
      
      <h2>Top AI Writing Tools</h2>
      
      <h3>1. ChatGPT Plus</h3>
      <p>OpenAI's ChatGPT Plus remains the gold standard for AI writing assistance. With GPT-4's enhanced capabilities, it excels at:</p>
      <ul>
        <li>Long-form content creation</li>
        <li>Technical writing and documentation</li>
        <li>Creative writing and storytelling</li>
        <li>Code generation and debugging</li>
      </ul>
      
      <h3>2. Jasper AI</h3>
      <p>Specifically designed for marketing content, Jasper AI offers templates and workflows for various content types including blog posts, social media content, and email campaigns.</p>
      
      <h3>3. Copy.ai</h3>
      <p>Perfect for short-form content like headlines, product descriptions, and social media posts. Copy.ai's strength lies in its simplicity and speed.</p>
      
      <h2>AI Design Tools</h2>
      
      <h3>Midjourney</h3>
      <p>For visual content creation, Midjourney leads the pack in generating stunning, artistic images from text prompts. It's particularly useful for:</p>
      <ul>
        <li>Blog post featured images</li>
        <li>Social media graphics</li>
        <li>Concept art and illustrations</li>
        <li>Marketing materials</li>
      </ul>
      
      <h3>Canva AI</h3>
      <p>Canva's AI features make design accessible to everyone. With Magic Design and Background Remover, creating professional graphics has never been easier.</p>
      
      <h2>Video Content AI Tools</h2>
      
      <h3>Synthesia</h3>
      <p>Create professional videos with AI avatars without filming. Perfect for training videos, product demos, and educational content.</p>
      
      <h3>Runway ML</h3>
      <p>Advanced video editing with AI-powered features like background removal, object tracking, and style transfer.</p>
      
      <h2>Best Practices for Using AI Tools</h2>
      
      <h3>1. Start with Clear Prompts</h3>
      <p>The quality of your output depends heavily on the quality of your input. Be specific about what you want, including tone, style, and target audience.</p>
      
      <h3>2. Always Edit and Refine</h3>
      <p>AI-generated content should be treated as a first draft. Always review, edit, and add your personal touch to ensure quality and authenticity.</p>
      
      <h3>3. Maintain Your Brand Voice</h3>
      <p>Train AI tools to understand your brand voice by providing examples and clear guidelines. Consistency is key to building trust with your audience.</p>
      
      <h3>4. Combine Multiple Tools</h3>
      <p>Don't rely on a single AI tool. Combine different tools for different aspects of content creation to achieve the best results.</p>
      
      <h2>The Future of AI in Content Creation</h2>
      <p>As AI technology continues to evolve, we can expect even more sophisticated tools that understand context better, generate more accurate content, and integrate seamlessly into existing workflows.</p>
      
      <p>The key to success with AI tools is not to replace human creativity but to augment it. Use AI to handle repetitive tasks and generate ideas, while focusing your human expertise on strategy, creativity, and relationship building.</p>
      
      <h2>Conclusion</h2>
      <p>AI tools for content creation are no longer a luxury—they're a necessity for staying competitive in today's content-driven world. Start with one or two tools that align with your primary content needs, master them, and gradually expand your AI toolkit as you become more comfortable with the technology.</p>
      
      <p>Remember, the best AI tool is the one you'll actually use consistently. Choose tools that fit your workflow, budget, and content goals, and don't be afraid to experiment to find what works best for your unique situation.</p>
    `,
    category: 'guides',
    author: 'Sarah Johnson',
    authorBio: 'Sarah is a content strategist and AI enthusiast with over 8 years of experience in digital marketing. She helps businesses leverage AI tools to scale their content operations.',
    authorImage: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    date: '2024-01-15',
    readTime: '8 min read',
    image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop',
    tags: ['AI Tools', 'Content Creation', 'Productivity', 'Marketing'],
    views: 2847,
    shares: 156
  };

  const relatedPosts = [
    {
      id: 2,
      title: 'ChatGPT vs Claude vs Gemini: Which AI Assistant is Best?',
      image: 'https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      date: '2024-01-12',
      readTime: '12 min read'
    },
    {
      id: 3,
      title: 'How to Build a $10K/Month Affiliate Marketing Business',
      image: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      date: '2024-01-10',
      readTime: '15 min read'
    }
  ];

  return (
    <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
          <Link to="/blog" className="hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">Article</span>
        </div>

        {/* Article Header */}
        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-soft overflow-hidden">
          {/* Featured Image */}
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-64 md:h-96 object-cover"
          />

          {/* Article Content */}
          <div className="p-8">
            {/* Category and Meta */}
            <div className="flex items-center gap-4 mb-4">
              <span className="bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-sm font-medium">
                {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
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
                <span>{post.views.toLocaleString()} views</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Author Info */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <img
                  src={post.authorImage}
                  alt={post.author}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {post.author}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Content Strategist
                  </div>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <Bookmark className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Article Content */}
            <div 
              className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-white"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
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

            {/* Author Bio */}
            <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-start gap-4">
                <img
                  src={post.authorImage}
                  alt={post.author}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    About {post.author}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {post.authorBio}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Related Articles
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {relatedPosts.map((relatedPost) => (
              <Link
                key={relatedPost.id}
                to={`/blog/${relatedPost.id}`}
                className="group bg-white dark:bg-gray-800 rounded-lg shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden"
              >
                <img
                  src={relatedPost.image}
                  alt={relatedPost.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {relatedPost.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {relatedPost.date}
                    </div>
                    <span>{relatedPost.readTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Newsletter CTA */}
        <div className="mt-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Enjoyed this article?
          </h2>
          <p className="text-white/90 mb-6">
            Subscribe to get more insights on digital tools and strategies delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-primary-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostPage;