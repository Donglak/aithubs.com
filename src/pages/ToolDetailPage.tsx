import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, ExternalLink, Check, X, Play, Users, Award, DollarSign, Calendar } from 'lucide-react';

const ToolDetailPage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - in real app, fetch based on ID
  const tool = {
    id: 1,
    name: 'ChatGPT Plus',
    category: 'AI Tools',
    description: 'ChatGPT Plus is an advanced AI assistant that helps with writing, coding, analysis, and creative tasks. Built on GPT-4, it offers enhanced capabilities and faster response times.',
    longDescription: 'ChatGPT Plus represents the cutting edge of conversational AI technology. Built on OpenAI\'s most advanced GPT-4 model, it provides unparalleled assistance across a wide range of tasks including content creation, code development, data analysis, creative writing, and problem-solving. The Plus subscription offers priority access during peak times, faster response speeds, and access to the latest features and improvements.',
    price: '$20/month',
    rating: 4.8,
    reviews: 15420,
    image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    tags: ['AI', 'Writing', 'Coding', 'Analysis'],
    features: [
      'Access to GPT-4 model',
      'Faster response times',
      'Priority access during peak times',
      'Access to latest features',
      'Enhanced creativity and accuracy',
      'Code generation and debugging',
      'Data analysis capabilities',
      'Multiple language support'
    ],
    pros: [
      'Exceptional AI capabilities',
      'Fast and reliable responses',
      'Versatile for many use cases',
      'Regular updates and improvements',
      'Great for productivity'
    ],
    cons: [
      'Monthly subscription required',
      'Usage limits during peak times',
      'Requires internet connection',
      'May occasionally provide incorrect information'
    ],
    screenshots: [
      'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
      'https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
      'https://images.pexels.com/photos/8386422/pexels-photo-8386422.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop'
    ],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    affiliateUrl: 'https://openai.com/chatgpt',
    company: 'OpenAI',
    founded: '2015',
    users: '100M+',
    lastUpdated: '2024-01-15'
  };

  const reviews = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Content Creator',
      rating: 5,
      date: '2024-01-10',
      comment: 'ChatGPT Plus has revolutionized my content creation process. The quality of responses is exceptional and it saves me hours of work every day.',
      helpful: 24
    },
    {
      id: 2,
      name: 'Mike Chen',
      role: 'Software Developer',
      rating: 5,
      date: '2024-01-08',
      comment: 'As a developer, I find ChatGPT Plus invaluable for code review, debugging, and learning new technologies. Worth every penny.',
      helpful: 18
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      role: 'Marketing Manager',
      rating: 4,
      date: '2024-01-05',
      comment: 'Great tool for brainstorming and content ideas. Sometimes the responses need refinement, but overall very helpful.',
      helpful: 12
    }
  ];

  const relatedTools = [
    {
      id: 2,
      name: 'Claude Pro',
      category: 'AI Tools',
      price: '$20/month',
      rating: 4.7,
      image: 'https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop'
    },
    {
      id: 3,
      name: 'Jasper AI',
      category: 'AI Tools',
      price: '$39/month',
      rating: 4.6,
      image: 'https://images.pexels.com/photos/8386422/pexels-photo-8386422.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop'
    }
  ];

  return (
    <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
          <Link to="/tools" className="hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Back to Tools
          </Link>
          <span>/</span>
          <span>{tool.category}</span>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">{tool.name}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6 mb-6">
              <div className="flex items-start gap-4">
                <img
                  src={tool.image}
                  alt={tool.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {tool.name}
                  </h1>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(tool.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {tool.rating}
                      </span>
                      <span className="ml-1 text-gray-600 dark:text-gray-400">
                        ({tool.reviews.toLocaleString()} reviews)
                      </span>
                    </div>
                    <span className="bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-sm font-medium">
                      {tool.category}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {tool.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft mb-6">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'features', label: 'Features' },
                    { id: 'screenshots', label: 'Screenshots' },
                    { id: 'reviews', label: 'Reviews' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                        About {tool.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {tool.longDescription}
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <Check className="w-5 h-5 text-green-500" />
                          Pros
                        </h4>
                        <ul className="space-y-2">
                          {tool.pros.map((pro, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600 dark:text-gray-300">{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <X className="w-5 h-5 text-red-500" />
                          Cons
                        </h4>
                        <ul className="space-y-2">
                          {tool.cons.map((con, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600 dark:text-gray-300">{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'features' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Key Features
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {tool.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'screenshots' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Screenshots & Demo
                    </h3>
                    
                    {/* Video */}
                    <div className="mb-6">
                      <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <Play className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500 dark:text-gray-400">Demo Video</p>
                        </div>
                      </div>
                    </div>

                    {/* Screenshots */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {tool.screenshots.map((screenshot, index) => (
                        <img
                          key={index}
                          src={screenshot}
                          alt={`Screenshot ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      User Reviews
                    </h3>
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                              <span className="text-primary-600 dark:text-primary-400 font-semibold">
                                {review.name.charAt(0)}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {review.name}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 text-sm">
                                  {review.role}
                                </span>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.rating
                                          ? 'text-yellow-400 fill-current'
                                          : 'text-gray-300 dark:text-gray-600'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-gray-600 dark:text-gray-300 mb-2">
                                {review.comment}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <span>{review.date}</span>
                                <button className="hover:text-primary-600 dark:hover:text-primary-400">
                                  Helpful ({review.helpful})
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {tool.price}
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Premium subscription
                </p>
              </div>

              <a
                href={tool.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 mb-4"
              >
                Try {tool.name}
                <ExternalLink className="w-4 h-4" />
              </a>

              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                Free trial available
              </div>
            </div>

            {/* Tool Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Tool Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Company</div>
                    <div className="font-medium text-gray-900 dark:text-white">{tool.company}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Founded</div>
                    <div className="font-medium text-gray-900 dark:text-white">{tool.founded}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Users</div>
                    <div className="font-medium text-gray-900 dark:text-white">{tool.users}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Last Updated</div>
                    <div className="font-medium text-gray-900 dark:text-white">{tool.lastUpdated}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Related Tools
              </h3>
              <div className="space-y-4">
                {relatedTools.map((relatedTool) => (
                  <Link
                    key={relatedTool.id}
                    to={`/tools/${relatedTool.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <img
                      src={relatedTool.image}
                      alt={relatedTool.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {relatedTool.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {relatedTool.price}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 dark:text-gray-300 ml-1">
                        {relatedTool.rating}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolDetailPage;