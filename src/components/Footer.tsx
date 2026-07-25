<<<<<<< HEAD
import {
  AlertCircle,
  CheckCircle,
  Facebook,
  Linkedin,
  Mail,
  Twitter,
  Youtube,
  Zap,
} from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  submitNewsletterToSheet,
  validateEmail,
} from "../services/googleSheets";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset states
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address");
=======
import { AlertCircle, CheckCircle, Facebook, Linkedin, Mail, Twitter, Youtube, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { submitNewsletterToSheet, validateEmail } from '../services/googleSheets';

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
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
      return;
    }

    if (!validateEmail(email.trim())) {
<<<<<<< HEAD
      setError("Please enter a valid email address");
=======
      setError('Please enter a valid email address');
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
      return;
    }

    setIsSubmitting(true);

    try {
      await submitNewsletterToSheet({
<<<<<<< HEAD
        name: "",
        email: email.trim(),
        timestamp: new Date().toISOString(),
        source: "footer_newsletter",
      });

      setIsSuccess(true);
      setEmail("");

=======
        name: '',
        email: email.trim(),
        timestamp: new Date().toISOString(),
        source: 'footer_newsletter',
        
        });

      setIsSuccess(true);
      setEmail('');
      
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
      // Reset success state after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
<<<<<<< HEAD
      console.error("Newsletter subscription failed:", error);
      setError("An error occurred. Please try again later.");
=======
      console.error('Newsletter subscription failed:', error);
      setError('An error occurred. Please try again later.');
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
<<<<<<< HEAD
    <footer className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-900 dark:text-white py-16">
