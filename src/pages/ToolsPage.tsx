import React, { useState, useMemo } from 'react';
import { Search, Filter, Grid, List, Star, ExternalLink, Tag, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

const ToolsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPricing, setSelectedPricing] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const [viewMode, setViewMode] = useState('grid');

  const tools = [
    {
      id: 1,
      name: 'ChatGPT Plus',
      category: 'ai',
      description: 'Advanced AI assistant for writing, coding, analysis, and creative tasks',
      price: '$20/month',
      rating: 4.8,
      reviews: 15420,
      image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      tags: ['AI', 'Writing', 'Coding'],
      featured: true,
      freeTrial: true
    },
    {
      id: 2,
      name: 'HubSpot Marketing Hub',
      category: 'marketing',
      description: 'Complete marketing automation platform with CRM, email marketing, and analytics',
      price: 'Free - $3,200/month',
      rating: 4.6,
      reviews: 8930,
      image: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      tags: ['Marketing', 'CRM', 'Email'],
      featured: false,
      freeTrial: true
    },
    {
      id: 3,
      name: 'Shopify',
      category: 'mmo',
      description: 'Complete e-commerce platform to start, grow, and manage your online business',
      price: '$29 - $299/month',
      rating: 4.7,
      reviews: 12450,
      image: 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      tags: ['E-commerce', 'Online Store', 'Dropshipping'],
      featured: true,
      freeTrial: true
    },
    {
      id: 4,
      name: 'Midjourney',
      category: 'ai',
      description: 'AI-powered image generation tool for creating stunning artwork and designs',
      price: '$10 - $60/month',
      rating: 4.9,
      reviews: 9870,
      image: 'https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      tags: ['AI', 'Design', 'Art'],
      featured: false,
      freeTrial: false
    },
    {
      id: 5,
      name: 'Mailchimp',
      category: 'marketing',
      description: 'Email marketing platform with automation, analytics, and audience management',
      price: 'Free - $350/month',
      rating: 4.4,
      reviews: 18920,
      image: 'https://images.pexels.com/photos/1591062/pexels-photo-1591062.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      tags: ['Email Marketing', 'Automation', 'Analytics'],
      featured: false,
      freeTrial: true
    },
    {
      id: 6,
      name: 'ClickFunnels',
      category: 'mmo',
      description: 'Sales funnel builder to create high-converting landing pages and sales funnels',
      price: '$97 - $297/month',
      rating: 4.5,
      reviews: 7650,
      image: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      tags: ['Sales Funnels', 'Landing Pages', 'Conversion'],
      featured: true,
      freeTrial: true
    }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'ai', label: 'AI Tools' },
    { value: 'marketing', label: 'Marketing Tools' },
    { value: 'mmo', label: 'MMO Tools' }
  ];

  const pricingOptions = [
    { value: 'all', label: 'All Pricing' },
    { value: 'free', label: 'Free' },
    { value: 'paid', label: 'Paid' },
    { value: 'freemium', label: 'Freemium' }
  ];

  const filteredTools = useMemo(() => {
    let filtered = tools.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tool.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      
      const matchesPricing = selectedPricing === 'all' || 
                            (selectedPricing === 'free' && tool.price.includes('Free')) ||
                            (selectedPricing === 'paid' && !tool.price.includes('Free')) ||
                            (selectedPricing === 'freemium' && tool.price.includes('Free') && tool.price.includes('-'));
      
      return matchesSearch && matchesCategory && matchesPricing;
    });

    // Sort tools
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.reviews - a.reviews;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          const aPrice = parseFloat(a.price.replace(/[^0-9.]/g, '')) || 0;
          const bPrice = parseFloat(b.price.replace(/[^0-9.]/g, '')) || 0;
          return aPrice - bPrice;
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, selectedCategory, selectedPricing, sortBy]);

  return (
    <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Digital Tools Directory
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Discover and compare the best digital tools for your business
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search tools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            {/* Pricing Filter */}
            <select
              value={selectedPricing}
              onChange={(e) => setSelectedPricing(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {pricingOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="popularity">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Name A-Z</option>
              <option value="price">Price Low-High</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredTools.length} tools
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' 
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' 
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tools Grid/List */}
        <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden ${
                viewMode === 'list' ? 'flex' : ''
              }`}
            >
              {/* Image */}
              <div className={viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}>
                <img
                  src={tool.image}
                  alt={tool.name}
                  className={`w-full object-cover ${viewMode === 'list' ? 'h-full' : 'h-48'}`}
                />
              </div>

              {/* Content */}
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                      {tool.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                          {tool.rating}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({tool.reviews.toLocaleString()} reviews)
                      </span>
                    </div>
                  </div>
                  {tool.featured && (
                    <span className="bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-300 px-2 py-1 rounded-full text-xs font-medium">
                      Featured
                    </span>
                  )}
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                  {tool.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {tool.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Price and Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {tool.price}
                    </span>
                    {tool.freeTrial && (
                      <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full text-xs">
                        Free Trial
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/tools/${tool.id}`}
                      className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Details
                    </Link>
                    <a
                      href="#"
                      className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      Try Now
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredTools.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No tools found
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Try adjusting your search criteria or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolsPage;