import { AlertCircle, CheckCircle, Facebook, Linkedin, Mail, Twitter, Youtube, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { submitToGoogleSheets, validateEmail } from '../services/googleSheets';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setError('');
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      await submitToGoogleSheets({
        name: '',
        email: email.trim(),
        timestamp: new Date().toISOString(),
        source: 'footer_newsletter'
      });

      setIsSuccess(true);
      setEmail('');
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Newsletter subscription failed:', error);
      setError('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">DigitalToolsHub</span>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed max-w-md">
              Discover the best digital tools for AI, marketing automation, and making money online. 
              Expert reviews, comparisons, and exclusive deals to boost your productivity and income.
            </p>
            
            {/* Newsletter Signup */}
            <div className="space-y-3">
              <h4 className="font-semibold text-white">Stay Updated</h4>
              {isSuccess ? (
                <div className="flex items-center gap-2 text-green-400 font-medium bg-green-500/10 p-3 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  Thank you for subscribing!
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit}>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      placeholder="Enter your email"
                      className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all"
                      disabled={isSubmitting}
                    />
                    <button 
                      type="submit"
                      disabled={isSubmitting || !email.trim()}
                      className="bg-primary-600 hover:bg-primary-700 px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                      ) : (
                        'Subscribe'
                      )}
                    </button>
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 text-red-400 text-sm mt-2">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>

          {/* Tools */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Categories</h4>
            <ul className="space-y-2">
              <li><Link to="/tools?category=ai" className="card--hover text-gray-300 hover:text-white transition-colors">AI Tools</Link></li>
              <li><Link to="/tools?category=marketing" className="text-gray-300 hover:text-white transition-colors">Marketing Tools</Link></li>
              <li><Link to="/tools?category=mmo" className="text-gray-300 hover:text-white transition-colors">MMO Tools</Link></li>
              <li><Link to="/tools?category=saas" className="text-gray-300 hover:text-white transition-colors">SaaS Tools</Link></li>
              <li><Link to="/tools?category=design" className="text-gray-300 hover:text-white transition-colors">Design Tools</Link></li>
              <li><Link to="/tools?category=automation" className="text-gray-300 hover:text-white transition-colors">Automation Tools</Link></li>
              <li><Link to="/tools?tag=free" className="text-gray-300 hover:text-white transition-colors">Free Tools</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Resources</h4>
            <ul className="space-y-2">
              <li><Link to="/blog" className="text-gray-300 hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/blog/guides" className="text-gray-300 hover:text-white transition-colors">Guides</Link></li>
              <li><Link to="/blog/reviews" className="text-gray-300 hover:text-white transition-colors">Reviews</Link></li>
              <li><Link to="/blog/comparisons" className="text-gray-300 hover:text-white transition-colors">Comparisons</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4 md:mb-0">
              <p className="text-gray-300">
                © 2024 DigitalToolsHub. All rights reserved.
              </p>
              <div className="flex gap-6">
                <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Affiliate Disclosure
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Cookie Policy
                </a>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex gap-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Youtube size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;