=======
    <footer className="bg-gray-900 dark:bg-gray-950 text-white py-16">
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
<<<<<<< HEAD
                <Zap className="w-5 h-5 text-gray-900 dark:text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-900 dark:text-white">
                DigitalToolsHub
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed max-w-md">
              Discover the best digital tools for AI, marketing automation, and
              making money online. Expert reviews, comparisons, and exclusive
              deals to boost your productivity and income.
            </p>

            {/* Newsletter Signup */}
            <div className="space-y-3">
              <h4
                className="font-semibold text-gray-900 dark:text-gray-900 dark:text-white"
                id="newsletter-heading"
              >
                Stay Updated
              </h4>
              {isSuccess ? (
                <div
                  className="flex items-center gap-2 text-green-400 font-medium bg-green-500/10 p-3 rounded-lg"
                  role="status"
                  aria-live="polite"
                >
                  <CheckCircle className="w-5 h-5" aria-hidden="true" />
                  Thank you for subscribing!
                </div>
              ) : (
                <form
                  onSubmit={handleNewsletterSubmit}
                  aria-labelledby="newsletter-heading"
                >
                  <div className="flex flex-col sm:flex-row gap-2">
                    <label htmlFor="footer-email" className="sr-only">
                      Email address
                    </label>
                    <input
                      type="email"
                      id="footer-email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      placeholder="Enter your email"
                      className="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-gray-900 placeholder:text-gray-500 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                      disabled={isSubmitting}
                      aria-describedby={
                        error ? "footer-email-error" : undefined
                      }
                      aria-invalid={!!error}
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || !email.trim()}
                      className="h-11 rounded-xl bg-primary-600 px-5 font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-busy={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"
                            aria-hidden="true"
                          />
                          <span className="sr-only">Subscribing...</span>
                        </>
                      ) : (
                        "Subscribe"
=======
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
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
                      )}
                    </button>
                  </div>
                  {error && (
<<<<<<< HEAD
                    <div
                      id="footer-email-error"
                      className="flex items-center gap-2 text-red-400 text-sm mt-2"
                      role="alert"
                      aria-live="assertive"
                    >
                      <AlertCircle className="w-4 h-4" aria-hidden="true" />
=======
                    <div className="flex items-center gap-2 text-red-400 text-sm mt-2">
                      <AlertCircle className="w-4 h-4" />
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
                      {error}
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>

          {/* Tools */}
          <div>
<<<<<<< HEAD
            <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">
              Categories
            </h4>
            <nav aria-label="Tool categories">
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/tools?category=ai"
                    className="text-sm text-gray-600 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    AI Tools
                  </Link>
                </li>
                <li>
                  <Link
                    to="/tools?category=marketing"
                    className="text-sm text-gray-600 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    Marketing Tools
                  </Link>
                </li>
                <li>
                  <Link
                    to="/tools?category=mmo"
                    className="text-sm text-gray-600 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    MMO Tools
                  </Link>
                </li>
                <li>
                  <Link
                    to="/tools?function=Code+Assistant"
                    className="text-sm text-gray-600 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    Code Tools
                  </Link>
                </li>
                <li>
                  <Link
                    to="/tools?categories=Creative+%26+Design"
                    className="text-sm text-gray-600 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    Design Tools
                  </Link>
                </li>
                <li>
                  <Link
                    to="/tools?categories=Productivity+%26+Workflow"
                    className="text-sm text-gray-600 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    Automation Tools
                  </Link>
                </li>
                <li>
                  <Link
                    to="/tools?tag=free&pricing=free"
                    className="text-sm text-gray-600 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    Free Tools
                  </Link>
                </li>
              </ul>
            </nav>
=======
            <h4 className="font-semibold mb-4 text-white">Categories</h4>
            <ul className="space-y-2">
              <li><Link to="/tools?category=ai" className="card--hover text-gray-300 hover:text-white transition-colors">AI Tools</Link></li>
              <li><Link to="/tools?category=marketing" className="text-gray-300 hover:text-white transition-colors">Marketing Tools</Link></li>
              <li><Link to="/tools?category=mmo" className="text-gray-300 hover:text-white transition-colors">MMO Tools</Link></li>
              <li><Link to="tools?function=Code+Assistant" className="text-gray-300 hover:text-white transition-colors">Code Tools</Link></li>
              <li><Link to="tools?categories=Creative+%26+Design" className="text-gray-300 hover:text-white transition-colors">Design Tools</Link></li>
              <li><Link to="/tools?categories=Productivity+%26+Workflow" className="text-gray-300 hover:text-white transition-colors">Automation Tools</Link></li>
              <li><Link to="tools?tag=free&pricing=free" className="text-gray-300 hover:text-white transition-colors">Free Tools</Link></li>
            </ul>
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
          </div>

          {/* Resources */}
          <div>
<<<<<<< HEAD
            <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">
              Resources
            </h4>
            <nav aria-label="Resources">
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/blog"
                    className="text-sm text-gray-600 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blog/guides"
                    className="text-sm text-gray-600 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    Guides
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blog/reviews"
                    className="text-sm text-gray-600 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    Reviews
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blog/comparisons"
                    className="text-sm text-gray-600 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    Comparisons
                  </Link>
                </li>
              </ul>
            </nav>
=======
            <h4 className="font-semibold mb-4 text-white">Resources</h4>
            <ul className="space-y-2">
              <li><Link to="/blog" className="text-gray-300 hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/blog/guides" className="text-gray-300 hover:text-white transition-colors">Guides</Link></li>
              <li><Link to="/blog/reviews" className="text-gray-300 hover:text-white transition-colors">Reviews</Link></li>
              <li><Link to="/blog/comparisons" className="text-gray-300 hover:text-white transition-colors">Comparisons</Link></li>
            </ul>
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
          </div>

          {/* Company */}
          <div>
<<<<<<< HEAD
            <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">
              Company
            </h4>
            <nav aria-label="Company information">
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/about"
                    className="text-sm text-gray-600 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-sm text-gray-600 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </nav>
=======
            <h4 className="font-semibold mb-4 text-white">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
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
<<<<<<< HEAD
                <a
                  href="#"
                  className="text-sm text-gray-600 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  Affiliate Disclosure
                </a>
                <a
                  href="#"
                  className="text-sm text-gray-600 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
=======
                <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Affiliate Disclosure
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
                  Cookie Policy
                </a>
              </div>
            </div>

            {/* Social Icons */}
<<<<<<< HEAD
            <nav aria-label="Social media links" className="flex gap-4">
              <a
                href="#"
                className="text-gray-300 hover:text-gray-900 dark:text-white transition-colors"
                aria-label="Follow us on Twitter"
              >
                <Twitter size={20} aria-hidden="true" />
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-gray-900 dark:text-white transition-colors"
                aria-label="Follow us on LinkedIn"
              >
                <Linkedin size={20} aria-hidden="true" />
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-gray-900 dark:text-white transition-colors"
                aria-label="Follow us on Facebook"
              >
                <Facebook size={20} aria-hidden="true" />
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-gray-900 dark:text-white transition-colors"
                aria-label="Follow us on YouTube"
              >
                <Youtube size={20} aria-hidden="true" />
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-gray-900 dark:text-white transition-colors"
                aria-label="Contact us via email"
              >
                <Mail size={20} aria-hidden="true" />
              </a>
            </nav>
=======
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
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
          </div>
        </div>
      </div>
    </footer>
  );
};

<<<<<<< HEAD
export default Footer;
=======
export default Footer;
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
