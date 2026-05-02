export type BlogPost = {
  id: number;
  slug: string;
  title: string;
  content: string; // HTML
  excerpt?: string;
  category: string;
  author: string;
  authorBio?: string;
  authorImage?: string;
  date: string;
  readTime: string;
  image?: string;
  tags?: string[];
  views?: number;
  shares?: number;
  featured?: boolean;
};

import { marked } from 'marked';
import affiliateRaw from '../content/posts/affiliate-marketing-10k.md?raw';
import chatgptRaw from '../content/posts/chatgpt-vs-claude.md?raw';
import automationRaw from '../content/posts/marketing-automation.md?raw';
import nocodeRaw from '../content/posts/no-code-rise.md?raw';
import shopifyRaw from '../content/posts/shopify-vs-woocommerce.md?raw';
import ultimateRaw from '../content/posts/ultimate-guide-ai-tools.md?raw';

// lightweight frontmatter stripper — avoids bundling gray-matter in the client
function stripFrontmatter(md: string) {
  return md.replace(/^---[\s\S]*?---\s*/m, '');
}

// simple highlight syntax: ==highlighted text== -> <mark>highlighted text</mark>
function applyHighlightSyntax(md: string) {
  return md.replace(/==([^=]+)==/g, (_m, p1) => `<mark>${p1}</mark>`);
}

const ultimateHTML = marked(applyHighlightSyntax(stripFrontmatter(ultimateRaw)));
const chatgptHTML = marked(applyHighlightSyntax(stripFrontmatter(chatgptRaw)));
const affiliateHTML = marked(applyHighlightSyntax(stripFrontmatter(affiliateRaw)));
const automationHTML = marked(applyHighlightSyntax(stripFrontmatter(automationRaw)));
const nocodeHTML = marked(applyHighlightSyntax(stripFrontmatter(nocodeRaw)));
const shopifyHTML = marked(applyHighlightSyntax(stripFrontmatter(shopifyRaw)));

// Try to extract an `excerpt` field from the YAML frontmatter if present.
function extractFrontmatterExcerpt(raw: string) {
  const fmMatch = raw.match(/^---([\s\S]*?)---/m);
  if (!fmMatch) return undefined;
  const fm = fmMatch[1];
  const excerptMatch = fm.match(/excerpt:\s*(?:"([^"]+)"|'([^']+)'|([^\n]+))/m);
  if (!excerptMatch) return undefined;
  return (excerptMatch[1] || excerptMatch[2] || excerptMatch[3] || '').trim();
}

const ultimateExcerpt = extractFrontmatterExcerpt(ultimateRaw);
const chatgptExcerpt = extractFrontmatterExcerpt(chatgptRaw);
const affiliateExcerpt = extractFrontmatterExcerpt(affiliateRaw);
const automationExcerpt = extractFrontmatterExcerpt(automationRaw);
const nocodeExcerpt = extractFrontmatterExcerpt(nocodeRaw);
const shopifyExcerpt = extractFrontmatterExcerpt(shopifyRaw);

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    slug: 'ultimate-guide-ai-tools',
    title: 'The Ultimate Guide to AI Tools for Content Creation in 2024',
  content: ultimateHTML,
  excerpt: ultimateExcerpt,
    category: 'guides',
    author: 'Sarah Johnson',
    authorBio:
      'Sarah is a content strategist and AI enthusiast with over 8 years of experience in digital marketing. She helps businesses leverage AI tools to scale their content operations.',
    authorImage:
      'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    date: '2024-01-15',
    readTime: '8 min read',
    image:
      'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop',
    tags: ['AI Tools', 'Content Creation', 'Productivity', 'Marketing'],
    views: 2847,
    shares: 156,
  },
  {
    id: 2,
    slug: 'chatgpt-vs-claude',
    title: 'ChatGPT vs Claude vs Gemini: Which AI Assistant is Best?',
  content: chatgptHTML,
  excerpt: chatgptExcerpt,
    category: 'comparisons',
    author: 'Mike Chen',
    date: '2024-01-12',
    readTime: '12 min read',
    image:
      'https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
    tags: ['AI Comparison', 'ChatGPT', 'Claude'],
    views: 1200,
    shares: 42,
  },
  {
    id: 3,
    slug: 'affiliate-marketing-10k',
    title: 'How to Build a $10K/Month Affiliate Marketing Business',
  content: affiliateHTML,
  excerpt: affiliateExcerpt,
    category: 'guides',
    author: 'Emily Rodriguez',
    date: '2024-01-10',
    readTime: '15 min read',
    image:
      'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop',
    tags: ['Affiliate Marketing', 'MMO', 'Business'],
    featured: false,
  },
  {
    id: 4,
    slug: 'marketing-automation',
    title: 'Top 10 Marketing Automation Tools for Small Businesses',
  content: automationHTML,
  excerpt: automationExcerpt,
    category: 'reviews',
    author: 'David Kim',
    date: '2024-01-08',
    readTime: '10 min read',
    image:
      'https://images.pexels.com/photos/1591062/pexels-photo-1591062.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop',
    tags: ['Marketing Tools', 'Automation', 'Small Business'],
    featured: false,
  },
  {
    id: 5,
    slug: 'no-code-rise',
    title: 'The Rise of No-Code Tools: Building Apps Without Programming',
  content: nocodeHTML,
  excerpt: nocodeExcerpt,
    category: 'news',
    author: 'Lisa Wang',
    date: '2024-01-05',
    readTime: '7 min read',
    image:
      'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop',
    tags: ['No-Code', 'App Development', 'Technology'],
    featured: false,
  },
  {
    id: 6,
    slug: 'shopify-vs-woocommerce',
    title: 'Shopify vs WooCommerce: Complete E-commerce Platform Comparison',
  content: shopifyHTML,
  excerpt: shopifyExcerpt,
    category: 'comparisons',
    author: 'Alex Thompson',
    date: '2024-01-03',
    readTime: '11 min read',
    image:
      'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop',
    tags: ['E-commerce', 'Shopify', 'WooCommerce'],
    featured: false,
  },
];

export function getPostBySlug(slug?: string) {
  if (!slug) return undefined;
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getAllSlugs() {
  return BLOG_POSTS.map((p) => p.slug);
}
